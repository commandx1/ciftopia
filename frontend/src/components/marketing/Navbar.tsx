import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Logo from '../ui/Logo'

export const Navbar = () => {
  return (
    <header className='bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 dark:bg-slate-950/80'>
      <nav className='max-w-7xl mx-auto px-6 py-4'>
        <div className='flex items-center justify-between'>
          <Logo />

          <div className='hidden md:flex items-center space-x-8'>
            <Link
              href='/#features'
              className='text-gray-700 hover:text-rose-primary transition-colors font-medium dark:text-gray-300 dark:hover:text-rose-400'
            >
              Özellikler
            </Link>
            <Link
              href='/how-it-works'
              className='text-gray-700 hover:text-rose-primary transition-colors font-medium dark:text-gray-300 dark:hover:text-rose-400'
            >
              Nasıl Çalışır
            </Link>
            <Link
              href='/pricing'
              className='text-gray-700 hover:text-rose-primary transition-colors font-medium dark:text-gray-300 dark:hover:text-rose-400'
            >
              Fiyatlandırma
            </Link>
            <Link
              href='/#testimonials'
              className='text-gray-700 hover:text-rose-primary transition-colors font-medium dark:text-gray-300 dark:hover:text-rose-400'
            >
              Yorumlar
            </Link>
            <Link
              href='/privacy'
              className='text-gray-700 hover:text-rose-primary transition-colors font-medium dark:text-gray-300 dark:hover:text-rose-400'
            >
              Gizlilik
            </Link>
          </div>

          <div className='flex items-center space-x-4'>
            <Link href='/login'>
              <Button
                variant='ghost'
                className='font-medium text-gray-700 hover:text-rose-primary dark:text-gray-300 dark:hover:text-rose-400'
              >
                Giriş Yap
              </Button>
            </Link>
            <Link href='/register'>
              <Button className='bg-gradient-to-r from-rose-primary to-coral-warm text-white rounded-full font-semibold hover:shadow-lg transition-all border-none'>
                Hemen Başla
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}
