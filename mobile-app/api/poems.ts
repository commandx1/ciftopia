import client from './client';

export const poemsApi = {
  getPoems: async (params: { tag?: string; author?: string; page?: number; limit?: number }, token?: string) => {
    try {
      const response = await client.get('/poems', {
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Şiirler yüklenirken bir hata oluştu.',
      };
    }
  },

  getTags: async (token?: string) => {
    try {
      const response = await client.get('/poems/tags', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Etiketler yüklenirken bir hata oluştu.',
      };
    }
  },

  createPoem: async (data: any, token?: string) => {
    try {
      const response = await client.post('/poems', data, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Şiir kaydedilirken bir hata oluştu.',
      };
    }
  },

  updatePoem: async (id: string, data: any, token?: string) => {
    try {
      const response = await client.patch(`/poems/${id}`, data, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Şiir güncellenirken bir hata oluştu.',
      };
    }
  },

  deletePoem: async (id: string, token?: string) => {
    try {
      const response = await client.delete(`/poems/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Şiir silinirken bir hata oluştu.',
      };
    }
  },
};
