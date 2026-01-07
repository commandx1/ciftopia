'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Feather, Heart, Trash2, Pen, Sparkles, Loader2, Search, BookOpen, ArrowRight } from 'lucide-react'
import { poemsService } from '@/services/poemsService'
import { AuthorStats, Poem } from '@/lib/type'
import { useUserStore } from '@/store/userStore'
import { showCustomToast } from '@/components/ui/CustomToast'
import NewPoemModal from '@/components/couple/NewPoemModal'
import PoemDetailModal from '@/components/couple/PoemDetailModal'
import PoemDeleteModal from '@/components/couple/PoemDeleteModal'
import { getUserAvatar } from '@/lib/utils'
import Image from 'next/image'

export default function PoemsPage() {
  const { subdomain } = useParams()
  const { user } = useUserStore()

  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [poems, setPoems] = useState<Poem[]>([])
  const [stats, setStats] = useState({ total: 0 })
  const [authorList, setAuthorList] = useState<{ id: string; name: string; count: number }[]>([])
  const [filterTag, setFilterTag] = useState('all')
  const [filterAuthor, setFilterAuthor] = useState('all')
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPoem, setEditingPoem] = useState<Poem | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null)

  const fetchPoems = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      try {
        if (append) setLoadingMore(true)
        else setLoading(true)

        const res = await poemsService.getPoems(
          subdomain as string,
          filterTag === 'all' ? undefined : filterTag,
          filterAuthor === 'all' ? undefined : filterAuthor,
          pageNum,
          9
        )
        const updatedPoems = res.data.poems

        if (append) {
          setPoems(prev => [...prev, ...updatedPoems])
        } else {
          setPoems(updatedPoems)
        }

        setHasMore(res.data.hasMore)

        // Update selectedPoem if it's open to keep it in sync
        setSelectedPoem(prev => {
          if (!prev) return null
          return updatedPoems.find(p => p._id === prev._id) || prev
        })

        // Calculate stats and update counts in authorList
        setAuthorList(prevAuthors => {
          // Create a map of current counts for quick lookup
          const countMap = new Map(res.data.authorStats.map((s: AuthorStats) => [s._id, s.count]))

          // If we don't have any authors yet, initialize from stats
          if (prevAuthors.length === 0) {
            return res.data.authorStats.map((stat: AuthorStats) => {
              const poemWithAuthor = updatedPoems.find(p => p.authorId._id === stat._id)
              return {
                id: stat._id,
                name: poemWithAuthor ? poemWithAuthor.authorId.firstName : '...',
                count: stat.count
              }
            })
          }

          // Update counts for existing authors, setting to 0 if not in current stats
          return prevAuthors.map(author => ({
            ...author,
            count: countMap.get(author.id) || 0
          }))
        })

        setStats({ total: res.data.totalCount })
      } catch (err) {
        console.error('Şiirler yüklenirken hata:', err)
        showCustomToast.error('Hata', 'Şiirler yüklenirken bir hata oluştu.')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [subdomain, filterTag, filterAuthor]
  )

  useEffect(() => {
    setPage(1)
    fetchPoems(1, false)
  }, [fetchPoems])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchPoems(nextPage, true)
  }

  const handleEdit = (poem: Poem, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingPoem(poem)
    setIsModalOpen(true)
  }

  const handleSuccess = () => {
    setPage(1)
    fetchPoems(1, false)
    fetchTags()
  }

  const fetchTags = useCallback(async () => {
    try {
      const res = await poemsService.getTags(subdomain as string)
      setAvailableTags(res.data)
    } catch (err) {
      console.error('Etiketler yüklenirken hata:', err)
    }
  }, [subdomain])

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  const handleDelete = async () => {
    if (!deleteConfirmId) return
    setIsDeleting(true)
    try {
      await poemsService.deletePoem(deleteConfirmId)
      showCustomToast.success('Başarılı', 'Şiir silindi.')
      setPoems(prev => prev.filter(p => p._id !== deleteConfirmId))
      setDeleteConfirmId(null)
      if (selectedPoem?._id === deleteConfirmId) setSelectedPoem(null)
    } catch (err) {
      console.error('Şiir silinirken hata:', err)
      showCustomToast.error('Hata', 'Şiir silinirken bir hata oluştu.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className='min-h-screen pt-24 pb-12 bg-gray-50'>
      <main className='max-w-7xl mx-auto px-6 py-8'>
        {/* Page Header Section */}
        <section className='mb-8'>
          <div className='bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-[2.5rem] p-10 border-2 border-purple-100 relative overflow-hidden shadow-sm'>
            <div className='absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-200/20 to-purple-200/20 rounded-full blur-3xl'></div>
            <div className='absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-200/20 to-amber-200/20 rounded-full blur-3xl'></div>

            <div className='relative z-10'>
              <div className='flex flex-col md:flex-row items-center justify-between mb-8 gap-6'>
                <div className='flex items-center space-x-6'>
                  <div className='w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-lg transform hover:rotate-3 transition-transform'>
                    <Feather size={36} className='text-white' />
                  </div>
                  <div>
                    <h1 className='text-5xl font-bold text-gray-900 mb-2'>Şiirlerimiz</h1>
                    <p className='text-gray-600 text-lg'>Birbirimize yazdığımız duygusal dizeler</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingPoem(null)
                    setIsModalOpen(true)
                  }}
                  className='bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-4 rounded-2xl font-bold hover:shadow-xl transition-all hover:scale-105 flex items-center space-x-3 group'
                >
                  <Pen size={20} className='group-hover:rotate-12 transition-transform' />
                  <span className='text-lg'>Şiir Yaz</span>
                  <Sparkles size={18} className='text-yellow-300 animate-pulse' />
                </button>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
                {loading ? (
                  /* Stats Skeletons */
                  [...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className='bg-white/40 backdrop-blur-sm rounded-[2rem] p-6 text-center border border-white/20 shadow-sm animate-pulse'
                    >
                      <div className='w-16 h-10 bg-gray-200 rounded-xl mx-auto mb-2'></div>
                      <div className='w-24 h-4 bg-gray-100 rounded-md mx-auto'></div>
                    </div>
                  ))
                ) : (
                  <>
                    <div
                      onClick={() => setFilterAuthor('all')}
                      className={`cursor-pointer rounded-[2rem] p-6 text-center border transition-all duration-300 ${
                        filterAuthor === 'all'
                          ? 'bg-white border-purple-500 shadow-xl scale-105'
                          : 'bg-white/60 backdrop-blur-sm border-white/50 shadow-sm hover:bg-white/80 hover:shadow-md'
                      }`}
                    >
                      <div className='text-4xl font-bold text-purple-600 mb-1'>{stats.total}</div>
                      <div className='text-sm font-bold text-gray-500 uppercase tracking-wider'>Toplam Şiir</div>
                    </div>

                    {authorList.map((author, index) => (
                      <div
                        key={author.id}
                        onClick={() => setFilterAuthor(author.id)}
                        className={`cursor-pointer rounded-[2rem] p-6 text-center border transition-all duration-300 ${
                          filterAuthor === author.id
                            ? `bg-white border-${index === 0 ? 'pink' : 'rose'}-500 shadow-xl scale-105`
                            : 'bg-white/60 backdrop-blur-sm border-white/50 shadow-sm hover:bg-white/80 hover:shadow-md'
                        }`}
                      >
                        <div className={`text-4xl font-bold ${index === 0 ? 'text-pink-600' : 'text-rose-600'} mb-1`}>
                          {author.count}
                        </div>
                        <div className='text-sm font-bold text-gray-500 uppercase tracking-wider'>{author.name}</div>
                      </div>
                    ))}

                    {/* Eğer henüz yazar yoksa veya 2'den az yazar varsa boş stateleri gösterelim (çift yapısı için) */}
                    {authorList.length < 2 &&
                      Array.from({ length: 2 - authorList.length }).map((_, i) => (
                        <div
                          key={`empty-${i}`}
                          className='bg-white/40 backdrop-blur-sm rounded-[2rem] p-6 text-center border border-white/20 shadow-sm opacity-50 grayscale'
                        >
                          <div className='text-4xl font-bold text-gray-300 mb-1'>0</div>
                          <div className='text-sm font-bold text-gray-400 uppercase tracking-wider'>
                            Henüz Yazılmadı
                          </div>
                        </div>
                      ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className='mb-8'>
          <div className='bg-white rounded-3xl shadow-sm p-6 border border-gray-100 flex flex-wrap items-center justify-between gap-4'>
            <div className='flex items-center space-x-4'>
              <div className='flex items-center space-x-2 text-gray-700 font-bold'>
                <Search size={18} />
                <span>Filtrele:</span>
              </div>
              <div className='flex flex-wrap gap-2'>
                {loading && availableTags.length === 0 ? (
                  /* Tag Skeletons during initial load */
                  [...Array(4)].map((_, i) => (
                    <div key={i} className='w-20 h-9 bg-gray-100 rounded-full animate-pulse'></div>
                  ))
                ) : (
                  <>
                    <button
                      onClick={() => setFilterTag('all')}
                      className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                        filterTag === 'all'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Tümü
                    </button>
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => setFilterTag(tag)}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                          filterTag === tag
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Poems Grid */}
        <section className='mb-12'>
          {loading ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {[...Array(6)].map((_, i) => {
                const bgs = [
                  'from-amber-50 to-orange-50 border-amber-100',
                  'from-rose-50 to-pink-50 border-rose-100',
                  'from-purple-50 to-indigo-50 border-purple-100',
                  'from-blue-50 to-cyan-50 border-blue-100',
                  'from-emerald-50 to-teal-50 border-emerald-100',
                  'from-fuchsia-50 to-pink-50 border-fuchsia-100'
                ]
                const bgClass = bgs[i % bgs.length]
                return (
                  <div
                    key={i}
                    className={`bg-gradient-to-br ${bgClass} rounded-[2.5rem] p-8 border-2 shadow-sm h-[400px] animate-pulse flex flex-col`}
                  >
                    <div className='flex justify-between mb-6'>
                      <div className='flex gap-2'>
                        <div className='w-16 h-6 bg-white/60 rounded-full'></div>
                        <div className='w-12 h-6 bg-white/60 rounded-full'></div>
                      </div>
                      <div className='w-6 h-6 bg-white/40 rounded-full'></div>
                    </div>
                    <div className='w-3/4 h-8 bg-gray-900/10 rounded-xl mb-6'></div>
                    <div className='flex-1 space-y-3'>
                      <div className='w-full h-4 bg-gray-700/10 rounded-lg'></div>
                      <div className='w-5/6 h-4 bg-gray-700/10 rounded-lg'></div>
                      <div className='w-4/6 h-4 bg-gray-700/10 rounded-lg'></div>
                      <div className='w-full h-4 bg-gray-700/10 rounded-lg'></div>
                    </div>
                    <div className='pt-6 border-t border-white/40 flex items-center space-x-3 mt-auto'>
                      <div className='w-10 h-10 rounded-full bg-white/60'></div>
                      <div className='space-y-2'>
                        <div className='w-20 h-3 bg-gray-900/10 rounded-md'></div>
                        <div className='w-16 h-2 bg-gray-500/10 rounded-md'></div>
                      </div>
                    </div>
                    <div className='w-full h-12 bg-white/40 rounded-2xl mt-6'></div>
                  </div>
                )
              })}
            </div>
          ) : poems.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {poems.map((poem, index) => {
                // Determine a background based on index or tag
                const bgs = [
                  'from-amber-50 to-orange-50 border-amber-200',
                  'from-rose-50 to-pink-50 border-rose-200',
                  'from-purple-50 to-indigo-50 border-purple-200',
                  'from-blue-50 to-cyan-50 border-blue-200',
                  'from-emerald-50 to-teal-50 border-emerald-200'
                ]
                const bgClass = bgs[index % bgs.length]
                const accentColor = bgClass.split(' ')[2].replace('border-', '').replace('-200', '')

                return (
                  <article
                    key={poem._id}
                    onClick={() => setSelectedPoem(poem)}
                    className='group cursor-pointer perspective-1000'
                  >
                    <div
                      className={`bg-gradient-to-br ${bgClass} rounded-[2.5rem] p-8 border-2 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-3 relative overflow-hidden h-full flex flex-col`}
                    >
                      <div
                        className={`absolute top-0 right-0 w-32 h-32 bg-${accentColor}-200/30 rounded-full blur-2xl`}
                      ></div>

                      <div className='relative z-10 flex-1 flex flex-col'>
                        <div className='flex items-center justify-between mb-6'>
                          <div className='flex flex-wrap gap-1'>
                            {poem.tags?.map(tag => (
                              <span
                                key={tag}
                                className={`px-3 py-1 bg-${accentColor}-500 bg-opacity-30 text-${accentColor}-800 rounded-full text-[10px] font-bold uppercase tracking-wider`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <Feather className={`text-${accentColor}-400 opacity-50`} size={24} />
                        </div>

                        <h3 className='text-3xl font-bold text-gray-900 mb-6 group-hover:text-purple-700 transition-colors'>
                          {poem.title}
                        </h3>

                        <div className='italic text-lg text-gray-700 leading-relaxed mb-8 line-clamp-4 flex-1'>
                          {poem.content}
                        </div>

                        <div className={`flex items-center justify-between pt-6 border-t border-${accentColor}-200`}>
                          <div className='flex flex-col space-y-3'>
                            {poem.dedicatedTo && (
                              <div className='flex items-center space-x-2'>
                                <span className='text-[10px] font-bold text-gray-500 uppercase tracking-tight'>
                                  Kime:
                                </span>
                                <span className='text-xs font-bold text-rose-600 flex items-center gap-1'>
                                  {typeof poem.dedicatedTo === 'string'
                                    ? poem.dedicatedTo
                                    : poem.dedicatedTo?.firstName}{' '}
                                  <Heart size={10} fill='currentColor' />
                                </span>
                              </div>
                            )}
                            <div className='flex items-center space-x-3'>
                              <div className='relative'>
                                <Image
                                  src={getUserAvatar({
                                    avatar: typeof poem.authorId.avatar === 'string' ? undefined : poem.authorId.avatar,
                                    gender: poem.authorId.gender
                                  })}
                                  alt={poem.authorId.firstName}
                                  width={40}
                                  height={40}
                                  className={`w-10 h-10 rounded-full object-cover border-2 border-${accentColor}-300 shadow-sm`}
                                />
                                <div className='absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm'>
                                  <Feather size={10} className='text-purple-500' />
                                </div>
                              </div>
                              <div>
                                <p className='text-xs font-bold text-gray-900'>{poem.authorId.firstName}</p>
                                <p className='text-[10px] text-gray-500'>
                                  {new Date(poem.createdAt).toLocaleDateString('tr-TR')}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className='flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity self-end pb-1'>
                            {poem.authorId._id === user?._id && (
                              <>
                                <button
                                  onClick={e => handleEdit(poem, e)}
                                  className='w-8 h-8 bg-white/80 rounded-lg flex items-center justify-center text-blue-600 hover:bg-white shadow-sm transition-all'
                                >
                                  <Pen size={14} />
                                </button>
                                <button
                                  onClick={e => {
                                    e.stopPropagation()
                                    setDeleteConfirmId(poem._id)
                                  }}
                                  className='w-8 h-8 bg-white/80 rounded-lg flex items-center justify-center text-red-600 hover:bg-white shadow-sm transition-all'
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        <button
                          className={`w-full mt-6 bg-${accentColor}-500 text-white py-3 rounded-2xl font-bold text-sm hover:brightness-110 transition-all flex items-center justify-center space-x-2 transform group-hover:scale-[1.02]`}
                        >
                          <span>Tamamını Oku</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : filterAuthor !== 'all' || filterTag !== 'all' ? (
            <div className='bg-white rounded-[3rem] p-20 text-center shadow-sm border border-gray-100'>
              <div className='w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6'>
                <Feather className='text-gray-300' size={32} />
              </div>
              <h3 className='text-2xl font-bold text-gray-900 mb-2'>Şiir Bulunamadı</h3>
              <p className='text-gray-500'>Bu filtreye uygun şiir henüz yazılmamış.</p>
              <button
                onClick={() => {
                  setFilterTag('all')
                  setFilterAuthor('all')
                }}
                className='mt-6 text-purple-600 font-bold hover:underline'
              >
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            <div className='bg-white rounded-[3rem] shadow-xl p-20 text-center border-2 border-dashed border-gray-200'>
              <div className='w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-[2.5rem] flex items-center justify-center transform -rotate-6'>
                <Feather size={64} className='text-purple-500' />
              </div>
              <h3 className='text-4xl font-bold text-gray-900 mb-4'>Henüz Şiir Yazılmamış</h3>
              <p className='text-gray-500 text-xl mb-10 max-w-md mx-auto'>
                Sevgilinize duygularınızı ifade eden ilk şiirinizi yazarak hikayenizi başlatın.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className='bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-5 rounded-2xl font-bold text-xl hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center space-x-4'
              >
                <Pen size={24} />
                <span>İlk Şiirinizi Yazın</span>
              </button>
            </div>
          )}

          {hasMore && (
            <div className='mt-16 text-center'>
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className='bg-white text-gray-700 border-2 border-gray-100 px-10 py-4 rounded-full font-bold hover:bg-gray-50 hover:border-purple-200 hover:text-purple-600 transition-all shadow-sm flex items-center space-x-3 mx-auto disabled:opacity-50'
              >
                {loadingMore ? (
                  <Loader2 className='animate-spin' size={24} />
                ) : (
                  <>
                    <span>Daha Fazla Yükle</span>
                    <Sparkles size={18} className='text-yellow-500' />
                  </>
                )}
              </button>
            </div>
          )}
        </section>

        {/* Inspiration Section */}
        <section className='mb-8'>
          <h2 className='text-3xl font-bold text-gray-900 mb-8 flex items-center space-x-4'>
            <Sparkles className='text-yellow-500' />
            <span>İlham Kaynakları</span>
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='bg-gradient-to-br from-amber-50 to-yellow-50 rounded-[2rem] p-8 border-2 border-amber-100 shadow-sm hover:shadow-md transition-all'>
              <div className='w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3'>
                <BookOpen className='text-white' size={28} />
              </div>
              <h3 className='font-bold text-xl text-gray-900 mb-3'>Şiir Yazma İpuçları</h3>
              <p className='text-gray-600 leading-relaxed mb-6'>
                Duygularınızı içten ve samimi bir şekilde ifade edin. Metaforlar ve imgeler kullanarak derinlik katın.
              </p>
              <Link
                href='/poems/tips'
                className='text-amber-600 font-bold flex items-center space-x-2 hover:translate-x-1 transition-transform'
              >
                <span>Daha fazla öğren</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className='bg-gradient-to-br from-rose-50 to-pink-50 rounded-[2rem] p-8 border-2 border-rose-100 shadow-sm hover:shadow-md transition-all'>
              <div className='w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg -rotate-3'>
                <Heart className='text-white' size={28} fill='currentColor' />
              </div>
              <h3 className='font-bold text-xl text-gray-900 mb-3'>Romantik Sözler</h3>
              <p className='text-gray-600 leading-relaxed mb-6'>
                Ünlü şairlerin dizeleriyle duygularınızı pekiştirin. Klasiklerden ilham alarak kendi tarzınızı yaratın.
              </p>
              <Link
                href='/poems/romantic'
                className='text-rose-600 font-bold flex items-center space-x-2 hover:translate-x-1 transition-transform'
              >
                <span>Keşfetmeye başla</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className='bg-gradient-to-br from-purple-50 to-indigo-50 rounded-[2rem] p-8 border-2 border-purple-100 shadow-sm hover:shadow-md transition-all'>
              <div className='w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-6'>
                <Feather className='text-white' size={28} />
              </div>
              <h3 className='font-bold text-xl text-gray-900 mb-3'>Şiir Örnekleri</h3>
              <p className='text-gray-600 leading-relaxed mb-6'>
                Diğer çiftlerin yazdığı şiirlerden ilham alın. Paylaşılan duygularla kendi bağınızı güçlendirin.
              </p>
              <Link
                href={`/poems/examples`}
                className='text-purple-600 font-bold flex items-center space-x-2 hover:translate-x-1 transition-transform'
              >
                <span>Örnekleri gör</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Detail Modal */}
      <PoemDetailModal
        poem={selectedPoem}
        onClose={() => setSelectedPoem(null)}
        onEdit={handleEdit}
        onDelete={id => setDeleteConfirmId(id)}
        currentUser={user}
      />

      {/* Delete Confirmation Modal */}
      <PoemDeleteModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
      />

      {/* New Poem Modal */}
      <NewPoemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingPoem(null)
        }}
        onSuccess={handleSuccess}
        editingPoem={editingPoem}
      />
    </div>
  )
}
