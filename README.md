## FortifyMeAI

A Next.js App Router project built around **Firebase** (Auth + Firestore + Storage), **Zustand** state, and **Vercel AI SDK** for AI/streaming features.

### Tech stack (from `package-lock.json` / `package.json`)

- **Next.js**: `^16.0.3`
- **React**: `^19.0.0`
- **Firebase (client)**: `^12.6.0`
- **Firebase Admin (server)**: `^13.0.2`
- **Vercel AI SDK**: `ai@^6.0.3`, `@ai-sdk/openai@^3.0.1`, `@ai-sdk/react@^3.0.3`
- **State**: `zustand@^5.0.8`
- **Forms**: `react-hook-form@^7.66.1`, `@hookform/resolvers@^5.2.2`
- **Styling**: `tailwindcss@^4.0.8`, `@tailwindcss/typography@^0.5.15`, `@tailwindcss/forms@^0.5.9`

### Requirements

- **Node.js**: 18+ (many dependencies require `node >= 18`)
- **npm**: this repo ships with `package-lock.json` (lockfile v3)

### Getting started

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

### Environment variables

This app expects Firebase env vars for both **client** and **server** code.

**Client (public) Firebase config** (used by `src/lib/firebase.ts`):

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (optional; only needed if you use Analytics)

**Server (Firebase Admin) credentials** (used by `src/lib/firebase-admin.ts`):

- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY_ID`
- `FIREBASE_PRIVATE_KEY` (must preserve newlines; commonly stored with `\n`)
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_CLIENT_ID`
- `FIREBASE_CLIENT_CERTS_URL`

### Scripts

- `npm run dev`: start Next.js in development
- `npm run build`: production build
- `npm run start`: run the production server
- `npm run lint`: run ESLint

### License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)** — see `LICENSE.md`.

If you deploy a modified version and users interact with it over a network, the AGPL generally requires you to offer those users access to the corresponding source code of your modified version (see the license for details).
