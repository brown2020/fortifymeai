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
import { saveSearch } from "@/app/(protected)/research/actions";

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

  it("returns failure for invalid session token", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: () => ({ value: "forged" }),
    } as never);
    vi.mocked(verifySessionToken).mockResolvedValue(null);
    const result = await saveSearch("magnesium", "answer", "general");
    expect(result.success).toBe(false);
  });
});
