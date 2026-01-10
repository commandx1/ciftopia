'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Send, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react'
import { authService } from '@/services/api'
import { useUserStore } from '@/store/userStore'
import { RelationshipProfile } from '@/lib/type'
import { showCustomToast } from '../ui/CustomToast'

const questions = [
  {
    id: 'conflictStyle',
    question: 'Bir sorun seni rahatsız ettiğinde genelde ne yaparsın?',
    options: [
      { label: 'İçime atarım, zamanla geçmesini beklerim', value: 'avoidant' },
      { label: 'Uygun zamanı kollayıp konuşurum', value: 'balanced' },
      { label: 'Anında dile getiririm', value: 'direct' }
    ]
  },
  {
    id: 'conflictResponse',
    question: 'Tartışma sırasında sana en yakın olan davranış hangisi?',
    options: [
      { label: 'Sessizleşirim', value: 'withdraw' },
      { label: 'Konuşarak çözmek isterim', value: 'talk' },
      { label: 'Konuyu değiştirmeyi tercih ederim', value: 'deflect' }
    ]
  },
  {
    id: 'emotionalTrigger',
    question: 'Partnerin beklediğin gibi davranmadığında ilk hissettiğin şey?',
    options: [
      { label: 'Hayal kırıklığı', value: 'disappointment' },
      { label: 'Sinir', value: 'anger' },
      { label: 'Üzüntü', value: 'sadness' },
      { label: 'Çok etkilemez', value: 'low_sensitivity' }
    ]
  },
  {
    id: 'decisionStyle',
    question: 'İlişkide kararlar alınırken hangisi sana daha uygun?',
    options: [
      { label: 'Birlikte uzun uzun konuşmak', value: 'collaborative' },
      { label: 'Hızlı karar almak', value: 'fast' },
      { label: 'Karşı tarafın yönlendirmesi', value: 'passive' }
    ]
  },
  {
    id: 'loveLanguage',
    question: 'Günlük hayatta sevgini daha çok nasıl gösterirsin?',
    options: [
      { label: 'Konuşarak / mesaj atarak', value: 'words' },
      { label: 'Zaman ayırarak', value: 'time' },
      { label: 'Küçük jestler yaparak', value: 'actions' }
    ]
  },
  {
    id: 'coreNeed',
    question: 'Bir ilişkide seni en çok güvende hissettiren şey nedir?',
    options: [
      { label: 'Açık iletişim', value: 'communication' },
      { label: 'Sadakat', value: 'trust' },
      { label: 'İlgi ve zaman', value: 'attention' },
      { label: 'Ortak hedefler', value: 'goals' }
    ],
    isMultiple: true
  },
  {
    id: 'sensitivityArea',
    question: 'Bir ilişkide seni en çok zorlayan durum hangisi?',
    options: [
      { label: 'Belirsizlik', value: 'uncertainty' },
      { label: 'İlgisizlik', value: 'neglect' },
      { label: 'Kıskançlık', value: 'jealousy' },
      { label: 'Maddi konular', value: 'finances' }
    ],
    isMultiple: true
  }
]

export default function RelationshipProfileModal() {
  const { user, setUser } = useUserStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<RelationshipProfile>>({
    coreNeed: [],
    sensitivityArea: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentQuestion = questions[currentStep]

  const handleOptionSelect = (value: string) => {
    if (currentQuestion.isMultiple) {
      const currentAnswers = (answers[currentQuestion.id as keyof RelationshipProfile] as string[]) || []
      const newAnswers = currentAnswers.includes(value)
        ? currentAnswers.filter(v => v !== value)
        : [...currentAnswers, value]

      setAnswers({ ...answers, [currentQuestion.id]: newAnswers })
    } else {
      setAnswers({ ...answers, [currentQuestion.id]: value })
      // Auto advance for single choice
      if (currentStep < questions.length - 1) {
        setTimeout(() => setCurrentStep(prev => prev + 1), 300)
      }
    }
  }

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      const response = await authService.saveRelationshipProfile(answers)
      if (response.data.success) {
        showCustomToast.success('Başarılı', 'Profilin başarıyla oluşturuldu!')
        if (user) {
          setUser({
            ...user,
            relationshipProfile: response.data.relationshipProfile
          })
        }
      }
    } catch (error) {
      showCustomToast.error('Hata', (error as Error)?.message || 'Galeri verileri yüklenirken bir hata oluştu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isCurrentQuestionAnswered = () => {
    const answer = answers[currentQuestion.id as keyof RelationshipProfile]
    if (Array.isArray(answer)) return answer.length > 0
    return !!answer
  }

  const progress = ((currentStep + 1) / questions.length) * 100

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className='bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative'
      >
        {/* Progress Bar */}
        <div className='absolute top-0 left-0 w-full h-1.5 bg-gray-100'>
          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className='h-full bg-rose-500' />
        </div>

        <div className='p-8 md:p-12'>
          {/* Header */}
          <div className='flex flex-col items-center text-center mb-10'>
            <div className='w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-4'>
              <Heart className='text-rose-500 fill-rose-500' size={32} />
            </div>
            <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-2'>Sizi Daha Yakından Tanıyalım</h2>
            <p className='text-gray-500 max-w-md'>
              İlişkinizi daha iyi analiz edebilmemiz için bu soruları cevaplamanız çok önemli.
            </p>
          </div>

          {/* Question Area */}
          <div className='min-h-[300px]'>
            <AnimatePresence mode='wait'>
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className='mb-8'>
                  <span className='text-rose-500 font-semibold text-sm uppercase tracking-wider'>
                    Soru {currentStep + 1} / {questions.length}
                  </span>
                  <h3 className='text-xl md:text-2xl font-semibold text-gray-800 mt-1'>{currentQuestion.question}</h3>
                  {currentQuestion.isMultiple && (
                    <p className='text-xs text-gray-400 mt-2 italic'>Birden fazla seçenek belirleyebilirsiniz.</p>
                  )}
                </div>

                <div className='grid grid-cols-1 gap-3'>
                  {currentQuestion.options.map(option => {
                    const isSelected = currentQuestion.isMultiple
                      ? (answers[currentQuestion.id as keyof RelationshipProfile] as string[])?.includes(option.value)
                      : answers[currentQuestion.id as keyof RelationshipProfile] === option.value

                    return (
                      <button
                        key={option.value}
                        onClick={() => handleOptionSelect(option.value)}
                        className={`
                          group relative w-full p-4 text-left rounded-2xl transition-all duration-200 border-2
                          ${
                            isSelected
                              ? 'border-rose-500 bg-rose-50/50 text-rose-700'
                              : 'border-gray-100 hover:border-rose-200 hover:bg-gray-50 text-gray-600'
                          }
                        `}
                      >
                        <div className='flex items-center justify-between'>
                          <span className='font-medium text-lg'>{option.label}</span>
                          {isSelected && <CheckCircle2 className='text-rose-500' size={24} />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          <div className='mt-12 flex items-center justify-between'>
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all
                ${currentStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}
              `}
            >
              <ChevronLeft size={20} />
              Geri
            </button>

            {currentStep === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={!isCurrentQuestionAnswered() || isSubmitting}
                className={`
                  flex items-center gap-2 px-10 py-4 bg-rose-500 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 
                  transition-all transform active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${!isSubmitting && 'hover:bg-rose-600 hover:translate-y-[-2px]'}
                `}
              >
                {isSubmitting ? (
                  <div className='w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                ) : (
                  <>
                    Tamamla
                    <Send size={18} />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!isCurrentQuestionAnswered()}
                className={`
                  flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl font-semibold 
                  transition-all transform active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${isCurrentQuestionAnswered() && 'hover:bg-gray-800 hover:translate-y-[-2px]'}
                `}
              >
                İleri
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
