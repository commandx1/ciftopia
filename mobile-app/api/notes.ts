import client from './client';

export interface Note {
  _id: string;
  content: string;
  color: string;
  isRead: boolean;
  authorId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: { url: string };
    gender?: string;
  };
  createdAt: string;
}

export const notesApi = {
  getNotes: async (token?: string) => {
    const response = await client.get<Note[]>('/notes', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  create: async (data: { content: string; color: string }, token?: string) => {
    const response = await client.post<Note>('/notes', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  update: async (id: string, data: { content: string; color: string }, token?: string) => {
    const response = await client.patch<Note>(`/notes/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  delete: async (id: string, token?: string) => {
    const response = await client.delete(`/notes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  markAsRead: async (id: string, token?: string) => {
    const response = await client.patch<Note>(`/notes/${id}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
