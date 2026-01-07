'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Images,
  MapPin,
  Share2,
  Pen,
  Plus,
  Filter,
  Heart,
  Loader2,
  Trash2,
  Download,
  X
} from 'lucide-react'
import { galleryService } from '@/services/galleryService'
import { Album, GalleryPhoto } from '@/lib/type'
import { useUserStore } from '@/store/userStore'
import { showCustomToast } from '@/components/ui/CustomToast'
import Image from 'next/image'
import ImageUploadModal from '@/components/couple/ImageUploadModal'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Keyboard } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import CustomModal from '@/components/ui/CustomModal'

export default function AlbumDetailPage() {
  const { subdomain, id } = useParams()
  const router = useRouter()
  const { user } = useUserStore()

  const [loading, setLoading] = useState(true)
  const [album, setAlbum] = useState<Album | null>(null)
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null)
  const [activePhoto, setActivePhoto] = useState<GalleryPhoto | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Sync activePhoto with selectedPhoto when opening
  useEffect(() => {
    if (selectedPhoto) {
      setActivePhoto(selectedPhoto)
    }
  }, [selectedPhoto])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [albumRes, photosRes] = await Promise.all([
        galleryService.getAlbum(id as string),
        galleryService.getAlbumPhotos(id as string)
      ])
      setAlbum(albumRes.data)
      setPhotos(photosRes.data)
    } catch (err) {
      console.error('Albüm detayları yüklenirken hata:', err)
      showCustomToast.error('Hata', 'Albüm detayları yüklenirken bir hata oluştu.')
      router.push('/gallery')
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDeletePhoto = async (photoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setDeleteConfirmId(photoId)
  }

  const confirmDelete = async () => {
    if (!deleteConfirmId) return

    setIsDeleting(true)
    try {
      await galleryService.deletePhoto(deleteConfirmId)
      showCustomToast.success('Başarılı', 'Fotoğraf silindi.')
      setPhotos(prev => prev.filter(p => p._id !== deleteConfirmId))
      if (selectedPhoto?._id === deleteConfirmId) setSelectedPhoto(null)
      setDeleteConfirmId(null)
    } catch (err) {
      console.error('Fotoğraf silinirken hata:', err)
      showCustomToast.error('Hata', 'Fotoğraf silinirken bir hata oluştu.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading && !album) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <Loader2 size={64} className='text-[#E91E63] animate-spin' />
      </div>
    )
  }

  if (!album) return null

  return (
    <div className='min-h-screen pt-24 pb-12 bg-gray-50'>
      <main className='max-w-7xl mx-auto px-6 py-8'>
        {/* Back Button */}
        <button
          onClick={() => router.push(`/gallery`)}
          className='flex items-center space-x-2 text-gray-600 hover:text-[#E91E63] transition-all mb-8 group font-bold'
        >
          <ArrowLeft size={20} className='group-hover:-translate-x-1 transition-transform' />
          <span>Galeriye Dön</span>
        </button>

        {/* Album Header */}
        <section className='mb-12'>
          <div className='bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50 rounded-[3rem] p-12 relative overflow-hidden border border-white shadow-xl'>
            {/* Animated backgrounds could be added here if needed */}
            <div className='relative z-10'>
              <div className='flex flex-col lg:flex-row items-start justify-between gap-10'>
                <div className='flex-1'>
                  <div className='flex items-center space-x-6 mb-8'>
                    <div className='w-24 h-24 bg-gradient-to-br from-[#E91E63] via-[#FF6B6B] to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl transform hover:rotate-6 transition-transform'>
                      <Heart size={48} className='text-white' fill='white' />
                    </div>
                    <div>
                      <h1 className='text-6xl font-bold text-gray-900 mb-4'>{album.title}</h1>
                      <div className='flex flex-wrap items-center gap-6 text-gray-600 font-bold'>
                        <span className='flex items-center space-x-2'>
                          <Calendar size={20} className='text-rose-500' />
                          <span>
                            {new Date(album.date).toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </span>
                        <span className='w-1.5 h-1.5 bg-gray-300 rounded-full shrink-0'></span>
                        <span className='flex items-center space-x-2'>
                          <Clock size={20} className='text-purple-500' />
                          <span>{formatDistanceToNow(new Date(album.createdAt), { addSuffix: true, locale: tr })}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className='text-gray-700 text-xl leading-relaxed max-w-4xl mb-10 italic font-medium'>
                    &quot;{album.description || 'Bu albüm için henüz bir açıklama girilmemiş.'}&quot;
                  </p>

                  <div className='flex flex-wrap items-center gap-4'>
                    <div className='flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-sm border border-white'>
                      <Images size={20} className='text-rose-500' />
                      <span className='font-bold text-gray-800'>{photos.length} fotoğraf</span>
                    </div>
                    {/* Placeholder for location if added to schema later */}
                    <div className='flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-sm border border-white'>
                      <div className='flex -space-x-3'>
                        {[album.coupleId?.partner1, album.coupleId?.partner2].filter(Boolean).map((partner, i) => (
                          <div key={i} className='w-8 h-8 rounded-full border-2 border-white overflow-hidden relative'>
                            <Image
                              src={
                                partner?.avatar && typeof partner.avatar !== 'string'
                                  ? partner.avatar.url
                                  : partner?.gender === 'female'
                                    ? '/woman-pp.png'
                                    : '/man-pp.png'
                              }
                              alt=''
                              fill
                              className='object-cover'
                            />
                          </div>
                        ))}
                      </div>
                      <span className='font-bold text-gray-700 ml-2'>
                        {album.coupleId?.partner1?.firstName} & {album.coupleId?.partner2?.firstName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='flex items-center space-x-4 shrink-0'>
                  <button className='bg-white/90 hover:bg-white text-gray-700 hover:text-[#E91E63] px-8 py-4 rounded-2xl font-bold transition-all flex items-center space-x-2 shadow-lg border border-white/50'>
                    <Share2 size={20} />
                    <span>Paylaş</span>
                  </button>
                  {album.authorId._id === user?._id && (
                    <button className='bg-[#E91E63] hover:bg-[#D81B60] text-white px-8 py-4 rounded-2xl font-bold transition-all flex items-center space-x-2 shadow-lg hover:shadow-rose-200'>
                      <Pen size={20} />
                      <span>Düzenle</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Photos Grid */}
        <section className='space-y-8'>
          <div className='flex items-center justify-between'>
            <h2 className='text-4xl font-bold text-gray-900'>Fotoğraflar</h2>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className='bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl hover:scale-105 transition-all flex items-center space-x-2'
            >
              <Plus size={20} />
              <span>Fotoğraf Ekle</span>
            </button>
          </div>

          <div className='columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6'>
            {photos.map(photo => (
              <div
                key={photo._id}
                onClick={() => setSelectedPhoto(photo)}
                className='break-inside-avoid group relative cursor-pointer bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100'
              >
                <div className='relative w-full'>
                  <Image
                    src={photo.photo.url}
                    alt={photo.caption || ''}
                    width={photo.photo.width || 300}
                    height={photo.photo.height || 300}
                    className='w-full h-auto object-cover group-hover:scale-110 transition-transform duration-1000'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500'>
                    <div className='absolute bottom-0 left-0 right-0 p-6 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500'>
                      <p className='text-white font-bold mb-2 text-lg'>{photo.caption || 'Günün hatırası ❤️'}</p>
                      <div className='flex items-center justify-between text-white/80 text-sm font-medium'>
                        <span className='flex items-center space-x-2'>
                          <Clock size={14} />
                          <span>{formatDistanceToNow(new Date(photo.createdAt), { addSuffix: true, locale: tr })}</span>
                        </span>
                        {photo.authorId._id === user?._id && (
                          <button
                            onClick={e => handleDeletePhoto(photo._id, e)}
                            className='p-2 bg-red-500/20 hover:bg-red-500 text-white rounded-xl transition-all'
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className='absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-0 group-hover:scale-100 shadow-xl'>
                    <Heart size={20} className='text-rose-500' fill='currentColor' />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Lightbox / Photo Detail Modal */}
      {selectedPhoto && (
        <div
          className='fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300'
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className='absolute top-6 right-6 md:top-10 md:right-10 w-12 h-12 md:w-14 md:h-14 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-[210]'
            onClick={() => setSelectedPhoto(null)}
          >
            <X size={32} />
          </button>

          <div className='max-w-6xl w-full h-full flex flex-col justify-center' onClick={e => e.stopPropagation()}>
            <div className='bg-white/5 backdrop-blur-md rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh]'>
              <div className='relative flex-1 bg-black/20 overflow-hidden'>
                <Swiper
                  modules={[Navigation, Pagination, Keyboard]}
                  pagination={{ type: 'fraction' }}
                  keyboard={{ enabled: true }}
                  initialSlide={photos.findIndex(p => p._id === selectedPhoto._id)}
                  onSlideChange={swiper => setActivePhoto(photos[swiper.activeIndex])}
                  className='h-full w-full lightbox-swiper'
                  style={
                    {
                      '--swiper-navigation-color': '#fff',
                      '--swiper-pagination-color': '#fff'
                    } as React.CSSProperties
                  }
                >
                  {photos.map(p => (
                    <SwiperSlide key={p._id} className='flex items-center justify-center p-4 md:p-8'>
                      <div className='relative w-full h-full flex items-center justify-center'>
                        <Image
                          src={p.photo.url}
                          alt={p.caption || ''}
                          width={p.photo.width || 1200}
                          height={p.photo.height || 1200}
                          className='max-w-full max-h-full object-contain'
                          priority
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {activePhoto && (
                <div className='p-6 md:p-10 bg-white/10 backdrop-blur-xl border-t border-white/10'>
                  <div className='flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-10'>
                    <div className='flex-1 min-w-0'>
                      <h3 className='text-2xl md:text-4xl font-bold text-white mb-2 md:mb-4 truncate'>
                        {activePhoto.caption || 'Hatıralar ölümsüzdür... ❤️'}
                      </h3>
                      <div className='flex flex-wrap items-center gap-4 md:gap-6 text-white/70 text-sm md:text-base font-bold'>
                        <span className='flex items-center gap-2'>
                          <Calendar size={18} className='text-rose-400' />
                          {formatDistanceToNow(new Date(activePhoto.createdAt), { addSuffix: true, locale: tr })}
                        </span>
                        <span className='hidden sm:inline w-1.5 h-1.5 bg-white/20 rounded-full shrink-0'></span>
                        <span className='flex items-center gap-2'>
                          <Pen size={18} className='text-purple-400' />
                          {activePhoto.authorId.firstName} tarafından yüklendi
                        </span>
                      </div>
                    </div>
                    {activePhoto.authorId._id === user?._id && (
                      <button
                        onClick={e => handleDeletePhoto(activePhoto._id, e as any)}
                        className='flex-1 md:flex-none bg-red-500/20 hover:bg-red-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold transition-all flex items-center justify-center space-x-3 border border-white/10'
                      >
                        <Trash2 size={20} className='md:w-6 md:h-6' />
                        <span className='text-sm md:text-base'>Sil</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .lightbox-swiper .swiper-button-next,
        .lightbox-swiper .swiper-button-prev {
          background: rgba(255, 255, 255, 0.1);
          width: 50px;
          height: 50px;
          border-radius: 100%;
          backdrop-filter: blur(4px);
          transition: all 0.3s;
        }
        .lightbox-swiper .swiper-button-next:after,
        .lightbox-swiper .swiper-button-prev:after {
          font-size: 20px;
          font-weight: bold;
        }
        .lightbox-swiper .swiper-button-next:hover,
        .lightbox-swiper .swiper-button-prev:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
        }
        .lightbox-swiper .swiper-pagination-fraction {
          color: white;
          font-weight: bold;
          bottom: 20px !important;
          background: rgba(0, 0, 0, 0.3);
          width: fit-content;
          left: 50% !important;
          transform: translateX(-50%);
          padding: 4px 16px;
          border-radius: 20px;
          font-size: 14px;
        }
      `}</style>

      <ImageUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={fetchData}
        initialAlbumId={id as string}
      />

      <CustomModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        type='danger'
        title='Fotoğrafı Sil?'
        description='Bu fotoğrafı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'
        onConfirm={confirmDelete}
        loading={isDeleting}
      />
    </div>
  )
}
