"use client";

import React, { useEffect, useState } from 'react';
import { authService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Settings, Layout, LogOut, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.me()
      .then(res => setUser(res.data.data.user))
      .catch(() => window.location.href = '/login')
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = '/login';
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Yükleniyor...</div>;

  const coupleUrl = user?.coupleId ? `http://${user.coupleId.subdomain}.${process.env.NEXT_PUBLIC_MAIN_DOMAIN}` : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-rose-primary rounded-full flex items-center justify-center text-white">
              <Heart fill="currentColor" />
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">Çiftopia Panel</span>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-gray-600 dark:text-gray-400">
            <LogOut className="mr-2" size={18} /> Çıkış Yap
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Hoş geldin, {user?.firstName}!</h1>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Layout className="mr-2 text-rose-500" /> Site Yönetimi
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user?.coupleId ? (
                <div className="space-y-6">
                  <div className="p-6 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border-2 border-rose-100 dark:border-rose-900/30">
                    <p className="text-sm font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-2">Aktif Adresiniz</p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.coupleId.subdomain}.ciftopia.com</p>
                      <a 
                        href={`http://${user.coupleId.subdomain}.${process.env.NEXT_PUBLIC_MAIN_DOMAIN}`} 
                        target="_blank"
                        className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all text-rose-500"
                      >
                        <ExternalLink size={20} />
                      </a>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button className="flex-1 py-6 rounded-xl font-bold">İçerik Ekle</Button>
                    <Button variant="outline" className="flex-1 py-6 rounded-xl font-bold">Görünümü Düzenle</Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-6">Henüz bir çift sayfası oluşturmadınız.</p>
                  <Link href="/register">
                    <Button className="bg-rose-primary">Hemen Oluştur</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 text-blue-500" /> Hesap Ayarları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="ghost" className="w-full justify-start text-gray-600">Profil Düzenle</Button>
              <Button variant="ghost" className="w-full justify-start text-gray-600">Abonelik Planı</Button>
              <Button variant="ghost" className="w-full justify-start text-gray-600">Güvenlik</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

