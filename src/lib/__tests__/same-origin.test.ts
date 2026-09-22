import { describe, expect, it } from "vitest";
import { isSameOriginRequest } from "../same-origin";
import { getSafeRedirectPath } from "../safe-redirect";

describe("isSameOriginRequest", () => {
  const url = "http://localhost:3100/api/auth/session";

  it("allows missing origin (non-browser or same-origin navigation)", () => {
    expect(isSameOriginRequest(url, null, null)).toBe(true);
  });

  it("allows matching origin", () => {
    expect(isSameOriginRequest(url, "http://localhost:3100", "same-origin")).toBe(true);
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
