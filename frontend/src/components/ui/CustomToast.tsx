import React from 'react'
import { Check, X, TriangleAlert, Info, Heart, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'love' | 'loading'

interface CustomToastProps {
  id: string | number
  type: ToastType
  title: string
  message: string
  duration?: number
}

const toastConfig = {
  success: {
    icon: Check,
    color: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50',
    border: 'border-green-200'
  },
  error: {
    icon: X,
    color: 'from-red-500 to-rose-600',
    bg: 'bg-red-50',
    border: 'border-red-200'
  },
  warning: {
    icon: TriangleAlert,
    color: 'from-amber-500 to-yellow-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200'
  },
  info: {
    icon: Info,
    color: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200'
  },
  love: {
    icon: Heart,
    color: 'from-rose-500 to-pink-600',
    bg: 'bg-pink-50',
    border: 'border-pink-200'
  },
  loading: {
    icon: Loader2,
    color: 'from-purple-500 to-indigo-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200'
  }
}

export function CustomToast({ id, type, title, message, duration = 4000 }: CustomToastProps) {
  const config = toastConfig[type]
  const Icon = config.icon

  return (
    <div
      className={`bg-white rounded-2xl shadow-2xl border-2 ${config.border} overflow-hidden min-w-[320px] pointer-events-auto font-indie-flower`}
    >
      <div className='flex items-start p-4'>
        <div className='flex-shrink-0'>
          <div
            className={`w-10 h-10 bg-gradient-to-br ${config.color} rounded-full flex items-center justify-center shadow-lg`}
          >
            <Icon
              className={`text-white ${type === 'loading' ? 'animate-spin' : ''}`}
              size={20}
              fill={type === 'love' ? 'white' : 'none'}
            />
          </div>
        </div>
        <div className='ml-4 flex-1'>
          <h4 className='font-bold text-gray-900 text-sm mb-1'>{title}</h4>
          <p className='text-gray-600 text-xs leading-relaxed'>{message}</p>
        </div>
        <button
          onClick={() => toast.dismiss(id)}
          className='flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors'
        >
          <X size={16} />
        </button>
      </div>
      {type !== 'loading' && (
        <div className={`h-1 ${config.bg}`}>
          <div
            className={`h-full bg-gradient-to-r ${config.color} toast-progress`}
            style={{ '--duration': `${duration}ms` } as React.CSSProperties}
          />
        </div>
      )}
    </div>
  )
}

export const showCustomToast = {
  success: (title: string, message: string, duration: number = 4000) =>
    toast.custom(id => <CustomToast id={id} type='success' title={title} message={message} duration={duration} />, {
      duration
    }),
  error: (title: string, message: string, duration: number = 4000) =>
    toast.custom(id => <CustomToast id={id} type='error' title={title} message={message} duration={duration} />, {
      duration
    }),
  warning: (title: string, message: string, duration: number = 4000) =>
    toast.custom(id => <CustomToast id={id} type='warning' title={title} message={message} duration={duration} />, {
      duration
    }),
  info: (title: string, message: string, duration: number = 4000) =>
    toast.custom(id => <CustomToast id={id} type='info' title={title} message={message} duration={duration} />, {
      duration
    }),
  love: (title: string, message: string, duration: number = 4000) =>
    toast.custom(id => <CustomToast id={id} type='love' title={title} message={message} duration={duration} />, {
      duration
    }),
  loading: (title: string, message: string, duration: number = Infinity) =>
    toast.custom(id => <CustomToast id={id} type='loading' title={title} message={message} duration={duration} />, {
      duration: Infinity
    })
}
