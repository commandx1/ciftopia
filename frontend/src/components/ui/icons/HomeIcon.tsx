import { cn } from '@/lib/utils'
import Image from 'next/image'

const HomeIcon = ({ width, height, className = '' }: { width: number; height: number; className?: string }) => {
  return (
    <Image
      src='/icons/homeIcon.webp'
      alt='Home'
      width={width}
      height={height}
      className={cn('object-contain', className)}
    />
  )
}

export default HomeIcon
