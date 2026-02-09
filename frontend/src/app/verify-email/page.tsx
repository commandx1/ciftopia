'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { authService } from '@/services/api'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { ApiError } from '@/lib/type'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Doğrulama kodu bulunamadı.')
      return
    }

    const verify = async () => {
      try {
        await authService.verifyEmail(token)
        setStatus('success')
        setMessage('E-posta adresiniz başarıyla doğrulandı! Giriş yapabilirsiniz.')
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } catch (error) {
        setStatus('error')
        setMessage((error as ApiError).response?.data?.message || 'Doğrulama işlemi başarısız oldu.')
      }
    }

    verify()
  }, [token, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-rose-500 animate-spin mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Doğrulanıyor...</h1>
            <p className="text-gray-600">Lütfen bekleyin, e-posta adresiniz doğrulanıyor.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Başarılı!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <XCircle className="w-12 h-12 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Hata!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
          </div>
        )}
      </div>
    </div>
  )
}
