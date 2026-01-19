'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { TimeCapsuleHeader } from '@/components/couple/time-capsule/TimeCapsuleHeader'
import { CapsuleCard } from '@/components/couple/time-capsule/CapsuleCard'
import { CreateCapsuleModal } from '@/components/couple/time-capsule/CreateCapsuleModal'
import { CapsuleDetailModal } from '@/components/couple/time-capsule/CapsuleDetailModal'
import { timeCapsuleService } from '@/services/api'
import { TimeCapsule } from '@/lib/type'
import { showCustomToast } from '@/components/ui/CustomToast'
import { Lock, LockOpen, Filter, Sparkles } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

export default function TimeCapsulePage() {
  const { subdomain } = useParams()
  const [capsules, setCapsules] = useState<TimeCapsule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'all' | 'locked' | 'open'>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedCapsule, setSelectedCapsule] = useState<TimeCapsule | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  
  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await timeCapsuleService.getTimeCapsules(subdomain as string)
      setCapsules(res.data)
    } catch {
      showCustomToast.error('Hata', 'Zaman kapsülleri yüklenirken bir hata oluştu.')
    } finally {
      setIsLoading(false)
    }
  }, [subdomain])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredCapsules = useMemo(() => {
    const now = new Date()
    return [...capsules]
      .filter(c => {
        const isLocked = new Date(c.unlockDate) > now && !c.isOpened
        if (activeFilter === 'locked') return isLocked
        if (activeFilter === 'open') return !isLocked
        return true
      })
      .sort((a, b) => new Date(a.unlockDate).getTime() - new Date(b.unlockDate).getTime())
  }, [capsules, activeFilter])

  const stats = useMemo(() => {
    const now = new Date()
    const locked = capsules.filter(c => new Date(c.unlockDate) > now && !c.isOpened).length
    const open = capsules.length - locked
    return { total: capsules.length, locked, open }
  }, [capsules])

  const handleOpenCapsule = async (id: string) => {
    try {
      const res = await timeCapsuleService.getCapsuleDetail(id)
      setSelectedCapsule(res.data)
      setIsDetailModalOpen(true)
      // Update the local state to mark as opened if it wasn't
      setCapsules(prev => prev.map(c => c._id === id ? { ...c, isOpened: true } : c))
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } }
      showCustomToast.error('Hata', apiError.response?.data?.message || 'Kapsül açılamadı.')
    }
  }

  const handleAddCapsule = async (data: Partial<TimeCapsule>) => {
    try {
      const res = await timeCapsuleService.createCapsule(data)
      setCapsules(prev => [res.data, ...prev])
      showCustomToast.success('Harika!', 'Yeni bir zaman kapsülü mühürlendi! 🔒')
    } catch {
      showCustomToast.error('Hata', 'Zaman kapsülü oluşturulurken bir hata oluştu.')
      throw new Error('Create failed')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-6">
        <TimeCapsuleHeader onAddClick={() => setIsCreateModalOpen(true)} />

        {/* Info Box */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border-2 border-purple-100 shadow-sm">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-purple-200">
                <Lock className="text-white" size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Zaman Kapsülü Nasıl Çalışır?</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Geleceğe mektuplar, notlar ve fotoğraflar gönderin. Belirlediğiniz tarihte otomatik olarak açılır ve size bildirim gelir. Bugünün duygularını gelecekte yeniden yaşayın.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-purple-100">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center shrink-0 text-purple-600">
                      <Sparkles size={20} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">Mektubunuzu yazın</span>
                  </div>
                  <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-amber-100">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0 text-amber-600">
                      <Filter size={20} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">Açılma tarihi seçin</span>
                  </div>
                  <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-rose-100">
                    <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center shrink-0 text-rose-600">
                      <LockOpen size={20} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">Gelecekte keşfedin</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <h2 className="text-3xl font-bold text-gray-900">Kapsülleriniz</h2>
          <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-sm p-2 inline-flex space-x-2 border border-white/50">
            {[
              { id: 'all', label: 'Tümü', count: stats.total, color: 'from-purple-500 to-indigo-500' },
              { id: 'locked', label: 'Kilitli', count: stats.locked, color: 'from-amber-500 to-orange-500' },
              { id: 'open', label: 'Açık', count: stats.open, color: 'from-green-500 to-emerald-500' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as 'all' | 'locked' | 'open')}
                className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 uppercase tracking-widest ${
                  activeFilter === f.id
                    ? `bg-gradient-to-r ${f.color} text-white shadow-md`
                    : 'text-gray-500 hover:bg-white/80'
                }`}
              >
                {f.label}
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeFilter === f.id ? 'bg-white/30' : 'bg-gray-100'}`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode='popLayout'>
            {filteredCapsules.length > 0 ? (
              filteredCapsules.map((capsule) => (
                <CapsuleCard 
                  key={capsule._id} 
                  capsule={capsule} 
                  onOpen={handleOpenCapsule}
                />
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center bg-white/40 backdrop-blur-md rounded-[3rem] border-2 border-dashed border-purple-200"
              >
                <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock className="text-purple-300" size={48} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Henüz kapsül bulunamadı</h3>
                <p className="text-gray-500 mb-8 italic">İlk zaman kapsülünüzü oluşturarak geleceğe bir mesaj bırakın!</p>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-purple-500 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-sm hover:bg-purple-600 transition-all shadow-lg shadow-purple-200"
                >
                  Hemen Başla
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tips Section */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Sparkles className="text-amber-500" />
            Zaman Kapsülü İpuçları
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'İçten Olun', desc: 'Duygularınızı samimi bir şekilde ifade edin. Gelecekte bu duyguları hatırlamak çok özel olacak.', icon: '💡', color: 'from-amber-50 to-orange-50', border: 'border-amber-100' },
              { title: 'Fotoğraf Ekleyin', desc: 'O anı yaşadığınız fotoğrafları ekleyin. Görsel anılar daha güçlü hatıralar oluşturur.', icon: '📸', color: 'from-purple-50 to-indigo-50', border: 'border-purple-100' },
              { title: 'Anlamlı Tarihler', desc: 'Yıldönümü, doğum günü gibi özel günlere kapsül ayarlayın. Sürpriz etkisi yaratır.', icon: '📅', color: 'from-rose-50 to-pink-50', border: 'border-rose-100' }
            ].map((tip, i) => (
              <div key={i} className={`bg-gradient-to-br ${tip.color} rounded-3xl p-8 border-2 ${tip.border} shadow-sm hover:shadow-md transition-all`}>
                <div className="text-4xl mb-4">{tip.icon}</div>
                <h3 className="font-black text-gray-900 mb-2 uppercase tracking-wide">{tip.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed font-medium">{tip.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <CreateCapsuleModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onAdd={handleAddCapsule}
      />

      <CapsuleDetailModal 
        capsule={selectedCapsule} 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
        onUpdate={(updatedCapsule) => {
          setSelectedCapsule(updatedCapsule)
          setCapsules(prev => prev.map(c => c._id === updatedCapsule._id ? updatedCapsule : c))
        }}
      />
    </div>
  )
}
