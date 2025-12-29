import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Define allowed domains
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'ciftopia.com';
  const appDomain = `app.${mainDomain}`;

  // Get subdomain
  let subdomain = '';
  if (hostname.includes(`.${mainDomain}`)) {
    subdomain = hostname.split(`.${mainDomain}`)[0];
  } else if (hostname.includes('.localhost:3000')) {
    subdomain = hostname.split('.localhost:3000')[0];
  }

  // Handle routing based on subdomain
  if (subdomain === 'app') {
    // app.ciftopia.com handles dashboard, login, register
    // If user is at root of app domain, redirect to dashboard or login
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (subdomain && subdomain !== 'www') {
    // Custom couple subdomain (e.g., serhat-sinem.ciftopia.com)
    // Rewrite to a dynamic route that handles couple sites
    return NextResponse.rewrite(new URL(`/couple/${subdomain}${url.pathname}`, request.url));
  }

  // Default behavior for main domain (marketing site)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};


