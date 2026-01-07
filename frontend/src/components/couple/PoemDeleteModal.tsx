'use client'

import React from 'react'
import { Trash2, Loader2 } from 'lucide-react'

interface PoemDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}

export default function PoemDeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  loading 
}: PoemDeleteModalProps) {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300'>
      <div className='bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 relative animate-in zoom-in-95 duration-300 text-center'>
        <div className='inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-3xl mb-6 text-red-600'>
          <Trash2 size={40} />
        </div>
        <h3 className='text-3xl font-bold text-gray-900 mb-3'>Şiiri Sil?</h3>
        <p className='text-gray-600 mb-10 text-lg leading-relaxed'>
          Bu şiiri kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
        </p>

        <div className='flex space-x-4'>
          <button
            onClick={onClose}
            disabled={loading}
            className='flex-1 px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all'
          >
            Vazgeç
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className='flex-1 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-red-200 flex items-center justify-center space-x-2'
          >
            {loading ? <Loader2 className='animate-spin' size={24} /> : <span>Sil</span>}
          </button>
        </div>
      </div>
    </div>
  )
}

