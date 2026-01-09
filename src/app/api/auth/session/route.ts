import { adminAuth } from "../../../../lib/firebase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSessionToken } from "../../../../lib/session";
import {
  SESSION_COOKIE_NAME,
  SESSION_DURATION_MS,
} from "../../../../lib/constants";
import { z } from "zod";

const createSessionSchema = z.object({
  idToken: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const parsed = createSessionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }
    const { idToken } = parsed.data;

    // Verify the ID token first
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Create session token
    const sessionToken = await createSessionToken(decodedToken.uid);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      maxAge: SESSION_DURATION_MS / 1000, // Convert to seconds for cookie maxAge
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({ status: "success", uid: decodedToken.uid });
  } catch (error) {
    console.error("Session creation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    // If server is misconfigured (most commonly missing JWT_SECRET), return 500
    if (message.toLowerCase().includes("jwt_secret")) {
      return NextResponse.json(
        { error: "Server session is not configured (missing JWT_SECRET)." },
        { status: 500 }
      );
    }

    // Otherwise treat as auth failure
    return NextResponse.json({ error: "Invalid ID token" }, { status: 401 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return NextResponse.json({ status: "success" });
}
