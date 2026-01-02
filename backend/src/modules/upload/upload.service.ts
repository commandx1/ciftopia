import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import * as sharp from 'sharp';

export interface FileMetadata {
  key: string;
  width?: number;
  height?: number;
  size: number;
  mimetype: string;
}

@Injectable()
export class UploadService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
    this.bucketName = this.configService.get('AWS_S3_BUCKET') || '';
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<FileMetadata> {
    const key = `${folder}/${randomUUID()}-${file.originalname}`;
    let width: number | undefined;
    let height: number | undefined;

    // Get image dimensions if it's an image
    if (file.mimetype.startsWith('image/')) {
      try {
        const metadata = await sharp(file.buffer).metadata();
        width = metadata.width;
        height = metadata.height;
      } catch (err) {
        console.error('Resim metadata hatası:', err);
      }
    }

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return {
      key,
      width,
      height,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  async getPresignedUrl(key: string): Promise<string> {
    try {
      // If it's already a full URL (legacy or external), return as is
      if (key.startsWith('http')) return key;

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      // Link expires in 1 hour (3600 seconds)
      return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    } catch (err) {
      console.error('Presigned URL oluşturulurken hata:', err);
      return key; // Hata durumunda orijinal key'i dön (fallback)
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      if (key.startsWith('http')) return; // Don't try to delete external URLs

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
    } catch (err) {
      console.error('S3 dosya silme hatası:', err);
    }
  }
}
