import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Пропускаем страницу логина
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Проверяем сессию — замени 'admin_token' на название своей куки
  const token = request.cookies.get('admin_token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}