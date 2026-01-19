'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Type, FileText, Camera, Check, Loader2, Database, Info, User, Heart, Users, Trash2, Video } from 'lucide-react'
import { TimeCapsule, PhotoMetadata } from '@/lib/type'
import { uploadService } from '@/services/api'
import { useUserStore } from '@/store/userStore'
import { showCustomToast } from '@/components/ui/CustomToast'
import { formatBytes } from '@/lib/utils'
import Image from 'next/image'
import XIcon from '@/components/ui/icons/XIcon'
import { VideoPlayer } from '@/components/ui/VideoPlayer'

interface CreateCapsuleModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (data: Partial<TimeCapsule>) => Promise<void>
}

export const CreateCapsuleModal = ({ isOpen, onClose, onAdd }: CreateCapsuleModalProps) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<TimeCapsule>>({
    title: '',
    content: '',
    unlockDate: new Date().toISOString().split('T')[0],
    receiver: 'both',
    photos: [],
    video: undefined
  })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
  const [previews, setPreviews] = useState<string[]>([])
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  
  const { user } = useUserStore()
  
  // Storage Calculations
  const currentStorageUsed = Number(user?.coupleId?.storageUsed) || 0
  const storageLimit = Number(user?.coupleId?.storageLimit) || 0
  
  const currentNewPhotosSize = selectedFiles.reduce((acc, f) => acc + f.size, 0)
  const currentNewVideoSize = selectedVideo?.size || 0
  const projectedUsage = currentStorageUsed + currentNewPhotosSize + currentNewVideoSize
    
  const usagePercentage = storageLimit > 0 ? (Math.min(projectedUsage, storageLimit) / storageLimit) * 100 : 0
  const isOverLimit = projectedUsage > storageLimit

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        content: '',
        unlockDate: new Date().toISOString().split('T')[0],
        receiver: 'both',
        photos: [],
        video: undefined
      })
      setSelectedFiles([])
      setSelectedVideo(null)
      setPreviews([])
      setVideoPreview(null)
    }
  }, [isOpen])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + selectedFiles.length > 5) {
      showCustomToast.error('Hata', 'En fazla 5 fotoğraf ekleyebilirsiniz.')
      return
    }

    const totalNewSize = files.reduce((acc, f) => acc + f.size, 0)
    if (projectedUsage + totalNewSize > storageLimit) {
      showCustomToast.error('Hata', 'Depolama alanı yetersiz.')
      return
    }

    setSelectedFiles(prev => [...prev, ...files])
    
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      showCustomToast.error('Hata', 'Lütfen geçerli bir video dosyası seçin.')
      return
    }

    if (projectedUsage - currentNewVideoSize + file.size > storageLimit) {
      showCustomToast.error('Hata', 'Depolama alanı yetersiz.')
      return
    }

    setSelectedVideo(file)
    const url = URL.createObjectURL(file)
    setVideoPreview(url)
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeVideo = () => {
    setSelectedVideo(null)
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
    }
    setVideoPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.content || !formData.unlockDate) {
      showCustomToast.error('Hata', 'Lütfen zorunlu alanları doldurun.')
      return
    }

    setLoading(true)
    try {
      let photoData: PhotoMetadata[] = []
      let videoData: PhotoMetadata | undefined = undefined

      if (selectedFiles.length > 0) {
        const uploadRes = await uploadService.uploadMemories(selectedFiles)
        photoData = (uploadRes.data.photos as PhotoMetadata[]).map((p) => ({
          key: p.key,
          url: p.key || '',
          width: p.width,
          height: p.height,
          size: p.size || 0
        }))
      }

      if (selectedVideo) {
        const uploadRes = await uploadService.uploadVideo(selectedVideo)
        const v = uploadRes.data.video as PhotoMetadata
        videoData = {
          key: v.key,
          url: v.key || '',
          size: v.size || 0
        }
      }

      await onAdd({
        ...formData,
        photos: photoData,
        video: videoData
      })
      
      onClose()
    } catch (error: unknown) {
      console.error(error)
      showCustomToast.error('Hata', 'İşlem başarısız oldu.')
    } finally {
      setLoading(false)
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
            className='bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col'
          >
            {/* Header */}
            <div className='px-8 py-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between shrink-0'>
              <div>
                <h2 className='text-2xl font-bold'>Yeni Zaman Kapsülü Oluştur</h2>
                <p className='text-amber-100 text-xs font-medium'>Geleceğe anlamlı bir miras bırakın</p>
              </div>
              <button 
                onClick={onClose}
                className='w-10 h-10 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-all'
              >
                <XIcon width={24} height={24}/>
              </button>
            </div>

            {/* Content */}
            <div className='flex-1 overflow-y-auto p-8'>
              <form onSubmit={handleSubmit} className='space-y-8'>
                {/* Receiver Selection */}
                <div>
                  <label className='block text-sm font-black text-gray-700 mb-4 uppercase tracking-widest ml-1'>
                    Kime? 💌
                  </label>
                  <div className='grid grid-cols-3 gap-4'>
                    {[
                      { id: 'me', label: 'Kendime', icon: User, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' },
                      { id: 'partner', label: 'Partnerime', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },
                      { id: 'both', label: 'İkimize', icon: Users, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' }
                    ].map((rec) => (
                      <button
                        key={rec.id}
                        type='button'
                        onClick={() => setFormData({ ...formData, receiver: rec.id as 'me' | 'partner' | 'both' })}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                          formData.receiver === rec.id 
                            ? `${rec.border} ${rec.bg} shadow-md scale-[1.02]` 
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <rec.icon className={`${formData.receiver === rec.id ? rec.color : 'text-gray-400'} transition-colors`} size={28} />
                        <span className={`text-xs font-black uppercase ${formData.receiver === rec.id ? 'text-gray-900' : 'text-gray-500'}`}>{rec.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title & Date */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-3'>
                    <label className='block text-sm font-black text-gray-700 uppercase tracking-widest ml-1'>Başlık ✨</label>
                    <div className='relative'>
                      <Type size={18} className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
                      <input
                        required
                        type='text'
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder='Kapsül başlığı...'
                        className='w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-amber-500 focus:bg-white outline-none transition-all font-medium text-gray-900 shadow-inner'
                      />
                    </div>
                  </div>
                  <div className='space-y-3'>
                    <label className='block text-sm font-black text-gray-700 uppercase tracking-widest ml-1'>Ne zaman açılsın? ⏰</label>
                    <div className='relative'>
                      <Calendar size={18} className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
                      <input
                        required
                        type='date'
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.unlockDate}
                        onChange={(e) => setFormData({ ...formData, unlockDate: e.target.value })}
                        className='w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-amber-500 focus:bg-white outline-none transition-all font-medium text-gray-900 shadow-inner'
                      />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className='space-y-3'>
                  <label className='block text-sm font-black text-gray-700 uppercase tracking-widest ml-1'>Mektubunuz 💭</label>
                  <div className='relative'>
                    <FileText size={18} className='absolute left-4 top-4 text-gray-400' />
                    <textarea
                      required
                      rows={6}
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder='Geleceğe ne söylemek istersiniz? En içten duygularınızı buraya dökün...'
                      className='w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-amber-500 focus:bg-white outline-none transition-all font-medium text-gray-900 resize-none shadow-inner leading-relaxed'
                      style={{ fontFamily: 'var(--font-indie-flower), cursive', fontSize: '1.25rem' }}
                    />
                  </div>
                  <div className='flex justify-between px-1'>
                    <span className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>El Yazısı Stili Aktif</span>
                    <span className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>{formData.content?.length || 0} / 2000</span>
                  </div>
                </div>

                {/* Photo Upload */}
                <div>
                  <label className='block text-sm font-black text-gray-700 mb-4 uppercase tracking-widest ml-1'>Fotoğraf Ekle (Opsiyonel) 📸</label>
                  <div className='grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4'>
                    {previews.map((url, index) => (
                      <div key={index} className='relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 group shadow-sm'>
                        <Image src={url} alt='Preview' fill className='object-cover' />
                        <button
                          type='button'
                          onClick={() => removeFile(index)}
                          className='absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {previews.length < 5 && (
                      <div 
                        onClick={() => document.getElementById('capsule-photo-upload')?.click()}
                        className='aspect-square border-2 border-dashed border-gray-200 hover:border-amber-400 hover:bg-amber-50/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all group'
                      >
                        <input 
                          type='file' 
                          id='capsule-photo-upload' 
                          className='hidden' 
                          accept='image/*'
                          multiple
                          onChange={handleFileChange}
                        />
                        <Camera size={32} className='mb-2 text-gray-400 group-hover:text-amber-500 transition-colors' />
                        <p className='text-[10px] font-black text-gray-500 uppercase tracking-widest'>Ekle</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Video Upload */}
                <div>
                  <label className='block text-sm font-black text-gray-700 mb-4 uppercase tracking-widest ml-1'>Video Ekle (Opsiyonel) 🎥</label>
                  {videoPreview ? (
                    <div className='relative aspect-video rounded-3xl overflow-hidden border-2 border-gray-100 group shadow-lg bg-black'>
                      <VideoPlayer 
                        src={videoPreview} 
                        className='w-full h-full'
                      />
                      <button
                        type='button'
                        onClick={removeVideo}
                        className='absolute top-4 right-4 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 z-50'
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => document.getElementById('capsule-video-upload')?.click()}
                      className='aspect-video border-2 border-dashed border-gray-200 hover:border-amber-400 hover:bg-amber-50/50 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all group'
                    >
                      <input 
                        type='file' 
                        id='capsule-video-upload' 
                        className='hidden' 
                        accept='video/*'
                        onChange={handleVideoChange}
                      />
                      <div className='w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-amber-100 group-hover:scale-110 transition-all'>
                        <Video size={32} className='text-gray-400 group-hover:text-amber-500' />
                      </div>
                      <p className='text-xs font-black text-gray-500 uppercase tracking-widest'>Video Seç</p>
                      <p className='text-[10px] text-gray-400 mt-2'>MP4, MOV veya WebM (Maks. 50MB)</p>
                    </div>
                  )}
                </div>

                {/* Storage Status */}
                <section className='bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-100 rounded-3xl p-6'>
                  <div className='flex items-start space-x-4'>
                    <div className='w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200'>
                      <Database className='text-white' size={24} />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between mb-3'>
                        <h4 className='font-bold text-gray-900'>Depolama Durumu</h4>
                        <span className={`text-sm font-bold ${isOverLimit ? 'text-red-600' : 'text-indigo-600'}`}>
                          {formatBytes(projectedUsage)} / {formatBytes(storageLimit)}
                        </span>
                      </div>
                      <div className='w-full bg-indigo-200 rounded-full h-3 overflow-hidden p-0.5 shadow-inner'>
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isOverLimit ? 'bg-gradient-to-r from-red-500 to-rose-400' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                          style={{ width: `${usagePercentage}%` }}
                        ></div>
                      </div>
                      <p className='text-xs text-gray-600 mt-3 flex items-center'>
                        <Info className='text-indigo-500 mr-1 shrink-0' size={14} />
                        {selectedFiles.length > 0 || selectedVideo ? (
                          <>Seçilen dosyalar: <span className='font-bold text-indigo-600 mx-1'>~{formatBytes(currentNewPhotosSize + currentNewVideoSize)}</span></>
                        ) : (
                          <>En fazla 5 fotoğraf ve 1 video ekleyebilirsiniz.</>
                        )}
                      </p>
                    </div>
                  </div>
                </section>
              </form>
            </div>

            {/* Footer */}
            <div className='px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex space-x-4 shrink-0'>
              <button
                type='button'
                onClick={onClose}
                className='flex-1 py-4 bg-white border-2 border-gray-100 text-gray-700 font-black rounded-2xl hover:bg-gray-50 transition-all uppercase tracking-widest text-xs active:scale-95'
              >
                Vazgeç
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || isOverLimit}
                className='flex-[2] py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black rounded-2xl hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:scale-100 uppercase tracking-widest text-xs flex items-center justify-center space-x-2'
              >
                {loading ? (
                  <Loader2 className='animate-spin' size={20} />
                ) : (
                  <>
                    <Check size={20} />
                    <span>Mühürle & Kaydet</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
