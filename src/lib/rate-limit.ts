export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_MAX_REQUESTS = 20;
export const RATE_LIMIT_DAILY_MAX = 100;

export type RateLimitState = {
  windowStartMs: number;
  windowCount: number;
  dayKey: string;
  dayCount: number;
};

export type RateLimitDecision = {
  allowed: boolean;
  retryAfterSeconds: number;
  state: RateLimitState;
  reason: "minute" | "day" | null;
};

export function rateLimitDayKey(now: number): string {
  return new Date(now).toISOString().slice(0, 10);
}

export function secondsUntilNextUtcDay(now: number): number {
  const current = new Date(now);
  const next = Date.UTC(
    current.getUTCFullYear(),
    current.getUTCMonth(),
    current.getUTCDate() + 1
  );
  return Math.max(1, Math.ceil((next - now) / 1000));
}

/**
 * Fixed-window minute cap plus a per-user UTC daily cap.
 * `windowCount` / `dayCount` are the totals after an allowed request.
 */
export function nextRateLimit(
  previous: RateLimitState | null,
  now: number
): RateLimitDecision {
  const dayKey = rateLimitDayKey(now);
  const sameWindow =
    previous != null && now - previous.windowStartMs < RATE_LIMIT_WINDOW_MS;
  const sameDay = previous != null && previous.dayKey === dayKey;
  const windowCount = sameWindow ? previous.windowCount : 0;
  const dayCount = sameDay ? previous.dayCount : 0;

  if (dayCount >= RATE_LIMIT_DAILY_MAX) {
    return {
      allowed: false,
      retryAfterSeconds: secondsUntilNextUtcDay(now),
      state: previous as RateLimitState,
      reason: "day",
    };
  }

  if (windowCount >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((previous!.windowStartMs + RATE_LIMIT_WINDOW_MS - now) / 1000)
    );
    return {
      allowed: false,
      retryAfterSeconds,
      state: previous as RateLimitState,
      reason: "minute",
    };
  }

  return {
    allowed: true,
    retryAfterSeconds: 0,
    reason: null,
    state: {
      windowStartMs: sameWindow ? previous!.windowStartMs : now,
      windowCount: windowCount + 1,
      dayKey,
      dayCount: dayCount + 1,
    },
  };
}

export function parseRateLimitState(value: unknown): RateLimitState | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (
    typeof record.windowStartMs !== "number" ||
    typeof record.windowCount !== "number" ||
    typeof record.dayKey !== "string" ||
    typeof record.dayCount !== "number"
  ) {
    return null;
  }
  return {
    windowStartMs: record.windowStartMs,
    windowCount: record.windowCount,
    dayKey: record.dayKey,
    dayCount: record.dayCount,
  };
}
