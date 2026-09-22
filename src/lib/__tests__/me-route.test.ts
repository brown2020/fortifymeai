import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/lib/session", () => ({
  verifySessionToken: vi.fn(),
}));

import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import { GET } from "@/app/api/me/route";

describe("GET /api/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when session cookie is missing", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: () => undefined,
    } as never);

    const res = await GET();
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ user: null });
  });

  it("returns session identity when cookie is valid", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: () => ({ value: "good-token" }),
    } as never);
    vi.mocked(verifySessionToken).mockResolvedValue({
      uid: "uid-1",
      email: "user@example.com",
      emailVerified: true,
      claims: {} as never,
    });

    const res = await GET();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      user: {
        uid: "uid-1",
        email: "user@example.com",
        emailVerified: true,
      },
    });
  });
});
