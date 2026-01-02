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
    subdomain?: string
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

export type { ApiError, User, Memory, PhotoMetadata }
