import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if accessing dashboard
  if (pathname === '/yongjinone/survey/canteen/dashboard') {
    const authCookie = request.cookies.get('dashboardAuthenticated')
    if (authCookie?.value !== 'true') {
      // Redirect to main survey page if not authenticated
      return NextResponse.redirect(new URL('/yongjinone/survey/canteen', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/yongjinone/survey/canteen/dashboard',
}