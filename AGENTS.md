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

There is no dedicated test script currently configured in `package.json`.
Use `npm run lint` as the first quality gate, then `npm run build` when the
change can affect runtime, route, or type behavior.

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
- `src/lib/session.ts`: signed session token creation and verification.
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
- Keep Firebase Admin credentials and JWT secrets server-only. Do not expose
  them in `NEXT_PUBLIC_*` variables, client components, or logs.
- Prefer small, verified fixes. Run `npm run lint` before committing; run
  `npm run build` for changes that touch routes, auth/session code, or shared
  TypeScript types.
- There is no configured unit/E2E test harness yet. When adding behavior with
  meaningful risk, add a focused test setup or document why local validation is
  limited.
