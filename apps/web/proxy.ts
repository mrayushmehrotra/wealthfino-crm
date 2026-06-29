import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Routes that only admins can access
const ADMIN_ONLY_ROUTES = [
  "/access-requests",
  "/employees",
  "/reports",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("token")?.value;

  // If no token at all, let the layout handle the redirect to /
  if (!token) return NextResponse.next();

  // Check if this path is admin-only
  const isAdminRoute = ADMIN_ONLY_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(route + "/")
  );

  if (!isAdminRoute) return NextResponse.next();

  // Decode the JWT (without a DB call - fast edge-compatible)
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    if (role !== "ADMIN") {
      // Redirect employees to dashboard with a flash message via search param
      const redirectUrl = new URL("/dashboard", request.url);
      redirectUrl.searchParams.set("blocked", "1");
      return NextResponse.redirect(redirectUrl);
    }
  } catch {
    // Invalid token — clear it and redirect to login
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/access-requests/:path*",
    "/employees/:path*",
    "/reports/:path*",
  ],
};
