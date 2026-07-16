# Auth Inventory

## Sources Read

- `spec.md`, `README.md`, the 2026-06-20 auth report, package manifests, server Firebase initialization, session helpers, proxy, protected layout, auth provider/store, and route inventory.

## Framework And Provider

- Next.js 16 App Router using Firebase client Auth and Firebase Admin session cookies.
- Firebase is the sole provider; no Clerk, Auth.js, Auth0, Supabase, WorkOS, or Cognito surface was found.
- Server truth remains the `fortify_session_v1` cookie verified through Firebase Admin.

## Deployment Failure

- `firebase-admin@14.1.0` resolved `jwks-rsa@4.1.0` and ESM-only `jose@6.2.3`.
- `jwks-rsa/src/utils.js` calls `require("jose")`; the exported hosting handler rejected that call with `ERR_REQUIRE_ESM`.
- The same failure was reproduced locally with `node --no-experimental-require-module`.

## Route Policy

- Public: `/`, recovery/email-action routes, logout, and the session endpoint.
- Auth-only: `/login`, `/signup`.
- Protected: dashboard, supplements, health, analytics, calendar, research, and profile.
- Admin: none.

## Risk And Baseline

- Risk: all server paths importing Firebase Admin Auth could fail before session verification ran.
- Baseline: regular production build passed locally because local Node enables `require(esm)`; the compatibility probe exposed the deployment mismatch.
