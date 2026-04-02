import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isLoginPage = req.nextUrl.pathname === "/admin/login"

  if (isLoginPage) {
    // Если уже залогинен — редирект на /admin
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/admin", req.url))
    }
    return NextResponse.next()
  }

  // Не залогинен — редирект на логин
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/login", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*"],
}