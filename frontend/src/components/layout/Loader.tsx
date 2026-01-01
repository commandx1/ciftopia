'use client'

import React, { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'

type LoaderType = 'main' | 'minimal' | 'compact' | 'skeleton' | 'overlay' | 'inline' | 'simple'

interface LoaderProps {
  type?: LoaderType
  text?: string
  progress?: number
  showProgress?: boolean
}

export const Loader = ({ type = 'main', text, progress: customProgress, showProgress = false }: LoaderProps) => {
  const [internalProgress, setInternalProgress] = useState(0)

  useEffect(() => {
    if (type === 'main' && customProgress === undefined) {
      const interval = setInterval(() => {
        setInternalProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + Math.random() * 15
        })
      }, 200)
      return () => clearInterval(interval)
    }
  }, [type, customProgress])

  const displayProgress = customProgress !== undefined ? customProgress : internalProgress
  const displayText =
    text ||
    (type === 'main'
      ? 'Yükleniyor...'
      : type === 'overlay'
        ? 'İşleminiz Gerçekleştiriliyor'
        : type === 'inline'
          ? 'Fotoğraflar işleniyor...'
          : 'Lütfen bekleyin...')

  if (type === 'main') {
    return (
      <div id='loader-main' className='fixed inset-0 flex items-center justify-center z-[9999]'>
        <div className='absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50'>
          <div className='absolute top-20 left-20 w-64 h-64 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse'></div>
          <div
            className='absolute top-40 right-20 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse'
            style={{ animationDelay: '0.5s' }}
          ></div>
          <div
            className='absolute bottom-20 left-1/3 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse'
            style={{ animationDelay: '1s' }}
          ></div>
        </div>

        <div className='relative z-10 text-center'>
          <div className='mb-12 relative'>
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='w-48 h-48 bg-gradient-to-br from-rose-primary to-coral-warm rounded-full opacity-20 animate-pulse-ring'></div>
            </div>
            <div className='absolute inset-0 flex items-center justify-center'>
              <div
                className='w-48 h-48 bg-gradient-to-br from-rose-primary to-coral-warm rounded-full opacity-20 animate-pulse-ring'
                style={{ animationDelay: '0.5s' }}
              ></div>
            </div>
            <div className='absolute inset-0 flex items-center justify-center'>
              <div
                className='w-48 h-48 bg-gradient-to-br from-rose-primary to-coral-warm rounded-full opacity-20 animate-pulse-ring'
                style={{ animationDelay: '1s' }}
              ></div>
            </div>

            <div className='relative w-32 h-32 mx-auto bg-white rounded-full shadow-2xl flex items-center justify-center border-2 border-rose-100'>
              <Heart className='text-rose-primary w-12 h-12 animate-heartbeat fill-current' />
            </div>
          </div>

          <div className='mb-8 animate-fade-in-up'>
            <h2 className='text-4xl font-bold text-gray-800 mb-3'>Çiftopia</h2>
            <p className='text-gray-600 text-lg font-medium'>{displayText}</p>
          </div>

          <div className='flex justify-center items-center space-x-2 mb-12'>
            <div className='w-2.5 h-2.5 rounded-full bg-rose-primary animate-dot-pulse1'></div>
            <div className='w-2.5 h-2.5 rounded-full bg-rose-primary animate-dot-pulse2'></div>
            <div className='w-2.5 h-2.5 rounded-full bg-rose-primary animate-dot-pulse3'></div>
          </div>

          <div className='w-80 mx-auto' style={{ opacity: showProgress ? 1 : 0 }}>
            <div className='h-2 bg-white/50 rounded-full overflow-hidden shadow-inner backdrop-blur-sm'>
              <div
                className='h-full bg-gradient-to-r from-rose-primary via-coral-warm to-purple-500 rounded-full transition-all duration-300'
                style={{ width: `${displayProgress}%` }}
              ></div>
            </div>
            <p className='text-sm text-gray-500 mt-3 font-medium'>{Math.round(displayProgress)}%</p>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'minimal') {
    return (
      <div className='fixed inset-0 flex items-center justify-center z-[9999]'>
        <div className='absolute inset-0 bg-white/95 backdrop-blur-md'></div>
        <div className='relative z-10 text-center'>
          <div className='mb-8'>
            <div className='relative w-24 h-24 mx-auto'>
              <div className='absolute inset-0 border-4 border-rose-100 rounded-full'></div>
              <div className='absolute inset-0 border-4 border-rose-primary rounded-full border-t-transparent animate-spin-slow'></div>
              <div className='absolute inset-0 flex items-center justify-center'>
                <Heart className='text-rose-primary w-8 h-8 fill-current' />
              </div>
            </div>
          </div>
          <div className=' text-2xl font-bold text-gray-800 mb-2'>Yükleniyor</div>
          <p className='text-gray-500 text-sm'>{displayText}</p>
        </div>
      </div>
    )
  }

  if (type === 'compact') {
    return (
      <div className='fixed inset-0 flex items-center justify-center z-[9999]'>
        <div className='absolute inset-0 bg-gradient-to-br from-soft-gray to-cream-white'></div>
        <div className='relative z-10'>
          <div className='bg-white rounded-3xl shadow-2xl p-12 text-center'>
            <div className='mb-6'>
              <div className='w-20 h-20 mx-auto bg-gradient-to-br from-rose-primary to-coral-warm rounded-full flex items-center justify-center'>
                <Heart className='text-white w-10 h-10 animate-heartbeat fill-current' />
              </div>
            </div>
            <h3 className=' text-2xl font-bold text-gray-800 mb-2'>Ciftopia</h3>
            <p className='text-gray-600 mb-6'>{displayText}</p>
            <div className='flex space-x-2 justify-center'>
              <div className='w-3 h-3 bg-rose-primary rounded-full animate-bounce'></div>
              <div
                className='w-3 h-3 bg-coral-warm rounded-full animate-bounce'
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className='w-3 h-3 bg-purple-500 rounded-full animate-bounce'
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'skeleton') {
    return (
      <div className='fixed inset-0 bg-soft-gray z-[9999]'>
        <header className='bg-white shadow-sm sticky top-0 z-50'>
          <nav className='max-w-7xl mx-auto px-6 py-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <div className='w-12 h-12 bg-gray-200 rounded-full animate-pulse'></div>
                <div className='w-32 h-6 bg-gray-200 rounded animate-pulse'></div>
              </div>
              <div className='flex items-center space-x-6'>
                <div className='w-48 h-5 bg-gray-200 rounded animate-pulse'></div>
                <div className='w-10 h-10 bg-gray-200 rounded-full animate-pulse'></div>
              </div>
            </div>
          </nav>
        </header>
        <main className='max-w-7xl mx-auto px-6 py-8'>
          <div className='bg-white rounded-3xl p-8 mb-8'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <div className='w-64 h-8 bg-gray-200 rounded mb-2 animate-pulse'></div>
                <div className='w-48 h-5 bg-gray-200 rounded animate-pulse'></div>
              </div>
              <div className='w-20 h-20 bg-gray-200 rounded-full animate-pulse'></div>
            </div>
            <div className='grid grid-cols-4 gap-4'>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className='bg-gray-100 rounded-2xl p-6 animate-pulse'>
                  <div className='w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3'></div>
                  <div className='w-16 h-8 bg-gray-200 rounded mx-auto mb-2'></div>
                  <div className='w-12 h-4 bg-gray-200 rounded mx-auto'></div>
                </div>
              ))}
            </div>
          </div>
          <div className='grid grid-cols-4 gap-6 mb-8'>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className='bg-white rounded-2xl p-6 shadow-md animate-pulse'>
                <div className='w-16 h-16 bg-gray-200 rounded-2xl mb-4'></div>
                <div className='w-32 h-5 bg-gray-200 rounded mb-2'></div>
                <div className='w-24 h-4 bg-gray-200 rounded'></div>
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (type === 'overlay') {
    return (
      <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000]'>
        <div className='bg-white rounded-3xl p-12 shadow-2xl text-center max-w-md mx-4'>
          <div className='mb-6'>
            <div className='relative w-24 h-24 mx-auto'>
              <div className='absolute inset-0 border-4 border-gray-200 rounded-full'></div>
              <div className='absolute inset-0 border-4 border-rose-primary rounded-full border-t-transparent animate-spin'></div>
              <div className='absolute inset-0 flex items-center justify-center'>
                <Heart className='text-rose-primary w-8 h-8 fill-current' />
              </div>
            </div>
          </div>
          <h3 className=' text-2xl font-bold text-gray-800 mb-3'>{text || 'İşleminiz Gerçekleştiriliyor'}</h3>
          <p className='text-gray-600 mb-6'>{displayText}</p>
          <div className='w-full bg-gray-200 rounded-full h-2 overflow-hidden'>
            <div
              className='h-full bg-gradient-to-r from-rose-primary to-coral-warm rounded-full animate-pulse'
              style={{ width: '70%' }}
            ></div>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'inline') {
    return (
      <div className='fixed bottom-8 right-8 bg-white rounded-2xl shadow-2xl p-6 z-[10000] border-2 border-rose-100 max-w-xs w-full animate-fade-in-up'>
        <div className='flex items-center space-x-4'>
          <div className='relative w-12 h-12 flex-shrink-0'>
            <div className='absolute inset-0 border-[3px] border-gray-200 rounded-full'></div>
            <div className='absolute inset-0 border-[3px] border-rose-primary rounded-full border-t-transparent animate-spin'></div>
            <div className='absolute inset-0 flex items-center justify-center'>
              <Heart className='text-rose-primary w-5 h-5 fill-current' />
            </div>
          </div>
          <div>
            <p className='font-semibold text-gray-800'>Yükleniyor</p>
            <p className='text-sm text-gray-500'>{displayText}</p>
          </div>
        </div>
        <div className='mt-4 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden'>
          <div
            className='h-full bg-gradient-to-r from-rose-primary to-coral-warm rounded-full transition-all duration-300'
            style={{ width: '45%' }}
          ></div>
        </div>
      </div>
    )
  }

  if (type === 'simple') {
    return (
      <div className='fixed top-0 left-0 right-0 h-1 bg-gray-200 z-[10000]'>
        <div className='h-full bg-gradient-to-r from-rose-primary via-coral-warm to-purple-500 animate-pulse'></div>
      </div>
    )
  }

  return null
}
