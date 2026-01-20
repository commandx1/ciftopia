import React from 'react';

export default function FeedbackHero() {
  return (
    <section className="relative bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500 overflow-hidden py-16 lg:py-24">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
        <div className="space-y-6">
          <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-white/30">
            <span className="text-white font-bold text-sm flex items-center">
              <span className="mr-2">⭐</span>
              İlk 50 Kurucu Çift Programı
            </span>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
            Görüşleriniz Bizim İçin Çok Değerli!
          </h1>
          
          <p className="text-lg lg:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Çiftopia&apos;yı daha iyi hale getirmemize yardımcı olun. Deneyimlerinizi, önerilerinizi ve karşılaştığınız sorunları bizimle paylaşın.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-white text-sm lg:text-base">
            <div className="flex items-center space-x-2">
              <span className="text-green-300">✓</span>
              <span>Ömür Boyu Ücretsiz</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-300">✓</span>
              <span>Öncelikli Destek</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-300">✓</span>
              <span>Özel Rozetler</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
