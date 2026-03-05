import client from './client';

export interface Album {
  _id: string;
  title: string;
  description?: string;
  date: string;
  photoCount: number;
  coverPhoto?: {
    url: string;
    width: number;
    height: number;
  };
  authorId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  coupleId: {
    _id: string;
    partner1: any;
    partner2: any;
  };
  createdAt: string;
}

export interface GalleryPhoto {
  _id: string;
  photo: {
    url: string;
    width: number;
    height: number;
    size: number;
  };
  caption?: string;
  albumId?: string;
  authorId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export const galleryApi = {
  getAlbums: async (token?: string) => {
    const response = await client.get<{ albums: Album[]; storageUsed: number; storageLimit: number }>('/gallery/albums', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getAllPhotos: async (token?: string) => {
    const response = await client.get<{ photos: GalleryPhoto[]; storageUsed: number; storageLimit: number }>('/gallery/photos', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getAlbum: async (id: string, token?: string) => {
    const response = await client.get<Album>(`/gallery/albums/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getAlbumPhotos: async (id: string, token?: string) => {
    const response = await client.get<GalleryPhoto[]>(`/gallery/albums/${id}/photos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  createAlbum: async (data: any, token?: string) => {
    const response = await client.post<Album>('/gallery/albums', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  uploadPhotos: async (data: any, token?: string) => {
    const response = await client.post('/gallery/photos', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  deleteAlbum: async (id: string, token?: string) => {
    const response = await client.delete(`/gallery/albums/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  deletePhoto: async (id: string, token?: string) => {
    const response = await client.delete(`/gallery/photos/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
