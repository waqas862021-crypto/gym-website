import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/jwt";
import { ADMIN_ROLES, RECEPTION_ROLES } from "@/lib/roles";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const { pathname } = request.nextUrl;
  const isPortalRoute = pathname.startsWith("/portal");
  const isAdminRoute = pathname.startsWith("/admin");
  const isReceptionRoute = pathname.startsWith("/reception");

  if ((isPortalRoute || isAdminRoute || isReceptionRoute) && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && session && !ADMIN_ROLES.has(session.role)) {
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  if (isReceptionRoute && session && !RECEPTION_ROLES.has(session.role)) {
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*", "/admin/:path*", "/reception/:path*"],
};
