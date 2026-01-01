import React from 'react';
import { Heart, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  children: React.ReactNode;
  quote?: string;
  isWide?: boolean;
}

export const AuthLayout = ({ children, quote = "Aşk, iki kalbin bir ritimde atmasıdır", isWide = false }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex bg-cream-white dark:bg-slate-950">
      <div className={cn(
        "w-full flex items-center justify-center px-6 py-12 bg-white dark:bg-slate-900 transition-all duration-500",
        isWide ? "lg:w-full" : "lg:w-[60%]"
      )}>
        <div className={cn(
          "w-full animate-in fade-in duration-500",
          isWide ? "max-w-5xl" : "max-w-md"
        )}>
          <div className="mb-12 text-center">
            <Link href={process.env.NEXT_PUBLIC_URL ?? '/'} className="inline-flex items-center justify-center space-x-3 mb-4 group">
              <div className="w-14 h-14 bg-gradient-to-br from-rose-primary to-coral-warm rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform">
                <Heart className="text-white w-8 h-8 fill-current" />
              </div>
              <span className=" text-3xl font-bold text-gray-800 dark:text-white">Çiftopia</span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Aşkınızın dijital yuvası</p>
          </div>
          {children}
        </div>
      </div>

      <div className="hidden lg:flex w-[40%] bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center max-w-lg">
          <div className="mb-8">
            <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Heart className="text-white w-16 h-16 fill-current" />
            </div>
          </div>

          <h2 className=" text-4xl font-bold text-white mb-8 leading-tight">
            &quot;{quote}&quot;
          </h2>
          
          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            Birlikte yaşadığınız her anı, her duyguyu özel bir yerde saklayın. Çiftopia ile sevginiz dijital dünyada da ölümsüzleşsin.
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-[2rem] p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="relative w-14 h-14 rounded-full border-4 border-white/30 overflow-hidden">
                    <Image 
                      src={`https://i.pravatar.cc/150?u=user${i}`} 
                      alt={`User ${i}`} 
                      fill
                      className="object-cover" 
                    />
                  </div>
                ))}
              </div>
            </div>
            <p className="text-white font-bold text-xl mb-3">500+ Mutlu Çift</p>
            <div className="flex items-center justify-center space-x-1 text-yellow-300">
              {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
              <span className="text-white/90 ml-3 font-bold text-lg">4.9/5</span>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { label: "Anı", value: "10K+" },
              { label: "Fotoğraf", value: "50K+" },
              { label: "Şiir", value: "2K+" }
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-white/80 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
