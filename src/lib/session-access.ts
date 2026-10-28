export type SessionAccess = "ok" | "unauthorized" | "unverified";

export function sessionAccess(
  session: { uid?: string; emailVerified?: boolean } | null | undefined
): SessionAccess {
  if (!session?.uid) return "unauthorized";
  if (session.emailVerified !== true) return "unverified";
  return "ok";
}
