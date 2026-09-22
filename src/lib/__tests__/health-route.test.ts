import { describe, expect, it } from "vitest";
import { evaluateHealth } from "@/app/api/health/route";

describe("GET /api/health readiness", () => {
  it("is ok when public Firebase config is present", () => {
    const result = evaluateHealth({
      NEXT_PUBLIC_FIREBASE_API_KEY: "test-key",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "fortifymeai",
      FIREBASE_PROJECT_ID: "fortifymeai",
      FIREBASE_CLIENT_EMAIL: "svc@example.com",
      FIREBASE_PRIVATE_KEY:
        "-----BEGIN PRIVATE KEY-----\nX\n-----END PRIVATE KEY-----\n",
    });

    expect(result.ok).toBe(true);
    expect(result.service).toBe("fortifymeai");
    expect(result.checks.firebase_public).toBe(true);
    expect(result.checks.firebase_admin).toBe(true);
  });

  it("returns not-ok without public Firebase config", () => {
    const result = evaluateHealth({});
    expect(result.ok).toBe(false);
    expect(result.checks.firebase_public).toBe(false);
    expect(result.checks.firebase_admin).toBe(false);
  });
});
