'use client'

import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Heart, ChevronDown, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { authService, onboardingService } from '@/services/api'
import { User } from '@/lib/type'
import { getUserAvatar } from '@/lib/utils'
import { useUserStore } from '@/store/userStore'

interface CoupleLayoutClientProps {
  children: React.ReactNode
  user: User
  subdomain: string
}

export default function CoupleLayoutClient({ children, user, subdomain }: CoupleLayoutClientProps) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const { coupleNames, setCoupleNames, setUser } = useUserStore()
  const router = useRouter()

  useEffect(() => {
    setUser(user)
  }, [user, setUser])

  useEffect(() => {
    ;(async () => {
      if (!subdomain) setCoupleNames('Çiftopia')
      else {
        const response = await onboardingService.checkSubdomain(subdomain)
        setCoupleNames(response.data?.data?.couple || '')
      }
    })()
  }, [setCoupleNames, subdomain])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      await authService.logout()
      router.push('/login')
    } catch {
      router.push('/login')
    }
  }

  const isHomePage = pathname === '/'
  const navBgClass = scrolled || !isHomePage ? 'bg-white/95 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'

  const navLinkClass =
    scrolled || !isHomePage ? 'text-gray-700 hover:text-rose-primary' : 'text-white/90 hover:text-white'

  const logoClass =
    scrolled || !isHomePage
      ? 'bg-gradient-to-r from-rose-primary to-coral-warm bg-clip-text text-transparent'
      : 'text-white'

  return (
    <div className='min-h-screen flex flex-col'>
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${navBgClass}`}>
        <nav className='max-w-7xl mx-auto px-6'>
          <div className='flex items-center justify-between'>
            <Link href='/' className={`font-playfair-display text-2xl font-bold transition-colors ${logoClass}`}>
              {coupleNames}
            </Link>

            <div className='hidden md:flex items-center space-x-8'>
              <Link href='/' className={`${navLinkClass} transition-colors font-medium`}>
                Anasayfa
              </Link>
              <Link href='/memories' className={`${navLinkClass} transition-colors font-medium`}>
                Anılar
              </Link>
              <Link href='/#gallery-section' className={`${navLinkClass} transition-colors font-medium`}>
                Galeri
              </Link>
              <Link href='/#poems-section' className={`${navLinkClass} transition-colors font-medium`}>
                Şiirler
              </Link>
              <Link href='/#notes-section' className={`${navLinkClass} transition-colors font-medium`}>
                Notlar
              </Link>
            </div>

            <div className='flex items-center space-x-3'>
              {user ? (
                <div className='relative group'>
                  <button className='flex items-center space-x-2'>
                    <div className='relative w-10 h-10 rounded-full overflow-hidden border-2 border-rose-200'>
                      <Image src={getUserAvatar(user)} alt={user.firstName || 'User'} fill className='object-cover' />
                    </div>
                    <ChevronDown size={14} className={scrolled || !isHomePage ? 'text-gray-500' : 'text-white'} />
                  </button>

                  <div className='absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 z-[60]'>
                    <div className='p-4 border-b border-gray-100'>
                      <p className='font-semibold text-gray-900'>
                        {user.firstName} {user.lastName}
                      </p>
                      <p className='text-sm text-gray-500'>{user.email}</p>
                    </div>
                    <div className='py-2'>
                      <Link
                        href='/dashboard'
                        className='flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700'
                      >
                        <Settings size={18} className='text-gray-500' />
                        <span>Panel</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className='w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-red-600'
                      >
                        <LogOut size={18} />
                        <span>Çıkış Yap</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href='/login'
                  className={`px-6 py-2 rounded-full font-semibold transition-all ${
                    scrolled || !isHomePage
                      ? 'bg-rose-primary text-white hover:bg-rose-600 shadow-md'
                      : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border border-white/30'
                  }`}
                >
                  Giriş Yap
                </Link>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className='flex-grow'>{children}</main>

      {/* Footer */}
      <footer className='bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='text-center mb-8'>
            <div className='flex items-center justify-center space-x-3 mb-4'>
              <div className='w-12 h-12 bg-gradient-to-br from-rose-primary to-coral-warm rounded-full flex items-center justify-center'>
                <Heart size={24} fill='white' />
              </div>
              <span className=' text-2xl font-bold font-playfair-display'>{coupleNames}</span>
            </div>
            <p className='text-gray-400 text-lg'>14 Şubat 2023&apos;ten beri birlikte 💕</p>
          </div>

          <div className='flex flex-wrap items-center justify-center gap-6 md:gap-8 mb-8'>
            <Link href='/' className='text-gray-400 hover:text-white transition-colors'>
              Anasayfa
            </Link>
            <Link href='/memories' className='text-gray-400 hover:text-white transition-colors'>
              Anılar
            </Link>
            <Link href='/#gallery-section' className='text-gray-400 hover:text-white transition-colors'>
              Galeri
            </Link>
            <Link href='/#poems-section' className='text-gray-400 hover:text-white transition-colors'>
              Şiirler
            </Link>
            <Link href='/#notes-section' className='text-gray-400 hover:text-white transition-colors'>
              Notlar
            </Link>
          </div>

          <div className='border-t border-gray-700 pt-8 text-center'>
            <p className='text-gray-400 text-sm mb-4'>Sevgiyle yapıldı 💕</p>
            <Link
              href={process.env.NEXT_PUBLIC_URL || '/'}
              className='inline-flex items-center space-x-2 text-rose-400 hover:text-rose-300 transition-colors font-semibold'
            >
              <div className='w-6 h-6 bg-gradient-to-br from-rose-primary to-coral-warm rounded-full flex items-center justify-center'>
                <Heart size={12} fill='white' />
              </div>
              <span>Ciftopia</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
