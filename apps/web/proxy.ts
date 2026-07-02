import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicRoutes = ["/"]
const authApiRoutes = ["/api/auth/login", "/api/auth/logout"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("token")?.value

  if (token && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (!token && !publicRoutes.includes(pathname) && !authApiRoutes.includes(pathname) && !pathname.startsWith("/api/auth") && !pathname.startsWith("/_next") && !pathname.startsWith("/logo.png")) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
