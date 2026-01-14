'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Type, FileText, Camera, Check, Loader2, RefreshCw, Database, Info } from 'lucide-react'
import { ImportantDate } from '@/lib/type'
import { uploadService } from '@/services/api'
import { useUserStore } from '@/store/userStore'
import { showCustomToast } from '@/components/ui/CustomToast'
import { formatBytes } from '@/lib/utils'
import Image from 'next/image'
import XIcon from '@/components/ui/icons/XIcon'

interface AddImportantDateModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (data: Partial<ImportantDate>) => Promise<void>
  editData?: ImportantDate | null
}

const dateTypes = [
  { id: 'dating', emoji: '💕', label: 'Tanışma' },
  { id: 'first_kiss', emoji: '💋', label: 'İlk Öpücük' },
  { id: 'relationship', emoji: '💑', label: 'İlişki' },
  { id: 'engagement', emoji: '💍', label: 'Nişan' },
  { id: 'marriage', emoji: '💒', label: 'Evlilik' },
  { id: 'birthday', emoji: '🎂', label: 'Doğum Günü' },
  { id: 'travel', emoji: '✈️', label: 'Seyahat' },
  { id: 'moving', emoji: '🏠', label: 'Taşınma' },
  { id: 'special', emoji: '📅', label: 'Özel' },
]

export default function AddImportantDateModal({ isOpen, onClose, onAdd, editData }: AddImportantDateModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<ImportantDate>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    type: 'special',
    description: '',
    isRecurring: false,
    photo: undefined
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  const { user, updateStorageUsed } = useUserStore()
  
  // Storage Calculations
  const currentStorageUsed = Number(user?.coupleId?.storageUsed) || 0
  const storageLimit = Number(user?.coupleId?.storageLimit) || 0
  
  const oldPhotoSize = (editData?.photo?.size || 0)
  const currentNewPhotosSize = (selectedFile?.size || 0)
  
  // If we have a new file, we subtract the old one (if it exists) and add the new one
  // If we just removed the file, currentNewPhotosSize is 0, oldPhotoSize is subtracted
  const projectedUsage = selectedFile 
    ? (currentStorageUsed - oldPhotoSize + currentNewPhotosSize)
    : (formData.photo ? currentStorageUsed : (currentStorageUsed - oldPhotoSize))
    
  const usagePercentage = storageLimit > 0 ? (Math.min(projectedUsage, storageLimit) / storageLimit) * 100 : 0
  const isOverLimit = projectedUsage > storageLimit

  useEffect(() => {
    if (editData) {
      setFormData({
        title: editData.title,
        date: editData.date.split('T')[0],
        type: editData.type,
        description: editData.description || '',
        isRecurring: editData.isRecurring,
        photo: editData.photo
      })
      setPreviewUrl(editData.photo?.url || null)
    } else {
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        type: 'special',
        description: '',
        isRecurring: false,
        photo: undefined
      })
      setPreviewUrl(null)
      setSelectedFile(null)
    }
  }, [editData, isOpen])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showCustomToast.error('Hata', 'Dosya boyutu 5MB\'dan küçük olmalıdır.')
        return
      }
      
      const newProjectedUsage = currentStorageUsed - oldPhotoSize + file.size
      if (newProjectedUsage > storageLimit) {
        showCustomToast.error('Hata', 'Depolama alanı yetersiz.')
        return
      }

      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.date || !formData.type) {
      showCustomToast.error('Hata', 'Lütfen zorunlu alanları doldurun.')
      return
    }

    setLoading(true)
    try {
      let photoData = formData.photo

      if (selectedFile) {
        const uploadRes = await uploadService.uploadMemories([selectedFile])
        // important-dates uses photo object { url, width, height, size }
        const p = uploadRes.data.photos[0]
        photoData = {
          url: p.key,
          width: p.width,
          height: p.height,
          size: p.size
        }
      }

      await onAdd({
        ...formData,
        photo: photoData
      })
      
      // We don't have the updated storageUsed from the onAdd response here easily 
      // but importantDatesPage handles the state update for dates.
      // However, we should refresh user store if we want the progress bar to be accurate next time.
      // For now, let's assume onAdd might trigger a refresh or we can manually update if needed.
      // In Gallery, the response returns the new storageUsed.
      
      onClose()
    } catch (error) {
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
            <div className='px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0'>
              <h2 className='text-2xl font-bold text-gray-900'>
                {editData ? 'Tarihi Güncelle' : 'Yeni Tarih Ekle'}
              </h2>
              <button 
                onClick={onClose}
                className='w-10 h-10 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center hover:bg-gray-100 hover:text-gray-600 transition-all'
              >
                <XIcon width={24} height={24}/>
              </button>
            </div>

            {/* Content */}
            <div className='flex-1 overflow-y-auto p-8'>
              <form onSubmit={handleSubmit} className='space-y-6'>
                {/* Type Selection */}
                <div>
                  <label className='block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider'>
                    Tarih Türü
                  </label>
                  <div className='grid grid-cols-3 sm:grid-cols-5 gap-3'>
                    {dateTypes.map((type) => (
                      <button
                        key={type.id}
                        type='button'
                        onClick={() => setFormData({ ...formData, type: type.id as any })}
                        className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                          formData.type === type.id 
                            ? 'border-rose-500 bg-rose-50 shadow-md' 
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span className='text-2xl mb-1'>{type.emoji}</span>
                        <span className='text-[10px] font-bold text-gray-600 uppercase'>{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title & Date */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider'>
                      Başlık
                    </label>
                    <div className='relative'>
                      <Type size={18} className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
                      <input
                        type='text'
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder='Örn: İlk Buluşmamız'
                        className='w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-rose-500 focus:bg-white rounded-2xl outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400'
                      />
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider'>
                      Tarih
                    </label>
                    <div className='relative'>
                      <Calendar size={18} className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
                      <input
                        type='date'
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className='w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-rose-500 focus:bg-white rounded-2xl outline-none transition-all font-medium text-gray-900'
                      />
                    </div>
                  </div>
                </div>

                {/* Recurring */}
                <label className='flex items-center space-x-3 cursor-pointer group'>
                  <div 
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                      formData.isRecurring ? 'bg-rose-500 border-rose-500' : 'border-gray-300 group-hover:border-rose-400'
                    }`}
                    onClick={() => setFormData({ ...formData, isRecurring: !formData.isRecurring })}
                  >
                    {formData.isRecurring && <Check size={14} className='text-white' />}
                  </div>
                  <div className='flex items-center space-x-2' onClick={() => setFormData({ ...formData, isRecurring: !formData.isRecurring })}>
                    <RefreshCw size={16} className={formData.isRecurring ? 'text-rose-500' : 'text-gray-400'} />
                    <span className='text-sm font-bold text-gray-700 uppercase tracking-wide'>Her Yıl Tekrarla</span>
                  </div>
                </label>

                {/* Photo Upload */}
                <div>
                  <label className='block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider'>
                    Fotoğraf (Opsiyonel)
                  </label>
                  {previewUrl ? (
                    <div className='relative h-48 rounded-2xl overflow-hidden group border-2 border-gray-100'>
                      <Image src={previewUrl} alt='Preview' fill className='object-cover' />
                      <button
                        type='button'
                        onClick={() => {
                          setSelectedFile(null)
                          setPreviewUrl(null)
                          setFormData({ ...formData, photo: undefined })
                        }}
                        className='absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100'
                      >
                        <XIcon width={20} height={20}/>
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => document.getElementById('photo-upload')?.click()}
                      className='border-2 border-dashed border-gray-200 hover:border-rose-400 hover:bg-rose-50 rounded-2xl p-8 text-center cursor-pointer transition-all group'
                    >
                      <input 
                        type='file' 
                        id='photo-upload' 
                        className='hidden' 
                        accept='image/*'
                        onChange={handleFileChange}
                      />
                      <Camera size={40} className='mx-auto mb-2 text-gray-400 group-hover:text-rose-500 transition-colors' />
                      <p className='text-sm font-bold text-gray-600 uppercase tracking-wider'>Fotoğraf Yükle</p>
                      <p className='text-xs text-gray-400 mt-1'>Max. 5MB • PNG, JPG</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className='block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider'>
                    Not (Opsiyonel)
                  </label>
                  <div className='relative'>
                    <FileText size={18} className='absolute left-4 top-4 text-gray-400' />
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder='Bu tarihle ilgili özel bir şeyler yazın...'
                      className='w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-rose-500 focus:bg-white rounded-2xl outline-none transition-all font-medium text-gray-900 resize-none placeholder:text-gray-400'
                    />
                  </div>
                </div>

                {/* Depolama Durumu */}
                <section className='bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-3xl p-6'>
                  <div className='flex items-start space-x-4'>
                    <div className='w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg'>
                      <Database className='text-white' size={24} />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between mb-3'>
                        <h4 className='font-bold text-gray-900'>Depolama Durumu</h4>
                        <span className={`text-sm font-bold ${isOverLimit ? 'text-red-600' : 'text-blue-600'}`}>
                          {formatBytes(projectedUsage)} / {formatBytes(storageLimit)}
                        </span>
                      </div>
                      <div className='w-full bg-blue-200 rounded-full h-3 overflow-hidden p-0.5 shadow-inner'>
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isOverLimit ? 'bg-gradient-to-r from-red-500 to-rose-400' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}
                          style={{ width: `${usagePercentage}%` }}
                        ></div>
                      </div>
                      <p className='text-xs text-gray-600 mt-3 flex items-center'>
                        <Info className='text-blue-500 mr-1 shrink-0' size={14} />
                        {selectedFile ? (
                          <>Seçilen fotoğraf: <span className='font-bold text-blue-600 mx-1'>~{formatBytes(selectedFile.size)}</span></>
                        ) : (
                          <>Maksimum 5MB fotoğraf ekleyebilirsiniz.</>
                        )}
                      </p>
                      {isOverLimit && (
                        <p className='text-xs text-red-600 font-black animate-pulse mt-2'>
                          ⚠️ Depolama limitini aşıyorsunuz!
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              </form>
            </div>

            {/* Footer */}
            <div className='px-8 py-6 border-t border-gray-50 bg-gray-50/50 flex space-x-4 shrink-0'>
              <button
                type='button'
                onClick={onClose}
                className='flex-1 py-4 bg-white border-2 border-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all uppercase tracking-widest text-xs'
              >
                İptal
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || isOverLimit}
                className='flex-[2] py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:scale-100 uppercase tracking-widest text-xs flex items-center justify-center space-x-2'
              >
                {loading ? (
                  <Loader2 className='animate-spin' size={20} />
                ) : (
                  <>
                    <Check size={20} />
                    <span>{editData ? 'Güncelle' : 'Kaydet'}</span>
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
