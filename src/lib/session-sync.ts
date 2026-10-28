/** localStorage key recording the last explicit logout. Not cleared with auth keys. */
export const LOGOUT_AT_KEY = "fortify_logout_at";

/**
 * A session POST that started at or before logout must not be allowed to
 * restore the cookie when its response arrives later.
 */
export function shouldDiscardSession(startedAt: number, logoutAt: number): boolean {
  return logoutAt > 0 && logoutAt >= startedAt;
}

export function readLogoutAt(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(LOGOUT_AT_KEY);
  const value = raw ? Number(raw) : 0;
  return Number.isFinite(value) ? value : 0;
}

export function markLoggedOut(now: number = Date.now()): number {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LOGOUT_AT_KEY, String(now));
  }
  return now;
}
