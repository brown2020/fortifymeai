import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, ROUTES } from "@/lib/constants";
import { verifySessionToken } from "@/lib/session";

const protectedRoutes = [
  ROUTES.dashboard,
  ROUTES.supplements,
  ROUTES.research,
  ROUTES.health,
  ROUTES.analytics,
  ROUTES.calendar,
  ROUTES.profile,
];

const authOnlyRoutes = [ROUTES.login, ROUTES.signup];

function matchesRoute(pathname: string, routes: string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function withSafeCallback(request: NextRequest) {
  const loginUrl = new URL(ROUTES.login, request.url);
  const callbackUrl = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set("callbackUrl", callbackUrl);
  return loginUrl;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionCookie ? await verifySessionToken(sessionCookie) : null;

  if (matchesRoute(pathname, authOnlyRoutes) && session) {
    return NextResponse.redirect(new URL(ROUTES.dashboard, request.url));
  }

  if (matchesRoute(pathname, protectedRoutes) && !session) {
    return NextResponse.redirect(withSafeCallback(request));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/dashboard/:path*",
    "/supplements/:path*",
    "/research/:path*",
    "/health/:path*",
    "/analytics/:path*",
    "/calendar/:path*",
    "/profile/:path*",
  ],
};
