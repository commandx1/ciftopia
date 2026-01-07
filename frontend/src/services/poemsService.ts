import api from './api'
import { AuthorStats, Poem } from '@/lib/type'

export const poemsService = {
  getPoems: (subdomain: string, tag?: string, author?: string, page: number = 1, limit: number = 9) =>
    api.get<{ poems: Poem[]; totalCount: number; authorStats: AuthorStats[]; hasMore: boolean }>(
      `/poems/${subdomain}`,
      { params: { tag, author, page, limit } }
    ),

  getPublicPoems: (page: number = 1, limit: number = 9) =>
    api.get<{ poems: Poem[]; totalCount: number; hasMore: boolean }>('/poems/public/examples', {
      params: { page, limit }
    }),

  getTags: (subdomain: string) => api.get<string[]>(`/poems/${subdomain}/tags`),

  createPoem: (data: Partial<Poem>) => api.post<Poem>('/poems', data),

  updatePoem: (id: string, data: Partial<Poem>) => api.patch<Poem>(`/poems/${id}`, data),

  deletePoem: (id: string) => api.delete(`/poems/${id}`)
}
