'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Heart,
  Feather,
  Loader2,
  ArrowRight,
  Sparkles,
  ChevronRight,
  BookOpen
} from 'lucide-react'
import { poemsService } from '@/services/poemsService'
import { Poem } from '@/lib/type'
import { getUserAvatar } from '@/lib/utils'
import PoemDetailModal from '@/components/couple/PoemDetailModal'
import Image from 'next/image'

export default function PoemExamplesPage() {
  const [poems, setPoems] = useState<Poem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null)

  const fetchPublicPoems = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      if (append) setLoadingMore(true)
      else setLoading(true)

      const res = await poemsService.getPublicPoems(pageNum, 9)

      if (append) {
        setPoems(prev => [...prev, ...res.data.poems])
      } else {
        setPoems(res.data.poems)
      }

      setTotalCount(res.data.totalCount)
      setHasMore(res.data.hasMore)
    } catch (err) {
      console.error('Genel şiirler yüklenirken hata:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    fetchPublicPoems(1)
  }, [fetchPublicPoems])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchPublicPoems(nextPage, true)
  }

  const getBgClass = (index: number) => {
    const classes = [
      'from-amber-50 to-orange-50 border-amber-200',
      'from-rose-50 to-pink-50 border-rose-200',
      'from-purple-50 to-indigo-50 border-purple-200',
      'from-blue-50 to-cyan-50 border-blue-200',
      'from-emerald-50 to-teal-50 border-emerald-200',
      'from-fuchsia-50 to-pink-50 border-fuchsia-200'
    ]
    return classes[index % classes.length]
  }

  const getAccentColor = (index: number) => {
    const colors = ['amber', 'rose', 'purple', 'blue', 'emerald', 'fuchsia']
    return colors[index % colors.length]
  }

  return (
    <div className='min-h-screen pt-24 pb-12 bg-gray-50'>
      <main className='max-w-7xl mx-auto px-6 py-8'>
        {/* Header Section */}
        <section className='mb-12'>
          <div className='bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 rounded-[2.5rem] p-12 text-white relative overflow-hidden shadow-2xl'>
            <div className='relative z-10 flex flex-col md:flex-row items-center justify-between gap-8'>
              <div className='text-center md:text-left'>
                <div className='flex items-center justify-center md:justify-start space-x-4 mb-6'>
                  <div className='w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30'>
                    <Feather size={32} />
                  </div>
                  <h1 className='text-5xl font-bold'>Şiir Örnekleri</h1>
                </div>
                <p className='text-xl text-white/90 max-w-2xl leading-relaxed'>
                  Diğer çiftlerin paylaştığı en güzel ve en içten duygular. Kendi dizeleriniz için ilham alın.
                </p>
              </div>

              <div className='flex gap-4'>
                <div className='bg-white/20 backdrop-blur-md px-8 py-4 rounded-3xl border border-white/30 text-center'>
                  <p className='text-3xl font-bold'>{totalCount}</p>
                  <p className='text-sm text-white/80 font-medium uppercase tracking-wider'>Paylaşılan Şiir</p>
                </div>
              </div>
            </div>

            <div className='mt-12 flex items-center justify-center md:justify-start'>
              <Link
                href='/poems'
                className='flex items-center space-x-2 text-white/80 hover:text-white transition-colors group'
              >
                <ArrowLeft size={20} className='group-hover:-translate-x-1 transition-transform' />
                <span className='font-bold'>Şiirlerime Dön</span>
              </Link>
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
                  <div key={i} className={`bg-gradient-to-br ${bgClass} rounded-[2.5rem] p-8 border-2 shadow-sm h-[400px] animate-pulse flex flex-col`}>
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
          ) : poems.length === 0 ? (
            <div className='bg-white rounded-[3rem] p-24 text-center shadow-sm border-2 border-dashed border-gray-100'>
              <div className='w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8'>
                <BookOpen className='text-gray-300' size={48} />
              </div>
              <h2 className='text-3xl font-bold text-gray-900 mb-4'>Henüz Örnek Şiir Yok</h2>
              <p className='text-gray-500 text-lg mb-10 max-w-md mx-auto'>
                Siz de şiirlerinizi herkese açık yaparak burada görünmesini sağlayabilirsiniz!
              </p>
              <Link
                href='/poems'
                className='bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-4 rounded-full font-bold hover:shadow-xl transition-all inline-flex items-center space-x-2'
              >
                <span>Şiir Yazmaya Başla</span>
                <ChevronRight size={20} />
              </Link>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {poems.map((poem, index) => {
                const bgClass = getBgClass(index)
                const accentColor = getAccentColor(index)

                return (
                  <article
                    key={poem._id}
                    onClick={() => setSelectedPoem(poem)}
                    className='group cursor-pointer perspective-1000'
                  >
                    <div
                      className={`bg-gradient-to-br ${bgClass} rounded-[2.5rem] p-8 border-2 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-3 relative overflow-hidden h-full flex flex-col`}
                    >
                      <div className='relative z-10 flex-1 flex flex-col'>
                        <div className='flex items-center justify-between mb-6'>
                          <div className='flex flex-wrap gap-2'>
                            {poem.tags?.slice(0, 2).map(tag => (
                              <span
                                key={tag}
                                className={`px-4 py-1.5 bg-${accentColor}-500 bg-opacity-30 text-${accentColor}-800 rounded-full text-[10px] font-black uppercase tracking-widest`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <Feather size={20} className={`text-${accentColor}-500 opacity-50`} />
                        </div>

                        <h3 className='text-2xl font-black text-gray-900 mb-4 line-clamp-1 group-hover:text-rose-600 transition-colors'>
                          {poem.title}
                        </h3>

                        <div className='text-gray-700 text-lg italic leading-relaxed mb-8 line-clamp-3 font-medium flex-1'>
                          &quot;{poem.content}&quot;
                        </div>

                        <div className={`flex items-center justify-between pt-6 border-t border-${accentColor}-200`}>
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
                                <Heart size={10} className='text-rose-500' fill='currentColor' />
                              </div>
                            </div>
                            <div>
                              <p className='text-xs font-bold text-gray-900'>{poem.authorId.firstName}</p>
                              <p className='text-[10px] text-gray-500'>
                                {new Date(poem.createdAt).toLocaleDateString('tr-TR')}
                              </p>
                            </div>
                          </div>

                          <div
                            className={`w-8 h-8 rounded-full bg-white/60 flex items-center justify-center text-${accentColor}-600 group-hover:bg-white transition-all`}
                          >
                            <ArrowRight size={14} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
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
      </main>

      {/* Detail Modal */}
      <PoemDetailModal
        poem={selectedPoem}
        onClose={() => setSelectedPoem(null)}
      />
    </div>
  )
}
