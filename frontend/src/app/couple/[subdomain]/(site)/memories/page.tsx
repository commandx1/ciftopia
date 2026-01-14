'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import {
  Heart,
  Clock,
  Plus,
  Filter,
  ChevronDown,
  Calendar,
  MapPin,
  Pen,
  Trash2,
  Download,
  ArrowDown,
  Sparkles,
  HeartOff,
  Loader2,
  Star
} from 'lucide-react'
import { memoriesService } from '@/services/api'
import NewMemoryModal from '@/components/couple/NewMemoryModal'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import Image from 'next/image'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { Memory, PhotoMetadata } from '@/lib/type'
import { MemoryMoodBadge, MemoryMoodIcon, moodConfigs } from '@/components/couple/MemoryMoodBadge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDebounce } from '@/hooks/useDebounce'
import { useUserStore } from '@/store/userStore'
import { showCustomToast } from '@/components/ui/CustomToast'

// Skeleton loading bileşeni
const MemorySkeleton = ({ side }: { side: 'left' | 'right' }) => (
  <div
    className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center pt-8 animate-pulse ${side === 'right' ? 'md:flex-row-reverse' : ''}`}
  >
    <div className={`${side === 'right' ? 'md:order-2 md:pl-12' : 'md:pr-12'}`}>
      <div className='bg-white rounded-3xl shadow-sm p-6 border border-gray-100'>
        <div className='h-64 bg-gray-100 rounded-2xl mb-6'></div>
        <div className='space-y-4'>
          <div className='h-8 bg-gray-100 rounded-xl w-3/4'></div>
          <div className='flex space-x-4'>
            <div className='h-4 bg-gray-100 rounded-lg w-24'></div>
            <div className='h-4 bg-gray-100 rounded-lg w-32'></div>
          </div>
          <div className='space-y-2'>
            <div className='h-4 bg-gray-100 rounded-lg w-full'></div>
            <div className='h-4 bg-gray-100 rounded-lg w-5/6'></div>
          </div>
          <div className='pt-6 border-t border-gray-50 flex justify-between items-center'>
            <div className='h-9 bg-rose-50/50 rounded-full w-28'></div>
            <div className='flex space-x-2'>
              <div className='w-8 h-8 bg-gray-50 rounded-lg'></div>
              <div className='w-8 h-8 bg-gray-50 rounded-lg'></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className='hidden md:block'></div>
  </div>
)

// Fotoğraf galerisi için yardımcı bileşen
const ImageGallery = ({ photos, title }: { photos: PhotoMetadata[]; title: string }) => {
  if (!photos || photos.length === 0) return null

  return (
    <div className='h-64 rounded-2xl overflow-hidden mb-4 relative group/gallery bg-gray-100'>
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        className='h-full w-full'
        style={
          {
            '--swiper-navigation-color': 'var(--coral-warm)',
            '--swiper-pagination-color': '#fff',
            '--swiper-navigation-size': '20px'
          } as React.CSSProperties
        }
      >
        {photos.map((photo, index) => {
          const src = typeof photo === 'string' ? photo : photo.url
          if (!src) return null

          return (
            <SwiperSlide key={index}>
              <div className='relative w-full h-full'>
                <Image src={src} alt={`${title} - ${index + 1}`} fill className='object-cover select-none' />
              </div>
            </SwiperSlide>
          )
        })}
      </Swiper>
    </div>
  )
}

export default function MemoriesPage() {
  const { subdomain } = useParams()
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [memories, setMemories] = useState<Memory[]>([])
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, favorites: 0 })
  const [hasMore, setHasMore] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [expandedMemories, setExpandedMemories] = useState<Record<string, boolean>>({})

  // Filtre ve Sıralama State'leri
  const [sortBy, setSortBy] = useState('newest')
  const [filterMood, setFilterMood] = useState('all')
  const [onlyFavorites, setOnlyFavorites] = useState(false)

  const debouncedSortBy = useDebounce(sortBy, 500)
  const debouncedFilterMood = useDebounce(filterMood, 500)
  const debouncedOnlyFavorites = useDebounce(onlyFavorites, 500)

  const { user } = useUserStore()

  const fetchMemories = useCallback(
    async (isLoadMore = false) => {
      try {
        if (isLoadMore) setLoadingMore(true)
        else setLoading(true)

        const skip = isLoadMore ? memories.length : 0
        const res = await memoriesService.getMemories(subdomain as string, {
          mood: debouncedFilterMood,
          sortBy: debouncedSortBy,
          onlyFavorites: debouncedOnlyFavorites,
          limit: 5,
          skip
        })

        if (isLoadMore) {
          setMemories(prev => [...prev, ...res.data.memories])
        } else {
          setMemories(res.data.memories)
        }

        setStats(res.data.stats)
        setHasMore(res.data.hasMore)
      } catch (err) {
        console.error('Anılar yüklenirken hata oluştu:', err)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [subdomain, debouncedSortBy, debouncedFilterMood, debouncedOnlyFavorites, memories.length]
  )

  // İlk yükleme ve filtre değişimi
  useEffect(() => {
    fetchMemories(false)
  }, [fetchMemories])

  const handleSuccess = () => {
    fetchMemories(false)
    setEditingMemory(null)
  }

  const handleEdit = (memory: Memory) => {
    setEditingMemory(memory)
    setIsModalOpen(true)
  }

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true)
      const response = await memoriesService.exportPdf(subdomain as string)

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Anilarimiz-${subdomain}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error('PDF indirilirken hata oluştu:', err)
      showCustomToast.error('Hata', 'PDF indirilirken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleToggleFavorite = async (memory: Memory) => {
    if (togglingFavorite || !user) return
    try {
      setTogglingFavorite(memory._id)
      await memoriesService.toggleFavorite(memory._id)

      const isCurrentlyFavorite = memory.favorites.includes(user._id)
      const newFavorites = isCurrentlyFavorite
        ? memory.favorites.filter(id => id !== user._id)
        : [...memory.favorites, user._id]

      // Yerel state'i güncelle
      setMemories(prev => prev.map(m => (m._id === memory._id ? { ...m, favorites: newFavorites } : m)))

      // İstatistikleri güncelle
      setStats(prev => ({
        ...prev,
        favorites: isCurrentlyFavorite ? prev.favorites - 1 : prev.favorites + 1
      }))

      if (isCurrentlyFavorite) {
        showCustomToast.love('Favori', 'Favorilerden çıkarıldı.')
      } else {
        showCustomToast.love('Favori', 'Favorilere eklendi ❤️')
      }
    } catch (err) {
      console.error('Favori güncellenirken hata oluştu:', err)
      showCustomToast.error('Hata', 'Favori durumu güncellenirken bir hata oluştu.')
    } finally {
      setTogglingFavorite(null)
    }
  }

  const handleResetFilters = () => {
    setSortBy('newest')
    setFilterMood('all')
    setOnlyFavorites(false)
  }

  const toggleExpand = (id: string) => {
    setExpandedMemories(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleDelete = async () => {
    if (!deleteConfirmId) return

    setIsDeleting(true)
    try {
      await memoriesService.deleteMemory(deleteConfirmId)
      showCustomToast.success('Başarılı', 'Anı başarıyla silindi.')
      await fetchMemories(false)
      setDeleteConfirmId(null)
    } catch (err) {
      console.error('Anı silinirken hata oluştu:', err)
      showCustomToast.error('Hata', 'Anı silinirken bir hata oluştu.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className='min-h-screen pt-24 pb-12 bg-gray-100'>
      <main className='max-w-7xl mx-auto px-6 py-8'>
        {/* Page Header Section */}
        <section className='mb-12 relative rounded-3xl overflow-hidden'>
          <div className='relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white'>
            <div className='flex flex-col md:flex-row items-center justify-between mb-8 gap-6'>
              <div className='flex items-center space-x-6'>
                <div className='relative'>
                  <div className='w-20 h-20 bg-gradient-to-br from-[#E91E63] to-[#FF6B6B] rounded-3xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform'>
                    <Clock className='text-white' size={32} />
                  </div>
                  <div className='absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md animate-pulse'>
                    <Heart className='text-white' size={12} fill='white' />
                  </div>
                </div>

                <div>
                  <div className='flex items-center space-x-4 mb-2'>
                    <h1 className=' text-4xl md:text-5xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent'>
                      Anılarımız
                    </h1>
                    <div className='hidden sm:flex space-x-1'>
                      <Heart className='text-rose-400 animate-pulse' size={24} fill='currentColor' />
                      <Heart
                        className='text-pink-400 animate-pulse'
                        size={20}
                        fill='currentColor'
                        style={{ animationDelay: '0.2s' }}
                      />
                      <Heart
                        className='text-purple-400 animate-pulse'
                        size={18}
                        fill='currentColor'
                        style={{ animationDelay: '0.4s' }}
                      />
                    </div>
                  </div>
                  <p className='text-gray-600 text-lg font-medium'>Birlikte yazdığımız hikayenin en güzel sayfaları</p>
                </div>
              </div>

              <div className='flex flex-col space-y-3 w-full md:w-auto'>
                <button
                  onClick={() => {
                    setEditingMemory(null)
                    setIsModalOpen(true)
                  }}
                  className='group bg-gradient-to-r from-[#E91E63] to-[#FF6B6B] text-white px-8 py-4 rounded-2xl font-bold hover:shadow-2xl transition-all flex items-center justify-center space-x-3 relative overflow-hidden'
                >
                  <div className='absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity'></div>
                  <Plus className='group-hover:rotate-90 transition-transform' size={24} />
                  <span className='text-lg'>Yeni Anı Ekle</span>
                  <Sparkles className='text-yellow-300 animate-pulse' size={20} />
                </button>
                <button
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                  className='bg-white border-2 border-gray-200 hover:border-rose-300 text-gray-700 hover:text-rose-600 px-8 py-3 rounded-2xl font-semibold transition-all flex items-center justify-center space-x-2 disabled:opacity-50'
                >
                  {isDownloading ? <Loader2 className='animate-spin' size={18} /> : <Download size={18} />}
                  <span>{isDownloading ? 'Hazırlanıyor...' : 'Anıları İndir'}</span>
                </button>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-100 hover:border-rose-200 transition-all'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='font-bold text-gray-900 flex items-center space-x-2'>
                    <Filter className='text-rose-500' size={18} />
                    <span>Filtrele & Sırala</span>
                  </h3>
                  <div className='flex items-center space-x-4'>
                    <button
                      onClick={() => setOnlyFavorites(!onlyFavorites)}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                        onlyFavorites
                          ? 'bg-amber-100 text-amber-600 border-amber-200'
                          : 'bg-gray-50 text-gray-500 border-gray-100'
                      } border-2`}
                    >
                      <Star size={14} fill={onlyFavorites ? 'currentColor' : 'none'} />
                      <span>Sadece Favoriler</span>
                    </button>
                    <button
                      onClick={handleResetFilters}
                      className='text-sm text-rose-600 hover:text-rose-700 font-semibold'
                    >
                      Sıfırla
                    </button>
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className='w-full bg-white border-2 border-gray-200 hover:border-rose-300 rounded-xl px-4 py-6 font-medium text-gray-700 transition-all'>
                      <SelectValue placeholder='Sıralama' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='newest'>🆕 En yeni</SelectItem>
                      <SelectItem value='oldest'>🕰️ En eski</SelectItem>
                      <SelectItem value='alphabetical'>🔤 Alfabetik</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterMood} onValueChange={setFilterMood}>
                    <SelectTrigger className='w-full bg-white border-2 border-gray-200 hover:border-rose-300 rounded-xl px-4 py-6 font-medium text-gray-700 transition-all'>
                      <SelectValue placeholder='Kategori' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>🎭 Tüm Kategoriler</SelectItem>
                      {Object.entries(moodConfigs).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className='flex items-center space-x-2'>
                            <config.icon
                              size={16}
                              className={config.iconColor}
                              fill={key === 'romantic' ? 'currentColor' : 'none'}
                            />
                            <span>{config.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-100'>
                <div className='flex flex-col sm:flex-row items-center justify-between h-full gap-4'>
                  <div className='flex items-center space-x-6'>
                    <div className='text-center'>
                      <div className='text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent'>
                        {stats.total}
                      </div>
                      <div className='text-xs text-gray-600 font-semibold mt-1'>Gösterilen</div>
                    </div>
                    <div className='w-px h-12 bg-gray-200'></div>
                    <div className='text-center'>
                      <div className='text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent'>
                        {stats.thisMonth}
                      </div>
                      <div className='text-xs text-gray-600 font-semibold mt-1 whitespace-nowrap'>Bu Ay</div>
                    </div>
                    <div className='w-px h-12 bg-gray-200'></div>
                    <div className='text-center'>
                      <div className='text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent'>
                        {stats.favorites}
                      </div>
                      <div className='text-xs text-gray-600 font-semibold mt-1'>Favoriler</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className='relative'>
          <div className='absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-200 via-pink-200 to-purple-200 transform -translate-x-1/2'></div>

          <div className='space-y-12'>
            {loading && memories.length === 0 ? (
              // Initial Loading Skeletons
              <>
                <MemorySkeleton side='left' />
                <MemorySkeleton side='right' />
                <MemorySkeleton side='left' />
              </>
            ) : memories.length > 0 ? (
              memories.map((memory, index) => {
                const side = index % 2 === 0 ? 'left' : 'right'
                const dateObj = new Date(memory.date)
                const monthYear = dateObj.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
                const isExpanded = expandedMemories[memory._id]
                const isUserFavorite = user ? memory.favorites.includes(user._id) : false

                return (
                  <React.Fragment key={memory._id}>
                    {/* Month Marker - only show if it's the first memory of that month/year */}
                    {(index === 0 ||
                      monthYear !==
                        new Date(memories[index - 1].date).toLocaleDateString('tr-TR', {
                          month: 'long',
                          year: 'numeric'
                        })) && (
                      <div className='relative'>
                        <div className='absolute left-1/2 transform -translate-x-1/2 bg-white px-6 py-2 rounded-full shadow-md border-2 border-rose-200 z-10'>
                          <span className='font-bold text-rose-600'>{monthYear}</span>
                        </div>
                      </div>
                    )}

                    <div
                      className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center pt-8 ${index === 0 ? 'mt-8' : ''}`}
                    >
                      <div className={`${side === 'right' ? 'md:order-2 md:pl-12' : 'md:pr-12 text-right'}`}>
                        <div
                          className={`${moodConfigs[memory.mood]?.cardBg || 'bg-white'} rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-all relative group border border-transparent hover:border-white/50 backdrop-blur-sm`}
                        >
                          {/* Circle Icon */}
                          <MemoryMoodIcon
                            mood={memory.mood}
                            className={`absolute ${side === 'left' ? '-right-6' : '-left-6'} top-1/2 transform -translate-y-1/2`}
                          />

                          <ImageGallery photos={memory.photos} title={memory.title} />

                          <div className='space-y-3'>
                            <h3 className=' text-2xl font-bold text-gray-900'>{memory.title}</h3>

                            <div
                              className={`flex items-center ${side === 'left' ? 'justify-end' : 'justify-start'} space-x-4 text-sm text-gray-600`}
                            >
                              <div className='flex items-center space-x-2'>
                                <Calendar
                                  className={moodConfigs[memory.mood]?.iconColor || 'text-rose-400'}
                                  size={16}
                                />
                                <span>
                                  {dateObj.toLocaleDateString('tr-TR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                              {memory.location?.name && (
                                <div className='flex items-center space-x-2'>
                                  <MapPin
                                    className={moodConfigs[memory.mood]?.iconColor || 'text-rose-400'}
                                    size={16}
                                  />
                                  <span>{memory.location.name}</span>
                                </div>
                              )}
                            </div>

                            <div className='relative'>
                              <div
                                className={`text-gray-700 leading-relaxed overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[2000px]' : 'max-h-24'}`}
                              >
                                {memory.content}
                              </div>
                              {!isExpanded && memory.content.length > 150 && (
                                <div className='absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none'></div>
                              )}
                            </div>

                            {memory.content.length > 150 && (
                              <button
                                onClick={() => toggleExpand(memory._id)}
                                className={`font-semibold hover:underline flex items-center space-x-1 ${side === 'left' ? 'ml-auto' : 'mr-auto'} ${moodConfigs[memory.mood]?.iconColor || 'text-[#E91E63]'}`}
                              >
                                <span>{isExpanded ? 'Daha Az Gör' : 'Devamını Oku'}</span>
                                <ChevronDown
                                  className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                  size={16}
                                />
                              </button>
                            )}

                            <div className='flex items-center justify-between pt-4 border-t border-gray-100'>
                              <div className='flex items-center space-x-2'>
                                <MemoryMoodBadge mood={memory.mood} />
                                {isUserFavorite && (
                                  <span className='inline-block bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full text-sm font-semibold'>
                                    <Star className='inline mr-1' size={14} fill='currentColor' />
                                    Favori
                                  </span>
                                )}
                              </div>

                              <div className='flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                                <button
                                  onClick={() => handleToggleFavorite(memory)}
                                  disabled={togglingFavorite === memory._id}
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                    isUserFavorite
                                      ? 'bg-amber-100 text-amber-600 shadow-sm'
                                      : 'bg-gray-100 hover:bg-amber-50 text-gray-400 hover:text-amber-600'
                                  } disabled:opacity-70`}
                                  title={isUserFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                                >
                                  {togglingFavorite === memory._id ? (
                                    <Loader2 size={14} className='animate-spin' />
                                  ) : (
                                    <Star size={14} fill={isUserFavorite ? 'currentColor' : 'none'} />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleEdit(memory)}
                                  className='w-8 h-8 bg-gray-100 hover:bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 transition-colors'
                                >
                                  <Pen size={14} />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(memory._id)}
                                  className='w-8 h-8 bg-gray-100 hover:bg-red-50 rounded-lg flex items-center justify-center text-red-600 transition-colors'
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='hidden md:block'></div>
                    </div>
                  </React.Fragment>
                )
              })
            ) : (
              <div className='text-center py-20 bg-white rounded-3xl shadow-sm border-2 border-dashed border-gray-200'>
                <HeartOff className='mx-auto text-gray-300 mb-4' size={48} />
                <h3 className='text-xl font-bold text-gray-500'>Henüz anı eklenmemiş.</h3>
                <p className='text-gray-400 mt-2'>İlk anınızı ekleyerek hikayenizi yazmaya başlayın!</p>
              </div>
            )}
          </div>
        </section>

        {hasMore && (
          <section className='mt-16 text-center'>
            <button
              onClick={() => fetchMemories(true)}
              disabled={loadingMore}
              className='bg-white border-2 border-gray-200 hover:border-[#E91E63] text-gray-700 hover:text-[#E91E63] px-8 py-4 rounded-full font-semibold transition-all hover:shadow-lg flex items-center space-x-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loadingMore ? <Loader2 className='animate-spin' size={20} /> : <ArrowDown size={20} />}
              <span>Daha Fazla Anı Yükle</span>
            </button>
          </section>
        )}
      </main>

      {/* New Memory Modal */}
      <NewMemoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingMemory(null)
        }}
        onSuccess={handleSuccess}
        editingMemory={editingMemory}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className='fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300'>
          <div className='bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95 duration-300'>
            <div className='text-center'>
              <div className='inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4 text-red-600'>
                <Trash2 size={32} />
              </div>
              <h3 className='text-2xl font-bold text-gray-900 mb-2'>Anıyı Sil?</h3>
              <p className='text-gray-600 mb-8'>
                Bu anıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm fotoğraflar kalıcı olarak
                silinir.
              </p>

              <div className='flex space-x-4'>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={isDeleting}
                  className='flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all'
                >
                  Vazgeç
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className='flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-red-200 flex items-center justify-center space-x-2'
                >
                  {isDeleting ? <Loader2 className='animate-spin' size={20} /> : <span>Evet, Sil</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
