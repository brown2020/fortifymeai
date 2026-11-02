import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/lib/session", () => ({
  createSessionCookie: vi.fn(),
}));

import { cookies } from "next/headers";
import { createSessionCookie } from "@/lib/session";
import { DELETE, POST } from "@/app/api/auth/session/route";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

const appOrigin = "https://fortify.example";

function sessionRequest(
  body: unknown,
  headers: Record<string, string> = {}
) {
  return new Request(`${appOrigin}/api/auth/session`, {
    method: "POST",
    headers: {
      origin: appOrigin,
      "sec-fetch-site": "same-origin",
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects a cross-site session exchange", async () => {
    const response = await POST(
      new Request(`${appOrigin}/api/auth/session`, {
        method: "POST",
        headers: {
          origin: "https://evil.example",
          "sec-fetch-site": "cross-site",
          "content-type": "application/json",
        },
        body: JSON.stringify({ idToken: "tok" }),
      })
    );

    expect(response.status).toBe(403);
    expect(createSessionCookie).not.toHaveBeenCalled();
  });

  it("rejects an empty id token", async () => {
    const response = await POST(sessionRequest({ idToken: "" }));

    expect(response.status).toBe(400);
    expect(createSessionCookie).not.toHaveBeenCalled();
  });

  it("sets the httpOnly session cookie after a valid id token", async () => {
    const set = vi.fn();
    vi.mocked(cookies).mockResolvedValue({ set } as never);
    vi.mocked(createSessionCookie).mockResolvedValue({
      decodedToken: { uid: "uid-1" } as never,
      sessionCookie: "signed-session",
    });

    const response = await POST(sessionRequest({ idToken: "good-token" }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      status: "success",
      uid: "uid-1",
    });
    expect(createSessionCookie).toHaveBeenCalledWith("good-token");
    expect(set).toHaveBeenCalledWith(
      SESSION_COOKIE_NAME,
      "signed-session",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
        sameSite: "lax",
      })
    );
  });

  it("returns 401 when the id token is rejected", async () => {
    vi.mocked(cookies).mockResolvedValue({ set: vi.fn() } as never);
    vi.mocked(createSessionCookie).mockRejectedValue(new Error("Firebase ID token has expired"));

    const response = await POST(sessionRequest({ idToken: "expired" }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Invalid ID token" });
  });
});

describe("DELETE /api/auth/session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clears the session cookie for a same-origin logout", async () => {
    const set = vi.fn();
    vi.mocked(cookies).mockResolvedValue({ set } as never);

    const response = await DELETE(
      new Request(`${appOrigin}/api/auth/session`, {
        method: "DELETE",
        headers: { origin: appOrigin, "sec-fetch-site": "same-origin" },
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "success" });
    expect(set).toHaveBeenCalledWith(
      SESSION_COOKIE_NAME,
      "",
      expect.objectContaining({ maxAge: 0, httpOnly: true })
    );
  });
});
