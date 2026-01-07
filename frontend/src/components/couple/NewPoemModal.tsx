'use client'

import React, { useEffect, useState } from 'react'
import { X, Feather, Send, Sparkles, Loader2, Heart } from 'lucide-react'
import { poemsService } from '@/services/poemsService'
import { Poem } from '@/lib/type'
import { showCustomToast } from '../ui/CustomToast'
import { useUserStore } from '@/store/userStore'

interface NewPoemModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editingPoem?: Poem | null
}

const TAG_OPTIONS = ['Aşk', 'Özlem', 'Yıldönümü', 'Doğum Günü', 'Günaydın', 'İyi Geceler', 'Dilek', 'Sonsuzluk']

export default function NewPoemModal({ isOpen, onClose, onSuccess, editingPoem }: NewPoemModalProps) {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [dedicatedTo, setDedicatedTo] = useState<string>('')
  const [isPublic, setIsPublic] = useState(false)

  const { user } = useUserStore()

  useEffect(() => {
    if (editingPoem) {
      setTitle(editingPoem.title)
      setContent(editingPoem.content)
      setSelectedTags(editingPoem.tags || [])
      setDedicatedTo(editingPoem.dedicatedTo?._id || '')
      setIsPublic(editingPoem.isPublic || false)
    } else {
      setTitle('')
      setContent('')
      setSelectedTags([])
      setDedicatedTo('')
      setIsPublic(false)
    }
  }, [editingPoem, isOpen])

  useEffect(() => {
    // If user is logged in, find partner (the other person in the couple)
    // For now, we can just get the partner info if available in user object or from a separate fetch.
    // In this system, user object usually contains couple info.
    // Since we don't have a direct "getPartner" service yet, we'll assume the backend handles dedication via ID.
    // We'll leave it simple for now or fetch if needed.
  }, [user])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      showCustomToast.warning('Uyarı', 'Lütfen başlık ve içerik alanlarını doldurun.')
      return
    }

    setLoading(true)
    try {
      const data: any = {
        title,
        content,
        tags: selectedTags,
        dedicatedTo: dedicatedTo || undefined,
        isPublic
      }

      if (editingPoem) {
        await poemsService.updatePoem(editingPoem._id, data)
        showCustomToast.success('Başarılı', 'Şiiriniz güncellendi ✨')
      } else {
        await poemsService.createPoem(data)
        showCustomToast.success('Başarılı', 'Şiiriniz kaydedildi ✨')
      }
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Şiir kaydedilirken hata:', err)
      showCustomToast.error('Hata', 'Şiir kaydedilirken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]))
  }

  return (
    <div className='fixed inset-0 z-[151] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300'>
      <div className='bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden relative animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col'>
        {/* Header */}
        <div className='bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white relative'>
          <button
            onClick={onClose}
            className='absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all'
          >
            <X size={20} />
          </button>
          <div className='flex items-center space-x-4'>
            <div className='w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30'>
              <Feather size={28} className='text-white' />
            </div>
            <div>
              <h2 className='text-3xl font-bold'>{editingPoem ? 'Şiiri Düzenle' : 'Yeni Şiir Yaz'}</h2>
              <p className='text-white/80'>Duygularınızı dizelere dökün...</p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className='p-8 overflow-y-auto custom-scrollbar flex-1'>
          <div className='space-y-6'>
            {/* Title */}
            <div>
              <label className='block text-sm font-bold text-gray-700 mb-2 ml-1'>Şiir Başlığı</label>
              <input
                type='text'
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder='Örn: Sana Dair...'
                className='w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-2xl outline-none transition-all text-xl'
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className='block text-sm font-bold text-gray-700 mb-2 ml-1'>Şiirin</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder='Gözlerinde kaybolmuşum ben...'
                rows={8}
                className='w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-2xl outline-none transition-all text-lg leading-relaxed resize-none'
                required
              />
            </div>

            {/* Public Option */}
            <div
              className='bg-purple-50 p-4 rounded-2xl border-2 border-purple-100 flex items-center justify-between cursor-pointer group transition-all hover:bg-purple-100'
              onClick={() => setIsPublic(!isPublic)}
            >
              <div className='flex items-center space-x-3'>
                <div
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${isPublic ? 'bg-purple-600 border-purple-600' : 'bg-white border-purple-200 group-hover:border-purple-300'}`}
                >
                  {isPublic && <Heart size={14} className='text-white fill-current' />}
                </div>
                <div>
                  <p className='font-bold text-gray-800 text-sm'>Şiirimi herkese açık yap</p>
                  <p className='text-gray-500 text-xs'>
                    Bu şiir diğer kullanıcılar için &quot;Şiir Örnekleri&quot; kısmında görünür.
                  </p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className='block text-sm font-bold text-gray-700 mb-3 ml-1'>Etiketler</label>
              <div className='flex flex-wrap gap-2'>
                {TAG_OPTIONS.map(tag => (
                  <button
                    key={tag}
                    type='button'
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border-2 ${
                      selectedTags.includes(tag)
                        ? 'bg-purple-100 border-purple-500 text-purple-700'
                        : 'bg-gray-50 border-transparent text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className='mt-10 flex space-x-4'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all'
            >
              Vazgeç
            </button>
            <button
              type='submit'
              disabled={loading}
              className='flex-[2] bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl transition-all flex items-center justify-center space-x-3 disabled:opacity-50'
            >
              {loading ? (
                <Loader2 className='animate-spin' size={24} />
              ) : (
                <>
                  <Send size={20} />
                  <span>{editingPoem ? 'Güncelle' : 'Şiiri Kaydet'}</span>
                  <Sparkles size={18} className='text-yellow-300' />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
