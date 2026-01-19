import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Heart,
  Sparkles,
  Check,
  Crown,
  Gift,
  Infinity,
  ShieldCheck,
  Lock,
  CreditCard,
  Headset,
  Star,
  Minus,
  Banknote,
  ArrowRight,
  Play,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Clock
} from 'lucide-react'
import { FAQ } from './FAQ'

export default function PricingPage() {
  return (
    <div className='bg-cream-white selection:bg-rose-100 selection:text-rose-primary'>
      {/* Header */}
      <header id='header' className='bg-white shadow-sm sticky top-0 z-50'>
        <nav className='max-w-7xl mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <Link href='/' className='flex items-center space-x-3'>
              <div className='w-12 h-12 bg-gradient-to-br from-rose-primary to-coral-warm rounded-full flex items-center justify-center'>
                <Heart className='text-white w-6 h-6 fill-current' />
              </div>
              <span className='text-2xl font-bold text-gray-800'>Çiftopia</span>
            </Link>

            <div className='hidden md:flex items-center space-x-8'>
              <Link href='#features' className='text-gray-700 hover:text-rose-primary transition-colors font-medium'>
                Özellikler
              </Link>
              <Link
                href='#how-it-works'
                className='text-gray-700 hover:text-rose-primary transition-colors font-medium'
              >
                Nasıl Çalışır
              </Link>
              <Link href='#pricing' className='text-rose-primary font-semibold'>
                Fiyatlandırma
              </Link>
              <Link
                href='#testimonials'
                className='text-gray-700 hover:text-rose-primary transition-colors font-medium'
              >
                Yorumlar
              </Link>
              <Link href='#demo' className='text-gray-700 hover:text-rose-primary transition-colors font-medium'>
                Demo
              </Link>
            </div>

            <div className='flex items-center space-x-4'>
              <Link href='/login' className='text-gray-700 hover:text-rose-primary transition-colors font-medium'>
                Giriş Yap
              </Link>
              <Link
                href='/register'
                className='bg-gradient-to-r from-rose-primary to-coral-warm text-white px-6 py-2.5 rounded-full font-semibold hover:shadow-lg transition-all'
              >
                Hemen Başla
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Pricing Hero */}
      <section
        id='pricing-hero'
        className='relative bg-gradient-to-br from-cream-white via-pink-50 to-rose-50 overflow-hidden py-20'
      >
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute top-10 right-10 w-64 h-64 bg-rose-primary rounded-full blur-3xl'></div>
          <div className='absolute bottom-10 left-10 w-80 h-80 bg-coral-warm rounded-full blur-3xl'></div>
        </div>

        <div className='max-w-7xl mx-auto px-6 relative z-10 text-center'>
          <div className='inline-block mb-6'>
            <span className='bg-gradient-to-r from-rose-primary to-coral-warm text-white px-6 py-2 rounded-full text-sm font-bold flex items-center'>
              <Sparkles className='mr-2' size={16} />7 Gün Ücretsiz Deneme
            </span>
          </div>

          <h1 className='text-6xl lg:text-7xl font-bold text-gray-900 mb-6'>Size Uygun Planı Seçin</h1>

          <p className='text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed'>
            Tüm planlarda 1GB depolama, 5 albüm ve tüm özellikler dahil
          </p>

          <div className='flex flex-wrap items-center justify-center gap-8 text-gray-700'>
            <div className='flex items-center space-x-2'>
              <span className='font-semibold text-lg'>Tüm planlarda:</span>
            </div>
            <div className='flex items-center space-x-3'>
              <div className='w-8 h-8 bg-gradient-to-br from-rose-primary to-pink-400 rounded-full flex items-center justify-center'>
                <Check className='text-white' size={14} />
              </div>
              <span className='font-medium'>Özel domain</span>
            </div>
            <div className='flex items-center space-x-3'>
              <div className='w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-400 rounded-full flex items-center justify-center'>
                <Check className='text-white' size={14} />
              </div>
              <span className='font-medium'>Tüm temalar</span>
            </div>
            <div className='flex items-center space-x-3'>
              <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center'>
                <Check className='text-white' size={14} />
              </div>
              <span className='font-medium'>7/24 destek</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section id='pricing-cards' className='py-24 bg-white relative'>
        <div className='absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-cream-white to-transparent'></div>

        <div className='max-w-7xl mx-auto px-6 relative z-10'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto'>
            {/* Monthly Plan */}
            <div
              id='pricing-card-monthly'
              className='bg-white rounded-3xl overflow-hidden border-2 border-gray-200 hover:border-rose-200 transition-all hover:shadow-xl'
            >
              <div className='bg-gradient-to-br from-gray-50 to-gray-100 p-6 text-center'>
                <div className='inline-block bg-white px-4 py-1 rounded-full text-sm font-semibold text-gray-700 mb-4'>
                  Esnek
                </div>
                <h3 className='text-3xl font-bold text-gray-900 mb-2'>Aylık Plan</h3>
                <p className='text-gray-600'>İstediğiniz zaman iptal edin</p>
              </div>

              <div className='p-8'>
                <div className='text-center mb-8'>
                  <div className='mb-4'>
                    <span className='text-gray-500 line-through text-lg'>₺349</span>
                  </div>
                  <div className='flex items-start justify-center mb-2'>
                    <span className='text-2xl font-bold text-gray-900 mt-2'>₺</span>
                    <span className='text-6xl font-bold text-gray-900'>249</span>
                  </div>
                  <p className='text-rose-primary font-semibold mb-1'>kurulum ücreti (tek seferlik)</p>
                  <div className='h-px bg-gray-200 w-20 mx-auto my-4'></div>
                  <div className='flex items-start justify-center'>
                    <span className='text-xl font-bold text-gray-900 mt-1'>₺</span>
                    <span className='text-5xl font-bold text-gray-900'>49</span>
                    <span className='text-gray-500 text-lg mt-4 ml-1'>/ay</span>
                  </div>
                </div>

                <ul className='space-y-4 mb-8'>
                  {[
                    '1GB depolama alanı',
                    '5 fotoğraf albümü',
                    'Tüm özellikler dahil',
                    'Özel subdomain',
                    'Standart destek'
                  ].map((feature, i) => (
                    <li key={i} className='flex items-start'>
                      <div className='w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5 mr-3 flex-shrink-0'>
                        <Check className='text-green-600' size={14} />
                      </div>
                      <span className='text-gray-700'>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href='/register'
                  className='block w-full bg-white border-2 border-gray-300 text-center text-gray-700 py-4 rounded-full font-bold text-lg hover:bg-gray-50 hover:border-gray-400 transition-all'
                >
                  Başlayın
                </Link>
                <p className='text-center text-sm text-gray-500 mt-4'>İlk 7 gün ücretsiz</p>
              </div>
            </div>

            {/* Yearly Plan */}
            <div
              id='pricing-card-yearly'
              className='bg-gradient-to-br from-rose-500 to-pink-500 rounded-3xl overflow-hidden border-4 border-rose-400 shadow-2xl transform scale-105 relative'
            >
              <div className='absolute -top-4 left-1/2 transform -translate-x-1/2 z-20'>
                <div className='bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-8 py-3 rounded-full font-bold text-base shadow-xl flex items-center space-x-2 whitespace-nowrap'>
                  <Crown size={18} />
                  <span>En Popüler</span>
                </div>
              </div>

              <div className='bg-white/10 backdrop-blur-sm p-6 text-center'>
                <div className='inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-semibold text-white mb-4'>
                  En Çok Tercih Edilen
                </div>
                <h3 className='text-3xl font-bold text-white mb-2'>Yıllık Plan</h3>
                <p className='text-white/90'>2 ay bedava kazanın!</p>
              </div>

              <div className='p-8'>
                <div className='bg-gradient-to-br from-yellow-400 to-orange-400 text-gray-900 px-4 py-2 rounded-full text-center font-bold mb-6 inline-block w-full'>
                  <Gift className='inline mr-2' size={18} />2 AY BEDAVA!
                </div>

                <div className='text-center mb-8'>
                  <div className='mb-4'>
                    <span className='text-white/70 line-through text-lg'>₺837</span>
                  </div>
                  <div className='flex items-start justify-center mb-2'>
                    <span className='text-2xl font-bold text-white mt-2'>₺</span>
                    <span className='text-6xl font-bold text-white'>249</span>
                  </div>
                  <p className='text-white/90 font-semibold mb-1'>kurulum ücreti (tek seferlik)</p>
                  <div className='h-px bg-white/30 w-20 mx-auto my-4'></div>
                  <div className='flex items-start justify-center'>
                    <span className='text-xl font-bold text-white mt-1'>₺</span>
                    <span className='text-5xl font-bold text-white'>449</span>
                    <span className='text-white/80 text-lg mt-4 ml-1'>/yıl</span>
                  </div>
                  <p className='text-white/80 text-sm mt-2'>(~₺37/ay)</p>
                </div>

                <ul className='space-y-4 mb-8'>
                  {['1GB depolama alanı', '5 fotoğraf albümü', 'Tüm özellikler dahil', 'Özel subdomain'].map(
                    (feature, i) => (
                      <li key={i} className='flex items-start'>
                        <div className='w-6 h-6 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center mt-0.5 mr-3 flex-shrink-0'>
                          <Check className='text-white' size={14} />
                        </div>
                        <span className='text-white'>{feature}</span>
                      </li>
                    )
                  )}
                  <li className='flex items-start'>
                    <div className='w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center mt-0.5 mr-3 flex-shrink-0'>
                      <Star className='text-gray-900' size={14} fill='currentColor' />
                    </div>
                    <span className='text-white font-semibold'>Öncelikli destek</span>
                  </li>
                </ul>

                <Link
                  href='/register'
                  className='block w-full bg-white text-center text-rose-500 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all'
                >
                  Başlayın
                </Link>

                <p className='text-center text-sm text-white/80 mt-4'>İlk 7 gün ücretsiz</p>
              </div>
            </div>

            {/* Lifetime Plan */}
            <div
              id='pricing-card-lifetime'
              className='bg-white rounded-3xl overflow-hidden border-2 border-purple-200 hover:border-purple-300 transition-all hover:shadow-xl'
            >
              <div className='bg-gradient-to-br from-purple-50 to-indigo-50 p-6 text-center'>
                <div className='inline-block bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4'>
                  En İyi Değer
                </div>
                <h3 className='text-3xl font-bold text-gray-900 mb-2'>Lifetime</h3>
                <p className='text-gray-600'>Tek ödeme, sonsuza kadar</p>
              </div>

              <div className='p-8'>
                <div className='bg-gradient-to-br from-purple-100 to-indigo-100 border-2 border-purple-200 px-4 py-2 rounded-full text-center font-bold text-purple-700 mb-6 uppercase text-sm tracking-wide'>
                  <Infinity className='inline mr-2' size={18} />
                  KURULUM DAHİL
                </div>

                <div className='text-center mb-8'>
                  <div className='mb-4'>
                    <span className='text-gray-500 line-through text-lg'>₺4,999</span>
                    <span className='ml-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold'>
                      %70 İNDİRİM
                    </span>
                  </div>
                  <div className='flex items-start justify-center mb-2'>
                    <span className='text-2xl font-bold text-gray-900 mt-2'>₺</span>
                    <span className='text-6xl font-bold text-gray-900'>1,499</span>
                  </div>
                  <p className='text-purple-600 font-semibold'>tek seferlik ödeme</p>
                  <div className='mt-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4'>
                    <p className='text-sm text-gray-700 font-medium'>Kurulum + Ömür boyu kullanım</p>
                  </div>
                </div>

                <ul className='space-y-4 mb-8'>
                  {['1GB depolama alanı', '5 fotoğraf albümü', 'Tüm özellikler dahil', 'Özel subdomain'].map(
                    (feature, i) => (
                      <li key={i} className='flex items-start'>
                        <div className='w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5 mr-3 flex-shrink-0'>
                          <Check className='text-purple-600' size={14} />
                        </div>
                        <span className='text-gray-700'>{feature}</span>
                      </li>
                    )
                  )}
                  <li className='flex items-start'>
                    <div className='w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mt-0.5 mr-3 flex-shrink-0'>
                      <Sparkles className='text-white' size={14} />
                    </div>
                    <span className='text-gray-900 font-semibold'>Tüm gelecek özellikler</span>
                  </li>
                </ul>

                <Link
                  href='/register'
                  className='block w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-center text-white py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:from-purple-600 hover:to-indigo-600 transition-all'
                >
                  Başlayın
                </Link>

                <p className='text-center text-sm text-gray-500 mt-4'>Tek seferlik ödeme</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section id='comparison-table' className='py-24 bg-gradient-to-br from-cream-white to-pink-50'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='text-center mb-16'>
            <h2 className='text-5xl font-bold text-gray-900 mb-4'>Detaylı Karşılaştırma</h2>
            <p className='text-xl text-gray-600'>Hangi plan size uygun?</p>
          </div>

          <div className='bg-white rounded-3xl shadow-2xl overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='bg-gradient-to-r from-gray-50 to-gray-100'>
                    <th className='text-left p-6 text-2xl text-gray-900'>Özellikler</th>
                    <th className='text-center p-6'>
                      <div className='text-xl text-gray-900 mb-1'>Aylık</div>
                      <div className='text-sm text-gray-600'>₺49/ay</div>
                    </th>
                    <th className='text-center p-6 bg-gradient-to-br from-rose-50 to-pink-50'>
                      <div className='text-xl text-rose-600 mb-1'>Yıllık</div>
                      <div className='text-sm text-rose-500 font-semibold'>₺449/yıl</div>
                    </th>
                    <th className='text-center p-6'>
                      <div className='text-xl text-purple-600 mb-1'>Lifetime</div>
                      <div className='text-sm text-purple-500'>₺1,499</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Depolama', aylik: '1GB', yillik: '1GB', lifetime: '1GB' },
                    { name: 'Albüm Sayısı', aylik: '5 albüm', yillik: '5 albüm', lifetime: '5 albüm' },
                    { name: 'Tema Seçenekleri', aylik: 'Tüm temalar', yillik: 'Tüm temalar', lifetime: 'Tüm temalar' },
                    { name: 'Destek', aylik: 'Standart', yillik: 'Öncelikli', lifetime: 'Öncelikli', icon: true },
                    { name: 'Gelecek Özellikler', aylik: false, yillik: false, lifetime: 'Dahil' },
                    { name: 'İptal Esnekliği', aylik: 'Her zaman', yillik: 'Her zaman', lifetime: 'Ömür boyu' }
                  ].map((row, idx) => (
                    <tr key={idx} className={`border-t border-gray-100 ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                      <td className='p-6 font-semibold text-gray-900'>{row.name}</td>
                      <td className='p-6 text-center'>
                        <div className='flex flex-col items-center'>
                          <span
                            className={`inline-flex items-center justify-center w-10 h-10 ${row.aylik ? 'bg-green-100' : 'bg-gray-100'} rounded-full`}
                          >
                            {row.aylik ? (
                              <Check className='text-green-600' size={20} />
                            ) : (
                              <Minus className='text-gray-400' size={20} />
                            )}
                          </span>
                          {row.aylik && <div className='text-sm text-gray-600 mt-2'>{row.aylik}</div>}
                        </div>
                      </td>
                      <td
                        className={`p-6 text-center ${idx % 2 === 1 ? 'bg-gradient-to-br from-rose-50 to-pink-50' : 'bg-gradient-to-br from-rose-50/50 to-pink-50/50'}`}
                      >
                        <div className='flex flex-col items-center'>
                          <span
                            className={`inline-flex items-center justify-center w-10 h-10 ${row.yillik ? (row.icon ? 'bg-rose-100' : 'bg-green-100') : 'bg-gray-100'} rounded-full`}
                          >
                            {row.yillik ? (
                              row.icon ? (
                                <Star className='text-rose-600' size={20} fill='currentColor' />
                              ) : (
                                <Check className='text-green-600' size={20} />
                              )
                            ) : (
                              <Minus className='text-gray-400' size={20} />
                            )}
                          </span>
                          {row.yillik && (
                            <div
                              className={`text-sm ${row.icon ? 'text-rose-600 font-semibold' : 'text-gray-600'} mt-2`}
                            >
                              {row.yillik}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className='p-6 text-center'>
                        <div className='flex flex-col items-center'>
                          <span
                            className={`inline-flex items-center justify-center w-10 h-10 ${row.lifetime ? (row.name === 'Gelecek Özellikler' ? 'bg-purple-100' : row.name === 'İptal Esnekliği' ? 'bg-purple-100' : row.icon ? 'bg-rose-100' : 'bg-green-100') : 'bg-gray-100'} rounded-full`}
                          >
                            {row.lifetime ? (
                              row.name === 'Gelecek Özellikler' ? (
                                <Sparkles className='text-purple-600' size={20} />
                              ) : row.name === 'İptal Esnekliği' ? (
                                <Infinity className='text-purple-600' size={20} />
                              ) : row.icon ? (
                                <Star className='text-rose-600' size={20} fill='currentColor' />
                              ) : (
                                <Check className='text-green-600' size={20} />
                              )
                            ) : (
                              <Minus className='text-gray-400' size={20} />
                            )}
                          </span>
                          {row.lifetime && (
                            <div
                              className={`text-sm ${row.icon || row.name.includes('Gelecek') || row.name.includes('İptal') ? 'text-purple-600 font-semibold' : 'text-gray-600'} mt-2`}
                            >
                              {row.lifetime}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Security */}
      <section id='payment-security' className='py-24 bg-white'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='text-center mb-16'>
            <h2 className='text-5xl font-bold text-gray-900 mb-4'>Güvenli Ödeme</h2>
            <p className='text-xl text-gray-600'>Ödeme bilgileriniz güvende</p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto'>
            <div className='bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 text-center border-2 border-blue-100'>
              <div className='w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg text-blue-600'>
                <ShieldCheck size={32} />
              </div>
              <h4 className='font-bold text-lg text-gray-900 mb-2'>SSL Güvenliği</h4>
              <p className='text-gray-600 text-sm'>256-bit şifreleme</p>
            </div>

            <div className='bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 text-center border-2 border-green-100'>
              <div className='w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg text-green-600'>
                <Lock size={32} />
              </div>
              <h4 className='font-bold text-lg text-gray-900 mb-2'>iyzico</h4>
              <p className='text-gray-600 text-sm'>Güvenli ödeme altyapısı</p>
            </div>

            <div className='bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 text-center border-2 border-purple-100'>
              <div className='w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg text-purple-600'>
                <CreditCard size={32} />
              </div>
              <h4 className='font-bold text-lg text-gray-900 mb-2'>Tüm Kartlar</h4>
              <p className='text-gray-600 text-sm'>Visa, Mastercard, Troy</p>
            </div>

            <div className='bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-8 text-center border-2 border-rose-100'>
              <div className='w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg text-rose-600'>
                <Headset size={32} />
              </div>
              <h4 className='font-bold text-lg text-gray-900 mb-2'>7/24 Destek</h4>
              <p className='text-gray-600 text-sm'>Her zaman yanınızdayız</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <FAQ />

      {/* Trust Badges */}
      <section id='trust-badges' className='py-16 bg-white'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='flex flex-wrap items-center justify-center gap-12'>
            {[
              { icon: ShieldCheck, label: 'SSL Secured', color: 'blue' },
              { icon: Lock, label: 'iyzico Secure', color: 'green' },
              { icon: Headset, label: '7/24 Destek', color: 'purple' },
              { icon: Heart, label: '500+ Çift', color: 'rose' }
            ].map((badge, i) => (
              <div key={i} className='flex flex-col items-center'>
                <div
                  className={`w-24 h-24 bg-gradient-to-br from-${badge.color}-500 to-${badge.color === 'blue' ? 'cyan' : badge.color === 'green' ? 'emerald' : badge.color === 'purple' ? 'indigo' : 'pink'}-400 rounded-2xl flex items-center justify-center mb-3 shadow-lg text-white`}
                >
                  <badge.icon size={40} />
                </div>
                <p className='text-sm font-semibold text-gray-700'>{badge.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Money Back Guarantee */}
      <section id='money-back-guarantee' className='py-24 bg-gradient-to-br from-green-50 to-emerald-50'>
        <div className='max-w-5xl mx-auto px-6'>
          <div className='bg-white rounded-3xl p-12 shadow-2xl border-4 border-green-200 text-center'>
            <div className='inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-400 rounded-full mb-6 shadow-xl text-white'>
              <ShieldCheck size={40} />
            </div>
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>14 Gün Para İade Garantisi</h2>
            <p className='text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto'>
              Memnun kalmazsanız ilk 14 gün içinde tam iade. Soru sorulmaz, koşulsuz iade.
            </p>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-12'>
              <div className='text-center'>
                <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600'>
                  <Clock size={24} />
                </div>
                <h4 className='font-bold text-lg text-gray-900 mb-2'>14 Gün</h4>
                <p className='text-gray-600 text-sm'>İade süresi</p>
              </div>
              <div className='text-center'>
                <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600'>
                  <Check size={24} />
                </div>
                <h4 className='font-bold text-lg text-gray-900 mb-2'>Koşulsuz</h4>
                <p className='text-gray-600 text-sm'>Soru sorulmaz</p>
              </div>
              <div className='text-center'>
                <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600'>
                  <Banknote size={24} />
                </div>
                <h4 className='font-bold text-lg text-gray-900 mb-2'>Tam İade</h4>
                <p className='text-gray-600 text-sm'>%100 geri ödeme</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Pricing */}
      <section id='testimonials-pricing' className='py-24 bg-white'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='text-center mb-16'>
            <h2 className='text-5xl font-bold text-gray-900 mb-4'>Çiftlerimiz Ne Diyor?</h2>
            <p className='text-xl text-gray-600'>Fiyat-performans hakkında gerçek yorumlar</p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {[
              {
                name: 'Elif & Burak',
                text: '"Yıllık plan aldık, çok değdi! Aylık 37 TL\'ye tüm özellikler. Düğün hazırlıklarımızı bile buradan yaptık."',
                plan: 'Yıllık Plan',
                color: 'rose',
                avatar: 'avatar-5'
              },
              {
                name: 'Can & Zeynep',
                text: '"Önce aylık başladık, sonra lifetime\'a geçtik. Uzun vadede çok daha mantıklı. Ömür boyu kullanacağız!"',
                plan: 'Lifetime Plan',
                color: 'purple',
                avatar: 'avatar-2'
              },
              {
                name: 'Ayşe & Mehmet',
                text: '"Aylık planla başladık, önce denemek istedik. 7 gün ücretsiz deneme çok iyi! Şimdi yıllığa geçmeyi düşünüyoruz."',
                plan: 'Aylık Plan',
                color: 'blue',
                avatar: 'avatar-1'
              }
            ].map((item, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br from-${item.color}-50 to-${item.color === 'rose' ? 'pink' : item.color === 'purple' ? 'indigo' : 'cyan'}-50 rounded-3xl p-8 border-2 border-${item.color}-100`}
              >
                <div className='flex items-center mb-6'>
                  <div className='relative w-16 h-16 mr-4 shrink-0'>
                    <Image
                      src={`https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/${item.avatar}.jpg`}
                      alt={item.name}
                      fill
                      className='rounded-full object-cover border-4 border-white shadow-lg'
                    />
                  </div>
                  <div>
                    <h4 className='font-bold text-lg text-gray-900'>{item.name}</h4>
                    <div className='flex items-center'>
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className='text-yellow-400 fill-current' size={12} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className='text-gray-700 leading-relaxed italic mb-4'>{item.text}</p>
                <span
                  className={`inline-block bg-${item.color}-100 text-${item.color}-600 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide`}
                >
                  {item.plan}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Pricing */}
      <section
        id='cta-pricing'
        className='py-24 bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500 relative overflow-hidden'
      >
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl'></div>
          <div className='absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl'></div>
        </div>

        <div className='max-w-5xl mx-auto px-6 text-center relative z-10'>
          <h2 className='text-5xl lg:text-6xl font-bold text-white mb-6'>Hemen Başlayın</h2>
          <p className='text-2xl text-white/90 mb-12 leading-relaxed'>
            İlk 7 gün tamamen ücretsiz! Kredi kartı gerekmez.
          </p>

          <div className='flex flex-col sm:flex-row gap-6 justify-center mb-12'>
            <Link
              href='/register'
              className='bg-white text-rose-500 px-12 py-5 rounded-full font-bold text-xl hover:shadow-2xl transition-all inline-flex items-center justify-center group'
            >
              Ücretsiz Deneyin
              <ArrowRight className='ml-3 group-hover:translate-x-1 transition-transform' size={24} />
            </Link>
            <Link
              href='#demo'
              className='bg-white/10 backdrop-blur-sm text-white border-2 border-white px-12 py-5 rounded-full font-bold text-xl hover:bg-white/20 transition-all inline-flex items-center justify-center'
            >
              <Play className='mr-3 fill-current' size={24} />
              Demo&apos;yu İzle
            </Link>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 text-white/90 max-w-3xl mx-auto'>
            <div className='flex items-center justify-center space-x-3'>
              <Check size={24} />
              <span className='font-medium'>Kredi kartı gerekmez</span>
            </div>
            <div className='flex items-center justify-center space-x-3'>
              <Check size={24} />
              <span className='font-medium'>7 gün ücretsiz</span>
            </div>
            <div className='flex items-center justify-center space-x-3'>
              <Check size={24} />
              <span className='font-medium'>İstediğiniz zaman iptal</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id='footer' className='bg-gray-900 text-white py-16'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-12 mb-12'>
            <div>
              <div className='flex items-center space-x-3 mb-6'>
                <div className='w-12 h-12 bg-gradient-to-br from-rose-primary to-coral-warm rounded-full flex items-center justify-center'>
                  <Heart className='text-white fill-current' size={24} />
                </div>
                <span className='text-2xl font-bold'>Çiftopia</span>
              </div>
              <p className='text-gray-400 leading-relaxed mb-6'>
                Çiftler için özel dijital alan. Anılarınızı, fotoğraflarınızı ve sevginizi bir arada tutun.
              </p>
              <div className='flex space-x-4'>
                <Link
                  href='#'
                  className='w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all'
                >
                  <Instagram size={20} />
                </Link>
                <Link
                  href='#'
                  className='w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all'
                >
                  <Twitter size={20} />
                </Link>
                <Link
                  href='#'
                  className='w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all'
                >
                  <Facebook size={20} />
                </Link>
                <Link
                  href='#'
                  className='w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all'
                >
                  <Youtube size={20} />
                </Link>
              </div>
            </div>

            <div>
              <h4 className='font-bold text-lg mb-4'>Ürün</h4>
              <ul className='space-y-3'>
                <li>
                  <Link href='#features' className='text-gray-400 hover:text-white transition-colors'>
                    Özellikler
                  </Link>
                </li>
                <li>
                  <Link href='#pricing' className='text-gray-400 hover:text-white transition-colors'>
                    Fiyatlandırma
                  </Link>
                </li>
                <li>
                  <Link href='#demo' className='text-gray-400 hover:text-white transition-colors'>
                    Demo
                  </Link>
                </li>
                <li>
                  <Link href='#' className='text-gray-400 hover:text-white transition-colors'>
                    Yol Haritası
                  </Link>
                </li>
                <li>
                  <Link href='#' className='text-gray-400 hover:text-white transition-colors'>
                    Güncellemeler
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className='font-bold text-lg mb-4'>Şirket</h4>
              <ul className='space-y-3'>
                <li>
                  <Link href='#' className='text-gray-400 hover:text-white transition-colors'>
                    Hakkımızda
                  </Link>
                </li>
                <li>
                  <Link href='#' className='text-gray-400 hover:text-white transition-colors'>
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href='#' className='text-gray-400 hover:text-white transition-colors'>
                    Kariyer
                  </Link>
                </li>
                <li>
                  <Link href='#' className='text-gray-400 hover:text-white transition-colors'>
                    Basın Kiti
                  </Link>
                </li>
                <li>
                  <Link href='#' className='text-gray-400 hover:text-white transition-colors'>
                    İletişim
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className='font-bold text-lg mb-4'>Destek</h4>
              <ul className='space-y-3'>
                <li>
                  <Link href='#' className='text-gray-400 hover:text-white transition-colors'>
                    Yardım Merkezi
                  </Link>
                </li>
                <li>
                  <Link href='#' className='text-gray-400 hover:text-white transition-colors'>
                    SSS
                  </Link>
                </li>
                <li>
                  <Link href='#' className='text-gray-400 hover:text-white transition-colors'>
                    Gizlilik Politikası
                  </Link>
                </li>
                <li>
                  <Link href='#' className='text-gray-400 hover:text-white transition-colors'>
                    Kullanım Şartları
                  </Link>
                </li>
                <li>
                  <Link href='#' className='text-gray-400 hover:text-white transition-colors'>
                    KVKK
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className='border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center'>
            <p className='text-gray-400 text-sm mb-4 md:mb-0'>
              © {new Date().getFullYear()} Çiftopia. Tüm hakları saklıdır.
            </p>
            <p className='text-gray-400 text-sm flex items-center'>
              Sevgiyle yapıldı
              <Heart className='text-rose-500 mx-2 animate-pulse fill-current' size={16} />
              Türkiye&apos;de
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
