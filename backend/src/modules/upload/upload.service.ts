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
  ): Promise<string> {
    const key = `${folder}/${randomUUID()}-${file.originalname}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    // Return the key instead of the public URL for private access
    return key;
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
