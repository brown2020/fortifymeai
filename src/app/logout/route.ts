import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { isSameOriginRequest } from "@/lib/same-origin";

function clearCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

/** Cookie logout is POST-only. Client sign-out also calls DELETE /api/auth/session and Firebase signOut. */
export async function POST(request: Request) {
  if (
    !isSameOriginRequest(
      request.url,
      request.headers.get("origin"),
      request.headers.get("sec-fetch-site")
    )
  ) {
    return NextResponse.json(
      { error: "Logout requests must come from this app." },
      { status: 403 }
    );
  }

  const response = NextResponse.redirect(new URL("/", request.url), 303);
  clearCookie(response);
  return response;
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405, headers: { Allow: "POST" } }
  );
}
