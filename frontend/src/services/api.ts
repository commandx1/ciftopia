import axios from 'axios'
import { 
  PhotoMetadata, 
  BucketListItem, 
  ImportantDate, 
  User, 
  DailyQuestion, 
  QuestionAnswer, 
  RelationshipProfile, 
  TimeCapsule, 
  Activity,
  DashboardData
} from '@/lib/type'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true
})

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  gender?: string
  avatar?: PhotoMetadata
}

export interface LoginData {
  email: string
  password: string
  subdomain?: string
}

export interface CreateCoupleData {
  subdomain: string
  partnerFirstName: string
  partnerLastName: string
  partnerEmail: string
  partnerPassword: string
  partnerGender?: string
  partnerAvatar?: PhotoMetadata
  relationshipStartDate?: string
  relationshipStatus: 'dating' | 'engaged' | 'married' | string
  paymentTransactionId?: string
}

export interface PaymentData {
  cardHolderName: string
  cardNumber: string
  expireMonth: string
  expireYear: string
  cvc: string
  amount: number
  subdomain: string
}

export interface CreateMemoryData {
  title: string
  content: string
  date: string
  locationName?: string
  photos?: PhotoMetadata[]
  mood?: 'romantic' | 'fun' | 'emotional' | 'adventure' | string
  favorites?: string[]
}

export const authService = {
  register: (data: RegisterData) => api.post('/auth/register', data),
  login: (data: LoginData) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<User>('/auth/me'),
  saveRelationshipProfile: (data: Partial<RelationshipProfile>) => api.post<{ success: boolean; relationshipProfile: RelationshipProfile }>('/auth/relationship-profile', data)
}

export const onboardingService = {
  checkSubdomain: (subdomain: string) => api.get<{ data: { couple: string; available: boolean } }>(`/onboarding/check-subdomain?subdomain=${subdomain}`),
  getEarlyBirdStatus: () => api.get<{ success: boolean; data: { count: number; limit: number; available: boolean } }>('/onboarding/early-bird-status'),
  createCouple: (data: CreateCoupleData) => api.post('/onboarding/create-couple', data),
  deleteSite: () => api.delete('/onboarding/site')
}

export const dailyQuestionService = {
  getTodaysQuestion: () => api.get<{ question: DailyQuestion & { coupleId: { partner1: User; partner2: User } }; userAnswer: QuestionAnswer | null; partnerAnswered: boolean; partnerAnswer: string | null }>('/daily-question'),
  answerQuestion: (data: { questionId: string; answer: string }) => api.post<{ question: DailyQuestion & { coupleId: { partner1: User; partner2: User } }; userAnswer: QuestionAnswer | null; partnerAnswered: boolean; partnerAnswer: string | null }>('/daily-question/answer', data),
  getStats: () => api.get('/daily-question/stats'),
  downloadPdf: () => api.get<Blob>('/daily-question/download-pdf', { responseType: 'blob' })
}

export const paymentService = {
  processPayment: (data: PaymentData) => api.post('/payment/process', data)
}

export const memoriesService = {
  getMemories: (subdomain: string, params?: { mood?: string; sortBy?: string; limit?: number; skip?: number; onlyFavorites?: boolean }) =>
    api.get(`/memories/${subdomain}`, { params }),
  createMemory: (data: CreateMemoryData) => api.post('/memories', data),
  updateMemory: (id: string, data: Partial<CreateMemoryData>) => api.patch(`/memories/${id}`, data),
  toggleFavorite: (id: string) => api.post(`/memories/${id}/toggle-favorite`),
  exportPdf: (subdomain: string) => api.get(`/memories/${subdomain}/export-pdf`, { responseType: 'blob' }),
  deleteMemory: (id: string) => api.delete(`/memories/${id}`)
}

export const uploadService = {
  uploadMemories: (files: File[]) => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    return api.post('/upload/memories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  uploadVideo: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export const bucketListService = {
  getBucketList: (subdomain: string) => api.get<BucketListItem[]>(`/bucket-list/${subdomain}`),
  createItem: (data: Partial<BucketListItem>) => api.post<BucketListItem>('/bucket-list', data),
  updateItem: (id: string, data: Partial<BucketListItem>) => api.patch<BucketListItem>(`/bucket-list/${id}`, data),
  deleteItem: (id: string) => api.delete(`/bucket-list/${id}`)
}

export const importantDatesService = {
  getImportantDates: (subdomain: string) => api.get<ImportantDate[]>(`/important-dates/${subdomain}`),
  createImportantDate: (subdomain: string, data: Partial<ImportantDate>) =>
    api.post<{ date: ImportantDate; storageUsed: number }>(`/important-dates/${subdomain}`, data),
  updateImportantDate: (id: string, data: Partial<ImportantDate>) =>
    api.put<{ date: ImportantDate; storageUsed: number }>(`/important-dates/${id}`, data),
  deleteImportantDate: (id: string) => api.delete<{ storageUsed: number }>(`/important-dates/${id}`)
}

export const timeCapsuleService = {
  getTimeCapsules: (subdomain: string) => api.get<TimeCapsule[]>(`/time-capsule/${subdomain}`),
  getCapsuleDetail: (id: string) => api.get<TimeCapsule>(`/time-capsule/detail/${id}`),
  addReflection: (id: string, data: { content: string }) => api.post<TimeCapsule>(`/time-capsule/${id}/reflection`, data),
  createCapsule: (data: Partial<TimeCapsule>) => api.post<TimeCapsule>('/time-capsule', data),
  updateCapsule: (id: string, data: Partial<TimeCapsule>) => api.patch<TimeCapsule>(`/time-capsule/${id}`, data),
  deleteCapsule: (id: string) => api.delete<{ success: boolean }>(`/time-capsule/${id}`)
}

export const activityService = {
  getActivities: (params?: { page?: number; limit?: number; module?: string }) => api.get<{ activities: Activity[]; total: number; hasMore: boolean }>('/activity', { params })
}

export const dashboardService = {
  getStats: () => api.get<DashboardData>('/dashboard/stats')
}

export default api
