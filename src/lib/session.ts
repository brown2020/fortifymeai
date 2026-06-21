import type { DecodedIdToken } from "firebase-admin/auth";
import { SESSION_DURATION_MS } from "@/lib/constants";
import { adminAuth } from "@/lib/firebase-admin";

export type VerifiedSession = {
  uid: string;
  email?: string;
  emailVerified: boolean;
  claims: DecodedIdToken;
};

export async function createSessionCookie(idToken: string) {
  const decodedToken = await adminAuth.verifyIdToken(idToken);
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION_MS,
  });

  return { decodedToken, sessionCookie };
}

export async function verifySessionToken(
  token: string
): Promise<VerifiedSession | null> {
  try {
    const decodedToken = await adminAuth.verifySessionCookie(token, true);
    if (!decodedToken.uid) {
      return null;
    }

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified === true,
      claims: decodedToken,
    };
  } catch {
    return null;
  }
}
