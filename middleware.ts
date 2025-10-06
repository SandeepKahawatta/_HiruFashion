import { NextRequest, NextResponse } from 'next/server'
import { AUTH_COOKIE, verifyToken } from './lib/auth'

export function middleware(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value
  const session = token ? verifyToken(token) : null
  const { pathname } = req.nextUrl

  const requiresAuth = pathname.startsWith('/orders') || pathname.startsWith('/checkout')
  const requiresAdmin = pathname.startsWith('/admin')

  if ((pathname === '/login' || pathname === '/register') && session) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (requiresAdmin) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (session.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  if (requiresAuth && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/register', '/checkout/:path*', '/orders/:path*', '/admin/:path*']
}
