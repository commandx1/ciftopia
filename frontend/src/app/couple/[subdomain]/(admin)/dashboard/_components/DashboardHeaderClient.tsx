"use client";

import React from 'react';
import { 
  Heart, 
  LogOut, 
  Settings, 
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { authService } from '@/services/api';
import { User } from '@/lib/type'

interface DashboardHeaderClientProps {
  user: User;
  userDisplayName: string;
  userAvatar: string;
}

export default function DashboardHeaderClient({
  user,
  userDisplayName,
  userAvatar
}: DashboardHeaderClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await authService.logout();
      router.push(`${process.env.NEXT_PUBLIC_URL}/login`);
    } catch {
      router.push(`${process.env.NEXT_PUBLIC_URL}/login`);
    }
  };

  return (
    <div className="relative group">
      <button className="flex items-center space-x-3 hover:bg-gray-50 rounded-full px-3 py-2 transition-all">
        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-rose-200">
          <Image src={userAvatar} alt={user?.firstName || 'User'} fill className="object-cover" />
        </div>
        <span className="font-medium text-gray-800">{user?.firstName}</span>
        <ChevronDown size={14} className="text-gray-500" />
      </button>
      
      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2">
        <div className="p-4 border-b border-gray-100">
          <p className="font-semibold text-gray-900">{userDisplayName}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
        <div className="py-2">
          <Link href="/dashboard" className={`flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors ${pathname === '/dashboard' ? 'text-rose-primary' : 'text-gray-700'}`}>
            <Heart size={18} className={pathname === '/dashboard' ? 'text-rose-primary' : 'text-gray-500'} />
            <span>Dashboard</span>
          </Link>
          <Link href="/settings" className={`flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors ${pathname.includes('/settings') ? 'text-rose-primary' : 'text-gray-700'}`}>
            <Settings size={18} className={pathname.includes('/settings') ? 'text-rose-primary' : 'text-gray-500'} />
            <span>Ayarlar</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-red-600"
          >
            <LogOut size={18} />
            <span>Çıkış</span>
          </button>
        </div>
      </div>
    </div>
  );
}
