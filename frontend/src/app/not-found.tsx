import React from 'react'
import Link from 'next/link'
import { headers } from 'next/headers'
import {
  Heart,
  HeartCrack,
  Home,
  ArrowRight,
  Headset,
  Images,
  History,
} from 'lucide-react'
import CameraIcon from '@/components/ui/CameraIcon'

export default async function NotFound() {
  const headersList = await headers()
  const host = headersList.get('host') || ''
  const mainDomain = (process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'ciftopia.local:3000').split(':')[0]
  const hostname = host.split(':')[0]

  const isCoupleSite = hostname.endsWith(`.${mainDomain}`) && hostname !== `www.${mainDomain}` && hostname !== `app.${mainDomain}`

  return (
    <div className='min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 overflow-x-hidden flex items-center justify-center relative'>
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute top-20 left-20 w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse'></div>
        <div
          className='absolute top-40 right-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse'
          style={{ animationDelay: '0.5s' }}
        ></div>
        <div
          className='absolute bottom-20 left-1/3 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse'
          style={{ animationDelay: '1s' }}
        ></div>
      </div>

      {/* Floating Hearts */}
      <div className='absolute top-10 left-10 animate-float'>
        <Heart className='text-rose-300 w-10 h-10 opacity-40 fill-current' />
      </div>
      <div className='absolute top-20 right-32 animate-float' style={{ animationDelay: '0.5s' }}>
        <Heart className='text-coral-warm w-8 h-8 opacity-30 fill-current' />
      </div>
      <div className='absolute bottom-32 left-1/4 animate-float' style={{ animationDelay: '1s' }}>
        <Heart className='text-purple-300 w-12 h-12 opacity-20 fill-current' />
      </div>
      <div className='absolute top-1/3 right-20 animate-float'>
        <Heart className='text-pink-300 w-10 h-10 opacity-25 fill-current' />
      </div>

      <div className='container mx-auto px-6 relative z-10'>
        <div className='max-w-4xl mx-auto text-center'>
          <div className='mb-12 relative animate-fade-in-up'>
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='w-64 h-64 bg-gradient-to-br from-rose-primary to-coral-warm rounded-full opacity-10 animate-pulse-ring'></div>
            </div>
            <div className='absolute inset-0 flex items-center justify-center'>
              <div
                className='w-64 h-64 bg-gradient-to-br from-rose-primary to-coral-warm rounded-full opacity-10 animate-pulse-ring'
                style={{ animationDelay: '0.5s' }}
              ></div>
            </div>

            <div className='relative inline-block'>
              <div className='text-[150px] md:text-[200px]  font-bold text-transparent bg-clip-text bg-gradient-to-br from-rose-primary via-coral-warm to-purple-500 leading-none'>
                404
              </div>
              <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                <HeartCrack className='text-rose-primary w-16 h-16 md:w-20 md:h-20 animate-heartbeat opacity-80' />
              </div>
            </div>
          </div>

          <div className='mb-8 animate-fade-in-up' style={{ animationDelay: '0.2s' }}>
            <h1 className=' text-4xl md:text-6xl font-bold text-gray-800 mb-4'>Kayıp Bir Anı mı?</h1>
            <p className='text-lg md:text-2xl text-gray-600 mb-6'>
              Aradığınız sayfa bulunamadı veya taşınmış olabilir.
            </p>
            <p className='text-base md:text-lg text-gray-500 max-w-2xl mx-auto'>
              Belki bu anı henüz yaratılmadı, ya da yanlış bir yere tıkladınız. Endişelenmeyin, size doğru yolu
              gösterelim.
            </p>
          </div>

          <div
            className='flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up'
            style={{ animationDelay: '0.4s' }}
          >
            <Link
              href='/'
              className='group relative px-8 py-4 bg-gradient-to-r from-rose-primary to-coral-warm text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center space-x-2'
            >
              <Home size={20} />
              <span>Ana Sayfaya Dön</span>
              <ArrowRight size={16} className='transform group-hover:translate-x-1 transition-transform' />
            </Link>

            <Link
              href='/contact'
              className='px-8 py-4 bg-white text-gray-800 font-semibold rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center space-x-2 border-2 border-gray-200'
            >
              <Headset size={20} className='text-rose-primary' />
              <span>Yardım Al</span>
            </Link>
          </div>

          {isCoupleSite && (
            <div
              className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-fade-in-up'
              style={{ animationDelay: '0.6s' }}
            >
              <Link
                href='/memories'
                className='group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-rose-100 text-center'
              >
                <div className='w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform'>
                  <Images className='text-rose-primary w-8 h-8' />
                </div>
                <h3 className=' text-xl font-bold text-gray-800 mb-2'>Anılar</h3>
                <p className='text-gray-600 text-sm'>Özel anılarınızı keşfedin</p>
              </Link>

              <Link
                href='/#gallery-section'
                className='group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-rose-100 text-center'
              >
                <div className='w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform'>
                  <CameraIcon width={24} height={24} />
                </div>
                <h3 className=' text-xl font-bold text-gray-800 mb-2'>Galeri</h3>
                <p className='text-gray-600 text-sm'>Fotoğraf albümlerinize göz atın</p>
              </Link>

              <Link
                href='/dashboard'
                className='group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-rose-100 text-center'
              >
                <div className='w-16 h-16 bg-gradient-to-br from-coral-warm/20 to-rose-100 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform'>
                  <History className='text-coral-warm w-8 h-8' />
                </div>
                <h3 className=' text-xl font-bold text-gray-800 mb-2'>Panel</h3>
                <p className='text-gray-600 text-sm'>Sitenizi yönetin</p>
              </Link>
            </div>
          )}

          <div className='mt-12 text-center animate-fade-in-up' style={{ animationDelay: '1s' }}>
            <p className='text-gray-500 text-sm'>Hata kodu: 404 | Sayfa bulunamadı</p>
            <p className='text-gray-400 text-xs mt-2'>
              Bu hatayı bildirmek isterseniz,{' '}
              <Link href='/contact' className='text-rose-primary hover:underline'>
                bizimle iletişime geçin
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
