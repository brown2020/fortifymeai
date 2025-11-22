import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, ROUTES } from "./lib/constants";
import { verifySessionToken } from "./lib/session";

export const runtime = "experimental-edge";

export async function proxy(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const { pathname } = request.nextUrl;

    // Check if the current path is an auth page
    const isAuthPage =
      pathname.startsWith("/login") || pathname.startsWith("/signup");

    // If on auth page and user is authenticated, redirect to dashboard
    if (isAuthPage && sessionCookie) {
      const session = await verifySessionToken(sessionCookie);
      if (session?.uid) {
        return NextResponse.redirect(new URL(ROUTES.dashboard, request.url));
      } else {
        // Invalid session on auth page, let them stay on the auth page
        const response = NextResponse.next();
        response.cookies.delete(SESSION_COOKIE_NAME);
        return response;
      }
    }

    // If on protected page and no session, redirect to login
    if (!isAuthPage && !sessionCookie) {
      const response = NextResponse.redirect(
        new URL(ROUTES.login, request.url)
      );
      // Store the original URL to redirect back after login
      response.cookies.set("redirect_url", pathname);
      return response;
    }

    // If on protected page with session, verify it
    if (!isAuthPage && sessionCookie) {
      const session = await verifySessionToken(sessionCookie);
      if (session?.uid) {
        // Add the user ID to request headers for potential use in API routes
        const response = NextResponse.next();
        response.headers.set("x-user-id", session.uid as string);
        return response;
      } else {
        const response = NextResponse.redirect(
          new URL(ROUTES.login, request.url)
        );
        response.cookies.delete(SESSION_COOKIE_NAME);
        // Store the original URL to redirect back after login
        response.cookies.set("redirect_url", pathname);
        return response;
      }
    }

    // Default case - allow the request
    return NextResponse.next();
  } catch (error) {
    console.error("Proxy error:", error);
    // In case of any error, redirect to login for security
    const response = NextResponse.redirect(new URL(ROUTES.login, request.url));
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }
}

// Configure the proxy to run on specific paths
export const config = {
  matcher: [
    // Protected routes
    "/dashboard/:path*",
    "/supplements/:path*",
    "/research/:path*",
    "/profile/:path*",
    // Auth routes
    "/login",
    "/signup",
  ],
};
