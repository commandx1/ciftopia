import React from 'react';
import { Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  title: string;
  subtitle: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  highlight?: boolean;
  savings?: string;
  note?: string;
  gradient?: string;
  borderColor?: string;
}

const PricingCard = ({ 
  title, 
  subtitle, 
  price, 
  period, 
  features, 
  buttonText, 
  highlight, 
  savings, 
  note,
  borderColor
}: PricingCardProps) => (
  <div className={cn(
    "rounded-[2.5rem] p-10 flex flex-col relative transition-all duration-500 hover:-translate-y-2",
    highlight 
      ? "bg-gradient-to-br from-rose-500 to-pink-500 shadow-2xl scale-105 z-10 border-none text-white" 
      : cn("bg-white dark:bg-slate-900 border-2 shadow-sm", borderColor || "border-gray-100 dark:border-slate-800")
  )}>
    {highlight && (
      <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-bold text-sm shadow-lg">
        🔥 En Popüler
      </div>
    )}
    
    <div className="text-center mb-8">
      <h3 className={cn(" text-3xl font-bold mb-2", highlight ? "text-white" : "text-gray-900 dark:text-white")}>{title}</h3>
      <p className={cn("text-sm font-medium", highlight ? "text-rose-100" : "text-gray-500 dark:text-gray-400")}>{subtitle}</p>
    </div>
    
    <div className="text-center mb-10">
      <div className="flex items-start justify-center">
        <span className={cn("text-2xl font-bold mt-2", highlight ? "text-white" : "text-gray-900 dark:text-white")}>₺</span>
        <span className={cn("text-7xl font-bold tracking-tight", highlight ? "text-white" : "text-gray-900 dark:text-white")}>{price}</span>
      </div>
      <p className={cn("text-sm font-semibold mt-2", highlight ? "text-rose-100" : "text-gray-500 dark:text-gray-400")}>{period}</p>
      {savings && (
        <div className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-1 rounded-full text-xs font-bold mt-4">
          {savings}
        </div>
      )}
    </div>
    
    <ul className="space-y-5 mb-10 flex-1">
      {features.map((feature, idx) => (
        <li key={idx} className="flex items-start group">
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center mr-4 mt-0.5 shrink-0 transition-colors",
            highlight ? "bg-white/20 text-white" : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
          )}>
            <Check size={14} strokeWidth={3} />
          </div>
          <span className={cn("text-[15px] font-medium", highlight ? "text-white" : "text-gray-700 dark:text-gray-300")}>{feature}</span>
        </li>
      ))}
    </ul>
    
    <Link href="/register">
      <Button className={cn(
        "w-full py-8 rounded-full font-bold text-lg transition-all shadow-lg",
        highlight 
          ? "bg-white text-rose-500 hover:bg-rose-50 hover:shadow-white/20" 
          : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90"
      )}>
        {buttonText}
      </Button>
    </Link>
    
    {note && (
      <p className={cn("text-center text-xs mt-6 font-medium", highlight ? "text-rose-100" : "text-gray-500 dark:text-gray-400")}>{note}</p>
    )}
  </div>
);

export const Pricing = () => {
  return (
    <section id="pricing" className="py-24 bg-gray-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20 space-y-4">
          <span className="text-rose-primary font-bold text-sm uppercase tracking-widest">Fiyatlandırma</span>
          <h2 className=" text-5xl font-bold text-gray-900 dark:text-white">Sevginize Değer Verin</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Şeffaf ve adil fiyatlandırma. Gizli ücret yok, istediğiniz zaman iptal edebilirsiniz.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto items-center">
          <PricingCard 
            title="Kurulum"
            subtitle="Tek Seferlik Ödeme"
            price="249"
            period="Tek seferlik"
            features={[
              "Özel subdomain",
              "Tüm temel özellikler",
              "SSL sertifikası",
              "Teknik destek"
            ]}
            buttonText="Başlayın"
            note="İade edilemez"
          />
          
          <PricingCard 
            title="Aylık"
            subtitle="Esnek Abonelik"
            price="49"
            period="Her ay"
            features={[
              "Kurulum + tüm özellikler",
              "1GB depolama alanı",
              "Sınırsız fotoğraf albümü",
              "İstediğiniz zaman iptal"
            ]}
            buttonText="Şimdi Başla"
            highlight
            note="İlk 7 gün ücretsiz"
          />
          
          <PricingCard 
            title="Lifetime"
            subtitle="Tek Ödeme, Sonsuz Aşk"
            price="1,499"
            period="Tek seferlik"
            features={[
              "Kurulum dahil",
              "Ömür boyu erişim",
              "Tüm gelecek özellikler",
              "Öncelikli destek"
            ]}
            buttonText="Lifetime Al"
            savings="%70 tasarruf"
            note="En iyi değer"
            borderColor="border-purple-100 dark:border-purple-900/30"
          />
        </div>
        
        <div className="mt-20 bg-white dark:bg-slate-900 rounded-[3rem] p-10 max-w-4xl mx-auto shadow-xl border border-gray-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
              <Info className="text-white" size={32} />
            </div>
            <div>
              <h4 className="font-bold text-2xl text-gray-900 dark:text-white mb-6">Tüm Paketlerde Standart</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                {[
                  "Anılar, Galeri, Şiirler, Notlar",
                  "Bucket List & Önemli Tarihler",
                  "Müzik Playlist & Aşk Haritası",
                  "Zaman Kapsülü & Ruh Hali Takvimi",
                  "Hediye Fikirleri & Love Quiz",
                  "SSL Güvenliği & Günlük Yedekleme"
                ].map((item, i) => (
                  <div key={i} className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
                    <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3 text-blue-600 dark:text-blue-400">
                      <Check size={12} strokeWidth={4} />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

