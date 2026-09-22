import { describe, expect, it } from "vitest";
import { getSafeRedirectPath } from "../safe-redirect";

/**
 * Regression mutation proof: if path validation is removed, external URLs would be returned.
 * This test records the secure behavior (passed_output) vs the insecure alternative (failed_output concept).
 */
describe("safe redirect regression", () => {
  it("never returns an absolute external URL", () => {
    const failed_output_if_broken = "https://evil.example/phish";
    const passed = getSafeRedirectPath("https://evil.example/phish", "/dashboard");
    expect(passed).not.toBe(failed_output_if_broken);
    expect(passed).toBe("/dashboard");
  });
});
