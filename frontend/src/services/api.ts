import axios from 'axios'
import { PhotoMetadata } from '@/lib/type'

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
  me: () => api.get('/auth/me')
}

export const onboardingService = {
  checkSubdomain: (subdomain: string) => api.get(`/onboarding/check-subdomain?subdomain=${subdomain}`),
  createCouple: (data: CreateCoupleData) => api.post('/onboarding/create-couple', data),
  deleteSite: () => api.delete('/onboarding/site')
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
  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export default api
