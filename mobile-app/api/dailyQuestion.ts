import client from './client';

export const dailyQuestionApi = {
  getTodaysQuestion: async (token?: string) => {
    try {
      const response = await client.get('/daily-question', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Soru yüklenirken bir hata oluştu.',
      };
    }
  },

  /** Beğenmedim: yeni soru üretir. Free planda reklam sonrası, premium’da doğrudan çağrılır. */
  requestNewQuestion: async (token?: string) => {
    try {
      const response = await client.post('/daily-question/refresh', {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Yeni soru istenirken bir hata oluştu.',
      };
    }
  },

  submitFeedback: async (
    data: { questionId: string; type: 'like' | 'dislike' },
    token?: string,
  ) => {
    try {
      const response = await client.post('/daily-question/feedback', data, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || 'Geri bildirim gönderilirken bir hata oluştu.',
      };
    }
  },

  answerQuestion: async (data: { questionId: string; answer: string }, token?: string) => {
    try {
      const response = await client.post('/daily-question/answer', data, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Cevap gönderilirken bir hata oluştu.',
      };
    }
  },

  getStats: async (token?: string) => {
    try {
      const response = await client.get('/daily-question/stats', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'İstatistikler yüklenirken bir hata oluştu.',
      };
    }
  },
};
