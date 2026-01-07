type ApiError = {
  response: {
    data: {
      message: string
    }
  }
}

interface PhotoMetadata {
  key?: string;
  url: string;
  width?: number;
  height?: number;
  size?: number;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: PhotoMetadata | string;
  gender: string;
  coupleNames?: string; // Token veya /auth/me üzerinden gelen çift isimleri
  coupleId?: {
    subdomain?: string;
    storageUsed?: number;
    storageLimit?: number;
  }
}

interface Memory {
  _id: string;
  title: string;
  description: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  mood: string;
  location: {
    name: string;
    coordinates: [number, number];
  };
  content: string;
  date: Date;
  favorites: string[];
  authorId: string;
  coupleId: string;
  photos: PhotoMetadata[];
  rawPhotos?: PhotoMetadata[];
}

interface Poem {
  _id: string;
  title: string;
  content: string;
  dedicatedTo?: User;
  authorId: User;
  tags: string[];
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Note {
  _id: string;
  content: string;
  color: 'pink' | 'yellow' | 'blue' | 'green' | 'purple' | 'orange';
  position?: {
    x: number;
    y: number;
  };
  isRead: boolean;
  readAt?: string;
  authorId: User;
  createdAt: string;
}

interface Album {
  _id: string;
  coupleId: any; // Can be string or populated Couple object
  authorId: User;
  title: string;
  description?: string;
  coverPhoto?: PhotoMetadata;
  photoCount: number;
  date: string;
  createdAt: string;
}

interface GalleryPhoto {
  _id: string;
  coupleId: string;
  authorId: User;
  albumId?: string;
  photo: PhotoMetadata;
  caption?: string;
  createdAt: string;
}

export type { ApiError, User, Memory, PhotoMetadata, Poem, Note, Album, GalleryPhoto }
