import { cn } from '@/lib/utils'
import Image from 'next/image'

interface BulbIconProps {
  width?: number
  height?: number
  size?: number
  className?: string
}

const BulbIcon = ({ width, height, size, className = '' }: BulbIconProps) => {
  const w = size || width || 24
  const h = size || height || 24

  return (
    <Image
      src='/icons/bulbIcon.webp'
      alt='Bulb'
      width={w}
      height={h}
      className={cn('object-contain', className)}
    />
  )
}

export default BulbIcon
