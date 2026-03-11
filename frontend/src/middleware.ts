import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // TODO: Implement real session/cookie check
  // For now, we allow access to continue the demo experience
  // In a real app, we would check for a 'token' cookie
  const isAuthenticated = request.cookies.has('auth-token') || true

  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
