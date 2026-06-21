# Auth Inventory

## Sources Read

- `SPEC.md`: describes Firebase client Auth, Zustand auth store, and signed HTTP-only `fortify_session_v1` cookie; explicitly notes there is no `proxy.ts` or `middleware.ts`.
- `README.md`: documents Firebase client env names, Firebase Admin env names, and the lint/build scripts.
- `package.json`: includes `firebase` and `firebase-admin`; no Clerk, NextAuth/Auth.js, Auth0, Supabase Auth, WorkOS, Cognito, or auth test packages.
- `src/lib/firebase.ts`, `src/lib/firebase-admin.ts`, `src/lib/store/auth-store.ts`, `src/components/providers/AuthProvider.tsx`.
- `src/app/(auth)/login/page.tsx`, `src/app/(auth)/signup/page.tsx`, `src/app/(protected)/layout.tsx`, `src/app/api/auth/session/route.ts`, `src/app/logout/route.ts`.
- `src/components/Navbar.tsx`, `src/app/page.tsx`, `src/app/(protected)/profile/page.tsx`.
- `src/app/api/research/route.ts`, `src/app/(protected)/research/actions.ts`, `src/app/(protected)/dashboard/actions.ts`.
- `firestore.rules`, `firebase.json`.
- Official references checked: Next.js Proxy docs and Firebase Auth session-cookie/email-link/password docs.

## Framework And Firebase

- Framework: Next.js App Router with `src/app` routes.
- Firebase client SDK: `src/lib/firebase.ts` initializes app/auth/firestore from `NEXT_PUBLIC_FIREBASE_*`.
- Firebase Admin SDK: `src/lib/firebase-admin.ts` initializes Admin Auth/Firestore from server env vars, falling back to default app init when cert init fails.
- Local env files exist and are ignored by Git; variable names include client Firebase config, Firebase Admin config, and AI keys. Secret values were not recorded.

## Current Auth Provider

| Provider | Evidence | Verdict | Replacement Needed |
| --- | --- | --- | --- |
| Firebase | `firebase`, `firebase-admin`, Firebase client/admin init, `GoogleAuthProvider`, email/password auth store, Admin ID-token verification. | Present/current provider | No provider replacement needed; hardening needed. |
| Clerk | No package/import/env evidence. | Absent | No |
| NextAuth/Auth.js | No package/import/env evidence. | Absent | No |
| Auth0 | No package/import/env evidence. | Absent | No |
| Supabase Auth | No package/import/env evidence. | Absent | No |
| WorkOS/AuthKit | No package/import/env evidence. | Absent | No |
| Cognito/Amplify | No package/import/env evidence. | Absent | No |
| Custom auth | `src/lib/session.ts` currently mints/verifies a custom JWT session cookie after Firebase ID-token verification. | Mixed session layer | Replace custom session token with Firebase Admin session cookie where practical. |

## Firebase Setup Gate

- Project/Web app: client Firebase env names are documented in README and present locally by variable name.
- Admin SDK: server env names are documented in README and present locally by variable name.
- Google provider: code path exists through `GoogleAuthProvider`; Firebase Console provider status cannot be proven locally.
- Email/password: code path exists through Firebase `signInWithEmailAndPassword` and `createUserWithEmailAndPassword`; Firebase Console provider status cannot be proven locally.
- Email link/passwordless: no code path yet; Firebase Console provider status cannot be proven locally.
- Password reset and email verification: no code path yet.
- Authorized domains and email action URLs: cannot be proven locally; must be confirmed in Firebase Console for production.
- Admin UID env: no admin routes discovered; no `ADMIN_UID`/`ADMIN_UIDS` usage discovered.

## Route Classes

| Route | Class | Evidence | Required Guard |
| --- | --- | --- | --- |
| `/` | Public | `src/app/page.tsx` | Public; footer hard sign-out recovery control required. |
| `/login`, `/signup` | Auth-only | `src/app/(auth)` pages | Redirect authenticated users away without unsafe callback URLs. |
| `/dashboard`, `/supplements`, `/health`, `/analytics`, `/calendar`, `/research`, `/profile` | Protected | `src/app/(protected)/layout.tsx` plus SPEC route list | Proxy and layout/server verification. |
| `/api/auth/session` | Public/session endpoint | `src/app/api/auth/session/route.ts` | Same-origin/CSRF guard; Firebase ID-token verification on POST; cookie clear on DELETE. |
| `/api/research` | Protected API | `src/app/api/research/route.ts` | Verified session cookie before model call. |
| Research and dashboard server actions | Protected server actions | `src/app/(protected)/research/actions.ts`, `src/app/(protected)/dashboard/actions.ts` | Verified session cookie before Firestore Admin work. |
| `/logout` | Public recovery/logout | `src/app/logout/route.ts` | Clear server session safely in signed-in, signed-out, stale states. |
| Admin routes | None found | No `/admin`, admin APIs, admin env usage, or custom claim checks found. | Add server-only admin helpers when admin routes are introduced. |

## Auth State Sources

- Client: Zustand store in `src/lib/store/auth-store.ts`, driven by Firebase `onAuthStateChanged` in `src/components/providers/AuthProvider.tsx`.
- Server: `src/app/(protected)/layout.tsx`, `/api/research`, and server actions read `fortify_session_v1` and call `verifySessionToken`.
- Drift risk: navbar visibility is based on client Firebase state only; server session can disagree after expiry/revocation.
- Drift risk: logout clears server endpoint and Firebase client state, but only clears `sessionStorage`; no cross-tab notification, localStorage cleanup, router refresh, or footer hard sign-out.

## Auth State Model And Drift Risks

| State Or Drift Case | Evidence | Expected Behavior | Verification |
| --- | --- | --- | --- |
| Unknown/bootstrap | `AuthProvider` starts loading true until Firebase observer returns. | Hide protected/admin links and show stable public UI while unknown. | Browser QA. |
| Signed out | Navbar shows sign-in/sign-up after loading false and no user. | Public UI only; protected routes redirect to login. | Browser/API QA. |
| Signed in unverified | No email verification checks currently. | Email/password users should see unverified state and resend action. | Implement and QA. |
| Signed in verified | Firebase user and server session both valid. | Protected pages/API allowed. | Build plus route QA. |
| Admin | No admin route/env found. | No admin UI exposed; future admin must use server-only `ADMIN_UID`/`ADMIN_UIDS` or custom claims. | Report as not applicable. |
| Stale/invalid session | Protected layout redirects invalid cookie; client navbar can still show Firebase user. | Conservative signed-out or session refresh; clear stale state. | Implement status/refresh behavior where scoped. |
| Signing out | Auth store calls DELETE session then Firebase signOut. | Idempotently clear Firebase, server cookie, caches/storage, cross-tab state, and route state. | Implement hard sign-out and QA. |
| Client/server mismatch | Current navbar is client-only; server session is custom JWT. | Server session truth should be Firebase Admin session cookie and client should refresh/clear on mismatch. | Implement session-cookie verification and status endpoint. |
| Cross-tab logout | No storage/BroadcastChannel handling found. | Other tabs should clear UI or require fresh bootstrap after logout. | Implement BroadcastChannel/storage event. |

## Navbar Account Avatar Footer

- Navbar: client-only Firebase user state controls protected links; no dropdown/avatar; desktop has direct sign-out button.
- Account/profile: profile page shows email, placeholder password change, session sign-out, and unimplemented account deletion.
- Avatar: no uploaded avatar or Firebase photoURL rendering found.
- Footer: public homepage footer has no hard sign-out recovery control.

## Gaps And Risks

- Missing `proxy.ts` despite Next.js 16 Proxy convention and workflow requirement.
- Session cookie is a custom JWT rather than Firebase Admin `createSessionCookie`/`verifySessionCookie`.
- Session endpoint has no same-origin/CSRF guard.
- No forgot-password page, email-link flow, email verification UI, or auth action handler.
- Password fields lack eye/eye-off visibility toggles.
- Firebase auth errors are shown through raw error messages rather than centralized user-safe mapping.
- Navbar/account state is client-only and can drift from server truth.
- Logout is not a full hard sign-out and no footer recovery action exists.
- No tests configured; validation must rely on lint/build plus browser/API QA.
- Firebase Console provider enablement, authorized domains, and email action URLs cannot be confirmed locally.

## Baseline Commands

- Preflight Git read/fetch/pull/dry-run push: pass.
- `npm run lint -- --max-warnings=0`: to run after edits.
- `npm run build`: to run after edits.
