'use client'

import Link from 'next/link'
import {
  Quote,
  Lightbulb,
  Coffee,
  HeartCrack,
  Infinity,
  Shield,
  Bird,
  TriangleAlert,
  X,
  Clock,
  Heart,
  Pen,
  Info
} from 'lucide-react'

export default function RomanticWordsPage() {
  return (
    <div className='min-h-screen pt-24 pb-12 bg-gray-50'>
      <main className='max-w-7xl mx-auto px-6 py-8'>
        {/* Hero Section */}
        <section className='mb-12'>
          <div className='bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 rounded-[2.5rem] p-12 border-2 border-rose-100 relative overflow-hidden'>
            <div className='absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-rose-200/20 to-purple-200/20 rounded-full blur-3xl'></div>
            <div className='absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-200/20 to-amber-200/20 rounded-full blur-3xl'></div>

            <div className='relative z-10 text-center'>
              <div className='w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-xl mx-auto mb-6'>
                <Quote className='text-white' size={40} />
              </div>
              <h1 className='text-5xl font-bold text-gray-900 mb-4'>Romantik Sözler</h1>
              <p className='text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed'>
                Büyük vaatler ya da abartılı cümleler değil, karşındaki kişiye{' '}
                <strong>görüldüğünü ve düşünüldüğünü</strong> hissettiren, kısa ama yerli yerinde ifadeler.
              </p>
            </div>
          </div>
        </section>

        {/* Definition Section */}
        <section className='mb-12'>
          <div className='bg-white rounded-[2.5rem] shadow-lg p-10'>
            <div className='flex items-start space-x-6'>
              <div className='w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center flex-shrink-0'>
                <Lightbulb className='text-purple-600' size={32} />
              </div>
              <div>
                <h2 className='text-3xl font-bold text-gray-900 mb-4'>Romantik Söz Nedir?</h2>
                <p className='text-gray-700 text-lg leading-relaxed mb-4'>
                  Romantik söz; büyük vaatler ya da abartılı cümleler değildir. Karşındaki kişiye{' '}
                  <strong className='text-rose-600'>görüldüğünü ve düşünüldüğünü</strong> hissettiren, kısa ama yerli
                  yerinde ifadelerdir.
                </p>
                <p className='text-gray-700 text-lg leading-relaxed'>
                  Etkisi uzunluğundan değil, <strong className='text-purple-600'>bağlamından</strong> gelir.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Principles Section */}
        <section className='mb-12'>
          <div className='text-center mb-8'>
            <h2 className='text-4xl font-bold text-gray-900 mb-3'>Etkili Romantik Sözlerin Temel İlkeleri</h2>
            <p className='text-gray-600 text-lg'>Her romantik sözün taşıması gereken dört temel özellik</p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <article className='bg-gradient-to-br from-amber-50 to-orange-50 rounded-[2.5rem] p-8 border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all'>
              <div className='flex items-center space-x-4 mb-6'>
                <div className='w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0'>
                  <span className='text-white font-bold text-2xl'>1</span>
                </div>
                <h3 className='text-2xl font-bold text-gray-900'>Kişisel Olmalı</h3>
              </div>
              <p className='text-gray-700 text-lg leading-relaxed'>
                Herkese söylenebilecek bir cümle romantik değildir.{' '}
                <strong className='text-amber-700'>Sadece ona ait bir detay</strong> içermelidir.
              </p>
            </article>

            <article className='bg-gradient-to-br from-rose-50 to-pink-50 rounded-[2.5rem] p-8 border-2 border-rose-200 shadow-lg hover:shadow-xl transition-all'>
              <div className='flex items-center space-x-4 mb-6'>
                <div className='w-14 h-14 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0'>
                  <span className='text-white font-bold text-2xl'>2</span>
                </div>
                <h3 className='text-2xl font-bold text-gray-900'>Doğal Olmalı</h3>
              </div>
              <p className='text-gray-700 text-lg leading-relaxed'>
                Zorlanmış, süslü ifadeler samimiyeti zedeler. <strong className='text-rose-700'>Günlük dil</strong> çoğu
                zaman daha etkilidir.
              </p>
            </article>

            <article className='bg-gradient-to-br from-purple-50 to-indigo-50 rounded-[2.5rem] p-8 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all'>
              <div className='flex items-center space-x-4 mb-6'>
                <div className='w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0'>
                  <span className='text-white font-bold text-2xl'>3</span>
                </div>
                <h3 className='text-2xl font-bold text-gray-900'>Zamanlaması Doğru Olmalı</h3>
              </div>
              <p className='text-gray-700 text-lg leading-relaxed'>
                Doğru cümle yanlış anda değerini kaybeder.{' '}
                <strong className='text-purple-700'>Sessizlikten sonra, özlem anında</strong> ya da sıradan bir günün
                ortasında söylenen söz daha kalıcı olur.
              </p>
            </article>

            <article className='bg-gradient-to-br from-emerald-50 to-teal-50 rounded-[2.5rem] p-8 border-2 border-emerald-200 shadow-lg hover:shadow-xl transition-all'>
              <div className='flex items-center space-x-4 mb-6'>
                <div className='w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0'>
                  <span className='text-white font-bold text-2xl'>4</span>
                </div>
                <h3 className='text-2xl font-bold text-gray-900'>Beklenti Yaratmamalı</h3>
              </div>
              <p className='text-gray-700 text-lg leading-relaxed'>
                Romantik söz, <strong className='text-emerald-700'>karşılıksız söylenir</strong>. Bir şey talep etmek
                için kullanılmamalıdır.
              </p>
            </article>
          </div>
        </section>

        {/* Types Section */}
        <section className='mb-12'>
          <div className='text-center mb-10'>
            <h2 className='text-4xl font-bold text-gray-900 mb-3'>Romantik Söz Türleri ve Örnekler</h2>
            <p className='text-gray-600 text-lg'>Her durum için uygun romantik ifadeler</p>
          </div>

          <div className='space-y-8'>
            {/* Type 1 */}
            <article className='bg-white rounded-[2.5rem] shadow-lg overflow-hidden border-2 border-amber-100'>
              <div className='bg-gradient-to-r from-amber-500 to-orange-500 p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='text-3xl font-bold text-white mb-2'>1) Sade ve Günlük</h3>
                    <p className='text-amber-50'>Küçük anlara odaklanır, gösterişsizdir.</p>
                  </div>
                  <div className='w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center'>
                    <Coffee className='text-white' size={32} />
                  </div>
                </div>
              </div>
              <div className='p-8'>
                <div className='space-y-4 mb-6'>
                  <div className='flex items-start space-x-4 p-4 bg-amber-50 rounded-2xl'>
                    <Quote className='text-amber-500 text-xl mt-1' size={20} />
                    <p className='text-xl text-gray-800 italic'>&quot;Yanındayken her şey daha az yorucu.&quot;</p>
                  </div>
                  <div className='flex items-start space-x-4 p-4 bg-amber-50 rounded-2xl'>
                    <Quote className='text-amber-500 text-xl mt-1' size={20} />
                    <p className='text-xl text-gray-800 italic'>&quot;Geldiğini duyduğum an ev değişiyor.&quot;</p>
                  </div>
                  <div className='flex items-start space-x-4 p-4 bg-amber-50 rounded-2xl'>
                    <Quote className='text-amber-500 text-xl mt-1' size={20} />
                    <p className='text-xl text-gray-800 italic'>
                      &quot;Bugün seni düşünmek için özel bir sebebim yoktu.&quot;
                    </p>
                  </div>
                </div>
                <div className='bg-amber-100 rounded-2xl p-4 flex items-start space-x-3'>
                  <Clock className='text-amber-600 text-lg mt-1' size={20} />
                  <div>
                    <p className='font-semibold text-amber-900 mb-1'>Ne zaman kullanılır:</p>
                    <p className='text-amber-800'>Günlük mesajlarda, gün sonu notlarında.</p>
                  </div>
                </div>
              </div>
            </article>

            {/* Type 2 */}
            <article className='bg-white rounded-[2.5rem] shadow-lg overflow-hidden border-2 border-rose-100'>
              <div className='bg-gradient-to-r from-rose-500 to-pink-500 p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='text-3xl font-bold text-white mb-2'>2) Özlem ve Mesafe İçeren</h3>
                    <p className='text-rose-50'>Yokluğu sakin bir dille anlatır.</p>
                  </div>
                  <div className='w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center'>
                    <HeartCrack className='text-white' size={32} />
                  </div>
                </div>
              </div>
              <div className='p-8'>
                <div className='space-y-4 mb-6'>
                  <div className='flex items-start space-x-4 p-4 bg-rose-50 rounded-2xl'>
                    <Quote className='text-rose-500 text-xl mt-1' size={20} />
                    <p className='text-xl text-gray-800 italic'>&quot;Yokluğun sessiz değil, eksik.&quot;</p>
                  </div>
                  <div className='flex items-start space-x-4 p-4 bg-rose-50 rounded-2xl'>
                    <Quote className='text-rose-500 text-xl mt-1' size={20} />
                    <p className='text-xl text-gray-800 italic'>&quot;Mesafe var ama aklımın yeri sabit.&quot;</p>
                  </div>
                  <div className='flex items-start space-x-4 p-4 bg-rose-50 rounded-2xl'>
                    <Quote className='text-rose-500 text-xl mt-1' size={20} />
                    <p className='text-xl text-gray-800 italic'>&quot;Yanımda olmasan da günümde yerin var.&quot;</p>
                  </div>
                </div>
                <div className='bg-rose-100 rounded-2xl p-4 flex items-start space-x-3'>
                  <Clock className='text-rose-600 text-lg mt-1' size={20} />
                  <div>
                    <p className='font-semibold text-rose-900 mb-1'>Ne zaman kullanılır:</p>
                    <p className='text-rose-800'>Ayrı olunan günlerde, gece mesajlarında.</p>
                  </div>
                </div>
              </div>
            </article>

            {/* Type 3 */}
            <article className='bg-white rounded-[2.5rem] shadow-lg overflow-hidden border-2 border-purple-100'>
              <div className='bg-gradient-to-r from-purple-500 to-indigo-500 p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='text-3xl font-bold text-white mb-2'>3) Uzun Süreli İlişkilere Özel</h3>
                    <p className='text-purple-50'>Alışkanlıkla karıştırılmayan bağlılığı anlatır.</p>
                  </div>
                  <div className='w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center'>
                    <Infinity className='text-white' size={32} />
                  </div>
                </div>
              </div>
              <div className='p-8'>
                <div className='space-y-4 mb-6'>
                  <div className='flex items-start space-x-4 p-4 bg-purple-50 rounded-2xl'>
                    <Quote className='text-purple-500 text-xl mt-1' size={20} />
                    <p className='text-xl text-gray-800 italic'>
                      &quot;Heyecan bitti sanmıştım, meğer derinleşmiş.&quot;
                    </p>
                  </div>
                  <div className='flex items-start space-x-4 p-4 bg-purple-50 rounded-2xl'>
                    <Quote className='text-purple-500 text-xl mt-1' size={20} />
                    <p className='text-xl text-gray-800 italic'>
                      &quot;Sana alışmadım, seni seçmeye devam ediyorum.&quot;
                    </p>
                  </div>
                  <div className='flex items-start space-x-4 p-4 bg-purple-50 rounded-2xl'>
                    <Quote className='text-purple-500 text-xl mt-1' size={20} />
                    <p className='text-xl text-gray-800 italic'>
                      &quot;Yıllar geçtikçe daha az şaşırıyorum ama daha çok güveniyorum.&quot;
                    </p>
                  </div>
                </div>
                <div className='bg-purple-100 rounded-2xl p-4 flex items-start space-x-3'>
                  <Clock className='text-purple-600 text-lg mt-1' size={20} />
                  <div>
                    <p className='font-semibold text-purple-900 mb-1'>Ne zaman kullanılır:</p>
                    <p className='text-purple-800'>Yıldönümleri, zor dönem sonrası.</p>
                  </div>
                </div>
              </div>
            </article>

            {/* Type 4 */}
            <article className='bg-white rounded-[2.5rem] shadow-lg overflow-hidden border-2 border-blue-100'>
              <div className='bg-gradient-to-r from-blue-500 to-cyan-500 p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='text-3xl font-bold text-white mb-2'>4) Güven ve Huzur Odaklı</h3>
                    <p className='text-blue-50'>Aşkı sakinlik üzerinden tanımlar.</p>
                  </div>
                  <div className='w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center'>
                    <Shield className='text-white' size={32} />
                  </div>
                </div>
              </div>
              <div className='p-8'>
                <div className='space-y-4 mb-6'>
                  <div className='flex items-start space-x-4 p-4 bg-blue-50 rounded-2xl'>
                    <Quote className='text-blue-500 text-xl mt-1' size={20} />
                    <p className='text-xl text-gray-800 italic'>&quot;Yanında savunmam düşüyor.&quot;</p>
                  </div>
                  <div className='flex items-start space-x-4 p-4 bg-blue-50 rounded-2xl'>
                    <Quote className='text-blue-500 text-xl mt-1' size={20} />
                    <p className='text-xl text-gray-800 italic'>&quot;Sana anlatmadığım bir şey kalmadı.&quot;</p>
                  </div>
                  <div className='flex items-start space-x-4 p-4 bg-blue-50 rounded-2xl'>
                    <Quote className='text-blue-500 text-xl mt-1' size={20} />
                    <p className='text-xl text-gray-800 italic'>
                      &quot;Dünyayı çözmüyorum ama sen varken durabiliyorum.&quot;
                    </p>
                  </div>
                </div>
                <div className='bg-blue-100 rounded-2xl p-4 flex items-start space-x-3'>
                  <Clock className='text-blue-600 text-lg mt-1' size={20} />
                  <div>
                    <p className='font-semibold text-blue-900 mb-1'>Ne zaman kullanılır:</p>
                    <p className='text-blue-800'>Duygusal yakınlık anlarında.</p>
                  </div>
                </div>
              </div>
            </article>

            {/* Type 5 */}
            <article className='bg-white rounded-[2.5rem] shadow-lg overflow-hidden border-2 border-emerald-100'>
              <div className='bg-gradient-to-r from-emerald-500 to-teal-500 p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='text-3xl font-bold text-white mb-2'>5) Kırılgan ve Dürüst</h3>
                    <p className='text-emerald-50'>Kusursuzluğu değil, açıklığı öne çıkarır.</p>
                  </div>
                  <div className='w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center'>
                    <Bird className='text-white' size={32} />
                  </div>
                </div>
              </div>
              <div className='p-8'>
                <div className='space-y-4 mb-6'>
                  <div className='flex items-start space-x-4 p-4 bg-emerald-50 rounded-2xl'>
                    <Quote className='text-emerald-500 text-xl mt-1' size={20} />
                    <p className='text-xl text-gray-800 italic'>
                      &quot;Bazen ne hissettiğimi ben bile bilmiyorum ama sana yakın.&quot;
                    </p>
                  </div>
                  <div className='flex items-start space-x-4 p-4 bg-emerald-50 rounded-2xl'>
                    <Quote className='text-emerald-500 text-xl mt-1' size={20} />
                    <p className='text-xl text-gray-800 italic'>
                      &quot;Her zaman iyi değilim, ama seninle daha dürüstüm.&quot;
                    </p>
                  </div>
                  <div className='flex items-start space-x-4 p-4 bg-emerald-50 rounded-2xl'>
                    <Quote className='text-emerald-500 text-xl mt-1' size={20} />
                    <p className='text-xl text-gray-800 italic'>
                      &quot;Beni en çok rahat hissettiren şey, senden saklanmamak.&quot;
                    </p>
                  </div>
                </div>
                <div className='bg-emerald-100 rounded-2xl p-4 flex items-start space-x-3'>
                  <Clock className='text-emerald-600 text-lg mt-1' size={20} />
                  <div>
                    <p className='font-semibold text-emerald-900 mb-1'>Ne zaman kullanılır:</p>
                    <p className='text-emerald-800'>Derin konuşmalar, yazılı paylaşımlar.</p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* Avoid Section */}
        <section className='mb-12'>
          <div className='bg-gradient-to-br from-red-50 to-orange-50 rounded-[2.5rem] p-10 border-2 border-red-200'>
            <div className='flex items-start space-x-6'>
              <div className='w-16 h-16 bg-red-500 rounded-3xl flex items-center justify-center flex-shrink-0'>
                <TriangleAlert className='text-white' size={32} />
              </div>
              <div className='flex-1'>
                <h2 className='text-3xl font-bold text-gray-900 mb-6'>Kaçınılması Gerekenler</h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='flex items-center space-x-3 p-4 bg-white rounded-2xl'>
                    <X className='text-red-500' size={24} />
                    <p className='text-gray-800 font-medium'>Klişe ifadeleri birebir kullanmak</p>
                  </div>
                  <div className='flex items-center space-x-3 p-4 bg-white rounded-2xl'>
                    <X className='text-red-500' size={24} />
                    <p className='text-gray-800 font-medium'>Sürekli romantik olmaya çalışmak</p>
                  </div>
                  <div className='flex items-center space-x-3 p-4 bg-white rounded-2xl'>
                    <X className='text-red-500' size={24} />
                    <p className='text-gray-800 font-medium'>Duyguyu olduğundan büyük göstermek</p>
                  </div>
                  <div className='flex items-center space-x-3 p-4 bg-white rounded-2xl'>
                    <X className='text-red-500' size={24} />
                    <p className='text-gray-800 font-medium'>Karşılık bekleyen cümleler kurmak</p>
                  </div>
                </div>
                <div className='mt-6 p-4 bg-red-100 rounded-2xl'>
                  <p className='text-red-900 font-semibold flex items-center'>
                    <Info className='mr-2' size={20} />
                    Romantik söz etkisini <strong>seyrek ama yerinde</strong> kullanıldığında gösterir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final Note Section */}
        <section className='mb-12'>
          <div className='bg-white rounded-[2.5rem] shadow-lg p-10 border-2 border-gray-100'>
            <div className='max-w-4xl mx-auto text-center'>
              <div className='w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6'>
                <Heart className='text-white' size={32} fill='currentColor' />
              </div>
              <h2 className='text-3xl font-bold text-gray-900 mb-4'>Son Not</h2>
              <p className='text-gray-700 text-xl leading-relaxed mb-6'>
                Romantik sözlerin gücü edebî olmasında değil,{' '}
                <strong className='text-rose-600'>tanıdık gelmesindedir</strong>.
              </p>
              <div className='bg-gradient-to-r from-rose-50 to-pink-50 rounded-3xl p-6 border-2 border-rose-100'>
                <p className='text-gray-800 text-lg font-medium'>
                  Okuyan kişi{' '}
                  <span className='text-xl text-rose-600 italic'>&quot;bunu biri bana yazmış olabilir&quot;</span>{' '}
                  diyorsa, metin çalışıyordur.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className='mb-12'>
          <div className='bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-[2.5rem] p-12 text-center text-white shadow-2xl relative overflow-hidden'>
            <div className='absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl'></div>
            <div className='absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl'></div>

            <div className='relative z-10'>
              <h2 className='text-4xl font-bold mb-4'>Kendi Romantik Sözlerinizi Yazın</h2>
              <p className='text-xl mb-8 text-white/90'>Sevgilinize özel, samimi ve anlamlı mesajlar oluşturun</p>
              <Link
                href='/poems'
                className='bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center space-x-2'
              >
                <Pen size={20} />
                <span>Şiir Yaz</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
