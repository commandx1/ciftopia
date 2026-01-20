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

export function formatBytes(bytes: number, decimals = 2) {
  if (!bytes || isNaN(bytes) || bytes <= 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  if (!sizes[i]) return '0 Bytes'

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function getUserAvatar(user?: { avatar?: PhotoMetadata; gender?: string }) {
  if (user?.avatar?.url) {
    return user.avatar.url
  }
  const defaultPic = user?.gender === 'female' ? '/woman-pp.png' : '/man-pp.png'
  return getPublicAssetUrl(defaultPic)
}
