/** Return true when a request should be treated as same-app for cookie session endpoints. */
export function isSameOriginRequest(
  requestUrl: string,
  origin: string | null,
  secFetchSite: string | null
): boolean {
  const url = new URL(requestUrl);
  if (origin && origin !== url.origin) {
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
