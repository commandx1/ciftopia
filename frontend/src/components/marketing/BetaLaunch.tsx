import React from 'react'
import Link from 'next/link'
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  Star, 
  ShieldCheck, 
  Lock, 
  Heart,
  Cloud,
  Infinity,
  Zap
} from 'lucide-react'
import { FadeIn, LiveProgress } from './BetaLaunchClient'

interface BetaLaunchProps {
  initialStatus: {
    count: number;
    limit: number;
    available: boolean;
  };
}

export default function BetaLaunch({ initialStatus }: BetaLaunchProps) {
  return (
    <div className="bg-cream-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 bg-rose-primary rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-coral-warm rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <FadeIn className="inline-block mb-8">
            <span className="bg-gradient-to-r from-rose-primary to-coral-warm text-white px-8 py-3 rounded-full text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl">
              <Sparkles size={18} />
              Beta Lansman Özel
            </span>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="text-6xl lg:text-8xl font-black text-gray-900 mb-8 leading-tight">
              Kurucu Çiftler <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-primary via-purple-600 to-coral-warm">
                Kulübü&apos;ne Katılın
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-2xl text-gray-600 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
              Çiftopia&apos;nın ilk 50 kurucu çiftinden biri olun, ömür boyu tüm özelliklere <span className="text-rose-500 font-black underline underline-offset-8">ücretsiz</span> erişin.
            </p>
          </FadeIn>

          {/* Progress Section */}
          <FadeIn delay={0.3}>
            <div className="max-w-2xl mx-auto bg-white rounded-[3rem] p-10 shadow-2xl border-4 border-rose-100 relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
              
              {/* Canlı İlerleme İstemci Bileşeni */}
              <LiveProgress initialStatus={initialStatus} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                <Link
                  href={initialStatus.available ? "/register" : "#"}
                  className={`flex items-center justify-center gap-3 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl ${
                    initialStatus.available 
                    ? "bg-gray-900 text-white hover:bg-black hover:scale-[1.02] active:scale-95 shadow-gray-200"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {initialStatus.available ? (
                    <>Hemen Yerimi Ayır <ArrowRight size={18} /></>
                  ) : (
                    "Kontenjan Doldu"
                  )}
                </Link>
                <div className="bg-rose-50 rounded-2xl p-4 flex items-center justify-center gap-3 border border-rose-100">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Infinity className="text-rose-500" size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest leading-none mb-1">Ömür Boyu</p>
                    <p className="text-xs font-bold text-gray-700 leading-none">Tamamen Ücretsiz</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4 uppercase tracking-tighter">Kurucu Çift Ayrıcalıkları</h2>
            <p className="text-gray-500 font-medium">Bu kontenjanda yer alan çiftlerimizi neler bekliyor?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Infinity,
                title: "Ömür Boyu Ücretsiz",
                desc: "İleride uygulama ücretli olduğunda sizden hiçbir zaman ücret alınmayacak.",
                color: "rose"
              },
              {
                icon: Zap,
                title: "Tüm Modüllere Erişim",
                desc: "Zaman Kapsülü, Gelişmiş Galeri ve gelecek tüm modüller size açık olacak.",
                color: "amber"
              },
              {
                icon: Star,
                title: "Kurucu Üye Rozeti",
                desc: "Profilinizde ve sitenizde size özel 'Founding Couple' rozeti yer alacak.",
                color: "purple"
              },
              {
                icon: Cloud,
                title: "1GB Depolama",
                desc: "Anılarınız ve videolarınız için yüksek hızlı güvenli depolama alanı.",
                color: "blue"
              },
              {
                icon: ShieldCheck,
                title: "Öncelikli Destek",
                desc: "Geri bildirimleriniz bizim için en değerlisi, her sorunda yanınızdayız.",
                color: "green"
              },
              {
                icon: Heart,
                title: "Aşkınıza Özel Alan",
                desc: "Size özel subdomain ile aşkınızın dijital dünyasını hemen kurun.",
                color: "pink"
              }
            ].map((feature, i) => (
              <FadeIn 
                key={i}
                delay={i * 0.1}
                className="bg-gray-50 rounded-[2rem] p-8 border-2 border-transparent hover:border-rose-100 transition-all group"
              >
                <div className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:shadow-md transition-shadow text-${feature.color}-500`}>
                  <feature.icon size={28} />
                </div>
                <h4 className="text-xl font-black text-gray-900 mb-3 uppercase tracking-tighter">{feature.title}</h4>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">{feature.desc}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,#E91E63_0,transparent_50%)]"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <ShieldCheck className="mx-auto mb-8 text-rose-500" size={64} strokeWidth={1.5} />
          <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight uppercase tracking-tighter">
            Verileriniz En Yüksek Standartlarda Korunur
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
              <Lock size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest">SSL Şifreleme</span>
            </div>
            <div className="flex flex-col items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
              <Cloud size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest">AWS S3 Güvencesi</span>
            </div>
            <div className="flex flex-col items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
              <Star size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest">KVKK Uyumlu</span>
            </div>
            <div className="flex flex-col items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
              <Check size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest">Günlük Yedekleme</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-5xl font-black text-gray-900 mb-8">Aşkınızı Ölümsüzleştirin</h2>
          <p className="text-xl text-gray-500 mb-12 font-medium">
            Henüz yolun başındayız ve sizinle birlikte büyümek istiyoruz. <br />
            Ücretsiz kontenjan dolmadan yerinizi alın.
          </p>
          <Link
            href={initialStatus.available ? "/register" : "#"}
            className={`inline-flex items-center gap-4 px-12 py-6 rounded-full font-black uppercase tracking-widest text-lg transition-all shadow-2xl ${
              initialStatus.available 
              ? "bg-gradient-to-r from-rose-primary to-coral-warm text-white hover:shadow-rose-200 hover:scale-[1.05] active:scale-95"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {initialStatus.available ? "Hemen Başlayın" : "Kontenjan Doldu"}
            <ArrowRight size={24} />
          </Link>
          <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Kredi kartı gerekmez</p>
        </div>
      </section>
    </div>
  )
}
