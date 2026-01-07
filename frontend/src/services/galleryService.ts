import api from './api';
import { Album, GalleryPhoto, PhotoMetadata } from '@/lib/type';

export const galleryService = {
  getAlbums: (subdomain: string) =>
    api.get<Album[]>(`/gallery/${subdomain}/albums`),
  
  getAlbum: (id: string) =>
    api.get<Album>(`/gallery/albums/${id}`),
  
  getAlbumPhotos: (id: string) =>
    api.get<GalleryPhoto[]>(`/gallery/albums/${id}/photos`),
  
  getAllPhotos: (subdomain: string) =>
    api.get<GalleryPhoto[]>(`/gallery/${subdomain}/photos`),
  
  createAlbum: (data: Partial<Album>) =>
    api.post<Album>('/gallery/albums', data),
  
  updateAlbum: (id: string, data: Partial<Album>) =>
    api.patch<Album>(`/gallery/albums/${id}`, data),
  
  deleteAlbum: (id: string) =>
    api.delete<{ success: boolean; storageUsed: number }>(`/gallery/albums/${id}`),
  
  uploadPhotos: (data: { albumId?: string; photos: PhotoMetadata[]; caption?: string }) =>
    api.post<{ photos: GalleryPhoto[]; storageUsed: number; storageLimit: number }>('/gallery/photos', data),
  
  deletePhoto: (id: string) =>
    api.delete<{ success: boolean; storageUsed: number }>(`/gallery/photos/${id}`),
};

