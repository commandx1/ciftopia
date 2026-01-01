'use client'
import { useParams } from 'next/navigation'

export default function CoupleNamesClient() {
  const { subdomain } = useParams()

  const coupleNames = (subdomain as string)
    .split('-')
    .map(n => n.charAt(0).toUpperCase() + n.slice(1))
    .join(' & ')

  return <h1 className=' text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl'>{coupleNames}</h1>
}
