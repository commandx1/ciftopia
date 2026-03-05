import client from './client';

export const dashboardApi = {
  getStats: async (token: string) => {
    const response = await client.get('/dashboard/stats', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  getSpaceStats: async (token: string) => {
    const response = await client.get('/dashboard/space', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
