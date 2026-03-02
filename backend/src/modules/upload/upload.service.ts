import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
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

  /** S3 multipart upload: büyük videolar için. Part'lar client'tan doğrudan S3'e gider. */
  async initiateMultipartUpload(
    folder: string,
    filename: string,
    contentType: string,
  ): Promise<{ uploadId: string; key: string }> {
    const sanitized = filename
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${folder}/${randomUUID()}-${sanitized}`;
    const command = new CreateMultipartUploadCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });
    const { UploadId } = await this.s3Client.send(command);
    if (!UploadId) throw new Error('CreateMultipartUpload UploadId yok.');
    return { uploadId: UploadId, key };
  }

  /** Her part için presigned PUT URL. getSignedUrl yerel crypto (S3'e gitmez); batch ile paralel ama concurrency sınırlı. */
  private static PRESIGN_BATCH_SIZE = 100;

  async getPresignedUrlsForParts(
    key: string,
    uploadId: string,
    totalParts: number,
  ): Promise<{ partNumber: number; url: string }[]> {
    const results: { partNumber: number; url: string }[] = [];
    for (
      let offset = 0;
      offset < totalParts;
      offset += UploadService.PRESIGN_BATCH_SIZE
    ) {
      const batchSize = Math.min(
        UploadService.PRESIGN_BATCH_SIZE,
        totalParts - offset,
      );
      const batch = await Promise.all(
        Array.from({ length: batchSize }, async (_, i) => {
          const partNumber = offset + i + 1;
          const command = new UploadPartCommand({
            Bucket: this.bucketName,
            Key: key,
            UploadId: uploadId,
            PartNumber: partNumber,
          });
          const url = await getSignedUrl(this.s3Client, command, {
            expiresIn: 3600,
          });
          return { partNumber, url };
        }),
      );
      results.push(...batch);
    }
    return results;
  }

  async completeMultipartUpload(
    key: string,
    uploadId: string,
    parts: { PartNumber: number; ETag: string }[],
  ): Promise<{ key: string }> {
    const command = new CompleteMultipartUploadCommand({
      Bucket: this.bucketName,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: [...parts].sort((a, b) => a.PartNumber - b.PartNumber),
      },
    });
    await this.s3Client.send(command);
    return { key };
  }

  async abortMultipartUpload(key: string, uploadId: string): Promise<void> {
    const command = new AbortMultipartUploadCommand({
      Bucket: this.bucketName,
      Key: key,
      UploadId: uploadId,
    });
    await this.s3Client.send(command);
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

      // Link expires in 1 hour (3600 seconds)
      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600,
      });

      // Cache for 55 minutes (55 * 60 * 1000 ms)
      this.urlCache.set(key, {
        url,
        expiresAt: now + 55 * 60 * 1000,
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
