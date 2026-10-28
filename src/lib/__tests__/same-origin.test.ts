import { describe, expect, it } from "vitest";
import { isSameOriginRequest } from "../same-origin";
import { getSafeRedirectPath } from "../safe-redirect";

describe("isSameOriginRequest", () => {
  const url = "http://localhost:3100/api/auth/session";

  it("rejects cookie requests that omit Origin", () => {
    expect(isSameOriginRequest(url, null, null)).toBe(false);
    expect(isSameOriginRequest(url, null, "same-origin")).toBe(false);
  });

  it("allows matching origin", () => {
    expect(isSameOriginRequest(url, "http://localhost:3100", "same-origin")).toBe(true);
  });

  it("treats 127.0.0.1 and localhost as the same local origin", () => {
    expect(
      isSameOriginRequest(
        "http://localhost:3100/api/auth/session",
        "http://127.0.0.1:3100",
        "same-origin"
      )
    ).toBe(true);
    expect(
      isSameOriginRequest(
        "http://127.0.0.1:3100/api/auth/session",
        "http://localhost:3100",
        "same-origin"
      )
    ).toBe(true);
  });

  it("denies cross-origin attackers", () => {
    expect(isSameOriginRequest(url, "https://evil.example", "cross-site")).toBe(false);
  });
});

describe("getSafeRedirectPath", () => {
  it("rejects open redirects", () => {
    expect(getSafeRedirectPath("https://evil.example", "/dashboard")).toBe("/dashboard");
    expect(getSafeRedirectPath("//evil.example", "/dashboard")).toBe("/dashboard");
  });

  it("allows internal paths", () => {
    expect(getSafeRedirectPath("/supplements", "/dashboard")).toBe("/supplements");
  });
});
