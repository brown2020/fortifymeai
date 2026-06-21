# Auth Add-Ons

## Implemented

- Firebase Admin session-cookie truth.
- Same-origin guard for session endpoint.
- User-safe auth error mapper.
- Password reset and email verification recovery.
- Email-link sign-in code path.
- Footer hard sign-out and cross-tab logout broadcast.
- Safe relative callback handling retained.

## Deferred

- MFA/passkeys/WebAuthn: product decision needed.
- Account deletion/data export: existing profile UI marks deletion unimplemented.
- Uploaded account avatar: no product storage flow exists yet.
- Auth emulator/test users/Playwright auth tests: no test framework configured.
- Custom branded email action templates: Firebase Console/product work.
- Admin UID/custom claims: no admin routes exist yet.

## Proposed For Approval

- Add Playwright auth smoke tests with Firebase Auth Emulator and seeded users.
- Add an account security page for recent-login flows, provider linking, account deletion, and data export.
- Add admin route policy only when an admin surface is introduced.
