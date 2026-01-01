// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jose from 'jose'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const host = request.headers.get('host') || ''
  const hostname = host.split(':')[0]
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN?.split(':')[0] || ''

  // Subdomain tespit et
  let subdomain = ''
  if (hostname.endsWith(`.${mainDomain}`)) {
    subdomain = hostname.replace(`.${mainDomain}`, '')
  }

  const token = request.cookies.get('accessToken')?.value
  const isLoginPage = url.pathname === '/login'

  // ═══════════════════════════════════════════════════════
  // ANA DOMAIN (ciftopia.com) - Marketing + Register
  // ═══════════════════════════════════════════════════════
  if (!subdomain || subdomain === 'www') {
    return NextResponse.next()
  }

  // ═══════════════════════════════════════════════════════
  // COUPLE SUBDOMAIN (sinem-serhat.ciftopia.com)
  // ═══════════════════════════════════════════════════════

  // 1. Login sayfası - her zaman erişilebilir
  if (isLoginPage) {
    // Token varsa ve subdomain eşleşiyorsa dashboard'a yönlendir
    if (token) {
      try {
        const payload = jose.decodeJwt(token) as { subdomain?: string }
        if (payload.subdomain?.toLowerCase() === subdomain.toLowerCase()) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      } catch (err) {
        // Token geçersiz, login'de kalsın
      }
    }
    return NextResponse.rewrite(new URL(`/couple/${subdomain}/login`, request.url))
  }

  // 2. Token yoksa login'e yönlendir
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('returnUrl', url.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 3. Token var - subdomain eşleşmesi kontrol et
  try {
    const payload = jose.decodeJwt(token) as { subdomain?: string }

    // Token'da subdomain yoksa login'e
    if (!payload.subdomain) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Subdomain eşleşmiyorsa kendi sitesine yönlendir
    if (payload.subdomain.toLowerCase() !== subdomain.toLowerCase()) {
      const correctUrl = `https://${payload.subdomain}.${mainDomain}/dashboard`
      return NextResponse.redirect(new URL(correctUrl))
    }

    // ✅ Her şey OK - sayfayı göster
    return NextResponse.rewrite(new URL(`/couple/${subdomain}${url.pathname}`, request.url))
  } catch (err) {
    console.error('Middleware JWT decode error:', err)
    // Token decode hatası - login'e yönlendir
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('accessToken')
    return response
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
}
