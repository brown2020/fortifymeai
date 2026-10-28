import { getAuthErrorMessage } from "@/lib/auth-errors";

/** Firebase rejects continue URLs whose host is not an authorized domain. */
const CONTINUE_URL_ERROR_CODES = new Set([
  "auth/unauthorized-continue-uri",
  "auth/invalid-continue-uri",
  "auth/missing-continue-uri",
  "auth/argument-error",
]);

export const RESEND_COOLDOWN_MS = 15_000;

export function authErrorCode(error: unknown): string {
  if (typeof error === "object" && error && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : "";
  }
  return "";
}

export function isContinueUrlError(error: unknown): boolean {
  return CONTINUE_URL_ERROR_CODES.has(authErrorCode(error));
}

/**
 * Preview hosts are not Firebase authorized domains, so actionCodeSettings
 * built from window.location.origin fail with auth/unauthorized-continue-uri.
 * Retry once with Firebase's default continue URL, and surface any other error.
 */
export async function sendWithContinueFallback(
  sendWithSettings: () => Promise<void>,
  sendWithoutSettings: () => Promise<void>
): Promise<void> {
  try {
    await sendWithSettings();
  } catch (error) {
    if (!isContinueUrlError(error)) throw error;
    await sendWithoutSettings();
  }
}

export function formatVerificationError(error: unknown): string {
  const code = authErrorCode(error);
  if (!code && error instanceof Error && error.message) return error.message;
  const message = getAuthErrorMessage(
    error,
    "We could not send a verification email."
  );
  if (!code || message.includes(code)) return message;
  return `${message} (${code})`;
}

export function resendCooldownSeconds(now: number, cooldownUntil: number): number {
  if (cooldownUntil <= now) return 0;
  return Math.ceil((cooldownUntil - now) / 1000);
}

export function canResendVerification(
  hasAccount: boolean,
  now: number,
  cooldownUntil: number
): boolean {
  return hasAccount && now >= cooldownUntil;
}
