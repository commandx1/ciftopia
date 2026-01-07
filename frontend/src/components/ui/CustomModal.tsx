'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Info, AlertTriangle, Trash2, Heart, Loader2 } from 'lucide-react'

export type ModalType = 'success' | 'info' | 'warning' | 'danger' | 'love'

interface CustomModalProps {
  isOpen: boolean
  onClose: () => void
  type?: ModalType
  title: string
  description?: string | React.ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  loading?: boolean
  showCancel?: boolean
  children?: React.ReactNode
}

const typeConfigs = {
  success: {
    icon: Check,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-500',
    buttonBg: 'bg-green-500 hover:bg-green-600',
    defaultConfirmText: 'Tamam'
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-500',
    buttonBg: 'bg-blue-500 hover:bg-blue-600',
    defaultConfirmText: 'Anladım'
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-500',
    buttonBg: 'bg-amber-500 hover:bg-amber-600',
    defaultConfirmText: 'İşlemi Yap'
  },
  danger: {
    icon: Trash2,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
    buttonBg: 'bg-red-500 hover:bg-red-600',
    defaultConfirmText: 'Evet, Sil'
  },
  love: {
    icon: Heart,
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-500',
    buttonBg: 'bg-gradient-to-r from-[#E91E63] to-[#FF6B6B] hover:shadow-lg',
    defaultConfirmText: 'Görüntüle'
  }
}

export default function CustomModal({
  isOpen,
  onClose,
  type = 'info',
  title,
  description,
  confirmText,
  cancelText = 'Vazgeç',
  onConfirm,
  loading = false,
  showCancel = true,
  children
}: CustomModalProps) {
  const config = typeConfigs[type]
  const Icon = config.icon

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-[300] flex items-center justify-center p-4'>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='absolute inset-0 bg-black/60 backdrop-blur-sm'
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.3 }}
            className='relative bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden'
          >
            <div className='p-8 md:p-10'>
              <div className='text-center'>
                <div className={`inline-flex items-center justify-center w-20 h-20 ${config.iconBg} rounded-3xl mb-6`}>
                  <Icon className={config.iconColor} size={40} fill={type === 'love' ? 'currentColor' : 'none'} />
                </div>
                <h2 className='text-3xl font-bold text-gray-900 mb-3 leading-tight'>{title}</h2>
                {description && <div className='text-gray-600 text-lg mb-8'>{description}</div>}
              </div>

              {children}

              <div className='flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-8'>
                {showCancel && (
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className='flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all disabled:opacity-50'
                  >
                    {cancelText}
                  </button>
                )}
                <button
                  onClick={() => {
                    if (onConfirm) onConfirm()
                    else onClose()
                  }}
                  disabled={loading}
                  className={`flex-1 px-6 py-4 ${config.buttonBg} text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-70`}
                >
                  {loading ? (
                    <Loader2 className='animate-spin' size={24} />
                  ) : (
                    <>
                      {type === 'love' && <Heart size={20} fill='currentColor' />}
                      <span>{confirmText || config.defaultConfirmText}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Close Cross (Top Right) */}
            <button
              onClick={onClose}
              className='absolute top-6 right-6 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-all'
            >
              <X size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
