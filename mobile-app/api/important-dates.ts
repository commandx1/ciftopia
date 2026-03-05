import client from './client';

export interface ImportantDate {
  _id: string;
  title: string;
  date: string;
  type: 'dating' | 'relationship' | 'marriage' | 'birthday' | 'travel' | 'other';
  isRecurring: boolean;
  description?: string;
  authorId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: { url: string };
    gender?: string;
  };
  createdAt: string;
}

export const importantDatesApi = {
  getImportantDates: async (token?: string) => {
    const response = await client.get('/important-dates', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  create: async (data: any, token?: string) => {
    const response = await client.post('/important-dates', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  update: async (id: string, data: any, token?: string) => {
    const response = await client.put(`/important-dates/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  delete: async (id: string, token?: string) => {
    const response = await client.delete(`/important-dates/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
