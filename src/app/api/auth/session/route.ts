import { adminAuth } from "../../../../lib/firebase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSessionToken } from "../../../../lib/session";
import {
  SESSION_COOKIE_NAME,
  SESSION_DURATION_MS,
} from "../../../../lib/constants";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    console.log(
      "Creating session with token:",
      idToken.substring(0, 10) + "..."
    );

    // Verify the ID token first
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    console.log("Token verified for user:", decodedToken.uid);

    // Create session token
    const sessionToken = await createSessionToken(decodedToken.uid);
    console.log("Session token created");

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      maxAge: SESSION_DURATION_MS / 1000, // Convert to seconds for cookie maxAge
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });
    console.log("Cookie set in response");

    return NextResponse.json({ status: "success", uid: decodedToken.uid });
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json({ error: "Invalid ID token" }, { status: 401 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return NextResponse.json({ status: "success" });
}
