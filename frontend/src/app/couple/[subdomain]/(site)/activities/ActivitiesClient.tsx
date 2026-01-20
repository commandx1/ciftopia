'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  History, 
  Heart, 
  Camera, 
  Star, 
  Calendar, 
  Feather, 
  StickyNote, 
  Hourglass, 
  MessageCircle, 
  ShieldCheck, 
  CreditCard,
  Search,
  Loader2
} from 'lucide-react'
import { Activity } from '@/lib/type'
import { activityService } from '@/services/api'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import Image from 'next/image'
import { getUserAvatar } from '@/lib/utils'

const moduleConfigs: Record<string, { icon: React.ElementType, color: string, label: string }> = {
  memories: { icon: Heart, color: 'rose', label: 'Anılar' },
  gallery: { icon: Camera, color: 'purple', label: 'Galeri' },
  'bucket-list': { icon: Star, color: 'amber', label: 'Hayaller' },
  'important-dates': { icon: Calendar, color: 'pink', label: 'Tarihler' },
  poems: { icon: Feather, color: 'indigo', label: 'Şiirler' },
  notes: { icon: StickyNote, color: 'blue', label: 'Notlar' },
  'time-capsule': { icon: Hourglass, color: 'orange', label: 'Zaman Kapsülü' },
  'daily-question': { icon: MessageCircle, color: 'emerald', label: 'Günlük Soru' },
  onboarding: { icon: ShieldCheck, color: 'cyan', label: 'Sistem' },
  payment: { icon: CreditCard, color: 'slate', label: 'Ödeme' }
}

interface ActivitiesClientProps {
  initialActivities: Activity[]
  initialHasMore: boolean
}

export default function ActivitiesClient({ initialActivities, initialHasMore }: ActivitiesClientProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [searchTerm, setSearchSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  const fetchActivities = useCallback(async (pageNum: number, isLoadMore: boolean = false, moduleFilter?: string) => {
    try {
      if (isLoadMore) setLoadingMore(true)
      else setLoading(true)

      const currentFilter = moduleFilter !== undefined ? moduleFilter : activeFilter
      const res = await activityService.getActivities({ 
        page: pageNum, 
        limit: 10,
        module: currentFilter
      })
      
      if (isLoadMore) {
        setActivities(prev => [...prev, ...res.data.activities])
      } else {
        setActivities(res.data.activities)
      }
      
      setHasMore(res.data.hasMore)
      setPage(pageNum)
    } catch (error) {
      console.error('Aktiviteler yüklenirken hata:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [activeFilter])

  const isFirstMount = React.useRef(true)

  // Fetch when filter changes, but skip on initial mount for 'all' filter (SSR)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      if (activeFilter === 'all') return
    }
    fetchActivities(1, false, activeFilter)
  }, [activeFilter, fetchActivities])

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchActivities(page + 1, true)
    }
  }

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.userId.firstName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div className='max-w-4xl mx-auto px-4 pb-12 pt-24'>
      {/* ... existing header ... */}
      <div className='flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6'>
        <div>
          <h1 className='text-4xl font-black text-gray-900 flex items-center gap-3'>
            <div className='w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600'>
              <History size={28} />
            </div>
            Aktiviteler
          </h1>
          <p className='text-gray-500 mt-2 font-medium'>Dünyanızda neler olup bittiğini takip edin</p>
        </div>

        <div className='flex items-center gap-3'>
          <div className='relative flex-1 md:w-64'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' size={18} />
            <input 
              type='text' 
              placeholder='Aktivite ara...'
              value={searchTerm}
              onChange={(e) => setSearchSearchTerm(e.target.value)}
              className='w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-100 rounded-2xl focus:border-rose-500 outline-none transition-all shadow-sm'
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className='flex items-center gap-2 overflow-x-auto pb-6 scrollbar-hide'>
        <button 
          onClick={() => setActiveFilter('all')}
          className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
            activeFilter === 'all' 
              ? 'bg-gray-900 text-white shadow-lg' 
              : 'bg-white text-gray-500 border-2 border-gray-100 hover:bg-gray-50'
          }`}
        >
          Tümü
        </button>
        {Object.entries(moduleConfigs).map(([key, config]) => (
          <button 
            key={key}
            onClick={() => setActiveFilter(key)}
            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${
              activeFilter === key 
                ? `bg-${config.color}-500 text-white shadow-lg` 
                : 'bg-white text-gray-500 border-2 border-gray-100 hover:bg-gray-50'
            }`}
          >
            <config.icon size={14} />
            {config.label}
          </button>
        ))}
      </div>

      {/* Activities List */}
      <div className='space-y-4'>
        {loading && !loadingMore ? (
          <div className='py-20 flex flex-col items-center justify-center text-gray-400'>
            <Loader2 className='animate-spin mb-4' size={40} />
            <p className='font-bold'>Yükleniyor...</p>
          </div>
        ) : filteredActivities.length > 0 ? (
          <>
            <AnimatePresence mode='popLayout'>
              {filteredActivities.map((activity, index) => {
                const config = moduleConfigs[activity.module] || moduleConfigs.onboarding
                return (
                  <motion.div
                    key={activity._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: (index % 10) * 0.05 }}
                    className='bg-white rounded-3xl p-5 border-2 border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all group flex items-start gap-5'
                  >
                    {/* Module Icon */}
                    <div className={`w-14 h-14 bg-${config.color}-50 rounded-2xl flex items-center justify-center text-${config.color}-500 shrink-0 group-hover:scale-110 transition-transform`}>
                      <config.icon size={28} />
                    </div>

                    {/* Content */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between mb-1'>
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-${config.color}-500`}>
                          {config.label}
                        </span>
                        <span className='text-[10px] font-bold text-gray-400'>
                          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: tr })}
                        </span>
                      </div>
                      <p className='text-gray-900 font-bold leading-relaxed mb-3'>
                        {activity.description}
                      </p>
                      
                      {/* User Info */}
                      <div className='flex items-center gap-2'>
                        <div className='relative w-6 h-6 rounded-full overflow-hidden border border-gray-100'>
                          <Image 
                            src={getUserAvatar({
                              avatar: activity.userId.avatar,
                              gender: activity.userId.gender
                            })}
                            alt={activity.userId.firstName}
                            fill
                            className='object-cover'
                          />
                        </div>
                        <span className='text-xs font-bold text-gray-500'>{activity.userId.firstName} {activity.userId.lastName}</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {/* Load More Button */}
            {hasMore && (
              <div className='pt-8 flex justify-center'>
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className='bg-white border-2 border-gray-100 text-gray-900 px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:border-rose-500 hover:text-rose-500 transition-all shadow-sm flex items-center gap-3 active:scale-95 disabled:opacity-50'
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className='animate-spin' size={18} />
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      Daha Fazla Yükle
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className='bg-white rounded-[2.5rem] p-12 border-2 border-dashed border-gray-200 text-center'>
            <div className='w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6'>
              <History size={40} className='text-gray-300' />
            </div>
            <h3 className='text-xl font-bold text-gray-900 mb-2'>Aktivite Bulunamadı</h3>
            <p className='text-gray-500'>Henüz bir aktivite kaydı oluşturulmamış veya filtrenizle eşleşen sonuç yok.</p>
          </div>
        )}
      </div>
    </div>
  )
}
