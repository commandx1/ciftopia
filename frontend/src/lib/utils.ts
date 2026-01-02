import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { PhotoMetadata } from './type'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBaseUrl() {
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'ciftopia.local:3000'
  const isProd = process.env.NEXT_PUBLIC_ENV === 'production'
  const protocol = isProd ? 'https' : 'http'
  return `${protocol}://${mainDomain}`
}

export function getPublicAssetUrl(path: string) {
  return path
  // const cleanPath = path.startsWith('/') ? path : `/${path}`
  // return `${getBaseUrl()}${cleanPath}`
}

export function getUserAvatar(user?: { avatar?: PhotoMetadata; gender?: string }) {
  if (user?.avatar) {
    if (typeof user.avatar === 'string') return user.avatar
    if (user.avatar.url) return user.avatar.url
  }
  const defaultPic = user?.gender === 'female' ? '/woman-pp.png' : '/man-pp.png'
  return getPublicAssetUrl(defaultPic)
}
