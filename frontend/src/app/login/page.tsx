'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Globe } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { authService, onboardingService } from '@/services/api'
import { ApiError } from '@/lib/type'
import { useRouter } from 'next/navigation'

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isMounted, setIsMounted] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    subdomain: '',
    rememberMe: false
  })

  useEffect(() => {
    setIsMounted(true)

    // Remember me verilerini yükle
    const savedEmail = localStorage.getItem('remember_email')
    const savedSubdomain = localStorage.getItem('remember_subdomain')
    if (savedEmail) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail,
        subdomain: savedSubdomain || '',
        rememberMe: true
      }))
    }
  }, [])

  const getCurrentSubdomain = () => {
    if (typeof window === 'undefined') return null
    const hostname = window.location.hostname
    const mainDomain = (process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'ciftopia.local').split(':')[0]

    if (hostname.endsWith(`.${mainDomain}`)) {
      return hostname.replace(`.${mainDomain}`, '')
    }
    return null
  }

  const currentSubdomain = isMounted ? getCurrentSubdomain() : null
  const isRootDomain = isMounted ? (!currentSubdomain || currentSubdomain === 'www') : true

  useEffect(() => {
    if (errorParam === 'unauthorized_subdomain') {
      setError('Bu adrese erişim yetkiniz bulunmuyor. Lütfen doğru adreste olduğunuzdan emin olun.')
    }
  }, [errorParam, isMounted])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isRootDomain) {
      if (!formData.subdomain) {
        setError('Lütfen sitenizin adresini (subdomain) girin.')
        return
      }
      setIsLoading(true)
      try {
        const res = await onboardingService.checkSubdomain(formData.subdomain)
        
        // available: true -> Müsait (Site YOK)
        // available: false -> Dolu (Site VAR)
        if (res.data.data.available) {
          setError('Böyle bir site bulunamadı. Lütfen adresi kontrol edin veya yeni bir hesap oluşturun.')
          setIsLoading(false)
          return
        }

        const protocol = window.location.protocol
        const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'ciftopia.local:3000'
        window.location.href = `${protocol}//${formData.subdomain.toLowerCase()}.${mainDomain}/login`
      } catch (err) {
        console.error('Subdomain kontrol hatası:', err)
        setError('Site kontrol edilirken bir hata oluştu. Lütfen tekrar deneyin.')
        setIsLoading(false)
      }
      return
    }

    if (!formData.email || !formData.password) {
      setError('Lütfen email ve şifre alanlarını doldurun.')
      return
    }

    setIsLoading(true)
    try {
      const { email, password, rememberMe } = formData
      
      await authService.login({
        email,
        password,
        subdomain: currentSubdomain || undefined
      })

      // Remember me bilgilerini sakla veya temizle
      if (rememberMe) {
        localStorage.setItem('remember_email', email)
        localStorage.setItem('remember_subdomain', currentSubdomain || '')
      } else {
        localStorage.removeItem('remember_email')
        localStorage.removeItem('remember_subdomain')
      }

      const returnUrl = searchParams.get('returnUrl')
      if (returnUrl) {
        router.push(returnUrl)
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError((err as ApiError).response?.data?.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isMounted) return null

  return (
    <AuthLayout>
      <div className='mb-10'>
        <h1 className='text-4xl font-bold text-gray-900 dark:text-white mb-3'>
          {isRootDomain ? 'Sitenizi Bulun 🔍' : 'Tekrar Hoşgeldiniz 💕'}
        </h1>
        <p className='text-gray-600 dark:text-gray-400 font-medium'>
          {isRootDomain 
            ? 'Giriş yapmak için özel adresinizi yazın' 
            : 'Anılarınıza devam etmek için giriş yapın'}
        </p>
      </div>

      <form className='space-y-6' onSubmit={handleSubmit}>
        {!isRootDomain ? (
          <>
            <div className='space-y-2'>
              <label className='text-sm font-bold text-gray-700 dark:text-gray-300 ml-1'>E-posta Adresi</label>
              <div className='relative'>
                <Mail className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />
                <Input
                  name='email'
                  type='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder='ornek@email.com'
                  className='pl-12 py-7 bg-soft-gray dark:bg-slate-800 border-none rounded-2xl focus-visible:ring-rose-primary text-lg'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between ml-1'>
                <label className='text-sm font-bold text-gray-700 dark:text-gray-300'>Şifre</label>
                <Link href='#' className='text-sm text-rose-primary hover:text-coral-warm font-bold transition-colors'>
                  Şifremi unuttum
                </Link>
              </div>
              <div className='relative'>
                <Lock className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />
                <Input
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder='••••••••'
                  className='pl-12 pr-12 py-7 bg-soft-gray dark:bg-slate-800 border-none rounded-2xl focus-visible:ring-rose-primary text-lg'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors'
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className='flex items-center space-x-3 ml-1'>
              <Checkbox
                id='remember'
                checked={formData.rememberMe}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))}
                className='w-5 h-5 border-2 border-gray-300 data-[state=checked]:bg-rose-primary data-[state=checked]:border-rose-primary'
              />
              <label htmlFor='remember' className='text-sm text-gray-700 dark:text-gray-300 font-bold cursor-pointer'>
                Beni hatırla
              </label>
            </div>
          </>
        ) : (
          <div className='space-y-2'>
            <label className='text-sm font-bold text-gray-700 dark:text-gray-300 ml-1'>Özel Adres</label>
            <div className='relative'>
              <Globe className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />
              <Input
                name='subdomain'
                type='text'
                value={formData.subdomain}
                onChange={handleInputChange}
                placeholder='ozel-adresiniz'
                className='pl-12 py-7 bg-soft-gray dark:bg-slate-800 border-none rounded-2xl focus-visible:ring-rose-primary text-lg'
              />
              <div className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium select-none'>
                .{process.env.NEXT_PUBLIC_MAIN_DOMAIN?.split(':')[0] || 'ciftopia.com'}
              </div>
            </div>
          </div>
        )}

        {error && <p className='text-rose-500 text-sm font-bold ml-1'>{error}</p>}

        <Button
          type='submit'
          disabled={isLoading}
          className='w-full bg-gradient-to-r from-rose-primary to-coral-warm text-white py-8 rounded-2xl font-bold text-xl hover:shadow-xl transition-all transform hover:scale-[1.01] border-none group'
        >
          {isLoading ? (
            <Loader2 className='animate-spin' />
          ) : (
            <>
              {isRootDomain ? 'Siteme Git' : 'Giriş Yap'}{' '}
              <ArrowRight className='ml-3 group-hover:translate-x-1 transition-transform' />
            </>
          )}
        </Button>

        <div className='text-center pt-8 border-t border-gray-100 dark:border-slate-800'>
          <p className='text-gray-600 dark:text-gray-400 font-medium'>
            Hesabınız yok mu?
            <Link
              href='/register'
              className='text-rose-primary hover:text-coral-warm font-bold transition-colors ml-2 underline underline-offset-4'
            >
              Hemen oluşturun
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}

// Loading fallback for Suspense
function LoginFormFallback() {
  return (
    <AuthLayout>
      <div className='flex items-center justify-center min-h-[400px]'>
        <Loader2 className='w-8 h-8 animate-spin text-rose-primary' />
      </div>
    </AuthLayout>
  )
}

// Main page component with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  )
}
