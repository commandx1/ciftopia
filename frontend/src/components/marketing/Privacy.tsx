import {
  ShieldCheck,
  Lock,
  Shield,
  Key,
  Cloud,
  UserCheck,
  Database,
  X,
  Brain,
  Bot,
  Check,
  Download,
  Trash2,
  Scale,
  CloudUpload,
  ShieldUser,
  HelpCircle,
  ArrowRight,
  Heart,
  Star,
  Sparkles
} from 'lucide-react'

export default function Privacy() {
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

        <div className='max-w-7xl mx-auto px-6 relative z-10 w-full'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-16 items-center'>
            <div className='space-y-6'>
              <div className='inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-5 py-2.5 rounded-full border border-rose-200/50 shadow-sm'>
                <ShieldCheck className='text-rose-500 w-5 h-5' />
                <span className='text-sm font-semibold text-gray-700'>Güvenli & Özel</span>
              </div>

              <h1 className='text-5xl md:text-6xl font-bold text-gray-900 leading-tight'>
                Anılarınız,
                <br />
                <span className='text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500'>
                  Sadece Size Özel.
                </span>
              </h1>

              <p className='text-xl text-gray-600 leading-relaxed max-w-xl'>
                Ciftopia&apos;da paylaştığınız her fotoğraf ve yazdığınız her kelime, en yüksek güvenlik standartlarıyla
                korunur. Burası sizin dijital mahremiyet alanınız.
              </p>

              <div className='flex flex-wrap items-center gap-6 pt-4'>
                <div className='flex items-center space-x-2'>
                  <Lock className='text-green-500 w-5 h-5' />
                  <span className='text-sm font-medium text-gray-700'>256-bit Şifreleme</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <Shield className='text-blue-500 w-5 h-5' />
                  <span className='text-sm font-medium text-gray-700'>KVKK Uyumlu</span>
                </div>
              </div>
            </div>

            <div className='relative hidden lg:block'>
              <div className='relative w-full h-[400px] bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 shadow-2xl shadow-purple-200/50 p-8 flex items-center justify-center'>
                <div className='relative'>
                  <div className='absolute -inset-4 bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 rounded-full opacity-20 blur-2xl animate-pulse'></div>
                  <Lock className='w-32 h-32 text-rose-500 relative z-10' />
                  <div
                    className='absolute -top-8 -right-8 w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center shadow-lg animate-bounce'
                    style={{ animationDelay: '0.5s' }}
                  >
                    <Heart className='text-rose-500 w-8 h-8 fill-rose-500' />
                  </div>
                  <div
                    className='absolute -bottom-6 -left-6 w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center shadow-lg animate-bounce'
                    style={{ animationDelay: '1s' }}
                  >
                    <Star className='text-purple-500 w-7 h-7 fill-purple-500' />
                  </div>
                  <div
                    className='absolute top-0 right-16 w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center shadow-lg animate-bounce'
                    style={{ animationDelay: '1.5s' }}
                  >
                    <Sparkles className='text-rose-500 w-6 h-6' />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Pillars */}
      <section id='security-pillars' className='py-24 relative'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='text-center mb-16'>
            <span className='text-rose-primary font-semibold text-sm uppercase tracking-wide'>Güvenlik Temelleri</span>
            <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-6'>
              Verileriniz Nasıl Korunur?
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              Üç temel güvenlik katmanıyla anılarınız maksimum koruma altında.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='group relative bg-white/60 backdrop-blur-sm rounded-3xl p-10 border border-rose-100/50 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2'>
              <div className='absolute inset-0 bg-gradient-to-br from-rose-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity'></div>
              <div className='relative z-10'>
                <div className='w-20 h-20 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-md'>
                  <Key className='w-10 h-10 text-rose-500' />
                </div>
                <h3 className='text-2xl font-bold text-gray-900 mb-4'>Veri Şifreleme</h3>
                <p className='text-gray-600 leading-relaxed mb-4'>
                  Tüm verileriniz <span className='font-semibold text-rose-600'>uçtan uca şifrelenir</span>.
                  Sunucularımızda saklanan her anı, sadece sizin anahtarınızla açılabilir.
                </p>
                <div className='bg-rose-50 rounded-xl p-4 border border-rose-100'>
                  <div className='flex items-center space-x-2 text-sm text-gray-700'>
                    <Check className='text-rose-500 w-4 h-4' />
                    <span className='font-medium'>AES-256 Şifreleme</span>
                  </div>
                </div>
              </div>
            </div>

            <div className='group relative bg-white/60 backdrop-blur-sm rounded-3xl p-10 border border-purple-100/50 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2'>
              <div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity'></div>
              <div className='relative z-10'>
                <div className='w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-md'>
                  <Cloud className='w-10 h-10 text-purple-500' />
                </div>
                <h3 className='text-2xl font-bold text-gray-900 mb-4'>Özel Depolama</h3>
                <p className='text-gray-600 leading-relaxed mb-4'>
                  Fotoğraflarınız dünyanın en güvenli bulut altyapılarında{' '}
                  <span className='font-semibold text-purple-600'>(AWS S3)</span> izole edilmiş bir şekilde saklanır.
                </p>
                <div className='bg-purple-50 rounded-xl p-4 border border-purple-100'>
                  <div className='flex items-center space-x-2 text-sm text-gray-700'>
                    <Check className='text-purple-500 w-4 h-4' />
                    <span className='font-medium'>Kurumsal Sınıf Depolama</span>
                  </div>
                </div>
              </div>
            </div>

            <div className='group relative bg-white/60 backdrop-blur-sm rounded-3xl p-10 border border-blue-100/50 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2'>
              <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity'></div>
              <div className='relative z-10'>
                <div className='w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-md'>
                  <UserCheck className='w-10 h-10 text-blue-500' />
                </div>
                <h3 className='text-2xl font-bold text-gray-900 mb-4'>Kişisel Erişim</h3>
                <p className='text-gray-600 leading-relaxed mb-4'>
                  Sitenize <span className='font-semibold text-blue-600'>sadece siz ve partneriniz</span>{' '}
                  erişebilirsiniz. Arama motorları veya üçüncü şahıslar verilerinizi göremez.
                </p>
                <div className='bg-blue-50 rounded-xl p-4 border border-blue-100'>
                  <div className='flex items-center space-x-2 text-sm text-gray-700'>
                    <Check className='text-blue-500 w-4 h-4' />
                    <span className='font-medium'>Sadece Özel Erişim</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Flow */}
      <section id='data-flow' className='py-24 bg-white/40 backdrop-blur-sm'>
        <div className='max-w-6xl mx-auto px-6'>
          <div className='text-center mb-16'>
            <span className='text-rose-primary font-semibold text-sm uppercase tracking-wide'>Veri Akışı</span>
            <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-6'>Kimler Görebilir?</h2>
            <p className='text-xl text-gray-600 max-w-2xl mx-auto'>Verilerinizin yolculuğu baştan sona şifrelidir.</p>
          </div>

          <div className='relative bg-gradient-to-br from-white to-rose-50/30 rounded-[2.5rem] p-8 md:p-12 border-2 border-rose-100/50 shadow-xl'>
            <div className='flex flex-col md:flex-row items-center justify-between space-y-8 md:space-y-0'>
              <div className='flex flex-col items-center space-y-4'>
                <div className='relative'>
                  <div className='absolute -inset-2 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full opacity-20 blur-xl'></div>
                  <div className='relative flex -space-x-4'>
                    <div className='w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-lg bg-gray-100'>
                      <img src='/man-pp.png' alt='Partner 1' className='w-full h-full object-cover' />
                    </div>
                    <div className='w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-lg bg-gray-100'>
                      <img src='/woman-pp.png' alt='Partner 2' className='w-full h-full object-cover' />
                    </div>
                  </div>
                </div>
                <div className='text-center'>
                  <p className='font-bold text-gray-900'>Siz ve Partneriniz</p>
                  <p className='text-sm text-gray-500'>Tek erişim noktası</p>
                </div>
              </div>

              <div className='flex items-center'>
                <div className='flex flex-col items-center'>
                  <div className='w-32 h-1 bg-gradient-to-r from-rose-400 to-purple-400 rounded-full mb-2'></div>
                  <div className='bg-gradient-to-r from-rose-100 to-purple-100 px-4 py-2 rounded-full border border-rose-200 shadow-sm'>
                    <div className='flex items-center space-x-2'>
                      <Lock className='text-rose-500 w-3 h-3' />
                      <span className='text-xs font-semibold text-gray-700'>Şifreli Tünel</span>
                    </div>
                  </div>
                  <div className='w-32 h-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mt-2'></div>
                </div>
              </div>

              <div className='flex flex-col items-center space-y-4'>
                <div className='relative'>
                  <div className='absolute -inset-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl opacity-20 blur-xl'></div>
                  <div className='relative w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg'>
                    <Database className='text-white w-10 h-10' />
                  </div>
                </div>
                <div className='text-center'>
                  <p className='font-bold text-gray-900'>Özel Veritabanınız</p>
                  <p className='text-sm text-gray-500'>İzole ve güvenli</p>
                </div>
              </div>
            </div>

            <div className='mt-12 grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start space-x-3'>
                <X className='text-red-500 w-5 h-5 mt-1 shrink-0' />
                <div>
                  <p className='font-semibold text-gray-900 text-sm'>Arama Motorları</p>
                  <p className='text-xs text-gray-600'>Erişim yok</p>
                </div>
              </div>
              <div className='bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start space-x-3'>
                <X className='text-red-500 w-5 h-5 mt-1 shrink-0' />
                <div>
                  <p className='font-semibold text-gray-900 text-sm'>Üçüncü Şahıslar</p>
                  <p className='text-xs text-gray-600'>Erişim yok</p>
                </div>
              </div>
              <div className='bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start space-x-3'>
                <X className='text-red-500 w-5 h-5 mt-1 shrink-0' />
                <div>
                  <p className='font-semibold text-gray-900 text-sm'>Ciftopia Ekibi</p>
                  <p className='text-xs text-gray-600'>Erişim yok</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Privacy */}
      <section id='ai-privacy' className='py-24 relative'>
        <div className='max-w-6xl mx-auto px-6'>
          <div className='bg-gradient-to-br from-purple-50 to-indigo-50 rounded-[2.5rem] p-8 md:p-12 border-2 border-purple-100 shadow-xl relative overflow-hidden'>
            <div className='absolute top-0 right-0 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl'></div>
            <div className='absolute bottom-0 left-0 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl'></div>

            <div className='relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
              <div>
                <div className='inline-flex items-center space-x-2 bg-purple-100 px-4 py-2 rounded-full mb-6 border border-purple-200'>
                  <Brain className='text-purple-600 w-4 h-4' />
                  <span className='text-sm font-semibold text-purple-700'>Yapay Zeka & Gizlilik</span>
                </div>
                <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
                  AI Analizlerimiz Tamamen Güvenli
                </h2>
                <p className='text-lg text-gray-600 leading-relaxed mb-6'>
                  Yapay zeka analizlerimiz{' '}
                  <span className='font-semibold text-purple-600'>sadece size özel öneriler</span> sunmak içindir.
                  Cevaplarınız asla model eğitimi için kullanılmaz veya üçüncü taraflarla paylaşılmaz.
                </p>
                <div className='space-y-4'>
                  <div className='flex items-start space-x-3'>
                    <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                      <Check className='text-purple-600 w-4 h-4' />
                    </div>
                    <div>
                      <p className='font-semibold text-gray-900'>Yerel İşleme</p>
                      <p className='text-sm text-gray-600'>AI analizleri izole ortamda gerçekleşir</p>
                    </div>
                  </div>
                  <div className='flex items-start space-x-3'>
                    <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                      <Check className='text-purple-600 w-4 h-4' />
                    </div>
                    <div>
                      <p className='font-semibold text-gray-900'>Sıfır Veri Paylaşımı</p>
                      <p className='text-sm text-gray-600'>Hiçbir bilginiz model eğitiminde kullanılmaz</p>
                    </div>
                  </div>
                  <div className='flex items-start space-x-3'>
                    <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                      <Check className='text-purple-600 w-4 h-4' />
                    </div>
                    <div>
                      <p className='font-semibold text-gray-900'>Şifreli İletişim</p>
                      <p className='text-sm text-gray-600'>AI ile tüm iletişim uçtan uca şifreli</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-purple-200 shadow-lg'>
                <div className='flex items-center space-x-3 mb-6'>
                  <div className='w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md'>
                    <Bot className='text-white w-7 h-7' />
                  </div>
                  <div>
                    <p className='font-bold text-gray-900'>GPT-4o Mini</p>
                    <p className='text-sm text-gray-500'>Güvenli AI Asistanı</p>
                  </div>
                </div>
                <div className='space-y-3'>
                  <div className='bg-purple-50 rounded-xl p-4 border border-purple-100'>
                    <p className='text-sm text-gray-700'>
                      <span className='font-semibold'>Soru:</span> &quot;Partnerimle iletişimimizi nasıl
                      güçlendirebilirim?&quot;
                    </p>
                  </div>
                  <div className='bg-white rounded-xl p-4 border border-gray-200 shadow-sm'>
                    <p className='text-sm text-gray-700'>
                      <span className='font-semibold text-purple-600'>AI Önerisi:</span> &quot;Günlük Soru özelliğini
                      kullanarak birbirinize her gün yeni sorular sorun...&quot;
                    </p>
                  </div>
                  <div className='flex items-center justify-between text-[10px] text-gray-500 pt-2'>
                    <span className='flex items-center space-x-1'>
                      <Lock className='text-green-500 w-3 h-3' />
                      <span>Şifreli</span>
                    </span>
                    <span className='flex items-center space-x-1'>
                      <Shield className='text-purple-500 w-3 h-3' />
                      <span>Gizli</span>
                    </span>
                    <span className='flex items-center space-x-1'>
                      <ShieldUser className='text-blue-500 w-3 h-3' />
                      <span>Özel</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Control */}
      <section id='user-control' className='py-24 bg-gradient-to-br from-white to-blue-50/30'>
        <div className='max-w-6xl mx-auto px-6'>
          <div className='text-center mb-16'>
            <span className='text-rose-primary font-semibold text-sm uppercase tracking-wide'>Tam Kontrol</span>
            <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-6'>
              Verileriniz Üzerinde Tam Hakimiyet
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              İstediğiniz an tüm verilerinizi yönetin, indirin veya silin.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div className='bg-white/60 backdrop-blur-sm rounded-[2.5rem] p-10 border border-blue-100 shadow-lg hover:shadow-2xl transition-all'>
              <div className='w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mb-6 shadow-md'>
                <Download className='w-8 h-8 text-blue-500' />
              </div>
              <h3 className='text-2xl font-bold text-gray-900 mb-4'>Verilerinizi İndirin</h3>
              <p className='text-gray-600 leading-relaxed mb-6'>
                Tüm anılarınızı, fotoğraflarınızı ve notlarınızı tek bir tıkla indirin. Verileriniz size ait,
                istediğiniz zaman yanınızda taşıyabilirsiniz.
              </p>
              <div className='bg-blue-50 rounded-2xl p-4 border border-blue-100'>
                <div className='flex items-center justify-between gap-4'>
                  <span className='text-sm font-semibold text-gray-700'>Tüm Verileri İndir</span>
                  <button className='bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors flex items-center'>
                    <Download className='w-4 h-4 mr-2' />
                    İndir
                  </button>
                </div>
              </div>
            </div>

            <div className='bg-white/60 backdrop-blur-sm rounded-[2.5rem] p-10 border border-red-100 shadow-lg hover:shadow-2xl transition-all'>
              <div className='w-16 h-16 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl flex items-center justify-center mb-6 shadow-md'>
                <Trash2 className='w-8 h-8 text-red-500' />
              </div>
              <h3 className='text-2xl font-bold text-gray-900 mb-4'>Hesabınızı Silin</h3>
              <p className='text-gray-600 leading-relaxed mb-6'>
                İstediğiniz zaman hesabınızı kalıcı olarak silebilirsiniz. Unutulma hakkınıza saygı duyuyoruz. Tüm
                verileriniz sunucularımızdan tamamen kaldırılır.
              </p>
              <div className='bg-red-50 rounded-2xl p-4 border border-red-100'>
                <div className='flex items-center space-x-2 text-sm text-gray-700'>
                  <HelpCircle className='text-red-500 w-4 h-4' />
                  <span className='font-medium'>Kalıcı silme - geri alınamaz</span>
                </div>
              </div>
            </div>
          </div>

          <div className='mt-12 bg-gradient-to-br from-amber-50 to-orange-50 rounded-[2.5rem] p-10 border-2 border-amber-200 shadow-lg'>
            <div className='flex items-start space-x-6'>
              <div className='w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md'>
                <Scale className='w-7 h-7 text-amber-600' />
              </div>
              <div>
                <h4 className='font-bold text-xl text-gray-900 mb-3'>KVKK & GDPR Uyumluluğu</h4>
                <p className='text-gray-600 leading-relaxed mb-4'>
                  Kişisel Verilerin Korunması Kanunu (KVKK) ve Avrupa Genel Veri Koruma Yönetmeliği (GDPR)
                  gerekliliklerine tam uyumluyuz. Verilerinizin işlenmesi, saklanması ve silinmesi konusunda yasal
                  haklarınızı koruyoruz.
                </p>
                <div className='flex flex-wrap gap-3'>
                  {['Veri Minimizasyonu', 'Amaç Sınırlaması', 'Şeffaflık', 'Hesap Verebilirlik'].map(label => (
                    <span
                      key={label}
                      className='bg-white px-4 py-2 rounded-full text-sm font-semibold text-gray-700 border border-amber-200'
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section id='trust-badges' className='py-20 bg-white/40 backdrop-blur-sm'>
        <div className='max-w-6xl mx-auto px-6'>
          <div className='text-center mb-12'>
            <h3 className='text-3xl font-bold text-gray-900 mb-4'>Güvenle Paylaşmaya Devam Edin</h3>
            <p className='text-gray-600'>Endüstri lideri güvenlik standartlarıyla korunuyorsunuz.</p>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-5 gap-6'>
            {[
              { icon: Lock, color: 'text-green-500', label: 'SSL/TLS\nŞifreleme' },
              { icon: ShieldCheck, color: 'text-blue-500', label: '256-bit\nEncryption' },
              { icon: CloudUpload, color: 'text-purple-500', label: 'Secure Cloud\nStorage' },
              { icon: Database, color: 'text-rose-500', label: 'Daily\nBackups' },
              { icon: ShieldUser, color: 'text-amber-500', label: 'KVKK\nUyumlu' }
            ].map((badge, i) => (
              <div
                key={i}
                className='bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col items-center justify-center space-y-3 hover:shadow-md transition-all'
              >
                <badge.icon className={`${badge.color} w-10 h-10`} />
                <p className='text-sm font-semibold text-gray-700 text-center whitespace-pre-line'>{badge.label}</p>
              </div>
            ))}
          </div>

          <div className='mt-12 text-center'>
            <button className='inline-flex items-center bg-gradient-to-r from-rose-primary to-coral-warm text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all'>
              Güvenle Başlayın
              <ArrowRight className='ml-3 w-5 h-5' />
            </button>
            <p className='text-gray-500 mt-4 text-sm'>7 gün ücretsiz deneme • Kredi kartı gerekmez</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id='faq-security' className='py-24 relative'>
        <div className='max-w-4xl mx-auto px-6'>
          <div className='text-center mb-16'>
            <span className='text-rose-primary font-semibold text-sm uppercase tracking-wide'>
              Sıkça Sorulan Sorular
            </span>
            <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-6'>Güvenlik Hakkında</h2>
          </div>

          <div className='space-y-4'>
            {[
              {
                q: 'Fotoğraflarım ne kadar güvenli?',
                a: "Tüm fotoğraflarınız AWS S3'te şifrelenmiş olarak saklanır ve sadece sizin şifreleme anahtarınızla erişilebilir. Ciftopia ekibi dahil hiç kimse fotoğraflarınızı göremez.",
                color: 'text-rose-500',
                border: 'border-rose-100'
              },
              {
                q: 'Verilerim yedekleniyor mu?',
                a: 'Evet! Tüm verileriniz günlük otomatik olarak yedeklenir. Herhangi bir veri kaybı durumunda kolayca geri yükleyebiliriz.',
                color: 'text-purple-500',
                border: 'border-purple-100'
              },
              {
                q: "Başka insanlar subdomain'ime erişebilir mi?",
                a: "Hayır. Subdomain'iniz varsayılan olarak private moddadır. Sadece siz ve partneriniz giriş yaparak erişebilirsiniz. İsterseniz public moda da geçebilirsiniz.",
                color: 'text-blue-500',
                border: 'border-blue-100'
              },
              {
                q: 'Hesabımı silersem ne olur?',
                a: 'Hesabınızı sildiğinizde tüm verileriniz 30 gün içinde sunucularımızdan kalıcı olarak silinir. Bu süre içinde isterseniz hesabınızı geri alabilirsiniz.',
                color: 'text-green-500',
                border: 'border-green-100'
              }
            ].map((item, i) => (
              <div
                key={i}
                className={`bg-white/60 backdrop-blur-sm rounded-2xl p-6 border ${item.border} shadow-md hover:shadow-lg transition-all`}
              >
                <h4 className='font-bold text-lg text-gray-900 mb-3 flex items-center'>
                  <HelpCircle className={`${item.color} w-5 h-5 mr-3 shrink-0`} />
                  {item.q}
                </h4>
                <p className='text-gray-600 ml-8 leading-relaxed'>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
