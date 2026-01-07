'use client'

import React from 'react'
import Link from 'next/link'
import {
  Pen,
  Lightbulb,
  Info,
  Eye,
  Search,
  Link as LinkIcon,
  Volume2,
  Scissors,
  Drum,
  Minimize2,
  Bolt,
  Mic,
  Shapes,
  User,
  Lock,
  PenSquare,
  Users,
  Rocket,
  Check,
  Quote as QuoteIcon
} from 'lucide-react'
export default function PoemTipsPage() {
  return (
    <div className='min-h-screen pt-24 pb-12 bg-gray-50'>
      <main className='max-w-7xl mx-auto px-6 py-8'>
        {/* Hero Section */}
        <section className='mb-12'>
          <div className='bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 rounded-[2.5rem] p-12 relative overflow-hidden'>
            <div className='absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl'></div>
            <div className='absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl'></div>

            <div className='relative z-10 text-center text-white'>
              <div className='w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6'>
                <Pen size={48} className='text-white' />
              </div>
              <h1 className='text-5xl font-bold mb-4'>Şiir Yazma İpuçları</h1>
              <p className='text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8'>
                Duygularınızı en güzel şekilde ifade etmek için pratik ve etkili teknikler. Her madde, neden işe
                yaradığını ve nasıl uygulayacağınızı açıklıyor.
              </p>
              <div className='inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full'>
                <Lightbulb className='text-yellow-300' size={20} />
                <span className='font-semibold'>13 Pratik Teknik</span>
              </div>
            </div>
          </div>
        </section>

        {/* Intro Section */}
        <section className='mb-12'>
          <div className='bg-white rounded-[2.5rem] shadow-lg p-8'>
            <div className='flex items-start space-x-4'>
              <div className='w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0'>
                <Info className='text-white' size={24} />
              </div>
              <div>
                <h2 className='text-2xl font-bold text-gray-900 mb-3'>Başlamadan Önce</h2>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  Aşağıdaki tekniklerin hepsi pratik olarak kanıtlanmış ve doğrudan uygulanabilir yöntemlerdir. Her
                  tekniğin yanında <strong>neden işe yaradığını</strong> ve <strong>nasıl uygulayacağınızı</strong>{' '}
                  bulacaksınız.
                </p>
                <p className='text-gray-700 leading-relaxed'>
                  İyi şiir yazmak bir yetenek değil, <strong>öğrenilebilir bir beceridir</strong>. Bu teknikleri
                  deneyerek ve pratik yaparak gelişebilirsiniz.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Techniques Section */}
        <section className='mb-12'>
          <div className='grid grid-cols-1 gap-6'>
            {/* Technique 1 */}
            <article className='bg-white rounded-[2.5rem] shadow-lg overflow-hidden hover:shadow-xl transition-all'>
              <div className='bg-gradient-to-r from-purple-500 to-pink-500 p-6'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center'>
                      <Eye className='text-white' size={24} />
                    </div>
                    <h3 className='text-2xl font-bold text-white'>1. Somut İmgeler Kullan (Show, Don&apos;t Tell)</h3>
                  </div>
                  <span className='px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold'>
                    Temel
                  </span>
                </div>
              </div>
              <div className='p-8'>
                <div className='mb-6'>
                  <h4 className='font-bold text-lg text-gray-900 mb-3 flex items-center'>
                    <span className='text-purple-500 mr-2'>❓</span>
                    Neden İşe Yarar?
                  </h4>
                  <p className='text-gray-700 leading-relaxed'>
                    Soyut duyguyu somut bir görüntüyle hissettirir; okuyucu zihninde sahne kurar ve duyguyu daha
                    derinden yaşar. &quot;Özledim&quot; demek yerine somut bir detay vermek, duyguyu kanıtlar.
                  </p>
                </div>
                <div className='bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-2xl mb-6'>
                  <h4 className='font-bold text-lg text-gray-900 mb-3 flex items-center'>
                    <Lightbulb className='text-amber-500 mr-2' size={20} />
                    Nasıl Uygularım?
                  </h4>
                  <p className='text-gray-700 leading-relaxed mb-4'>
                    <strong>&quot;Özledim&quot;</strong> yazmak yerine:
                    <br />
                    <span className='text-xl text-gray-800 block mt-2 italic'>
                      Yastığın sol yanındaki gömlek hâlâ senin kokunu taşır
                    </span>
                  </p>
                  <div className='bg-white rounded-2xl p-4 mt-4'>
                    <p className='text-sm text-gray-600 mb-2'>
                      <strong>Kötü örnek:</strong>
                    </p>
                    <p className='text-gray-700 italic'>&quot;Seni çok özledim, her an aklımdasın&quot;</p>
                    <p className='text-sm text-gray-600 mt-4 mb-2'>
                      <strong>İyi örnek:</strong>
                    </p>
                    <p className='text-gray-700 italic'>
                      &quot;Kahve fincanında kalan dudak izi, sabahın 8&apos;inde hâlâ sıcak&quot;
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-3 text-sm text-gray-600'>
                  <span className='font-semibold'>Zorluk:</span>
                  <span>Başlangıç</span>
                  <span className='mx-2'>•</span>
                  <span>Pratik süresi: 10 dakika/gün</span>
                </div>
              </div>
            </article>

            {/* Technique 2 */}
            <article className='bg-white rounded-[2.5rem] shadow-lg overflow-hidden hover:shadow-xl transition-all'>
              <div className='bg-gradient-to-r from-rose-500 to-pink-500 p-6'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center'>
                      <Search className='text-white' size={24} />
                    </div>
                    <h3 className='text-2xl font-bold text-white'>2. Spesifiklik / Detay</h3>
                  </div>
                  <span className='px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold'>
                    Temel
                  </span>
                </div>
              </div>
              <div className='p-8'>
                <div className='mb-6'>
                  <h4 className='font-bold text-lg text-gray-900 mb-3 flex items-center'>
                    <span className='text-rose-500 mr-2'>❓</span>
                    Neden İşe Yarar?
                  </h4>
                  <p className='text-gray-700 leading-relaxed'>
                    Genel ifadeler unutulur; spesifik detaylar akılda kalır ve inanırlığı artırır. Okuyucu &quot;bu
                    gerçek bir anı&quot; hisseder.
                  </p>
                </div>
                <div className='bg-rose-50 border-l-4 border-rose-500 p-6 rounded-r-2xl mb-6'>
                  <h4 className='font-bold text-lg text-gray-900 mb-3 flex items-center'>
                    <Lightbulb className='text-rose-500 mr-2' size={20} />
                    Nasıl Uygularım?
                  </h4>
                  <p className='text-gray-700 leading-relaxed mb-4'>
                    <strong>&quot;Çiçek&quot;</strong> yerine <strong>&quot; köşedeki mor manolya&quot;</strong> gibi
                    spesifik seç.
                  </p>
                  <div className='bg-white rounded-2xl p-4 mt-4'>
                    <p className='text-sm text-gray-600 mb-2'>
                      <strong>Genel:</strong>
                    </p>
                    <p className='text-gray-700 italic'>&quot;Bir restoranda buluştuk&quot;</p>
                    <p className='text-sm text-gray-600 mt-4 mb-2'>
                      <strong>Spesifik:</strong>
                    </p>
                    <p className='text-gray-700 italic'>
                      &quot;Kadıköy&apos;deki o kırmızı tente altında, garsonun adı Mehmet&apos;ti&quot;
                    </p>
                  </div>
                </div>
                <div className='bg-blue-50 rounded-2xl p-4'>
                  <p className='text-sm font-semibold text-blue-900 mb-2'>💡 Pro İpucu:</p>
                  <p className='text-sm text-blue-800'>
                    5 duyu organını kullan: görme, işitme, dokunma, tatma, koklama. Spesifik detaylar bu duyulardan
                    gelir.
                  </p>
                </div>
              </div>
            </article>

            {/* Technique 3 */}
            <article className='bg-white rounded-[2.5rem] shadow-lg overflow-hidden hover:shadow-xl transition-all'>
              <div className='bg-gradient-to-r from-indigo-500 to-purple-500 p-6'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center'>
                      <LinkIcon className='text-white' size={24} />
                    </div>
                    <h3 className='text-2xl font-bold text-white'>3. Metafor ve Benzetme</h3>
                  </div>
                  <span className='px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold'>
                    Orta
                  </span>
                </div>
              </div>
              <div className='p-8'>
                <div className='mb-6'>
                  <h4 className='font-bold text-lg text-gray-900 mb-3 flex items-center'>
                    <span className='text-indigo-500 mr-2'>❓</span>
                    Neden İşe Yarar?
                  </h4>
                  <p className='text-gray-700 leading-relaxed'>
                    Bir duyguya yeni bir ilişki kurar, anlamı derinleştirir ve beklenmedik bağlantılar okuyucuyu
                    şaşırtır.
                  </p>
                </div>
                <div className='bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-r-2xl mb-6'>
                  <h4 className='font-bold text-lg text-gray-900 mb-3 flex items-center'>
                    <Lightbulb className='text-indigo-500 mr-2' size={20} />
                    Nasıl Uygularım?
                  </h4>
                  <p className='text-gray-700 leading-relaxed mb-4'>
                    Bir satırda beklenmeyeni bağla:
                    <span className='text-xl text-gray-800 block mt-2 italic'>
                      &quot;Sessizlik bir cezve gibi tıkalı&quot;
                    </span>
                  </p>
                  <div className='bg-white rounded-2xl p-4 mt-4'>
                    <p className='text-sm text-gray-600 mb-3'>
                      <strong>Daha fazla örnek:</strong>
                    </p>
                    <ul className='space-y-2 text-gray-700'>
                      <li className='flex items-start'>
                        <QuoteIcon className='text-indigo-400 mr-2 mt-1' size={16} />
                        <span className='italic'>&quot;Gözlerin iki derin kuyu, içinde kayboluyorum&quot;</span>
                      </li>
                      <li className='flex items-start'>
                        <QuoteIcon className='text-indigo-400 mr-2 mt-1' size={16} />
                        <span className='italic'>&quot;Aşkımız bir fırtına, her şeyi yerinden söküyor&quot;</span>
                      </li>
                      <li className='flex items-start'>
                        <QuoteIcon className='text-indigo-400 mr-2 mt-1' size={16} />
                        <span className='italic'>&quot;Yalnızlık, boğazıma dolanan bir eşarp&quot;</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className='bg-amber-50 rounded-2xl p-4'>
                  <p className='text-sm font-semibold text-amber-900 mb-2'>⚠️ Dikkat:</p>
                  <p className='text-sm text-amber-800'>
                    Klişe metaforlardan kaçın: &quot;güneş gibi&quot;, &quot;ay gibi&quot;, &quot;yıldız gibi&quot;.
                    Kendi özgün benzetmelerinizi bulun.
                  </p>
                </div>
              </div>
            </article>

            {/* Technique 4 */}
            <article className='bg-white rounded-[2.5rem] shadow-lg overflow-hidden hover:shadow-xl transition-all'>
              <div className='bg-gradient-to-r from-blue-500 to-cyan-500 p-6'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center'>
                      <Volume2 className='text-white' size={24} />
                    </div>
                    <h3 className='text-2xl font-bold text-white'>4. Sesten Yararlan</h3>
                  </div>
                  <span className='px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold'>
                    İleri
                  </span>
                </div>
              </div>
              <div className='p-8'>
                <div className='mb-6'>
                  <h4 className='font-bold text-lg text-gray-900 mb-3 flex items-center'>
                    <span className='text-blue-500 mr-2'>❓</span>
                    Neden İşe Yarar?
                  </h4>
                  <p className='text-gray-700 leading-relaxed'>
                    Sözcüklerin sesi ritim ve duyguyu güçlendirir; okunuşta etkili olur. Ses tekrarları şiire müzikalite
                    katar.
                  </p>
                </div>
                <div className='bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-2xl mb-6'>
                  <h4 className='font-bold text-lg text-gray-900 mb-3 flex items-center'>
                    <Lightbulb className='text-blue-500 mr-2' size={20} />
                    Nasıl Uygularım?
                  </h4>
                  <p className='text-gray-700 leading-relaxed mb-4'>
                    Aynı ünlü/ünsüz tekrarı dene; yüksek sesle oku ve hangi sesler işliyor gözle.
                  </p>
                  <div className='bg-white rounded-2xl p-4 mt-4'>
                    <p className='text-sm text-gray-600 mb-3'>
                      <strong>Teknikler:</strong>
                    </p>
                    <div className='space-y-4'>
                      <div>
                        <p className='font-semibold text-gray-900 mb-1'>Aliterasyon (ünsüz tekrarı):</p>
                        <p className='text-gray-700 italic'>&quot;Sessiz seher vakti, serin rüzgar&quot;</p>
                      </div>
                      <div>
                        <p className='font-semibold text-gray-900 mb-1'>Asonans (ünlü tekrarı):</p>
                        <p className='text-gray-700 italic'>&quot;Uzak yollar, kara bulutlar&quot;</p>
                      </div>
                      <div>
                        <p className='font-semibold text-gray-900 mb-1'>Onomatope (ses taklidi):</p>
                        <p className='text-gray-700 italic'>&quot;Yağmur tıkırdıyor cama, şıpır şıpır&quot;</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='bg-green-50 rounded-2xl p-4'>
                  <p className='text-sm font-semibold text-green-900 mb-2'>✅ Pratik Egzersiz:</p>
                  <p className='text-sm text-green-800'>
                    Şiirinizi mutlaka yüksek sesle okuyun. Takılan, zorlanan yerler varsa orayı düzeltin.
                  </p>
                </div>
              </div>
            </article>

            {/* Technique 5 */}
            <article className='bg-white rounded-[2.5rem] shadow-lg overflow-hidden hover:shadow-xl transition-all'>
              <div className='bg-gradient-to-r from-emerald-500 to-teal-500 p-6'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center'>
                      <Scissors className='text-white' size={24} />
                    </div>
                    <h3 className='text-2xl font-bold text-white'>5. Satır Kırılması ve Enjambment</h3>
                  </div>
                  <span className='px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold'>
                    İleri
                  </span>
                </div>
              </div>
              <div className='p-8'>
                <div className='mb-6'>
                  <h4 className='font-bold text-lg text-gray-900 mb-3 flex items-center'>
                    <span className='text-emerald-500 mr-2'>❓</span>
                    Neden İşe Yarar?
                  </h4>
                  <p className='text-gray-700 leading-relaxed'>
                    Beklenti ve vurgu oluşturur; hız ve akışı kontrol eder. Satırın nerede bittiği anlamı değiştirir.
                  </p>
                </div>
                <div className='bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-r-2xl mb-6'>
                  <h4 className='font-bold text-lg text-gray-900 mb-3 flex items-center'>
                    <Lightbulb className='text-emerald-500 mr-2' size={20} />
                    Nasıl Uygularım?
                  </h4>
                  <p className='text-gray-700 leading-relaxed mb-4'>
                    Cümlenin bir bölümünü alt satıra geçirip bekletmenin etkisini test et.
                  </p>
                  <div className='bg-white rounded-2xl p-4 mt-4'>
                    <div className='grid grid-cols-2 gap-6'>
                      <div>
                        <p className='text-sm text-gray-600 mb-2'>
                          <strong>Düz:</strong>
                        </p>
                        <p className='text-gray-700 leading-relaxed'>&quot;Seni seviyorum ve sensiz yaşayamam&quot;</p>
                      </div>
                      <div>
                        <p className='text-sm text-gray-600 mb-2'>
                          <strong>Kırılmış:</strong>
                        </p>
                        <p className='text-gray-700 leading-relaxed'>
                          &quot;Seni seviyorum
                          <br />
                          ve sensiz
                          <br />
                          yaşayamam&quot;
                        </p>
                      </div>
                    </div>
                    <p className='text-sm text-gray-600 mt-4 italic'>
                      Kırılmış versiyonda her satır vurgu kazanır ve okuyucu bekler.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* Technique 6 */}
            <article className='bg-white rounded-[2.5rem] shadow-lg overflow-hidden hover:shadow-xl transition-all'>
              <div className='bg-gradient-to-r from-violet-500 to-purple-500 p-6'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center'>
                      <Drum className='text-white' size={24} />
                    </div>
                    <h3 className='text-2xl font-bold text-white'>6. Ritim ve Ölçü</h3>
                  </div>
                  <span className='px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold'>
                    Orta
                  </span>
                </div>
              </div>
              <div className='p-8'>
                <div className='mb-6'>
                  <h4 className='font-bold text-lg text-gray-900 mb-3 flex items-center'>
                    <span className='text-violet-500 mr-2'>❓</span>
                    Neden İşe Yarar?
                  </h4>
                  <p className='text-gray-700 leading-relaxed'>
                    Ritim duyguyu taşır; serbest şiirde bile doğal bir akış aranmalı. Müzik gibi akar.
                  </p>
                </div>
                <div className='bg-violet-50 border-l-4 border-violet-500 p-6 rounded-r-2xl mb-6'>
                  <h4 className='font-bold text-lg text-gray-900 mb-3 flex items-center'>
                    <Lightbulb className='text-violet-500 mr-2' size={20} />
                    Nasıl Uygularım?
                  </h4>
                  <p className='text-gray-700 leading-relaxed mb-4'>
                    Dizeleri yüksek sesle okuyup takılma/akış bozukluğunu düzelt. Ritim doğal gelmeli.
                  </p>
                  <div className='bg-white rounded-2xl p-4 mt-4'>
                    <p className='text-sm text-gray-600 mb-2'>
                      <strong>İyi ritim örneği:</strong>
                    </p>
                    <p className='text-gray-700 leading-relaxed text-lg italic'>
                      &quot;Gel yanıma, dur yanımda
                      <br />
                      Bırakma elimi, tut sıkıca
                      <br />
                      Seninle ben, ben seninle
                      <br />
                      Sonsuza kadar böyle&quot;
                    </p>
                    <p className='text-sm text-gray-600 mt-4 italic'>
                      Her satırda benzer hece sayısı ve vurgu ritmi var.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* Technique 7 */}
            <article className='bg-white rounded-[2.5rem] shadow-lg overflow-hidden hover:shadow-xl transition-all'>
              <div className='bg-gradient-to-r from-red-500 to-orange-500 p-6'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center'>
                      <Minimize2 className='text-white' size={24} />
                    </div>
                    <h3 className='text-2xl font-bold text-white'>7. Azla Çok Anlatma — Ekonomi</h3>
                  </div>
                  <span className='px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold'>
                    Kritik
                  </span>
                </div>
              </div>
              <div className='p-8'>
                <div className='mb-6'>
                  <h4 className='font-bold text-lg text-gray-900 mb-3 flex items-center'>
                    <span className='text-red-500 mr-2'>❓</span>
                    Neden İşe Yarar?
                  </h4>
                  <p className='text-gray-700 leading-relaxed'>
                    Fazla kelime duyguyu dağıtır; keskin, kısa dize daha kalıcı olabilir. Her kelime değerli olmalı.
                  </p>
                </div>
                <div className='bg-red-50 border-l-4 border-red-500 p-6 rounded-r-2xl mb-6'>
                  <h4 className='font-bold text-lg text-gray-900 mb-3 flex items-center'>
                    <Lightbulb className='text-red-500 mr-2' size={20} />
                    Nasıl Uygularım?
                  </h4>
                  <p className='text-gray-700 leading-relaxed mb-4'>
                    İlk taslaktan sonra <strong>yüzde 20–40 kelime silmeyi dene</strong>. Gereksiz sıfatları, dolgu
                    kelimeleri at.
                  </p>
                  <div className='bg-white rounded-2xl p-4 mt-4'>
                    <div className='space-y-4'>
                      <div>
                        <p className='text-sm text-red-600 mb-2'>
                          <strong>❌ Fazla kelime:</strong>
                        </p>
                        <p className='text-gray-700'>
                          &quot;Seni çok ama çok fazla seviyorum ve sensiz hiçbir şekilde yaşayamam&quot;
                        </p>
                      </div>
                      <div>
                        <p className='text-sm text-green-600 mb-2'>
                          <strong>✅ Ekonomik:</strong>
                        </p>
                        <p className='text-gray-700'>&quot;Sensiz yaşayamam&quot;</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='bg-amber-50 rounded-2xl p-4'>
                  <p className='text-sm font-semibold text-amber-900 mb-2'>📝 Editasyon Kuralı:</p>
                  <p className='text-sm text-amber-800'>
                    &quot;Bir kelime çıkarıldığında anlam değişmiyorsa, o kelime gereksizdir.&quot;
                  </p>
                </div>
              </div>
            </article>

            {/* Technique 8 */}
            <article className='bg-white rounded-[2.5rem] shadow-lg overflow-hidden hover:shadow-xl transition-all'>
              <div className='bg-gradient-to-r from-fuchsia-500 to-pink-500 p-6'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center'>
                      <Bolt className='text-white' size={24} />
                    </div>
                    <h3 className='text-2xl font-bold text-white'>8. Beklenti Kırma / Ters Köşe</h3>
                  </div>
                  <span className='px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold'>
                    İleri
                  </span>
                </div>
              </div>
              <div className='p-8'>
                <div className='mb-6'>
                  <h4 className='font-bold text-lg text-gray-900 mb-3 flex items-center'>
                    <span className='text-fuchsia-500 mr-2'>❓</span>
                    Neden İşe Yarar?
                  </h4>
                  <p className='text-gray-700 leading-relaxed'>
                    Alışılmış ifadeyi kırmak dikkat çeker, anlamda yeni katmanlar açar. Okuyucu şaşırır ve düşünür.
                  </p>
                </div>
                <div className='bg-fuchsia-50 border-l-4 border-fuchsia-500 p-6 rounded-r-2xl mb-6'>
                  <h4 className='font-bold text-lg text-gray-900 mb-3 flex items-center'>
                    <Lightbulb className='text-fuchsia-500 mr-2' size={20} />
                    Nasıl Uygularım?
                  </h4>
                  <p className='text-gray-700 leading-relaxed mb-4'>Klişeyi al, sonunu değiştirerek şaşırt.</p>
                  <div className='bg-white rounded-2xl p-4 mt-4'>
                    <div className='space-y-4'>
                      <div>
                        <p className='text-sm text-gray-600 mb-2'>
                          <strong>Klişe:</strong>
                        </p>
                        <p className='text-gray-700 italic'>&quot;Gözlerin yıldız gibi parlıyor&quot;</p>
                      </div>
                      <div>
                        <p className='text-sm text-gray-600 mb-2'>
                          <strong>Ters köşe:</strong>
                        </p>
                        <p className='text-gray-700 italic'>
                          &quot;Gözlerin yıldız gibi parlıyor, ama ben karanlığı seviyorum&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Technique 9 */}
            <article className='bg-white rounded-[2.5rem] shadow-lg overflow-hidden hover:shadow-xl transition-all'>
              <div className='bg-gradient-to-r from-cyan-500 to-blue-500 p-6'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center'>
                      <Mic className='text-white' size={24} />
                    </div>
                    <h3 className='text-2xl font-bold text-white'>9. Seslendirme ile Düzenleme</h3>
                  </div>
                  <span className='px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold'>
                    Kritik
                  </span>
                </div>
              </div>
              <div className='p-8'>
                <div className='mb-6'>
                  <h4 className='font-bold text-lg text-gray-900 mb-3 flex items-center'>
                    <span className='text-cyan-500 mr-2'>❓</span>
                    Neden İşe Yarar?
                  </h4>
                  <p className='text-gray-700 leading-relaxed'>
                    Yazılı metin farklı okunur; yüksek sesle okumak hataları ve güçlü dizeleri ortaya çıkarır.
                  </p>
                </div>
                <div className='bg-cyan-50 border-l-4 border-cyan-500 p-6 rounded-r-2xl mb-6'>
                  <h4 className='font-bold text-lg text-gray-900 mb-3 flex items-center'>
                    <Lightbulb className='text-cyan-500 mr-2' size={20} />
                    Nasıl Uygularım?
                  </h4>
                  <p className='text-gray-700 leading-relaxed mb-4'>
                    <strong>Her revizyonda şiiri en az bir kez yüksek sesle oku.</strong> Takıldığın yerleri işaretle.
                  </p>
                  <div className='bg-white rounded-2xl p-4 mt-4'>
                    <p className='text-sm text-gray-600 mb-3'>
                      <strong>Nelere dikkat et:</strong>
                    </p>
                    <ul className='space-y-2 text-gray-700'>
                      <li className='flex items-start'>
                        <Check className='text-cyan-500 mr-2 mt-1' size={16} />
                        <span>Nefes alacak yer var mı?</span>
                      </li>
                      <li className='flex items-start'>
                        <Check className='text-cyan-500 mr-2 mt-1' size={16} />
                        <span>Ritim doğal akıyor mu?</span>
                      </li>
                      <li className='flex items-start'>
                        <Check className='text-cyan-500 mr-2 mt-1' size={16} />
                        <span>Hangi kelimeler vurgulanıyor?</span>
                      </li>
                      <li className='flex items-start'>
                        <Check className='text-cyan-500 mr-2 mt-1' size={16} />
                        <span>Ses güzel mi, yoksa tıkanıyor mu?</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className='bg-green-50 rounded-2xl p-4'>
                  <p className='text-sm font-semibold text-green-900 mb-2'>🎯 Altın Kural:</p>
                  <p className='text-sm text-green-800'>&quot;Şiir kulağa yazılır, göze değil.&quot;</p>
                </div>
              </div>
            </article>

            {/* Technique 10 */}
            <article className='bg-white rounded-[2.5rem] shadow-lg overflow-hidden hover:shadow-xl transition-all'>
              <div className='bg-gradient-to-r from-lime-500 to-green-500 p-6'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center'>
                      <Shapes className='text-white' size={24} />
                    </div>
                    <h3 className='text-2xl font-bold text-white'>10. Görsel/Format Oyunları</h3>
                  </div>
                  <span className='px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold'>
                    Deneysel
                  </span>
                </div>
              </div>
              <div className='p-8'>
                <div className='mb-6'>
                  <h4 className='font-bold text-lg text-gray-900 mb-3 flex items-center'>
                    <span className='text-lime-500 mr-2'>❓</span>
                    Neden İşe Yarar?
                  </h4>
                  <p className='text-gray-700 leading-relaxed'>
                    Görsel sunum duyguyu ve tempo algısını etkiler. Şekil şiiri, beyaz boşluk kullanımı anlam katabilir.
                  </p>
                </div>
                <div className='bg-lime-50 border-l-4 border-lime-500 p-6 rounded-r-2xl mb-6'>
                  <h4 className='font-bold text-lg text-gray-900 mb-3 flex items-center'>
                    <Lightbulb className='text-lime-500 mr-2' size={20} />
                    Nasıl Uygularım?
                  </h4>
                  <p className='text-gray-700 leading-relaxed mb-4'>
                    Bir kısa şiiri farklı satır uzunluklarıyla dene; boşlukların etkisini not et.
                  </p>
                  <div className='bg-white rounded-2xl p-4 mt-4'>
                    <p className='text-sm text-gray-600 mb-3'>
                      <strong>Örnek - Kalp şeklinde şiir:</strong>
                    </p>
                    <div className='text-center text-lg text-gray-800 leading-relaxed italic'>
                      <p>Sen</p>
                      <p>benim</p>
                      <p>kalbimsin</p>
                      <p>her atışımda</p>
                      <p>varsın</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Technique 11 */}
            <article className='bg-white rounded-[2.5rem] shadow-lg overflow-hidden hover:shadow-xl transition-all'>
              <div className='bg-gradient-to-r from-amber-500 to-yellow-500 p-6'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center'>
                      <User className='text-white' size={24} />
                    </div>
                    <h3 className='text-2xl font-bold text-white'>11. Bakış Açısı / Ses (Voice)</h3>
                  </div>
                  <span className='px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold'>
                    Orta
                  </span>
                </div>
              </div>
              <div className='p-8'>
                <div className='mb-6'>
                  <h4 className='font-bold text-lg text-gray-900 mb-3 flex items-center'>
                    <span className='text-amber-500 mr-2'>❓</span>
                    Neden İşe Yarar?
                  </h4>
                  <p className='text-gray-700 leading-relaxed'>
                    Samimiyet ve inandırıcılık büyük oranda anlatanın sesiyle belirlenir. Kim konuşuyor?
                  </p>
                </div>
                <div className='bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-2xl mb-6'>
                  <h4 className='font-bold text-lg text-gray-900 mb-3 flex items-center'>
                    <Lightbulb className='text-amber-500 mr-2' size={20} />
                    Nasıl Uygularım?
                  </h4>
                  <p className='text-gray-700 leading-relaxed mb-4'>
                    Aynı olayı <strong>&quot;ben&quot;, &quot;sen&quot;, &quot;o&quot;</strong> perspektifleriyle yazıp
                    etkisini karşılaştır.
                  </p>
                  <div className='bg-white rounded-2xl p-4 mt-4'>
                    <div className='space-y-4'>
                      <div>
                        <p className='text-sm font-semibold text-amber-700 mb-1'>Ben dilinde:</p>
                        <p className='text-gray-700 italic'>&quot;Seni özledim, geri dön&quot;</p>
                      </div>
                      <div>
                        <p className='text-sm font-semibold text-amber-700 mb-1'>Sen dilinde:</p>
                        <p className='text-gray-700 italic'>&quot;Sen gittin, geriye yalnızlık kaldı&quot;</p>
                      </div>
                      <div>
                        <p className='text-sm font-semibold text-amber-700 mb-1'>O dilinde:</p>
                        <p className='text-gray-700 italic'>&quot;O gitti, arkasında sessizlik bıraktı&quot;</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Technique 12 */}
            <article className='bg-white rounded-[2.5rem] shadow-lg overflow-hidden hover:shadow-xl transition-all'>
              <div className='bg-gradient-to-r from-gray-600 to-gray-800 p-6'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center'>
                      <Lock className='text-white' size={24} />
                    </div>
                    <h3 className='text-2xl font-bold text-white'>12. Sınır/Kısıt Kullan</h3>
                  </div>
                  <span className='px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold'>
                    İleri
                  </span>
                </div>
              </div>
              <div className='p-8'>
                <div className='mb-6'>
                  <h4 className='font-bold text-lg text-gray-900 mb-3 flex items-center'>
                    <span className='text-gray-600 mr-2'>❓</span>
                    Neden İşe Yarar?
                  </h4>
                  <p className='text-gray-700 leading-relaxed'>
                    Kısıt, yaratıcı çözümler zorlar. Sınırlı alan içinde çalışmak yaratıcılığı tetikler.
                  </p>
                </div>
                <div className='bg-gray-50 border-l-4 border-gray-600 p-6 rounded-r-2xl mb-6'>
                  <h4 className='font-bold text-lg text-gray-900 mb-3 flex items-center'>
                    <Lightbulb className='text-gray-600 mr-2' size={20} />
                    Nasıl Uygularım?
                  </h4>
                  <p className='text-gray-700 leading-relaxed mb-4'>
                    <strong>5-7-5 hece haiku yaz</strong>; kısıt iyi fikir tetikler.
                  </p>
                  <div className='bg-white rounded-2xl p-4 mt-4'>
                    <p className='text-sm text-gray-600 mb-3'>
                      <strong>Haiku örneği:</strong>
                    </p>
                    <div className='text-xl text-gray-800 text-center leading-relaxed italic'>
                      <p>Yağmur damlası (5 hece)</p>
                      <p>Cama vuruyor sessiz (7 hece)</p>
                      <p>Seni özledim (5 hece)</p>
                    </div>
                    <p className='text-sm text-gray-600 mt-4'>
                      <strong>Diğer kısıt örnekleri:</strong>
                    </p>
                    <ul className='text-sm text-gray-700 mt-2 space-y-1'>
                      <li>• Her satır aynı harfle başlasın</li>
                      <li>• Sadece 3 kelime kullan</li>
                      <li>• Sone formu (14 satır)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </article>

            {/* Technique 13 */}
            <article className='bg-white rounded-[2.5rem] shadow-lg overflow-hidden hover:shadow-xl transition-all'>
              <div className='bg-gradient-to-r from-red-600 to-pink-600 p-6'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center'>
                      <PenSquare className='text-white' size={24} />
                    </div>
                    <h3 className='text-2xl font-bold text-white'>13. Revizyon Odağı: Kes, Yoğunlaştır, Netleştir</h3>
                  </div>
                  <span className='px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold'>
                    Kritik
                  </span>
                </div>
              </div>
              <div className='p-8'>
                <div className='mb-6'>
                  <h4 className='font-bold text-lg text-gray-900 mb-3 flex items-center'>
                    <span className='text-red-600 mr-2'>❓</span>
                    Neden İşe Yarar?
                  </h4>
                  <p className='text-gray-700 leading-relaxed'>
                    İyi şiir çoğunlukla editasyonla ortaya çıkar. İlk taslak sadece başlangıçtır.
                  </p>
                </div>
                <div className='bg-red-50 border-l-4 border-red-600 p-6 rounded-r-2xl mb-6'>
                  <h4 className='font-bold text-lg text-gray-900 mb-3 flex items-center'>
                    <Lightbulb className='text-red-600 mr-2' size={20} />
                    Nasıl Uygularım?
                  </h4>
                  <p className='text-gray-700 leading-relaxed mb-4'>
                    <strong>Her revizyonda üç soruyu sor:</strong>
                  </p>
                  <div className='bg-white rounded-2xl p-4 mt-4'>
                    <div className='space-y-4'>
                      <div className='flex items-start space-x-3'>
                        <div className='w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                          <span className='font-bold text-red-600'>1</span>
                        </div>
                        <div>
                          <p className='font-semibold text-gray-900 mb-1'>Bu dize gerekli mi?</p>
                          <p className='text-sm text-gray-600'>Çıkarıldığında anlam değişmiyor mu? O zaman sil.</p>
                        </div>
                      </div>
                      <div className='flex items-start space-x-3'>
                        <div className='w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                          <span className='font-bold text-red-600'>2</span>
                        </div>
                        <div>
                          <p className='font-semibold text-gray-900 mb-1'>Hangi kelime zayıf?</p>
                          <p className='text-sm text-gray-600'>
                            Sıfatlar, zarflar, dolgu kelimeler. Hepsini gözden geçir.
                          </p>
                        </div>
                      </div>
                      <div className='flex items-start space-x-3'>
                        <div className='w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                          <span className='font-bold text-red-600'>3</span>
                        </div>
                        <div>
                          <p className='font-semibold text-gray-900 mb-1'>Hangi görüntü daha güçlü olabilir?</p>
                          <p className='text-sm text-gray-600'>Soyut yerine somut, genel yerine spesifik.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='bg-purple-50 rounded-2xl p-4'>
                  <p className='text-sm font-semibold text-purple-900 mb-2'>🔄 Revizyon Döngüsü:</p>
                  <p className='text-sm text-purple-800'>
                    Yaz → Beklet (1 gün) → Oku → Düzelt → Seslendir → Düzelt → Paylaş → Geri bildirim al → Son düzelt
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* Bonus Section */}
        <section className='mb-12'>
          <div className='bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-[2.5rem] p-8 text-white'>
            <div className='flex items-start space-x-4'>
              <div className='w-16 h-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center flex-shrink-0'>
                <Users className='text-white' size={40} />
              </div>
              <div>
                <h2 className='text-3xl font-bold mb-4'>Bonus: Etkileşim ve Geri Bildirim</h2>
                <p className='text-white/90 leading-relaxed mb-6 text-lg'>
                  Diğer şairlerin kısa analizleri ve geri bildirim gelişimi hızlandırır. Yalnız çalışmayın, paylaşın ve
                  öğrenin.
                </p>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-6'>
                    <h4 className='font-bold text-xl mb-3'>📚 Çok Okuyun</h4>
                    <p className='text-white/80 text-sm'>
                      Farklı şairleri okuyun. Neyi beğendiğinizi, neyi beğenmediğinizi not edin.
                    </p>
                  </div>
                  <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-6'>
                    <h4 className='font-bold text-xl mb-3'>💬 Paylaşın</h4>
                    <p className='text-white/80 text-sm'>
                      Şiirlerinizi güvendiğiniz kişilerle paylaşın ve dürüst geri bildirim isteyin.
                    </p>
                  </div>
                  <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-6'>
                    <h4 className='font-bold text-xl mb-3'>✍️ Düzenli Yazın</h4>
                    <p className='text-white/80 text-sm'>Her gün 10 dakika yazın. İlham beklemeden pratik yapın.</p>
                  </div>
                  <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-6'>
                    <h4 className='font-bold text-xl mb-3'>🎯 Hedef Koyun</h4>
                    <p className='text-white/80 text-sm'>
                      Haftada 2 şiir, ayda 1 uzun şiir gibi somut hedefler belirleyin.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className='mb-12'>
          <div className='bg-white rounded-[2.5rem] shadow-lg p-12 text-center'>
            <div className='w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6'>
              <Rocket className='text-white' size={40} />
            </div>
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>Şimdi Başlama Zamanı!</h2>
            <p className='text-gray-600 text-lg mb-8 max-w-2xl mx-auto'>
              Bu teknikleri öğrendiniz. Şimdi sevgilinize özel bir şiir yazarak pratik yapın!
            </p>
            <Link
              href='/poems'
              className='bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all hover:scale-105 inline-flex items-center justify-center space-x-3'
            >
              <Pen size={20} />
              <span>Şiir Yazmaya Başla</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
