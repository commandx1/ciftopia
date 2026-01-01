import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

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
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${getBaseUrl()}${cleanPath}`
}

export function getUserAvatar(user?: { avatar?: string; gender?: string }) {
  if (user?.avatar) return user.avatar
  const defaultPic = user?.gender === 'female' ? '/woman-pp.png' : '/man-pp.png'
  return getPublicAssetUrl(defaultPic)
}




