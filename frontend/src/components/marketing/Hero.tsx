import React from 'react';
import { ArrowRight, Play, Star, Heart, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export const Hero = () => {
  return (
    <section id="hero-section" className="relative bg-gradient-to-br from-cream-white via-pink-50 to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-rose-950/20 overflow-hidden min-h-[700px] flex items-center">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-rose-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-coral-warm rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
            <div className="inline-block">
              <span className="bg-rose-100 text-rose-primary px-4 py-2 rounded-full text-sm font-semibold dark:bg-rose-900/30 dark:text-rose-400">
                💕 500+ Çift Bize Güveniyor
              </span>
            </div>
            
            <h1 className=" text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
              Aşkınızın <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-primary to-coral-warm">Dijital Yuvası</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">
              Anılarınızı, fotoğraflarınızı ve özel notlarınızı birlikte saklayın. Sadece ikinize özel bir web sitesi.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-rose-primary to-coral-warm text-white px-8 py-7 rounded-full font-bold text-lg hover:shadow-2xl transition-all group w-full sm:w-auto border-none">
                  Hemen Başlayın
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="bg-white text-rose-primary border-2 border-rose-primary px-8 py-7 rounded-full font-bold text-lg hover:bg-rose-50 transition-all w-full sm:w-auto dark:bg-slate-900 dark:hover:bg-slate-800">
                <Play className="mr-2 fill-current" size={20} />
                Demo&apos;yu İncele
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 pt-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
              </div>
              <span className="text-gray-600 dark:text-gray-400 font-medium ml-2">4.9/5 (247 değerlendirme)</span>
            </div>
          </div>
          
          <div className="relative hidden lg:block animate-in fade-in slide-in-from-right duration-1000">
            <div className="relative w-full h-[550px] rounded-[3rem] overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-700">
              <Image 
                className="object-cover" 
                src="/banner_image.png" 
                alt="Romantic couple" 
                fill
                priority
              />
            </div>
            
            <div className="absolute -bottom-10 -left-10 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 flex items-center space-x-4 border border-rose-100 dark:border-rose-900/30 animate-bounce-slow">
              <div className="w-14 h-14 bg-gradient-to-br from-rose-primary to-coral-warm rounded-full flex items-center justify-center">
                <Heart className="text-white fill-current" />
              </div>
              <div>
                <p className="font-bold text-2xl text-gray-800 dark:text-white">1,247</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Paylaşılan Anı</p>
              </div>
            </div>
            
            <div className="absolute -top-10 -right-10 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 flex items-center space-x-4 border border-purple-100 dark:border-purple-900/30 animate-bounce-slow" style={{ animationDelay: '1s' }}>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Camera className="text-white" />
              </div>
              <div>
                <p className="font-bold text-2xl text-gray-800 dark:text-white">8,432</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Fotoğraf</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
