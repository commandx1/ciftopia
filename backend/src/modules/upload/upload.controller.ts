import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(JwtAuthGuard)
  @Post('memories')
  @UseInterceptors(FilesInterceptor('files', 5))
  async uploadMemories(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Lütfen en az bir dosya seçin.');
    }

    const uploadPromises = files.map((file) =>
      this.uploadService.uploadFile(file, 'memories'),
    );
    const urls = await Promise.all(uploadPromises);

    return { urls };
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Lütfen bir dosya seçin.');
    }

    const key = await this.uploadService.uploadFile(file, 'avatars');
    return { key };
  }
}
