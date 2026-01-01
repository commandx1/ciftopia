import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jose from 'jose'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const host = request.headers.get('host') || ''

  // Strip port for comparison and subdomain detection
  const hostname = host.split(':')[0]

  // Define allowed domains
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN?.split(':')[0] || ''

  // Get subdomain
  let subdomain = ''
  if (hostname.endsWith(`.${mainDomain}`)) {
    subdomain = hostname.replace(`.${mainDomain}`, '')
  } else if (hostname === mainDomain) {
    subdomain = ''
  }

  // Auth Cookie'sini al
  const token = request.cookies.get('accessToken')?.value

  const isLoginPage = url.pathname === '/login'
  const isRegisterPage = url.pathname === '/register'
  const isAuthPage = isLoginPage || isRegisterPage

  // No subdomain logic for Auth pages
  // We allow login/register on both root domain and subdomains

  // Handle routing based on subdomain
  if (subdomain && subdomain !== 'www' && subdomain !== 'app') {
    // 1. Kayıt sayfasını her zaman ana domain'e yönlendir
    if (isRegisterPage) {
      return NextResponse.redirect(new URL(`${process.env.NEXT_PUBLIC_URL}/register`, request.url))
    }

    // 2. Giriş sayfasına subdomain'de izin ver (ana domain'e yönlendirme)
    if (isLoginPage) {
      return NextResponse.next()
    }

    // 3. Token varsa içindeki subdomain ile URL'dekini karşılaştır (Güvenlik için)
    if (token) {
      try {
        const payload = jose.decodeJwt(token) as { subdomain?: string }

        if (payload.subdomain && payload.subdomain.toLowerCase() !== subdomain.toLowerCase()) {
          // Eşleşmiyorsa ana domain'deki login sayfasına at (Hata mesajı ile)
          const loginUrl = new URL(`${process.env.NEXT_PUBLIC_URL}/login`)
          return NextResponse.redirect(loginUrl)
        }
      } catch (err) {
        console.error('Middleware JWT decode error:', err)
      }
    }

    // 3. Rewrite to a dynamic route that handles couple sites
    // Bu sayede dashboard ve settings de /couple/[subdomain]/... üzerinden çalışacak
    return NextResponse.rewrite(new URL(`/couple/${subdomain}${url.pathname}`, request.url))
  }

  // Default behavior for main domain (marketing site)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Statik dosyalar (png, jpg, jpeg, gif, svg vb.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
