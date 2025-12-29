"use client";

import React, { useState } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { authService } from '@/services/api';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.login(formData);
      // Redirect to dashboard (app.ciftopia.com)
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.message || "Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">Tekrar Hoşgeldiniz 💕</h1>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Anılarınıza devam etmek için giriş yapın</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">E-posta Adresi</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input 
              name="email"
              type="email" 
              value={formData.email}
              onChange={handleInputChange}
              placeholder="ornek@email.com" 
              className="pl-12 py-7 bg-soft-gray dark:bg-slate-800 border-none rounded-2xl focus-visible:ring-rose-primary text-lg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between ml-1">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Şifre</label>
            <Link href="#" className="text-sm text-rose-primary hover:text-coral-warm font-bold transition-colors">
              Şifremi unuttum
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input 
              name="password"
              type={showPassword ? "text" : "password"} 
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••" 
              className="pl-12 pr-12 py-7 bg-soft-gray dark:bg-slate-800 border-none rounded-2xl focus-visible:ring-rose-primary text-lg"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3 ml-1">
          <Checkbox id="remember" className="w-5 h-5 border-2 border-gray-300 data-[state=checked]:bg-rose-primary data-[state=checked]:border-rose-primary" />
          <label htmlFor="remember" className="text-sm text-gray-700 dark:text-gray-300 font-bold cursor-pointer">
            Beni hatırla
          </label>
        </div>

        {error && <p className="text-rose-500 text-sm font-bold ml-1">{error}</p>}

        <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-rose-primary to-coral-warm text-white py-8 rounded-2xl font-bold text-xl hover:shadow-xl transition-all transform hover:scale-[1.01] border-none group">
          {isLoading ? <Loader2 className="animate-spin" /> : <>Giriş Yap <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" /></>}
        </Button>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-slate-900 text-gray-500 font-bold uppercase tracking-widest">veya</span>
          </div>
        </div>

        <Button variant="outline" type="button" className="w-full py-8 rounded-2xl font-bold text-lg border-2 border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google ile giriş yap
        </Button>

        <div className="text-center pt-8 border-t border-gray-100 dark:border-slate-800">
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Hesabınız yok mu? 
            <Link href="/register" className="text-rose-primary hover:text-coral-warm font-bold transition-colors ml-2 underline underline-offset-4">
              Hemen oluşturun
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
