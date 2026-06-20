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
