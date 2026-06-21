# Auth UI

## Sign-In And Sign-Up Layout

- Existing Fortify.me auth shell retained for visual consistency.
- Sign-in now includes password sign-in, Google sign-in, email-link sign-in, forgot-password recovery, user-facing success/error states, and safe callback handling.
- Sign-up now routes unverified email/password users to `/verify-email` after account creation.
- New `/forgot-password`, `/verify-email`, and `/auth/action` screens use the same card shell and status/error patterns.

## Password Visibility Controls

| Field | Eye Toggle Present | Hidden By Default | Accessible Label Updates | Independent State | Evidence |
| --- | --- | --- | --- | --- | --- |
| Sign-in password | Yes | Yes | Yes | Yes | `src/components/auth/password-field.tsx`, `src/app/(auth)/login/page.tsx` |
| Sign-up password | Yes | Yes | Yes | Yes | `src/app/(auth)/signup/page.tsx` |
| Confirm password | Yes | Yes | Yes | Yes | `src/app/(auth)/signup/page.tsx` |
| Reset/change password | Yes | Yes | Yes | Yes | `src/app/(auth)/auth/action/page.tsx` |

## Forgot Password And Email Action States

- `/forgot-password` sends Firebase password reset emails with app action URL settings.
- `/auth/action` handles verify-email action codes, reset-password action codes, and email-link sign-in completion.
- Reset-password action includes independent new-password and confirm-password eye toggles.
- Email-link completion asks for the email address if same-device local storage is unavailable.

## Verify Email State

- `/verify-email` shows signed-out and signed-in states.
- Signed-in users can resend verification email and refresh the Firebase user verification status.
- Email/password sign-up sends a best-effort verification email, then routes users to `/verify-email`.

## Accessibility And Responsive QA

- Password toggle buttons use `type="button"`, `aria-label`, and `aria-pressed`.
- Form errors/status messages are visible in page cards.
- Build/static HTML checks confirmed signup, forgot-password, verify-email, and footer recovery content.
- Full provider submit QA remains dependent on Firebase Console provider/action URL setup and available test users.
