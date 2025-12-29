import React from 'react';
import { ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const CTA = () => {
  return (
    <section id="cta-section" className="py-24 bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-white rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-[100px]"></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <h2 className=" text-5xl lg:text-7xl font-bold text-white mb-8 animate-in fade-in slide-in-from-bottom duration-700">
          Aşkınızı Ölümsüzleştirin
        </h2>
        <p className="text-2xl text-white/90 mb-12 leading-relaxed font-medium">
          Bugün başlayın, birlikte yaşadığınız her anı özel bir yerde saklayın. İlk 7 gün tamamen ücretsiz!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <Link href="/register">
            <Button size="lg" className="bg-white text-rose-500 px-12 py-8 rounded-full font-bold text-xl hover:shadow-2xl transition-all border-none hover:bg-rose-50">
              Hemen Başlayın
              <ArrowRight className="ml-3" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm text-white border-2 border-white px-12 py-8 rounded-full font-bold text-xl hover:bg-white/20 transition-all">
            <Play className="mr-3 fill-current" />
            Demo&apos;yu İzle
          </Button>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-white/90">
          {[
            "Kredi kartı gerekmez",
            "7 gün ücretsiz",
            "İstediğiniz zaman iptal"
          ].map((text, idx) => (
            <div key={idx} className="flex items-center space-x-3 font-semibold text-lg">
              <CheckCircle2 size={24} className="text-white fill-white/20" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

