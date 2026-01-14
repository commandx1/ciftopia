import { cn } from '@/lib/utils'
import Image from 'next/image'

const ArrowRightIcon = ({ width, height, className = '' }: { width: number; height: number; className?: string }) => {
  return (
    <Image
      src='/icons/rightArrowIcon.webp'
      alt='Arrow Right'
      width={width}
      height={height}
      className={cn('object-contain', className)}
    />
  )
}

export default ArrowRightIcon
