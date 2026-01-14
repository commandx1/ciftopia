import { cn } from '@/lib/utils'
import Image from 'next/image'

const XIcon = ({ width, height, className = '' }: { width: number; height: number; className?: string }) => {
  return (
    <Image src='/icons/xIcon.webp' alt='X' width={width} height={height} className={cn('object-contain', className)} />
  )
}

export default XIcon
