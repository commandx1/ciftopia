import Image from 'next/image'

const CameraIcon = ({ width, height }: { width: number; height: number }) => {
  return <Image src='/icons/cameraIcon.webp' alt='Camera' width={width} height={height} className='object-contain' />
}

export default CameraIcon
