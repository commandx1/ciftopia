import React from 'react';
import Link from 'next/link';
import { Instagram, Twitter, Facebook, Youtube, Heart } from 'lucide-react';
import Logo from '../ui/Logo'
import Image from 'next/image'

export const Footer = () => {
  return (
    <footer id="footer" className="bg-slate-950 text-white py-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="space-y-8">
            <Logo />
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
            © 2026 Çiftopia. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center text-gray-400 text-lg font-medium">
            Sevgiyle yapıldı 
            <div className='w-6 h-6 relative mx-3 animate-pulse'>
              <Image src='/favicon/favicon.svg' alt='Ciftopia icon' fill className='object-contain' />
            </div>
            Türkiye&apos;de
          </div>
        </div>
      </div>
    </footer>
  );
};

