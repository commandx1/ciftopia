'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { onboardingService } from '@/services/api'

// Animasyon Sarmalayıcısı
export function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Canlı Kontenjan Çubuğu
export function LiveProgress({ initialStatus }: { initialStatus: { count: number, limit: number, available: boolean } }) {
  const [status, setStatus] = useState(initialStatus)

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await onboardingService.getEarlyBirdStatus()
        setStatus(res.data.data)
      } catch (e) {
        console.error('Kontenjan güncellenemedi')
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const progress = (status.count / status.limit) * 100

  return (
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-6">
        <div className="text-left">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Kontenjan Durumu</p>
          <h3 className="text-3xl font-black text-gray-900">
            {status.count} / {status.limit}
          </h3>
        </div>
        <div className="text-right">
          <span className="px-4 py-2 bg-green-50 text-green-600 rounded-full text-xs font-black uppercase tracking-widest border border-green-100">
            {status.available ? 'Kayıtlar Açık' : 'Kontenjan Dolu'}
          </span>
        </div>
      </div>

      <div className="h-6 bg-gray-100 rounded-full overflow-hidden mb-8 border-2 border-gray-50">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-coral-warm relative"
        >
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:30px_30px] animate-stripe"></div>
        </motion.div>
      </div>
    </div>
  )
}
