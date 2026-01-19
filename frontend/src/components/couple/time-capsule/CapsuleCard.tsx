import React from 'react'
import { motion } from 'framer-motion'
import { Lock, LockOpen, Hourglass, Calendar, Image as ImageIcon, BookOpen, Video } from 'lucide-react'
import { TimeCapsule } from '@/lib/type'
import { format, differenceInCalendarDays } from 'date-fns'
import { tr } from 'date-fns/locale'
import Image from 'next/image'
import { getUserAvatar } from '@/lib/utils'

interface CapsuleCardProps {
  capsule: TimeCapsule
  onOpen: (id: string) => void
}

export const CapsuleCard = React.forwardRef<HTMLDivElement, CapsuleCardProps>(
  ({ capsule, onOpen }, ref) => {
    const now = new Date()
    const unlockDate = new Date(capsule.unlockDate)
    const isLocked = unlockDate > now && !capsule.isOpened
    const daysLeft = differenceInCalendarDays(unlockDate, now)

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className={`bg-white rounded-[2rem] p-6 shadow-md hover:shadow-2xl transition-all border-2 cursor-pointer group ${
          isLocked ? 'border-amber-100' : 'border-green-100'
        }`}
        onClick={() => !isLocked && onOpen(capsule._id)}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
              isLocked 
                ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' 
                : 'bg-gradient-to-br from-green-400 to-emerald-500 text-white'
            }`}>
              {isLocked ? <Lock size={20} /> : <LockOpen size={20} />}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
              isLocked ? 'text-amber-600 bg-amber-50' : 'text-green-600 bg-green-50'
            }`}>
              {isLocked ? 'KİLİTLİ' : 'AÇILDI'}
            </span>
          </div>
        </div>

        <h3 className="font-bold text-2xl text-gray-900 mb-4 line-clamp-2">
          {capsule.title}
        </h3>

        {isLocked ? (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 mb-6 border border-amber-100/50">
            <div className="flex items-center space-x-3 mb-4">
              <Hourglass className="text-amber-600 animate-pulse" size={24} />
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Açılma Tarihi</p>
                <p className="font-black text-gray-900">{format(unlockDate, 'd MMMM yyyy', { locale: tr })}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center shadow-inner">
              <p className="text-3xl font-black text-amber-600">{daysLeft > 0 ? daysLeft : 'Bugün'}</p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                {daysLeft > 0 ? 'gün kaldı' : 'açılıyor 🔓'}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 mb-6 border border-green-100/50">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Açıldı</p>
            <p className="font-black text-gray-900 text-lg mb-4">{format(unlockDate, 'd MMMM yyyy', { locale: tr })}</p>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-green-100">
              <p className="text-gray-700 text-sm italic line-clamp-2">
                &quot;{capsule.content.substring(0, 100)}...&quot;
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md">
              <Image
                src={getUserAvatar({
                  avatar: capsule.authorId.avatar,
                  gender: capsule.authorId.gender
                })}
                alt={capsule.authorId.firstName}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest leading-none mb-1">
                {capsule.authorId.firstName}
              </p>
              <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                <Calendar size={10} />
                {format(new Date(capsule.createdAt), 'd MMM yyyy', { locale: tr })}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {capsule.photos && capsule.photos.length > 0 && (
              <div className="flex items-center gap-1.5 bg-rose-50 text-rose-600 px-3 py-2 rounded-2xl border border-rose-100 shadow-sm transition-all group-hover:bg-rose-500 group-hover:text-white group-hover:scale-110 group-hover:-rotate-3">
                <ImageIcon size={14} strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-tighter">{capsule.photos.length}</span>
              </div>
            )}
            {capsule.video && (
              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-2 rounded-2xl border border-amber-100 shadow-sm transition-all group-hover:bg-amber-500 group-hover:text-white group-hover:scale-110 group-hover:rotate-3">
                <Video size={14} strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-tighter text-[8px]">VİDEO</span>
              </div>
            )}
          </div>
        </div>

        {!isLocked && (
          <button 
            className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:shadow-xl transition-all flex items-center justify-center gap-2"
            onClick={(e) => {
              e.stopPropagation()
              onOpen(capsule._id)
            }}
          >
            <BookOpen size={18} />
            Mektubu Oku
          </button>
        )}
      </motion.div>
    )
  }
)

CapsuleCard.displayName = 'CapsuleCard'
