# Session And Proxy

## Auth State Model

| State | Source Of Truth | UI Behavior | Server Behavior | Verification |
| --- | --- | --- | --- | --- |
| Unknown/bootstrap | Firebase observer plus session sync | Hide protected links while `loading` | No protected data without cookie | Source/build |
| Signed out | No Firebase user/session cookie | Public nav and auth routes | Protected routes redirect | HTTP QA |
| Signed in unverified | Firebase user with `emailVerified=false` | `/verify-email` recovery state | Session may exist; product currently guides rather than blocks all app routes | Source/build |
| Signed in verified | Firebase user plus Admin session cookie | Protected nav/account menu | Layout/API/actions verify session cookie | Build/source |
| Admin | None configured | No admin UI | No admin routes found | Discovery |
| Stale/invalid | Server rejects session or session sync fails | Client signs out/conservative state | Cookie rejected/cleared via logout paths | HTTP negative checks |
| Signing out | Auth store logout | Clear user state and broadcast | DELETE `/api/auth/session` clears cookie | HTTP QA |

## Session Endpoints

- `/api/auth/session` POST now verifies Firebase ID token and creates a Firebase Admin session cookie.
- `/api/auth/session` DELETE clears the cookie with matching path/sameSite/secure/httpOnly options.
- Same-origin/Fetch Metadata guard rejects cross-origin session mutation attempts.
- `jose` custom JWT dependency removed.

## Bootstrap And Refresh

- `AuthProvider` now uses `onIdTokenChanged`, refreshes the server session when Firebase user/token changes, and clears server session when Firebase user is absent.
- Cross-tab logout uses `BroadcastChannel` plus a storage event fallback.

## Server Verification

- `verifySessionToken` now verifies Firebase Admin session cookies with revocation checks.
- Protected layout, research API, research actions, dashboard actions, and dashboard data continue to call the shared session verifier.

## proxy.ts

- Added `src/proxy.ts` beside `src/app` so Next.js includes the proxy in a `src` project.
- Matcher covers auth-only and protected page routes.
- Signed-out protected route QA: `/dashboard` redirects to `/login?callbackUrl=%2Fdashboard` on the fresh production server.

## Route Protection Matrix

| Scenario | Result | Evidence | Notes |
| --- | --- | --- | --- |
| Public route signed out | Pass | `curl -I /login`, `/signup`, `/forgot-password`, `/auth/action` returned 200 on built server | Static auth pages public. |
| Auth-only route signed in | Not run | Needs a valid Firebase session cookie/test user | Proxy code redirects session users to `/dashboard`. |
| Protected page signed out | Pass | `curl -I /dashboard` returned `307` to `/login?callbackUrl=%2Fdashboard` | Fresh `next start` after build. |
| Protected API/server action signed out | Pass | Source checks `fortify_session_v1`; invalid/no token returns Unauthorized in API paths | Direct server action unauthenticated invocation not separately scripted. |
| Protected data not public/static cached | Pass | Protected routes show dynamic in build output | Proxy/layout/server checks remain. |
| Admin route non-admin | N/A | No admin route found | Future admin requires server-only UID/claim policy. |
| Admin route admin | N/A | No admin route found | Future admin requires server-only UID/claim policy. |
| Stale/revoked session | Partial | `verifySessionCookie(token, true)` source; invalid token POST returns 401 | Revoked Firebase session requires real test user/admin action. |

## Admin Routes

- No admin pages, APIs, links, env usage, or custom-claim checks found.
- `ADMIN_UID`/`ADMIN_UIDS` should be added only when admin surfaces exist.

## Drift And Cache Cleanup

- Auth store hard logout clears Firebase state, server session, session storage, auth-related local storage, and broadcasts logout.
- AuthProvider clears conservative state on session sync failure.
- Route/router cache is reset via hard navigation in navbar/footer/profile sign-out handlers.
