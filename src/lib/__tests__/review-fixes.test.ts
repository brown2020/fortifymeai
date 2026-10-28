import { describe, expect, it } from "vitest";
import { getLocalDateId, previousDateId, recentLocalDateIds } from "../date-id";
import { normalizeDoseLog, isValidDoseToggle } from "../dose-log-record";
import {
  RATE_LIMIT_DAILY_MAX,
  RATE_LIMIT_MAX_REQUESTS,
  nextRateLimit,
  type RateLimitState,
} from "../rate-limit";
import { sessionAccess } from "../session-access";
import { shouldDiscardSession } from "../session-sync";
import { applyDoseActivity, applyResearchQuery, emptyStats } from "../stats-update";

describe("session access", () => {
  it("requires a verified email", () => {
    expect(sessionAccess(null)).toBe("unauthorized");
    expect(sessionAccess({ uid: "u", emailVerified: false })).toBe("unverified");
    expect(sessionAccess({ uid: "u", emailVerified: true })).toBe("ok");
  });
});

describe("logout session resurrection", () => {
  it("discards a session request that started before logout", () => {
    expect(shouldDiscardSession(1_000, 1_500)).toBe(true);
  });

  it("keeps a session request that started after logout", () => {
    expect(shouldDiscardSession(2_000, 1_500)).toBe(false);
    expect(shouldDiscardSession(2_000, 0)).toBe(false);
  });
});

describe("research quota", () => {
  const start = Date.parse("2026-10-28T12:00:00.000Z");

  it("allows the per-minute cap and then denies", () => {
    let state: RateLimitState | null = null;
    for (let i = 0; i < RATE_LIMIT_MAX_REQUESTS; i += 1) {
      const decision = nextRateLimit(state, start);
      expect(decision.allowed).toBe(true);
      state = decision.state;
    }
    const denied = nextRateLimit(state, start + 1_000);
    expect(denied.allowed).toBe(false);
    expect(denied.reason).toBe("minute");
  });

  it("resets the minute window and enforces the daily cap", () => {
    let state: RateLimitState | null = null;
    for (let i = 0; i < RATE_LIMIT_DAILY_MAX; i += 1) {
      const decision = nextRateLimit(state, start + i * 60_000);
      expect(decision.allowed).toBe(true);
      state = decision.state;
    }
    const denied = nextRateLimit(state, start + RATE_LIMIT_DAILY_MAX * 60_000);
    expect(denied.allowed).toBe(false);
    expect(denied.reason).toBe("day");
  });
});

describe("local date ids", () => {
  it("uses the local calendar date", () => {
    const date = new Date(2026, 9, 28, 23, 30);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    expect(getLocalDateId(date)).toBe(`${date.getFullYear()}-${month}-${day}`);
  });

  it("steps back one calendar day", () => {
    expect(previousDateId("2026-03-01")).toBe("2026-02-28");
    expect(recentLocalDateIds(2, new Date(2026, 9, 28, 12))).toEqual([
      "2026-10-28",
      "2026-10-27",
    ]);
  });
});

describe("dose log normalization", () => {
  it("builds entries from takenEntryIds when the entries array is missing", () => {
    const log = normalizeDoseLog("2026-10-28", {
      dateId: "2026-10-28",
      takenEntryIds: ["supp-1:morning"],
    });
    expect(log.entries).toHaveLength(1);
    expect(log.entries[0]?.taken).toBe(true);
    expect(log.entries[0]?.scheduledTime).toBe("morning");
    expect(log.completionRate).toBe(100);
  });

  it("rejects unsafe dose ids", () => {
    expect(isValidDoseToggle("2026-10-28", "supp:morning")).toBe(true);
    expect(isValidDoseToggle("10/28/2026", "supp")).toBe(false);
    expect(isValidDoseToggle("2026-10-28", "a/b")).toBe(false);
  });
});

describe("stats updates", () => {
  it("starts a streak on the first taken dose and continues it the next day", () => {
    const first = applyDoseActivity(emptyStats(), {
      dateId: "2026-10-28",
      takenCount: 1,
      takenDelta: 1,
      supplementCount: 2,
    });
    expect(first.currentStreak).toBe(1);
    expect(first.totalDosesTaken).toBe(1);
    expect(first.totalSupplementsTracked).toBe(2);

    const second = applyDoseActivity(first, {
      dateId: "2026-10-29",
      takenCount: 1,
      takenDelta: 1,
      supplementCount: 2,
    });
    expect(second.currentStreak).toBe(2);
    expect(second.longestStreak).toBe(2);
  });

  it("counts research queries", () => {
    const next = applyResearchQuery(emptyStats());
    expect(next.totalResearchQueries).toBe(1);
  });
});
