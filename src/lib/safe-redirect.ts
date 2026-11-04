export function safeRedirectPath(
  candidate: string | null | undefined,
  fallback: string
): string {
  return getSafeRedirectPath(candidate, fallback);
}

/**
 * Prefer the proxy's redirect cookie, then a callback query param.
 * Both values are reduced to an internal path before navigation.
 */
export function safeAuthCallbackUrl(
  redirectCookie: string | null,
  search: string,
  fallback: string
): string {
  if (redirectCookie) {
    return safeRedirectPath(redirectCookie, fallback);
  }
  return safeRedirectPath(
    new URLSearchParams(search).get("callbackUrl"),
    fallback
  );
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
