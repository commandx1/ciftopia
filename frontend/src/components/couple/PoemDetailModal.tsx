'use client'

import React from 'react'
import { X, Feather, Heart, Pen, Trash2 } from 'lucide-react'
import { Poem, User } from '@/lib/type'
import { getUserAvatar } from '@/lib/utils'

interface PoemDetailModalProps {
  poem: Poem | null
  onClose: () => void
  onEdit?: (poem: Poem, e: React.MouseEvent) => void
  onDelete?: (id: string) => void
  currentUser?: User | null
}

export default function PoemDetailModal({ poem, onClose, onEdit, onDelete, currentUser }: PoemDetailModalProps) {
  if (!poem) return null

  const isAuthor = currentUser?._id === poem.authorId._id

  return (
    <div className='fixed inset-0 bg-black/70 backdrop-blur-md z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300'>
      <div className='bg-white rounded-[3rem] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-300 custom-scrollbar'>
        <div className='sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-8 z-20 flex items-center justify-between'>
          <div className='flex items-center space-x-6'>
            <div className='w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30'>
              <Feather className='text-white' size={32} />
            </div>
            <div>
              <h2 className='text-4xl font-bold text-white'>{poem.title}</h2>
              <p className='text-white/80 font-medium'>
                {new Date(poem.createdAt).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all border border-white/30'
          >
            <X size={24} className='text-white' />
          </button>
        </div>

        <div className='p-12'>
          <div className='flex flex-wrap items-center justify-between mb-10 pb-8 border-b border-gray-100 gap-6'>
            <div className='flex items-center space-x-4'>
              <img
                src={getUserAvatar({
                  avatar: typeof poem.authorId.avatar === 'string' ? undefined : poem.authorId.avatar,
                  gender: poem.authorId.gender
                })}
                alt=''
                className='w-16 h-16 rounded-2xl object-cover border-4 border-purple-100 shadow-md'
              />
              <div>
                <p className='font-bold text-2xl text-gray-900'>
                  {poem.authorId.firstName} {poem.authorId.lastName}
                </p>
                <p className='text-purple-600 font-semibold uppercase tracking-widest text-xs'>Yazar</p>
              </div>
            </div>
            {poem.dedicatedTo && (
              <div className='flex items-center space-x-3 bg-rose-50 px-6 py-3 rounded-2xl border border-rose-100'>
                <span className='text-rose-500 font-bold uppercase text-xs'>İthaf:</span>
                <span className='text-rose-700 font-bold text-lg'>{poem.dedicatedTo.firstName} 💕</span>
              </div>
            )}
          </div>

          <div className='mb-12'>
            <div className='flex flex-wrap gap-2 mb-8'>
              {poem.tags?.map(tag => (
                <span
                  key={tag}
                  className='px-4 py-2 bg-purple-100 text-purple-700 rounded-xl text-sm font-bold uppercase tracking-wider'
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className='text-3xl text-gray-800 leading-[3rem] whitespace-pre-wrap italic decoration-rose-200 decoration-wavy'>
              {poem.content}
            </div>
          </div>

          <div
            className={`flex items-center pt-10 border-t border-gray-100 ${isAuthor ? 'justify-between' : 'justify-center'}`}
          >
            <div className='flex items-center space-x-3'>
              {isAuthor && onEdit && onDelete && (
                <>
                  <button
                    onClick={e => onEdit(poem, e)}
                    className='px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition-all flex items-center space-x-2'
                  >
                    <Pen size={18} />
                    <span>Düzenle</span>
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      onDelete(poem._id)
                    }}
                    className='px-8 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-bold transition-all flex items-center space-x-2'
                  >
                    <Trash2 size={18} />
                    <span>Sil</span>
                  </button>
                </>
              )}
              {!isAuthor && (
                <button
                  onClick={onClose}
                  className='px-12 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:shadow-xl transition-all'
                >
                  Kapat
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
