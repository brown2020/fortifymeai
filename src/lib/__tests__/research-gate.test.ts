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
  },
}));

import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import { adminDb } from "@/lib/firebase-admin";
import { saveSearch } from "@/app/(protected)/research/actions";
import { clampHistoryLimit } from "@/lib/history-limit";

describe("research server action auth gate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns failure without session (does not write)", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: () => undefined,
    } as never);
    const result = await saveSearch("magnesium", "answer", "general");
    expect(result.success).toBe(false);
    expect(result.id).toBeUndefined();
  });

  it("does not write when the session email is unverified", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: () => ({ value: "session" }),
    } as never);
    vi.mocked(verifySessionToken).mockResolvedValue({
      uid: "user-1",
      emailVerified: false,
      claims: {} as never,
    });
    const result = await saveSearch("magnesium", "answer", "general");
    expect(result.success).toBe(false);
    expect(adminDb.collection).not.toHaveBeenCalled();
  });

  it("rejects an oversized query before writing", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: () => ({ value: "session" }),
    } as never);
    vi.mocked(verifySessionToken).mockResolvedValue({
      uid: "user-1",
      emailVerified: true,
      claims: {} as never,
    });
    const result = await saveSearch("m".repeat(8_001), "answer", "general");
    expect(result.success).toBe(false);
    expect(adminDb.collection).not.toHaveBeenCalled();
  });

  it("caps history reads", () => {
    expect(clampHistoryLimit(undefined)).toBe(20);
    expect(clampHistoryLimit(0)).toBe(1);
    expect(clampHistoryLimit(10_000)).toBe(50);
  });

  it("returns failure for invalid session token", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: () => ({ value: "forged" }),
    } as never);
    vi.mocked(verifySessionToken).mockResolvedValue(null);
    const result = await saveSearch("magnesium", "answer", "general");
    expect(result.success).toBe(false);
  });
});
