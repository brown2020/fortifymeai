# Auth Provider Migration

## Provider Verdict

- Verdict: Firebase with a custom session layer.
- Evidence: `package.json` includes `firebase`/`firebase-admin`; `src/lib/store/auth-store.ts` uses Firebase password and Google providers; `/api/auth/session` verifies Firebase ID tokens; `src/lib/session.ts` signs a custom cookie JWT.
- Replacement needed: No old third-party provider replacement. Replace/repair the custom session-token layer with Firebase Admin session-cookie truth where practical.

## Old Auth Surfaces

| Surface | Evidence | Firebase Replacement | Remove/Keep/Defer | Notes |
| --- | --- | --- | --- | --- |
| Packages | No non-Firebase auth packages found. | Keep Firebase packages. | Keep | No removal needed. |
| Routes/callbacks | `/api/auth/session`, `/logout`; no old provider callbacks. | Add Firebase email action routes/pages. | Keep/extend | No Clerk/NextAuth/Auth0/etc. routes found. |
| Middleware/proxy | No `proxy.ts` or `middleware.ts`. | Add `proxy.ts` using session cookie for early route redirects. | Add | Keep protected layout as server boundary too. |
| Cookies/storage | `fortify_session_v1`; `sessionStorage.clear()` on logout. | Firebase Admin session cookie plus hard cleanup. | Repair | Old-provider remnants not found. |
| Env vars | Firebase client/admin env names documented. | Firebase Admin session cookies do not need a custom JWT secret. | Keep Firebase docs current. | No secret values recorded. |
| UI components | Login/signup/profile/navbar/footer. | Firebase-native forgot/reset/email-link/verification/toggles/signout. | Extend | Maintain app styling. |
| Tests/mocks | No test files/scripts found. | Use lint/build/browser/API QA. | Defer tests | Recommend future Playwright/auth emulator coverage. |

## Firebase Setup Checklist

| Item | Status | Evidence Or User Action |
| --- | --- | --- |
| Firebase project selected/created | Unknown | TBD |
| Web app registered | Local evidence | Client env names exist locally by variable name. |
| Client env names documented | Complete | README lists `NEXT_PUBLIC_FIREBASE_*`; local ignored env has matching names. |
| Authentication enabled | Unknown | Must confirm in Firebase Console. |
| Google provider enabled | Unknown | Code is ready; must confirm provider in Firebase Console. |
| Email/password enabled | Unknown | Code is ready; must confirm provider in Firebase Console. |
| Email link enabled if needed | Unknown | Code to add; provider must be enabled in Firebase Console. |
| Authorized domains set | Unknown | Must include localhost and production domains in Firebase Console. |
| Email action URLs set | Unknown | Must configure verify/reset/email-link continue URLs in Firebase Console. |
| Admin SDK server env ready | Local evidence | Server env names exist locally by variable name and README documents them. |
| ADMIN_UID/ADMIN_UIDS server env ready | Not applicable now | No admin routes found; document requirement for future admin routes. |

## Migration Plan

1. Keep Firebase as provider; add missing Firebase-native password reset, email-link, and email verification code paths.
2. Replace custom JWT session helper with Firebase Admin session-cookie creation/verification and keep the cookie name stable.
3. Add same-origin request guard to session POST/DELETE.
4. Add `proxy.ts` for auth-only and protected pages.
5. Repair UI state coverage, password toggles, user-safe auth errors, navbar/avatar/dropdown, and footer hard sign-out.

## User Setup Handoff

External Firebase Console confirmations still needed after local implementation:

- Authentication is enabled.
- Google provider is enabled.
- Email/password provider is enabled.
- Email link/passwordless provider is enabled if the email-link UI is used.
- Authorized domains include local and production domains.
- Email action/continue URL domains are configured for reset, verify, and email-link flows.

## Result

- Migration phase can proceed locally because Firebase is already the provider and required env variable names are present.
- External provider setup remains a QA/setup checklist rather than invented in code.
