import client from './client';

export interface BucketListItem {
  _id: string;
  title: string;
  description?: string;
  category: string;
  isCompleted: boolean;
  targetDate?: string;
  authorId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: { url: string };
    gender: string;
  };
  completedBy: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: { url: string };
    gender: string;
  }>;
  createdAt: string;
  completedAt?: string;
}

export const bucketListApi = {
  getBucketList: async (token?: string) => {
    const response = await client.get('/bucket-list', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },

  create: async (data: any, token?: string) => {
    const response = await client.post('/bucket-list', data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },

  update: async (id: string, data: any, token?: string) => {
    const response = await client.patch(`/bucket-list/${id}`, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },

  delete: async (id: string, token?: string) => {
    const response = await client.delete(`/bucket-list/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
};
