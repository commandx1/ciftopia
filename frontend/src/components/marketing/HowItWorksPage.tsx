import React from 'react'
import {
  Route,
  Lock,
  Brain,
  Infinity,
  Heart,
  Sparkles,
  MapPin,
  Calendar,
  Plus,
  Cloud,
  FolderTree,
  Play,
  Umbrella,
  Star,
  LineChart,
  Tags,
  Clock,
  Bell,
  CalendarCheck,
  Feather,
  Palette,
  CalendarDays,
  Pen,
  MousePointer2,
  Layers,
  Check,
  ArrowRight,
  Download,
  Share2,
  Images,
  Camera,
  ChevronDown,
  RefreshCw,
  Pin,
  ExternalLink,
  Database,
  Crown,
  CloudUpload,
  MessageSquare,
  PenTool,
  StickyNote,
  Video,
  Hourglass,
  ImageIcon
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function HowItWorksPage() {
  return (
    <div className='bg-gradient-to-br from-[#FFF5F5] via-pink-50/30 to-purple-50/20'>
      {/* Hero Section */}
      <section id='hero-section' className='relative overflow-hidden min-h-[600px] flex items-center'>
        <div className='absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50'>
          <div className='absolute top-20 left-20 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl animate-pulse'></div>
          <div
            className='absolute bottom-20 right-20 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl animate-pulse'
            style={{ animationDelay: '1s' }}
          ></div>
        </div>

        <div className='max-w-[1920px] mx-auto px-12 relative z-10 w-full'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-24 items-center'>
            <div className='space-y-6'>
              <div className='inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-5 py-2.5 rounded-full border border-rose-200/50 shadow-sm'>
                <Route className='text-rose-500 w-5 h-5' />
                <span className='text-sm font-semibold text-gray-700'>8 Modül, Sonsuz Anı</span>
              </div>

              <h1 className='text-6xl md:text-7xl font-bold text-gray-900 leading-tight'>
                İlişkinizin
                <br />
                <span className='text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500'>
                  Her Yönü Bir Arada
                </span>
              </h1>

              <p className='text-xl text-gray-600 leading-relaxed max-w-xl'>
                Ciftopia&apos;nın 8 özel modülü, aşkınızın her detayını kaydetmenizi sağlıyor. Günlük sorulardan
                hayallerinize, anılardan zaman kapsüllerine kadar her şey burada.
              </p>
            </div>

            <div className='relative hidden lg:block'>
              <div className='relative w-full h-[450px] bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/60 shadow-2xl shadow-purple-200/50 p-8 flex items-center justify-center'>
                <div className='relative'>
                  <div className='absolute -inset-4 bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 rounded-full opacity-20 blur-2xl animate-pulse'></div>
                  <Layers className='w-32 h-32 text-rose-500 relative z-10' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Module 0: Dashboard (Genel Bakış) */}
      <section id='module-dashboard' className='py-32 bg-white/40'>
        <div className='max-w-[1920px] mx-auto px-12'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-24 items-center'>
            <div>
              <div className='inline-flex items-center space-x-2 bg-rose-100 px-4 py-2 rounded-full mb-6 border border-rose-200'>
                <div className='w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white font-bold'>
                  0
                </div>
                <span className='text-sm font-semibold text-rose-700'>Giriş</span>
              </div>
              <h2 className='text-5xl md:text-6xl font-bold text-gray-900 mb-6'>
                İlişki Komuta
                <br />
                Merkezi: Dashboard
              </h2>
              <p className='text-xl text-gray-600 mb-8 leading-relaxed'>
                Uygulamaya giriş yaptığınızda sizi karşılayan Dashboard, ilişkinizin tüm detaylarını tek bir ekranda
                sunar. Kaç gündür birliktesiniz, kaç anı biriktirdiniz, yaklaşan önemli tarihler ve son aktiviteler...
                Hepsi burada.
              </p>
              <div className='space-y-6'>
                {[
                  {
                    icon: LineChart,
                    title: 'Canlı İstatistikler',
                    desc: 'Anılarınızın, fotoğraflarınızın ve içeriklerinizin dağılımını grafiklerle takip edin'
                  },
                  {
                    icon: Database,
                    title: 'Depolama Takibi',
                    desc: 'Kullanılan alanı görün, ihtiyacınıza göre paketini yükseltin'
                  },
                  {
                    icon: ExternalLink,
                    title: 'Site Önizleme',
                    desc: 'Size özel sitenizin nasıl göründüğünü anlık olarak kontrol edin'
                  }
                ].map((item, i) => (
                  <div key={i} className='flex items-start space-x-4'>
                    <div className='w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0'>
                      <item.icon className='text-rose-600 w-6 h-6' />
                    </div>
                    <div>
                      <h4 className='font-bold text-gray-900 mb-1'>{item.title}</h4>
                      <p className='text-gray-600'>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='relative'>
              <div className='bg-gray-100/80 rounded-[3rem] p-6 md:p-8 border-2 border-white shadow-2xl relative overflow-hidden'>
                {/* Dashboard Welcome Header */}
                <div className='bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-6 mb-6 border-2 border-rose-100'>
                  <div className='flex items-center justify-between mb-4'>
                    <div>
                      <h3 className='font-bold text-lg text-gray-900'>Merhaba Ahmet! 👋</h3>
                      <p className='text-[10px] text-gray-500'>
                        Siteniz <span className='font-bold text-rose-600'>23 gündür</span> aktif
                      </p>
                    </div>
                    <div className='w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-400 rounded-full flex items-center justify-center shadow-lg'>
                      <Heart className='text-white w-5 h-5 fill-current' />
                    </div>
                  </div>

                  <div className='grid grid-cols-4 gap-2'>
                    {[
                      { label: 'Anı', val: '12', color: 'rose', icon: Clock },
                      { label: 'Foto', val: '45', color: 'purple', icon: Images },
                      { label: 'Şiir', val: '8', color: 'amber', icon: Feather },
                      { label: 'Not', val: '5', color: 'green', icon: StickyNote }
                    ].map((stat, i) => (
                      <div key={i} className='bg-white rounded-xl p-3 text-center shadow-sm'>
                        <div
                          className={`w-6 h-6 bg-${stat.color}-100 rounded-full flex items-center justify-center mx-auto mb-1`}
                        >
                          <stat.icon size={12} className={`text-${stat.color}-500`} />
                        </div>
                        <div className='text-sm font-bold text-gray-900'>{stat.val}</div>
                        <div className='text-[8px] text-gray-500 font-bold uppercase'>{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {/* Site Preview Mockup */}
                  <div className='bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-lg'>
                    <div className='bg-gradient-to-r from-rose-500 to-pink-500 p-4 h-32 relative'>
                      <div className='flex items-center justify-center space-x-3 mt-4'>
                        <div className='w-10 h-10 rounded-full border-2 border-white overflow-hidden relative'>
                          <Image src='/man-pp.png' fill alt='' className='object-cover' />
                        </div>
                        <Heart className='text-white w-4 h-4 fill-current' />
                        <div className='w-10 h-10 rounded-full border-2 border-white overflow-hidden relative'>
                          <Image src='/woman-pp.png' fill alt='' className='object-cover' />
                        </div>
                      </div>
                    </div>
                    <div className='p-4'>
                      <div className='flex justify-between items-center mb-4'>
                        <h4 className='text-[10px] font-black uppercase text-gray-400'>ahmet-ayse.ciftopia.com</h4>
                        <ExternalLink size={10} className='text-gray-400' />
                      </div>
                      <button className='w-full bg-rose-500 text-white py-2 rounded-full text-[10px] font-bold'>
                        Siteyi Görüntüle
                      </button>
                    </div>
                  </div>

                  {/* Storage & Upgrade Mockup */}
                  <div className='space-y-4'>
                    <div className='bg-white rounded-3xl p-5 border border-gray-100 shadow-lg'>
                      <div className='flex items-center justify-between mb-3'>
                        <div>
                          <p className='text-[10px] text-gray-400 font-bold'>DEPOLAMA</p>
                          <p className='text-sm font-black text-gray-900'>234 MB / 1 GB</p>
                        </div>
                        <Database className='text-blue-500 w-5 h-5' />
                      </div>
                      <div className='w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-4'>
                        <div className='bg-blue-500 h-full w-[23%]' />
                      </div>
                      <button className='w-full bg-blue-100 text-blue-600 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider'>
                        Yükselt
                      </button>
                    </div>

                    <div className='bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-4 text-white shadow-xl flex items-center gap-3 group cursor-pointer'>
                      <div className='w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0'>
                        <Crown size={16} />
                      </div>
                      <div>
                        <p className='text-[10px] font-black uppercase'>Premium Paket</p>
                        <p className='text-[8px] opacity-80 font-bold'>Sınırsız video & AI sayfaları</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Mockup */}
                <div className='mt-6 bg-white/60 backdrop-blur-sm rounded-3xl p-4 border border-white'>
                  <h4 className='text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2'>
                    Hızlı İşlemler
                  </h4>
                  <div className='grid grid-cols-4 gap-3'>
                    {[
                      { icon: Plus, color: 'rose' },
                      { icon: CloudUpload, color: 'purple' },
                      { icon: PenTool, color: 'amber' },
                      { icon: MessageSquare, color: 'green' }
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`aspect-square bg-${item.color}-50 rounded-2xl flex items-center justify-center border border-${item.color}-100 shadow-sm`}
                      >
                        <item.icon size={16} className={`text-${item.color}-500`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Module 1: Daily Questions */}
      <section id='module-daily-questions' className='py-32 relative'>
        <div className='max-w-[1920px] mx-auto px-12'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-24 items-center'>
            <div className='order-2 lg:order-2'>
              <div className='inline-flex items-center space-x-2 bg-purple-100 px-4 py-2 rounded-full mb-6 border border-purple-200'>
                <div className='w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold'>
                  1
                </div>
                <span className='text-sm font-semibold text-purple-700'>Modül 1</span>
              </div>
              <h2 className='text-5xl md:text-6xl font-bold text-gray-900 mb-6'>
                Günlük Sorular
                <br />& AI Analizi
              </h2>
              <p className='text-xl text-gray-600 mb-8 leading-relaxed'>
                Her gün partnerinle birbirinize yeni pencereler açın. İkiniz de cevaplayınca kilitler açılır ve AI
                modelimiz ilişkinizi derinleştiren yorumlar sunar.
              </p>
              <div className='space-y-6'>
                {[
                  {
                    icon: Lock,
                    title: 'İkili Kilit Sistemi',
                    desc: 'Her soruya ikiniz de cevap vermedikçe diğer partnerin cevabı görünmez'
                  },
                  {
                    icon: Brain,
                    title: 'AI Analizi',
                    desc: 'Cevaplarınız analiz edilir ve ilişkinize özel öneriler sunulur'
                  },
                  {
                    icon: Infinity,
                    title: 'Sınırsız Arşiv',
                    desc: 'Tüm cevaplar ve analizler kronolojik olarak saklanır'
                  }
                ].map((item, i) => (
                  <div key={i} className='flex items-start space-x-4'>
                    <div className='w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0'>
                      <item.icon className='text-purple-600 w-6 h-6' />
                    </div>
                    <div>
                      <h4 className='font-bold text-gray-900 mb-1'>{item.title}</h4>
                      <p className='text-gray-600'>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='order-1 lg:order-1'>
              <div className='bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden border-2 border-rose-100 scale-105 hover:scale-[1.07] transition-all duration-700 group'>
                {/* Premium Widget Header */}
                <div className='px-8 py-5 flex items-center justify-between bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 relative overflow-hidden'>
                  <div className='absolute inset-0 bg-[url("https://www.transparenttextures.com/patterns/cubes.png")] opacity-10'></div>
                  <h3 className='font-bold text-xl text-white flex items-center gap-3 relative z-10'>
                    <span className='bg-white/20 p-2 rounded-xl backdrop-blur-md'>✨</span>
                    <span className='tracking-tight'>Günün Derin Sorusu</span>
                  </h3>
                  <div className='bg-white/20 backdrop-blur-md rounded-full px-4 py-1.5 flex items-center gap-2 border border-white/30 relative z-10'>
                    <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
                    <span className='text-white text-[10px] font-bold uppercase tracking-widest'>Analiz Hazır</span>
                  </div>
                </div>

                <div className='p-8 md:p-10 relative bg-gradient-to-b from-white to-rose-50/30'>
                  {/* The "Deep" Question */}
                  <div className='relative mb-10'>
                    <div className='absolute -top-6 -left-4 text-rose-200/50 text-8xl select-none'>&ldquo;</div>
                    <div className='relative z-10 rounded-[2rem] p-8 text-center bg-white shadow-[0_10px_30px_-5px_rgba(244,63,94,0.1)] border border-rose-50'>
                      <p className='text-2xl md:text-3xl text-gray-800 leading-tight font-medium italic'>
                        &quot;Birbirimizin ruhunda hangi köşeyi keşfettiğinde &apos;işte bu benim evim&apos;
                        dedin?&quot;
                      </p>
                    </div>
                    <div className='absolute -bottom-8 -right-4 text-rose-200/50 text-8xl select-none rotate-180'>
                      &ldquo;
                    </div>
                  </div>

                  {/* Answers with Depth */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-10'>
                    <div className='space-y-3 group/answer'>
                      <div className='flex items-center gap-3 ml-2'>
                        <div className='relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-rose-200 ring-offset-2 transition-transform group-hover/answer:scale-110'>
                          <Image src='/woman-pp.png' alt='Sen' fill className='object-cover' />
                        </div>
                        <span className='font-bold text-xs text-gray-400 uppercase tracking-widest'>
                          Senin Hislerin
                        </span>
                      </div>
                      <div className='bg-white rounded-2xl p-6 border border-rose-100 min-h-[100px] shadow-sm group-hover/answer:shadow-md transition-all'>
                        <p className='text-gray-700 text-sm leading-relaxed italic'>
                          &quot;Zayıf düştüğüm anlarda gösterdiğin o sarsılmaz şefkati gördüğümde... İşte o an ruhumun
                          dinlendiği yeri buldum.&quot;
                        </p>
                      </div>
                    </div>

                    <div className='space-y-3 group/answer'>
                      <div className='flex items-center gap-3 ml-2'>
                        <div className='relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-purple-200 ring-offset-2 transition-transform group-hover/answer:scale-110'>
                          <Image src='/man-pp.png' alt='Partner' fill className='object-cover' />
                        </div>
                        <span className='font-bold text-xs text-gray-400 uppercase tracking-widest'>Onun Dünyası</span>
                      </div>
                      <div className='bg-gradient-to-br from-purple-50 to-rose-50 rounded-2xl p-6 border border-purple-100 min-h-[100px] shadow-sm group-hover/answer:shadow-md transition-all'>
                        <p className='text-gray-700 text-sm leading-relaxed italic'>
                          &quot;Hayallerimi anlatırken gözlerinde gördüğüm o samimi heyecan... O an anladım ki ait
                          olduğum yer tam orası.&quot;
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Insights - The Temptation Part */}
                  <div className='bg-gradient-to-br from-indigo-600 via-purple-600 to-rose-500 rounded-[2rem] p-[2px] shadow-2xl shadow-purple-200 group/ai'>
                    <div className='bg-white rounded-[1.9rem] p-8 relative overflow-hidden h-full'>
                      <div className='absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-y-16 translate-x-16 blur-3xl group-hover/ai:bg-indigo-500/10 transition-colors' />

                      <div className='relative z-10'>
                        <div className='flex items-center gap-4 mb-5'>
                          <div className='w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 animate-bounce-slow'>
                            <Sparkles size={24} />
                          </div>
                          <div>
                            <span className='font-black text-indigo-900 uppercase tracking-[0.2em] text-[10px] block mb-1'>
                              Ruhsal Bağ Analizi
                            </span>
                            <div className='flex gap-1'>
                              {[1, 2, 3, 4, 5].map(i => (
                                <div
                                  key={i}
                                  className='w-1 h-1 bg-indigo-200 rounded-full animate-pulse'
                                  style={{ animationDelay: `${i * 0.2}s` }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className='text-gray-800 text-base leading-relaxed font-medium italic border-l-4 border-indigo-100 pl-4 py-1'>
                          &quot;İkiniz arasındaki bağ, sadece bir birliktelik değil; birbirinizin en savunmasız
                          yanlarını sarıp sarmalayan derin bir liman. Bu ruhsal uyum, uzun vadeli ve köklü bir aşkın en
                          güçlü temelidir.&quot;
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Preview with Premium Look */}
                  <div className='mt-8 flex items-center justify-between border-t border-rose-50 pt-6'>
                    <div className='text-[10px] text-gray-400 font-bold uppercase tracking-widest'>
                      Bu anıyı ölümsüzleştirin
                    </div>
                    <div className='flex gap-3'>
                      <div className='bg-rose-500 text-white p-3 rounded-2xl shadow-lg shadow-rose-200 hover:scale-110 transition-transform cursor-pointer'>
                        <Download size={18} />
                      </div>
                      <div className='bg-white text-rose-500 p-3 rounded-2xl shadow-sm border border-rose-100 hover:scale-110 transition-transform cursor-pointer'>
                        <Share2 size={18} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Module 2: Memories */}
      <section id='module-memories' className='py-32 bg-gradient-to-br from-rose-50 to-pink-50'>
        <div className='max-w-[1920px] mx-auto px-12'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-24 items-center'>
            <div>
              <div className='inline-flex items-center space-x-2 bg-rose-100 px-4 py-2 rounded-full mb-6 border border-rose-200'>
                <div className='w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white font-bold'>
                  2
                </div>
                <span className='text-sm font-semibold text-rose-700'>Modül 2</span>
              </div>
              <h2 className='text-5xl md:text-6xl font-bold text-gray-900 mb-6'>
                Anılar
                <br />
                Timeline
              </h2>
              <p className='text-xl text-gray-600 mb-8 leading-relaxed'>
                Birlikte geçen her değerli anı hikayeleştirin. Geçmişe dönüp baktığınızda elinizde sadece fotoğraflar
                değil, o günlerin hisleri de kalsın.
              </p>
              <div className='space-y-6'>
                {[
                  {
                    icon: History,
                    title: 'Kronolojik Akış',
                    desc: "Tüm anılarınız tarih sırasına göre düzenli bir timeline'da"
                  },
                  {
                    icon: MapPin,
                    title: 'Konum & Fotoğraf',
                    desc: 'Her anıya konum ve fotoğraf ekleyebilirsiniz'
                  },
                  {
                    icon: Heart,
                    title: 'Duygu Etiketleri',
                    desc: 'Romantik, eğlenceli, duygusal veya macera'
                  }
                ].map((item, i) => (
                  <div key={i} className='flex items-start space-x-4'>
                    <div className='w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0'>
                      <item.icon className='text-rose-600 w-6 h-6' />
                    </div>
                    <div>
                      <h4 className='font-bold text-gray-900 mb-1'>{item.title}</h4>
                      <p className='text-gray-600'>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className='bg-gray-100 rounded-[3rem] p-8 md:p-10 border-2 border-white shadow-2xl relative overflow-hidden min-h-[600px]'>
                {/* Real Timeline Line */}
                <div className='absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-200 via-pink-200 to-purple-200 transform -translate-x-1/2'></div>

                <div className='space-y-12 relative z-10'>
                  {/* Month Marker */}
                  <div className='relative flex justify-center'>
                    <div className='bg-white px-6 py-2 rounded-full shadow-md border-2 border-rose-200'>
                      <span className='font-bold text-rose-600 text-sm'>Şubat 2024</span>
                    </div>
                  </div>

                  {/* Memory Card 1 */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-8 items-center'>
                    <div className='md:pr-8 text-right'>
                      <div className='bg-rose-50/80 rounded-3xl shadow-xl p-5 border border-white hover:scale-[1.02] transition-all relative group'>
                        {/* Memory Icon on Timeline */}
                        <div className='absolute -right-11 top-1/2 -translate-y-1/2 w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg z-20'>
                          <Heart className='text-white w-4 h-4' fill='white' />
                        </div>

                        <div className='aspect-video bg-rose-200 rounded-2xl mb-4 overflow-hidden relative shadow-inner'>
                          <Image src='/banner_image.png' alt='Anı' fill className='object-cover opacity-80' />
                        </div>
                        <h4 className='font-bold text-gray-900 text-lg mb-1'>İlk Buluşma</h4>
                        <div className='flex items-center justify-end gap-3 text-[10px] text-gray-500 font-bold mb-3'>
                          <span className='flex items-center gap-1'>
                            <Calendar className='w-3 h-3 text-rose-400' /> 14 Şubat
                          </span>
                          <span className='flex items-center gap-1'>
                            <MapPin className='w-3 h-3 text-rose-400' /> Kadıköy
                          </span>
                        </div>
                        <p className='text-xs text-gray-600 italic line-clamp-2'>
                          &quot;O gün zamanın nasıl geçtiğini hiç anlamamıştık...&quot;
                        </p>
                        <button className='mt-2 font-semibold hover:underline flex items-center space-x-1 ml-auto text-rose-500 text-[10px]'>
                          <span>Devamını Oku</span>
                          <ChevronDown size={12} />
                        </button>
                        <div className='mt-4 pt-3 border-t border-rose-100 flex justify-between items-center'>
                          <span className='bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest'>
                            Romantik
                          </span>
                          <Star className='text-amber-400 w-4 h-4' fill='currentColor' />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Memory Card 2 */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-8 items-center'>
                    <div className='hidden md:block'></div>
                    <div className='md:pl-8'>
                      <div className='bg-purple-50/80 rounded-3xl shadow-xl p-5 border border-white hover:scale-[1.02] transition-all relative group'>
                        <div className='absolute -left-11 top-1/2 -translate-y-1/2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg z-20'>
                          <Sparkles className='text-white w-4 h-4' />
                        </div>
                        <div className='aspect-video bg-purple-200 rounded-2xl mb-4 overflow-hidden relative shadow-inner'>
                          <div className='absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-500 opacity-40'></div>
                          <Umbrella className='absolute inset-0 m-auto text-white/50 w-12 h-12' />
                        </div>
                        <h4 className='font-bold text-gray-900 text-lg mb-1'>Kapadokya Tatili</h4>
                        <div className='flex items-center gap-3 text-[10px] text-gray-500 font-bold mb-3'>
                          <span className='flex items-center gap-1'>
                            <Calendar className='w-3 h-3 text-purple-400' /> 15 Mart
                          </span>
                          <span className='flex items-center gap-1'>
                            <MapPin className='w-3 h-3 text-purple-400' /> Kapadokya
                          </span>
                        </div>
                        <p className='text-xs text-gray-600 italic line-clamp-2'>
                          &quot;Balonla gün doğumunu izlemek büyüleyiciydi.&quot;
                        </p>
                        <button className='mt-2 font-semibold hover:underline flex items-center space-x-1 mr-auto text-purple-500 text-[10px]'>
                          <span>Devamını Oku</span>
                          <ChevronDown size={12} />
                        </button>
                        <div className='mt-4 pt-3 border-t border-purple-100 flex justify-between items-center'>
                          <span className='bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest'>
                            Macera
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Module 3: Gallery */}
      <section id='module-gallery' className='py-32'>
        <div className='max-w-[1920px] mx-auto px-12'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-24 items-center'>
            <div className='order-2 lg:order-2'>
              <div className='inline-flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full mb-6 border border-blue-200'>
                <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold'>
                  3
                </div>
                <span className='text-sm font-semibold text-blue-700'>Modül 3</span>
              </div>
              <h2 className='text-5xl md:text-6xl font-bold text-gray-900 mb-6'>
                Akıllı Galeri
                <br />& Albümler
              </h2>
              <p className='text-xl text-gray-600 mb-8 leading-relaxed'>
                Sadece size özel, yüksek çözünürlüklü ve güvenli bir dijital albüm. Fotoğraflarınızı kategorize edin,
                ömür boyu saklayın.
              </p>
              <div className='space-y-6'>
                {[
                  {
                    icon: Cloud,
                    title: 'Güvenli Bulut Depolama',
                    desc: 'Fotoğraflarınız dünyanın en güvenli sistemlerinde şifreli saklanır'
                  },
                  {
                    icon: FolderTree,
                    title: 'Sınırsız Albüm',
                    desc: 'İstediğiniz kadar albüm oluşturun ve fotoğraflarınızı organize edin'
                  },
                  {
                    icon: Play,
                    title: 'Slayt Gösterisi',
                    desc: 'Anılarınızı sinematik bir deneyimle partnerinizle izleyin'
                  }
                ].map((item, i) => (
                  <div key={i} className='flex items-start space-x-4'>
                    <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0'>
                      <item.icon className='text-blue-600 w-6 h-6' />
                    </div>
                    <div>
                      <h4 className='font-bold text-gray-900 mb-1'>{item.title}</h4>
                      <p className='text-gray-600'>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='order-1 lg:order-1'>
              <div className='bg-gray-50 rounded-[2.5rem] p-8 md:p-10 border-2 border-white shadow-2xl relative'>
                {/* Real Gallery Header Mock */}
                <div className='flex items-center justify-between mb-8'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-10 h-10 bg-gradient-to-br from-purple-500 to-rose-600 rounded-xl flex items-center justify-center shadow-md rotate-3'>
                      <Camera className='text-white w-5 h-5' />
                    </div>
                    <h3 className='font-bold text-xl text-gray-900'>Galerimiz</h3>
                  </div>
                  <div className='flex bg-white rounded-full p-1 border border-gray-200 shadow-sm scale-90'>
                    <div className='px-4 py-1.5 bg-rose-500 text-white rounded-full text-[10px] font-bold'>
                      Albümler
                    </div>
                    <div className='px-4 py-1.5 text-gray-400 text-[10px] font-bold'>Izgara</div>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-6 mb-8'>
                  {[
                    { title: 'Tatil 2024', count: 47, color: 'blue', desc: 'Deniz, kum, güneş...', date: '1 ay önce' },
                    { title: 'Nişanımız', count: 128, color: 'purple', desc: 'En mutlu günümüz', date: '3 ay önce' }
                  ].map((album, i) => (
                    <div
                      key={i}
                      className='bg-white rounded-[2rem] shadow-lg overflow-hidden border border-gray-100 hover:-translate-y-2 transition-all group'
                    >
                      <div className='h-40 overflow-hidden relative'>
                        <div
                          className={`w-full h-full bg-gradient-to-br from-${album.color}-400 to-${album.color}-600 opacity-20 group-hover:scale-110 transition-transform duration-700`}
                        ></div>
                        <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent'></div>
                        <div className='absolute bottom-3 left-4'>
                          <h4 className='text-white font-bold text-sm'>{album.title}</h4>
                          <div className='flex items-center gap-2 text-white/80 text-[8px]'>
                            <Images size={10} /> <span>{album.count} Fotoğraf</span>
                          </div>
                        </div>
                      </div>
                      <div className='p-4'>
                        <p className='text-[10px] text-gray-500 line-clamp-1 mb-3'>{album.desc}</p>
                        <div className='flex items-center justify-between'>
                          <div className='flex -space-x-2'>
                            <div className='w-5 h-5 rounded-full border border-white bg-rose-100 overflow-hidden relative'>
                              <Image src='/woman-pp.png' alt='' fill className='object-cover' />
                            </div>
                            <div className='w-5 h-5 rounded-full border border-white bg-blue-100 overflow-hidden relative'>
                              <Image src='/man-pp.png' alt='' fill className='object-cover' />
                            </div>
                          </div>
                          <span className='text-[8px] font-bold text-gray-400'>{album.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* All Photos Grid Mock */}
                <div className='bg-white rounded-3xl p-6 border border-gray-100 shadow-inner'>
                  <div className='flex items-center justify-between mb-4'>
                    <h4 className='font-bold text-sm text-gray-700'>Son Yüklenenler</h4>
                    <span className='text-[10px] text-rose-500 font-bold'>Tümünü Gör</span>
                  </div>
                  <div className='grid grid-cols-4 gap-3'>
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className='aspect-square rounded-xl overflow-hidden border border-gray-100 relative group cursor-pointer'
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br from-rose-100 to-purple-100 opacity-50 group-hover:opacity-100 transition-opacity animate-pulse`}
                          style={{ animationDelay: `${i * 0.1}s` }}
                        ></div>
                        <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                          <Plus className='text-rose-500 w-4 h-4' />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Module 4: Bucket List */}
      <section id='module-bucket-list' className='py-32 bg-gradient-to-br from-amber-50 to-orange-50'>
        <div className='max-w-[1920px] mx-auto px-12'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-24 items-center'>
            <div>
              <div className='inline-flex items-center space-x-2 bg-amber-100 px-4 py-2 rounded-full mb-6 border border-amber-200'>
                <div className='w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold'>
                  4
                </div>
                <span className='text-sm font-semibold text-amber-700'>Modül 4</span>
              </div>
              <h2 className='text-5xl md:text-6xl font-bold text-gray-900 mb-6'>
                Hayaller
                <br />
                Bucket List
              </h2>
              <p className='text-xl text-gray-600 mb-8 leading-relaxed'>
                Birlikte yapmak istediğiniz her şeyi listeleyin. Gerçekleştirdiğiniz her hayali konfetilerle kutlayarak
                üzerini çizin.
              </p>
              <div className='space-y-6'>
                {[
                  {
                    icon: Star,
                    title: 'Konfeti Kutlaması',
                    desc: 'Tamamlanan her hayal için ekranınızda özel kutlama animasyonu'
                  },
                  {
                    icon: LineChart,
                    title: 'İlerleme Takibi',
                    desc: 'Birlikte kaç hayali gerçekleştirdiğinizi istatistiklerle görün'
                  },
                  {
                    icon: Tags,
                    title: 'Kategori Sistemi',
                    desc: 'Seyahat, aktivite, yaşam hedefleri gibi kategorilere ayırın'
                  }
                ].map((item, i) => (
                  <div key={i} className='flex items-start space-x-4'>
                    <div className='w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0'>
                      <item.icon className='text-amber-600 w-6 h-6' />
                    </div>
                    <div>
                      <h4 className='font-bold text-gray-900 mb-1'>{item.title}</h4>
                      <p className='text-gray-600'>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className='bg-gray-100/50 rounded-[3rem] p-6 md:p-8 border-2 border-white shadow-2xl relative overflow-hidden min-h-[600px]'>
                <div className='absolute top-0 right-0 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl -translate-y-32 translate-x-32' />

                {/* Header with Progress */}
                <div className='bg-white rounded-[2rem] p-6 mb-6 shadow-xl border border-purple-50 relative z-10 overflow-hidden'>
                  <div className='flex items-center justify-between mb-4'>
                    <div>
                      <h3 className='font-bold text-lg text-gray-900'>Hayallerimiz ✨</h3>
                      <p className='text-[10px] text-gray-500 italic'>Birlikte yapacaklarımız</p>
                    </div>
                    <div className='bg-rose-500 text-white p-2 rounded-xl shadow-lg'>
                      <Plus size={16} />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex justify-between items-end'>
                      <span className='text-purple-900/60 font-black text-[10px] uppercase'>İlerleme</span>
                      <span className='text-lg font-black text-purple-600'>12/25</span>
                    </div>
                    <div className='w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner p-0.5'>
                      <div className='bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full w-[48%] shadow-sm' />
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 relative z-10'>
                  {/* Mini Sidebar */}
                  <div className='lg:col-span-1 space-y-2 hidden md:block'>
                    {[
                      { id: 'all', label: 'Tümü', count: 25, active: true },
                      { id: 'travel', label: 'Seyahat', count: 8 },
                      { id: 'food', label: 'Yemek', count: 5 }
                    ].map(cat => (
                      <div
                        key={cat.id}
                        className={`p-3 rounded-xl flex items-center justify-between border ${cat.active ? 'bg-white border-rose-100 shadow-sm' : 'bg-white/40 border-transparent'}`}
                      >
                        <span className={`text-[10px] font-bold ${cat.active ? 'text-rose-600' : 'text-gray-500'}`}>
                          {cat.label}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full ${cat.active ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-400'}`}
                        >
                          {cat.count}
                        </span>
                      </div>
                    ))}
                    <div className='bg-amber-50 rounded-xl p-3 border border-amber-100 mt-4'>
                      <p className='text-[9px] text-amber-800 italic leading-tight'>💡 Hayallerinize tarih ekleyin!</p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className='lg:col-span-2 space-y-4'>
                    {[
                      { text: "Paris'te Eyfel Kulesi", done: true, category: 'Seyahat', color: 'blue' },
                      { text: 'Paraşütle atlamak', done: false, category: 'Deneyim', color: 'purple' },
                      { text: 'Yıldızları izlemek', done: false, category: 'Deneyim', color: 'purple' }
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-2xl border flex items-center gap-3 ${item.done ? 'bg-green-50/80 border-green-100 shadow-sm' : 'bg-white border-transparent shadow-md'}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${item.done ? 'bg-green-200 border-green-300 text-green-600' : 'bg-orange-200 border-orange-300 text-orange-600'}`}
                        >
                          <Check size={16} />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <h4
                            className={`font-bold text-xs truncate ${item.done ? 'text-gray-400 line-through' : 'text-gray-900'}`}
                          >
                            {item.text}
                          </h4>
                          <div className='flex items-center justify-between mt-1'>
                            <span
                              className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-${item.color}-100 text-${item.color}-700`}
                            >
                              {item.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Module 5: Important Dates */}
      <section id='module-important-dates' className='py-32'>
        <div className='max-w-[1920px] mx-auto px-12'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-24 items-center'>
            <div className='order-2 lg:order-2'>
              <div className='inline-flex items-center space-x-2 bg-pink-100 px-4 py-2 rounded-full mb-6 border border-pink-200'>
                <div className='w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold'>
                  5
                </div>
                <span className='text-sm font-semibold text-pink-700'>Modül 5</span>
              </div>
              <h2 className='text-5xl md:text-6xl font-bold text-gray-900 mb-6'>
                Önemli Tarihler
                <br />& Geri Sayım
              </h2>
              <p className='text-xl text-gray-600 mb-8 leading-relaxed'>
                İlişkinizin dönüm noktalarını asla unutmayın. Geri sayım araçları ve otomatik hatırlatıcılarla her özel
                günü kutlayın.
              </p>
              <div className='space-y-6'>
                {[
                  {
                    icon: Clock,
                    title: 'Canlı Geri Sayım',
                    desc: 'Özel günlere saniye saniye ne kadar kaldığını görün'
                  },
                  {
                    icon: Bell,
                    title: 'Akıllı Hatırlatıcılar',
                    desc: 'Önemli günler yaklaşırken otomatik bildirimler alın'
                  },
                  {
                    icon: CalendarCheck,
                    title: 'Dönüm Noktası Takibi',
                    desc: '100. gün, 1. yıl gibi sembolik tarihleri keşfedin'
                  }
                ].map((item, i) => (
                  <div key={i} className='flex items-start space-x-4'>
                    <div className='w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0'>
                      <item.icon className='text-pink-600 w-6 h-6' />
                    </div>
                    <div>
                      <h4 className='font-bold text-gray-900 mb-1'>{item.title}</h4>
                      <p className='text-gray-600'>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='order-1 lg:order-1'>
              <div className='bg-gray-50 rounded-[3rem] p-6 md:p-8 border-2 border-white shadow-2xl relative min-h-[600px] overflow-hidden'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 h-full'>
                  {/* Real Sidebar Mockup */}
                  <div className='md:col-span-1 space-y-4'>
                    <div className='bg-white rounded-3xl p-5 shadow-sm border border-rose-100'>
                      <div className='flex items-center justify-between mb-4'>
                        <h4 className='font-bold text-gray-900 text-xs uppercase tracking-widest'>Yaklaşanlar</h4>
                        <Clock className='text-rose-500 w-3 h-3' />
                      </div>
                      <div className='space-y-3'>
                        <div className='p-3 bg-rose-50 rounded-2xl border border-rose-100'>
                          <div className='flex items-center gap-2 mb-2'>
                            <span className='text-lg'>💍</span>
                            <div>
                              <p className='font-bold text-[10px] text-gray-900'>Yıldönümü</p>
                              <p className='text-[8px] text-gray-400'>20 Ocak</p>
                            </div>
                          </div>
                          <div className='bg-white text-rose-500 text-[9px] font-black text-center py-1 rounded-lg'>
                            BUGÜN!
                          </div>
                        </div>
                        <div className='p-3 bg-gray-50 rounded-2xl'>
                          <div className='flex items-center gap-2'>
                            <span className='text-lg'>🎂</span>
                            <div>
                              <p className='font-bold text-[10px] text-gray-900'>Doğum Günü</p>
                              <p className='text-[8px] text-gray-400'>15 Mart</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Real Timeline Mockup */}
                  <div className='md:col-span-2 relative pl-6'>
                    <div className='absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-rose-300 via-purple-300 to-transparent opacity-50'></div>

                    <div className='space-y-6'>
                      <div className='relative'>
                        <div className='absolute -left-[30px] top-6 w-4 h-4 rounded-full border-4 border-white bg-rose-500 shadow-md z-10'></div>
                        <div className='bg-white rounded-3xl p-5 shadow-lg border border-rose-100 ring-2 ring-rose-50'>
                          <div className='absolute -top-3 right-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest animate-bounce'>
                            ŞİMDİ
                          </div>
                          <div className='flex items-center gap-3 mb-3'>
                            <div className='w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-xl animate-float'>
                              💍
                            </div>
                            <div>
                              <h4 className='font-bold text-sm text-rose-600'>Tanışma Yıldönümü</h4>
                              <p className='text-[10px] text-gray-400 font-medium'>20 Ocak 2024</p>
                            </div>
                          </div>
                          <div className='flex gap-2'>
                            <span className='bg-purple-100 text-purple-600 px-2 py-1 rounded-lg text-[8px] font-black flex items-center gap-1'>
                              <RefreshCw size={10} /> HER YIL
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className='relative'>
                        <div className='absolute -left-[28px] top-6 w-3 h-3 rounded-full border-2 border-white bg-gray-400 z-10'></div>
                        <div className='bg-white/60 rounded-3xl p-5 border border-gray-100 shadow-sm'>
                          <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-lg'>
                              ✈️
                            </div>
                            <div>
                              <h4 className='font-bold text-xs text-gray-700'>İlk Tatilimiz</h4>
                              <p className='text-[9px] text-gray-400'>15 Temmuz 2023</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='absolute bottom-6 left-6 right-6'>
                  <button className='w-full bg-rose-500 text-white py-4 rounded-2xl font-bold text-sm shadow-xl hover:bg-rose-600 transition-all flex items-center justify-center gap-2'>
                    <Plus size={18} /> Yeni Tarih Ekle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Module 6: Poems */}
      <section id='module-poems' className='py-32 bg-gradient-to-br from-purple-50 to-pink-50'>
        <div className='max-w-[1920px] mx-auto px-12'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-24 items-center'>
            <div>
              <div className='inline-flex items-center space-x-2 bg-purple-100 px-4 py-2 rounded-full mb-6 border border-purple-200'>
                <div className='w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold'>
                  6
                </div>
                <span className='text-sm font-semibold text-purple-700'>Modül 6</span>
              </div>
              <h2 className='text-5xl md:text-6xl font-bold text-gray-900 mb-6'>
                Romantik
                <br />
                Şiirler
              </h2>
              <p className='text-xl text-gray-600 mb-8 leading-relaxed'>
                Duygularınızı kelimelere dökün. Birbirinize yazdığınız şiirleri ve en sevdiğiniz mısraları romantik bir
                sunumla paylaşın.
              </p>
              <div className='space-y-6'>
                {[
                  {
                    icon: Feather,
                    title: 'Zarif Tipografi',
                    desc: 'Şiirleriniz duyguyu yansıtan estetik fontlarla sunulur'
                  },
                  {
                    icon: Palette,
                    title: 'Dinamik Temalar',
                    desc: 'Her şiir için farklı arka plan ve renk paleti seçin'
                  },
                  {
                    icon: CalendarDays,
                    title: 'Geleceğe Not',
                    desc: 'Şiirlerinizi belirli bir tarihte görünür olacak şekilde planlayın'
                  }
                ].map((item, i) => (
                  <div key={i} className='flex items-start space-x-4'>
                    <div className='w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0'>
                      <item.icon className='text-purple-600 w-6 h-6' />
                    </div>
                    <div>
                      <h4 className='font-bold text-gray-900 mb-1'>{item.title}</h4>
                      <p className='text-gray-600'>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className='bg-gray-100 rounded-[3rem] p-6 md:p-8 border-2 border-white shadow-2xl relative min-h-[500px] overflow-hidden flex items-center justify-center bg-gradient-to-br from-purple-50 to-rose-50'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 w-full relative z-10'>
                  {/* Poem Card 1 - Main Feature */}
                  <div className='bg-white rounded-[2.5rem] p-6 shadow-xl border border-purple-100 relative overflow-hidden group/poem hover:-translate-y-2 transition-all duration-500'>
                    <div className='absolute top-0 right-0 w-32 h-32 bg-purple-100/50 rounded-full -mr-16 -mt-16 blur-2xl'></div>
                    <div className='relative z-10'>
                      <div className='flex justify-between items-center mb-6'>
                        <div className='flex gap-1'>
                          <span className='px-2 py-0.5 bg-purple-500/10 text-purple-700 rounded-full text-[8px] font-black uppercase tracking-wider'>
                            Aşk
                          </span>
                        </div>
                        <Feather className='text-purple-400 w-5 h-5 opacity-40' />
                      </div>
                      <h4 className='text-2xl font-bold text-gray-900 mb-4'>Sana</h4>
                      <div className='bg-purple-50/50 rounded-2xl p-4 mb-4 border border-purple-50'>
                        <p className='text-xs text-gray-800 italic leading-relaxed text-center'>
                          &quot;Gözlerinde kayboluyorum her baktığımda, Gülüşün bahara dönüyor kışları...&quot;
                        </p>
                      </div>
                      <div className='flex items-center justify-between pt-4 border-t border-purple-50'>
                        <div className='flex items-center gap-2'>
                          <div className='w-6 h-6 rounded-full bg-blue-100 relative overflow-hidden border border-white'>
                            <Image src='/man-pp.png' alt='' fill className='object-cover' />
                          </div>
                          <span className='text-[9px] font-bold text-gray-900'>Ahmet</span>
                        </div>
                        <Heart size={12} className='text-rose-500' fill='currentColor' />
                      </div>
                    </div>
                  </div>

                  {/* Poem Card 2 - Stacked Look */}
                  <div className='hidden md:flex flex-col gap-4'>
                    <div className='bg-white/80 rounded-[2rem] p-5 shadow-md border border-rose-50 hover:-translate-y-1 transition-all'>
                      <div className='flex justify-between items-center mb-3'>
                        <span className='text-[8px] font-black text-rose-500 uppercase tracking-widest'>Yıldızlar</span>
                        <Star size={10} className='text-amber-400' fill='currentColor' />
                      </div>
                      <h4 className='font-bold text-sm text-gray-800 mb-2'>Geceye Not</h4>
                      <p className='text-[10px] text-gray-500 italic line-clamp-2'>
                        &quot;Sen gökyüzündeki en parlak yıldız gibisin benim için...&quot;
                      </p>
                    </div>

                    <div className='bg-gradient-to-r from-purple-500 to-pink-500 rounded-[2rem] p-6 text-white shadow-lg flex flex-col items-center justify-center text-center group cursor-pointer'>
                      <Pen className='mb-2 w-6 h-6 group-hover:rotate-12 transition-transform' />
                      <p className='font-bold text-sm'>Duygularını Yaz</p>
                      <p className='text-[10px] opacity-80'>Hemen bir şiir paylaş</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Module 7: Notes */}
      <section id='module-notes' className='py-32 bg-white/40'>
        <div className='max-w-[1920px] mx-auto px-12'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-24 items-center'>
            <div className='order-2 lg:order-2'>
              <div className='inline-flex items-center space-x-2 bg-yellow-100 px-4 py-2 rounded-full mb-6 border border-yellow-200'>
                <div className='w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold'>
                  7
                </div>
                <span className='text-sm font-semibold text-yellow-700'>Modül 7</span>
              </div>
              <h2 className='text-5xl md:text-6xl font-bold text-gray-900 mb-6'>
                Özel Notlar
                <br />
                Sticky Notes
              </h2>
              <p className='text-xl text-gray-600 mb-8 leading-relaxed'>
                Gün içine serpiştirilmiş küçük sürprizler. Partnerinize anlık mesajlar, romantik notlar veya tatlı
                hatırlatıcılar bırakın.
              </p>
              <div className='space-y-6'>
                {[
                  {
                    icon: Palette,
                    title: 'Renkli Dünyalar',
                    desc: 'Sarı, pembe, mavi, yeşil - her duygu için farklı bir renk seçin'
                  },
                  {
                    icon: MousePointer2,
                    title: 'İnteraktif Yerleşim',
                    desc: 'Notları panonuzda istediğiniz yere sürükleyip bırakın'
                  },
                  {
                    icon: Bell,
                    title: 'Anlık Bildirimler',
                    desc: 'Partneriniz yeni bir not bıraktığında anında haberdar olun'
                  }
                ].map((item, i) => (
                  <div key={i} className='flex items-start space-x-4'>
                    <div className='w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0'>
                      <item.icon className='text-yellow-600 w-6 h-6' />
                    </div>
                    <div>
                      <h4 className='font-bold text-gray-900 mb-1'>{item.title}</h4>
                      <p className='text-gray-600'>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='order-1 lg:order-1'>
              <div className='bg-white/60 backdrop-blur-sm rounded-[2.5rem] p-8 md:p-10 border-2 border-yellow-200 shadow-2xl relative min-h-[500px] cork-texture overflow-hidden'>
                {/* Board pins */}
                <div className='absolute top-4 left-4 w-3 h-3 bg-gray-800 rounded-full shadow-lg'></div>
                <div className='absolute top-4 right-4 w-3 h-3 bg-gray-800 rounded-full shadow-lg'></div>
                <div className='absolute bottom-4 left-4 w-3 h-3 bg-gray-800 rounded-full shadow-lg'></div>
                <div className='absolute bottom-4 right-4 w-3 h-3 bg-gray-800 rounded-full shadow-lg'></div>

                <div className='grid grid-cols-2 gap-6 relative z-10'>
                  {[
                    { text: 'Seni çok seviyorum! ❤️', color: 'yellow', rot: 'rotate-2', author: 'Ayşe' },
                    { text: 'Akşam yemeği benden! 🍝', color: 'pink', rot: '-rotate-2', author: 'Ahmet' },
                    { text: 'Gülüşün çok güzel 😊', color: 'blue', rot: 'rotate-3', author: 'Ayşe' },
                    { text: 'Sürprizim var sana! 🎁', color: 'purple', rot: '-rotate-3', author: 'Ahmet' }
                  ].map((note, i) => (
                    <div
                      key={i}
                      className={`bg-${note.color}-100 p-6 rounded-lg shadow-xl relative transform ${note.rot} hover:rotate-0 hover:scale-110 transition-all duration-300 cursor-pointer group`}
                    >
                      {/* Note Pin */}
                      <div className='absolute -top-3 left-1/2 -translate-x-1/2'>
                        <Pin size={24} className='text-rose-500 fill-current rotate-45 drop-shadow-md' />
                      </div>
                      {/* Corner fold */}
                      <div className='absolute top-0 right-0 w-0 h-0 border-solid border-t-0 border-b-[20px] border-b-transparent border-r-[20px] border-r-black/10'></div>

                      <p className='text-gray-800 font-bold mb-6 text-sm leading-snug'>{note.text}</p>

                      <div className='flex items-center justify-between pt-3 border-t border-black/5'>
                        <span className='text-[8px] font-black text-gray-400 uppercase tracking-widest'>
                          {note.author}
                        </span>
                        <span className='text-[8px] text-gray-400 font-bold'>Bugün</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className='absolute bottom-8 left-8 right-8'>
                  <button className='w-full bg-white/90 backdrop-blur-sm text-gray-700 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-white transition-all flex items-center justify-center gap-2'>
                    <Plus className='w-4 h-4' /> Not Bırak
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Module 8: Time Capsule */}
      <section id='module-time-capsule' className='py-32 bg-gradient-to-br from-amber-50 to-orange-50'>
        <div className='max-w-[1920px] mx-auto px-12'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-24 items-center'>
            <div>
              <div className='inline-flex items-center space-x-2 bg-amber-100 px-4 py-2 rounded-full mb-6 border border-amber-200'>
                <div className='w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold'>
                  8
                </div>
                <span className='text-sm font-semibold text-amber-700'>Modül 8</span>
              </div>
              <h2 className='text-5xl md:text-6xl font-bold text-gray-900 mb-6'>
                Zaman
                <br />
                Kapsülleri
              </h2>
              <p className='text-xl text-gray-600 mb-8 leading-relaxed'>
                Gelecekteki kendinize veya partnerinize dijital mektuplar, fotoğraflar ve videolar bırakın.
                Belirlediğiniz tarihe kadar mühürlü kalsın, o gün geldiğinde heyecanla açılsın.
              </p>
              <div className='space-y-6'>
                {[
                  {
                    icon: Hourglass,
                    title: 'Dijital Mühürleme',
                    desc: 'Belirlediğiniz açılış tarihine kadar içerikler tamamen gizli ve kilitli kalır'
                  },
                  {
                    icon: Video,
                    title: 'Zengin Medya Desteği',
                    desc: 'Sadece metin değil, o günkü duygularınızı anlatan video ve fotoğraflar ekleyin'
                  },
                  {
                    icon: MessageSquare,
                    title: 'Düşünceler & Yorumlar',
                    desc: 'Kapsül açıldığında o günden bugüne neler değiştiğini partnerinizle tartışın'
                  }
                ].map((item, i) => (
                  <div key={i} className='flex items-start space-x-4'>
                    <div className='w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0'>
                      <item.icon className='text-amber-600 w-6 h-6' />
                    </div>
                    <div>
                      <h4 className='font-bold text-gray-900 mb-1'>{item.title}</h4>
                      <p className='text-gray-600'>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='relative'>
              <div className='bg-white rounded-[3rem] p-8 md:p-10 border-2 border-amber-100 shadow-2xl relative overflow-hidden'>
                {/* Mock Time Capsule Card */}
                <div className='bg-white rounded-[2rem] p-6 border-2 border-amber-100 shadow-lg relative group transition-all'>
                  <div className='flex items-center justify-between mb-6'>
                    <div className='flex items-center space-x-3'>
                      <div className='w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-md'>
                        <Lock size={20} />
                      </div>
                      <span className='text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full text-amber-600 bg-amber-50'>
                        KİLİTLİ
                      </span>
                    </div>
                  </div>

                  <h3 className='font-bold text-2xl text-gray-900 mb-4'>1. Yıl Dönümü Mektubumuz</h3>

                  <div className='bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 mb-6 border border-amber-100/50'>
                    <div className='flex items-center space-x-3 mb-4'>
                      <Hourglass className='text-amber-600 animate-pulse' size={24} />
                      <div>
                        <p className='text-[10px] font-bold text-gray-500 uppercase tracking-wide'>Açılma Tarihi</p>
                        <p className='font-black text-gray-900 text-sm'>20 Ocak 2025</p>
                      </div>
                    </div>
                    <div className='bg-white rounded-xl p-3 text-center shadow-inner'>
                      <p className='text-3xl font-black text-amber-600'>342</p>
                      <p className='text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1'>gün kaldı</p>
                    </div>
                  </div>

                  <div className='flex items-center justify-between pt-6 border-t border-gray-100'>
                    <div className='flex items-center space-x-3'>
                      <div className='relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md'>
                        <Image src='/man-pp.png' alt='' fill className='object-cover' />
                      </div>
                      <div>
                        <p className='text-[10px] font-black text-gray-900 uppercase'>Ahmet</p>
                        <p className='text-[8px] font-bold text-gray-400 uppercase tracking-tighter'>20 Oca 2024</p>
                      </div>
                    </div>

                    <div className='flex items-center gap-2'>
                      <div className='flex items-center gap-1.5 bg-rose-50 text-rose-600 px-3 py-2 rounded-2xl border border-rose-100 shadow-sm'>
                        <ImageIcon size={14} strokeWidth={3} />
                        <span className='text-[10px] font-black'>5</span>
                      </div>
                      <div className='flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-2 rounded-2xl border border-amber-100 shadow-sm'>
                        <Video size={14} strokeWidth={3} />
                        <span className='text-[10px] font-black'>VİDEO</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Second Stacked Card Preview */}
                <div className='absolute -bottom-16 left-12 right-12 h-32 bg-white/40 backdrop-blur-sm rounded-t-[2rem] border-x-2 border-t-2 border-amber-50 opacity-50 shadow-2xl'></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Conversion */}
      <section
        id='cta-conversion'
        className='py-32 bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 relative overflow-hidden'
      >
        <div className='absolute inset-0 opacity-10 pointer-events-none'>
          <div className='absolute top-0 left-0 w-[800px] h-[800px] bg-white rounded-full blur-[120px]'></div>
          <div className='absolute bottom-0 right-0 w-[800px] h-[800px] bg-white rounded-full blur-[120px]'></div>
        </div>

        <div className='max-w-5xl mx-auto px-12 text-center relative z-10'>
          <div className='w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl'>
            <Layers className='text-white w-12 h-12' />
          </div>

          <h2 className='text-6xl md:text-7xl font-bold text-white mb-8 leading-tight'>
            Tüm Bu Sayfalar
            <br />
            <span className='opacity-90'>Sadece İkinize Özel Bir Adreste</span>
          </h2>

          <p className='text-2xl text-white/90 mb-16 leading-relaxed font-medium'>
            8 özel modül, sınırsız anı, tam güvenlik.{' '}
            <span className='bg-white/20 px-4 py-1 rounded-lg border border-white/30'>ahmet-ayse.ciftopia.com</span>{' '}
            gibi size özel bir dünyanız olsun.
          </p>

          <div className='flex flex-col sm:flex-row items-center justify-center gap-6 mb-16'>
            <Link
              href='/register'
              className='inline-flex items-center bg-white text-rose-500 px-12 py-6 rounded-full font-black text-2xl hover:shadow-2xl hover:scale-105 transition-all'
            >
              Kendi Sitemi Hemen Oluştur
              <ArrowRight className='ml-3 w-8 h-8' />
            </Link>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 text-white/80'>
            {[
              { icon: Check, text: '5 dakikada hazır' },
              { icon: Check, text: '7 gün ücretsiz' },
              { icon: Check, text: 'Kredi kartı gerekmez' }
            ].map((item, i) => (
              <div key={i} className='flex items-center justify-center space-x-3 font-bold text-xl'>
                <div className='w-8 h-8 bg-white/20 rounded-full flex items-center justify-center'>
                  <item.icon className='w-5 h-5 text-white' />
                </div>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}

function History(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' />
      <path d='M3 3v5h5' />
      <path d='M12 7v5l4 2' />
    </svg>
  )
}
