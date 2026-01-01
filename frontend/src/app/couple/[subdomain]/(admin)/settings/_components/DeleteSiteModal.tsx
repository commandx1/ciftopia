'use client'

import React, { useState, useEffect } from 'react'
import {
  AlertTriangle,
  X,
  Skull,
  HeartCrack,
  Images,
  CalendarDays,
  Globe,
  Crown,
  ArrowLeft,
  Trash2,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ApiError } from '@/lib/type'

interface DeleteSiteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  subdomain?: string
}

export default function DeleteSiteModal({ isOpen, onClose, onConfirm, subdomain }: DeleteSiteModalProps) {
  const [step, setStep] = useState(1)
  const [confirmations, setConfirmations] = useState({
    understand: false,
    subscription: false,
    subdomain: false
  })
  const [subdomainInput, setSubdomainInput] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setConfirmations({ understand: false, subscription: false, subdomain: false })
      setSubdomainInput('')
      setError('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const isFormValid =
    confirmations.understand &&
    confirmations.subscription &&
    confirmations.subdomain &&
    subdomainInput.trim() === subdomain

  const handleDelete = async () => {
    if (step === 1) {
      setStep(2)
      return
    }

    setIsDeleting(true)
    setError('')
    try {
      await onConfirm()
    } catch (err) {
      setError((err as ApiError).response?.data?.message || 'Silme işlemi sırasında bir hata oluştu.')
      setIsDeleting(false)
      setStep(1)
    }
  }

  return (
    <>
      {/* Step 1 Modal */}
      {step === 1 && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300 p-4'>
          <div className='bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300'>
            <div className='sticky top-0 bg-gradient-to-r from-red-500 to-rose-600 px-8 py-6 rounded-t-3xl z-10'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-4'>
                  <div className='w-14 h-14 bg-white/20 rounded-full flex items-center justify-center'>
                    <AlertTriangle className='text-white w-8 h-8' />
                  </div>
                  <div>
                    <h2 className=' text-2xl font-bold text-white'>Siteyi Kalıcı Olarak Sil</h2>
                    <p className='text-red-100 text-sm mt-1'>Bu işlem geri alınamaz</p>
                  </div>
                </div>
                <button onClick={onClose} className='text-white/80 hover:text-white transition-colors'>
                  <X className='w-8 h-8' />
                </button>
              </div>
            </div>

            <div className='px-8 py-6'>
              <div className='bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6 animate-in slide-in-from-top duration-400'>
                <div className='flex items-start space-x-4'>
                  <div className='flex-shrink-0'>
                    <Skull className='text-red-600 w-8 h-8' />
                  </div>
                  <div>
                    <h3 className='font-bold text-red-900 text-lg mb-2'>Dikkat! Tüm Verileriniz Silinecek</h3>
                    <p className='text-red-700 text-sm leading-relaxed'>
                      Bu işlem <span className='font-bold'>{subdomain}.ciftopia.com</span> subdomain&apos;inizi ve
                      içindeki <span className='font-bold'>tüm verileri kalıcı olarak</span> silecektir. Silinen veriler
                      hiçbir şekilde geri getirilemez.
                    </p>
                  </div>
                </div>
              </div>

              <div className='space-y-4 mb-8'>
                <h4 className='font-semibold text-gray-900 text-lg mb-4'>Silinecek İçerikler:</h4>

                <div className='grid gap-3'>
                  {[
                    {
                      icon: HeartCrack,
                      label: 'Tüm Anılarınız',
                      detail: 'Tüm anılarınız, notlarınız ve tarihleriniz silinecek.'
                    },
                    {
                      icon: Images,
                      label: 'Galeri ve Fotoğraflar',
                      detail: 'Yüklediğiniz tüm fotoğraflar S3 üzerinden kalıcı olarak silinecek.'
                    },
                    {
                      icon: CalendarDays,
                      label: 'Önemli Tarihler',
                      detail: 'İlişki başlangıcı ve tüm özel tarihleriniz silinecek.'
                    },
                    {
                      icon: Globe,
                      label: 'Subdomain Erişimi',
                      detail: `${subdomain}.ciftopia.com adresi boşa çıkacak.`
                    },
                    {
                      icon: Crown,
                      label: 'Premium Abonelik',
                      detail: 'Aktif aboneliğiniz iptal edilecek ve iade yapılmayacak.'
                    }
                  ].map((item, i) => (
                    <div
                      key={i}
                      className='flex items-start space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-red-300 transition-colors'
                    >
                      <div className='flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center'>
                        <item.icon className='text-red-600 w-5 h-5' />
                      </div>
                      <div className='flex-1'>
                        <h5 className='font-semibold text-gray-900 mb-1'>{item.label}</h5>
                        <p className='text-sm text-gray-600'>{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className='space-y-4 mb-6'>
                <h4 className='font-semibold text-gray-900 text-lg'>Silme işlemine devam etmek için:</h4>

                <div className='space-y-3'>
                  {[
                    {
                      id: 'understand',
                      label: 'Tüm verilerimin kalıcı olarak silineceğini ve geri getirilemeyeceğini anlıyorum'
                    },
                    {
                      id: 'subscription',
                      label: 'Premium aboneliğimin iptal edileceğini ve ücret iadesi olmayacağını kabul ediyorum'
                    },
                    {
                      id: 'subdomain',
                      label: `Subdomain'imin (${subdomain}) başkası tarafından kullanılabileceğini biliyorum`
                    }
                  ].map(item => (
                    <label key={item.id} className='flex items-start space-x-3 cursor-pointer group'>
                      <input
                        type='checkbox'
                        className='w-5 h-5 mt-1 rounded border-gray-300 text-rose-primary focus:ring-rose-primary'
                        checked={confirmations[item.id as keyof typeof confirmations]}
                        onChange={e => setConfirmations(prev => ({ ...prev, [item.id]: e.target.checked }))}
                      />
                      <span className='text-gray-700 group-hover:text-gray-900 transition-colors'>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className='mb-6'>
                <label className='block text-sm font-semibold text-gray-900 mb-2'>
                  Devam etmek için subdomain&apos;inizi yazın: <span className='text-red-600'>{subdomain}</span>
                </label>
                <input
                  type='text'
                  value={subdomainInput}
                  onChange={e => setSubdomainInput(e.target.value)}
                  placeholder={subdomain}
                  className={cn(
                    'w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors',
                    subdomainInput && subdomainInput !== subdomain
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 focus:border-red-500'
                  )}
                />
                {subdomainInput && subdomainInput !== subdomain && (
                  <p className='text-red-600 text-sm mt-2'>Subdomain adı eşleşmiyor</p>
                )}
              </div>

              {error && (
                <div className='mb-6 p-4 bg-red-100 text-red-700 rounded-xl flex items-center space-x-2'>
                  <AlertCircle className='w-5 h-5' />
                  <span className='font-medium'>{error}</span>
                </div>
              )}

              <div className='flex items-center space-x-4'>
                <button
                  onClick={onClose}
                  className='flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-all flex items-center justify-center space-x-2'
                >
                  <ArrowLeft className='w-5 h-5' />
                  <span>İptal Et</span>
                </button>
                <button
                  onClick={handleDelete}
                  disabled={!isFormValid}
                  className='flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2'
                >
                  <Trash2 className='w-5 h-5' />
                  <span>Devam Et</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 Final Confirmation */}
      {step === 2 && (
        <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300 p-4'>
          <div className='bg-white rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300'>
            <div className='p-8 text-center'>
              <div className='w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                <AlertTriangle className='text-red-600 w-10 h-10' />
              </div>

              <h3 className=' text-2xl font-bold text-gray-900 mb-3'>Son Bir Kez Emin misiniz?</h3>
              <p className='text-gray-600 mb-6'>
                Bu işlem sonrasında tüm anılarınız, fotoğraflarınız ve içerikleriniz{' '}
                <strong className='text-red-600'>tamamen kaybolacak.</strong>
              </p>

              <div className='bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center'>
                <p className='text-sm text-red-800 font-medium'>⏱️ Bu işlem geri alınamaz ve veriler kurtarılamaz</p>
              </div>

              <div className='flex flex-col space-y-3'>
                <button
                  onClick={() => handleDelete()}
                  disabled={isDeleting}
                  className='w-full px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2'
                >
                  {isDeleting ? (
                    <Loader2 className='w-6 h-6 animate-spin' />
                  ) : (
                    <>
                      <Trash2 className='w-6 h-6' />
                      <span>Evet, Kalıcı Olarak Sil</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setStep(1)}
                  disabled={isDeleting}
                  className='w-full px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-all'
                >
                  Hayır, Geri Dön
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
