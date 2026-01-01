import React from 'react';
import { UserPlus, HeartHandshake, Rocket, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface StepProps {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  bgColor: string;
  iconColor: string;
  gradient: string;
  isLower?: boolean;
}

const Step = ({ number, icon, title, description, time, bgColor, iconColor, gradient, isLower }: StepProps) => (
  <div className={cn(
    "rounded-[3rem] p-10 text-center relative group hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-white/20",
    bgColor,
    isLower ? "lg:mt-12" : ""
  )}>
    <div className={cn(
      "w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-8 shadow-xl group-hover:scale-110 transition-transform duration-500",
      gradient
    )}>
      {number}
    </div>
    <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:rotate-6 transition-transform">
      <div className={iconColor}>{icon}</div>
    </div>
    <h3 className=" text-2xl font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
    <div className="mt-8 inline-block bg-white dark:bg-slate-800 px-6 py-2 rounded-full text-sm font-bold shadow-md">
      <span className={iconColor.replace('text-', 'text-opacity-100 text-')}>{time}</span>
    </div>
  </div>
);

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20 space-y-4">
          <span className="text-rose-primary font-bold text-sm uppercase tracking-widest">Süreç</span>
          <h2 className=" text-5xl font-bold text-gray-900 dark:text-white">3 Basit Adımda Başlayın</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Sadece birkaç dakika içinde kendi özel alanınızı oluşturun ve sevgilinizle anılarınızı paylaşmaya başlayın.
          </p>
        </div>
        
        <div className="relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-rose-primary via-purple-500 to-blue-500 transform -translate-y-1/2 hidden lg:block opacity-20"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
            <Step 
              number={1}
              icon={<UserPlus size={32} />}
              title="Kaydolun ve Subdomain Seçin"
              description="Email ve şifrenizle kayıt olun. Özel subdomain'inizi seçin (örn: ahmet-ayse.ciftopia.com)"
              time="2 dakika"
              bgColor="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/10 dark:to-pink-950/10"
              iconColor="text-rose-primary"
              gradient="bg-gradient-to-br from-rose-500 to-pink-500"
            />
            
            <Step 
              number={2}
              icon={<HeartHandshake size={32} />}
              title="Partnerinizi Ekleyin"
              description="Sevgilinizin bilgilerini girin. Size özel giriş bilgileri oluşturulur ve site aktif olur."
              time="1 dakika"
              bgColor="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/10 dark:to-indigo-950/10"
              iconColor="text-purple-500"
              gradient="bg-gradient-to-br from-purple-500 to-indigo-500"
              isLower
            />
            
            <Step 
              number={3}
              icon={<Rocket size={32} />}
              title="Anılarınızı Paylaşmaya Başlayın"
              description="Hemen fotoğraf, anı ve notlarınızı eklemeye başlayın. Her şey sadece ikinize özel!"
              time="Sınırsız"
              bgColor="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/10 dark:to-cyan-950/10"
              iconColor="text-blue-500"
              gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
            />
          </div>
        </div>
        
        <div className="text-center mt-20 animate-in fade-in slide-in-from-bottom duration-700">
          <Link href="/register">
            <Button size="lg" className="bg-gradient-to-r from-rose-primary to-coral-warm text-white px-12 py-8 rounded-full font-bold text-xl hover:shadow-2xl transition-all border-none">
              Şimdi Başla - Ücretsiz Dene
              <ArrowRight className="ml-3" />
            </Button>
          </Link>
          <p className="text-gray-500 dark:text-gray-400 mt-6 font-medium">Kredi kartı gerekmez • 7 gün ücretsiz deneme</p>
        </div>
      </div>
    </section>
  );
};




