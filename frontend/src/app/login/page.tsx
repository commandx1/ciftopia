'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Globe, ShieldCheck, AlertCircle, Heart } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { authService, onboardingService } from '@/services/api'
import { ApiError } from '@/lib/type'
import { useRouter } from 'next/navigation'
import CoupleNames from '@/components/couple/CoupleNames'
import { useUserStore } from '@/store/userStore'

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const { coupleNames, setCoupleNames } = useUserStore()

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
  const isRootDomain = isMounted ? !currentSubdomain || currentSubdomain === 'www' : true

  useEffect(() => {
    if (isMounted && !isRootDomain && currentSubdomain) {
      // Subdomain'deysek çift bilgilerini çekerek isimleri ayarla
      setIsChecking(true)
      onboardingService
        .checkSubdomain(currentSubdomain)
        .then(res => {
          if (res.data.data.couple) {
            setCoupleNames(res.data.data.couple)
          }
        })
        .finally(() => {
          setIsChecking(false)
        })
    }
  }, [isMounted, isRootDomain, currentSubdomain, setCoupleNames])

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
    <div className='min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center px-4 py-12 relative overflow-hidden'>
      {/* Decorative Blobs */}
      <div className='absolute top-20 left-20 w-64 h-64 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float'></div>
      <div
        className='absolute bottom-20 right-20 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float'
        style={{ animationDelay: '2s' }}
      ></div>
      <div
        className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float'
        style={{ animationDelay: '4s' }}
      ></div>

      <div className='relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md p-10 border border-white/50 z-10'>
        <div className='text-center mb-8'>
          <div className='flex items-center justify-center mb-6'>
            <div className='relative'>
              <div className='w-20 h-20 bg-gradient-to-br from-rose-primary to-coral-warm rounded-full flex items-center justify-center shadow-lg animate-heartbeat'>
                <Heart className='text-white w-10 h-10 fill-current' />
              </div>
              <div className='absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-md'>
                <Lock size={14} className='text-white' />
              </div>
            </div>
          </div>

          {!isRootDomain && isChecking ? (
            <p className='text-gray-600 font-medium mb-3'>Çiftinizin isimleri yükleniyor...</p>
          ) : (
            <h1 className='text-4xl font-bold text-gray-900 mb-3 capitalize font-playfair-display'>
              {isRootDomain ? 'Çiftopia' : <CoupleNames coupleNames={coupleNames} />}
            </h1>
          )}

          {!isRootDomain && !isChecking && (
            <div className='inline-flex items-center space-x-2 bg-rose-50 px-4 py-2 rounded-full border border-rose-100 mb-4'>
              <Lock size={14} className='text-rose-500' />
              <span className='text-rose-600 font-semibold text-sm'>Bu site özel 🔒</span>
            </div>
          )}

          <p className='text-gray-600 font-medium'>
            {isRootDomain ? 'Giriş yapmak için özel adresinizi yazın' : 'Giriş yaparak devam edin'}
          </p>
        </div>

        <form className='space-y-5' onSubmit={handleSubmit}>
          {isRootDomain ? (
            <div className='space-y-2'>
              <label className='block text-sm font-semibold text-gray-700 mb-2 ml-1'>Özel Adres</label>
              <div className='relative'>
                <Globe className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />
                <Input
                  name='subdomain'
                  type='text'
                  value={formData.subdomain}
                  onChange={handleInputChange}
                  placeholder='ozel-adresiniz'
                  className='pl-12 py-7 bg-white border-2 border-gray-100 rounded-xl focus:border-rose-primary focus:ring-4 focus:ring-rose-100 transition-all outline-none text-lg'
                />
                <div className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium select-none'>
                  .{process.env.NEXT_PUBLIC_MAIN_DOMAIN?.split(':')[0] || 'ciftopia.com'}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className='space-y-2'>
                <label htmlFor='email' className='block text-sm font-semibold text-gray-700 mb-2 ml-1'>
                  E-posta
                </label>
                <div className='relative'>
                  <Mail className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />
                  <Input
                    id='email'
                    name='email'
                    type='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder='ornek@email.com'
                    className='w-full pl-12 pr-4 py-7 border-2 border-gray-100 rounded-xl focus:border-rose-primary focus:ring-4 focus:ring-rose-100 transition-all outline-none text-gray-900 font-medium text-lg'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <label htmlFor='password' className='block text-sm font-semibold text-gray-700 mb-2 ml-1'>
                  Şifre
                </label>
                <div className='relative'>
                  <Lock className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />
                  <Input
                    id='password'
                    name='password'
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder='••••••••'
                    className='w-full pl-12 pr-12 py-7 border-2 border-gray-100 rounded-xl focus:border-rose-primary focus:ring-4 focus:ring-rose-100 transition-all outline-none text-gray-900 font-medium text-lg'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
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
                <label htmlFor='remember' className='text-sm text-gray-700 font-bold cursor-pointer'>
                  Beni hatırla
                </label>
              </div>
            </>
          )}

          {error && (
            <div className='bg-red-50 border-2 border-red-100 rounded-xl p-4 animate-in fade-in zoom-in duration-300'>
              <div className='flex items-center space-x-3'>
                <AlertCircle className='text-red-500 shrink-0' size={20} />
                <p className='text-red-700 text-sm font-medium'>{error}</p>
              </div>
            </div>
          )}

          <Button
            type='submit'
            disabled={isLoading}
            className='w-full bg-gradient-to-r from-rose-primary to-coral-warm text-white font-bold py-8 rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center space-x-2 border-none text-lg group'
          >
            {isLoading ? (
              <Loader2 className='animate-spin' />
            ) : (
              <>
                <span>{isRootDomain ? 'Siteme Git' : 'Giriş Yap'}</span>
                <ArrowRight className='ml-2 group-hover:translate-x-1 transition-transform' />
              </>
            )}
          </Button>

          {!isRootDomain && (
            <div className='text-center'>
              <Link href='#' className='text-sm text-gray-500 hover:text-rose-primary transition-colors font-medium'>
                Şifremi unuttum
              </Link>
            </div>
          )}
        </form>

        <div className='mt-8 pt-6 border-t border-gray-100'>
          <div className='flex items-start space-x-3 bg-gray-50 rounded-xl p-4'>
            <div className='w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0'>
              <ShieldCheck className='text-gray-400' size={16} />
            </div>
            <div>
              <p className='text-gray-700 text-sm font-bold mb-0.5'>Güvenli Erişim</p>
              <p className='text-gray-500 text-xs leading-relaxed font-medium'>
                {isRootDomain
                  ? 'Kendi özel alanınıza sadece size ait bilgilerle erişebilirsiniz.'
                  : `Bu siteye sadece ${coupleNames || 'çift üyeleri'} erişebilir. Tüm verileriniz şifrelenmiştir.`}
              </p>
            </div>
          </div>

          <div className='mt-6 text-center'>
            <Link
              href={`${process.env.NEXT_PUBLIC_URL}/register`}
              className='inline-flex items-center space-x-2 text-gray-400 hover:text-rose-primary transition-all group'
              prefetch={false}
            >
              <span className='text-xs font-medium'>Powered by</span>
              <div className='flex items-center space-x-1.5'>
                <div className='w-5 h-5 bg-gradient-to-br from-rose-primary to-coral-warm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform'>
                  <Heart className='text-white fill-current' size={10} />
                </div>
                <span className=' text-sm font-bold text-gray-700'>Çiftopia</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Floating Hearts Animation */}
      <div className='absolute inset-0 pointer-events-none overflow-hidden'>
        {[...Array(6)].map((_, i) => (
          <Heart
            key={i}
            className={`absolute text-rose-200 opacity-20 animate-float`}
            size={24 + (i % 3) * 8}
            style={{
              top: `${15 + i * 15}%`,
              left: `${10 + ((i * 23) % 80)}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${5 + (i % 4)}s`
            }}
          />
        ))}
      </div>
    </div>
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
