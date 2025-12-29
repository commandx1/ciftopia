"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Heart, Camera, Calendar, MapPin } from 'lucide-react';

export default function CouplePage() {
  const { subdomain } = useParams();
  const [loading, setLoading] = useState(true);

  // In a real app, we would fetch couple data based on the subdomain
  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, [subdomain]);

  if (loading) return <div className="flex items-center justify-center min-h-screen text-rose-500 animate-pulse"><Heart size={48} fill="currentColor" /></div>;

  return (
    <div className="min-h-screen bg-rose-50/30">
      <header className="h-[60vh] relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
        </div>
        
        <div className="relative text-center text-white space-y-6 animate-in fade-in zoom-in duration-1000">
          <Heart className="mx-auto text-rose-400 fill-current" size={64} />
          <h1 className="text-6xl md:text-8xl font-serif font-bold">Serhat & Sinem</h1>
          <p className="text-2xl font-medium tracking-widest uppercase">14 Şubat 2021&apos;den Beri Birlikte</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 -mt-20 relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-[2rem] p-8 shadow-xl text-center space-y-4 transform hover:-translate-y-2 transition-transform">
            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto text-rose-500">
              <Calendar size={32} />
            </div>
            <h3 className="text-xl font-bold">1,247 Gün</h3>
            <p className="text-gray-500">Aşkla geçen zaman</p>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-xl text-center space-y-4 transform hover:-translate-y-2 transition-transform">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto text-purple-500">
              <Camera size={32} />
            </div>
            <h3 className="text-xl font-bold">342 Anı</h3>
            <p className="text-gray-500">Paylaşılan mutluluklar</p>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-xl text-center space-y-4 transform hover:-translate-y-2 transition-transform">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto text-blue-500">
              <MapPin size={32} />
            </div>
            <h3 className="text-xl font-bold">12 Şehir</h3>
            <p className="text-gray-500">Gezilen yerler</p>
          </div>
        </div>

        <section className="py-20">
          <h2 className="text-4xl font-serif font-bold text-gray-900 text-center mb-12">Son Anılarımız</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-[2.5rem] overflow-hidden shadow-lg group">
                <div className="h-64 overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=2070&auto=format&fit=crop&sig=${i}`} 
                    alt="Memory" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-8">
                  <span className="text-rose-500 font-bold text-sm uppercase tracking-widest">24 Aralık 2023</span>
                  <h4 className="text-2xl font-bold mt-2 mb-4">Kış Tatili Başladı</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Yılın en sevdiğimiz zamanı geldi. Birlikte geçirdiğimiz her an paha biçilemez...
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

