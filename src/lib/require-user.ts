import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { sessionAccess } from "@/lib/session-access";
import { verifySessionToken, type VerifiedSession } from "@/lib/session";

export class AuthzError extends Error {
  readonly status: 401 | 403;

  constructor(message: string, status: 401 | 403) {
    super(message);
    this.name = "AuthzError";
    this.status = status;
  }
}

export async function readSession(): Promise<VerifiedSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** Any signed-in session, including accounts that have not verified email. */
export async function requireSession(): Promise<VerifiedSession> {
  const session = await readSession();
  if (!session?.uid) {
    throw new AuthzError("Unauthorized", 401);
  }
  return session;
}

/** Signed-in session whose email is verified. */
export async function requireVerifiedSession(): Promise<VerifiedSession> {
  const session = await readSession();
  const access = sessionAccess(session);
  if (access === "unauthorized") {
    throw new AuthzError("Unauthorized", 401);
  }
  if (access === "unverified") {
    throw new AuthzError("Email not verified", 403);
  }
  return session as VerifiedSession;
}
