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
  ImageIcon,
  Rocket,
  ArrowUp,
  CheckCircle2,
  Send,
  ThumbsUp,
  ThumbsDown,
  Filter,
  ArrowDown,
  Edit2,
  Trash2,
  Film,
  Coffee,
  Home,
  Folder,
  LayoutGrid,
  ArrowUpRight,
  PenLine,
  BookOpen,
  ChevronRight,
  Trophy,
  Zap,
  TrendingUp,
  Target,
  Flag,
  ArrowLeft,
  ChevronUp,
  ChevronLeft
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { QuizPhoneWithDots } from './QuizPhoneWithDots'

export default function HowItWorksPage() {
  return (
    <div className='bg-gradient-to-br from-[#FFF5F5] via-pink-50/30 to-purple-50/20 -mt-10'>
      {/* Hero Section */}
      <section id='hero-section' className='relative overflow-hidden min-h-[600px] flex items-center'>
        <div className='absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50'>
          <div className='absolute top-20 left-20 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl animate-pulse'></div>
          <div
            className='absolute bottom-20 right-20 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl animate-pulse'
            style={{ animationDelay: '1s' }}
          ></div>
        </div>

        <div className='max-w-[1200px] mx-auto px-6 relative z-10 w-full'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-24 items-center'>
            <div className='space-y-6'>
              <div className='inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-5 py-2.5 rounded-full border border-rose-200/50 shadow-sm'>
                <Route className='text-rose-500 w-5 h-5' />
                <span className='text-sm font-semibold text-gray-700'>Sonsuz Anılar</span>
              </div>

              <h1 className='text-6xl md:text-7xl font-bold text-gray-900 leading-tight'>
                İlişkinizin
                <br />
                <span className='text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500'>
                  Her Yönü Bir Arada
                </span>
              </h1>

              <p className='text-xl text-gray-600 leading-relaxed max-w-xl'>
                Ciftopia&apos;nın birbirinden özel sayfaları, aşkınızın her detayını kaydetmenizi sağlıyor. Günlük
                sorulardan hayallerinize, anılardan zaman kapsüllerine kadar her şey burada.
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
        <div className='max-w-[1200px] mx-auto px-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-24 items-center'>
            <div>
              <h2 className='text-5xl md:text-6xl font-bold text-gray-900 mb-6'>
                Mobil Ana Ekran:
                <br />
                Dashboard
              </h2>
              <p className='text-xl text-gray-600 mb-8 leading-relaxed'>
                Uygulamayı açtığınızda sizi çift avatarı ve &quot;Ahmet &amp; Ayşe&quot; karşılar. Ütopyanız kaç gündür
                aktif, kaç anı, fotoğraf, şiir ve not biriktirdiğiniz tek bakışta görünür. Uzay Macerası, depolama,
                premium teklifi ve son aktiviteler hep bu ekranda; aşağı kaydırdıkça haftalık aktivite grafiği ve
                ipuçları da yer alır.
              </p>
              <div className='space-y-6'>
                {[
                  {
                    icon: LineChart,
                    title: 'İçerik özeti & istatistikler',
                    desc: 'Anı, fotoğraf, şiir ve not sayıları; haftalık aktivite çubuğu ve içerik dağılımı grafikleri'
                  },
                  {
                    icon: Database,
                    title: 'Depolama & yükseltme',
                    desc: 'Kullanılan alan çubuğu ve tek dokunuşla depolamayı yükselt; Premium teklifi her zaman görünür'
                  },
                  {
                    icon: ExternalLink,
                    title: 'Uzay Macerası & aktiviteler',
                    desc: 'Oyunlaştırılmış uzay deneyimine hızlı giriş ve partnerin son paylaşımları tek listede'
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

            {/* Mobil uygulama Dashboard mockup — mobile-app/app/(drawer)/dashboard.tsx ile birebir uyumlu */}
            <div className='relative flex justify-center'>
              <div className='w-[360px] h-[660px] rounded-[2.75rem] border-[14px] border-gray-800 shadow-2xl overflow-auto bg-[#FFF1F2]'>
                {/* Header — dashboard headerSection */}
                <div
                  className='pt-8 pb-6 px-4 relative overflow-hidden'
                  style={{ background: 'linear-gradient(135deg, #FF6B9D 0%, #C44569 50%, #FFA07A 100%)' }}
                >
                  <div className='absolute top-6 left-6 w-24 h-24 rounded-full bg-white/10' />
                  <div className='absolute bottom-6 right-6 w-28 h-28 rounded-full bg-white/10' />
                  <div className='relative flex flex-col items-center'>
                    <div className='flex items-center gap-2'>
                      <div className='w-12 h-12 rounded-full border-4 border-white overflow-hidden shadow-md bg-gray-200'>
                        <Image src='/man-pp.png' width={48} height={48} alt='' className='object-cover w-full h-full' />
                      </div>
                      <div className='w-8 h-8 flex items-center justify-center'>
                        <Heart className='text-[#FF6B9D] w-4 h-4 fill-[#FF6B9D]' />
                      </div>
                      <div className='w-12 h-12 rounded-full border-4 border-white overflow-hidden shadow-md bg-gray-200'>
                        <Image
                          src='/woman-pp.png'
                          width={48}
                          height={48}
                          alt=''
                          className='object-cover w-full h-full'
                        />
                      </div>
                    </div>
                    <p className='text-white text-sm font-medium mt-3 text-center' style={{ fontFamily: 'cursive' }}>
                      Ahmet & Ayşe
                    </p>
                  </div>
                </div>
                {/* Content — dashboard content */}
                <div className='px-3 pb-4 -mt-1'>
                  {/* Welcome Section */}
                  <div
                    className='rounded-[28px] overflow-hidden shadow-lg mb-4'
                    style={{ boxShadow: '0 8px 20px rgba(219,39,119,0.08)' }}
                  >
                    <div
                      className='px-4 py-5'
                      style={{ background: 'linear-gradient(135deg, #FFE4EC 0%, #FCE7F3 50%, #FDF2F8 100%)' }}
                    >
                      <p className='text-gray-900 font-semibold text-sm mb-1'>Merhaba Ahmet! 👋</p>
                      <span className='inline-block bg-rose-100/80 text-rose-700 text-[10px] font-medium px-2.5 py-1 rounded-full mb-3'>
                        ✨ Ütopyanız 23 gündür aktif
                      </span>
                      <p className='text-[10px] text-gray-500 mb-2'>İçerik özeti</p>
                      <div className='grid grid-cols-4 gap-1.5'>
                        {[
                          { label: 'Anı', val: '12', bg: '#FFF1F2', color: '#E11D48', icon: Clock },
                          { label: 'Fotoğraf', val: '45', bg: '#F3E8FF', color: '#7C3AED', icon: Images },
                          { label: 'Şiir', val: '8', bg: '#FEF3C7', color: '#D97706', icon: Feather },
                          { label: 'Not', val: '5', bg: '#D1FAE5', color: '#059669', icon: StickyNote }
                        ].map((s, i) => (
                          <div key={i} className='bg-white rounded-xl p-2 text-center border border-white/80 shadow-sm'>
                            <div
                              className='w-7 h-7 rounded-full flex items-center justify-center mx-auto mb-0.5'
                              style={{ backgroundColor: s.bg }}
                            >
                              <s.icon size={12} style={{ color: s.color }} />
                            </div>
                            <p className='text-[11px] font-bold text-gray-900'>{s.val}</p>
                            <p className='text-[8px] text-gray-500'>{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Uzay Macerası CTA */}
                  <div className='rounded-[26px] p-3.5 mb-4 shadow-xl bg-[#0F172A] border border-slate-700/50'>
                    <div className='flex items-start gap-2.5 mb-3'>
                      <div className='w-10 h-10 rounded-full bg-slate-800 border border-slate-600/50 flex items-center justify-center shrink-0'>
                        <Rocket className='text-amber-400 w-5 h-5' />
                      </div>
                      <div>
                        <p className='text-slate-200 font-semibold text-xs'>Uzay Macerası</p>
                        <p className='text-slate-400 text-[10px]'>- İlişkinizi kendi oluşturduğunuz uzayda keşfedin.</p>
                        <p className='text-slate-400 text-[10px]'>
                          - Eklediğiniz her içerik bir gök cismi haline gelir.
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-[9px] text-cyan-200/90 bg-cyan-900/30 px-2 py-0.5 rounded-full'>
                        Oyunlaştırılmış deneyim
                      </span>
                      <button
                        type='button'
                        className='flex items-center gap-1 bg-amber-400 text-slate-900 px-2.5 py-1.5 rounded-full text-[10px] font-semibold'
                      >
                        Uzay&apos;a Git <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                  {/* Depolama */}
                  <p className='text-gray-900 font-semibold text-xs mb-2'>Depolama</p>
                  <div className='bg-white rounded-[30px] p-3 shadow-md border border-gray-100 mb-2'>
                    <div className='flex justify-between items-center mb-2'>
                      <div>
                        <p className='text-[10px] text-gray-500'>Kullanılan Alan</p>
                        <p className='text-sm font-bold text-gray-900'>234 MB</p>
                      </div>
                      <div className='w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center'>
                        <Database className='text-blue-500 w-4 h-4' />
                      </div>
                    </div>
                    <div className='flex justify-between text-[10px] text-gray-500 mb-1'>
                      <span>234 MB / 1 GB</span>
                      <span>%23</span>
                    </div>
                    <div className='w-full h-1.5 bg-gray-100 rounded overflow-hidden mb-2'>
                      <div className='h-full w-[23%] rounded bg-gradient-to-r from-blue-500 to-cyan-500' />
                    </div>
                    <button
                      type='button'
                      className='w-full flex items-center justify-center gap-1.5 py-2 rounded-full text-white text-[10px] font-semibold bg-gradient-to-r from-blue-500 to-cyan-500'
                    >
                      <ArrowUp size={12} /> Depolamayı Yükselt
                    </button>
                  </div>
                  {/* Premium Promo */}
                  <div className='flex gap-2 p-2.5 rounded-[25px] border-2 border-amber-100 bg-amber-50/80'>
                    <div className='w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center shrink-0'>
                      <Crown className='text-white w-4 h-4' />
                    </div>
                    <div className='min-w-0'>
                      <p className='text-gray-900 font-semibold text-[11px]'>Premium&apos;a Geçin</p>
                      <p className='text-gray-600 text-[9px] mb-1'>
                        Sınırsız fotoğraf, geniş depolama ve tüm premium özellikler!
                      </p>
                      <span className='inline-block bg-amber-500 text-white text-[9px] font-medium px-2 py-0.5 rounded-full'>
                        Detayları Gör
                      </span>
                    </div>
                  </div>
                  {/* Son Aktiviteler */}
                  <p className='text-gray-900 font-semibold text-xs mt-3 mb-2'>Son Aktiviteler</p>
                  <div className='bg-white rounded-[30px] overflow-hidden shadow-md border border-gray-50'>
                    <div className='flex items-center gap-2 px-3 py-2 border-b border-gray-100'>
                      <div className='w-8 h-8 rounded-full overflow-hidden border-2 border-rose-100 bg-gray-100'>
                        <Image src='/man-pp.png' width={32} height={32} alt='' className='object-cover w-full h-full' />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className='text-[10px] text-gray-700'>
                          <span className='font-semibold text-gray-900'>Ahmet</span> yeni bir anı ekledi
                        </p>
                        <p className='text-[9px] text-gray-400'>2 dakika önce</p>
                      </div>
                    </div>
                    <div className='flex items-center justify-center py-2'>
                      <span className='text-rose-500 text-[10px] font-medium'>Tüm Aktiviteleri Gör</span>
                      <ArrowRight className='inline w-3 h-3 ml-0.5 text-rose-500' />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Module 1: Daily Questions */}
      <section id='module-daily-questions' className='py-32 relative'>
        <div className='max-w-[1200px] mx-auto px-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-24 items-center'>
            <div className='order-2 lg:order-2'>
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

            {/* Mobil Günlük Soru mockup — mobile-app/app/(drawer)/daily-question.tsx ile birebir uyumlu */}
            <div className='order-2 lg:order-1 flex justify-center'>
              <div className='w-[360px] rounded-[2.75rem] border-[14px] border-gray-800 shadow-2xl overflow-hidden bg-[#FDF2F8]'>
                <div className='px-4 py-4 h-[660px] overflow-y-auto'>
                  {/* Card — styles.card + cardSuccess */}
                  <div className='bg-white rounded-[40px] overflow-hidden shadow-lg border-2 border-[#D1FAE5]'>
                    {/* Card header — bothAnswered: green gradient */}
                    <div
                      className='px-5 py-4 flex justify-between items-center'
                      style={{ background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)' }}
                    >
                      <div className='flex items-center gap-2'>
                        <span className='text-white font-semibold text-sm'>Günün Sorusu</span>
                        <span className='text-base'>💕</span>
                      </div>
                      <div className='bg-white/20 rounded-full px-3 py-1.5 flex items-center gap-1.5'>
                        <CheckCircle2 size={12} className='text-white' />
                        <span className='text-white text-[10px] font-medium'>Tamamlandı</span>
                      </div>
                    </div>
                    {/* Card body */}
                    <div className='p-4'>
                      {/* Question box — qBoxSuccess */}
                      <div className='rounded-[25px] px-5 py-4 mb-4 bg-[#ECFDF5] text-center'>
                        <p className='text-gray-900 text-sm font-medium leading-snug'>
                          &quot;Birbirimizin ruhunda hangi köşeyi keşfettiğinde &apos;işte bu benim evim&apos;
                          dedin?&quot;
                        </p>
                      </div>
                      {/* Feedback row */}
                      <div className='mb-4'>
                        <p className='text-[11px] text-gray-500 mb-2'>Bu soruyu beğendin mi?</p>
                        <div className='flex gap-2'>
                          <button
                            type='button'
                            className='flex items-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 border-2 border-emerald-700 text-white text-[10px] font-medium'
                          >
                            <ThumbsUp size={14} fill='currentColor' /> Beğendim
                          </button>
                          <button
                            type='button'
                            className='flex items-center gap-1.5 py-2 px-3 rounded-xl bg-gray-100 border-2 border-gray-200 text-gray-600 text-[10px] font-medium'
                          >
                            <ThumbsDown size={14} /> Beğenmedim
                          </button>
                        </div>
                      </div>
                      {/* Info box success */}
                      <div className='flex gap-2.5 p-3 mb-4 rounded-[20px] bg-[#ECFDF5] border border-[#D1FAE5]'>
                        <div className='w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0'>
                          <Sparkles size={14} className='text-emerald-600' />
                        </div>
                        <div>
                          <p className='text-gray-900 font-semibold text-[11px]'>Harika! İkiniz de cevapladınız</p>
                          <p className='text-gray-600 text-[10px] mt-0.5'>Birbirinizin cevaplarını görebilirsiniz.</p>
                        </div>
                      </div>
                      {/* Answers container */}
                      <div className='space-y-4 mb-4'>
                        {/* Senin Cevabın */}
                        <div>
                          <div className='flex items-center gap-2 mb-2'>
                            <div className='w-7 h-7 rounded-full overflow-hidden border-2 border-rose-200 bg-gray-100'>
                              <Image
                                src='/man-pp.png'
                                width={28}
                                height={28}
                                alt=''
                                className='object-cover w-full h-full'
                              />
                            </div>
                            <span className='text-gray-700 text-[11px] font-medium'>Senin Cevabın</span>
                          </div>
                          <div className='bg-gray-50 rounded-[20px] p-3 border border-gray-100 min-h-[60px]'>
                            <p className='text-gray-900 text-[11px] leading-relaxed'>
                              &quot;Zayıf düştüğüm anlarda gösterdiğin şefkati gördüğümde... İşte o an ruhumun
                              dinlendiği yeri buldum.&quot;
                            </p>
                            <p className='text-[9px] text-gray-400 text-right mt-1'>5 dakika önce</p>
                          </div>
                        </div>
                        {/* Partnerinin Cevabı */}
                        <div>
                          <div className='flex items-center gap-2 mb-2'>
                            <div className='w-7 h-7 rounded-full overflow-hidden border-2 border-pink-200 bg-gray-100'>
                              <Image
                                src='/woman-pp.png'
                                width={28}
                                height={28}
                                alt=''
                                className='object-cover w-full h-full'
                              />
                            </div>
                            <span className='text-gray-700 text-[11px] font-medium'>Partnerinin Cevabı</span>
                          </div>
                          <div className='bg-rose-50 rounded-[20px] p-3 border border-rose-100 min-h-[60px]'>
                            <p className='text-gray-900 text-[11px] leading-relaxed'>
                              &quot;Hayallerimi anlatırken gözlerinde gördüğüm samimi heyecan... O an anladım ki ait
                              olduğum yer tam orası.&quot;
                            </p>
                            <p className='text-[9px] text-gray-400 text-right mt-1'>Az önce</p>
                          </div>
                        </div>
                      </div>
                      {/* AI box — aiBox gradient */}
                      <div
                        className='rounded-[25px] p-4 mb-4 border border-indigo-200'
                        style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 50%, #FFF1F2 100%)' }}
                      >
                        <div className='flex items-center gap-2 mb-2'>
                          <div className='w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center'>
                            <Sparkles size={12} className='text-indigo-600' />
                          </div>
                          <span className='text-[9px] font-semibold text-indigo-600 tracking-wider'>
                            AI ANALİZİ & YORUMU
                          </span>
                        </div>
                        <p className='text-gray-800 text-[11px] leading-relaxed'>
                          &quot;İkiniz arasındaki bağ, birbirinizin en savunmasız yanlarını sarıp sarmalayan derin bir
                          liman. Bu ruhsal uyum, köklü bir aşkın en güçlü temelidir.&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Aşk Quizleri — quiz.tsx lobby ile birebir */}
      <section id='module-quiz' className='py-32 bg-gradient-to-br from-pink-50 to-purple-50'>
        <div className='max-w-[1200px] mx-auto px-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-24 items-center'>
            <div className=''>
              <h2 className='text-5xl md:text-6xl font-bold text-gray-900 mb-6'>
                Birbirinizi Ne Kadar
                <br />
                Tanıyorsunuz?
              </h2>
              <p className='text-xl text-gray-600 mb-8 leading-relaxed'>
                Eğlenceli sorularla partnerinizi ne kadar tanıdığınızı test edin. İkiniz de cevaplayın, skorları
                karşılaştırın ve kim daha iyi tanıyor görelim.
              </p>
              <div className='space-y-6'>
                {[
                  {
                    icon: Heart,
                    title: 'Gerçek Zamanlı Çift Oyunu',
                    desc: 'Partnerinizle aynı anda aynı sorulara cevap verin; kendiniz ve birbiriniz için tahminler yapın'
                  },
                  {
                    icon: Trophy,
                    title: 'Skor & Galibiyet',
                    desc: 'Her quiz sonunda skorlar açıklanır, toplam galibiyetler ve başarı oranları takip edilir'
                  },
                  {
                    icon: Zap,
                    title: 'Günlük Limit veya Sınırsız',
                    desc: 'Ücretsiz planda günlük quiz hakkı; Premium ile sınırsız quiz çözebilirsiniz'
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

            {/* Mobil Aşk Quiz — 3 panelli swiper: Lobby → Sorular → Sonuç */}
            <div className='order-1 lg:order-2 flex justify-center'>
              <div className='w-[360px] rounded-[2.75rem] border-[14px] border-gray-800 shadow-2xl overflow-hidden bg-[#FDF2F8]'>
                <QuizPhoneWithDots>
                  {/* Panel 1: Lobby */}
                  <div className='w-full flex-shrink-0 snap-start snap-always overflow-hidden'>
                    <div
                      className='px-4 py-4 h-[660px] overflow-y-auto'
                      style={{ background: 'linear-gradient(180deg, #FFF5F5 0%, #FDF2F8 40%, #F3E8FF 100%)' }}
                    >
                      <div className='flex flex-col items-center pt-2 pb-4'>
                        <div className='w-16 h-16 rounded-full bg-[#FFE4E6] flex items-center justify-center mb-3'>
                          <Heart className='w-8 h-8 text-rose-500' fill='#E11D48' />
                        </div>
                        <p className='text-gray-900 font-bold text-center text-sm mb-1'>
                          Birbirimizi Ne Kadar Tanıyoruz? 💞
                        </p>
                        <p className='text-gray-600 text-[10px] text-center'>
                          Eğlenceli sorularla birbirinizi ne kadar tanıdığınızı test edin!
                        </p>
                      </div>
                      <div className='space-y-3 mb-4'>
                        <div
                          className='rounded-2xl p-4 min-h-[120px] flex flex-col justify-between'
                          style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%)' }}
                        >
                          <div className='flex items-center justify-between'>
                            <div className='w-10 h-10 rounded-full overflow-hidden border-2 border-white/30'>
                              <Image
                                src='/man-pp.png'
                                width={40}
                                height={40}
                                alt=''
                                className='object-cover w-full h-full'
                              />
                            </div>
                            <Trophy className='w-5 h-5 text-amber-300' />
                          </div>
                          <p className='text-white font-semibold text-xs'>Ahmet</p>
                          <p className='text-white/90 text-[10px]'>Galibiyet: 3 · Son: 4 · %80</p>
                        </div>
                        <div
                          className='rounded-2xl p-4 min-h-[120px] flex flex-col justify-between'
                          style={{ background: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 50%, #BE123C 100%)' }}
                        >
                          <div className='flex items-center justify-between'>
                            <div className='w-10 h-10 rounded-full overflow-hidden border-2 border-white/30'>
                              <Image
                                src='/woman-pp.png'
                                width={40}
                                height={40}
                                alt=''
                                className='object-cover w-full h-full'
                              />
                            </div>
                            <Crown className='w-5 h-5 text-amber-300' />
                          </div>
                          <p className='text-white font-semibold text-xs'>Ayşe</p>
                          <p className='text-white/90 text-[10px]'>Galibiyet: 2 · Son: 3 · %60</p>
                        </div>
                        <div
                          className='rounded-2xl p-4 flex flex-col items-center justify-center min-h-[100px]'
                          style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #4F46E5 100%)' }}
                        >
                          <Zap className='w-6 h-6 text-amber-200 mb-1' fill='#FDE047' />
                          <p className='text-white font-bold text-xs'>Yeni Quiz Başlat!</p>
                          <button
                            type='button'
                            className='mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-indigo-600 text-[10px] font-semibold'
                          >
                            <Play size={12} fill='#4F46E5' /> Hemen Başla
                          </button>
                        </div>
                      </div>
                      <div
                        className='rounded-t-2xl overflow-hidden'
                        style={{ background: 'linear-gradient(90deg, #F59E0B 0%, #F97316 100%)' }}
                      >
                        <div className='flex items-center gap-2 px-3 py-2'>
                          <TrendingUp className='w-5 h-5 text-white' />
                          <p className='text-white font-semibold text-[11px]'>Geçmiş Quizler</p>
                        </div>
                      </div>
                      <div className='bg-white rounded-b-2xl rounded-t-none border border-t-0 border-orange-100 p-2 mb-2'>
                        <div className='flex justify-between items-center'>
                          <span className='text-gray-900 font-medium text-[10px]'>Son quiz</span>
                          <span className='text-blue-600 font-bold text-xs'>4</span>
                          <span className='text-gray-300'>-</span>
                          <span className='text-rose-600 font-bold text-xs'>3</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Panel 2: Sorular (Playing) */}
                  <div className='w-[350px] min-w-[350px] flex-shrink-0 snap-start snap-always'>
                    <div className='px-4 py-3 h-[660px] overflow-y-auto bg-[#FDF2F8]'>
                      <div className='flex items-center justify-between mb-3'>
                        <span className='w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center' />
                        <p className='text-gray-900 font-bold text-xs'>Aşk Quizi</p>
                        <span className='w-6' />
                      </div>
                      <div className='flex gap-2 mb-3'>
                        <div className='flex-1 rounded-xl bg-blue-50 border border-blue-200 p-2 flex items-center gap-2'>
                          <div className='w-8 h-8 rounded-full overflow-hidden'>
                            <Image
                              src='/man-pp.png'
                              width={32}
                              height={32}
                              alt=''
                              className='object-cover w-full h-full'
                            />
                          </div>
                          <div>
                            <p className='text-gray-900 font-semibold text-[10px]'>Ahmet</p>
                            <p className='text-blue-600 font-bold text-sm'>2</p>
                          </div>
                        </div>
                        <div className='flex-1 rounded-xl bg-rose-50 border border-rose-200 p-2 flex items-center gap-2'>
                          <div className='w-8 h-8 rounded-full overflow-hidden'>
                            <Image
                              src='/woman-pp.png'
                              width={32}
                              height={32}
                              alt=''
                              className='object-cover w-full h-full'
                            />
                          </div>
                          <div>
                            <p className='text-gray-900 font-semibold text-[10px]'>Ayşe</p>
                            <p className='text-rose-600 font-bold text-sm'>1</p>
                          </div>
                        </div>
                      </div>
                      <div className='rounded-xl px-3 py-2 mb-3 flex items-center justify-center gap-2 bg-indigo-500 text-white'>
                        <Target size={12} />
                        <span className='text-[10px] font-medium'>Partnerinizin cevabını tahmin edin!</span>
                      </div>
                      <div className='bg-white rounded-[24px] overflow-hidden shadow-lg border border-gray-100'>
                        <div className='bg-gray-100 px-3 py-2'>
                          <div className='flex justify-between items-center mb-1'>
                            <span className='text-violet-600 text-[10px] font-medium'>Soru 2/5</span>
                            <span className='flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg text-violet-600 text-[10px]'>
                              <Clock size={10} /> 0:12
                            </span>
                          </div>
                          <div className='h-1.5 bg-gray-200 rounded-full overflow-hidden'>
                            <div
                              className='h-full w-2/5 rounded-full'
                              style={{ background: 'linear-gradient(90deg, #8B5CF6, #EC4899)' }}
                            />
                          </div>
                        </div>
                        <div className='p-3 text-center'>
                          <div className='w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center mx-auto mb-2'>
                            <Heart className='w-6 h-6 text-rose-500' fill='#E11D48' />
                          </div>
                          <p className='text-gray-900 font-medium text-xs leading-snug mb-2'>
                            Partneriniz en çok hangi çiçeği sever?
                          </p>
                          <p className='text-gray-500 text-[9px] mb-3'>Partneriniz için tahmin edin!</p>
                          <div className='space-y-1.5'>
                            {['Gül', 'Papatya', 'Lale'].map((opt, i) => (
                              <div
                                key={opt}
                                className={`flex items-center justify-between px-3 py-2 rounded-xl border text-[10px] ${i === 1 ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-gray-200 bg-gray-50 text-gray-700'}`}
                              >
                                {opt}
                                {i === 1 ? (
                                  <Check size={12} className='text-rose-500' />
                                ) : (
                                  <span className='w-3 h-3 rounded-full border-2 border-gray-300' />
                                )}
                              </div>
                            ))}
                          </div>
                          <button
                            type='button'
                            className='w-full mt-3 py-2.5 rounded-xl text-white text-[11px] font-semibold'
                            style={{ background: 'linear-gradient(90deg, #E11D48 0%, #FB7185 100%)' }}
                          >
                            Sonraki Soru
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Panel 3: Sonuç — quiz.tsx resultsScreen ile birebir */}
                  <div className='w-[280px] min-w-[280px] flex-shrink-0 snap-start snap-always'>
                    <div
                      className='px-3 pt-6 pb-6 h-[560px] overflow-y-auto'
                      style={{
                        background: 'linear-gradient(180deg, #FFF0F5 0%, #F3E5F5 40%, #E1BEE7 70%, #F8BBD0 100%)'
                      }}
                    >
                      {/* resultsHeader */}
                      <div className='text-center mb-5'>
                        <div className='inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full mb-3 bg-white/70 text-rose-600 shadow-sm'>
                          <Flag size={12} />
                          <span className='text-[11px] font-medium'>Quiz Tamamlandı</span>
                        </div>
                        <p className='text-gray-900 font-bold text-base mb-1'>Oyun Sona Erdi! 🔥</p>
                        <p className='text-gray-500 text-[11px]'>Kim daha iyi tanıyor bakalım...</p>
                      </div>

                      {/* gameResultCard */}
                      <div className='rounded-[28px] p-4 mb-4 bg-white/85 shadow-xl border border-amber-100/50 overflow-hidden'>
                        {/* winnerSection */}
                        <div className='flex flex-col items-center mb-5'>
                          <div className='relative w-16 h-16 flex items-center justify-center mb-3'>
                            <div
                              className='w-14 h-14 rounded-2xl bg-amber-400 flex items-center justify-center shadow-lg'
                              style={{ boxShadow: '0 8px 12px rgba(251,191,36,0.4)' }}
                            >
                              <Crown className='w-8 h-8 text-white' fill='white' />
                            </div>
                            <span className='absolute top-0 right-0 text-sm'>⭐</span>
                            <span className='absolute bottom-2 left-0 text-xs'>✨</span>
                          </div>
                          <p className='text-amber-800 font-bold text-sm text-center mb-1'>🏆 KAZANAN: AHMET! 🏆</p>
                          <p className='text-gray-500 text-[11px] text-center'>
                            Tebrikler! Ayşe daha iyi tanınıyorsun!
                          </p>
                        </div>

                        {/* podiumLayout — iki kart yan yana */}
                        <div className='flex gap-2 mb-4 items-end'>
                          {/* podiumFirst */}
                          <div className='flex-1 rounded-[20px] pt-6 pb-2 px-2 border-2 border-amber-400 bg-amber-50/80 shadow-md relative min-w-0 scale-105 origin-bottom'>
                            <div className='absolute -top-2.5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-amber-400 border-4 border-white flex items-center justify-center shadow text-base'>
                              🥇
                            </div>
                            <div className='flex items-center gap-1.5 mb-2'>
                              <div className='relative w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400 flex-shrink-0'>
                                <Image
                                  src='/man-pp.png'
                                  width={40}
                                  height={40}
                                  alt=''
                                  className='object-cover w-full h-full'
                                />
                                <div className='absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center'>
                                  <Trophy className='w-2.5 h-2.5 text-white' fill='white' />
                                </div>
                              </div>
                              <div className='min-w-0'>
                                <p className='text-gray-900 font-semibold text-[11px] truncate'>Ahmet</p>
                                <p className='text-amber-800 text-[9px] font-medium'>BİRİNCİ!</p>
                              </div>
                            </div>
                            <div className='bg-white rounded-xl p-2 border border-amber-100'>
                              <div className='flex items-baseline justify-center gap-0.5'>
                                <span className='text-amber-700 font-bold text-2xl'>4</span>
                                <span className='text-gray-500 text-[9px]'>/ 5 Doğru</span>
                              </div>
                              <div className='h-1 bg-gray-100 rounded-full mt-1 overflow-hidden'>
                                <div className='h-full w-4/5 rounded-full bg-amber-400' />
                              </div>
                            </div>
                          </div>
                          {/* podiumSecond */}
                          <div className='flex-1 rounded-[20px] pt-6 pb-2 px-2 border-2 border-gray-200 bg-gray-50/80 shadow relative min-w-0'>
                            <div className='absolute -top-2.5 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-gray-200 border-4 border-white flex items-center justify-center shadow text-sm'>
                              🥈
                            </div>
                            <div className='flex items-center gap-1.5 mb-2'>
                              <div className='w-9 h-9 rounded-full overflow-hidden border-2 border-gray-300 flex-shrink-0'>
                                <Image
                                  src='/woman-pp.png'
                                  width={36}
                                  height={36}
                                  alt=''
                                  className='object-cover w-full h-full'
                                />
                              </div>
                              <div className='min-w-0'>
                                <p className='text-gray-900 font-semibold text-[10px] truncate'>Ayşe</p>
                                <p className='text-gray-500 text-[9px]'>İkinci</p>
                              </div>
                            </div>
                            <div className='bg-white rounded-xl p-1.5 border border-gray-100'>
                              <div className='flex items-baseline justify-center gap-0.5'>
                                <span className='text-gray-600 font-bold text-xl'>3</span>
                                <span className='text-gray-500 text-[9px]'>/ 5 Doğru</span>
                              </div>
                              <div className='h-0.5 bg-gray-100 rounded-full mt-1 overflow-hidden'>
                                <div className='h-full w-3/5 rounded-full bg-gray-400' />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* finalDiffContainer */}
                        <div className='flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white border-2 border-amber-100 shadow-sm'>
                          <div className='w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-base'>
                            🎯
                          </div>
                          <div className='text-center'>
                            <p className='text-gray-500 text-[10px] mb-0.5'>Skor Farkı</p>
                            <p className='text-amber-700 font-bold text-lg'>4 - 3</p>
                          </div>
                          <div className='w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-base'>
                            🏁
                          </div>
                        </div>
                      </div>

                      {/* resultsLobbyButton */}
                      <button
                        type='button'
                        className='w-full py-3 rounded-2xl bg-white border-2 border-gray-200 text-gray-600 text-sm font-medium'
                      >
                        Lobiye Dön
                      </button>
                    </div>
                  </div>
                </QuizPhoneWithDots>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Module 2: Memories */}
      <section id='module-memories' className='py-32 bg-gradient-to-br from-rose-50 to-pink-50'>
        <div className='max-w-[1200px] mx-auto px-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-24 items-center'>
            <div className='order-2'>
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

            {/* Mobil Anılar mockup — mobile-app/app/(drawer)/memories.tsx ile birebir uyumlu */}
            <div className='flex justify-center'>
              <div className='w-[360px] rounded-[2.75rem] border-[14px] border-gray-800 shadow-2xl overflow-hidden bg-[#FFF1F2]'>
                <div className='px-3 py-4 h-[660px] overflow-y-auto'>
                  {/* headerSection */}
                  <div className='bg-white rounded-[24px] p-4 shadow-md border border-gray-100 mb-4'>
                    <div className='flex justify-between items-center mb-5'>
                      <div className='flex items-center gap-3'>
                        <div className='relative'>
                          <div
                            className='w-12 h-12 rounded-[22px] flex items-center justify-center'
                            style={{ background: 'linear-gradient(135deg, #E91E63 0%, #FF6B6B 100%)' }}
                          >
                            <Clock className='text-white w-6 h-6' />
                          </div>
                          <div className='absolute -top-0.5 -right-0.5 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white'>
                            <Heart className='text-white w-2.5 h-2.5' fill='white' />
                          </div>
                        </div>
                        <div>
                          <p className='text-gray-900 font-bold text-sm'>Anılarımız</p>
                          <p className='text-gray-500 text-[10px]'>Birlikte yazdığımız hikaye...</p>
                        </div>
                      </div>
                      <button
                        type='button'
                        className='rounded-[20px] overflow-hidden'
                        style={{ background: 'linear-gradient(135deg, #E91E63 0%, #FF6B6B 100%)' }}
                      >
                        <span className='flex items-center gap-1.5 px-3 py-2.5'>
                          <Plus className='text-white w-5 h-5' />
                          <Sparkles className='w-4 h-4 text-amber-300' />
                        </span>
                      </button>
                    </div>
                    {/* statsContainer */}
                    <div className='flex bg-gray-50 rounded-[20px] p-3 border border-gray-100'>
                      <div className='flex-1 text-center'>
                        <p className='text-gray-900 font-bold text-sm'>12</p>
                        <p className='text-[10px] text-gray-500 mt-0.5'>Toplam</p>
                      </div>
                      <div className='w-px bg-gray-200' />
                      <div className='flex-1 text-center'>
                        <p className='text-gray-900 font-bold text-sm'>3</p>
                        <p className='text-[10px] text-gray-500 mt-0.5'>Bu Ay</p>
                      </div>
                      <div className='w-px bg-gray-200' />
                      <div className='flex-1 text-center'>
                        <p className='text-gray-900 font-bold text-sm'>5</p>
                        <p className='text-[10px] text-gray-500 mt-0.5'>Favoriler</p>
                      </div>
                    </div>
                    {/* filtersWrapper */}
                    <div className='mt-4 space-y-2'>
                      <div className='flex justify-between items-center'>
                        <div className='flex items-center gap-2'>
                          <Filter className='w-4 h-4 text-rose-500' />
                          <span className='text-gray-900 font-semibold text-xs'>Filtrele & Sırala</span>
                        </div>
                        <button
                          type='button'
                          className='flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1 text-[10px] text-gray-500'
                        >
                          <Star className='w-3 h-3' /> Sadece Favoriler
                        </button>
                      </div>
                      <div className='flex gap-2 overflow-x-auto pb-1'>
                        <span className='shrink-0 px-3 py-1.5 rounded-[15px] bg-gray-900 text-white text-[10px] font-medium'>
                          Tümü
                        </span>
                        <span className='shrink-0 px-3 py-1.5 rounded-[15px] bg-white border border-gray-200 text-gray-500 text-[10px] flex items-center gap-1'>
                          <Heart className='w-3 h-3 text-rose-500' fill='#F43F5E' /> Romantik
                        </span>
                      </div>
                      <div className='flex gap-2'>
                        <span className='shrink-0 px-2.5 py-1 rounded-xl border border-rose-500 bg-rose-50 text-rose-600 text-[10px]'>
                          🆕 En yeni
                        </span>
                        <span className='shrink-0 px-2.5 py-1 rounded-xl bg-white border border-gray-200 text-gray-500 text-[10px]'>
                          🕰️ En eski
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* timelineSection — çizgi solda */}
                  <div className='relative pl-4'>
                    <div className='absolute left-[11px] top-0 bottom-0 w-0.5 bg-rose-500/20' />
                    {/* monthMarker */}
                    <div className='flex items-center py-2 z-10'>
                      <div className='w-6 h-6 rounded-full bg-white border-2 border-rose-500 flex items-center justify-center shrink-0'>
                        <Calendar className='w-3 h-3 text-rose-500' />
                      </div>
                      <span className='text-rose-500 text-xs font-medium ml-2 capitalize'>Şubat 2024</span>
                    </div>
                    {/* MemoryCard */}
                    <div className='flex gap-0 mb-3'>
                      <div className='w-[52px] flex justify-center pt-3 shrink-0'>
                        <div className='w-7 h-7 rounded-full bg-rose-100 border-2 border-white shadow flex items-center justify-center'>
                          <Heart className='w-3.5 h-3.5 text-rose-500' fill='#F43F5E' />
                        </div>
                      </div>
                      <div className='flex-1 min-w-0 rounded-[20px] bg-white border border-gray-100 shadow overflow-hidden'>
                        <div className='h-24 bg-rose-200 relative overflow-hidden'>
                          <Image
                            src='/banner_image.png'
                            alt=''
                            width={200}
                            height={96}
                            className='object-cover w-full h-full'
                          />
                          <div className='absolute top-1.5 right-1.5 bg-black/50 rounded-lg px-1.5 py-0.5 flex items-center gap-1'>
                            <Images className='w-2.5 h-2.5 text-white' />
                            <span className='text-white text-[8px]'>1 fotoğraf</span>
                          </div>
                        </div>
                        <div className='p-3'>
                          <p className='text-gray-900 font-semibold text-xs mb-1.5'>İlk Buluşma</p>
                          <div className='flex flex-wrap gap-2 mb-2'>
                            <span className='flex items-center gap-0.5 text-[9px] text-gray-500'>
                              <Calendar className='w-2.5 h-2.5 text-rose-500' /> 14 Şubat 2024
                            </span>
                            <span className='flex items-center gap-0.5 text-[9px] text-gray-500'>
                              <MapPin className='w-2.5 h-2.5 text-rose-500' /> Kadıköy
                            </span>
                          </div>
                          <p className='text-[10px] text-gray-600 leading-tight line-clamp-2 mb-2'>
                            O gün zamanın nasıl geçtiğini hiç anlamamıştık...
                          </p>
                          <div className='flex justify-between items-center pt-2 border-t border-gray-100'>
                            <span className='bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full text-[9px] font-medium flex items-center gap-0.5'>
                              <Heart className='w-2.5 h-2.5' fill='#F43F5E' /> Romantik
                            </span>
                            <span className='flex gap-1'>
                              <Edit2 className='w-3 h-3 text-blue-500' />
                              <Trash2 className='w-3 h-3 text-red-500' />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Daha Fazla Anı Yükle */}
                    <div className='flex justify-center mt-2 ml-12'>
                      <button
                        type='button'
                        className='flex items-center gap-2 py-2 px-4 rounded-xl bg-rose-50 text-rose-500 text-[10px] font-medium'
                      >
                        <ArrowDown className='w-4 h-4' /> Daha Fazla Anı Yükle
                      </button>
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
        <div className='max-w-[1200px] mx-auto px-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-24 items-center'>
            <div>
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

            {/* Mobil Galeri mockup — mobile-app/app/(drawer)/gallery.tsx ile birebir uyumlu */}
            <div className='order-2 lg:order-1 flex justify-center'>
              <div className='w-[360px] rounded-[2.75rem] border-[14px] border-gray-800 shadow-2xl overflow-hidden bg-[#F8F9FA]'>
                <div className='px-3 py-4 h-[660px] overflow-y-auto'>
                  {/* header — titleRow + viewToggle */}
                  <div className='mb-5'>
                    <div className='flex justify-between items-center mb-5'>
                      <div className='flex items-center gap-3'>
                        <div className='w-12 h-12 bg-[#9333EA] rounded-[18px] flex items-center justify-center shadow-lg shadow-purple-500/30 rotate-[3deg]'>
                          <Camera className='text-white w-7 h-7' />
                        </div>
                        <div>
                          <p className='text-gray-900 font-bold text-sm'>Galerimiz</p>
                          <p className='text-gray-500 text-[10px]'>En güzel anlar...</p>
                        </div>
                      </div>
                      <button
                        type='button'
                        className='rounded-[18px] overflow-hidden shadow-lg shadow-rose-500/30'
                        style={{ background: 'linear-gradient(90deg, #E91E63 0%, #FF6B6B 100%)' }}
                      >
                        <span className='flex items-center justify-center p-2.5'>
                          <Plus className='text-white w-5 h-5' />
                        </span>
                      </button>
                    </div>
                    {/* viewToggleInner */}
                    <div className='flex justify-center'>
                      <div className='inline-flex bg-white rounded-[30px] p-1 border border-gray-100 shadow-sm'>
                        <button
                          type='button'
                          className='flex items-center gap-2 px-4 py-2 rounded-[25px] bg-rose-500 text-white text-[10px] font-medium'
                        >
                          <Folder size={14} /> Albümler
                        </button>
                        <button
                          type='button'
                          className='flex items-center gap-2 px-4 py-2 rounded-[25px] text-gray-500 text-[10px] font-medium'
                        >
                          <LayoutGrid size={14} /> Izgara
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* albumGrid — 2 album cards */}
                  <div className='space-y-4'>
                    <div className='bg-white rounded-[35px] overflow-hidden border border-gray-100 shadow-md'>
                      <div className='h-28 relative overflow-hidden'>
                        <Image
                          src='/banner_image.png'
                          alt=''
                          width={248}
                          height={112}
                          className='object-cover w-full h-full'
                        />
                        <div className='absolute inset-0 bg-gradient-to-t from-black/80 to-transparent' />
                        <div className='absolute bottom-3 left-3 right-3'>
                          <p className='text-white font-bold text-sm'>Tatil 2024</p>
                          <div className='flex items-center justify-between mt-1'>
                            <span className='flex items-center gap-1 text-white/90 text-[9px]'>
                              <Images size={10} /> 47 fotoğraf
                            </span>
                            <span className='text-white/90 text-[9px]'>1 ay önce</span>
                          </div>
                        </div>
                      </div>
                      <div className='p-3'>
                        <p className='text-[10px] text-gray-600 line-clamp-2 mb-2'>Deniz, kum, güneş...</p>
                        <div className='flex items-center justify-between'>
                          <div className='flex -space-x-2'>
                            <div className='w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gray-100'>
                              <Image
                                src='/woman-pp.png'
                                width={24}
                                height={24}
                                alt=''
                                className='object-cover w-full h-full'
                              />
                            </div>
                            <div className='w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gray-100'>
                              <Image
                                src='/man-pp.png'
                                width={24}
                                height={24}
                                alt=''
                                className='object-cover w-full h-full'
                              />
                            </div>
                          </div>
                          <div className='w-7 h-7 rounded-full bg-rose-50 flex items-center justify-center'>
                            <ArrowUpRight className='w-3.5 h-3.5 text-rose-500' />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='bg-white rounded-[35px] overflow-hidden border border-gray-100 shadow-md'>
                      <div className='h-28 relative overflow-hidden bg-gray-100 flex items-center justify-center'>
                        <Images className='w-10 h-10 text-gray-300' />
                        <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
                        <div className='absolute bottom-3 left-3 right-3'>
                          <p className='text-white font-bold text-sm'>Nişanımız</p>
                          <div className='flex items-center justify-between mt-1'>
                            <span className='flex items-center gap-1 text-white/90 text-[9px]'>
                              <Images size={10} /> 128 fotoğraf
                            </span>
                            <span className='text-white/90 text-[9px]'>3 ay önce</span>
                          </div>
                        </div>
                      </div>
                      <div className='p-3'>
                        <p className='text-[10px] text-gray-600 line-clamp-2 mb-2'>En mutlu günümüz</p>
                        <div className='flex items-center justify-between'>
                          <div className='flex -space-x-2'>
                            <div className='w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gray-100'>
                              <Image
                                src='/woman-pp.png'
                                width={24}
                                height={24}
                                alt=''
                                className='object-cover w-full h-full'
                              />
                            </div>
                            <div className='w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gray-100'>
                              <Image
                                src='/man-pp.png'
                                width={24}
                                height={24}
                                alt=''
                                className='object-cover w-full h-full'
                              />
                            </div>
                          </div>
                          <div className='w-7 h-7 rounded-full bg-rose-50 flex items-center justify-center'>
                            <ArrowUpRight className='w-3.5 h-3.5 text-rose-500' />
                          </div>
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

      {/* Module 4: Bucket List */}
      <section id='module-bucket-list' className='py-32 bg-gradient-to-br from-amber-50 to-orange-50'>
        <div className='max-w-[1200px] mx-auto px-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-24 items-center'>
            <div className='order-2'>
              <h2 className='text-5xl md:text-6xl font-bold text-gray-900 mb-6'>
                Hayaller &
                <br />
                Yapılacaklar Listesi
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

            {/* Mobil Hayallerimiz mockup — mobile-app/app/(drawer)/bucket-list.tsx ile birebir uyumlu */}
            <div className='flex justify-center'>
              <div className='w-[360px] rounded-[2.75rem] border-[14px] border-gray-800 shadow-2xl overflow-hidden bg-[#FFF1F2]'>
                <div className='px-3 py-4 h-[660px] overflow-y-auto'>
                  {/* headerSection */}
                  <div className='px-2 pt-2 pb-4'>
                    <div className='flex justify-between items-center mb-4'>
                      <div>
                        <p className='text-gray-900 font-bold text-base'>Hayallerimiz ✨</p>
                        <p className='text-gray-600 text-[10px] mt-0.5'>Birlikte gerçekleştireceğimiz her şey...</p>
                      </div>
                      <button
                        type='button'
                        className='rounded-[20px] overflow-hidden shadow-lg shadow-rose-500/30'
                        style={{ background: 'linear-gradient(90deg, #F43F5E 0%, #EC4899 100%)' }}
                      >
                        <span className='flex items-center justify-center p-2.5'>
                          <Plus className='text-white w-5 h-5' />
                        </span>
                      </button>
                    </div>
                    {/* progressCard */}
                    <div
                      className='rounded-[35px] p-4 border-2 border-[#EDE9FE] shadow-md'
                      style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)' }}
                    >
                      <div className='flex justify-between items-center mb-3'>
                        <div>
                          <p className='text-[10px] font-semibold text-violet-700 tracking-wider mb-1'>
                            İLERLEME DURUMU
                          </p>
                          <p className='text-violet-600 font-bold text-sm'>
                            12/25 <span className='text-violet-400 font-normal text-[10px]'>hayal tamamlandı</span>
                          </p>
                        </div>
                        <div className='w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md text-xl'>
                          🏆
                        </div>
                      </div>
                      <div className='mb-3'>
                        <div className='flex justify-between items-end mb-1'>
                          <span className='text-violet-700/70 text-[10px]'>Tamamlanma Oranı</span>
                          <span className='text-violet-600 font-bold text-sm'>%48</span>
                        </div>
                        <div className='h-2 bg-white rounded-lg p-0.5 shadow-inner overflow-hidden'>
                          <div className='h-full rounded-md bg-violet-500' style={{ width: '48%' }} />
                        </div>
                      </div>
                      <p className='text-violet-800 text-[10px]'>
                        Harika gidiyorsunuz! 13 hedef daha tamamlayın ve %100&apos;e ulaşın! 🔥
                      </p>
                    </div>
                  </div>

                  {/* filtersSection */}
                  <div className='px-2 mb-4'>
                    <div className='flex gap-2 mb-3 overflow-x-auto pb-1'>
                      <button
                        type='button'
                        className='shrink-0 flex items-center gap-2 px-3 py-2 rounded-[15px] bg-rose-500 border border-rose-500 text-white text-[10px] font-medium'
                      >
                        Tümü <span className='bg-white/30 px-1.5 py-0.5 rounded-lg text-[9px]'>25</span>
                      </button>
                      <button
                        type='button'
                        className='shrink-0 flex items-center gap-2 px-3 py-2 rounded-[15px] bg-white border border-gray-100 text-gray-500 text-[10px]'
                      >
                        Yapıldı ✓{' '}
                        <span className='bg-gray-100 px-1.5 py-0.5 rounded-lg text-[9px] text-gray-500'>12</span>
                      </button>
                      <button
                        type='button'
                        className='shrink-0 flex items-center gap-2 px-3 py-2 rounded-[15px] bg-white border border-gray-100 text-gray-500 text-[10px]'
                      >
                        Bekliyor{' '}
                        <span className='bg-gray-100 px-1.5 py-0.5 rounded-lg text-[9px] text-gray-500'>13</span>
                      </button>
                    </div>
                    <div className='flex gap-2 overflow-x-auto pb-1'>
                      <span className='shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-100 border border-indigo-400 text-indigo-600 text-[10px]'>
                        <Sparkles size={12} /> Tümü
                      </span>
                      <span className='shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-100 text-gray-500 text-[10px]'>
                        <Film size={12} /> Deneyim
                      </span>
                      <span className='shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-100 text-gray-500 text-[10px]'>
                        <MapPin size={12} /> Seyahat
                      </span>
                      <span className='shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-100 text-gray-500 text-[10px]'>
                        <Coffee size={12} /> Yemek
                      </span>
                    </div>
                  </div>

                  {/* content — sectionTitle + DreamCards */}
                  <div className='px-2'>
                    <p className='text-gray-900 font-bold text-sm mb-3'>✨ Tüm Hayallerimiz</p>
                    {/* DreamCard completed */}
                    <div className='rounded-[30px] overflow-hidden border-2 border-emerald-100 shadow-md mb-3 bg-gradient-to-br from-emerald-50 to-green-50'>
                      <div className='p-3 flex gap-2'>
                        <div className='w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0'>
                          <Check className='w-5 h-5 text-emerald-600' />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-gray-400 text-xs line-through font-semibold'>Paris&apos;te Eyfel Kulesi</p>
                          <div className='flex flex-wrap gap-1.5 mt-1'>
                            <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[9px] font-medium uppercase'>
                              <MapPin size={10} /> Seyahat
                            </span>
                          </div>
                          <div className='flex items-center gap-1.5 mt-2'>
                            <Check size={10} className='text-emerald-600' />
                            <span className='text-emerald-600 text-[9px]'>14 Şubat 2024&apos;de tamamlandı</span>
                          </div>
                          <div className='flex items-center gap-1.5 mt-2'>
                            <div className='w-4 h-4 rounded-full overflow-hidden border border-white bg-gray-200'>
                              <Image
                                src='/man-pp.png'
                                width={16}
                                height={16}
                                alt=''
                                className='w-full h-full object-cover'
                              />
                            </div>
                            <span className='text-gray-400 text-[8px] uppercase tracking-wide'>
                              Ahmet tarafından eklendi
                            </span>
                          </div>
                        </div>
                        <Trash2 className='w-4 h-4 text-gray-300 shrink-0 mt-0.5' />
                      </div>
                    </div>
                    {/* DreamCard pending */}
                    <div className='rounded-[30px] overflow-hidden border-2 border-transparent shadow-md bg-white'>
                      <div className='p-3 flex gap-2'>
                        <div className='w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0'>
                          <Check className='w-5 h-5 text-amber-600' />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-gray-900 text-xs font-semibold'>Paraşütle atlamak</p>
                          <div className='flex flex-wrap gap-1.5 mt-1'>
                            <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 text-[9px] font-medium uppercase'>
                              <Film size={10} /> Deneyim
                            </span>
                          </div>
                          <div className='flex items-center gap-1.5 mt-2'>
                            <div className='w-4 h-4 rounded-full overflow-hidden border border-white bg-gray-200'>
                              <Image
                                src='/woman-pp.png'
                                width={16}
                                height={16}
                                alt=''
                                className='w-full h-full object-cover'
                              />
                            </div>
                            <span className='text-gray-400 text-[8px] uppercase tracking-wide'>
                              Ayşe tarafından eklendi
                            </span>
                          </div>
                        </div>
                        <Trash2 className='w-4 h-4 text-gray-300 shrink-0 mt-0.5' />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Module 5: Important Dates */}
      <section id='module-important-dates' className='py-32'>
        <div className='max-w-[1200px] mx-auto px-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-24 items-center'>
            <div>
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

            {/* Mobil Önemli Tarihler — important-dates.tsx ile birebir */}
            <div className='order-2 lg:order-1 flex justify-center'>
              <div className='w-[360px] rounded-[2.75rem] border-[14px] border-gray-800 shadow-2xl overflow-hidden bg-[#F8F9FA]'>
                <div className='px-3 py-4 h-[660px] overflow-y-auto'>
                  {/* header — titleRow */}
                  <div className='flex justify-between items-start mb-5'>
                    <div>
                      <p className='text-gray-900 font-bold text-sm'>Önemli Tarihlerimiz 📅</p>
                      <p className='text-gray-500 text-[10px] mt-1'>Asla unutmak istemediğiniz anları kaydedin</p>
                    </div>
                    <button
                      type='button'
                      className='rounded-[18px] overflow-hidden shadow-md'
                      style={{ boxShadow: '0 4px 8px rgba(244,63,94,0.3)' }}
                    >
                      <span
                        className='flex items-center justify-center w-11 h-11'
                        style={{ background: 'linear-gradient(90deg, #F43F5E 0%, #EC4899 100%)' }}
                      >
                        <Plus size={20} className='text-white' />
                      </span>
                    </button>
                  </div>

                  {/* Yaklaşanlar */}
                  <div className='bg-white rounded-[30px] p-3 mb-4 border border-gray-100 shadow-sm'>
                    <div className='flex items-center justify-between mb-3'>
                      <p className='text-gray-900 font-semibold text-xs'>Yaklaşanlar</p>
                      <div className='w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center'>
                        <Clock size={14} className='text-rose-500' />
                      </div>
                    </div>
                    <div className='flex gap-2 overflow-x-auto pb-1'>
                      <div className='bg-rose-50 rounded-[20px] p-3 border-2 border-rose-200 min-w-[140px] shrink-0'>
                        <div className='flex items-center gap-2 mb-2'>
                          <div className='w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm text-base'>
                            💒
                          </div>
                          <div className='min-w-0'>
                            <p className='text-gray-900 font-medium text-[11px] truncate'>1. Yıldönümü</p>
                            <p className='text-gray-400 text-[9px] uppercase'>20 Ocak</p>
                          </div>
                        </div>
                        <div className='bg-white rounded-xl py-1.5 text-center'>
                          <span className='text-rose-500 text-[10px] font-semibold'>45 gün sonra</span>
                        </div>
                      </div>
                      <div className='bg-gray-50 rounded-[20px] p-3 border border-gray-200 min-w-[140px] shrink-0'>
                        <div className='flex items-center gap-2 mb-2'>
                          <div className='w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm text-base'>
                            🎂
                          </div>
                          <div className='min-w-0'>
                            <p className='text-gray-900 font-medium text-[11px] truncate'>Doğum günü</p>
                            <p className='text-gray-400 text-[9px] uppercase'>15 Mart</p>
                          </div>
                        </div>
                        <div className='bg-white rounded-xl py-1.5 text-center'>
                          <span className='text-gray-500 text-[10px]'>95 gün sonra</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className='flex gap-2 overflow-x-auto mb-4 pb-1'>
                    <span className='px-3 py-2 rounded-[15px] bg-gray-900 text-white text-[10px] font-medium uppercase tracking-wide shrink-0'>
                      Tümü
                    </span>
                    <span className='px-3 py-2 rounded-[15px] bg-white border border-gray-200 text-gray-500 text-[10px] uppercase shrink-0'>
                      Tanışma
                    </span>
                    <span className='px-3 py-2 rounded-[15px] bg-white border border-gray-200 text-gray-500 text-[10px] uppercase shrink-0'>
                      İlişki
                    </span>
                    <span className='px-3 py-2 rounded-[15px] bg-white border border-gray-200 text-gray-500 text-[10px] uppercase shrink-0'>
                      Evlilik
                    </span>
                    <span className='px-3 py-2 rounded-[15px] bg-white border border-gray-200 text-gray-500 text-[10px] uppercase shrink-0'>
                      Doğum Günü
                    </span>
                  </div>

                  {/* Timeline + card */}
                  <div className='relative pl-8'>
                    <div className='absolute left-[11px] top-0 bottom-0 w-0.5 bg-gray-200 rounded-full' />
                    <div className='relative flex gap-3 mb-4'>
                      <div className='absolute left-0 top-5 w-3 h-3 rounded-full bg-rose-500 border-2 border-white shadow' />
                      <div className='bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-2'>
                          <div
                            className='w-9 h-9 rounded-xl flex items-center justify-center text-base'
                            style={{ backgroundColor: '#F3E8FF' }}
                          >
                            💒
                          </div>
                          <div className='min-w-0'>
                            <p className='text-gray-900 font-semibold text-xs'>Evlilik Yıldönümü</p>
                            <p className='text-gray-500 text-[9px]'>20 Ocak 2025</p>
                          </div>
                        </div>
                        <div className='flex flex-wrap gap-1.5'>
                          <span className='inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 text-rose-600 text-[9px]'>
                            <Clock size={10} /> Gelecek
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='relative flex gap-3'>
                      <div className='absolute left-0 top-5 w-3 h-3 rounded-full bg-gray-300 border-2 border-white shadow' />
                      <div className='bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex-1 min-w-0 opacity-90'>
                        <div className='flex items-center gap-2 mb-2'>
                          <div className='w-9 h-9 rounded-xl flex items-center justify-center text-base bg-amber-50'>
                            🎂
                          </div>
                          <div className='min-w-0'>
                            <p className='text-gray-900 font-semibold text-xs'>Doğum günü</p>
                            <p className='text-gray-500 text-[9px]'>15 Mart 2025</p>
                          </div>
                        </div>
                        <div className='flex flex-wrap gap-1.5'>
                          <span className='inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 text-gray-500 text-[9px]'>
                            <Clock size={10} /> Gelecek
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

      {/* Module 6: Poems */}
      <section id='module-poems' className='py-32 bg-gradient-to-br from-purple-50 to-pink-50'>
        <div className='max-w-[1200px] mx-auto px-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-24 items-center'>
            <div className='order-2'>
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

            {/* Mobil Şiirler mockup — mobile-app/app/(drawer)/poems.tsx ile birebir uyumlu */}
            <div className='flex justify-center'>
              <div className='w-[360px] rounded-[2.75rem] border-[14px] border-gray-800 shadow-2xl overflow-hidden bg-[#F9FAFB]'>
                <div className='px-3 py-4 h-[660px] overflow-y-auto'>
                  {/* headerBox — headerGradient */}
                  <div
                    className='rounded-[40px] border border-[#EDE9FE] p-4 mb-4'
                    style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #FDF2F8 100%)' }}
                  >
                    <div className='flex justify-between items-center mb-4'>
                      <div className='flex items-center gap-3'>
                        <div className='w-11 h-11 rounded-[15px] bg-[#8B5CF6] flex items-center justify-center shadow-lg shadow-purple-500/30'>
                          <Feather className='text-white w-5 h-5' />
                        </div>
                        <div>
                          <p className='text-gray-900 font-bold text-sm'>Şiirlerimiz</p>
                          <p className='text-gray-500 text-[10px]'>Duygusal dizeler...</p>
                        </div>
                      </div>
                      <button
                        type='button'
                        className='rounded-[15px] overflow-hidden'
                        style={{ background: 'linear-gradient(90deg, #8B5CF6 0%, #EC4899 100%)' }}
                      >
                        <span className='flex items-center gap-2 px-4 py-2 text-white text-[10px] font-medium'>
                          <Pen size={12} /> Yaz
                        </span>
                      </button>
                    </div>
                    {/* statsRow */}
                    <div className='flex gap-2'>
                      <div className='flex-1 rounded-[20px] bg-white border-2 border-[#8B5CF6] py-2 text-center shadow-sm'>
                        <p className='text-[#8B5CF6] font-bold text-sm'>12</p>
                        <p className='text-[10px] text-gray-400 uppercase'>Toplam</p>
                      </div>
                      <div className='flex-1 rounded-[20px] bg-white/60 border border-white py-2 text-center'>
                        <p className='text-gray-500 font-bold text-sm'>7</p>
                        <p className='text-[10px] text-gray-400 uppercase'>Ahmet</p>
                      </div>
                      <div className='flex-1 rounded-[20px] bg-white/60 border border-white py-2 text-center'>
                        <p className='text-gray-500 font-bold text-sm'>5</p>
                        <p className='text-[10px] text-gray-400 uppercase'>Ayşe</p>
                      </div>
                    </div>
                  </div>

                  {/* filtersSection — tags */}
                  <div className='flex gap-2 mb-4 overflow-x-auto pb-1'>
                    <span className='shrink-0 px-4 py-2 rounded-[20px] bg-[#8B5CF6] text-white text-[10px] font-medium'>
                      Tümü
                    </span>
                    <span className='shrink-0 px-4 py-2 rounded-[20px] bg-white border border-gray-200 text-gray-500 text-[10px]'>
                      #Aşk
                    </span>
                    <span className='shrink-0 px-4 py-2 rounded-[20px] bg-white border border-gray-200 text-gray-500 text-[10px]'>
                      #Yıldızlar
                    </span>
                  </div>

                  {/* PoemCard — amber variant */}
                  <div className='rounded-[25px] p-4 mb-4 border-2 border-amber-200 shadow-md bg-gradient-to-br from-amber-50 to-amber-100/80'>
                    <div className='flex justify-between items-center mb-2'>
                      <span className='px-2 py-0.5 rounded-xl bg-amber-500/20 text-amber-700 text-[9px] font-semibold uppercase'>
                        #Aşk
                      </span>
                      <Feather className='w-4 h-4 text-amber-500 opacity-50' />
                    </div>
                    <p className='text-gray-900 font-bold text-xs mb-2'>Sana</p>
                    <p className='text-[10px] text-gray-700 leading-relaxed line-clamp-3 mb-3'>
                      &quot;Gözlerinde kayboluyorum her baktığımda, Gülüşün bahara dönüyor kışları...&quot;
                    </p>
                    <div className='flex items-center justify-between pt-2 border-t border-amber-200/50'>
                      <div className='flex items-center gap-2'>
                        <div className='w-7 h-7 rounded-full overflow-hidden border-2 border-amber-300/50 bg-gray-100'>
                          <Image
                            src='/man-pp.png'
                            width={28}
                            height={28}
                            alt=''
                            className='object-cover w-full h-full'
                          />
                        </div>
                        <div>
                          <p className='text-gray-900 font-semibold text-[10px]'>Ahmet</p>
                          <p className='text-[9px] text-gray-500'>20 Ocak 2024</p>
                        </div>
                      </div>
                      <span className='flex items-center gap-0.5 bg-amber-500 text-white px-2 py-1 rounded-lg text-[9px] font-medium'>
                        Tamamını Oku <ChevronRight size={10} />
                      </span>
                    </div>
                  </div>

                  {/* PoemCard — rose variant */}
                  <div className='rounded-[25px] p-4 mb-4 border-2 border-rose-200 shadow-md bg-gradient-to-br from-rose-50 to-rose-100/80'>
                    <div className='flex justify-between items-center mb-2'>
                      <span className='px-2 py-0.5 rounded-xl bg-rose-500/20 text-rose-700 text-[9px] font-semibold uppercase'>
                        #Yıldızlar
                      </span>
                      <Feather className='w-4 h-4 text-rose-500 opacity-50' />
                    </div>
                    <p className='text-gray-900 font-bold text-xs mb-2'>Geceye Not</p>
                    <p className='text-[10px] text-gray-700 leading-relaxed line-clamp-3 mb-3'>
                      &quot;Sen gökyüzündeki en parlak yıldız gibisin...&quot;
                    </p>
                    <div className='flex items-center justify-between pt-2 border-t border-rose-200/50'>
                      <div className='flex items-center gap-2'>
                        <div className='w-7 h-7 rounded-full overflow-hidden border-2 border-rose-300/50 bg-gray-100'>
                          <Image
                            src='/woman-pp.png'
                            width={28}
                            height={28}
                            alt=''
                            className='object-cover w-full h-full'
                          />
                        </div>
                        <div>
                          <p className='text-gray-900 font-semibold text-[10px]'>Ayşe</p>
                          <p className='text-[9px] text-gray-500'>15 Ocak 2024</p>
                        </div>
                      </div>
                      <span className='flex items-center gap-0.5 bg-rose-500 text-white px-2 py-1 rounded-lg text-[9px] font-medium'>
                        Tamamını Oku <ChevronRight size={10} />
                      </span>
                    </div>
                  </div>

                  {/* tipsSection */}
                  <div className='flex items-center gap-2 mb-3'>
                    <Sparkles className='w-4 h-4 text-amber-500' />
                    <p className='text-gray-900 font-bold text-xs'>İlham Kaynakları</p>
                  </div>
                  <div className='flex gap-2 overflow-x-auto pb-1'>
                    <div className='shrink-0 w-40 rounded-[25px] p-3 border border-black/5 bg-amber-50'>
                      <BookOpen className='w-5 h-5 text-amber-500 mb-1' />
                      <p className='text-gray-900 font-semibold text-[10px]'>Yazma İpuçları</p>
                      <p className='text-[9px] text-gray-600 line-clamp-2 mt-0.5'>Duygularınızı içten ifade edin.</p>
                    </div>
                    <div className='shrink-0 w-40 rounded-[25px] p-3 border border-black/5 bg-rose-50'>
                      <Heart className='w-5 h-5 text-rose-500 mb-1' />
                      <p className='text-gray-900 font-semibold text-[10px]'>Romantik Sözler</p>
                      <p className='text-[9px] text-gray-600 line-clamp-2 mt-0.5'>Ünlü şairlerin dizeleri.</p>
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
        <div className='max-w-[1200px] mx-auto px-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-24 items-center'>
            <div>
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

            {/* Mobil Notlar mockup — mobile-app/app/(drawer)/notes.tsx ile birebir uyumlu */}
            <div className='order-2 lg:order-1 flex justify-center'>
              <div className='w-[360px] rounded-[2.75rem] border-[14px] border-gray-800 shadow-2xl overflow-hidden bg-[#F8F9FA]'>
                <div className='px-3 py-4 h-[660px] overflow-y-auto'>
                  {/* header */}
                  <div className='mb-4'>
                    <div className='flex justify-between items-center mb-4'>
                      <div className='flex items-center gap-3'>
                        <div className='w-11 h-11 rounded-[18px] bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30 rotate-[3deg]'>
                          <StickyNote className='text-white w-6 h-6' />
                        </div>
                        <div>
                          <p className='text-gray-900 font-bold text-sm'>Notlarımız</p>
                          <p className='text-gray-500 text-[10px]'>Sevgi dolu küçük mesajlar...</p>
                        </div>
                      </div>
                      <button
                        type='button'
                        className='rounded-[18px] overflow-hidden shadow-lg shadow-rose-500/30'
                        style={{ background: 'linear-gradient(90deg, #F43F5E 0%, #EC4899 100%)' }}
                      >
                        <span className='flex items-center justify-center p-2.5'>
                          <Plus className='text-white w-5 h-5' />
                        </span>
                      </button>
                    </div>
                    {/* statsRow */}
                    <div className='flex gap-2'>
                      <div className='flex-1 bg-white rounded-[20px] p-3 border border-gray-100 shadow-sm text-center'>
                        <p className='text-gray-900 font-bold text-sm'>4</p>
                        <p className='text-[10px] text-gray-400 uppercase'>Toplam Not</p>
                      </div>
                      <div className='flex-1 bg-white rounded-[20px] p-3 border border-gray-100 shadow-sm text-center'>
                        <p className='text-rose-500 font-bold text-sm'>1</p>
                        <p className='text-[10px] text-gray-400 uppercase'>Yeni Not</p>
                      </div>
                    </div>
                  </div>

                  {/* boardContainer — cork */}
                  <div className='rounded-[40px] border-[10px] border-[#8B5A2B] p-4 relative min-h-[320px] bg-[#D4A574] shadow-xl'>
                    <div className='absolute top-3 left-3 w-3 h-3 rounded-full bg-gray-800/80 shadow' />
                    <div className='absolute top-3 right-3 w-3 h-3 rounded-full bg-gray-800/80 shadow' />
                    <div className='absolute bottom-3 left-3 w-3 h-3 rounded-full bg-gray-800/80 shadow' />
                    <div className='absolute bottom-3 right-3 w-3 h-3 rounded-full bg-gray-800/80 shadow' />
                    {/* notesGrid — 2x2 NoteCards */}
                    <div className='flex flex-wrap justify-center gap-1'>
                      <div className='w-[calc(50%-8px)] aspect-square max-w-[110px] p-2.5 rounded shadow-md bg-[#FEF9C3] border border-[#FEF08A] relative transform rotate-1'>
                        <div className='absolute top-0 right-0 w-0 h-0 border-t-0 border-r-[18px] border-r-amber-400/80 border-b-[18px] border-b-transparent' />
                        <div className='absolute -top-2 left-1/2 -translate-x-1/2'>
                          <Pin size={14} className='text-red-500 fill-red-500 rotate-45' />
                        </div>
                        <p className='text-[#854D0E] text-[9px] font-semibold leading-tight mt-2 line-clamp-3'>
                          Seni çok seviyorum! ❤️
                        </p>
                        <div className='absolute bottom-2 left-2 right-2 pt-1.5 border-t border-amber-200 flex justify-between items-center'>
                          <span className='text-[8px] font-medium text-amber-900'>Ayşe</span>
                          <span className='text-[7px] text-amber-700'>Bugün</span>
                        </div>
                      </div>
                      <div className='w-[calc(50%-8px)] aspect-square max-w-[110px] p-2.5 rounded shadow-md bg-[#FCE7F3] border border-[#FBCFE8] relative transform -rotate-2'>
                        <div className='absolute top-0 right-0 w-0 h-0 border-t-0 border-r-[18px] border-r-pink-400/80 border-b-[18px] border-b-transparent' />
                        <div className='absolute -top-2 left-1/2 -translate-x-1/2'>
                          <Pin size={14} className='text-blue-500 fill-blue-500 rotate-45' />
                        </div>
                        <p className='text-[#9D174D] text-[9px] font-semibold leading-tight mt-2 line-clamp-3'>
                          Akşam yemeği benden! 🍝
                        </p>
                        <div className='absolute bottom-2 left-2 right-2 pt-1.5 border-t border-pink-200 flex justify-between items-center'>
                          <span className='text-[8px] font-medium text-pink-900'>Ahmet</span>
                          <span className='text-[7px] text-pink-700'>2 sa. önce</span>
                        </div>
                      </div>
                      <div className='w-[calc(50%-8px)] aspect-square max-w-[110px] p-2.5 rounded shadow-md bg-[#DBEAFE] border border-[#BFDBFE] relative transform rotate-2'>
                        <div className='absolute top-0 right-0 w-0 h-0 border-t-0 border-r-[18px] border-r-blue-400/80 border-b-[18px] border-b-transparent' />
                        <div className='absolute -top-2 left-1/2 -translate-x-1/2'>
                          <Pin size={14} className='text-emerald-500 fill-emerald-500 rotate-45' />
                        </div>
                        <p className='text-[#1E40AF] text-[9px] font-semibold leading-tight mt-2 line-clamp-3'>
                          Gülüşün çok güzel 😊
                        </p>
                        <div className='absolute bottom-2 left-2 right-2 pt-1.5 border-t border-blue-200 flex justify-between items-center'>
                          <span className='text-[8px] font-medium text-blue-900'>Ayşe</span>
                          <span className='text-[7px] text-blue-700'>dün</span>
                        </div>
                      </div>
                      <div className='w-[calc(50%-8px)] aspect-square max-w-[110px] p-2.5 rounded shadow-md bg-[#F3E8FF] border border-[#E9D5FF] relative transform -rotate-1'>
                        <div className='absolute top-0 right-0 w-0 h-0 border-t-0 border-r-[18px] border-r-purple-400/80 border-b-[18px] border-b-transparent' />
                        <div className='absolute -top-2 left-1/2 -translate-x-1/2'>
                          <Pin size={14} className='text-amber-500 fill-amber-500 rotate-45' />
                        </div>
                        <p className='text-[#6B21A8] text-[9px] font-semibold leading-tight mt-2 line-clamp-3'>
                          Sürprizim var sana! 🎁
                        </p>
                        <div className='absolute bottom-2 left-2 right-2 pt-1.5 border-t border-purple-200 flex justify-between items-center'>
                          <span className='text-[8px] font-medium text-purple-900'>Ahmet</span>
                          <span className='text-[7px] text-purple-700'>3 gün önce</span>
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

      {/* Module 8: Time Capsule */}
      <section id='module-time-capsule' className='py-32 bg-gradient-to-br from-amber-50 to-orange-50'>
        <div className='max-w-[1200px] mx-auto px-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-24 items-center'>
            <div className='order-2'>
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

            <div className='flex justify-center'>
              <div className='w-[360px] rounded-[2.75rem] border-[14px] border-gray-800 shadow-2xl overflow-hidden bg-[#F8F9FA]'>
                <div className='px-3 py-4 h-[660px] overflow-y-auto'>
                  <div
                    className='rounded-[24px] overflow-hidden h-44 mb-4'
                    style={{ background: 'linear-gradient(135deg, #312E81 0%, #581C87 50%, #831843 100%)' }}
                  >
                    <div className='h-full flex flex-col items-center justify-center px-4'>
                      <div className='w-12 h-12 rounded-full flex items-center justify-center mb-3 border-2 border-amber-400/50 bg-amber-500/20'>
                        <Lock className='w-6 h-6 text-amber-300' />
                      </div>
                      <p className='text-white font-bold text-sm text-center'>Zaman Kapsülü 💌</p>
                      <p className='text-violet-200 text-[10px] text-center mt-1 max-w-[200px]'>
                        Geleceğe mektuplar yazın, belirlediğiniz tarihte açılsın
                      </p>
                      <button
                        type='button'
                        className='mt-3 rounded-full overflow-hidden'
                        style={{ background: 'linear-gradient(90deg, #F59E0B 0%, #EA580C 100%)' }}
                      >
                        <span className='flex items-center gap-2 px-4 py-2 text-white text-[10px] font-medium'>
                          <Plus size={12} /> Yeni Kapsül
                        </span>
                      </button>
                    </div>
                  </div>
                  <div
                    className='rounded-2xl border-2 border-[#E9D5FF] p-3 mb-4'
                    style={{ background: 'linear-gradient(135deg, #FAF5FF 0%, #FDF2F8 100%)' }}
                  >
                    <div className='flex gap-2'>
                      <div className='w-10 h-10 rounded-xl bg-[#7C3AED] flex items-center justify-center shrink-0'>
                        <Lock className='text-white w-5 h-5' />
                      </div>
                      <div>
                        <p className='text-gray-900 font-semibold text-xs mb-1'>Nasıl Çalışır?</p>
                        <p className='text-gray-700 text-[10px] leading-tight mb-2'>
                          Geleceğe mektuplar gönderin. Belirlediğiniz tarihte otomatik açılır.
                        </p>
                        <div className='space-y-1.5'>
                          <div className='flex items-center gap-2'>
                            <div className='w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center'>
                              <PenLine size={10} className='text-violet-600' />
                            </div>
                            <span className='text-[10px] text-gray-700'>Mektubunuzu yazın</span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <div className='w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center'>
                              <Calendar className='w-3 h-3 text-amber-600' />
                            </div>
                            <span className='text-[10px] text-gray-700'>Açılma tarihi seçin</span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <div className='w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center'>
                              <Heart className='w-3 h-3 text-rose-600' />
                            </div>
                            <span className='text-[10px] text-gray-700'>Gelecekte keşfedin</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center justify-between mb-3'>
                    <p className='text-gray-900 font-bold text-sm'>Kapsülleriniz</p>
                    <button
                      type='button'
                      className='w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center'
                    >
                      <Filter className='w-4 h-4 text-gray-500' />
                    </button>
                  </div>
                  <div className='bg-white rounded-2xl p-3 border-2 border-amber-200 shadow-sm mb-3'>
                    <div className='flex items-center gap-2 mb-2'>
                      <div
                        className='w-8 h-8 rounded-full flex items-center justify-center'
                        style={{ background: 'linear-gradient(135deg, #FBBF24 0%, #F97316 100%)' }}
                      >
                        <Lock className='w-4 h-4 text-white' />
                      </div>
                      <span className='bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[9px] font-semibold'>
                        KİLİTLİ
                      </span>
                    </div>
                    <p className='text-gray-900 font-semibold text-xs mb-2'>1. Yıl Dönümü Mektubumuz</p>
                    <div className='bg-amber-50 rounded-xl p-2 mb-2'>
                      <div className='flex justify-between items-center'>
                        <div className='flex items-center gap-2'>
                          <Calendar className='w-4 h-4 text-amber-700' />
                          <div>
                            <p className='text-[9px] text-gray-600'>Açılma Tarihi</p>
                            <p className='text-[10px] font-medium text-gray-900'>20 Ocak 2025</p>
                          </div>
                        </div>
                        <div className='text-center'>
                          <p className='text-amber-700 font-bold text-sm'>342</p>
                          <p className='text-[9px] text-gray-500'>gün</p>
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-1.5'>
                        <div className='w-5 h-5 rounded-full overflow-hidden border border-white bg-gray-100'>
                          <Image
                            src='/man-pp.png'
                            width={20}
                            height={20}
                            alt=''
                            className='object-cover w-full h-full'
                          />
                        </div>
                        <span className='text-[9px] text-gray-500'>Ahmet</span>
                      </div>
                      <div className='flex items-center gap-2 text-[9px] text-gray-400'>
                        <span className='flex items-center gap-0.5'>
                          <Calendar className='w-3 h-3' /> 20 Oca
                        </span>
                        <span>5 foto</span>
                      </div>
                    </div>
                  </div>
                  <div className='bg-white rounded-2xl p-3 border-2 border-violet-200 shadow-sm'>
                    <div className='flex items-center gap-2 mb-2'>
                      <div className='w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-violet-400 to-indigo-500'>
                        <Lock className='w-4 h-4 text-white' />
                      </div>
                      <span className='bg-violet-100 text-violet-800 px-2 py-0.5 rounded-full text-[9px] font-semibold'>
                        KİLİTLİ
                      </span>
                    </div>
                    <p className='text-gray-900 font-semibold text-xs mb-2'>Doğum günü sürprizi</p>
                    <div className='bg-violet-50 rounded-xl p-2'>
                      <div className='flex justify-between items-center'>
                        <div className='flex items-center gap-2'>
                          <Calendar className='w-4 h-4 text-violet-600' />
                          <div>
                            <p className='text-[9px] text-gray-600'>Açılma Tarihi</p>
                            <p className='text-[10px] font-medium text-gray-900'>15 Mart 2025</p>
                          </div>
                        </div>
                        <div className='text-center'>
                          <p className='text-violet-600 font-bold text-sm'>95</p>
                          <p className='text-[9px] text-gray-500'>gün</p>
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

      {/* Uzay Keşfi — space-explorer.tsx ile birebir telefon mockup */}
      <section id='module-space' className='py-32 bg-gradient-to-br from-indigo-50 via-slate-50 to-[#020010]/5'>
        <div className='max-w-[1200px] mx-auto px-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-24 items-center'>
            <div className='order-2'>
              <h2 className='text-5xl md:text-6xl font-bold text-gray-900 mb-6'>
                Uzay
                <br />
                Keşfi
              </h2>
              <p className='text-xl text-gray-600 mb-8 leading-relaxed'>
                Anılarınız, şiirleriniz ve tüm içerikleriniz uzayda yıldız, gezegen ve kuyruklu yıldız olarak canlanır.
                Joystick ile hareket edin, nesnelere dokunun; ilişkinizin evrenini birlikte keşfedin.
              </p>
              <div className='space-y-6'>
                {[
                  {
                    icon: Rocket,
                    title: '3D Uzay Ortamı',
                    desc: 'Şiirler yıldız, anılar gezegen, yapılacaklar listesi kuyruklu yıldız olarak uzayda süzülür'
                  },
                  {
                    icon: MousePointer2,
                    title: 'Joystick ile Hareket',
                    desc: 'Sol joystick hareket, sağ joystick bakış; dokunarak nesneleri seçip ilgili sayfaya gidin'
                  },
                  {
                    icon: Sparkles,
                    title: 'İçerik Özeti Görünümü',
                    desc: 'Her nesne seviye ve açıklama ile gösterilir; tek dokunuşla o modüle atlayın'
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

            {/* Mobil Uzay Keşfi — space-explorer.tsx shell birebir */}
            <div className='order-1 flex justify-center'>
              <div className='w-[280px] rounded-[2.75rem] border-[14px] border-gray-800 shadow-2xl overflow-hidden bg-[#020010]'>
                <div className='relative h-[520px] overflow-hidden'>
                  {/* Arka plan: koyu uzay + yıldız noktaları */}
                  <div className='absolute inset-0 bg-[#020010]' />
                  <div className='absolute inset-0'>
                    {[...Array(24)].map((_, i) => (
                      <div
                        key={i}
                        className='absolute rounded-full bg-white opacity-80'
                        style={{
                          width: i % 3 === 0 ? 2 : 1,
                          height: i % 3 === 0 ? 2 : 1,
                          left: `${8 + (i * 13) % 84}%`,
                          top: `${10 + (i * 17) % 78}%`
                        }}
                      />
                    ))}
                  </div>

                  {/* Uzay nesneleri — S3 level_15 (star, planet_a, planet_b, planet_c, comet, ufo) */}
                  <div className='absolute inset-0 z-[5] pointer-events-none'>
                    <Image
                      src='https://ciftopia-space-items.s3.eu-central-1.amazonaws.com/star/level_15.png'
                      alt=''
                      width={28}
                      height={28}
                      className='absolute object-contain opacity-90'
                      style={{ left: '12%', top: '22%' }}
                    />
                    <Image
                      src='https://ciftopia-space-items.s3.eu-central-1.amazonaws.com/planet_a/level_15.png'
                      alt=''
                      width={40}
                      height={40}
                      className='absolute object-contain opacity-95'
                      style={{ left: '6%', top: '48%' }}
                    />
                    <Image
                      src='https://ciftopia-space-items.s3.eu-central-1.amazonaws.com/planet_b/level_15.png'
                      alt=''
                      width={44}
                      height={44}
                      className='absolute object-contain opacity-95'
                      style={{ right: '8%', top: '38%' }}
                    />
                    <Image
                      src='https://ciftopia-space-items.s3.eu-central-1.amazonaws.com/planet_c/level_15.png'
                      alt=''
                      width={36}
                      height={36}
                      className='absolute object-contain opacity-95'
                      style={{ right: '18%', top: '18%' }}
                    />
                    <Image
                      src='https://ciftopia-space-items.s3.eu-central-1.amazonaws.com/comet/level_15.png'
                      alt=''
                      width={32}
                      height={32}
                      className='absolute object-contain opacity-95'
                      style={{ left: '22%', top: '62%' }}
                    />
                    <Image
                      src='https://ciftopia-space-items.s3.eu-central-1.amazonaws.com/ufo/level_15.png'
                      alt=''
                      width={34}
                      height={34}
                      className='absolute object-contain opacity-95'
                      style={{ left: '52%', top: '28%' }}
                    />
                  </div>

                  {/* Header — space-explorer styles.header */}
                  <div className='absolute top-4 left-0 right-0 flex items-center justify-between px-3 z-10'>
                    <div className='w-8 h-8 rounded-full bg-white/10 flex items-center justify-center'>
                      <ArrowLeft className='w-4 h-4 text-amber-200' />
                    </div>
                    <span
                      className='text-amber-200 font-bold text-sm tracking-[0.2em]'
                      style={{ textShadow: '0 0 12px rgba(251,191,36,0.3)' }}
                    >
                      UZAY KEŞFİ
                    </span>
                    <div className='w-8' />
                  </div>

                  {/* Crosshair — ortada */}
                  <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 z-[8]'>
                    <div className='absolute top-[9px] left-0 w-5 h-px bg-amber-400/40' />
                    <div className='absolute top-0 left-[9px] w-px h-5 bg-amber-400/40' />
                    <div className='absolute top-[7px] left-[7px] w-1 h-1 rounded-full bg-amber-400/60' />
                  </div>

                  {/* Sol Joystick (Hareket) — JoystickOverlay moveBase + moveKnob */}
                  <div className='absolute bottom-12 left-2 z-10'>
                    <div
                      className='w-16 h-16 rounded-full flex items-center justify-center border border-amber-400/20'
                      style={{ backgroundColor: 'rgba(251,191,36,0.08)' }}
                    >
                      <div
                        className='w-9 h-9 rounded-full border border-amber-400/40'
                        style={{ backgroundColor: 'rgba(251,191,36,0.25)' }}
                      />
                    </div>
                  </div>

                  {/* Sağ Joystick (Bakış) — lookBase + arrows + lookKnob */}
                  <div className='absolute bottom-12 right-2 z-10'>
                    <div
                      className='w-16 h-16 rounded-full flex items-center justify-center border border-amber-400/15 relative'
                      style={{ backgroundColor: 'rgba(251,191,36,0.05)' }}
                    >
                      <ChevronUp className='absolute top-0.5 w-4 h-4 text-amber-400/30' />
                      <ChevronDown className='absolute bottom-0.5 w-4 h-4 text-amber-400/30' />
                      <ChevronLeft className='absolute left-0.5 w-4 h-4 text-amber-400/30' />
                      <ChevronRight className='absolute right-0.5 w-4 h-4 text-amber-400/30' />
                      <div
                        className='w-8 h-8 rounded-full border-2 border-amber-400/40 absolute'
                        style={{ backgroundColor: 'rgba(251,191,36,0.2)', boxShadow: '0 0 8px rgba(251,191,36,0.3)' }}
                      />
                    </div>
                  </div>

                  {/* Alt bilgi — infoBar */}
                  <div className='absolute bottom-2 left-0 right-0 flex justify-center z-10'>
                    <span
                      className='text-[9px] text-amber-400/60 tracking-wide px-3 py-1.5 rounded-xl border border-amber-400/15'
                      style={{ backgroundColor: 'rgba(2,0,16,0.75)' }}
                    >
                      Sol Joystick: Hareket | Sağ Joystick: Bakış
                    </span>
                  </div>
                </div>
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
            <span className='opacity-90'>Sadece İkinize Özel Bir Platformda</span>
          </h2>

          <p className='text-2xl text-white/90 mb-16 leading-relaxed font-medium'>
            8 özel modül, sınırsız anı, tam güvenlik.{' '}
            gibi size özel bir dünyanız olsun.
          </p>

          <div className='flex flex-col sm:flex-row items-center justify-center gap-6 mb-16'>
            {/* Kayıt sadece mobile-app üzerinden */}
            <Link
              href='#'
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
