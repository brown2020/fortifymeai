# FortifyMeAI

Supplement tracking and research app: manage supplements and doses, log health metrics and side effects, review calendar and analytics, and ask an authenticated AI research assistant. Demo: [https://fortifymeai.vercel.app](https://fortifymeai.vercel.app)

## Features

Verified from the current codebase:

- **Dashboard** — summaries of supplement and health activity
- **Supplements & doses** — CRUD-style management and dose logging (Firestore)
- **Health metrics & side effects** — logging surfaces under `/health`
- **Calendar & analytics** — review history; charts via Recharts
- **AI research** — authenticated streaming research at `/research` → `/api/research` (OpenAI `gpt-4o` via Vercel AI SDK)
- **Auth** — Firebase email/password + Google; HttpOnly session cookie `fortify_session_v1`; login, signup, forgot password, verify email, logout
- **Profile** — protected profile page
- **Health API** — `GET /api/health` (also probed in CI and a scheduled production workflow)

## Tech stack

| Area | Choice |
|------|--------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, Lucide, Recharts, react-markdown |
| Language | TypeScript 6 |
| Forms | react-hook-form + Zod resolvers |
| State | Zustand 5 |
| Backend | Firebase 12 + firebase-admin 13 (Auth, Firestore) |
| AI | Vercel AI SDK 7 (`ai`, `@ai-sdk/openai`, `@ai-sdk/react`) |
| Dates | date-fns 4 |
| Tests | Vitest 4 |
| Deploy | Vercel (`vercel.json` maxDuration 300s) |
| Node | `>=22` |

`.npmrc` sets `legacy-peer-deps=true`.

## Project structure

```
fortifymeai/
├── src/
│   ├── app/
│   │   ├── (auth)/          # login, signup, forgot-password, verify-email
│   │   ├── (protected)/     # dashboard, supplements, health, analytics, calendar, research, profile
│   │   └── api/             # auth/session, health, me, research
│   ├── components/          # domain UI + providers
│   └── lib/                 # firebase, firebase-admin, services, store, models
├── firestore.rules
├── firestore.indexes.json
├── firebase.json
├── vercel.json
├── scripts/                 # ci-gate, production probe helpers
└── .github/workflows/       # ci.yml, production-health.yml
```

## Getting started

### Prerequisites

- Node.js 22+
- npm
- Firebase project (Auth + Firestore)
- OpenAI API key (for research)

### Install

```bash
git clone https://github.com/brown2020/fortifymeai.git
cd fortifymeai
git checkout dev
npm ci
# create .env.local with the variables below — never commit secrets
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). There is no `.env.example` in-repo; use the table below.

## Environment variables

| Name | Purpose | Where to get it |
|------|---------|-----------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web API key | Firebase Console → Your apps |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth domain | Same |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project ID | Same |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket | Same |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID | Same |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App ID | Same |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Analytics ID | Optional |
| `NEXT_PUBLIC_APP_URL` | Public app URL | You (e.g. `http://localhost:3000`) |
| `FIREBASE_PROJECT_ID` | Admin SDK project ID | Service account JSON |
| `FIREBASE_PRIVATE_KEY_ID` | Key ID | Same |
| `FIREBASE_PRIVATE_KEY` | Private key (`\n` escaped) | Same |
| `FIREBASE_CLIENT_EMAIL` | Client email | Same |
| `FIREBASE_CLIENT_ID` | Client ID | Same |
| `FIREBASE_CLIENT_CERTS_URL` | Client certs URL | Same |
| `OPENAI_API_KEY` | OpenAI key for `/api/research` (AI SDK default) | [platform.openai.com](https://platform.openai.com) |

## Firebase

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Rules and indexes: `firestore.rules`, `firestore.indexes.json` (wired in `firebase.json`).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest |

## Testing and CI

Vitest covers health/me route helpers, session/research gates, same-origin, safe redirects, and auth errors.

- **CI** (`.github/workflows/ci.yml`): lint → typecheck → test → build → smoke `/api/health` on `next start`. Needs `NEXT_PUBLIC_FIREBASE_*` secrets.
- **Production health** (`.github/workflows/production-health.yml`): cron every 6 hours probes `https://fortifymeai.vercel.app/api/health`.

## Deployment

Vercel production tracks the live demo URL above. Set all env vars in the Vercel project. Function `maxDuration` is 300s under `src/app/**/*`.

## Contributing

- `main` — production
- `dev` — integration

See [AGENTS.md](./AGENTS.md) and [SPEC.md](./SPEC.md).

## License

[GNU Affero General Public License v3](./LICENSE.md) (AGPL-3.0).
