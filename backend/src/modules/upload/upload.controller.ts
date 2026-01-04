import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  UseGuards,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
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
