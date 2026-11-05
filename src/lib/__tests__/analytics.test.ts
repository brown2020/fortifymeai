import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAnalytics, initializeAnalytics, isSupported, logEvent } from "firebase/analytics";

import {
  buildPageViewParams,
  readMeasurementId,
  resetAnalyticsSessionForTests,
  trackPageView,
} from "../analytics";

vi.mock("firebase/analytics", () => ({
  isSupported: vi.fn(),
  getAnalytics: vi.fn(),
  initializeAnalytics: vi.fn(),
  logEvent: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({
  app: {
    options: { measurementId: "G-P0X1DRKG2H" },
  },
}));

const MEASUREMENT_ID = "G-P0X1DRKG2H";

describe("Firebase Analytics page views", () => {
  beforeEach(() => {
    resetAnalyticsSessionForTests();
    vi.unstubAllGlobals();
    vi.mocked(isSupported).mockReset().mockResolvedValue(false);
    vi.mocked(initializeAnalytics).mockReset().mockReturnValue({} as never);
    vi.mocked(getAnalytics).mockReset().mockReturnValue({} as never);
    vi.mocked(logEvent).mockReset();
  });

  it("keeps the configured measurement id and ignores blanks", () => {
    expect(readMeasurementId(` ${MEASUREMENT_ID} `)).toBe(MEASUREMENT_ID);
    expect(readMeasurementId("")).toBeUndefined();
    expect(readMeasurementId(null)).toBeUndefined();
  });

  it("builds a page_view for client route changes", () => {
    expect(
      buildPageViewParams(
        "/research",
        "q=magnesium",
        "https://fortifymeai.vercel.app",
        "Research",
      ),
    ).toEqual({
      page_path: "/research?q=magnesium",
      page_location: "https://fortifymeai.vercel.app/research?q=magnesium",
      page_title: "Research",
    });
    expect(buildPageViewParams("/dashboard", "", "https://fortifymeai.vercel.app").page_path).toBe(
      "/dashboard",
    );
  });

  it("does not start analytics without a measurement id", async () => {
    vi.stubGlobal("window", {});
    const logged = await trackPageView("/", "", { measurementId: null });
    expect(logged).toBeNull();
    expect(isSupported).not.toHaveBeenCalled();
    expect(getAnalytics).not.toHaveBeenCalled();
  });

  it("does not call getAnalytics when the browser cannot support it", async () => {
    vi.stubGlobal("window", {});
    vi.mocked(isSupported).mockResolvedValue(false);
    const logged = await trackPageView("/login", "", { measurementId: MEASUREMENT_ID });
    expect(logged).toBeNull();
    expect(isSupported).toHaveBeenCalledOnce();
    expect(initializeAnalytics).not.toHaveBeenCalled();
    expect(getAnalytics).not.toHaveBeenCalled();
  });

  it("initializes with the existing measurement id and logs page_view", async () => {
    vi.stubGlobal("window", {});
    vi.mocked(isSupported).mockResolvedValue(true);

    const logged = await trackPageView("/research", "q=magnesium", {
      measurementId: MEASUREMENT_ID,
      origin: "https://fortifymeai.vercel.app",
      title: "Research",
    });

    expect(logged).toEqual({
      page_path: "/research?q=magnesium",
      page_location: "https://fortifymeai.vercel.app/research?q=magnesium",
      page_title: "Research",
    });
    expect(initializeAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({ options: { measurementId: MEASUREMENT_ID } }),
      { config: { send_page_view: false } },
    );
    expect(getAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({ options: { measurementId: MEASUREMENT_ID } }),
    );
    expect(vi.mocked(initializeAnalytics).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(getAnalytics).mock.invocationCallOrder[0] ?? Number.POSITIVE_INFINITY,
    );
    expect(logEvent).toHaveBeenCalledWith(expect.anything(), "page_view", logged);
  });

  it("reuses getAnalytics when analytics was already initialized", async () => {
    vi.stubGlobal("window", {});
    vi.mocked(isSupported).mockResolvedValue(true);
    vi.mocked(initializeAnalytics).mockImplementation(() => {
      const error = new Error("already initialized") as Error & { code: string };
      error.code = "analytics/already-initialized";
      throw error;
    });

    await trackPageView("/dashboard", "", { measurementId: MEASUREMENT_ID, title: "Dashboard" });

    expect(getAnalytics).toHaveBeenCalledOnce();
    expect(logEvent).toHaveBeenCalledWith(
      expect.anything(),
      "page_view",
      expect.objectContaining({ page_path: "/dashboard" }),
    );
  });

  it("logs each client navigation once and reuses the session", async () => {
    const logPageView = vi.fn();
    const start = vi.fn(async () => ({ logPageView }));

    await trackPageView("/dashboard", "", {
      measurementId: MEASUREMENT_ID,
      origin: "https://fortifymeai.vercel.app",
      title: "Dashboard",
      start,
    });
    await trackPageView("/health", "tab=sleep", {
      measurementId: MEASUREMENT_ID,
      origin: "https://fortifymeai.vercel.app",
      title: "Health",
      start,
    });

    expect(start).toHaveBeenCalledTimes(1);
    expect(start).toHaveBeenCalledWith(MEASUREMENT_ID);
    expect(logPageView).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ page_path: "/dashboard" }),
    );
    expect(logPageView).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ page_path: "/health?tab=sleep" }),
    );
  });

  it("drops a page view cancelled before analytics resolves", async () => {
    type Session = { logPageView: (params: unknown) => void };
    let resolveStart: (session: Session) => void = () => {};
    const logPageView: Session["logPageView"] = vi.fn();
    const start = vi.fn(
      () =>
        new Promise<Session>((resolve) => {
          resolveStart = resolve;
        }),
    );

    const pending = trackPageView("/a", "", {
      measurementId: MEASUREMENT_ID,
      shouldLog: () => false,
      start,
    });
    resolveStart({ logPageView });

    expect(await pending).toBeNull();
    expect(logPageView).not.toHaveBeenCalled();
  });
});
