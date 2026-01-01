type ApiError = {
  response: {
    data: {
      message: string
    }
  }
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
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
  isPrivate: boolean;
  isFavorite: boolean;
  authorId: string;
  coupleId: string;
  photos: string[];
}

export type { ApiError, User, Memory }
