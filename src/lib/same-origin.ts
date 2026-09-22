/** Hostnames that are interchangeable for local same-app checks. */
function canonicalizeHost(hostname: string): string {
  const h = hostname.toLowerCase();
  if (h === "127.0.0.1" || h === "0.0.0.0" || h === "::1") {
    return "localhost";
  }
  return h;
}

function originKey(originOrUrl: string): string | null {
  try {
    const u = new URL(originOrUrl);
    return `${u.protocol}//${canonicalizeHost(u.hostname)}${u.port ? `:${u.port}` : ""}`;
  } catch {
    return null;
  }
}

/** Return true when a request should be treated as same-app for cookie session endpoints. */
export function isSameOriginRequest(
  requestUrl: string,
  origin: string | null,
  secFetchSite: string | null
): boolean {
  if (origin) {
    const reqKey = originKey(requestUrl);
    const originKeyValue = originKey(origin);
    if (!reqKey || !originKeyValue || reqKey !== originKeyValue) {
      return false;
    }
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
