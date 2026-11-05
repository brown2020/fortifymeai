export function safeRedirectPath(
  candidate: string | null | undefined,
  fallback: string
): string {
  return getSafeRedirectPath(candidate, fallback);
}

/**
 * Destination after the session cookie exists.
 * Unverified accounts go to the verification page. Everyone else goes to the
 * sanitized callback, or `fallback` (dashboard) when that callback is empty.
 */
export function signInDestination(
  emailVerified: boolean,
  callbackUrl: string,
  fallback: string,
  unverifiedPath: string
): string {
  if (!emailVerified) return unverifiedPath;
  return safeRedirectPath(callbackUrl, fallback);
}

/**
 * Continue path after sign-in.
 * Only an explicit `callbackUrl` query is a destination. `redirectCookie` is
 * ignored: a logged-out prefetch of `/research` can store that path in the
 * cookie while `/login` itself has no callbackUrl, and that must not become
 * the default. Missing, external, and invalid values use `fallback`.
 */
export function safeAuthCallbackUrl(
  _redirectCookie: string | null,
  search: string,
  fallback: string
): string {
  return safeRedirectPath(new URLSearchParams(search).get("callbackUrl"), fallback);
}

/** Keep an explicit callback on links between /login and /signup. */
export function hrefWithAuthCallback(path: string, search: string): string {
  const safe = safeAuthCallbackUrl(null, search, "");
  if (!safe) return path;
  return `${path}?callbackUrl=${encodeURIComponent(safe)}`;
}

export function getSafeRedirectPath(
  candidate: string | null | undefined,
  fallback: string
): string {
  const value = candidate?.trim();
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  try {
    const parsed = new URL(value, "https://fortify.local");
    if (parsed.origin !== "https://fortify.local") {
      return fallback;
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
