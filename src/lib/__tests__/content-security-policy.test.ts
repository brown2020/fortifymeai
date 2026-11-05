import { describe, expect, it } from "vitest";

import { CONTENT_SECURITY_POLICY } from "../content-security-policy";

function directive(name: string): string {
  const match = CONTENT_SECURITY_POLICY.split("; ").find((entry) => entry.startsWith(`${name} `));
  if (!match) {
    throw new Error(`missing CSP directive ${name}`);
  }
  return match;
}

describe("content security policy", () => {
  it("allows Firebase Analytics gtag without dropping Auth hosts", () => {
    expect(directive("script-src")).toContain("https://apis.google.com");
    expect(directive("script-src")).toContain("https://www.googletagmanager.com");
    expect(directive("img-src")).toContain("https://www.googletagmanager.com");
    expect(directive("img-src")).toContain("https://*.google-analytics.com");
    expect(directive("connect-src")).toContain("https://*.googleapis.com");
    expect(directive("connect-src")).toContain("https://accounts.google.com");
    expect(directive("connect-src")).toContain("https://www.googletagmanager.com");
    expect(directive("connect-src")).toContain("https://*.google-analytics.com");
    expect(directive("connect-src")).toContain("https://*.analytics.google.com");
    expect(directive("connect-src")).not.toContain("https://*.google.com");
    expect(directive("frame-src")).toContain("https://accounts.google.com");
  });
});
