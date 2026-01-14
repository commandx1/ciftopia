'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check, Calendar, Map, Utensils, Film, Home, Heart, MoreVertical, Trash2 } from 'lucide-react'
import { BucketListItem } from '@/lib/type'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import Image from 'next/image'
import { cn, getUserAvatar } from '@/lib/utils'

interface BucketItemProps {
  item: BucketListItem
  onToggleComplete: (id: string, isCompleted: boolean) => void
  onDelete: (id: string) => void
}

const categoryConfig = {
  travel: { icon: Map, color: 'bg-blue-100', text: 'text-blue-700', label: 'Seyahat' },
  food: { icon: Utensils, color: 'bg-orange-100', text: 'text-orange-700', label: 'Yemek' },
  experience: { icon: Film, color: 'bg-purple-100', text: 'text-purple-700', label: 'Deneyim' },
  home: { icon: Home, color: 'bg-green-100', text: 'text-green-700', label: 'Ev' },
  relationship: { icon: Heart, color: 'bg-rose-100', text: 'text-rose-700', label: 'İlişki' }
}

export const BucketItem = ({ item, onToggleComplete, onDelete }: BucketItemProps) => {
  const config = categoryConfig[item.category]
  const CategoryIcon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative group bg-white rounded-3xl p-6 shadow-md hover:shadow-2xl transition-all border-2 ${
        item.isCompleted 
          ? 'border-green-100 bg-gradient-to-br from-green-50 to-emerald-50' 
          : 'border-transparent hover:border-rose-100'
      }`}
    >
      <div className="flex items-start space-x-5">
        <button
          onClick={() => onToggleComplete(item._id, !item.isCompleted)}
          className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all flex-shrink-0 mt-1 shadow-sm ${
            item.isCompleted
              ? 'bg-green-200 border-green-300 text-green-500 scale-110'
              : 'bg-orange-200 border-orange-300 text-orange-500 scale-110'
          }`}
        >
          <Check size={24} className={item.isCompleted ? 'animate-in zoom-in duration-300' : ''} />
        </button>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className={`font-bold text-2xl mb-2 transition-all ${
                item.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'
              }`}>
                {item.title}
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center space-x-2 ${config.color} ${config.text} px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider`}>
                  <CategoryIcon size={14} />
                  <span>{config.label}</span>
                </span>
                
                {item.targetDate && (
                  <span className="text-sm text-gray-500 font-bold flex items-center gap-1.5">
                    <Calendar size={14} className="text-gray-400" />
                    Hedef: {format(new Date(item.targetDate), 'MMMM yyyy', { locale: tr })}
                  </span>
                )}

                {item.isCompleted && item.completedAt && (
                  <span className="text-sm text-green-600 font-black flex items-center gap-1.5 italic">
                    <Check size={14} />
                    {format(new Date(item.completedAt), 'd MMMM yyyy', { locale: tr })}'de tamamlandı
                  </span>
                )}
              </div>
            </div>
            
            <button 
              onClick={() => onDelete(item._id)}
              className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <Trash2 size={20} />
            </button>
          </div>

          {item.description && (
            <p className={`mb-6 text-lg leading-relaxed italic ${item.isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
              "{item.description}"
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm">
                <Image
                  src={getUserAvatar({
                    avatar: item.authorId.avatar,
                    gender: item.authorId.gender
                  })}
                  alt={item.authorId.firstName}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {item.authorId.firstName} tarafından eklendi
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
