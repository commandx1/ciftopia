'use client'

import React from 'react'
import { Map, Utensils, Film, Home, Heart } from 'lucide-react'

interface CategorySidebarProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
  counts: Record<string, number>
}

const categories = [
  { id: 'all', label: 'Tümü', icon: null, color: 'bg-gray-100', text: 'text-gray-500' },
  { id: 'travel', label: 'Seyahat', icon: Map, color: 'bg-blue-100', text: 'text-blue-500' },
  { id: 'food', label: 'Yemek', icon: Utensils, color: 'bg-orange-100', text: 'text-orange-500' },
  { id: 'experience', label: 'Deneyim', icon: Film, color: 'bg-purple-100', text: 'text-purple-500' },
  { id: 'home', label: 'Ev', icon: Home, color: 'bg-green-100', text: 'text-green-500' },
  { id: 'relationship', label: 'İlişki', icon: Heart, color: 'bg-rose-100', text: 'text-rose-500' }
]

export const CategorySidebar = ({ activeCategory, onCategoryChange, counts }: CategorySidebarProps) => {
  return (
    <aside className="lg:col-span-1">
      <div className="bg-white rounded-[2rem] shadow-xl p-6 sticky top-24 border border-rose-50">
        <h3 className="font-bold text-2xl text-gray-900 mb-6 px-2">Kategoriler</h3>
        
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                activeCategory === cat.id 
                  ? 'bg-rose-50 shadow-inner' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-4">
                {cat.icon ? (
                  <div className={`w-10 h-10 ${cat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <cat.icon className={cat.text} size={20} />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-white font-bold text-xs">ALL</span>
                  </div>
                )}
                <span className={`font-bold text-lg ${activeCategory === cat.id ? 'text-rose-600' : 'text-gray-700'}`}>
                  {cat.label}
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-black ${
                activeCategory === cat.id ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {counts[cat.id] || 0}
              </span>
            </button>
          ))}
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border-2 border-amber-100/50">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-xl">💡</span>
              </div>
              <span className="font-black text-amber-900 text-sm uppercase">İpucu</span>
            </div>
            <p className="text-sm text-amber-800 font-medium leading-relaxed italic">
              Hayallerinize tarih ekleyerek onları birer hedef haline getirebilirsiniz!
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
