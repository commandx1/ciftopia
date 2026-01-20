'use client'

import React, { useState } from 'react'
import {
  User,
  Globe,
  Camera,
  Bell,
  Crown,
  LogOut,
  Upload,
  Check,
  CircleCheck,
  Lock,
  Info,
  Save,
  RotateCcw,
  Trash
} from 'lucide-react'
import { authService, onboardingService } from '@/services/api'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import DeleteSiteModal from './DeleteSiteModal'
import { User as UserType } from '@/lib/type'
import { getUserAvatar } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface SettingsClientProps {
  user: UserType
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState('profil')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const router = useRouter()
  const handleLogout = async () => {
    await authService.logout()
    router.push('/login')
  }

  const handleDeleteConfirm = async () => {
    try {
      await onboardingService.deleteSite()
      router.push(process.env.NEXT_PUBLIC_URL || 'http://ciftopia.local:3000')
    } catch (error) {
      throw error // Re-throw to be handled by the modal's catch block
    }
  }

  const tabs = [
    { id: 'profil', label: 'Profil', icon: User },
    { id: 'site-ayarlari', label: 'Site Ayarları', icon: Globe },
    { id: 'bildirimler', label: 'Bildirimler', icon: Bell },
    { id: 'abonelik', label: 'Abonelik', icon: Crown }
  ]

  const userDisplayName = user?.firstName + ' ' + (user?.lastName || '')
  const userAvatar = getUserAvatar({ avatar: user?.avatar, gender: user?.gender })
  const subdomain = user?.coupleId?.subdomain
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN

  return (
    <div id='main-content' className='max-w-7xl mx-auto px-6 py-8'>
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
        {/* Sidebar */}
        <aside id='sidebar' className='lg:col-span-1'>
          <div className='bg-white rounded-2xl shadow-sm overflow-hidden sticky top-24 border border-gray-50'>
            <div className='p-6 border-b border-gray-100'>
              <h2 className=' text-2xl font-bold text-gray-900'>Ayarlar</h2>
              <p className='text-sm text-gray-500 mt-1'>Hesabınızı yönetin</p>
            </div>

            <nav className='p-4'>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center space-x-3 px-4 py-3 rounded-xl mb-2 transition-all font-medium',
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-rose-50 to-pink-50 text-rose-primary font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <tab.icon size={20} className={activeTab === tab.id ? 'text-rose-primary' : 'text-gray-500'} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            <div className='p-4 space-y-2 border-t border-gray-100'>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className='flex items-center space-x-3 px-4 py-3 rounded-xl text-white bg-red-500 hover:bg-red-600 font-medium w-full transition-all'
              >
                <Trash size={20} /> <span>Siteyi Sil</span>
              </button>
              <button
                onClick={handleLogout}
                className='flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium w-full transition-all'
              >
                <LogOut size={20} />
                <span>Çıkış Yap</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <section id='content-area' className='lg:col-span-3'>
          {/* Profil Section */}
          {activeTab === 'profil' && (
            <div
              id='profil-section'
              className='bg-white rounded-2xl shadow-sm p-8 mb-6 border border-gray-50 animate-in fade-in duration-500'
            >
              <div className='flex items-center justify-between mb-8'>
                <div>
                  <h1 className=' text-3xl font-bold text-gray-900'>Profil Ayarları</h1>
                  <p className='text-gray-500 mt-1'>Kişisel bilgilerinizi güncelleyin</p>
                </div>
                <div className='bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2'>
                  <CircleCheck size={16} />
                  <span>Doğrulanmış</span>
                </div>
              </div>

              <div id='profile-photo-section' className='mb-10'>
                <h3 className='font-bold text-lg text-gray-900 mb-4'>Profil Fotoğrafı</h3>
                <div className='flex items-center space-x-6'>
                  <div className='relative'>
                    <div className='relative w-24 h-24 rounded-full overflow-hidden border-4 border-rose-100'>
                      <Image src={userAvatar} alt='Profile' fill className='object-cover' />
                    </div>
                    <div className='absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-rose-primary to-coral-warm rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform'>
                      <Camera className='text-white w-8 h-8' />
                    </div>
                  </div>
                  <div className='flex-1'>
                    <button className='bg-gradient-to-r from-rose-primary to-coral-warm text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all mb-2 flex items-center space-x-2'>
                      <Upload size={18} />
                      <span>Fotoğraf Değiştir</span>
                    </button>
                    <button className='text-gray-500 hover:text-red-600 text-sm font-medium transition-colors ml-4'>
                      Kaldır
                    </button>
                    <p className='text-xs text-gray-400 mt-2'>JPG, PNG veya GIF. Maksimum 2MB.</p>
                  </div>
                </div>
              </div>

              <div id='personal-info-form' className='space-y-6 mb-10'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>Ad Soyad</label>
                    <input
                      type='text'
                      defaultValue={userDisplayName}
                      className='w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-rose-primary focus:outline-none transition-colors'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>Email</label>
                    <div className='relative'>
                      <input
                        type='email'
                        defaultValue={user?.email}
                        className='w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-rose-primary focus:outline-none transition-colors pr-12'
                      />
                      <div className='absolute right-4 top-1/2 transform -translate-y-1/2 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1'>
                        <Check size={12} />
                        <span>Doğrulandı</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Telefon <span className='text-gray-400 font-normal'>(Opsiyonel)</span>
                  </label>
                  <input
                    type='tel'
                    placeholder='+90 5XX XXX XX XX'
                    className='w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-rose-primary focus:outline-none transition-colors'
                  />
                </div>
              </div>

              <div className='border-t border-gray-100 pt-10 mb-10'>
                <h3 className='font-bold text-lg text-gray-900 mb-6 flex items-center'>
                  <Lock size={20} className='text-rose-primary mr-3' />
                  Şifre Değiştir
                </h3>
                <div className='space-y-6'>
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>Mevcut Şifre</label>
                    <input
                      type='password'
                      placeholder='••••••••'
                      className='w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-rose-primary focus:outline-none transition-colors'
                    />
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-sm font-semibold text-gray-700 mb-2'>Yeni Şifre</label>
                      <input
                        type='password'
                        placeholder='••••••••'
                        className='w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-rose-primary focus:outline-none transition-colors'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-semibold text-gray-700 mb-2'>Yeni Şifre Tekrar</label>
                      <input
                        type='password'
                        placeholder='••••••••'
                        className='w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-rose-primary focus:outline-none transition-colors'
                      />
                    </div>
                  </div>
                  <div className='bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg flex items-start space-x-3'>
                    <Info size={18} className='text-blue-500 shrink-0 mt-0.5' />
                    <p className='text-sm text-blue-800'>
                      Şifreniz en az 8 karakter, bir büyük harf, bir küçük harf ve bir rakam içermelidir.
                    </p>
                  </div>
                </div>
              </div>

              <div className='flex items-center justify-between pt-6 border-t border-gray-100'>
                <button className='text-gray-500 hover:text-gray-700 font-semibold transition-colors'>İptal</button>
                <button className='bg-gradient-to-r from-rose-primary to-coral-warm text-white px-8 py-3 rounded-xl font-bold hover:shadow-xl transition-all flex items-center space-x-2'>
                  <Save size={18} />
                  <span>Değişiklikleri Kaydet</span>
                </button>
              </div>
            </div>
          )}

          {/* Site Ayarları Section */}
          {activeTab === 'site-ayarlari' && (
            <div
              id='site-ayarlari-section'
              className='bg-white rounded-2xl shadow-sm p-8 mb-6 border border-gray-50 animate-in fade-in duration-500'
            >
              <div className='mb-8'>
                <h1 className=' text-3xl font-bold text-gray-900'>Site Ayarları</h1>
                <p className='text-gray-500 mt-1'>Web sitenizi özelleştirin</p>
              </div>

              <div id='subdomain-section' className='mb-10'>
                <h3 className='font-bold text-lg text-gray-900 mb-4'>Subdomain</h3>
                <div className='bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-100'>
                  <div className='flex items-center space-x-3 mb-4'>
                    <div className='w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center'>
                      <Globe size={24} className='text-white' />
                    </div>
                    <div>
                      <p className='font-semibold text-gray-900'>Mevcut Subdomain</p>
                      <p className='text-purple-600 font-mono font-bold'>
                        {subdomain}.{mainDomain}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-3'>
                    <input
                      type='text'
                      placeholder='yeni-subdomain'
                      className='flex-1 px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none transition-colors'
                    />
                    <button className='bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors'>
                      Değiştir
                    </button>
                  </div>
                  <p className='text-xs text-gray-500 mt-3 flex items-center'>
                    <Info size={12} className='mr-1' />
                    Subdomain değişikliği 24 saat içinde aktif olur.
                  </p>
                </div>
              </div>

              <div id='theme-section' className='mb-10'>
                <h3 className='font-bold text-lg text-gray-900 mb-4'>Tema Seçimi</h3>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  {[
                    { id: 'romantic', label: 'Romantik', color: 'from-rose-400 to-pink-500', active: true },
                    { id: 'purple', label: 'Mor Rüya', color: 'from-purple-400 to-indigo-500' },
                    { id: 'ocean', label: 'Okyanus', color: 'from-blue-400 to-cyan-500' },
                    { id: 'sunset', label: 'Günbatımı', color: 'from-amber-400 to-orange-500' }
                  ].map(theme => (
                    <div key={theme.id} className='relative group cursor-pointer'>
                      <div
                        className={cn(
                          'aspect-video bg-gradient-to-br rounded-xl overflow-hidden border-2 transition-all',
                          theme.color,
                          theme.active
                            ? 'border-rose-primary shadow-lg scale-105'
                            : 'border-gray-100 hover:border-gray-300'
                        )}
                      >
                        {theme.active && (
                          <div className='absolute inset-0 flex items-center justify-center'>
                            <Check size={32} className='text-white' />
                          </div>
                        )}
                      </div>
                      <p className='text-sm font-semibold text-center mt-2'>{theme.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div id='site-details-section' className='space-y-6 mb-10'>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>Site Başlığı</label>
                  <input
                    type='text'
                    defaultValue={`${user?.firstName} & Partner'in Aşk Hikayesi`}
                    className='w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-rose-primary focus:outline-none transition-colors'
                  />
                </div>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>Tanışma Tarihi</label>
                  <input
                    type='date'
                    defaultValue='2021-02-14'
                    className='w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-rose-primary focus:outline-none transition-colors'
                  />
                </div>
              </div>

              <div className='flex items-center justify-between pt-6 border-t border-gray-100'>
                <button className='text-gray-500 hover:text-gray-700 font-semibold transition-colors flex items-center space-x-2'>
                  <RotateCcw size={18} />
                  <span>Sıfırla</span>
                </button>
                <button className='bg-gradient-to-r from-rose-primary to-coral-warm text-white px-8 py-3 rounded-xl font-bold hover:shadow-xl transition-all flex items-center space-x-2'>
                  <Save size={18} />
                  <span>Kaydet</span>
                </button>
              </div>
            </div>
          )}

          {/* Abonelik Section */}
          {activeTab === 'abonelik' && (
            <div
              id='abonelik-section'
              className='bg-white rounded-2xl shadow-sm p-8 mb-6 border border-gray-50 animate-in fade-in duration-500'
            >
              <div className='mb-8'>
                <h1 className=' text-3xl font-bold text-gray-900'>Abonelik Yönetimi</h1>
                <p className='text-gray-500 mt-1'>Paketinizi görüntüleyin ve yönetin</p>
              </div>

              <div
                id='current-plan'
                className='bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-8 text-white mb-8 relative overflow-hidden'
              >
                <div className='absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32'></div>
                <div className='absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24'></div>
                <div className='relative z-10'>
                  <div className='flex items-center justify-between mb-6'>
                    <div>
                      <p className='text-rose-100 text-sm font-semibold mb-2'>Mevcut Paketiniz</p>
                      <h2 className=' text-4xl font-bold'>Premium Aylık</h2>
                    </div>
                    <div className='bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full'>
                      <p className='text-3xl font-bold'>₺49</p>
                      <p className='text-sm text-rose-100'>/ay</p>
                    </div>
                  </div>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
                    {[
                      { label: '1GB', sub: 'Depolama' },
                      { label: '5', sub: 'Albüm' },
                      { label: '∞', sub: 'Anı' },
                      { label: '✓', sub: 'Tüm Özellikler' }
                    ].map((item, i) => (
                      <div key={i} className='bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center'>
                        <p className='text-2xl font-bold mb-1'>{item.label}</p>
                        <p className='text-xs text-rose-100'>{item.sub}</p>
                      </div>
                    ))}
                  </div>
                  <div className='flex items-center justify-between'>
                    <p className='text-sm text-rose-100'>Sonraki ödeme: 14 Mart 2025</p>
                    <button className='bg-white text-rose-600 px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all'>
                      Paketi Yükselt
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <DeleteSiteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        subdomain={subdomain}
      />
    </div>
  )
}
