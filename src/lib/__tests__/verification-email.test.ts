import { describe, expect, it, vi } from "vitest";
import {
  canResendVerification,
  formatVerificationError,
  isContinueUrlError,
  resendCooldownSeconds,
  sendWithContinueFallback,
} from "../verification-email";

describe("verification email continue URL", () => {
  it("retries without actionCodeSettings when the continue URL is rejected", async () => {
    const sendWithSettings = vi.fn(async () => {
      throw { code: "auth/unauthorized-continue-uri" };
    });
    const sendWithoutSettings = vi.fn(async () => undefined);

    await sendWithContinueFallback(sendWithSettings, sendWithoutSettings);

    expect(sendWithSettings).toHaveBeenCalledOnce();
    expect(sendWithoutSettings).toHaveBeenCalledOnce();
  });

  it("does not hide unrelated send failures", async () => {
    const sendWithoutSettings = vi.fn(async () => undefined);
    const failure = { code: "auth/too-many-requests" };

    await expect(
      sendWithContinueFallback(async () => {
        throw failure;
      }, sendWithoutSettings)
    ).rejects.toEqual(failure);
    expect(sendWithoutSettings).not.toHaveBeenCalled();
    expect(isContinueUrlError(failure)).toBe(false);
  });

  it("surfaces the fallback error instead of swallowing it", async () => {
    const fallback = { code: "auth/network-request-failed" };
    await expect(
      sendWithContinueFallback(
        async () => {
          throw { code: "auth/invalid-continue-uri" };
        },
        async () => {
          throw fallback;
        }
      )
    ).rejects.toEqual(fallback);
    expect(formatVerificationError(fallback)).toContain("auth/network-request-failed");
  });
});

describe("resend cooldown", () => {
  it("stays available when an account exists and no cooldown is running", () => {
    expect(canResendVerification(true, 1_000, 0)).toBe(true);
    expect(resendCooldownSeconds(1_000, 0)).toBe(0);
  });

  it("enables resend after the cooldown elapses", () => {
    expect(canResendVerification(true, 1_000, 5_000)).toBe(false);
    expect(resendCooldownSeconds(1_000, 5_000)).toBe(4);
    expect(canResendVerification(true, 5_000, 5_000)).toBe(true);
  });

  it("stays disabled without an account", () => {
    expect(canResendVerification(false, 5_000, 0)).toBe(false);
  });
});
