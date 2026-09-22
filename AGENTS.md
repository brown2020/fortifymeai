# Repository Guidance

## Project Shape

FortifyMeAI is a Next.js App Router application for supplement tracking,
health metrics, adherence analytics, calendar views, and AI-assisted supplement
research. The app uses Firebase client SDKs for Auth and Firestore reads/writes,
Firebase Admin SDK for server-side session and protected server action work,
Zustand for auth state, and the Vercel AI SDK/OpenAI for the research API.

## Commands

- `npm run dev`: start the local Next.js development server.
- `npm run build`: run a production build.
- `npm run start`: run the production server after a build.
- `npm run lint`: run ESLint across the repository.
- `npm run typecheck`: run `tsc --noEmit`.
- `npm test`: run Vitest unit tests.
- Hosted CI: `.github/workflows/ci.yml` runs lint, typecheck, test, build on Node 22 (push to `dev`/`main`).
- `npm outdated --long`: compare direct dependency ranges with the npm registry.
- `npm audit --audit-level=low`: inspect known dependency vulnerabilities.

Use `npm run lint`, `npm run typecheck`, and `npm test` as the first quality gates,
then `npm run build` when the change can affect runtime, route, or type behavior.

For dependency maintenance, keep `package.json` and `package-lock.json` in the
same change. Treat major upgrades as runtime/type changes: review their migration
notes and require both lint and build to pass before committing them.

## Important Paths

- `src/app/`: App Router pages, layouts, route handlers, and server actions.
- `src/app/(auth)/`: sign-in and sign-up pages.
- `src/app/(protected)/`: authenticated product surfaces.
- `src/app/api/auth/session/route.ts`: Firebase ID token to session cookie
  exchange plus logout cookie clearing.
- `src/app/api/research/route.ts`: authenticated AI streaming research endpoint.
- `src/components/`: feature and UI components.
- `src/components/providers/AuthProvider.tsx`: Firebase auth observer.
- `src/lib/store/auth-store.ts`: Zustand auth store and sign-in/sign-out flows.
- `src/lib/services/`: client Firestore service modules.
- `src/lib/session.ts`: Firebase Admin session-cookie creation and verification.
- `src/lib/firebase.ts`: Firebase client initialization.
- `src/lib/firebase-admin.ts`: Firebase Admin initialization.
- `firestore.rules` and `firestore.indexes.json`: Firestore deployment assets.

## Architecture Notes

- Server-rendered protected routes rely on `src/app/(protected)/layout.tsx`,
  which verifies the `fortify_session_v1` cookie using `verifySessionToken`.
- Client auth state is observed through Firebase Auth and stored in Zustand.
  Treat this as UI state only; protected server data must continue to verify the
  server session cookie or Firebase/Admin state.
- Client Firestore services under `src/lib/services/` accept a `userId` and
  write into user-scoped collections. Keep user ownership explicit at each call
  site.
- Server actions that mutate protected data should use cookie/session
  verification before accessing Firebase Admin.
- The research API performs server-side session verification and in-memory
  per-user rate limiting before streaming an OpenAI-backed response.

## Safe Editing Rules

- Preserve the App Router route-group structure and `@/*` imports from
  `tsconfig.json`.
- Do not commit `.env`, `.env.local`, `service_key.json`, `.next/`,
  `node_modules/`, or TypeScript build info.
- Keep Firebase Admin credentials and session-cookie values server-only. Do not
  expose them in `NEXT_PUBLIC_*` variables, client components, or logs.
- Prefer small, verified fixes. Run `npm run lint` before committing; run
  `npm run build` for changes that touch routes, auth/session code, or shared
  TypeScript types.
- There is no configured unit/E2E test harness yet. When adding behavior with
  meaningful risk, add a focused test setup or document why local validation is
  limited.

## Operations / monitoring

- **Hosted CI**: `.github/workflows/ci.yml` on `origin/dev` — lint, typecheck, test, build, and post-build `/api/health` smoke (Node 22). Green on HEAD `dfc339d`: https://github.com/brown2020/fortifymeai/actions/runs/35694681510 (health-smoke `3e8f3c1`: https://github.com/brown2020/fortifymeai/actions/runs/35694532207).
- **CI env**: Firebase **public** `NEXT_PUBLIC_*` values are set in the workflow job `env` (client SDK init at import). Repository Actions secrets cannot be managed with the current PAT (`secrets` API 403); when a secrets-capable token is available, prefer `${{ secrets.NEXT_PUBLIC_FIREBASE_* }}` wired into the same job `env` names. Never put Admin/private keys in `NEXT_PUBLIC_*` or the workflow YAML.
- **Local CI gate**: `scripts/ci-gate.sh` mirrors the Actions gate before pushing.
- **Production probe**: `GET /api/health` on https://fortifymeai.vercel.app (or local `npm run start`). Returns `{ ok, service, checks }` without secrets. Manual: `scripts/probe-production.sh`.
- **Scheduled monitoring**: `.github/workflows/production-health.yml` (on `dev`) probes https://fortifymeai.vercel.app/api/health every 6h / `workflow_dispatch`. GitHub only runs `schedule` from the **default branch** (`main`); promote this workflow to `main` when ready. Until then, CI health smoke + `scripts/probe-production.sh` are the active monitors. Failures → GitHub watcher email + Slack `#eng`.
- **Alert / response**:
  1. CI red → do not merge; fix or revert; re-run until green.
  2. Health probe red → check Vercel deployment + Firebase Auth/Admin env; restore last good deploy or `git revert` on `dev` and push.
  3. Research/API 429/5xx → sanitize logs already omit secrets; rate limit is in-memory per instance (`src/app/api/research/route.ts`).
- **Rollback / restore**: `git revert <sha> && git push origin dev`, confirm CI green, confirm `scripts/probe-production.sh` passes after Vercel picks up the commit.
- **Dependency advisories**: keep production `npm audit` clean; hold majors `firebase-admin@14` and `typescript@7` until a dedicated review window (see review triggers below). Review triggers: firebase-admin 14 migration guide or 13.x advisory; Next release notes claiming TypeScript 7 support.

## Auth session note

`AuthProvider` syncs Firebase client → server session cookie when a user is present. It does **not** clear the HTTP-only session when the client user is null (cold start / persistence lag). Explicit `logout()` still clears the cookie via `DELETE /api/auth/session`.
