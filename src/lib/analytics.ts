import type { Analytics } from "firebase/analytics";

/** GA4 page_view fields recorded for each App Router URL. */
export type PageViewParams = {
  page_path: string;
  page_location: string;
  page_title: string;
};

type AnalyticsSession = {
  logPageView: (params: PageViewParams) => void;
};

type AnalyticsStarter = (measurementId: string) => Promise<AnalyticsSession | null>;

type TrackPageViewOptions = {
  origin?: string;
  title?: string;
  /** Return false to drop a view that was superseded by a newer navigation. */
  shouldLog?: () => boolean;
  /** Null skips collection. Omit to read NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID. */
  measurementId?: string | null;
  start?: AnalyticsStarter;
};

let sessionPromise: Promise<AnalyticsSession | null> | null = null;

/**
 * Measurement ID already configured on the Firebase web app.
 * The live stream is G-P0X1DRKG2H via NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID.
 */
export function readMeasurementId(value?: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function buildPageViewParams(
  pathname: string,
  search: string,
  origin?: string,
  title?: string,
): PageViewParams {
  const query = search.replace(/^\?/, "");
  const page_path = query ? `${pathname}?${query}` : pathname || "/";
  const page_location = origin ? `${origin}${page_path}` : page_path;
  return {
    page_path,
    page_location,
    page_title: title ?? "",
  };
}

/** Test hook so each case starts from an uninitialized analytics session. */
export function resetAnalyticsSessionForTests(): void {
  sessionPromise = null;
}

function isExistingAnalyticsError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("code" in error)) return false;
  const code = String(error.code);
  return code.includes("already-initialized") || code.includes("already-exists");
}

/**
 * Start Firebase Analytics once.
 * This app has no cookie-consent banner, so collection starts on load when
 * the existing measurement ID is present. isSupported covers browsers that
 * block cookies or IndexedDB. Automatic page views are disabled so App Router
 * navigations are logged once by trackPageView.
 */
async function startFirebaseAnalytics(measurementId: string): Promise<AnalyticsSession | null> {
  if (typeof window === "undefined") return null;

  const { getAnalytics, initializeAnalytics, isSupported, logEvent } = await import(
    "firebase/analytics"
  );
  const supported = await isSupported();
  if (!supported) return null;

  const { app } = await import("@/lib/firebase");
  const configuredId = readMeasurementId(app.options.measurementId);
  if (!configuredId || configuredId !== measurementId) return null;

  let analytics: Analytics;
  try {
    initializeAnalytics(app, { config: { send_page_view: false } });
    analytics = getAnalytics(app);
  } catch (error) {
    if (!isExistingAnalyticsError(error)) throw error;
    analytics = getAnalytics(app);
  }

  return {
    logPageView(params) {
      logEvent(analytics, "page_view", params);
    },
  };
}

async function getAnalyticsSession(
  measurementId: string,
  start: AnalyticsStarter,
): Promise<AnalyticsSession | null> {
  if (!sessionPromise) {
    sessionPromise = start(measurementId).catch(() => null);
  }
  return sessionPromise;
}

export async function trackPageView(
  pathname: string,
  search: string,
  options: TrackPageViewOptions = {},
): Promise<PageViewParams | null> {
  const measurementId =
    options.measurementId === undefined
      ? readMeasurementId(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID)
      : readMeasurementId(options.measurementId);
  if (!measurementId) return null;

  const session = await getAnalyticsSession(
    measurementId,
    options.start ?? startFirebaseAnalytics,
  );
  if (!session) return null;
  if (options.shouldLog && !options.shouldLog()) return null;

  const params = buildPageViewParams(pathname, search, options.origin, options.title);
  session.logPageView(params);
  return params;
}
