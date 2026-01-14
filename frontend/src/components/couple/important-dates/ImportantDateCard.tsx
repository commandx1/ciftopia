'use client'

import React, { useMemo } from 'react'
import Image from 'next/image'
import { Clock, Edit2, Trash2, RefreshCw, Star } from 'lucide-react'
import { ImportantDate, User, PhotoMetadata } from '@/lib/type'
import { format, isToday } from 'date-fns'
import { tr } from 'date-fns/locale'
import { getUserAvatar } from '@/lib/utils'

interface ImportantDateCardProps {
  date: ImportantDate
  currentUser: User | null
  onEdit: (date: ImportantDate) => void
  onDelete: (id: string) => void
}

const typeConfigs: Record<string, { icon: string; bg: string; color: string; label: string }> = {
  dating: { icon: '💕', bg: 'bg-rose-100', color: 'text-rose-600', label: 'Tanışma' },
  first_kiss: { icon: '💋', bg: 'bg-pink-100', color: 'text-pink-600', label: 'İlk Öpücük' },
  relationship: { icon: '💑', bg: 'bg-indigo-100', color: 'text-indigo-600', label: 'İlişki' },
  engagement: { icon: '💍', bg: 'bg-rose-100', color: 'text-rose-600', label: 'Nişan' },
  marriage: { icon: '💒', bg: 'bg-purple-100', color: 'text-purple-600', label: 'Evlilik' },
  birthday: { icon: '🎂', bg: 'bg-amber-100', color: 'text-amber-600', label: 'Doğum Günü' },
  travel: { icon: '✈️', bg: 'bg-blue-100', color: 'text-blue-600', label: 'Seyahat' },
  moving: { icon: '🏠', bg: 'bg-green-100', color: 'text-green-600', label: 'Taşınma' },
  special: { icon: '📅', bg: 'bg-gray-100', color: 'text-gray-600', label: 'Özel' },
}

export default function ImportantDateCard({ date, currentUser, onEdit, onDelete }: ImportantDateCardProps) {
  const config = typeConfigs[date.type] || typeConfigs.special
  const isAuthor = date.authorId?._id === currentUser?._id
  
  const dateObj = useMemo(() => new Date(date.date), [date.date])
  
  // Check if it's today (handling recurring dates)
  const isTodayDate = useMemo(() => {
    if (isToday(dateObj)) return true
    if (date.isRecurring) {
      const now = new Date()
      return dateObj.getDate() === now.getDate() && dateObj.getMonth() === now.getMonth()
    }
    return false
  }, [dateObj, date.isRecurring])

  const isPast = !isTodayDate && dateObj < new Date()
  
  return (
    <div className={`relative pl-20 pb-8 group ${isPast ? 'opacity-85' : ''}`}>
      {/* Timeline Line/Point */}
      <div className={`absolute left-5 top-6 w-6 h-6 rounded-full border-4 border-white shadow-lg group-hover:scale-125 transition-transform z-10 ${
        isTodayDate ? 'bg-gradient-to-r from-rose-500 to-pink-500 animate-pulse scale-110' : 
        isPast ? 'bg-gray-400' : 'bg-rose-500'
      }`}></div>
      
      <div className={`bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition-all border ${
        isTodayDate ? 'border-rose-200 ring-2 ring-rose-100 shadow-rose-100' : 'border-gray-100'
      }`}>
        {isTodayDate && (
          <div className='absolute -top-3 right-6 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1 animate-bounce'>
            <Star size={10} fill='currentColor' />
            Bugün
          </div>
        )}
        <div className='flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4'>
          <div className='flex items-center space-x-4'>
            <div className={`w-16 h-16 ${config.bg} rounded-2xl flex items-center justify-center text-3xl shrink-0 ${isTodayDate ? 'animate-bounce' : ''}`}>
              {config.icon}
            </div>
            <div>
              <h3 className={`font-bold text-xl leading-tight ${isTodayDate ? 'text-rose-600' : 'text-gray-900'}`}>{date.title}</h3>
              <p className='text-gray-500 font-medium'>
                {format(dateObj, 'd MMMM yyyy', { locale: tr })}
              </p>
            </div>
          </div>
          
          <div className='flex flex-wrap items-center gap-2'>
            {isTodayDate && (
              <span className='bg-rose-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 uppercase tracking-wider shadow-sm'>
                <Star size={12} fill='currentColor' />
                <span>Kutlama Günü</span>
              </span>
            )}
            {date.isRecurring && (
              <span className='bg-purple-100 text-purple-600 px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 uppercase tracking-wider'>
                <RefreshCw size={12} />
                <span>Her Yıl</span>
              </span>
            )}
            <span className={`${isTodayDate ? 'bg-rose-100 text-rose-600' : isPast ? 'bg-gray-100 text-gray-600' : 'bg-rose-100 text-rose-600'} px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 uppercase tracking-wider`}>
              <Clock size={12} />
              <span>{isTodayDate ? 'Şimdi' : isPast ? 'Geçmiş' : 'Gelecek'}</span>
            </span>
          </div>
        </div>

        {date.description && (
          <p className='text-gray-700 mb-4 text-lg leading-relaxed'>{date.description}</p>
        )}

        {date.photo?.url && (
          <div className='relative h-64 rounded-2xl overflow-hidden mb-4 shadow-inner'>
            <Image 
              src={date.photo.url} 
              alt={date.title} 
              fill 
              className='object-cover hover:scale-105 transition-transform duration-500' 
            />
          </div>
        )}

        <div className='flex items-center justify-between pt-4 border-t border-gray-50'>
          <div className='flex items-center space-x-2'>
            <div className='relative w-8 h-8 rounded-full overflow-hidden border-2 border-gray-100'>
              <Image 
                src={getUserAvatar({ avatar: date.authorId?.avatar as PhotoMetadata, gender: date.authorId?.gender })} 
                alt={date.authorId?.firstName || 'User'} 
                fill 
                className='object-cover' 
              />
            </div>
            <span className='text-sm text-gray-500 font-medium'>
              {date.authorId?.firstName} tarafından eklendi
            </span>
          </div>
          
          <div className='flex items-center space-x-2'>
            {isAuthor && (
              <>
                <button 
                  onClick={() => onEdit(date)}
                  className='w-10 h-10 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm'
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => onDelete(date._id)}
                  className='w-10 h-10 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-all shadow-sm'
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
