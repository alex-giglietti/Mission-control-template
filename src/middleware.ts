import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/icon-') ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js' ||
    pathname === '/favicon.ico' ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.png')
  ) {
    return NextResponse.next()
  }

  // Allow API routes (needed for dashboard data)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const authCookie = request.cookies.get('mc_session')
  if (!authCookie || !authCookie.value) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
