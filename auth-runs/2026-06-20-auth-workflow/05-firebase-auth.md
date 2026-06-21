# Firebase Auth

## Providers

- Email/password sign-in and sign-up remain Firebase-native.
- Google sign-in remains Firebase-native with `GoogleAuthProvider`.
- Email-link sign-in added with `sendSignInLinkToEmail` and `signInWithEmailLink`.
- Password reset added with `sendPasswordResetEmail`, `verifyPasswordResetCode`, and `confirmPasswordReset`.
- External setup still to confirm: Google provider, Email/Password provider, Email link provider, authorized domains, and action URL domains in Firebase Console.

## Email Verification

- Sign-up sends a best-effort Firebase verification email using the app auth action URL.
- `/verify-email` provides resend and refresh actions for signed-in users.
- `/auth/action?mode=verifyEmail` applies Firebase verification codes and shows a user-facing result.

## Error Mapping

- Added `src/lib/auth-errors.ts` to map common Firebase error codes to user-safe copy.
- Login, signup, forgot-password, verify-email, profile password reset, and auth action flows use mapped errors.
- Session endpoint avoids exposing server credential details in production responses.

## Account/Profile

- Profile password "Change" now sends a real password reset email instead of a placeholder toast.
- Navbar account menu added with account link, sign-out, and initials/Firebase Google photo avatar when the photo host is safe.
- Account deletion remains an explicit future task.
