'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Map, Utensils, Film, Home, Heart, Plus, X } from 'lucide-react'
import { BucketListItem } from '@/lib/type'

interface AddDreamModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (data: Partial<BucketListItem>) => Promise<void>
}

const categories = [
  { id: 'travel', label: 'Seyahat', icon: Map, color: 'text-blue-500', bg: 'hover:bg-blue-50', border: 'hover:border-blue-500' },
  { id: 'food', label: 'Yemek', icon: Utensils, color: 'text-orange-500', bg: 'hover:bg-orange-50', border: 'hover:border-orange-500' },
  { id: 'experience', label: 'Deneyim', icon: Film, color: 'text-purple-500', bg: 'hover:bg-purple-50', border: 'hover:border-purple-500' },
  { id: 'home', label: 'Ev', icon: Home, color: 'text-green-500', bg: 'hover:bg-green-50', border: 'hover:border-green-500' },
  { id: 'relationship', label: 'İlişki', icon: Heart, color: 'text-rose-500', bg: 'hover:bg-rose-50', border: 'hover:border-rose-500' }
]

export const AddDreamModal = ({ isOpen, onClose, onAdd }: AddDreamModalProps) => {
  const [formData, setFormData] = useState<{
    title: string
    category: BucketListItem['category']
    targetDate: string
    description: string
  }>({
    title: '',
    category: 'experience',
    targetDate: '',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onAdd(formData)
      setFormData({
        title: '',
        category: 'experience',
        targetDate: '',
        description: ''
      })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20"
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 p-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-gray-900 mb-1">Yeni Hayal Ekle ✨</h2>
                <p className="text-gray-500 font-medium italic text-sm">Birlikte yapacağınız o harika şeyi anlatın</p>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 rounded-2xl hover:bg-gray-100 flex items-center justify-center transition-all group"
              >
                <X className='text-gray-400 group-hover:text-gray-600 transition-all' size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              <div className="space-y-3">
                <label className="block text-sm font-black text-gray-700 uppercase tracking-widest ml-1">Hayalin Nedir?</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Örn: Paris'te Eyfel Kulesi'ne çıkmak"
                  className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-rose-500 focus:bg-white focus:outline-none transition-all text-lg font-medium shadow-inner"
                />
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-black text-gray-700 uppercase tracking-widest ml-1">Kategori Seç</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.id as BucketListItem['category'] })}
                      className={`p-4 border-2 rounded-2xl transition-all text-center flex flex-col items-center gap-2 group ${
                        formData.category === cat.id
                          ? 'border-rose-500 bg-rose-50 shadow-md'
                          : 'border-gray-100 bg-gray-50 hover:bg-white'
                      }`}
                    >
                      <cat.icon className={`${formData.category === cat.id ? 'text-rose-500' : 'text-gray-400'} group-hover:scale-110 transition-transform`} size={24} />
                      <p className={`text-xs font-black uppercase ${formData.category === cat.id ? 'text-rose-600' : 'text-gray-500'}`}>{cat.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-black text-gray-700 uppercase tracking-widest ml-1">Hedef Tarih (İstersen)</label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-rose-500 focus:bg-white focus:outline-none transition-all font-medium shadow-inner"
                />
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-black text-gray-700 uppercase tracking-widest ml-1">Biraz Detay Versene...</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Neler yapacaksınız? Neden bu kadar istiyorsunuz?"
                  className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-rose-500 focus:bg-white focus:outline-none transition-all resize-none font-medium shadow-inner"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white py-5 rounded-2xl font-black text-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-rose-200"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus size={24} />
                      Hayal Listesine Ekle
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-10 bg-gray-100 text-gray-600 py-5 rounded-2xl font-black text-lg hover:bg-gray-200 transition-all uppercase tracking-widest"
                >
                  Vazgeç
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
