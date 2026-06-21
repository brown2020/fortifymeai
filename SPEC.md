# FortifyMeAI Current-State Spec

## Purpose

FortifyMeAI is a supplement tracking and research application. Current code
supports supplement management, dose tracking, dashboard summaries, health
metrics, side-effect logging, calendar review, analytics, profile behavior, and
an authenticated AI research assistant.

This document describes observed current implementation only. It does not set
future product priorities.

## Current Product Surfaces

- Public home page at `/`.
- Auth pages at `/login` and `/signup`.
- Protected app pages for dashboard, supplements, health, analytics, calendar,
  research, and profile.
- Authenticated AI supplement research endpoint at `/api/research`.
- Session endpoint at `/api/auth/session` for creating and deleting the
  `fortify_session_v1` cookie.

## Current Architecture

- Framework: Next.js App Router with TypeScript strict mode.
- UI: React 19 components with Tailwind CSS utility styling and local
  primitives under `src/components/ui/`.
- Auth: Firebase client Auth, a Zustand auth store, and a Firebase Admin
  HTTP-only session cookie for protected server rendering and server APIs.
- Data: Firestore client services for supplement, dose-log, health, side-effect,
  and stats data. Firebase Admin is used in server actions and route handlers.
- AI: Vercel AI SDK with OpenAI in `src/app/api/research/route.ts`.
- Validation: ESLint is configured through `eslint.config.mjs`. No test script
  is currently configured in `package.json`.

## Current Auth And Session Behavior

- `src/components/providers/AuthProvider.tsx` observes Firebase Auth state and
  updates `src/lib/store/auth-store.ts`.
- `src/lib/store/auth-store.ts` supports email/password sign-in, sign-up,
  Google sign-in, and logout.
- Successful sign-in and sign-up send a Firebase ID token to
  `/api/auth/session`; the route verifies the ID token with Firebase Admin and
  sets `fortify_session_v1` as a Firebase Admin session cookie.
- `src/app/(protected)/layout.tsx` redirects to `/login` when the session cookie
  is missing or invalid.
- `src/app/api/research/route.ts` verifies the server session before calling
  the AI model.

## Current Validation Commands

- `npm run lint`: primary static quality gate.
- `npm run build`: production build and type integration check.

## Known Quality Risks

- No dedicated unit, integration, or browser test script is configured.
- `src/proxy.ts` provides early auth-only/protected route redirects; protected
  layout and server/API checks remain the authoritative data boundary.
- Auth redirects normalize client-provided callback/cookie values to safe
  app-relative paths before navigation.
- Several large page and service modules carry broad responsibilities, most
  notably the research page and user stats/service modules.
- Client-side Firestore service modules repeat collection path and timestamp
  patterns; consolidation may reduce maintenance cost if done without changing
  behavior.

## Improvement Pass Notes

- Codebase-improvement work should preserve the current product behavior above.
- Future product direction, feature prioritization, and roadmap choices should
  be handled by a product workflow rather than inferred during codebase health
  work.
