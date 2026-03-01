import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  UseGuards,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';

/** Video için boyut kısıtı yok; sadece kullanıcı kotası geçerli. 500MB sunucu tarafı limiti varsayılan kısıtları aşmak için. */
const VIDEO_UPLOAD_LIMIT = 500 * 1024 * 1024;
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Couple, CoupleDocument } from '../../schemas/couple.schema';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: {
    _id: string;
    coupleId?: string;
    [key: string]: any;
  };
}

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    @InjectModel(Couple.name) private coupleModel: Model<CoupleDocument>,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('memories')
  @UseInterceptors(FilesInterceptor('files', 5))
  async uploadMemories(
    @Req() req: AuthRequest,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Lütfen en az bir dosya seçin.');
    }

    const user = req.user;
    if (!user.coupleId) {
      throw new BadRequestException(
        'Dosya yüklemek için bir çifte bağlı olmalısınız.',
      );
    }

    const couple = await this.coupleModel.findById(user.coupleId);
    if (!couple) {
      throw new BadRequestException('Çift bulunamadı.');
    }

    const totalSize = files.reduce((acc, file) => acc + file.size, 0);

    if (couple.storageUsed + totalSize > couple.storageLimit) {
      throw new BadRequestException(
        'Yetersiz depolama alanı. Lütfen bazı dosyaları silin veya planınızı yükseltin.',
      );
    }

    const uploadPromises = files.map((file) =>
      this.uploadService.uploadFile(file, 'memories'),
    );
    const photos = await Promise.all(uploadPromises);

    // Update storage used
    const updatedCouple = await this.coupleModel.findByIdAndUpdate(
      user.coupleId,
      { $inc: { storageUsed: totalSize } },
      { new: true },
    );

    return { photos, storageUsed: updatedCouple?.storageUsed };
  }

  /** Video için presigned URL döner; istemci doğrudan S3'e yükler. Sunucuya video bytes gelmez. */
  @UseGuards(JwtAuthGuard)
  @Post('presigned-video')
  async getPresignedVideoUrl(
    @Req() req: AuthRequest,
    @Body('filename') filename: string,
    @Body('contentType') contentType: string,
    @Body('size') size: number,
  ) {
    if (!filename || typeof filename !== 'string') {
      throw new BadRequestException('filename gerekli.');
    }
    if (!contentType?.startsWith('video/')) {
      throw new BadRequestException('Yalnızca video dosyaları yüklenebilir.');
    }
    const fileSize = Number(size);
    if (!Number.isFinite(fileSize) || fileSize <= 0) {
      throw new BadRequestException('Geçerli size gerekli.');
    }

    const user = req.user;
    if (!user.coupleId) {
      throw new BadRequestException(
        'Dosya yüklemek için bir çifte bağlı olmalısınız.',
      );
    }

    const couple = await this.coupleModel.findById(user.coupleId);
    if (!couple) {
      throw new BadRequestException('Çift bulunamadı.');
    }

    if (couple.storageUsed + fileSize > couple.storageLimit) {
      throw new BadRequestException(
        'Yetersiz depolama alanı. Lütfen bazı dosyaları silin veya planınızı yükseltin.',
      );
    }

    const { uploadUrl, key } = await this.uploadService.getPresignedUploadUrl(
      'videos',
      filename,
      contentType,
      fileSize,
    );
    return { uploadUrl, key };
  }

  /** Büyük video için S3 multipart: initiate → client part'ları yükler → complete. Kota initiate'da kontrol edilir. */
  @UseGuards(JwtAuthGuard)
  @Post('initiate-multipart')
  async initiateMultipart(
    @Req() req: AuthRequest,
    @Body('fileName') fileName: string,
    @Body('contentType') contentType: string,
    @Body('fileSize') fileSize: number,
  ) {
    if (!fileName || typeof fileName !== 'string') {
      throw new BadRequestException('fileName gerekli.');
    }
    if (!contentType?.startsWith('video/')) {
      throw new BadRequestException('Yalnızca video dosyaları yüklenebilir.');
    }
    const size = Number(fileSize);
    if (!Number.isFinite(size) || size <= 0) {
      throw new BadRequestException('Geçerli fileSize gerekli.');
    }

    const PART_SIZE = 10 * 1024 * 1024; // 10MB
    const totalParts = Math.ceil(size / PART_SIZE);
    if (totalParts > 10000) {
      throw new BadRequestException(
        'Dosya çok büyük; part sayısı 10000\'i aşamaz.',
      );
    }

    const user = req.user;
    if (!user.coupleId) {
      throw new BadRequestException(
        'Dosya yüklemek için bir çifte bağlı olmalısınız.',
      );
    }

    const couple = await this.coupleModel.findById(user.coupleId);
    if (!couple) {
      throw new BadRequestException('Çift bulunamadı.');
    }
    if (couple.storageUsed + size > couple.storageLimit) {
      throw new BadRequestException(
        'Yetersiz depolama alanı. Lütfen bazı dosyaları silin veya planınızı yükseltin.',
      );
    }

    const { uploadId, key } =
      await this.uploadService.initiateMultipartUpload(
        'videos',
        fileName,
        contentType,
      );
    const presignedUrls =
      await this.uploadService.getPresignedUrlsForParts(
        key,
        uploadId,
        totalParts,
      );

    return {
      uploadId,
      key,
      presignedUrls,
      partSize: PART_SIZE,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('complete-multipart')
  async completeMultipart(
    @Req() req: AuthRequest,
    @Body('key') key: string,
    @Body('uploadId') uploadId: string,
    @Body('parts') parts: { PartNumber: number; ETag: string }[],
  ) {
    if (!key || !uploadId || !Array.isArray(parts) || parts.length === 0) {
      throw new BadRequestException('key, uploadId ve parts gerekli.');
    }
    const result = await this.uploadService.completeMultipartUpload(
      key,
      uploadId,
      parts,
    );
    return { success: true, key: result.key };
  }

  @UseGuards(JwtAuthGuard)
  @Post('abort-multipart')
  async abortMultipart(
    @Req() req: AuthRequest,
    @Body('key') key: string,
    @Body('uploadId') uploadId: string,
  ) {
    if (!key || !uploadId) {
      throw new BadRequestException('key ve uploadId gerekli.');
    }
    await this.uploadService.abortMultipartUpload(key, uploadId);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('video')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: VIDEO_UPLOAD_LIMIT } }),
  )
  async uploadVideo(
    @Req() req: AuthRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Lütfen bir video dosyası seçin.');
    }

    if (!file.mimetype.startsWith('video/')) {
      throw new BadRequestException('Yalnızca video dosyaları yüklenebilir.');
    }

    const user = req.user;
    if (!user.coupleId) {
      throw new BadRequestException(
        'Dosya yüklemek için bir çifte bağlı olmalısınız.',
      );
    }

    const couple = await this.coupleModel.findById(user.coupleId);
    if (!couple) {
      throw new BadRequestException('Çift bulunamadı.');
    }

    if (couple.storageUsed + file.size > couple.storageLimit) {
      throw new BadRequestException(
        'Yetersiz depolama alanı. Lütfen bazı dosyaları silin veya planınızı yükseltin.',
      );
    }

    try {
      const video = await this.uploadService.uploadFile(file, 'videos');

      const updatedCouple = await this.coupleModel.findByIdAndUpdate(
        user.coupleId,
        { $inc: { storageUsed: file.size } },
        { new: true },
      );

      return { video, storageUsed: updatedCouple?.storageUsed };
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Video yüklenirken bir hata oluştu. Lütfen tekrar deneyin.';
      throw new BadRequestException(message);
    }
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Req() req: AuthRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Lütfen bir dosya seçin.');
    }

    // Avatar upload can be done by guests (during registration)
    // or by logged in users (updating profile).
    // If logged in, we check storage.
    const user = req.user;
    let couple: CoupleDocument | null = null;

    if (user && user.coupleId) {
      couple = await this.coupleModel.findById(user.coupleId);
      if (couple) {
        if (couple.storageUsed + file.size > couple.storageLimit) {
          throw new BadRequestException(
            'Yetersiz depolama alanı. Lütfen planınızı yükseltin.',
          );
        }
      }
    }

    const metadata = await this.uploadService.uploadFile(file, 'avatars');

    let updatedStorageUsed: number | undefined;
    if (couple) {
      const updated = await this.coupleModel.findByIdAndUpdate(
        user.coupleId,
        { $inc: { storageUsed: file.size } },
        { new: true },
      );
      updatedStorageUsed = updated?.storageUsed;
    }

    return { metadata, storageUsed: updatedStorageUsed };
  }
}
