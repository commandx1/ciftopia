import React from 'react';
import { 
  Clock, 
  Images, 
  Feather, 
  StickyNote, 
  Plus, 
  CloudUpload, 
  PenTool, 
  MessageSquare,
  ExternalLink,
  Database,
  ArrowUp,
  Crown,
  Camera,
  Heart,
  ArrowRight,
  Hourglass
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { authServiceServer } from '@/services/api-server';
import { dashboardServiceServer } from '@/services/dashboard-server';
import { redirect } from 'next/navigation';
import { getUserAvatar, getPublicAssetUrl, formatBytes } from '@/lib/utils';
import BulbIcon from '@/components/ui/icons/BulbIcon';
import { format, formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export default async function DashboardPage() {
  const user = await authServiceServer.me();
  
  let dashboardData = null;
  if (dashboardServiceServer && dashboardServiceServer.getStats) {
    dashboardData = await dashboardServiceServer.getStats();
  }

  if (!user) {
    redirect('/login');
  }

  if (!dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Veriler yüklenemedi</h2>
        <p className="text-gray-600">Lütfen sayfayı yenilemeyi deneyin.</p>
      </div>
    );
  }

  const { stats, coupleInfo, recentActivities, weeklyActivity, distribution } = dashboardData;

  const subdomain = user?.coupleId?.subdomain;
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'ciftopia.local:3000';
  const coupleUrl = '/';

  const storagePercentage = Math.round((coupleInfo.storageUsed / coupleInfo.storageLimit) * 100);

  return (
    <div id="main-dashboard" className="max-w-7xl mx-auto px-6 py-8">
      
      <section id="welcome-section" className="mb-8">
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-8 border-2 border-rose-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Merhaba {user?.firstName}! 👋</h1>
              <p className="text-gray-600 text-lg">Siteniz <span className="font-bold text-rose-600">{coupleInfo.daysActive} gündür</span> aktif</p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-gradient-to-br from-rose-primary to-coral-warm rounded-full flex items-center justify-center animate-pulse">
                <Heart className="text-white w-10 h-10 fill-current" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 1, label: "Anı", value: stats.memoryCount, icon: Clock, color: "rose" },
              { id: 2, label: "Fotoğraf", value: stats.photoCount, icon: Images, color: "purple" },
              { id: 3, label: "Şiir", value: stats.poemCount, icon: Feather, color: "amber" },
              { id: 4, label: "Not", value: stats.noteCount, icon: StickyNote, color: "green" },
            ].map((stat) => (
              <div key={stat.id} className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon className={`text-${stat.color}-500 w-6 h-6`} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="quick-actions-section" className="mb-8">
        <h2 className=" text-2xl font-bold text-gray-900 mb-6">Hızlı İşlemler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { id: 1, title: "Yeni Anı", href: "/memories", icon: Plus, color: "rose" },
            { id: 2, title: "Fotoğraf", href: "/gallery", icon: CloudUpload, color: "purple" },
            { id: 3, title: "Şiir Yaz", href: "/poems", icon: PenTool, color: "amber" },
            { id: 4, title: "Not Bırak", href: "/notes", icon: MessageSquare, color: "green" },
            { id: 5, title: "Zaman Kapsülü", href: "/time-capsule", icon: Hourglass, color: "indigo" },
          ].map((action) => (
            <Link key={action.id} href={action.href} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 group text-center">
              <div className={`w-16 h-16 bg-${action.color}-100 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform`}>
                <action.icon className={`text-${action.color}-500 w-8 h-8`} />
              </div>
              <h3 className="font-bold text-sm text-gray-900">{action.title}</h3>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <section id="site-preview-section" className="lg:col-span-2">
          <h2 className=" text-2xl font-bold text-gray-900 mb-6">Site Önizleme</h2>
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                  <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                  <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <span className="text-white text-sm font-mono">{subdomain}.{mainDomain}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-6 py-8">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl relative">
                  <Image src={getUserAvatar(coupleInfo.partner1)} alt="Partner 1" className="object-cover" fill />
                </div>
                <div className="text-5xl text-white">
                  <Heart className="animate-pulse fill-current" />
                </div>
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl relative">
                  <Image src={getUserAvatar(coupleInfo.partner2)} alt="Partner 2" className="object-cover" fill />
                </div>
              </div>
              
              <div className="text-center">
                <h3 className=" text-3xl font-bold text-white mb-2">{coupleInfo.coupleName || `${user?.firstName} & Partner`}</h3>
                <p className="text-white/90">
                  {coupleInfo.relationshipStartDate 
                    ? `${format(new Date(coupleInfo.relationshipStartDate), 'd MMMM yyyy', { locale: tr })}'den beri birlikte 💕`
                    : "Mutluluğa ilk adımdan beri birlikte 💕"}
                </p>
              </div>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-rose-500 mb-1">{coupleInfo.daysActive}</div>
                  <div className="text-xs text-gray-600">Gün</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-purple-500 mb-1">{stats.memoryCount}</div>
                  <div className="text-xs text-gray-600">Anı</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-blue-500 mb-1">{stats.photoCount}</div>
                  <div className="text-xs text-gray-600">Fotoğraf</div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                {coupleUrl && (
                  <Link href={coupleUrl} className="flex-1 bg-gradient-to-r from-rose-primary to-coral-warm text-white text-center py-3 rounded-full font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2">
                    <ExternalLink size={18} />
                    <span>Siteyi Görüntüle</span>
                  </Link>
                )}
                <Link href="#" className="flex-1 bg-gray-800 text-white text-center py-3 rounded-full font-semibold hover:bg-gray-900 transition-all flex items-center justify-center space-x-2">
                  <PenTool size={18} />
                  <span>Siteyi Düzenle</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="storage-section" className="lg:col-span-1">
          <h2 className=" text-2xl font-bold text-gray-900 mb-6">Depolama</h2>
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Kullanılan Alan</p>
                <p className="text-2xl font-bold text-gray-900">{formatBytes(coupleInfo.storageUsed)}</p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Database className="text-blue-500 w-8 h-8" />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{formatBytes(coupleInfo.storageUsed)} / {formatBytes(coupleInfo.storageLimit)}</span>
                <span>{storagePercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${storagePercentage}%` }}
                ></div>
              </div>
            </div>
            
            <Link href="/settings" className="block w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-center py-3 rounded-full font-semibold hover:shadow-lg transition-all">
              <ArrowUp size={18} className="inline mr-2" />
              Depolamayı Yükselt
            </Link>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 shadow-lg mt-6 border-2 border-amber-100">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Crown className="text-white w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Premium&apos;a Geçin</h3>
                <p className="text-gray-700 text-sm mb-4">5GB depolama, sınırsız özellik ve daha fazlası!</p>
                <Link href="#" className="inline-block bg-amber-500 text-white px-5 py-2 rounded-full font-semibold text-sm hover:bg-amber-600 transition-all">
                  Detayları Gör
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section id="recent-activity-section" className="mb-8">
        <h2 className=" text-2xl font-bold text-gray-900 mb-6">Son Aktiviteler</h2>
        <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-50">
          <div className="space-y-6">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity: any) => (
                <div key={activity._id} className="flex items-start space-x-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-rose-200 relative">
                    <Image 
                      src={getUserAvatar(activity.userId)} 
                      alt={activity.userId?.firstName || 'User'} 
                      className="object-cover" 
                      fill 
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {activity.userId?.firstName} {activity.description}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: tr })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">Henüz bir aktivite bulunmuyor.</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center">
            <Link href="/activities" className="inline-flex items-center text-rose-primary font-semibold hover:text-rose-600 transition-colors">
              Tüm Aktiviteleri Gör
              <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      <section id="insights-section" className="mb-8">
        <h2 className=" text-2xl font-bold text-gray-900 mb-6">İstatistikler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-gray-900">Haftalık Aktivite</h3>
              <ArrowUp size={20} className="text-rose-500" />
            </div>
            <div className="space-y-4">
              {weeklyActivity.map((item: any, i: number) => {
                const maxCount = Math.max(...weeklyActivity.map((a: any) => a.count), 1);
                const width = `${(item.count / maxCount) * 100}%`;
                
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">{item.day}</span>
                      <span className="font-semibold text-gray-900">{item.count} içerik</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full transition-all duration-1000" 
                        style={{ width }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-gray-900">İçerik Dağılımı</h3>
              <Clock size={20} className="text-purple-500" />
            </div>
            <div className="space-y-6">
              {distribution.map((item: any, i: number) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 bg-${item.color}-500 rounded-full`}></div>
                      <span className="text-gray-700 font-medium">{item.label}</span>
                    </div>
                    <span className="text-gray-900 font-bold">%{item.percentage}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`bg-${item.color}-500 h-full rounded-full transition-all duration-1000`} 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Toplam İçerik</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalContent}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Site Ömrü</p>
                  <p className="text-2xl font-bold text-rose-600">{coupleInfo.daysActive} Gün</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="tips-section" className="mb-8">
        <h2 className=" text-2xl font-bold text-gray-900 mb-6">İpuçları & Öneriler</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: 1, title: "Düzenli Paylaşım", desc: "Her gün küçük de olsa bir anınızı paylaşın. Zaman içinde harika bir koleksiyon oluşturun.", icon: BulbIcon, color: "blue" },
            { id: 2, title: "Fotoğraf Kalitesi", desc: "Yüksek çözünürlüklü fotoğraflar yükleyin. Gelecekte daha güzel hatıralar için.", icon: Camera, color: "purple" },
            { id: 3, title: "Romantik Sürprizler", desc: "Zaman kapsülü özelliğini kullanarak gelecekte açılacak romantik mesajlar bırakın.", icon: Heart, color: "rose" },
          ].map((tip) => (
            <div key={tip.id} className={`bg-gradient-to-br from-${tip.color}-50 to-${tip.color === 'rose' ? 'pink' : tip.color === 'blue' ? 'cyan' : 'indigo'}-50 rounded-2xl p-6 border-2 border-${tip.color}-100`}>
              <div className={`w-12 h-12 bg-${tip.color}-500 rounded-full flex items-center justify-center mb-4`}>
                <tip.icon className="text-white w-6 h-6" size={24} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">{tip.title}</h3>
              <p className="text-gray-700 text-sm">{tip.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
