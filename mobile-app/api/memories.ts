import client from './client';

export interface Memory {
  _id: string;
  title: string;
  content: string;
  date: string;
  mood: 'romantic' | 'fun' | 'emotional' | 'adventure' | 'special';
  photos: Array<{
    url: string;
    width: number;
    height: number;
    size: number;
  }>;
  location?: {
    name: string;
  };
  favorites: string[];
  authorId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: { url: string };
  };
}

export interface MemoriesResponse {
  memories: Memory[];
  storageUsed: number;
  storageLimit: number;
  stats: {
    total: number;
    thisMonth: number;
    favorites: number;
  };
  hasMore: boolean;
}

export const memoriesApi = {
  getMemories: async (params: {
    mood?: string;
    sortBy?: string;
    onlyFavorites?: boolean;
    limit?: number;
    skip?: number;
  }, token?: string) => {
    const response = await client.get<MemoriesResponse>('/memories', {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  create: async (data: any, token?: string) => {
    const response = await client.post('/memories', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  update: async (id: string, data: any, token?: string) => {
    const response = await client.patch(`/memories/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  delete: async (id: string, token?: string) => {
    const response = await client.delete(`/memories/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  toggleFavorite: async (id: string, token?: string) => {
    const response = await client.post(`/memories/${id}/toggle-favorite`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
