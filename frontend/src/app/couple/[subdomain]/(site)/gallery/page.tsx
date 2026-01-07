'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Camera, Plus, Folder, Grip, Images, ArrowUpRight, Loader2 } from 'lucide-react'
import { galleryService } from '@/services/galleryService'
import { Album, GalleryPhoto } from '@/lib/type'
import { showCustomToast } from '@/components/ui/CustomToast'
import ImageUploadModal from '@/components/couple/ImageUploadModal'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'

export default function GalleryPage() {
  const { subdomain } = useParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [viewMode, setViewToggle] = useState<'album' | 'grid'>('album')
  const [albums, setAlbums] = useState<Album[]>([])
  const [allPhotos, setAllPhotos] = useState<GalleryPhoto[]>([])
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [albumsRes, photosRes] = await Promise.all([
        galleryService.getAlbums(subdomain as string),
        galleryService.getAllPhotos(subdomain as string)
      ])
      setAlbums(albumsRes.data)
      setAllPhotos(photosRes.data)
    } catch (err) {
      console.error('Galeri verileri yüklenirken hata:', err)
      showCustomToast.error('Hata', 'Galeri verileri yüklenirken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }, [subdomain])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleUploadSuccess = () => {
    fetchData()
  }

  return (
    <div className='min-h-screen pt-24 pb-12 bg-gray-50'>
      <main className='max-w-7xl mx-auto px-6 py-8'>
        {/* Gallery Header */}
        <section className='mb-12'>
          <div className='flex flex-col md:flex-row items-center justify-between gap-6'>
            <div className='flex items-center space-x-6'>
              <div className='w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-lg transform rotate-3'>
                <Camera size={32} className='text-white' />
              </div>
              <div>
                <h1 className='text-5xl font-bold text-gray-900 mb-2'>Galerimiz</h1>
                <p className='text-gray-600 text-lg'>Birlikte biriktirdiğimiz en güzel anlar</p>
              </div>
            </div>

            <div className='flex items-center space-x-4'>
              <div className='flex items-center bg-white rounded-full shadow-md border border-gray-100 p-1.5'>
                <button
                  onClick={() => setViewToggle('album')}
                  className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center space-x-2 ${
                    viewMode === 'album'
                      ? 'bg-gradient-to-r from-[#E91E63] to-[#FF6B6B] text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Folder size={18} />
                  <span>Albümler</span>
                </button>
                <button
                  onClick={() => setViewToggle('grid')}
                  className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center space-x-2 ${
                    viewMode === 'grid'
                      ? 'bg-gradient-to-r from-[#E91E63] to-[#FF6B6B] text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Grip size={18} />
                  <span>Izgara</span>
                </button>
              </div>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className='bg-gradient-to-r from-[#E91E63] to-[#FF6B6B] text-white px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-rose-200 transition-all hover:scale-105 flex items-center space-x-3'
              >
                <Plus size={20} />
                <span>Fotoğraf Yükle</span>
              </button>
            </div>
          </div>
        </section>

        {loading ? (
          <div className='flex flex-col items-center justify-center py-40'>
            <Loader2 size={64} className='text-[#E91E63] animate-spin mb-4' />
            <p className='text-gray-500 font-bold text-xl'>Galeriniz hazırlanıyor...</p>
          </div>
        ) : viewMode === 'album' ? (
          /* Album View */
          <section className='animate-in fade-in duration-700'>
            {albums.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                {albums.map(album => (
                  <div
                    key={album._id}
                    onClick={() => router.push(`/gallery/${album._id}`)}
                    className='bg-white rounded-[2.5rem] shadow-xl overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer group border border-gray-100'
                  >
                    <div className='h-72 overflow-hidden relative'>
                      {album.coverPhoto ? (
                        <Image
                          src={album.coverPhoto.url}
                          alt={album.title}
                          fill
                          className='object-cover group-hover:scale-110 transition-transform duration-700'
                        />
                      ) : (
                        <div className='w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center'>
                          <Images size={48} className='text-gray-300' />
                        </div>
                      )}
                      <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent'></div>
                      <div className='absolute bottom-6 left-8 right-6'>
                        <h3 className='text-3xl font-bold text-white mb-2'>{album.title}</h3>
                        <div className='flex items-center justify-between text-white/90 text-sm font-bold'>
                          <span className='flex items-center space-x-2'>
                            <Images size={16} />
                            <span>{album.photoCount} fotoğraf</span>
                          </span>
                          <span>{formatDistanceToNow(new Date(album.date), { addSuffix: true, locale: tr })}</span>{' '}
                        </div>
                      </div>
                    </div>
                    <div className='p-8'>
                      <p className='text-gray-600 text-base leading-relaxed mb-6 line-clamp-2'>
                        {album.description || 'Bu albüm için henüz bir açıklama girilmemiş.'}
                      </p>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-3'>
                          <div className='flex -space-x-3'>
                            {[album.coupleId?.partner1, album.coupleId?.partner2].filter(Boolean).map((partner, i) => (
                              <div
                                key={i}
                                className='relative w-8 h-8 rounded-full border-2 border-white overflow-hidden'
                              >
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
                                  className='object-cover rounded-full'
                                />
                              </div>
                            ))}
                          </div>
                          <span className='text-sm font-bold text-gray-700'>
                            {album.coupleId?.partner1?.firstName} & {album.coupleId?.partner2?.firstName}
                          </span>
                        </div>
                        <div className='w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center text-[#E91E63] group-hover:bg-[#E91E63] group-hover:text-white transition-all'>
                          <ArrowUpRight size={20} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='bg-white rounded-[3rem] shadow-xl p-24 text-center border-2 border-dashed border-gray-200'>
                <div className='w-32 h-32 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 transform -rotate-6'>
                  <Folder size={64} className='text-[#E91E63]' />
                </div>
                <h3 className='text-4xl font-bold text-gray-900 mb-4'>Henüz Albüm Yok</h3>
                <p className='text-gray-500 text-xl mb-10 max-w-md mx-auto'>
                  Anılarınızı düzenlemek için ilk albümünüzü oluşturun!
                </p>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className='bg-gradient-to-r from-[#E91E63] to-[#FF6B6B] text-white px-12 py-5 rounded-full font-bold text-xl shadow-2xl hover:scale-105 transition-all inline-flex items-center space-x-4'
                >
                  <Plus size={24} />
                  <span>İlk Albümü Oluştur</span>
                </button>
              </div>
            )}
          </section>
        ) : (
          /* Grid View (All Photos) */
          <section className='animate-in fade-in duration-700'>
            {allPhotos.length > 0 ? (
              <div className='columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6'>
                {allPhotos.map(photo => (
                  <div key={photo._id} className='break-inside-avoid group relative cursor-pointer'>
                    <div className='bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border border-gray-100'>
                      <Image
                        src={photo.photo.url}
                        alt='Photo'
                        width={photo.photo.width || 400}
                        height={photo.photo.height || 400}
                        className='w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700'
                      />
                      <div className='p-6'>
                        <p className='text-gray-800 font-bold text-lg mb-3'>{photo.caption || '❤️'}</p>
                        <div className='flex items-center justify-between text-xs font-bold text-gray-500'>
                          <span>{new Date(photo.createdAt).toLocaleDateString('tr-TR')}</span>
                          <span className='bg-gray-100 px-3 py-1 rounded-full'>{photo.authorId.firstName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='bg-white rounded-[3rem] shadow-xl p-24 text-center border-2 border-dashed border-gray-200'>
                <div className='w-32 h-32 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 transform rotate-6'>
                  <Camera size={64} className='text-indigo-500' />
                </div>
                <h3 className='text-4xl font-bold text-gray-900 mb-4'>Fotoğraf Bulunamadı</h3>
                <p className='text-gray-500 text-xl mb-10 max-w-md mx-auto'>Henüz hiçbir fotoğraf yüklememişsiniz.</p>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className='bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-12 py-5 rounded-full font-bold text-xl shadow-2xl hover:scale-105 transition-all inline-flex items-center space-x-4'
                >
                  <Plus size={24} />
                  <span>Fotoğraf Yükle</span>
                </button>
              </div>
            )}
          </section>
        )}
      </main>

      <ImageUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  )
}
