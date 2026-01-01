import {
  Heart,
  Clock,
  Images,
  Feather,
  StickyNote,
  ChevronDown,
  ArrowRight,
  ArrowUp,
  Pin,
  Quote,
  CheckCircle,
  Plane,
  Bell
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import CoupleNamesClient from './_components/CoupleNamesClient'
import { authServiceServer } from '@/services/api-server'
import { redirect } from 'next/navigation'

export default async function CouplePage() {
  const user = await authServiceServer.me()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className='bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50'>
      {/* Hero Section */}
      <section id='hero-section' className='relative h-screen flex items-center justify-center overflow-hidden'>
        <div className='absolute inset-0 z-0'>
          <Image
            className='object-cover'
            src='https://storage.googleapis.com/uxpilot-auth.appspot.com/97093dac24-a8ab7a9981f3847281dd.png'
            alt='Hero Background'
            fill
            priority
          />
          <div className='absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60'></div>
        </div>

        <div className='relative z-10 text-center px-6 pt-20'>
          <div className='flex items-center justify-center space-x-4 md:space-x-8 mb-8'>
            <div className='relative'>
              <div className='w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl relative'>
                <Image
                  src='https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg'
                  alt='Partner 1'
                  className='object-cover'
                  fill
                />
              </div>
              <div className='absolute -bottom-1 -right-1 w-8 h-8 md:w-10 md:h-10 bg-blue-500 rounded-full border-4 border-white flex items-center justify-center z-10'>
                <span className='text-white text-xs'>♂</span>
              </div>
            </div>

            <div className='text-4xl md:text-6xl text-white animate-pulse'>
              <Heart fill='currentColor' />
            </div>

            <div className='relative'>
              <div className='w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl relative'>
                <Image
                  src='https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg'
                  alt='Partner 2'
                  className='object-cover'
                  fill
                />
              </div>
              <div className='absolute -bottom-1 -right-1 w-8 h-8 md:w-10 md:h-10 bg-pink-500 rounded-full border-4 border-white flex items-center justify-center z-10'>
                <span className='text-white text-xs'>♀</span>
              </div>
            </div>
          </div>

          <CoupleNamesClient subdomain={user?.coupleId?.subdomain} />
          <div className='inline-block bg-white/20 backdrop-blur-md rounded-full px-8 py-3 mb-8'>
            <p className='text-white text-lg font-medium'>Tanışma: 14 Şubat 2023</p>
          </div>

          <div className='flex items-center justify-center space-x-4 md:space-x-8 mb-12'>
            <div className='bg-white/20 backdrop-blur-md rounded-2xl px-6 py-4 md:px-8 md:py-6 text-center min-w-[100px]'>
              <div className='text-3xl md:text-5xl font-bold text-white mb-1'>1</div>
              <div className='text-white/80 text-xs md:text-sm font-medium uppercase tracking-wider'>Yıl</div>
            </div>
            <div className='bg-white/20 backdrop-blur-md rounded-2xl px-6 py-4 md:px-8 md:py-6 text-center min-w-[100px]'>
              <div className='text-3xl md:text-5xl font-bold text-white mb-1'>3</div>
              <div className='text-white/80 text-xs md:text-sm font-medium uppercase tracking-wider'>Ay</div>
            </div>
            <div className='bg-white/20 backdrop-blur-md rounded-2xl px-6 py-4 md:px-8 md:py-6 text-center min-w-[100px]'>
              <div className='text-3xl md:text-5xl font-bold text-white mb-1'>15</div>
              <div className='text-white/80 text-xs md:text-sm font-medium uppercase tracking-wider'>Gün</div>
            </div>
          </div>

          <div className='animate-bounce'>
            <Link
              href='#stats-section'
              className='inline-flex items-center justify-center w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full hover:bg-white/40 transition-all'
            >
              <ChevronDown className='text-white' />
            </Link>
          </div>
        </div>

        <div className='absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-rose-50 to-transparent'></div>
      </section>

      {/* Stats Section */}
      <section id='stats-section' className='py-16 px-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6'>
            <div className='bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 group'>
              <div className='flex items-center justify-between mb-6'>
                <div className='w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform'>
                  <Clock className='text-rose-500' size={32} />
                </div>
                <div className='text-right'>
                  <div className='text-4xl font-bold text-gray-900 mb-1'>47</div>
                  <div className='text-sm text-gray-500 font-medium'>Toplam</div>
                </div>
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>Anı</h3>
              <p className='text-gray-600 text-sm mb-4'>Paylaşılan özel anlar</p>
              <div className='flex items-center text-green-600 text-sm font-semibold'>
                <ArrowUp className='mr-2' size={16} />
                <span>Bu ay +8</span>
              </div>
            </div>

            <div className='bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 group'>
              <div className='flex items-center justify-between mb-6'>
                <div className='w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform'>
                  <Images className='text-purple-500' size={32} />
                </div>
                <div className='text-right'>
                  <div className='text-4xl font-bold text-gray-900 mb-1'>156</div>
                  <div className='text-sm text-gray-500 font-medium'>Toplam</div>
                </div>
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>Fotoğraf</h3>
              <p className='text-gray-600 text-sm mb-4'>Birlikte çekilen kareler</p>
              <div className='flex items-center text-green-600 text-sm font-semibold'>
                <ArrowUp className='mr-2' size={16} />
                <span>Bu ay +23</span>
              </div>
            </div>

            <div className='bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 group'>
              <div className='flex items-center justify-between mb-6'>
                <div className='w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform'>
                  <Feather className='text-amber-500' size={32} />
                </div>
                <div className='text-right'>
                  <div className='text-4xl font-bold text-gray-900 mb-1'>12</div>
                  <div className='text-sm text-gray-500 font-medium'>Toplam</div>
                </div>
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>Şiir</h3>
              <p className='text-gray-600 text-sm mb-4'>Romantik şiirler</p>
              <div className='flex items-center text-green-600 text-sm font-semibold'>
                <ArrowUp className='mr-2' size={16} />
                <span>Bu ay +3</span>
              </div>
            </div>

            <div className='bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 group'>
              <div className='flex items-center justify-between mb-6'>
                <div className='w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform'>
                  <StickyNote className='text-green-500' size={32} />
                </div>
                <div className='text-right'>
                  <div className='text-4xl font-bold text-gray-900 mb-1'>28</div>
                  <div className='text-sm text-gray-500 font-medium'>Toplam</div>
                </div>
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>Not</h3>
              <p className='text-gray-600 text-sm mb-4'>Sevgi dolu mesajlar</p>
              <div className='flex items-center text-green-600 text-sm font-semibold'>
                <ArrowUp className='mr-2' size={16} />
                <span>Bu ay +12</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Memories Section */}
      <section id='memories-section' className='py-16 px-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='flex flex-col md:flex-row items-center justify-between mb-12 gap-6'>
            <div>
              <h2 className=' text-4xl font-bold text-gray-900 mb-3'>Son Anılarımız</h2>
              <p className='text-gray-600 text-lg'>Birlikte yaşadığımız özel anlar</p>
            </div>
            <Link
              href='/memories'
              className='inline-flex items-center space-x-2 bg-gradient-to-r from-rose-primary to-coral-warm text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5'
            >
              <span>Tümünü Gör</span>
              <ArrowRight size={20} />
            </Link>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {[
              {
                title: 'İlk Tatilimiz',
                date: '12 Ağu 2024',
                desc: "Bodrum'da geçirdiğimiz muhteşem hafta sonu. Gün batımında sahilde yürüyüş yapmak paha biçilemezdi.",
                img: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/ef1c021a31-d12c7ee0001dc589a155.png',
                author: 'Ayşe',
                avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg'
              },
              {
                title: 'Yıldönümü Yemeği',
                date: '5 Ağu 2024',
                desc: '1. yıl dönümümüzü kutladığımız özel akşam yemeği. Her anı mükemmeldi ve sürprizler bitmedi.',
                img: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/a0dca64412-97b8a0cce12e6d4aac7a.png',
                author: 'Ahmet',
                avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg'
              },
              {
                title: 'Dağ Macerası',
                date: '28 Tem 2024',
                desc: "Uludağ'da yaptığımız trekking. Zirvede çektiğimiz fotoğraflar ve o eşsiz manzara unutulmazdı.",
                img: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/1785995699-746016378a674e04b616.png',
                author: 'Ayşe',
                avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg'
              }
            ].map((memory, i) => (
              <div
                key={i}
                className='bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group'
              >
                <div className='h-64 overflow-hidden relative'>
                  <Image
                    className='object-cover group-hover:scale-110 transition-transform duration-500'
                    src={memory.img}
                    alt={memory.title}
                    fill
                  />
                  <div className='absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 z-10'>
                    <span className='text-sm font-semibold text-gray-900'>{memory.date}</span>
                  </div>
                </div>
                <div className='p-6'>
                  <h3 className='font-bold text-xl text-gray-900 mb-3'>{memory.title}</h3>
                  <p className='text-gray-600 mb-4'>{memory.desc}</p>
                  <div className='flex items-center space-x-3'>
                    <div className='relative w-8 h-8 rounded-full overflow-hidden border-2 border-rose-200'>
                      <Image src={memory.avatar} alt={memory.author} className='object-cover' fill />
                    </div>
                    <span className='text-sm text-gray-600'>{memory.author} tarafından eklendi</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id='gallery-section' className='py-16 px-6 bg-white/50'>
        <div className='max-w-7xl mx-auto'>
          <div className='flex flex-col md:flex-row items-center justify-between mb-12 gap-6'>
            <div>
              <h2 className=' text-4xl font-bold text-gray-900 mb-3'>Galeri</h2>
              <p className='text-gray-600 text-lg'>En güzel anlarımızdan kareler</p>
            </div>
            <Link
              href='#'
              className='inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5'
            >
              <span>Tüm Fotoğraflar</span>
              <ArrowRight size={20} />
            </Link>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='h-64 rounded-2xl overflow-hidden group cursor-pointer relative'>
              <Image
                className='object-cover group-hover:scale-110 transition-transform duration-500'
                src='https://storage.googleapis.com/uxpilot-auth.appspot.com/188e10e043-36846695e7ef25e6109e.png'
                alt='Gallery 1'
                fill
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 z-10'>
                <span className='text-white text-sm font-semibold'>İlk Selfie</span>
              </div>
            </div>

            <div className='h-64 rounded-2xl overflow-hidden group cursor-pointer relative'>
              <Image
                className='object-cover group-hover:scale-110 transition-transform duration-500'
                src='https://storage.googleapis.com/uxpilot-auth.appspot.com/dc7f897702-88f8a57606be3b41c74d.png'
                alt='Gallery 2'
                fill
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 z-10'>
                <span className='text-white text-sm font-semibold'>Birlikte</span>
              </div>
            </div>

            <div className='h-full min-h-[320px] rounded-2xl overflow-hidden group cursor-pointer relative md:col-span-2 md:row-span-2'>
              <Image
                className='object-cover group-hover:scale-110 transition-transform duration-500'
                src='https://storage.googleapis.com/uxpilot-auth.appspot.com/762bae3806-4eadbdae767a3d72b2e2.png'
                alt='Gallery 3'
                fill
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 z-10'>
                <span className='text-white text-sm font-semibold'>Gün Batımı</span>
              </div>
            </div>

            <div className='h-64 rounded-2xl overflow-hidden group cursor-pointer relative'>
              <Image
                className='object-cover group-hover:scale-110 transition-transform duration-500'
                src='https://storage.googleapis.com/uxpilot-auth.appspot.com/dc2b434b1b-5ad3b53e835861d07e44.png'
                alt='Gallery 4'
                fill
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 z-10'>
                <span className='text-white text-sm font-semibold'>Mutluluk</span>
              </div>
            </div>

            <div className='h-64 rounded-2xl overflow-hidden group cursor-pointer relative'>
              <Image
                className='object-cover group-hover:scale-110 transition-transform duration-500'
                src='https://storage.googleapis.com/uxpilot-auth.appspot.com/49bc5d66ed-799d79810b91ae5e81ca.png'
                alt='Gallery 5'
                fill
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 z-10'>
                <span className='text-white text-sm font-semibold'>Kahve Molası</span>
              </div>
            </div>

            <div className='h-64 rounded-2xl overflow-hidden group cursor-pointer relative'>
              <Image
                className='object-cover group-hover:scale-110 transition-transform duration-500'
                src='https://storage.googleapis.com/uxpilot-auth.appspot.com/2d1420d573-0dbbe929f5b388d1b5f0.png'
                alt='Gallery 6'
                fill
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 z-10'>
                <span className='text-white text-sm font-semibold'>Dans</span>
              </div>
            </div>

            <div className='h-64 rounded-2xl overflow-hidden group cursor-pointer relative'>
              <Image
                className='object-cover group-hover:scale-110 transition-transform duration-500'
                src='https://storage.googleapis.com/uxpilot-auth.appspot.com/66c6db7e4a-b7d1b724229f633dbfac.png'
                alt='Gallery 7'
                fill
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 z-10'>
                <span className='text-white text-sm font-semibold'>Çiçekler</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Poem Section */}
      <section id='poems-section' className='py-16 px-6'>
        <div className='max-w-5xl mx-auto'>
          <div className='text-center mb-12'>
            <h2 className=' text-4xl font-bold text-gray-900 mb-3'>Öne Çıkan Şiir</h2>
            <p className='text-gray-600 text-lg'>Birbirimize yazdığımız duygular</p>
          </div>

          <div className='bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 md:p-12 shadow-xl border-2 border-amber-100 relative overflow-hidden'>
            <div className='absolute top-0 left-0 w-32 h-32 bg-amber-200/30 rounded-full -translate-x-16 -translate-y-16'></div>
            <div className='absolute bottom-0 right-0 w-40 h-40 bg-orange-200/30 rounded-full translate-x-20 translate-y-20'></div>

            <div className='relative z-10'>
              <div className='flex items-center justify-center mb-8'>
                <div className='w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center'>
                  <Feather className='text-white' size={32} />
                </div>
              </div>

              <h3 className=' text-3xl font-bold text-center text-gray-900 mb-8'>Sana Dair</h3>

              <div className='space-y-6 text-center  text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto'>
                <p>
                  Gözlerinde kaybolur zamanın akışı,
                  <br />
                  Seninle her an bir bahar sabahı.
                </p>

                <p>
                  Gülüşün güneş gibi aydınlatır yüzümü,
                  <br />
                  Seninle olmak en güzel rüyam.
                </p>

                <p>
                  El ele tutuştuğumuzda hissederim,
                  <br />
                  Sonsuza kadar sürecek bu sevdayı.
                </p>

                <p>
                  Sen benim aşkımsın, hayatımsın,
                  <br />
                  Sensiz eksik kalır dünyam.
                </p>
              </div>

              <div className='flex items-center justify-center space-x-4 mt-8'>
                <div className='relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-300'>
                  <Image
                    src='https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg'
                    alt='Ahmet'
                    className='object-cover'
                    fill
                  />
                </div>
                <div className='text-left'>
                  <p className='font-semibold text-gray-900'>Ahmet</p>
                  <p className='text-sm text-gray-600'>3 Ağustos 2024</p>
                </div>
              </div>

              <div className='flex items-center justify-center space-x-3 mt-8'>
                <Heart size={24} className='text-rose-500 fill-current' />
                <Heart size={24} className='text-rose-500 fill-current' />
                <Heart size={24} className='text-rose-500 fill-current' />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Love Notes Section */}
      <section id='notes-section' className='py-16 px-6 bg-white/50'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-12'>
            <h2 className=' text-4xl font-bold text-gray-900 mb-3'>Sevgi Notları</h2>
            <p className='text-gray-600 text-lg'>Birbirimize bıraktığımız mesajlar</p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
            {[
              {
                color: 'bg-yellow-100 border-yellow-200',
                text: 'Bugün seni düşünmekten işime konsantre olamadım. Akşam görüşürüz aşkım! 💕',
                author: 'Ayşe',
                time: '2 saat önce',
                avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg'
              },
              {
                color: 'bg-pink-100 border-pink-200',
                text: 'Seni çok seviyorum! Bu hafta sonu sürprizim var 🎁✨',
                author: 'Ahmet',
                time: 'dün',
                avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg'
              },
              {
                color: 'bg-green-100 border-green-200',
                text: 'Seninle geçirdiğim her an çok özel. İyi ki varsın! ❤️',
                author: 'Ayşe',
                time: '2 gün önce',
                avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg'
              },
              {
                color: 'bg-purple-100 border-purple-200',
                text: 'Kahvaltıyı hazırladım, uyan aşkım! ☕🥐',
                author: 'Ahmet',
                time: '3 gün önce',
                avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg'
              },
              {
                color: 'bg-blue-100 border-blue-200',
                text: 'Bugün seninle buluşacağımı düşünmek beni çok mutlu ediyor! 🌟',
                author: 'Ayşe',
                time: '4 gün önce',
                avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg'
              },
              {
                color: 'bg-orange-100 border-orange-200',
                text: 'Sen uyurken seni izlemek en sevdiğim şey 😊💤',
                author: 'Ahmet',
                time: '5 gün önce',
                avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg'
              }
            ].map((note, i) => (
              <div
                key={i}
                className={`${note.color} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border-2`}
              >
                <div className='flex items-center justify-between mb-4'>
                  <Pin className='text-gray-400 rotate-45' size={20} />
                  <span className='text-xs text-gray-600'>{note.time}</span>
                </div>
                <p className='text-gray-800 text-lg mb-4  italic'>{note.text}</p>
                <div className='flex items-center space-x-2'>
                  <div className='relative w-8 h-8 rounded-full overflow-hidden'>
                    <Image src={note.avatar} alt={note.author} className='object-cover' fill />
                  </div>
                  <span className='text-sm font-semibold text-gray-700'>{note.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id='timeline-section' className='py-16 px-6'>
        <div className='max-w-5xl mx-auto'>
          <div className='text-center mb-12'>
            <h2 className=' text-4xl font-bold text-gray-900 mb-3'>Hikayemiz</h2>
            <p className='text-gray-600 text-lg'>Birlikte yazdığımız özel anlar</p>
          </div>

          <div className='relative'>
            <div className='absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-rose-200 via-pink-200 to-purple-200'></div>

            {[
              {
                title: 'İlk Tanışma',
                desc: 'Ortak arkadaşımızın doğum günü partisinde tanıştık. İlk bakışta birbirimize âşık olduk.',
                date: '14 Şubat 2023',
                icon: <Heart size={20} />,
                color: 'from-rose-400 to-pink-400',
                side: 'left'
              },
              {
                title: 'İlk Randevu',
                desc: 'Sahil kenarında romantik bir akşam yemeği. Ay ışığı altında uzun uzun konuştuk.',
                date: '21 Şubat 2023',
                icon: <CheckCircle size={20} />,
                color: 'from-purple-400 to-indigo-400',
                side: 'right'
              },
              {
                title: 'İlk Tatil',
                desc: "Kapadokya'da unutulmaz bir hafta sonu. Balon turunda evlilik teklifi!",
                date: '15 Mayıs 2023',
                icon: <Plane size={20} />,
                color: 'from-amber-400 to-orange-400',
                side: 'left'
              },
              {
                title: '1. Yıl Dönümü',
                desc: 'Birlikte olduğumuz ilk yıl. Sonsuz mutluluklar dileriz!',
                date: '14 Şubat 2024',
                icon: <Bell size={20} />,
                color: 'from-green-400 to-emerald-400',
                side: 'right'
              }
            ].map((event, i) => (
              <div key={i} className='relative mb-12 last:mb-0'>
                <div className={`flex items-center ${event.side === 'left' ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${event.side === 'left' ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className='bg-white rounded-2xl p-6 shadow-lg inline-block max-w-sm'>
                      <h3 className='font-bold text-xl text-gray-900 mb-2'>{event.title}</h3>
                      <p className='text-gray-600 mb-3'>{event.desc}</p>
                      <span
                        className={`text-sm font-semibold ${event.side === 'left' ? 'text-rose-500' : 'text-purple-500'}`}
                      >
                        {event.date}
                      </span>
                    </div>
                  </div>
                  <div
                    className='absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br rounded-full flex items-center justify-center border-4 border-white shadow-lg z-10 text-white'
                    style={{
                      backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-from), var(--tw-gradient-to))`
                    }}
                  >
                    <div
                      className={`w-full h-full rounded-full bg-gradient-to-br ${event.color} flex items-center justify-center`}
                    >
                      {event.icon}
                    </div>
                  </div>
                  <div className='w-1/2'></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section
        id='quote-section'
        className='py-24 px-6 bg-gradient-to-br from-rose-100 via-pink-100 to-purple-100 relative overflow-hidden'
      >
        <div className='max-w-4xl mx-auto text-center relative z-10'>
          <div className='relative'>
            <Quote className='text-rose-300 absolute -top-12 -left-8 md:-left-12 opacity-50' size={80} />
            <p className=' text-2xl md:text-3xl text-gray-800 leading-relaxed mb-8 relative'>
              &quot;Aşk, iki ruhun tek bir bedende bulunması değildir. İki bedenin tek bir ruha sahip olmasıdır.&quot;
            </p>
            <Quote
              className='text-purple-300 absolute -bottom-12 -right-8 md:-right-12 opacity-50 rotate-180'
              size={80}
            />
          </div>
          <p className='text-gray-600 text-lg font-medium'>— Mevlana</p>

          <div className='flex items-center justify-center space-x-3 mt-12'>
            <div className='w-16 h-1 bg-rose-300 rounded-full'></div>
            <Heart size={24} className='text-rose-400 fill-current' />
            <div className='w-16 h-1 bg-purple-300 rounded-full'></div>
          </div>
        </div>
      </section>
    </div>
  )
}
