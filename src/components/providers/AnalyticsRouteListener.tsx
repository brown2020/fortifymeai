"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { trackPageView } from "@/lib/analytics";

/**
 * Logs a Firebase Analytics page_view whenever the App Router URL changes.
 * No consent banner exists in this app, so this starts on load.
 */
export function AnalyticsRouteListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    let active = true;
    void trackPageView(pathname, search, {
      origin: window.location.origin,
      title: document.title,
      shouldLog: () => active,
    });
    return () => {
      active = false;
    };
  }, [pathname, search]);

  return null;
}
