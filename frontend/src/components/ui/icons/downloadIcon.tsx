import { cn } from '@/lib/utils'
import Image from 'next/image'

const DownloadIcon = ({ width, height, className = '' }: { width: number; height: number; className?: string }) => {
  return (
    <Image
      src='/icons/downloadIcon.webp'
      alt='Download'
      width={width}
      height={height}
      className={cn('object-contain', className)}
    />
  )
}

export default DownloadIcon
