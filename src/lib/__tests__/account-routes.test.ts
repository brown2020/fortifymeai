import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/lib/session", () => ({
  verifySessionToken: vi.fn(),
}));

vi.mock("@/lib/firebase-admin", () => ({
  adminDb: {
    collection: vi.fn(),
    batch: vi.fn(),
  },
  adminAuth: {
    deleteUser: vi.fn(),
  },
}));

import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import { adminAuth } from "@/lib/firebase-admin";
import { deleteAccount } from "@/app/(protected)/profile/actions";
import { GET, POST } from "@/app/logout/route";

describe("delete account", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not delete anything without a session", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: () => undefined,
    } as never);

    await expect(deleteAccount()).rejects.toThrow(/Unauthorized/);
    expect(adminAuth.deleteUser).not.toHaveBeenCalled();
  });

  it("starts deletion for an unverified session", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: () => ({ value: "session" }),
    } as never);
    vi.mocked(verifySessionToken).mockResolvedValue({
      uid: "user-1",
      emailVerified: false,
      claims: {} as never,
    });
    vi.mocked(adminAuth.deleteUser).mockResolvedValue(undefined);
    const collection = vi.fn();
    const { adminDb } = await import("@/lib/firebase-admin");
    vi.mocked(adminDb.collection).mockImplementation(collection);
    collection.mockImplementation((name: string) => {
      if (name === "supplements") {
        return { where: () => ({ get: async () => ({ docs: [] }) }) };
      }
      if (name === "users") {
        return {
          doc: () => ({
            listCollections: async () => [],
            delete: async () => undefined,
          }),
        };
      }
      return { doc: () => ({ delete: async () => undefined }) };
    });

    await expect(deleteAccount()).resolves.toEqual({ success: true });
    expect(adminAuth.deleteUser).toHaveBeenCalledWith("user-1");
  });
});

describe("POST /logout", () => {
  it("does not clear a session on GET", async () => {
    const response = await GET();
    expect(response.status).toBe(405);
  });

  it("rejects a cross-site POST", async () => {
    const response = await POST(
      new Request("https://fortify.example/logout", {
        method: "POST",
        headers: { origin: "https://evil.example", "sec-fetch-site": "cross-site" },
      })
    );
    expect(response.status).toBe(403);
  });
});
