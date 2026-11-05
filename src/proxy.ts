import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, ROUTES } from "@/lib/constants";
import { verifySessionToken } from "@/lib/session";
import { safeAuthCallbackUrl } from "@/lib/safe-redirect";
import { sessionAccess } from "@/lib/session-access";

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

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL(ROUTES.login, request.url);
  const callbackUrl = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set("callbackUrl", callbackUrl);
  // Do not also store this path in a cookie. A logged-out prefetch of
  // /research would plant redirect_url=/research, and sign-in from a bare
  // /login would treat that cookie as the default destination.
  return NextResponse.redirect(loginUrl);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionCookie ? await verifySessionToken(sessionCookie) : null;

  if (matchesRoute(pathname, authOnlyRoutes) && session) {
    const dest = safeAuthCallbackUrl(null, request.nextUrl.search, ROUTES.dashboard);
    return NextResponse.redirect(new URL(dest, request.url));
  }

  if (matchesRoute(pathname, protectedRoutes)) {
    const access = sessionAccess(session);
    if (access === "unauthorized") {
      return redirectToLogin(request);
    }
    if (access === "unverified") {
      return NextResponse.redirect(new URL(ROUTES.verifyEmail, request.url));
    }
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
