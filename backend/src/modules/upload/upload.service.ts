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
  private urlCache: Map<string, { url: string; expiresAt: number }> = new Map();

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
    const sanitizedFileName = file.originalname.replace(/\s+/g, '_');
    const key = `${folder}/${randomUUID()}-${sanitizedFileName}`;
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

  /**
   * İstemcinin S3'e doğrudan yükleme yapması için presigned PUT URL üretir.
   * Video bytes backend'e gelmez; sunucu bellek kullanılmaz.
   */
  async getPresignedUploadUrl(
    folder: string,
    filename: string,
    contentType: string,
    contentLength: number,
  ): Promise<{ uploadUrl: string; key: string }> {
    const sanitized = filename
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${folder}/${randomUUID()}-${sanitized}`;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
      ContentLength: contentLength,
    });
    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600,
    });
    return { uploadUrl, key };
  }

  async getPresignedUrl(key: string): Promise<string> {
    if (!key) return '';
    try {
      // If it's already a full URL (legacy or external), return as is
      if (key.startsWith('http')) return key;

      // Check cache first
      const cached = this.urlCache.get(key);
      const now = Date.now();
      if (cached && cached.expiresAt > now) {
        return cached.url;
      }

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      // AWS max: 7 gün (604800 saniye). 30 gün desteklenmiyor.
      const PRESIGNED_EXPIRES_SEC = 604800; // 7 gün
      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: PRESIGNED_EXPIRES_SEC,
      });

      // Cache: URL süresinden 55 dk kısa (yenilemeden önce tazelenir)
      const cacheMs = PRESIGNED_EXPIRES_SEC * 1000 - 55 * 60 * 1000;
      this.urlCache.set(key, {
        url,
        expiresAt: now + cacheMs,
      });

      return url;
    } catch (err) {
      console.error(`Presigned URL error for key "${key}":`, err);
      // If it's a relative path and we failed to get a signed URL,
      // return it with a leading slash so next/image doesn't throw "failed to parse"
      // although it will still be a broken image, at least it won't crash the page
      return key.startsWith('/') ? key : `/${key}`;
    }
  }

  /**
   * Buffer'ı S3'e yükler (örn. Suno/Mureka'dan indirilen şarkı).
   * Key döndürür.
   */
  async uploadBuffer(
    key: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );
    return key;
  }

  async deleteFile(key: string): Promise<void> {
    try {
      if (key.startsWith('http')) return; // Don't try to delete external URLs

      // Remove from cache if exists
      this.urlCache.delete(key);

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

  async transformAvatar(user: any): Promise<void> {
    if (user?.avatar?.url && !user.avatar.url.startsWith('http')) {
      user.avatar.url = await this.getPresignedUrl(user.avatar.url);
    }
  }

  async transformAvatars(
    entities: any[],
    userPath: string = 'authorId',
  ): Promise<void> {
    if (!entities || !Array.isArray(entities)) return;

    await Promise.all(
      entities.map(async (entity) => {
        const user = userPath
          .split('.')
          .reduce((obj, key) => obj?.[key], entity);
        if (user) {
          await this.transformAvatar(user);
        }
      }),
    );
  }
}
