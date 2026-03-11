import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for the refreshToken cookie which is our source of truth for the session
  const hasRefreshToken = request.cookies.has('refreshToken')

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (!hasRefreshToken) {
      // Redirect to login if no refresh token is present
      const loginUrl = new URL('/', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Redirect away from login if already authenticated
  if (pathname === '/' && hasRefreshToken) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
