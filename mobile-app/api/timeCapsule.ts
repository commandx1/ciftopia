import client from './client';

export interface TimeCapsule {
  _id: string;
  title: string;
  content: string;
  unlockDate: string;
  receiver: 'me' | 'partner' | 'both';
  photos: any[];
  video?: any;
  authorId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: { url: string };
    gender: string;
  };
  coupleId: string;
  isOpened: boolean;
  reflections: Array<{
    authorId: {
      _id: string;
      firstName: string;
      lastName: string;
      avatar?: { url: string };
      gender: string;
    };
    content: string;
    createdAt: string;
  }>;
  createdAt: string;
}

export const timeCapsuleApi = {
  getTimeCapsules: async (token?: string) => {
    const response = await client.get<TimeCapsule[]>('/time-capsule', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getCapsuleDetail: async (id: string, token?: string) => {
    const response = await client.get<TimeCapsule>(`/time-capsule/detail/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  createCapsule: async (data: Partial<TimeCapsule>, token?: string) => {
    const response = await client.post<TimeCapsule>('/time-capsule', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  updateCapsule: async (id: string, data: Partial<TimeCapsule>, token?: string) => {
    const response = await client.patch<TimeCapsule>(`/time-capsule/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  deleteCapsule: async (id: string, token?: string) => {
    const response = await client.delete(`/time-capsule/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  addReflection: async (id: string, content: string, token?: string) => {
    const response = await client.post<TimeCapsule>(`/time-capsule/${id}/reflection`, { content }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
