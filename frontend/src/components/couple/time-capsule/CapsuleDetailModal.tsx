'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Image as ImageIcon, X, Loader2, Video } from 'lucide-react'
import { TimeCapsule } from '@/lib/type'
import { format, formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import Image from 'next/image'
import { getUserAvatar } from '@/lib/utils'
import { timeCapsuleService } from '@/services/api'
import { showCustomToast } from '@/components/ui/CustomToast'
import { VideoPlayer } from '@/components/ui/VideoPlayer'

interface CapsuleDetailModalProps {
  capsule: TimeCapsule | null
  isOpen: boolean
  onClose: () => void
  onUpdate?: (updatedCapsule: TimeCapsule) => void
}

export const CapsuleDetailModal = ({ capsule, isOpen, onClose, onUpdate }: CapsuleDetailModalProps) => {
  const [reflection, setReflection] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!capsule) return null

  const handleSubmitReflection = async () => {
    if (!reflection.trim()) return

    try {
      setIsSubmitting(true)
      const res = await timeCapsuleService.addReflection(capsule._id, { content: reflection.trim() })
      setReflection('')
      showCustomToast.success('Başarılı', 'Düşüncen kaydedildi! 💕')
      if (onUpdate) {
        onUpdate(res.data)
      }
    } catch {
      showCustomToast.error('Hata', 'Düşünce kaydedilirken bir hata oluştu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className='bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col'
          >
            {/* Header */}
            <div className='bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-white text-center relative shrink-0'>
              <button 
                onClick={onClose}
                className='absolute top-6 right-6 w-10 h-10 bg-black/20 text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-all z-10'
              >
                <X className='text-white' size={24} />
              </button>
              
              <div className='w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg'>
                <ImageIcon className='text-white' size={40} />
              </div>
              <h2 className='text-3xl font-bold mb-2'>{capsule.title}</h2>
              <p className='text-green-100 font-medium'>Açıldı: {format(new Date(capsule.unlockDate), 'd MMMM yyyy', { locale: tr })}</p>
            </div>

            {/* Content */}
            <div className='flex-1 overflow-y-auto p-8 md:p-12'>
              <div className='flex items-center justify-between mb-10 pb-8 border-b border-gray-100'>
                <div className='flex items-center space-x-4'>
                  <div className='relative w-14 h-14 rounded-full overflow-hidden border-2 border-rose-200 shadow-sm'>
                    <Image
                      src={getUserAvatar({
                        avatar: capsule.authorId.avatar,
                        gender: capsule.authorId.gender
                      })}
                      alt={capsule.authorId.firstName}
                      fill
                      className='object-cover'
                    />
                  </div>
                  <div>
                    <p className='font-bold text-gray-900 text-lg'>{capsule.authorId.firstName} {capsule.authorId.lastName}</p>
                    <p className='text-xs font-black text-gray-400 uppercase tracking-widest'>Gönderen</p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='text-xs font-black text-gray-400 uppercase tracking-widest mb-1'>Yazıldı</p>
                  <p className='font-bold text-gray-900'>{format(new Date(capsule.createdAt), 'd MMMM yyyy', { locale: tr })}</p>
                </div>
              </div>

              <div className='prose max-w-none mb-12'>
                <p 
                  className='text-2xl leading-relaxed text-gray-800 italic'
                  style={{ fontFamily: 'var(--font-indie-flower), cursive' }}
                >
                  {capsule.content}
                </p>
              </div>

              {capsule.photos && capsule.photos.length > 0 && (
                <div className='mb-12'>
                  <h3 className='text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2'>
                    <ImageIcon size={18} className='text-rose-500' />
                    Eklenen Fotoğraflar
                  </h3>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                    {capsule.photos.map((photo, index) => (
                      <div key={index} className='relative h-64 rounded-3xl overflow-hidden shadow-lg border-4 border-white transform transition-transform hover:scale-[1.02]'>
                        <Image src={photo.url} alt={`Photo ${index + 1}`} fill className='object-cover' />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {capsule.video && (
                <div className='mb-12'>
                  <h3 className='text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2'>
                    <Video size={18} className='text-amber-500' />
                    Eklenen Video
                  </h3>
                  <VideoPlayer 
                    src={capsule.video.url} 
                    className='aspect-video'
                  />
                </div>
              )}

              {/* Reflections List */}
              {capsule.reflections && capsule.reflections.length > 0 && (
                <div className='mb-12 space-y-6'>
                  <h3 className='text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2'>
                    <span>💬</span> Düşünceler & Yorumlar
                  </h3>
                  <div className='space-y-4'>
                    {capsule.reflections.map((refl, idx) => (
                      <div key={idx} className='flex items-start gap-4'>
                        <div className='relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-100 shrink-0 shadow-sm'>
                          <Image
                            src={getUserAvatar({
                              avatar: refl.authorId.avatar,
                              gender: refl.authorId.gender
                            })}
                            alt={refl.authorId.firstName}
                            fill
                            className='object-cover'
                          />
                        </div>
                        <div className='bg-gray-50 rounded-2xl p-4 flex-1 shadow-inner'>
                          <div className='flex items-center justify-between mb-1'>
                            <p className='font-bold text-sm text-gray-900'>{refl.authorId.firstName}</p>
                            <p className='text-[10px] text-gray-400 font-medium'>
                              {formatDistanceToNow(new Date(refl.createdAt), { addSuffix: true, locale: tr })}
                            </p>
                          </div>
                          <p className='text-gray-700 text-sm leading-relaxed'>{refl.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className='bg-gradient-to-br from-purple-50 to-pink-50 rounded-[2rem] p-8 border-2 border-purple-100 shadow-inner'>
                <h3 className='font-black text-gray-900 mb-4 flex items-center gap-2'>
                  <span>💭</span> O günden bugüne...
                </h3>
                <textarea 
                  className='w-full bg-white rounded-2xl p-6 border-2 border-purple-100 focus:border-purple-400 focus:outline-none resize-none transition-all shadow-sm' 
                  rows={4} 
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder='Bu mektubu okuduktan sonra neler hissettiniz? Bugün neler farklı?'
                />
                <button 
                  onClick={handleSubmitReflection}
                  disabled={!reflection.trim() || isSubmitting}
                  className='mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-sm hover:shadow-xl transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isSubmitting ? <Loader2 className='animate-spin' size={18} /> : <Heart size={18} />}
                  Düşüncelerimi Kaydet
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
