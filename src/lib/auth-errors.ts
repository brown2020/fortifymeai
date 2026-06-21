const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Email or password did not match.",
  "auth/user-not-found": "Email or password did not match.",
  "auth/wrong-password": "Email or password did not match.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Use a stronger password with at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Wait a bit, then try again.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/popup-blocked": "Your browser blocked the Google sign-in popup.",
  "auth/popup-closed-by-user": "Google sign-in was canceled.",
  "auth/cancelled-popup-request": "Google sign-in was canceled.",
  "auth/account-exists-with-different-credential":
    "This email already uses a different sign-in method.",
  "auth/credential-already-in-use": "This sign-in method is already linked to another account.",
  "auth/provider-already-linked": "This sign-in method is already linked.",
  "auth/requires-recent-login": "Please sign in again before making this change.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/invalid-action-code": "This link is invalid or has already been used.",
  "auth/expired-action-code": "This link has expired. Request a new one.",
  "auth/missing-email": "Enter your email address.",
};

export function getAuthErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
) {
  if (typeof error === "object" && error && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string" && AUTH_ERROR_MESSAGES[code]) {
      return AUTH_ERROR_MESSAGES[code];
    }
  }

  if (error instanceof Error && error.message) {
    if (error.message.toLowerCase().includes("session")) {
      return "Your secure session could not be created. Please try signing in again.";
    }
  }

  return fallback;
}
