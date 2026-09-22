import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, ROUTES } from "@/lib/constants";
import { verifySessionToken } from "@/lib/session";
import { getSafeRedirectPath } from "@/lib/safe-redirect";

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
  const response = NextResponse.redirect(loginUrl);
  response.cookies.set("redirect_url", callbackUrl, {
    path: "/",
    maxAge: 60 * 10,
    sameSite: "lax",
    httpOnly: false,
    // Prefer request protocol so http://localhost keeps the continue cookie.
    secure: request.nextUrl.protocol === "https:",
  });
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionCookie ? await verifySessionToken(sessionCookie) : null;

  if (matchesRoute(pathname, authOnlyRoutes) && session) {
    const callback = request.nextUrl.searchParams.get("callbackUrl");
    const dest = getSafeRedirectPath(callback, ROUTES.dashboard);
    return NextResponse.redirect(new URL(dest, request.url));
  }

  if (matchesRoute(pathname, protectedRoutes) && !session) {
    return redirectToLogin(request);
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
