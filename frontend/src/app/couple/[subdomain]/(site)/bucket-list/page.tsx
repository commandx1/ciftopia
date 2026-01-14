'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { BucketListHeader } from '@/components/couple/bucket-list/BucketListHeader'
import { CategorySidebar } from '@/components/couple/bucket-list/CategorySidebar'
import { BucketItem } from '@/components/couple/bucket-list/BucketItem'
import { AddDreamModal } from '@/components/couple/bucket-list/AddDreamModal'
import { bucketListService } from '@/services/api'
import { BucketListItem } from '@/lib/type'
import { useParams } from 'next/navigation'
import { showCustomToast } from '@/components/ui/CustomToast'
import { Sparkles, Plus } from 'lucide-react'
import confetti from 'canvas-confetti'
import CustomModal from '@/components/ui/CustomModal'

export default function BucketListPage() {
  const { subdomain } = useParams()
  const [items, setItems] = useState<BucketListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeFilter, setActiveFilter] = useState('all') // 'all', 'completed', 'pending'
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null; loading: boolean }>({
    isOpen: false,
    id: null,
    loading: false
  })

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await bucketListService.getBucketList(subdomain as string)
      setItems(res.data)
    } catch {
      showCustomToast.error('Hata', 'Hayaller yüklenirken bir hata oluştu.')
    } finally {
      setIsLoading(false)
    }
  }, [subdomain])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length }
    items.forEach(item => {
      counts[item.category] = (counts[item.category] || 0) + 1
    })
    return counts
  }, [items])

  const filteredItems = useMemo(() => {
    return items
      .filter(item => {
        const categoryMatch = activeCategory === 'all' || item.category === activeCategory
        const filterMatch =
          activeFilter === 'all' ||
          (activeFilter === 'completed' && item.isCompleted) ||
          (activeFilter === 'pending' && !item.isCompleted)
        return categoryMatch && filterMatch
      })
      .sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) {
          return a.isCompleted ? 1 : -1
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  }, [items, activeCategory, activeFilter])

  const stats = useMemo(() => {
    const total = items.length
    const completed = items.filter(i => i.isCompleted).length
    const pending = total - completed
    return { total, completed, pending }
  }, [items])

  const handleToggleComplete = async (id: string, isCompleted: boolean) => {
    try {
      const res = await bucketListService.updateItem(id, { isCompleted })
      setItems(items.map(item => (item._id === id ? res.data : item)))

      if (isCompleted) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E91E63', '#FF6B6B', '#9C27B0', '#2196F3', '#4CAF50', '#FFC107']
        })
        showCustomToast.success('Tebrikler!', 'Bir hayalinizi daha gerçekleştirdiniz! 🎉')
      }
    } catch {
      showCustomToast.error('Hata', 'İşlem sırasında bir hata oluştu.')
    }
  }

  const handleDelete = (id: string) => {
    setDeleteModal({ isOpen: true, id, loading: false })
  }

  const confirmDelete = async () => {
    if (!deleteModal.id) return
    try {
      setDeleteModal(prev => ({ ...prev, loading: true }))
      await bucketListService.deleteItem(deleteModal.id)
      setItems(items.filter(item => item._id !== deleteModal.id))
      showCustomToast.success('Başarılı', 'Hayal listesinden kaldırıldı.')
      setDeleteModal({ isOpen: false, id: null, loading: false })
    } catch {
      showCustomToast.error('Hata', 'Silme işlemi başarısız oldu.')
      setDeleteModal(prev => ({ ...prev, loading: false }))
    }
  }

  const handleAddItem = async (data: Partial<BucketListItem>) => {
    try {
      const res = await bucketListService.createItem(data)
      setItems([res.data, ...items])
      showCustomToast.success('Harika!', 'Yeni bir hayal eklendi! ✨')
    } catch (error) {
      showCustomToast.error('Hata', 'Hayal eklenirken bir hata oluştu.')
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className='min-h-screen pt-32 pb-20 px-6 flex items-center justify-center'>
        <div className='w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin' />
      </div>
    )
  }

  return (
    <div className='min-h-screen pt-32 pb-20 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50'>
      <div className='max-w-7xl mx-auto px-6'>
        <BucketListHeader
          onAddClick={() => setIsModalOpen(true)}
          completedCount={stats.completed}
          totalCount={stats.total}
        />

        <section className='mb-10'>
          <div className='bg-white/60 backdrop-blur-md rounded-2xl shadow-sm p-2 inline-flex space-x-2 border border-white/50'>
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-8 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${
                activeFilter === 'all'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                  : 'text-gray-500 hover:bg-white/80'
              }`}
            >
              Tümü
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${activeFilter === 'all' ? 'bg-white/30' : 'bg-gray-100'}`}
              >
                {stats.total}
              </span>
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-8 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${
                activeFilter === 'completed'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                  : 'text-gray-500 hover:bg-white/80'
              }`}
            >
              Yapıldı ✓
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${activeFilter === 'completed' ? 'bg-white/30' : 'bg-gray-100'}`}
              >
                {stats.completed}
              </span>
            </button>
            <button
              onClick={() => setActiveFilter('pending')}
              className={`px-8 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${
                activeFilter === 'pending'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                  : 'text-gray-500 hover:bg-white/80'
              }`}
            >
              Bekliyor
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${activeFilter === 'pending' ? 'bg-white/30' : 'bg-gray-100'}`}
              >
                {stats.pending}
              </span>
            </button>
          </div>
        </section>

        <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
          <CategorySidebar
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            counts={categoryCounts}
          />

          <div className='lg:col-span-3'>
            {filteredItems.length === 0 ? (
              <div className='bg-white rounded-[2.5rem] p-16 text-center shadow-xl border border-rose-50'>
                <div className='w-32 h-32 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-float'>
                  <Sparkles size={64} className='text-rose-300' />
                </div>
                <h2 className='text-4xl font-black text-gray-900 mb-4'>Birlikte neler yapmak istiyorsunuz?</h2>
                <p className='text-gray-500 text-xl mb-10 italic max-w-md mx-auto'>
                  Hayallerinizi paylaşın ve birlikte gerçekleştirmenin mutluluğunu yaşayın!
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className='bg-gradient-to-r from-rose-500 to-pink-500 text-white px-10 py-5 rounded-[2rem] font-black text-lg hover:shadow-2xl transition-all hover:-translate-y-1 flex items-center gap-3 mx-auto shadow-lg shadow-rose-200'
                >
                  <Plus size={28} />
                  İlk Hedefinizi Ekleyin
                </button>
              </div>
            ) : (
              <div className='space-y-6'>
                <h2 className='text-3xl font-black text-gray-900 mb-8 flex items-center gap-4'>
                  {activeFilter === 'completed' ? (
                    <>
                      <span>🎉</span> Tamamlanan Hayaller
                    </>
                  ) : activeFilter === 'pending' ? (
                    <>
                      <span>⏳</span> Bekleyen Hayaller
                    </>
                  ) : (
                    <>
                      <span>✨</span> Tüm Hayallerimiz
                    </>
                  )}
                </h2>
                <AnimatePresence mode='popLayout'>
                  {filteredItems.map(item => (
                    <BucketItem
                      key={item._id}
                      item={item}
                      onToggleComplete={handleToggleComplete}
                      onDelete={handleDelete}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddDreamModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddItem} />

      <CustomModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, loading: false })}
        type='danger'
        title='Hayali Sil?'
        description='Bu hayali listenizden kalıcı olarak kaldırmak istediğinizden emin misiniz? Bu işlem geri alınamaz.'
        confirmText='Evet, Sil'
        onConfirm={confirmDelete}
        loading={deleteModal.loading}
      />
    </div>
  )
}
