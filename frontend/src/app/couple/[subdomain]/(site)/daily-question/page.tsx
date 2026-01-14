'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Clock, Send, Sparkles, CheckCircle2, Share2, Download } from 'lucide-react'
import { dailyQuestionService } from '@/services/api'
import { DailyQuestion, QuestionAnswer, User } from '@/lib/type'
import { showCustomToast } from '@/components/ui/CustomToast'
import Image from 'next/image'
import { getUserAvatar } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import { useUserStore } from '@/store/userStore'
import { AxiosError } from 'axios'

export default function DailyQuestionPage() {
  const { user } = useUserStore()
  const [data, setData] = useState<{
    question: (DailyQuestion & { coupleId: { partner1: User; partner2: User } }) | null
    userAnswer: QuestionAnswer | null
    partnerAnswered: boolean
    partnerAnswer: string | null
  }>({
    question: null,
    userAnswer: null,
    partnerAnswered: false,
    partnerAnswer: null
  })
  const [answer, setAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [questionRes] = await Promise.all([
        dailyQuestionService.getTodaysQuestion(),
        dailyQuestionService.getStats()
      ])
      setData(questionRes.data)
      if (questionRes.data.userAnswer) {
        setAnswer(questionRes.data.userAnswer.answer)
      }
    } catch (err: unknown) {
      console.error(err)
      const errorTyped = err as AxiosError<{ message: string }>
      const errorMessage = errorTyped.response?.data?.message || 'Veriler yüklenirken bir hata oluştu.'
      setError(errorMessage)
      showCustomToast.error('Hata', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async () => {
    if (!answer.trim() || !data.question) return

    try {
      setIsSubmitting(true)
      const res = await dailyQuestionService.answerQuestion({
        questionId: data.question._id,
        answer: answer.trim()
      })
      setData(res.data)
      showCustomToast.success('Başarılı', 'Cevabın kaydedildi! 💕')
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>
      showCustomToast.error('Hata', err.response?.data?.message || 'Cevap gönderilirken bir hata oluştu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    showCustomToast.success('Paylaş', 'Sayfa bağlantısı kopyalandı! 🚀')
  }

  const handleDownloadPDF = async () => {
    try {
      showCustomToast.info('PDF', 'PDF hazırlanıyor...')
      const response = await dailyQuestionService.downloadPdf()

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Gunun-Sorusu-${new Date().toISOString().split('T')[0]}.pdf`)
      document.body.appendChild(link)
      link.click()

      // Cleanup
      link.remove()
      window.URL.revokeObjectURL(url)

      showCustomToast.success('Başarılı', 'PDF indirildi! 📄')
    } catch (error: unknown) {
      console.error('PDF Error:', error)
      let message = 'PDF indirilirken bir hata oluştu.'

      const err = error as AxiosError<{ message: string }>
      // Eğer response bir Blob ise (hata mesajı JSON olarak blob içinde gelir)
      if (err.response?.data instanceof Blob) {
        try {
          const text = await (err.response.data as Blob).text()
          const errorData = JSON.parse(text)
          message = errorData.message || message
        } catch {
          // JSON parse edilemezse varsayılan mesaj kalır
        }
      } else if (err.response?.data?.message) {
        message = err.response.data.message
      }

      showCustomToast.error('Hata', message)
    }
  }

  if (isLoading) {
    return (
      <div className='min-h-screen pt-32 pb-20 px-6 flex items-center justify-center'>
        <div className='w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin' />
      </div>
    )
  }

  if (!data.question) {
    return (
      <div className='min-h-screen pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center'>
        <div className='w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6'>
          {error?.includes('profil') ? (
            <Image src='/favicon/favicon.svg' alt='Ciftopia Logo' width={64} height={64} />
          ) : (
            <Clock className='text-rose-500' size={40} />
          )}
        </div>
        <h1 className='text-2xl font-bold text-gray-900 mb-2'>
          {error?.includes('profil') ? 'Profil Eksik' : 'Bugünün sorusu henüz hazırlanmadı'}
        </h1>
        <p className='text-gray-500 max-w-md mx-auto'>{error || 'Lütfen daha sonra tekrar kontrol edin.'}</p>
      </div>
    )
  }

  const { partner1, partner2 } = data.question.coupleId
  const bothAnswered = !!data.userAnswer && data.partnerAnswered
  const partnerAnsweredOnly = !data.userAnswer && data.partnerAnswered

  const isPartner1 = user?._id === partner1._id
  const partnerUser = isPartner1 ? partner2 : partner1

  return (
    <div className='min-h-screen pt-32 pb-20 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50'>
      <div className='max-w-7xl mx-auto px-6'>
        {/* Header */}
        <div className='text-center mb-16'>
          <h1 className='text-5xl font-bold text-gray-900 mb-4'>Etkileşimli Özellikler</h1>
          <p className='text-gray-600 text-xl italic'>Birlikte keşfedin, birlikte eğlenin</p>
        </div>

        {/* Main Widget Area */}
        <div className='max-w-4xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-2 transition-all duration-500 ${
              bothAnswered ? 'border-green-100' : partnerAnsweredOnly ? 'border-amber-100' : 'border-rose-100'
            }`}
          >
            {/* Widget Header */}
            <div
              className={`px-8 py-6 flex items-center justify-between bg-gradient-to-r ${
                bothAnswered
                  ? 'from-green-500 to-emerald-500'
                  : partnerAnsweredOnly
                    ? 'from-amber-500 to-orange-500'
                    : 'from-rose-500 to-pink-500'
              }`}
            >
              <h3 className='font-bold text-2xl text-white flex items-center gap-3'>
                <span>Günün Sorusu</span>
                <span className='text-3xl'>{data.question.emoji}</span>
              </h3>
              <div className='bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2'>
                {bothAnswered ? (
                  <>
                    <CheckCircle2 size={16} className='text-white' />
                    <span className='text-white text-sm font-semibold'>Tamamlandı</span>
                  </>
                ) : (
                  <span className='text-white text-sm font-semibold'>Durum: Bekliyor</span>
                )}
              </div>
            </div>

            <div className='p-8 md:p-12'>
              {/* Question Text */}
              <div
                className={`rounded-[2rem] p-8 mb-10 text-center bg-gradient-to-br ${
                  bothAnswered
                    ? 'from-green-50 to-emerald-50'
                    : partnerAnsweredOnly
                      ? 'from-amber-50 to-orange-50'
                      : 'from-rose-50 to-pink-50'
                }`}
              >
                <p className='text-3xl md:text-4xl text-gray-800 leading-tight italic'>&quot;{data.question.question}&quot;</p>
              </div>

              {/* Status Message for Partner Answered */}
              {partnerAnsweredOnly && (
                <div className='bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl p-6 mb-10 border-2 border-amber-200 flex items-start gap-4'>
                  <div className='w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0'>
                    <Clock className='text-amber-600' size={24} />
                  </div>
                  <div>
                    <span className='font-bold text-gray-900 text-lg block mb-1'>Partnerin cevapladı, sıra sende!</span>
                    <p className='text-gray-700 leading-relaxed'>
                      Partnerin bu soruyu cevapladı. Sen de cevapladığında her ikinizin de cevaplarını görebileceksiniz.
                    </p>
                  </div>
                </div>
              )}

              {/* Status Message for Both Answered */}
              {bothAnswered && (
                <div className='bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-6 mb-10 border-2 border-green-200 flex items-start gap-4'>
                  <div className='w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0'>
                    <Sparkles className='text-green-600' size={24} />
                  </div>
                  <div>
                    <span className='font-bold text-gray-900 text-lg block mb-1'>Harika! İkiniz de cevapladınız</span>
                    <p className='text-gray-700 leading-relaxed'>
                      Birbirinizin cevaplarını görebilirsiniz. Belki bu konuda konuşmak istersiniz?
                    </p>
                  </div>
                </div>
              )}

              {/* Answers Grid */}
              <div className={`grid grid-cols-1 ${bothAnswered ? 'md:grid-cols-2' : ''} gap-8 mb-10`}>
                {/* My Answer */}
                <div className='space-y-4'>
                  <div className='flex items-center gap-3'>
                    <div className='relative w-10 h-10 rounded-full overflow-hidden border-2 border-rose-200'>
                      <Image src={getUserAvatar(user || undefined)} alt='Ben' fill className='object-cover' />
                    </div>
                    <span className='font-bold text-gray-900'>Senin Cevabın</span>
                  </div>

                  {data.userAnswer ? (
                    <div className='bg-gray-50 rounded-3xl p-6 border-2 border-gray-100 min-h-[150px] shadow-inner'>
                      <p className='text-gray-800 text-lg leading-relaxed italic'>&quot;{data.userAnswer.answer}&quot;</p>
                      <p className='text-xs text-gray-400 mt-4 text-right'>
                        {formatDistanceToNow(new Date(data.userAnswer.answeredAt), { addSuffix: true, locale: tr })}
                      </p>
                    </div>
                  ) : (
                    <div className='relative group'>
                      <textarea
                        value={answer}
                        onChange={e => setAnswer(e.target.value)}
                        placeholder='Düşüncelerini buraya yaz...'
                        className='w-full bg-gray-50 border-2 border-gray-200 rounded-[2rem] p-6 text-gray-800 placeholder-gray-400 focus:border-rose-400 focus:bg-white focus:outline-none resize-none transition-all min-h-[180px] text-lg shadow-inner'
                      />
                      <button
                        onClick={handleSubmit}
                        disabled={!answer.trim() || isSubmitting}
                        className='absolute bottom-4 right-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        {isSubmitting ? (
                          <div className='w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                        ) : (
                          <Send size={24} />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Partner Answer */}
                {(bothAnswered || !data.userAnswer || partnerAnsweredOnly) && (
                  <div className='space-y-4'>
                    <div className='flex items-center gap-3'>
                      <div className='relative w-10 h-10 rounded-full overflow-hidden border-2 border-pink-200'>
                        <Image src={getUserAvatar(partnerUser)} alt='Partner' fill className='object-cover' />
                      </div>
                      <span className='font-bold text-gray-900'>Partnerinin Cevabı</span>
                    </div>

                    {bothAnswered ? (
                      <div className='bg-rose-50/50 rounded-3xl p-6 border-2 border-rose-100 min-h-[150px] shadow-inner'>
                        <p className='text-gray-800 text-lg leading-relaxed italic'>&quot;{data.partnerAnswer}&quot;</p>
                        <p className='text-xs text-gray-400 mt-4 text-right'>Az önce</p>
                      </div>
                    ) : (
                      <div className='relative rounded-[2rem] overflow-hidden min-h-[180px] border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-8 text-center'>
                        {!data.userAnswer ? (
                          <>
                            <div className='w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-gray-400'>
                              <Lock size={28} />
                            </div>
                            <p className='font-bold text-gray-500'>Cevap vermeden göremezsin</p>
                            <p className='text-xs text-gray-400 mt-1 italic'>Önce kendi cevabını yazmalısın</p>
                          </>
                        ) : (
                          <>
                            <div className='w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-gray-400'>
                              <Clock size={28} className='animate-pulse' />
                            </div>
                            <p className='font-bold text-gray-500'>Henüz cevap vermedi</p>
                            <p className='text-xs text-gray-400 mt-1 italic'>Partnerinin cevabı bekleniyor</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* AI Analysis Section */}
              {bothAnswered && data.question.aiAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='mb-10 bg-gradient-to-br from-indigo-50 via-purple-50 to-rose-50 rounded-[2rem] p-8 border-2 border-indigo-100 shadow-inner relative overflow-hidden'
                >
                  <div className='absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-y-16 translate-x-16 blur-2xl' />
                  <div className='absolute bottom-0 left-0 w-32 h-32 bg-rose-500/5 rounded-full translate-y-16 -translate-x-16 blur-2xl' />

                  <div className='relative z-10'>
                    <div className='flex items-center gap-3 mb-4'>
                      <div className='w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm'>
                        <Sparkles size={20} />
                      </div>
                      <span className='font-black text-indigo-900 uppercase tracking-widest text-sm'>
                        AI Analizi & Yorumu
                      </span>
                    </div>
                    <p className='text-gray-800 text-lg leading-relaxed font-medium italic'>
                      &quot;{data.question.aiAnalysis}&quot;
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons for Completed State */}
              {bothAnswered && (
                <div className='flex items-center justify-end gap-4 mb-8'>
                  <button
                    onClick={handleDownloadPDF}
                    className='flex items-center gap-2 bg-rose-500 text-white px-8 py-3 rounded-full hover:bg-rose-600 transition-all font-bold shadow-lg shadow-rose-200'
                  >
                    <Download size={18} />
                    <span>PDF İndir</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className='flex items-center gap-2 bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 transition-all font-bold shadow-lg shadow-blue-200'
                  >
                    <Share2 size={18} />
                    <span>Paylaş</span>
                  </button>
                </div>
              )}

              {/* Footer text */}
              <div className='flex items-center justify-center gap-2 text-gray-400 font-medium'>
                <Clock size={16} />
                <span className='text-sm'>Yarın 00:00&apos;da yeni bir soru sizi bekliyor olacak</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
