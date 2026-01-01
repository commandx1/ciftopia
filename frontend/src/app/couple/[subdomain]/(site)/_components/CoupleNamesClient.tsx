'use client'
import { useUserStore } from '@/store/userStore'

export default function CoupleNamesClient() {
  const { coupleNames } = useUserStore()

  return (
    <h1 className='font-playfair-display text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl'>
      {coupleNames}
    </h1>
  )
}
