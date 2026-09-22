import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/lib/session", () => ({
  verifySessionToken: vi.fn(),
}));

vi.mock("@/lib/firebase-admin", () => ({
  adminDb: {
    collection: vi.fn(),
    runTransaction: vi.fn(),
  },
}));

import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import { toggleDoseEntry, getDoseLogTakenEntryIds } from "@/app/(protected)/dashboard/actions";

describe("dashboard server action auth gate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies toggleDoseEntry without session cookie", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: () => undefined,
    } as never);
    await expect(toggleDoseEntry("2026-09-21", "entry-1")).rejects.toThrow(
      /Unauthorized/
    );
  });

  it("denies getDoseLogTakenEntryIds with invalid session", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: () => ({ value: "bad" }),
    } as never);
    vi.mocked(verifySessionToken).mockResolvedValue(null);
    await expect(getDoseLogTakenEntryIds("2026-09-21")).rejects.toThrow(
      /Unauthorized/
    );
  });
});
