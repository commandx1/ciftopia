'use client'

import React, { useState, useRef } from 'react'
import {
  Heart,
  X,
  Images,
  CloudUpload,
  PenLine,
  Calendar as CalendarIcon,
  MapPin,
  Smile,
  AlignLeft,
  Lock,
  Star,
  Sparkles,
  Loader2
} from 'lucide-react'
import { memoriesService, uploadService } from '@/services/api'
import Image from 'next/image'
import { moodConfigs } from './MemoryMoodBadge'
import { Memory } from '@/lib/type'
import { useUserStore } from '@/store/userStore'

interface NewMemoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editingMemory?: Memory | null
}

export default function NewMemoryModal({ isOpen, onClose, onSuccess, editingMemory }: NewMemoryModalProps) {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [locationName, setLocationName] = useState('')
  const [mood, setMood] = useState('romantic')
  const [content, setContent] = useState('')
  const [isUserFavorite, setIsUserFavorite] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [existingPhotos, setExistingPhotos] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useUserStore()

  React.useEffect(() => {
    if (editingMemory && user) {
      setTitle(editingMemory.title)
      setDate(new Date(editingMemory.date).toISOString().split('T')[0])
      setLocationName(editingMemory.location?.name || '')
      setMood(editingMemory.mood)
      setContent(memoryObjContent(editingMemory.content))
      setIsUserFavorite(editingMemory.favorites?.includes(user._id) || false)
      setExistingPhotos(editingMemory.rawPhotos || [])
      setPreviewUrls(editingMemory.photos || [])
    } else {
      setTitle('')
      setDate(new Date().toISOString().split('T')[0])
      setLocationName('')
      setMood('romantic')
      setContent('')
      setIsUserFavorite(false)
      setSelectedFiles([])
      setPreviewUrls([])
      setExistingPhotos([])
    }
  }, [editingMemory, isOpen, user])

  const memoryObjContent = (content: string) => {
    if (typeof content === 'string') return content
    return ''
  }

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      // Toplamda en fazla 5 fotoğraf olabilir (mevcut + yeniler)
      const currentTotal = existingPhotos.length + selectedFiles.length
      const remainingSlots = 5 - currentTotal
      
      if (remainingSlots <= 0) return

      const newFilesToSelect = files.slice(0, remainingSlots)
      setSelectedFiles(prev => [...prev, ...newFilesToSelect])

      const newUrls = newFilesToSelect.map(file => URL.createObjectURL(file))
      setPreviewUrls(prev => [...prev, ...newUrls])
    }
  }

  const removeFile = (index: number) => {
    // Determine if it's an existing photo or a new file
    const totalExisting = existingPhotos.length
    
    if (index < totalExisting) {
      // It's an existing photo
      const newExisting = [...existingPhotos]
      newExisting.splice(index, 1)
      setExistingPhotos(newExisting)
      
      const newUrls = [...previewUrls]
      newUrls.splice(index, 1)
      setPreviewUrls(newUrls)
    } else {
      // It's a new file
      const fileIndex = index - totalExisting
      const newFiles = [...selectedFiles]
      newFiles.splice(fileIndex, 1)
      setSelectedFiles(newFiles)
      
      const newUrls = [...previewUrls]
      newUrls.splice(index, 1)
      setPreviewUrls(newUrls)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let photoUrls: string[] = [...existingPhotos]

      // Upload new photos
      if (selectedFiles.length > 0) {
        const uploadRes = await uploadService.uploadMemories(selectedFiles)
        photoUrls = [...photoUrls, ...uploadRes.data.urls]
      }

      if (editingMemory) {
        // Prepare new favorites array for update
        const otherFavorites = editingMemory.favorites?.filter(id => id !== user?._id) || []
        const newFavorites = isUserFavorite && user 
          ? [...otherFavorites, user._id] 
          : otherFavorites

        // Update memory
        await memoriesService.updateMemory(editingMemory._id, {
          title,
          content,
          date,
          locationName,
          mood,
          photos: photoUrls,
          favorites: newFavorites
        })
      } else {
        // Create memory
        await memoriesService.createMemory({
          title,
          content,
          date,
          locationName,
          mood,
          photos: photoUrls,
          favorites: isUserFavorite && user ? [user._id] : []
        })
      }

      onSuccess()
      onClose()
      // Reset form
      setTitle('')
      setContent('')
      setSelectedFiles([])
      setPreviewUrls([])
      setExistingPhotos([])
    } catch (err) {
      console.error('Anı kaydedilirken hata oluştu:', err)
      alert('Anı kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300'>
      <div
        className='bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-300'
        onClick={e => e.stopPropagation()}
      >
        {/* Background blobs */}
        <div className='absolute top-0 right-0 w-64 h-64 bg-rose-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2 pointer-events-none'></div>
        <div className='absolute bottom-0 left-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2 pointer-events-none'></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className='absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-all z-10'
        >
          <X size={24} className='text-gray-500' />
        </button>

        <div className='p-8 md:p-12'>
          <div className='text-center mb-10'>
            <div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#E91E63] to-[#FF6B6B] rounded-3xl shadow-lg mb-4'>
              <Heart className='text-white' size={40} fill='white' />
            </div>
            <h2 className=' text-4xl font-bold text-gray-900 mb-3'>
              {editingMemory ? 'Anıyı Düzenle' : 'Yeni Anı Ekle'}
            </h2>
            <p className='text-gray-600 text-lg'>
              {editingMemory ? 'Anılarınızı güncelleyin ve hikayenizi tazeleyin' : 'Özel anınızı ölümsüzleştirin ve sevdiklerinizle paylaşın'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-8 max-w-3xl mx-auto'>
            {/* Fotoğraf Yükleme */}
            <div className='space-y-4'>
              <label className='flex items-center space-x-3 text-gray-900 font-bold text-xl'>
                <Images className='text-[#E91E63]' size={24} />
                <span>Fotoğraflar</span>
                <span className='text-gray-400 text-sm font-normal'>(En fazla 5 adet)</span>
              </label>

              <div className='grid grid-cols-2 sm:grid-cols-5 gap-4'>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className='aspect-square bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 border-2 border-dashed border-rose-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-rose-400 hover:from-rose-100 hover:to-pink-100 transition-all group'
                >
                  <CloudUpload className='text-rose-400 group-hover:scale-110 transition-transform' size={40} />
                  <span className='text-xs text-gray-600 mt-2 font-semibold'>Fotoğraf Ekle</span>
                  <input
                    type='file'
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept='image/*'
                    multiple
                    className='hidden'
                  />
                </div>

                {previewUrls.map((url, index) => (
                  <div
                    key={index}
                    className='aspect-square relative rounded-2xl overflow-hidden border-2 border-gray-100 group bg-gray-50'
                  >
                    <Image
                      src={url}
                      alt={`Preview ${index}`}
                      className='w-full h-full object-cover transition-opacity duration-300'
                      width={100}
                      height={100}
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.classList.remove('opacity-0');
                      }}
                    />
                    <button
                      type='button'
                      onClick={() => removeFile(index)}
                      className='absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10'
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Başlık ve Tarih */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-3'>
                <label className='flex items-center space-x-3 text-gray-900 font-bold text-lg'>
                  <PenLine className='text-[#E91E63]' size={20} />
                  <span>Başlık</span>
                </label>
                <input
                  type='text'
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder='Örn: İlk Buluşmamız...'
                  className='w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-rose-100 transition-all font-medium'
                />
              </div>

              <div className='space-y-3'>
                <label className='flex items-center space-x-3 text-gray-900 font-bold text-lg'>
                  <CalendarIcon className='text-[#E91E63]' size={20} />
                  <span>Tarih</span>
                </label>
                <input
                  type='date'
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className='w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-rose-100 transition-all'
                />
              </div>
            </div>

            {/* Konum */}
            <div className='space-y-3'>
              <label className='flex items-center space-x-3 text-gray-900 font-bold text-lg'>
                <MapPin className='text-[#E91E63]' size={20} />
                <span>Konum</span>
                <span className='text-gray-400 text-sm font-normal'>(Opsiyonel)</span>
              </label>
              <input
                type='text'
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
                placeholder='Örn: Maçka Parkı, İstanbul'
                className='w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-rose-100 transition-all'
              />
            </div>

            {/* Ruh Hali */}
            <div className='space-y-4'>
              <label className='flex items-center space-x-3 text-gray-900 font-bold text-lg'>
                <Smile className='text-[#E91E63]' size={20} />
                <span>Ruh Hali</span>
              </label>
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
                {Object.entries(moodConfigs).map(([key, config]) => {
                  const Icon = config.icon
                  const isSelected = mood === key
                  return (
                    <label key={key} className='cursor-pointer group'>
                      <input
                        type='radio'
                        name='mood'
                        value={key}
                        checked={isSelected}
                        onChange={e => setMood(e.target.value)}
                        className='peer hidden'
                      />
                      <div
                        className={`p-4 rounded-xl text-center transition-all border-2 flex flex-col items-center justify-center space-y-2 h-full
                          ${isSelected 
                            ? `${config.cardBg} border-current ${config.iconColor} shadow-md` 
                            : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200'
                          }`}
                        style={{ borderColor: isSelected ? undefined : '' }}
                      >
                        <Icon
                          className={`transition-all ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}
                          size={28}
                          fill={isSelected && key === 'romantic' ? 'currentColor' : 'none'}
                        />
                        <p className={`text-xs font-bold transition-all ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
                          {config.label}
                        </p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* İçerik */}
            <div className='space-y-3'>
              <label className='flex items-center space-x-3 text-gray-900 font-bold text-lg'>
                <AlignLeft className='text-[#E91E63]' size={20} />
                <span>Anınızı Anlatın</span>
              </label>
              <textarea
                rows={5}
                required
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder='O gün ne oldu? Neler hissettiniz? Detaylarıyla anlatın...'
                className='w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-rose-100 transition-all resize-none leading-relaxed'
              ></textarea>
            </div>

            {/* Özel Seçenekler */}
            <div className='bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 space-y-4 border-2 border-purple-100'>
              <h3 className='font-bold text-gray-900 flex items-center space-x-3'>
                <div className='p-1.5 bg-purple-100 rounded-lg'>
                  <Lock className='text-purple-500' size={18} />
                </div>
                <span>Özel Seçenekler</span>
              </h3>

              <div className='grid grid-cols-1 gap-4'>
                <label className='flex items-center justify-between cursor-pointer bg-white rounded-xl p-4 hover:shadow-md transition-all'>
                  <div className='flex items-center space-x-3'>
                    <Star className='text-rose-500' size={18} />
                    <span className='font-semibold text-gray-900'>Favori</span>
                  </div>
                  <div className='relative'>
                    <input
                      type='checkbox'
                      checked={isUserFavorite}
                      onChange={e => setIsUserFavorite(e.target.checked)}
                      className='peer sr-only'
                    />
                    <div className='w-12 h-6 bg-gray-200 rounded-full peer-checked:bg-rose-500 transition-all'></div>
                    <div className='absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6'></div>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Butonları */}
            <div className='flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4'>
              <button
                type='button'
                onClick={onClose}
                className='w-full sm:flex-1 px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-2xl transition-all border-2 border-gray-200 hover:border-gray-300'
              >
                İptal
              </button>
              <button
                type='submit'
                disabled={loading}
                className='w-full sm:flex-1 px-8 py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 hover:from-rose-600 hover:via-pink-600 hover:to-purple-600 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-2xl flex items-center justify-center space-x-3 group disabled:opacity-70 disabled:cursor-not-allowed'
              >
                {loading ? (
                  <Loader2 className='animate-spin' size={24} />
                ) : (
                  <>
                    <Heart className='group-hover:scale-110 transition-transform' size={24} fill='currentColor' />
                    <span>{editingMemory ? 'Anıyı Güncelle' : 'Anıyı Kaydet'}</span>
                    <Sparkles className='text-yellow-300 animate-pulse' size={20} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
