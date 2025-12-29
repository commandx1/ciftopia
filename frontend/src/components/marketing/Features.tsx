import React from 'react';
import { 
  History, 
  Images, 
  Feather, 
  StickyNote, 
  ListChecks, 
  CalendarHeart, 
  Music, 
  MapPin, 
  Mail, 
  Gift, 
  ArrowRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  iconBg: string;
  isLarge?: boolean;
}

const FeatureCard = ({ icon, title, description, color, iconBg, isLarge }: FeatureCardProps) => (
  <div className={cn(
    "bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 group border border-gray-100 dark:border-slate-800",
    isLarge ? "md:col-span-2 lg:col-span-1" : ""
  )}>
    <div className={cn(
      "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform",
      iconBg
    )}>
      <div className="text-white">{icon}</div>
    </div>
    <h3 className=" text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-rose-primary transition-colors">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{description}</p>
    <div className={cn("inline-flex items-center font-semibold group-hover:translate-x-2 transition-transform cursor-pointer", color)}>
      Keşfet <ArrowRight className="ml-2 w-4 h-4" />
    </div>
  </div>
);

export const Features = () => {
  const mainFeatures = [
    {
      icon: <History size={28} />,
      title: "Anılar",
      description: "Birlikte yaşadığınız özel anları timeline formatında kaydedin. Tarih, konum ve fotoğraflarla zenginleştirin.",
      color: "text-rose-primary",
      iconBg: "bg-gradient-to-br from-rose-500 to-pink-400"
    },
    {
      icon: <Images size={28} />,
      title: "Galeri",
      description: "Fotoğraflarınızı albümler halinde organize edin. Sınırsız yükleme, yüksek kaliteli görüntüleme.",
      color: "text-purple-500",
      iconBg: "bg-gradient-to-br from-purple-500 to-indigo-400"
    },
    {
      icon: <Feather size={28} />,
      title: "Şiirler",
      description: "Birbirinize yazdığınız şiirleri, mektupları ve romantik notları özel bir koleksiyonda saklayın.",
      color: "text-amber-500",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-400"
    },
    {
      icon: <StickyNote size={28} />,
      title: "Özel Notlar",
      description: "Sticky note tarzında kısa mesajlar bırakın. Sürpriz notlar, hatırlatmalar ve sevgi dolu mesajlar.",
      color: "text-green-500",
      iconBg: "bg-gradient-to-br from-green-500 to-emerald-400"
    }
  ];

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-white to-cream-white dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <span className="text-rose-primary font-bold text-sm uppercase tracking-widest">Özellikler</span>
          <h2 className=" text-5xl font-bold text-gray-900 dark:text-white">Aşkınızı Dijitalleştirin</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Birlikte yaşadığınız her anı, her duyguyu özel bir yerde saklayın. Çiftopia ile sevginiz dijital dünyada da ölümsüzleşsin.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {mainFeatures.map((feature, idx) => (
            <FeatureCard key={idx} {...feature} />
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <div className="bg-blue-50 dark:bg-blue-900/10 rounded-3xl p-8 border-2 border-blue-100 dark:border-blue-900/30 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-blue-500/30">
                <ListChecks size={24} />
              </div>
              <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-3">Bucket List</h4>
              <p className="text-gray-600 dark:text-gray-400">Birlikte yapılacaklar listenizi oluşturun ve tamamladıkça işaretleyin.</p>
           </div>

           <div className="bg-rose-50 dark:bg-rose-900/10 rounded-3xl p-8 border-2 border-rose-100 dark:border-rose-900/30 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-rose-500/30">
                <CalendarHeart size={24} />
              </div>
              <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-3">Önemli Tarihler</h4>
              <p className="text-gray-600 dark:text-gray-400">Yıldönümleri, ilk öpücük, ilk buluşma gibi özel tarihleri kaydedin.</p>
           </div>

           <div className="bg-purple-50 dark:bg-purple-900/10 rounded-3xl p-8 border-2 border-purple-100 dark:border-purple-900/30 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-purple-500/30">
                <Music size={24} />
              </div>
              <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-3">Bizim Şarkılarımız</h4>
              <p className="text-gray-600 dark:text-gray-400">Ortak müzik zevkinizi yansıtan özel bir playlist oluşturun.</p>
           </div>

           <div className="bg-orange-50 dark:bg-orange-900/10 rounded-3xl p-8 border-2 border-orange-100 dark:border-orange-900/30 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-orange-500/30">
                <MapPin size={24} />
              </div>
              <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-3">Aşk Haritası</h4>
              <p className="text-gray-600 dark:text-gray-400">Birlikte gittiğiniz yerleri harita üzerinde işaretleyin.</p>
           </div>

           <div className="bg-teal-50 dark:bg-teal-900/10 rounded-3xl p-8 border-2 border-teal-100 dark:border-teal-900/30 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-teal-500 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-teal-500/30">
                <Mail size={24} />
              </div>
              <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-3">Zaman Kapsülü</h4>
              <p className="text-gray-600 dark:text-gray-400">Gelecekte açılacak mektuplar yazın. Belirlediğiniz tarihte açılır.</p>
           </div>

           <div className="bg-red-50 dark:bg-red-900/10 rounded-3xl p-8 border-2 border-red-100 dark:border-red-900/30 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-red-500/30">
                <Gift size={24} />
              </div>
              <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-3">Hediye Fikirleri</h4>
              <p className="text-gray-600 dark:text-gray-400">Birbirinize alacağınız hediyelerin gizli istek listesini tutun.</p>
           </div>
        </div>
      </div>
    </section>
  );
};

