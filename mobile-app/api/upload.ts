import * as FileSystem from 'expo-file-system/legacy';
import client from './client';
import { MAX_VIDEO_BYTES } from '../constants/upload';

export type VideoUploadResult = { video: { key: string; url: string; size: number } };

export const uploadApi = {
  uploadPhotos: async (files: any[], token?: string) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', {
        uri: file.uri,
        name: file.fileName || `photo_${Date.now()}.jpg`,
        type: file.mimeType || 'image/jpeg',
      } as any);
    });

    const response = await client.post('/upload/memories', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /** Video: presigned URL al, doğrudan S3'e tek PUT ile yükle. Kota backend'de rezerve edilir. */
  uploadVideo: async (
    file: { uri: string; fileName?: string; fileSize?: number; size?: number; mimeType?: string },
    token?: string,
    options?: { onProgress?: (percent: number) => void },
  ): Promise<VideoUploadResult> => {
    const filename = file.fileName || `video_${Date.now()}.mp4`;
    const contentType = file.mimeType || 'video/mp4';
    const size = Number(file.fileSize ?? file.size ?? 0);
    if (!Number.isFinite(size) || size <= 0) {
      throw new Error('Geçerli video boyutu gerekli.');
    }
    if (size > MAX_VIDEO_BYTES) {
      throw new Error(`Video boyutu en fazla ${MAX_VIDEO_BYTES / (1024 * 1024)}MB olabilir.`);
    }

    options?.onProgress?.(0);

    const { uploadUrl, key } = (
      await client.post<{ uploadUrl: string; key: string }>(
        '/upload/presigned-video',
        { filename, contentType, size },
        { headers: { Authorization: `Bearer ${token}` } },
      )
    ).data;

    const result = await FileSystem.uploadAsync(uploadUrl, file.uri, {
      httpMethod: 'PUT',
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers: { 'Content-Type': contentType },
    });

    if (result.status < 200 || result.status >= 300) {
      throw new Error(result.body || 'Video yükleme başarısız.');
    }

    options?.onProgress?.(100);
    return { video: { key, url: key, size } };
  },
};
