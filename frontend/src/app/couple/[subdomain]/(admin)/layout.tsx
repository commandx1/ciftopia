import React from 'react'
import { authServiceServer } from '@/services/api-server'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import DashboardHeaderClient from './dashboard/_components/DashboardHeaderClient'
import { getUserAvatar } from '@/lib/utils'
import Image from 'next/image'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await authServiceServer.me()

  if (!user) {
    redirect('/login')
  }

  const userDisplayName = user?.firstName + ' ' + (user?.lastName || '')
  const userAvatar = getUserAvatar(user)
  const subdomain = user?.coupleId?.subdomain
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'ciftopia.local:3000'
  const isProd = process.env.NEXT_PUBLIC_ENV === 'production'
  const coupleUrl = subdomain
    ? isProd
      ? `https://${subdomain}.${mainDomain}`
      : `http://${subdomain}.${mainDomain}`
    : null

  return (
    <div className='min-h-screen bg-soft-gray'>
      <header id='header' className='bg-white shadow-sm sticky top-0 z-50'>
        <nav className='max-w-7xl mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <Link href='/' className='flex items-center space-x-3'>
              <div className='w-12 h-12 relative'>
                <Image src='/favicon/favicon.svg' alt='Ciftopia Logo' fill className='object-contain' />
              </div>
              <span className=' text-2xl font-bold text-gray-800'>Ciftopia</span>
            </Link>

            <div className='flex items-center space-x-6'>
              {coupleUrl && (
                <Link
                  href={coupleUrl}
                  className='hidden md:flex items-center space-x-2 text-gray-700 hover:text-rose-primary transition-colors group'
                >
                  <span className='text-sm font-medium'>
                    {subdomain}.{mainDomain}
                  </span>
                  <ExternalLink
                    size={14}
                    className='group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform'
                  />
                </Link>
              )}

              <DashboardHeaderClient user={user} userDisplayName={userDisplayName} userAvatar={userAvatar} />
            </div>
          </div>
        </nav>
      </header>

      <main>{children}</main>

      <footer id='footer' className='bg-gray-900 text-white py-12 mt-16'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-8 mb-8'>
            <div>
              <div className='flex items-center space-x-3 mb-4'>
                <div className='w-10 h-10 relative'>
                  <Image src='/favicon/favicon.svg' alt='Ciftopia Logo' fill className='object-contain' />
                </div>
                <span className=' text-xl font-bold'>Ciftopia</span>
              </div>
              <p className='text-gray-400 text-sm'>Çiftler için özel dijital alan.</p>
            </div>

            <div>
              <h4 className='font-bold mb-4'>Ürün</h4>
              <ul className='space-y-2 text-sm text-gray-400'>
                <li>
                  <Link href='#' className='hover:text-white transition-colors'>
                    Özellikler
                  </Link>
                </li>
                <li>
                  <Link href='#' className='hover:text-white transition-colors'>
                    Fiyatlandırma
                  </Link>
                </li>
                <li>
                  <Link href='#' className='hover:text-white transition-colors'>
                    Demo
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className='font-bold mb-4'>Destek</h4>
              <ul className='space-y-2 text-sm text-gray-400'>
                <li>
                  <Link href='#' className='hover:text-white transition-colors'>
                    Yardım Merkezi
                  </Link>
                </li>
                <li>
                  <Link href='#' className='hover:text-white transition-colors'>
                    SSS
                  </Link>
                </li>
                <li>
                  <Link href='#' className='hover:text-white transition-colors'>
                    İletişim
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className='font-bold mb-4'>Yasal</h4>
              <ul className='space-y-2 text-sm text-gray-400'>
                <li>
                  <Link href='#' className='hover:text-white transition-colors'>
                    Gizlilik
                  </Link>
                </li>
                <li>
                  <Link href='#' className='hover:text-white transition-colors'>
                    Şartlar
                  </Link>
                </li>
                <li>
                  <Link href='#' className='hover:text-white transition-colors'>
                    KVKK
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className='border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center'>
            <p className='text-gray-400 text-sm'>© 2026 Ciftopia. Tüm hakları saklıdır.</p>
            <div className='flex space-x-4 mt-4 md:mt-0'>
              <Link href='#' className='text-gray-400 hover:text-white transition-colors'>
                Instagram
              </Link>
              <Link href='#' className='text-gray-400 hover:text-white transition-colors'>
                Twitter
              </Link>
              <Link href='#' className='text-gray-400 hover:text-white transition-colors'>
                Facebook
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
