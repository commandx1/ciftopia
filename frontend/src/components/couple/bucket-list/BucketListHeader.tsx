'use client'

import React from 'react'
import { Plus } from 'lucide-react'

interface BucketListHeaderProps {
  onAddClick: () => void
  completedCount: number
  totalCount: number
}

export const BucketListHeader = ({ onAddClick, completedCount, totalCount }: BucketListHeaderProps) => {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <section className="mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
        <div>
          <h1 className="text-5xl font-bold text-gray-900 mb-3">Hayallerimiz ✨</h1>
          <p className="text-gray-600 text-lg italic">Birlikte yapmak istediğiniz tüm şeyler burada</p>
        </div>
        <button
          onClick={onAddClick}
          className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl transition-all hover:-translate-y-1 flex items-center space-x-3 shadow-lg shadow-rose-200"
        >
          <Plus size={24} />
          <span>Yeni Hedef Ekle</span>
        </button>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-[2.5rem] p-8 md:p-10 border-2 border-purple-100 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl -translate-y-32 translate-x-32" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 w-full">
            <p className="text-purple-900/70 font-bold text-lg mb-2 uppercase tracking-widest">İlerleme Durumu</p>
            <p className="text-4xl md:text-5xl font-black text-purple-600 mb-6">
              {completedCount}/{totalCount} <span className="text-2xl font-bold text-purple-400">hayal tamamlandı</span>
            </p>
            
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-purple-900/60 font-bold">Tamamlanma Oranı</span>
                <span className="text-2xl font-black text-purple-600">{percentage}%</span>
              </div>
              <div className="w-full bg-white rounded-full h-5 overflow-hidden shadow-inner p-1">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-1000 ease-out shadow-sm" 
                  style={{ width: `${percentage}%` }} 
                />
              </div>
            </div>
            
            <p className="text-indigo-900/60 font-medium mt-6 flex items-center gap-2 italic">
              {percentage === 100 
                ? 'Tebrikler! Tüm hayallerinizi gerçekleştirdiniz! 🎉' 
                : totalCount === 0 
                  ? 'Henüz hayal eklememişsiniz. Hadi bir tane ekleyelim! ✨'
                  : `Harika gidiyorsunuz! ${totalCount - completedCount} hedef daha tamamlayın ve %100'e ulaşın! 🔥`}
            </p>
          </div>
          
          <div className="hidden md:flex w-32 h-32 bg-white rounded-[2rem] shadow-xl items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-500 group">
            <span className="text-6xl group-hover:scale-110 transition-transform">🏆</span>
          </div>
        </div>
      </div>
    </section>
  )
}
