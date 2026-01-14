'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { 
  StickyNote, 
  Plus, 
  Trash2, 
  Loader2, 
  X, 
  Heart,
  Pin,
  Pen
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import { notesService } from '@/services/notesService'
import { Note } from '@/lib/type'
import { useUserStore } from '@/store/userStore'
import { showCustomToast } from '@/components/ui/CustomToast'

const NOTE_COLORS = {
  yellow: { bg: 'bg-yellow-100', border: 'border-yellow-200', text: 'text-yellow-800', corner: 'border-r-[#f59e0b]', pin: 'text-red-500' },
  pink: { bg: 'bg-pink-100', border: 'border-pink-200', text: 'text-pink-800', corner: 'border-r-[#ec4899]', pin: 'text-blue-500' },
  blue: { bg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-800', corner: 'border-r-[#3b82f6]', pin: 'text-green-500' },
  green: { bg: 'bg-green-100', border: 'border-green-200', text: 'text-green-800', corner: 'border-r-[#10b981]', pin: 'text-purple-500' },
  purple: { bg: 'bg-purple-100', border: 'border-purple-200', text: 'text-purple-800', corner: 'border-r-[#a855f7]', pin: 'text-yellow-500' },
  orange: { bg: 'bg-orange-100', border: 'border-orange-200', text: 'text-orange-800', corner: 'border-r-[#f97316]', pin: 'text-indigo-500' },
}

export default function NotesPage() {
  const { subdomain } = useParams()
  const { user } = useUserStore()
  const boardRef = useRef<HTMLDivElement>(null)
  
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState<Note[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  
  // New note form state
  const [newContent, setNewContent] = useState('')
  const [selectedColor, setSelectedColor] = useState<keyof typeof NOTE_COLORS>('yellow')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true)
      const res = await notesService.getNotes(subdomain as string)
      setNotes(res.data)
    } catch (err) {
      console.error('Notlar yüklenirken hata:', err)
      showCustomToast.error('Hata', 'Notlar yüklenirken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }, [subdomain])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  useEffect(() => {
    if (editingNote) {
      setNewContent(editingNote.content)
      setSelectedColor(editingNote.color as keyof typeof NOTE_COLORS)
      setIsModalOpen(true)
    } else {
      setNewContent('')
      setSelectedColor('yellow')
    }
  }, [editingNote])

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContent.trim()) return
    
    setIsSubmitting(true)
    try {
      if (editingNote) {
        const res = await notesService.updateNote(editingNote._id, {
          content: newContent,
          color: selectedColor
        })
        setNotes(prev => prev.map(n => n._id === editingNote._id ? res.data : n))
        showCustomToast.success('Başarılı', 'Not güncellendi! ✨')
      } else {
        const res = await notesService.createNote({
          content: newContent,
          color: selectedColor
        })
        setNotes(prev => [res.data, ...prev])
        showCustomToast.success('Başarılı', 'Notunuz mantar panoya eklendi! 📌')
      }
      
      setNewContent('')
      setEditingNote(null)
      setIsModalOpen(false)
    } catch (err) {
      console.error('Not kaydedilirken hata:', err)
      showCustomToast.error('Hata', 'Not kaydedilirken bir hata oluştu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingNote(note)
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await notesService.deleteNote(id)
      setNotes(prev => prev.filter(n => n._id !== id))
      if (selectedNote?._id === id) setSelectedNote(null)
      showCustomToast.success('Başarılı', 'Not silindi.')
    } catch (err) {
      console.error('Not silinirken hata:', err)
      showCustomToast.error('Hata', 'Not silinirken bir hata oluştu.')
    }
  }

  const handleMarkAsRead = async (note: Note) => {
    if (note.isRead || !user || note.authorId._id === user._id) return
    try {
      await notesService.markAsRead(note._id)
      setNotes(prev => prev.map(n => n._id === note._id ? { ...n, isRead: true } : n))
    } catch (err) {
      console.error('Not okunmadı olarak işaretlenirken hata:', err)
    }
  }

  return (
    <div className='min-h-screen pt-24 pb-12 bg-gray-50'>
      <main className='max-w-7xl mx-auto px-6 py-8'>
        
        {/* Header */}
        <div className='flex flex-col md:flex-row items-center justify-between mb-10 gap-6'>
          <div className='flex items-center space-x-6'>
            <div className='w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-3xl flex items-center justify-center shadow-lg transform rotate-3'>
              <StickyNote size={40} className='text-white' />
            </div>
            <div>
              <h1 className='text-5xl font-bold text-gray-900 mb-2'>Notlarımız</h1>
              <p className='text-gray-600 text-lg'>Birbirimize bıraktığımız sevgi notları</p>
            </div>
          </div>
          
          <div className='flex items-center space-x-6'>
             <div className='flex flex-col items-end'>
                <div className='bg-white rounded-2xl px-6 py-3 shadow-sm border border-gray-100 flex items-center space-x-4'>
                    {loading ? (
                      /* Stats Skeletons */
                      <>
                        <div className='text-center border-r border-gray-100 pr-4 animate-pulse'>
                          <div className='w-8 h-3 bg-gray-100 rounded mb-1 mx-auto'></div>
                          <div className='w-6 h-6 bg-gray-200 rounded mx-auto'></div>
                        </div>
                        <div className='text-center pl-2 animate-pulse'>
                          <div className='w-8 h-3 bg-gray-100 rounded mb-1 mx-auto'></div>
                          <div className='w-6 h-6 bg-gray-200 rounded mx-auto'></div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className='text-center border-r border-gray-100 pr-4'>
                            <span className='block text-xs font-bold text-gray-400 uppercase tracking-widest'>Toplam</span>
                            <span className='text-2xl font-bold text-gray-900'>{notes.length}</span>
                        </div>
                        <div className='text-center pl-2'>
                            <span className='block text-xs font-bold text-gray-400 uppercase tracking-widest'>Yeni</span>
                            <span className='text-2xl font-bold text-rose-500'>{notes.filter(n => !n.isRead && n.authorId._id !== user?._id).length}</span>
                        </div>
                      </>
                    )}
                </div>
             </div>
             
             <button 
                onClick={() => {
                  setEditingNote(null)
                  setIsModalOpen(true)
                }}
                className='bg-gradient-to-r from-[#E91E63] to-[#FF6B6B] text-white px-10 py-5 rounded-[2rem] font-bold shadow-xl hover:shadow-rose-200 transition-all hover:scale-105 flex items-center space-x-4 group'
              >
                <Plus size={24} className='group-hover:rotate-90 transition-transform' />
                <span className='text-xl'>Not Bırak</span>
              </button>
          </div>
        </div>

        {/* Cork Board */}
        <div 
          ref={boardRef}
          className='relative w-full min-h-[800px] rounded-[3rem] shadow-2xl overflow-hidden cork-texture p-12 lg:p-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16 items-start auto-rows-max'
        >
          {/* Corkboard decorations */}
          <div className='absolute top-10 left-10 w-4 h-4 bg-gray-800/80 rounded-full shadow-lg'></div>
          <div className='absolute top-10 right-10 w-4 h-4 bg-gray-800/80 rounded-full shadow-lg'></div>
          <div className='absolute bottom-10 left-10 w-4 h-4 bg-gray-800/80 rounded-full shadow-lg'></div>
          <div className='absolute bottom-10 right-10 w-4 h-4 bg-gray-800/80 rounded-full shadow-lg'></div>

          {loading ? (
            /* Note Skeletons */
            [...Array(6)].map((_, i) => (
              <div 
                key={`skeleton-${i}`}
                className='bg-white/10 backdrop-blur-sm p-8 rounded-lg shadow-xl relative w-full aspect-square flex flex-col animate-pulse'
                style={{
                  transform: `rotate(${((i * 7) % 10) - 5}deg) translate(${((i * 13) % 20) - 10}px, ${((i * 17) % 20) - 10}px)`
                }}
              >
                <div className='absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                  <div className='w-8 h-8 bg-white/20 rounded-full'></div>
                </div>
                <div className='mt-8 space-y-3 flex-1'>
                  <div className='h-4 bg-white/20 rounded w-full'></div>
                  <div className='h-4 bg-white/20 rounded w-5/6'></div>
                  <div className='h-4 bg-white/20 rounded w-4/6'></div>
                </div>
                <div className='flex items-center justify-between pt-4 border-t border-white/10 mt-auto'>
                  <div className='flex items-center space-x-2'>
                    <div className='w-8 h-8 rounded-full bg-white/20'></div>
                    <div className='w-16 h-3 bg-white/10 rounded'></div>
                  </div>
                  <div className='w-12 h-2 bg-white/10 rounded'></div>
                </div>
              </div>
            ))
          ) : notes.length > 0 ? (
            notes.map((note, index) => {
              const colorCfg = NOTE_COLORS[note.color as keyof typeof NOTE_COLORS] || NOTE_COLORS.yellow
              
              // Daha doğal bir görünüm için indekse dayalı varyasyonlar
              const rotation = ((index * 7) % 10) - 5 // -5 ile +5 derece arası
              const offsetX = ((index * 13) % 20) - 10 // -10px ile +10px arası yatay kayma
              const offsetY = ((index * 17) % 20) - 10 // -10px ile +10px arası dikey kayma
              
              const isNew = !note.isRead && note.authorId._id !== user?._id

              return (
                <div 
                  key={note._id}
                  onClick={() => {
                    setSelectedNote(note)
                    handleMarkAsRead(note)
                  }}
                  className={`${colorCfg.bg} p-8 rounded-lg shadow-xl cursor-pointer hover:shadow-2xl hover:-translate-y-4 hover:rotate-0 transition-all duration-300 group relative w-full aspect-square flex flex-col`}
                  style={{
                    transform: `rotate(${rotation}deg) translate(${offsetX}px, ${offsetY}px)`,
                    zIndex: index % 5 // Hafif derinlik hissi için
                  }}
                >
                  {/* Corner Fold */}
                  <div className={`absolute top-0 right-0 w-0 h-0 border-solid border-t-0 border-b-[40px] border-b-transparent border-r-[40px] ${colorCfg.corner} filter brightness-90`}></div>
                  
                  {/* Pin */}
                  <div className='absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pin-shadow z-10'>
                    <Pin size={32} className={`${colorCfg.pin} fill-current rotate-45`} />
                  </div>

                  {/* New Badge */}
                  {isNew && (
                    <div className='absolute -top-3 -right-3 bg-rose-500 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-lg animate-bounce z-20'>
                      Yeni
                    </div>
                  )}

                  <div className='mt-4 mb-6 flex-1 flex items-center justify-center text-center px-2'>
                    <p className='font-handwriting text-2xl text-gray-800 leading-snug line-clamp-6'>
                      {note.content}
                    </p>
                  </div>

                  <div className={`flex items-center justify-between pt-4 border-t ${colorCfg.border} mt-auto`}>
                    <div className='flex items-center space-x-2'>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-inner ${note.authorId.gender === 'female' ? 'bg-pink-200 text-pink-700' : 'bg-blue-200 text-blue-700'}`}>
                        {note.authorId.firstName[0]}
                      </div>
                      <span className='text-xs font-bold text-gray-600'>{note.authorId.firstName}</span>
                    </div>
                    <span className='text-[10px] text-gray-500 font-medium'>
                      {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: tr })}
                    </span>
                  </div>
                </div>
              )
            })
          ) : (
            <div className='flex flex-col items-center justify-center h-full pt-40 col-span-full'>
              <div className='w-32 h-32 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center mb-8 border border-white/30 transform -rotate-12'>
                <StickyNote size={64} className='text-white' />
              </div>
              <h3 className='text-3xl font-bold text-white mb-4 drop-shadow-md'>Panoda Henüz Not Yok</h3>
              <p className='text-white/80 text-xl font-medium mb-10 drop-shadow-sm'>Sevgilinize günün ilk notunu bırakın!</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className='bg-white text-rose-500 px-12 py-5 rounded-[2rem] font-bold text-xl shadow-2xl hover:scale-105 transition-transform'
              >
                Hemen Bir Not Yaz
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Add Note Modal */}
      {isModalOpen && (
        <div className='fixed inset-0 z-[150] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300'>
          <div className='bg-white rounded-[3rem] shadow-2xl w-full max-w-xl p-10 animate-in zoom-in-95 duration-300 relative'>
            <button 
              onClick={() => {
                setIsModalOpen(false)
                setEditingNote(null)
              }}
              className='absolute top-8 right-8 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all'
            >
              <X size={24} className='text-gray-500' />
            </button>

            <h2 className='text-4xl font-bold text-gray-900 mb-8'>
              {editingNote ? 'Notu Düzenle' : 'Yeni Not Bırak'}
            </h2>
            
            <form onSubmit={handleAddNote}>
              <div className='mb-8'>
                <label className='block text-sm font-bold text-gray-700 mb-4 ml-1'>Not Rengi Seç</label>
                <div className='flex flex-wrap gap-4'>
                  {(Object.keys(NOTE_COLORS) as Array<keyof typeof NOTE_COLORS>).map(color => (
                    <button
                      key={color}
                      type='button'
                      onClick={() => setSelectedColor(color)}
                      className={`w-14 h-14 rounded-2xl border-4 transition-all transform hover:scale-110 ${NOTE_COLORS[color].bg} ${
                        selectedColor === color ? 'border-rose-500 shadow-lg scale-110' : 'border-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className='mb-8'>
                <label className='block text-sm font-bold text-gray-700 mb-4 ml-1'>Mesajın</label>
                <textarea 
                  value={newContent}
                  onChange={e => setNewContent(e.target.value.slice(0, 200))}
                  className={`w-full px-8 py-6 rounded-[2rem] font-handwriting text-3xl text-gray-800 focus:outline-none border-2 transition-all min-h-[200px] resize-none ${NOTE_COLORS[selectedColor].bg} border-transparent focus:border-rose-300`}
                  placeholder='Sevgiline bir mesaj yaz...'
                  required
                />
                <div className='flex justify-between items-center mt-3 px-2'>
                    <p className='text-sm text-gray-400 font-medium'>Maksimum 200 karakter</p>
                    <p className={`text-sm font-bold ${newContent.length >= 200 ? 'text-red-500' : 'text-gray-400'}`}>
                        {newContent.length}/200
                    </p>
                </div>
              </div>
              
              <div className='flex space-x-4'>
                <button 
                  type='button'
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingNote(null)
                  }}
                  className='flex-1 py-5 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all'
                >
                  İptal
                </button>
                <button 
                  type='submit'
                  disabled={isSubmitting || !newContent.trim()}
                  className='flex-[2] bg-gradient-to-r from-rose-500 to-pink-600 text-white py-5 rounded-2xl font-bold shadow-xl hover:shadow-rose-200 transition-all hover:scale-[1.02] flex items-center justify-center space-x-3 disabled:opacity-50'
                >
                  {isSubmitting ? (
                    <Loader2 size={24} className='animate-spin' />
                  ) : (
                    <>
                      <span>{editingNote ? 'Güncelle' : 'Notu Bırak'}</span>
                      <Heart size={20} fill='white' />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Note Detail Modal */}
      {selectedNote && (
        <div 
          className='fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300'
          onClick={() => setSelectedNote(null)}
        >
          <div 
            className={`${NOTE_COLORS[selectedNote.color as keyof typeof NOTE_COLORS].bg} rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] max-w-2xl w-full p-16 animate-in zoom-in-95 duration-300 relative transform -rotate-1`}
            onClick={e => e.stopPropagation()}
          >
            {/* Corner Fold */}
            <div className={`absolute top-0 right-0 w-0 h-0 border-solid border-t-0 border-b-[60px] border-b-transparent border-r-[60px] ${NOTE_COLORS[selectedNote.color as keyof typeof NOTE_COLORS].corner} filter brightness-90`}></div>
            
            <button 
              onClick={() => setSelectedNote(null)}
              className='absolute top-10 right-10 w-12 h-12 bg-white/50 rounded-full flex items-center justify-center hover:bg-white transition-all z-20'
            >
              <X size={24} className='text-gray-700' />
            </button>
            
            <div className='absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 drop-shadow-2xl z-20'>
              <Pin size={64} className={`${NOTE_COLORS[selectedNote.color as keyof typeof NOTE_COLORS].pin} fill-current rotate-45`} />
            </div>
            
            <div className='mt-8 mb-12'>
              <p className='font-handwriting text-5xl text-gray-800 leading-[1.3] text-center'>
                {selectedNote.content}
              </p>
            </div>
            
            <div className={`flex flex-col sm:flex-row items-center justify-between pt-10 border-t-4 border-dashed ${NOTE_COLORS[selectedNote.color as keyof typeof NOTE_COLORS].border}`}>
              <div className='flex items-center space-x-5 mb-6 sm:mb-0'>
                <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-4xl font-bold shadow-xl ${selectedNote.authorId.gender === 'female' ? 'bg-pink-200 text-pink-700' : 'bg-blue-200 text-blue-700'}`}>
                  {selectedNote.authorId.firstName[0]}
                </div>
                <div>
                  <p className='font-bold text-3xl text-gray-900'>{selectedNote.authorId.firstName}</p>
                  <p className='text-gray-500 font-bold uppercase tracking-widest text-xs mt-1'>
                    {formatDistanceToNow(new Date(selectedNote.createdAt), { addSuffix: true, locale: tr })}
                  </p>
                </div>
              </div>
              
              <div className='flex space-x-4'>
                {selectedNote.authorId._id === user?._id && (
                  <>
                    <button 
                      onClick={(e) => {
                        handleEdit(selectedNote, e)
                        setSelectedNote(null)
                      }}
                      className='w-16 h-16 bg-white/80 rounded-2xl flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-lg hover:scale-110 active:scale-95'
                    >
                      <Pen size={32} />
                    </button>
                    <button 
                        onClick={(e) => {
                            handleDelete(selectedNote._id, e)
                            setSelectedNote(null)
                        }}
                        className='w-16 h-16 bg-white/80 rounded-2xl flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg hover:scale-110 active:scale-95'
                    >
                      <Trash2 size={32} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS and Cork Texture Style */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .cork-texture {
          background-color: #D4A574;
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(139, 90, 43, 0.15) 2px, transparent 2px),
            radial-gradient(circle at 60% 70%, rgba(139, 90, 43, 0.15) 2px, transparent 2px),
            radial-gradient(circle at 80% 20%, rgba(139, 90, 43, 0.15) 2px, transparent 2px),
            radial-gradient(circle at 40% 80%, rgba(139, 90, 43, 0.15) 2px, transparent 2px);
          background-size: 150px 150px;
          border: 16px solid #8B5A2B;
          box-shadow: inset 0 0 100px rgba(0,0,0,0.3), 0 20px 50px rgba(0,0,0,0.2);
        }
        .pin-shadow {
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  )
}

