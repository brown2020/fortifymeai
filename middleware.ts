import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "./lib/constants";

// Define protected routes that require authentication
const protectedRoutes = ["/dashboard", "/supplements", "/profile"];

// Define auth routes that should redirect to dashboard if already authenticated
const authRoutes = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const isAuthenticated = !!sessionCookie?.value;
  const { pathname } = request.nextUrl;

  // Check if the route is protected and user is not authenticated
  if (
    protectedRoutes.some((route) => pathname.startsWith(route)) &&
    !isAuthenticated
  ) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  // Check if the route is an auth route and user is already authenticated
  if (
    authRoutes.some((route) => pathname.startsWith(route)) &&
    isAuthenticated
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
