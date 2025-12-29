import React from 'react';
import Link from 'next/link';
import { Heart, Instagram, Twitter, Facebook, Youtube } from 'lucide-react';

export const Footer = () => {
  return (
    <footer id="footer" className="bg-slate-950 text-white py-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="space-y-8">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-primary to-coral-warm rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform">
                <Heart className="text-white w-7 h-7 fill-current" />
              </div>
              <span className=" text-3xl font-bold">Çiftopia</span>
            </Link>
            <p className="text-gray-400 leading-relaxed text-lg">
              Çiftler için özel dijital alan. Anılarınızı, fotoğraflarınızı ve sevginizi bir arada tutun.
            </p>
            <div className="flex space-x-5">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-rose-500 transition-all hover:-translate-y-1">
                  <Icon size={24} />
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-xl mb-8">Ürün</h4>
            <ul className="space-y-4">
              {['Özellikler', 'Fiyatlandırma', 'Demo', 'Yol Haritası', 'Güncellemeler'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-gray-400 hover:text-rose-400 transition-colors text-lg inline-block">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-xl mb-8">Şirket</h4>
            <ul className="space-y-4">
              {['Hakkımızda', 'Blog', 'Kariyer', 'Basın Kiti', 'İletişim'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-gray-400 hover:text-rose-400 transition-colors text-lg inline-block">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-xl mb-8">Destek</h4>
            <ul className="space-y-4">
              {['Yardım Merkezi', 'SSS', 'Gizlilik Politikası', 'Kullanım Şartları', 'KVKK'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-gray-400 hover:text-rose-400 transition-colors text-lg inline-block">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-lg">
            © 2024 Çiftopia. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center text-gray-400 text-lg font-medium">
            Sevgiyle yapıldı 
            <Heart className="text-rose-500 mx-3 animate-pulse fill-current" size={20} />
            Türkiye&apos;de
          </div>
        </div>
      </div>
    </footer>
  );
};

