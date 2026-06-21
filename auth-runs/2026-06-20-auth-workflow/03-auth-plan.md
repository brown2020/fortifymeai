# Auth Architecture Plan

## Route Policy

- Public: `/`, `/logout`, `/forgot-password`, `/auth/action`, static assets, `/api/auth/session`.
- Auth-only: `/login`, `/signup`; authenticated sessions redirect to `/dashboard`.
- Protected: `/dashboard`, `/supplements`, `/health`, `/analytics`, `/calendar`, `/research`, `/profile`.
- Admin: none currently discovered; future admin routes must use server-only `ADMIN_UID`/`ADMIN_UIDS` or verified custom claims.

## Session Truth Model

- Use Firebase Admin session cookies in `fortify_session_v1` as server truth.
- POST `/api/auth/session` verifies a Firebase ID token, checks same-origin request headers, and sets an HttpOnly cookie.
- DELETE `/api/auth/session` clears the same cookie with matching options and is safe when already signed out.
- `verifySessionToken` verifies Firebase Admin session cookies and returns UID/email/verification/admin-safe fields without exposing secrets.
- Client Firebase state personalizes UI but cannot authorize protected server data.

## Admin UID Source

- No admin routes exist in this repo today.
- Do not expose admin UIDs client-side.
- Add server-only parsing helper only when admin routes are introduced.

## Owned Files

- Session/server truth: `src/lib/session.ts`, `src/app/api/auth/session/route.ts`, `src/app/logout/route.ts`, `src/app/(protected)/layout.tsx`, `src/proxy.ts`.
- Auth client/provider: `src/lib/store/auth-store.ts`, `src/components/providers/AuthProvider.tsx`.
- Auth UI: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/signup/page.tsx`, new forgot/action/verify UI as needed.
- Navigation/sign-out: `src/components/Navbar.tsx`, `src/app/page.tsx`, `src/app/(protected)/profile/page.tsx`.
- Docs/reports: auth run reports and README/SPEC only if behavior docs need updates.

## Validation Plan

- `npm run lint -- --max-warnings=0`
- `npm run build`
- Browser/API QA on localhost for `/login`, `/signup`, forgot/reset page, protected redirect, footer hard sign-out, navbar sign-out, and session endpoint behavior where local provider setup allows.
- Record Firebase Console provider/domain/action URL items that cannot be verified locally.
