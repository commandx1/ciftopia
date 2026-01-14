import { cn } from '@/lib/utils'
import Image from 'next/image'

const LockIcon = ({ width, height, className = '' }: { width: number; height: number; className?: string }) => {
  return (
    <Image
      src='/icons/lockIcon.webp'
      alt='Lock'
      width={width}
      height={height}
      className={cn('object-contain', className)}
    />
  )
}

export default LockIcon
