'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  X,
  CloudUpload,
  FolderOpen,
  CheckCircle,
  Database,
  Loader2,
  Trash2,
  Info,
  Folder,
  MessageSquare,
  Layers,
  ChevronDown
} from 'lucide-react'
import { uploadService } from '@/services/api'
import { galleryService } from '@/services/galleryService'
import Image from 'next/image'
import { Album, PhotoMetadata, ApiError } from '@/lib/type'
import { useUserStore } from '@/store/userStore'
import { formatBytes } from '@/lib/utils'
import { showCustomToast } from '@/components/ui/CustomToast'
import CameraIcon from '../ui/CameraIcon'

interface ImageUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialAlbumId?: string
}

export default function ImageUploadModal({ isOpen, onClose, onSuccess, initialAlbumId }: ImageUploadModalProps) {
  const [loading, setLoading] = useState(false)
  const [albums, setAlbums] = useState<Album[]>([])
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>(initialAlbumId || '')
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false)
  const [newAlbumTitle, setNewAlbumTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user, updateStorageUsed } = useUserStore()

  // Storage Calculations
  const currentStorageUsed = Number(user?.coupleId?.storageUsed) || 0
  const storageLimit = Number(user?.coupleId?.storageLimit) || 0

  const currentNewPhotosSize = selectedFiles.reduce((acc, f) => acc + Number(f.size), 0)
  const projectedUsage = currentStorageUsed + currentNewPhotosSize
  const usagePercentage = storageLimit > 0 ? (Math.min(projectedUsage, storageLimit) / storageLimit) * 100 : 0
  const isOverLimit = projectedUsage > storageLimit

  const fetchAlbums = useCallback(async () => {
    if (!user?.coupleId?.subdomain) return
    try {
      const res = await galleryService.getAlbums(user.coupleId.subdomain!)
      setAlbums(res.data)
    } catch (err) {
      console.error('Albümler yüklenirken hata:', err)
    }
  }, [user?.coupleId?.subdomain])

  useEffect(() => {
    if (isOpen) {
      fetchAlbums()
    }
  }, [isOpen, fetchAlbums])

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      // Toplamda en fazla 10 fotoğraf olabilir
      const currentTotal = selectedFiles.length
      const remainingSlots = 10 - currentTotal

      if (remainingSlots <= 0) {
        showCustomToast.error('Limit', 'Tek seferde en fazla 10 fotoğraf yükleyebilirsiniz.')
        return
      }

      const newFilesToSelect = files.slice(0, remainingSlots)
      setSelectedFiles(prev => [...prev, ...newFilesToSelect])

      const newUrls = newFilesToSelect.map(file => URL.createObjectURL(file))
      setPreviewUrls(prev => [...prev, ...newUrls])
    }
  }

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles]
    newFiles.splice(index, 1)
    setSelectedFiles(newFiles)

    const newUrls = [...previewUrls]
    newUrls.splice(index, 1)
    setPreviewUrls(newUrls)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isOverLimit) {
      showCustomToast.error('Limit Aşıldı', 'Depolama limitini aşıyorsunuz! Lütfen bazı fotoğrafları çıkarın.', 5000)
      return
    }

    if (selectedFiles.length === 0) {
      showCustomToast.error('Hata', 'Lütfen en az bir fotoğraf seçin.')
      return
    }

    if (!selectedAlbumId && !isCreatingAlbum) {
      showCustomToast.error('Hata', 'Lütfen bir albüm seçin veya yeni bir albüm oluşturun.')
      return
    }

    setLoading(true)

    try {
      let albumId = selectedAlbumId

      // Create new album if requested
      if (isCreatingAlbum && newAlbumTitle.trim()) {
        const albumRes = await galleryService.createAlbum({ title: newAlbumTitle })
        albumId = albumRes.data._id
      }

      // Upload photos to S3
      const uploadRes = await uploadService.uploadMemories(selectedFiles) // Using existing upload logic
      const photoMetadatas = uploadRes.data.photos.map((p: PhotoMetadata) => ({
        url: p.key,
        width: p.width,
        height: p.height,
        size: p.size
      }))

      // Save to Gallery
      const res = await galleryService.uploadPhotos({
        albumId,
        photos: photoMetadatas,
        caption
      })

      // Update global storage state
      if (res.data.storageUsed !== undefined) {
        updateStorageUsed(res.data.storageUsed)
      }

      onSuccess()
      onClose()
      showCustomToast.success('Başarılı', 'Fotoğraflar başarıyla yüklendi! 📸')

      // Reset form
      setSelectedFiles([])
      setPreviewUrls([])
      setCaption('')
      setNewAlbumTitle('')
      setIsCreatingAlbum(false)
    } catch (err) {
      console.error('Fotoğraflar yüklenirken hata:', err)
      const apiError = err as ApiError
      const errorMessage = apiError.response?.data?.message || 'Fotoğraflar yüklenirken bir hata oluştu.'
      showCustomToast.error('Hata', errorMessage, 5000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300'>
      <div className='bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300'>
        {/* Header */}
        <div className='bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6 flex items-center justify-between shrink-0'>
          <div className='flex items-center gap-4'>
            <CameraIcon width={48} height={48} />
            <h2 className='text-3xl font-bold text-white'>Fotoğraf Yükle</h2>
          </div>
          <button
            onClick={onClose}
            className='w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all group'
          >
            <X size={24} className='text-white group-hover:rotate-90 transition-transform' />
          </button>
        </div>

        {/* Body */}
        <div className='p-8 overflow-y-auto custom-scrollbar flex-1'>
          <form id='upload-form' onSubmit={handleSubmit} className='space-y-8'>
            {/* Albüm Seçici */}
            <section className='space-y-4'>
              <label className='block text-sm font-bold text-gray-700 ml-1'>
                <Folder className='inline-block text-purple-500 mr-2 shrink-0' size={18} />
                Albüm Seçin
              </label>
              <div className='relative'>
                <select
                  value={isCreatingAlbum ? 'new' : selectedAlbumId}
                  onChange={e => {
                    if (e.target.value === 'new') {
                      setIsCreatingAlbum(true)
                      setSelectedAlbumId('')
                    } else {
                      setIsCreatingAlbum(false)
                      setSelectedAlbumId(e.target.value)
                    }
                  }}
                  className='w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl font-medium text-gray-800 appearance-none cursor-pointer hover:border-purple-300 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all'
                >
                  <option value=''>Albüm seçin...</option>
                  {albums.map(album => (
                    <option key={album._id} value={album._id}>
                      {album.title}
                    </option>
                  ))}
                  <option value='new' className='font-bold text-purple-600'>
                    + Yeni Albüm Oluştur
                  </option>
                </select>
                <div className='absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none'>
                  <ChevronDown className='text-gray-500' size={20} />
                </div>
              </div>

              {isCreatingAlbum && (
                <div className='animate-in slide-in-from-top-2 duration-300'>
                  <input
                    type='text'
                    placeholder='Yeni albüm adı girin...'
                    value={newAlbumTitle}
                    onChange={e => setNewAlbumTitle(e.target.value)}
                    required
                    className='w-full px-5 py-4 bg-white border-2 border-purple-300 rounded-2xl font-medium text-gray-800 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all'
                  />
                </div>
              )}
            </section>

            {/* Yükleme Alanı */}
            <section>
              <div
                onClick={() => fileInputRef.current?.click()}
                className='relative border-3 border-dashed border-purple-300 rounded-[2.5rem] bg-gradient-to-br from-purple-50 to-indigo-50 p-12 text-center hover:border-purple-500 hover:bg-purple-100/50 transition-all cursor-pointer group'
              >
                <input
                  type='file'
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept='image/*'
                  className='hidden'
                />

                <div className='mb-6'>
                  <div className='w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-xl'>
                    <CloudUpload className='text-white' size={40} />
                  </div>
                  <h3 className='text-2xl font-bold text-gray-900 mb-3'>Fotoğrafları sürükleyin veya seçin</h3>
                  <p className='text-gray-600 mb-6 flex items-center justify-center'>
                    <Info className='text-purple-500 mr-2 shrink-0' size={18} />
                    Maksimum <span className='font-bold text-purple-600 mx-1'>10 fotoğraf</span>,{' '}
                    <span className='font-bold text-purple-600 mx-1'>5MB/adet</span>
                  </p>
                  <div className='inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-10 py-4 rounded-full font-bold hover:shadow-xl hover:scale-105 transition-all'>
                    <FolderOpen size={20} />
                    <span>Dosya Seç</span>
                  </div>
                </div>

                <div className='flex items-center justify-center space-x-6 text-sm text-gray-500 font-medium'>
                  <div className='flex items-center space-x-2'>
                    <CheckCircle className='text-green-500' size={16} />
                    <span>JPG, PNG, WEBP</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <CheckCircle className='text-green-500' size={16} />
                    <span>Yüksek Çözünürlük</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Yüklenen Fotoğraflar Önizleme */}
            {previewUrls.length > 0 && (
              <section className='space-y-4 animate-in fade-in duration-500'>
                <div className='flex items-center justify-between'>
                  <h3 className='font-bold text-lg text-gray-900'>
                    <CameraIcon width={28} height={28} />
                    Yüklenen Fotoğraflar
                    <span className='text-sm font-normal text-gray-500 ml-2'>({previewUrls.length}/10)</span>
                  </h3>
                  <button
                    type='button'
                    onClick={() => {
                      setSelectedFiles([])
                      setPreviewUrls([])
                    }}
                    className='text-sm text-red-500 hover:text-red-600 font-bold transition-colors flex items-center space-x-1'
                  >
                    <Trash2 size={14} />
                    <span>Tümünü Temizle</span>
                  </button>
                </div>

                <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                  {previewUrls.map((url, index) => (
                    <div
                      key={index}
                      className='relative group aspect-square rounded-2xl overflow-hidden bg-gray-100 border-2 border-gray-100'
                    >
                      <Image src={url} alt='Preview' fill className='object-cover' />
                      <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                        <button
                          type='button'
                          onClick={() => removeFile(index)}
                          className='w-10 h-10 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg'
                        >
                          <X size={20} className='text-white' />
                        </button>
                      </div>
                      <div className='absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center space-x-1 shadow-sm'>
                        <CheckCircle size={10} />
                        <span>HAZIR</span>
                      </div>
                    </div>
                  ))}

                  {previewUrls.length < 10 && (
                    <button
                      type='button'
                      onClick={() => fileInputRef.current?.click()}
                      className='aspect-square rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50 hover:bg-purple-100 hover:border-purple-500 transition-all flex flex-col items-center justify-center group'
                    >
                      <div className='w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform'>
                        <X className='text-white rotate-45' size={20} />
                      </div>
                      <span className='text-[10px] font-bold text-purple-600'>Daha Ekle</span>
                    </button>
                  )}
                </div>
              </section>
            )}

            {/* Açıklama */}
            <section className='space-y-4'>
              <label className='block text-sm font-bold text-gray-700 ml-1'>
                <MessageSquare className='inline-block text-purple-500 mr-2 shrink-0' size={18} />
                Açıklama (Opsiyonel)
              </label>
              <textarea
                value={caption}
                onChange={e => setCaption(e.target.value)}
                rows={3}
                placeholder='Fotoğraflarınız için ortak bir açıklama yazın...'
                className='w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl font-medium text-gray-800 placeholder-gray-400 resize-none hover:border-purple-300 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all'
              ></textarea>

              <div className='flex items-center space-x-3 bg-purple-50 border-2 border-purple-100 rounded-2xl px-5 py-4'>
                <Layers className='text-purple-500 shrink-0' size={20} />
                <p className='text-sm font-medium text-gray-700'>
                  Açıklama, yüklediğiniz tüm fotoğraflara eklenecektir.
                </p>
              </div>
            </section>

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
                    Seçilen fotoğraflar:{' '}
                    <span className='font-bold text-blue-600 mx-1'>~{formatBytes(currentNewPhotosSize)}</span>
                  </p>
                  {isOverLimit && (
                    <p className='text-xs text-red-600 font-black animate-pulse mt-2'>
                      ⚠️ Depolama limitini aşıyorsunuz! Lütfen bazı fotoğrafları çıkarın.
                    </p>
                  )}
                </div>
              </div>
            </section>
          </form>
        </div>

        {/* Footer */}
        <div className='bg-gray-50 px-8 py-6 border-t-2 border-gray-100 flex items-center justify-between shrink-0'>
          <button
            onClick={onClose}
            className='text-gray-600 hover:text-gray-800 font-bold px-8 py-3 rounded-2xl hover:bg-gray-200 transition-all'
          >
            İptal
          </button>

          <button
            form='upload-form'
            type='submit'
            disabled={loading || isOverLimit || selectedFiles.length === 0 || (!selectedAlbumId && !isCreatingAlbum)}
            className='bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-12 py-4 rounded-2xl font-bold hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3'
          >
            {loading ? (
              <Loader2 className='animate-spin' size={24} />
            ) : (
              <>
                <CloudUpload size={24} />
                <span>Fotoğrafları Yükle</span>
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .border-3 {
          border-width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  )
}
