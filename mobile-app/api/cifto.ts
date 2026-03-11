import client from './client'

export interface CiftoMessage {
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface CiftoConversation {
  _id: string
  userId: string
  coupleId?: string
  messages: CiftoMessage[]
  lastMessageAt?: string
  createdAt: string
  updatedAt: string
}

export interface CiftoSendResponse {
  conversation: CiftoConversation
  streamId: string
}

export const ciftoApi = {
  getConversation: async (token?: string) => {
    try {
      const response = await client.get('/cifto', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      return { success: true, data: response.data as CiftoConversation }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Çifto sohbeti yüklenirken bir hata oluştu.',
      }
    }
  },

  sendMessage: async (content: string, token?: string) => {
    try {
      const response = await client.post(
        '/cifto/message',
        { content },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      )
      return { success: true, data: response.data as CiftoSendResponse }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Mesaj gönderilirken bir hata oluştu.',
      }
    }
  },
}
