/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { Star, Quote } from 'lucide-react';

interface TestimonialProps {
  name: string;
  avatar: string;
  text: string;
  duration: string;
  rating: number;
}

const TestimonialCard = ({ name, avatar, text, duration, rating }: TestimonialProps) => (
  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 dark:border-slate-800 relative group">
    <div className="absolute top-8 right-10 text-rose-100 dark:text-rose-900/20 group-hover:text-rose-200 transition-colors">
      <Quote size={60} fill="currentColor" />
    </div>
    
    <div className="flex items-center mb-8 relative">
      <div className="relative">
        <img src={avatar} alt={name} className="w-16 h-16 rounded-full mr-5 object-cover border-2 border-rose-100 dark:border-rose-900/30" />
        <div className="absolute -bottom-1 -right-1 bg-rose-500 rounded-full p-1 border-2 border-white dark:border-slate-900">
          <Star size={10} className="text-white fill-current" />
        </div>
      </div>
      <div>
        <h4 className="font-bold text-xl text-gray-900 dark:text-white">{name}</h4>
        <div className="flex items-center mt-1">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} size={14} className="text-yellow-400 fill-current" />
          ))}
        </div>
      </div>
    </div>
    
    <p className="text-gray-600 dark:text-gray-400 leading-relaxed italic text-lg mb-8 relative">
      &quot;{text}&quot;
    </p>
    
    <div className="pt-6 border-t border-gray-100 dark:border-slate-800">
      <span className="text-sm font-bold text-rose-500 uppercase tracking-widest">{duration}</span>
    </div>
  </div>
);

export const Testimonials = () => {
  const testimonials = [
    {
      name: "Ayşe & Mehmet",
      avatar: "https://i.pravatar.cc/150?u=ayse",
      text: "Çiftopia sayesinde tüm anılarımızı bir arada tutuyoruz. Özellikle zaman kapsülü özelliğini çok sevdik. 5. yıldönümümüzde açacağımız mektupları yazdık!",
      duration: "2 yıldır kullanıyor",
      rating: 5
    },
    {
      name: "Can & Zeynep",
      avatar: "https://i.pravatar.cc/150?u=can",
      text: "Uzun mesafeli ilişkimizde bizi bir arada tutan en güzel araç. Her gün birbirimize not bırakıyoruz ve fotoğraflarımızı paylaşıyoruz. Çok romantik!",
      duration: "1 yıldır kullanıyor",
      rating: 5
    },
    {
      name: "Elif & Burak",
      avatar: "https://i.pravatar.cc/150?u=elif",
      text: "Düğün hazırlıklarımızda bile kullandık. Bucket list&apos;imizi oluşturduk ve balayı planlarımızı buradan yaptık. Harika bir platform!",
      duration: "6 aydır kullanıyor",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-gradient-to-br from-white to-rose-50 dark:from-slate-950 dark:to-rose-950/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20 space-y-4">
          <span className="text-rose-primary font-bold text-sm uppercase tracking-widest">Yorumlar</span>
          <h2 className=" text-5xl font-bold text-gray-900 dark:text-white">Mutlu Çiftlerimiz</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            500+ çift Çiftopia&apos;yı kullanıyor ve aşklarını dijitalleştiriyor.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {testimonials.map((t, idx) => (
            <TestimonialCard key={idx} {...t} />
          ))}
        </div>
        
        <div className="mt-20 text-center animate-in fade-in zoom-in duration-700">
          <div className="inline-flex flex-col sm:flex-row items-center gap-6 bg-white dark:bg-slate-900 rounded-[2.5rem] px-10 py-6 shadow-xl border border-rose-100 dark:border-rose-900/20">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <img 
                  key={i} 
                  src={`https://i.pravatar.cc/150?u=user${i}`} 
                  alt="User" 
                  className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 object-cover shadow-md" 
                />
              ))}
            </div>
            <div className="h-8 w-px bg-gray-200 dark:bg-slate-800 hidden sm:block"></div>
            <div className="flex flex-col items-center sm:items-start">
              <div className="flex items-center gap-2">
                <span className="font-bold text-2xl text-gray-900 dark:text-white">500+</span>
                <span className="text-gray-500 dark:text-gray-400 font-medium">mutlu çift</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-current" />
                ))}
                <span className="font-bold text-gray-900 dark:text-white ml-2">4.9/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

