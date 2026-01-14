import { cn } from '@/lib/utils'
import Image from 'next/image'

const SettingsIcon = ({ width, height, className = '' }: { width: number; height: number; className?: string }) => {
  return (
    <Image
      src='/icons/settingsIcon.webp'
      alt='Settings'
      width={width}
      height={height}
      className={cn('object-contain', className)}
    />
  )
}

export default SettingsIcon
