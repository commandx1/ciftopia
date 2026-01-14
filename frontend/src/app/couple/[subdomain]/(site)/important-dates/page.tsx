'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Calendar as CalendarIcon, Clock } from 'lucide-react'
import { ImportantDate } from '@/lib/type'
import { importantDatesService } from '@/services/api'
import { useUserStore } from '@/store/userStore'
import { showCustomToast } from '@/components/ui/CustomToast'
import CustomModal from '@/components/ui/CustomModal'
import ImportantDateCard from '@/components/couple/important-dates/ImportantDateCard'
import AddImportantDateModal from '@/components/couple/important-dates/AddImportantDateModal'
import { differenceInDays } from 'date-fns'

export default function ImportantDatesPage() {
  const { subdomain } = useParams()
  const [dates, setDates] = useState<ImportantDate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editData, setEditData] = useState<ImportantDate | null>(null)
  const [activeType, setActiveType] = useState('all')
  const { user, updateStorageUsed } = useUserStore()

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null; loading: boolean }>({
    isOpen: false,
    id: null,
    loading: false
  })

  useEffect(() => {
    fetchDates()
  }, [subdomain])

  const fetchDates = async () => {
    try {
      setIsLoading(true)
      const response = await importantDatesService.getImportantDates(subdomain as string)
      setDates(response.data)
    } catch (error) {
      console.error(error)
      showCustomToast.error('Hata', 'Tarihler yüklenirken bir hata oluştu.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddOrUpdate = async (data: Partial<ImportantDate>) => {
    try {
      if (editData) {
        const response = await importantDatesService.updateImportantDate(editData._id, data)
        const { date, storageUsed } = response.data as any
        setDates(dates.map(d => (d._id === editData._id ? date : d)))
        if (storageUsed !== undefined) updateStorageUsed(storageUsed)
        showCustomToast.success('Başarılı', 'Tarih güncellendi.')
      } else {
        const response = await importantDatesService.createImportantDate(subdomain as string, data)
        const { date, storageUsed } = response.data as any
        setDates([...dates, date])
        if (storageUsed !== undefined) updateStorageUsed(storageUsed)
        showCustomToast.success('Başarılı', 'Yeni tarih eklendi.')
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const handleDelete = (id: string) => {
    setDeleteModal({ isOpen: true, id, loading: false })
  }

  const confirmDelete = async () => {
    if (!deleteModal.id) return
    try {
      setDeleteModal(prev => ({ ...prev, loading: true }))
      const response = await importantDatesService.deleteImportantDate(deleteModal.id)
      const { storageUsed } = response.data as any
      setDates(dates.filter(d => d._id !== deleteModal.id))
      if (storageUsed !== undefined) updateStorageUsed(storageUsed)
      showCustomToast.success('Başarılı', 'Tarih silindi.')
      setDeleteModal({ isOpen: false, id: null, loading: false })
    } catch (error) {
      console.error(error)
      showCustomToast.error('Hata', 'Silme işlemi başarısız oldu.')
      setDeleteModal(prev => ({ ...prev, loading: false }))
    }
  }

  const filteredDates = useMemo(() => {
    let result = dates
    if (activeType !== 'all') {
      result = dates.filter(d => d.type === activeType)
    }
    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [dates, activeType])

  const upcomingDates = useMemo(() => {
    const now = new Date()
    return dates
      .filter(d => {
        const date = new Date(d.date)
        if (d.isRecurring) {
          date.setFullYear(now.getFullYear())
          if (date < now) date.setFullYear(now.getFullYear() + 1)
          return true
        }
        return date >= now
      })
      .map(d => {
        const date = new Date(d.date)
        if (d.isRecurring) {
          date.setFullYear(now.getFullYear())
          if (date < now) date.setFullYear(now.getFullYear() + 1)
        }
        return { ...d, nextOccurrence: date }
      })
      .sort((a, b) => a.nextOccurrence.getTime() - b.nextOccurrence.getTime())
      .slice(0, 3)
  }, [dates])

  return (
    <div className='min-h-screen bg-[#F8F9FA] pt-24 pb-12'>
      <div className='max-w-7xl mx-auto px-6'>
        {/* Page Header */}
        <section className='mb-12'>
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
            <div>
              <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-3 flex items-center gap-3'>
                Önemli Tarihlerimiz <span className='text-3xl'>📅</span>
              </h1>
              <p className='text-gray-500 text-lg font-medium'>Asla unutmak istemediğiniz anları kaydedin</p>
            </div>
            <div className='flex items-center space-x-4'>
              <button
                onClick={() => {
                  setEditData(null)
                  setIsModalOpen(true)
                }}
                className='bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-2 shadow-md'
              >
                <Plus size={20} />
                <span>Tarih Ekle</span>
              </button>
            </div>
          </div>
        </section>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-10'>
          {/* Upcoming Sidebar */}
          <aside className='lg:col-span-1 order-2 lg:order-1'>
            <div className='bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 sticky top-28'>
              <div className='flex items-center justify-between mb-8'>
                <h2 className='text-2xl font-bold text-gray-900'>Yaklaşanlar</h2>
                <div className='w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center text-rose-500'>
                  <Clock size={20} />
                </div>
              </div>

              <div className='space-y-6'>
                {upcomingDates.length > 0 ? (
                  upcomingDates.map((date, index) => {
                    const daysLeft = differenceInDays(date.nextOccurrence, new Date())
                    return (
                      <div
                        key={date._id}
                        className={`p-6 rounded-3xl ${index === 0 ? 'bg-rose-50 border-2 border-rose-100' : 'bg-gray-50 border-2 border-transparent'}`}
                      >
                        <div className='flex items-center space-x-4 mb-4'>
                          <div className='text-3xl bg-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm'>
                            {date.type === 'birthday' ? '🎂' : date.type === 'marriage' ? '💒' : '💍'}
                          </div>
                          <div>
                            <h3 className='font-bold text-gray-900 leading-tight'>{date.title}</h3>
                            <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mt-1'>
                              {new Date(date.nextOccurrence).toLocaleDateString('tr-TR', {
                                day: 'numeric',
                                month: 'long'
                              })}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`text-center py-3 rounded-2xl font-bold ${index === 0 ? 'bg-white text-rose-500 shadow-sm' : 'bg-white/50 text-gray-600'}`}
                        >
                          {daysLeft === 0 ? 'Bugün!' : `${daysLeft} gün sonra`}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className='text-center py-10'>
                    <p className='text-gray-400 font-medium'>Yakın zamanda bir tarih yok.</p>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Timeline Section */}
          <main className='lg:col-span-2 order-1 lg:order-2'>
            {/* Filter Buttons */}
            <div className='flex items-center space-x-3 mb-10 overflow-x-auto pb-4 scrollbar-hide'>
              {['all', 'dating', 'relationship', 'marriage', 'birthday', 'travel'].map(type => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all uppercase tracking-widest text-[10px] ${
                    activeType === type
                      ? 'bg-gray-900 text-white shadow-lg'
                      : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                  }`}
                >
                  {type === 'all'
                    ? 'Tümü'
                    : type === 'dating'
                      ? 'Tanışma'
                      : type === 'relationship'
                        ? 'İlişki'
                        : type === 'marriage'
                          ? 'Evlilik'
                          : type === 'birthday'
                            ? 'Doğum Günleri'
                            : 'Seyahatler'}
                </button>
              ))}
            </div>

            {/* Timeline */}
            <div className='relative'>
              <div className='absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-200 via-purple-200 to-blue-200 rounded-full opacity-50'></div>

              <AnimatePresence mode='popLayout'>
                {isLoading ? (
                  <div className='space-y-10 pl-20'>
                    {[1, 2, 3].map(n => (
                      <div key={n} className='h-48 bg-gray-200 rounded-3xl animate-pulse'></div>
                    ))}
                  </div>
                ) : filteredDates.length > 0 ? (
                  filteredDates.map(date => (
                    <motion.div
                      key={date._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                    >
                      <ImportantDateCard
                        date={date}
                        currentUser={user}
                        onEdit={date => {
                          setEditData(date)
                          setIsModalOpen(true)
                        }}
                        onDelete={handleDelete}
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className='text-center py-20 pl-20'>
                    <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400'>
                      <CalendarIcon size={40} />
                    </div>
                    <h3 className='text-xl font-bold text-gray-900 mb-2'>Henüz bir tarih eklenmemiş</h3>
                    <p className='text-gray-500'>Özel anlarınızı kaydederek burada ölümsüzleştirebilirsiniz.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>

      <AddImportantDateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddOrUpdate}
        editData={editData}
      />

      <CustomModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, loading: false })}
        type='danger'
        title='Tarihi Sil?'
        description='Bu özel tarihi listenizden kalıcı olarak kaldırmak istediğinizden emin misiniz?'
        confirmText='Evet, Sil'
        onConfirm={confirmDelete}
        loading={deleteModal.loading}
      />
    </div>
  )
}
