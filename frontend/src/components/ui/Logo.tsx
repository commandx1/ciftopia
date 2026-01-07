import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Logo = () => {
  return (
    <Link href={process.env.NEXT_PUBLIC_URL ?? '/'} className='flex items-center space-x-3'>
      <Image src='/ciftopia-logo.png' alt='Logo' width={100} height={100} className='object-contain' />
    </Link>
  )
}

export default Logo
