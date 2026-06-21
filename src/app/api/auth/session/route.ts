import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSessionCookie } from "../../../../lib/session";
import {
  SESSION_COOKIE_NAME,
  SESSION_DURATION_MS,
} from "../../../../lib/constants";
import { z } from "zod";

const createSessionSchema = z.object({
  idToken: z.string().min(1),
});

function isSameOriginRequest(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  const secFetchSite = request.headers.get("sec-fetch-site");

  if (origin && origin !== requestUrl.origin) {
    return false;
  }

  if (
    secFetchSite &&
    secFetchSite !== "same-origin" &&
    secFetchSite !== "same-site" &&
    secFetchSite !== "none"
  ) {
    return false;
  }

  return true;
}

async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json(
        { error: "Session requests must come from this app." },
        { status: 403 }
      );
    }

    const parsed = createSessionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }
    const { idToken } = parsed.data;

    const { decodedToken, sessionCookie } = await createSessionCookie(idToken);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: SESSION_DURATION_MS / 1000, // Convert to seconds for cookie maxAge
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({ status: "success", uid: decodedToken.uid });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Session creation error:", error);
    }
    const message = error instanceof Error ? error.message : "Unknown error";

    // If server is misconfigured, return 500 without exposing credential details.
    if (
      message.toLowerCase().includes("credential") ||
      message.toLowerCase().includes("private_key") ||
      message.toLowerCase().includes("project_id")
    ) {
      return NextResponse.json(
        { error: "Server session is not configured." },
        { status: 500 }
      );
    }

    // Otherwise treat as auth failure
    return NextResponse.json({ error: "Invalid ID token" }, { status: 401 });
  }
}

export async function DELETE(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: "Session requests must come from this app." },
      { status: 403 }
    );
  }

  await clearSessionCookie();
  return NextResponse.json({ status: "success" });
}
