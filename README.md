## FortifyMeAI

A Next.js App Router project built around **Firebase** (Auth + Firestore), **Zustand** state, and **Vercel AI SDK** for AI/streaming features.

### Tech stack (from `package-lock.json` / `package.json`)

- **Next.js**: `^16.2.10`
- **React**: `^19.2.5`
- **Firebase (client)**: `^12.16.0`
- **Firebase Admin (server)**: `^14.1.0`
- **Vercel AI SDK**: `ai@^7.0.29`, `@ai-sdk/openai@^4.0.15`, `@ai-sdk/react@^4.0.32`
- **State**: `zustand@^5.0.12`
- **Forms**: `react-hook-form@^7.81.0`, `@hookform/resolvers@^5.2.2`
- **Styling**: `tailwindcss@^4.3.2` with `@tailwindcss/postcss@^4.3.2`

### Requirements

- **Node.js**: 22+ (required by the current AI SDK and Firebase Admin releases)
- **npm**: this repo ships with `package-lock.json` (lockfile v3)

### Getting started

Install dependencies:

```bash
npm ci
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

Firebase Admin is also used to create and verify the app's HTTP-only auth
session cookie.

**AI**

- `OPENAI_API_KEY` (required for `/api/research`)

### Firestore Security Rules

This app includes Firestore security rules in `firestore.rules`. To deploy them:

1. Install Firebase CLI if you haven't:
   ```bash
   npm install -g firebase-tools
   ```

2. Login and select your project:
   ```bash
   firebase login
   firebase use YOUR_PROJECT_ID
   ```

3. Deploy the rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

4. (Optional) Deploy indexes for better query performance:
   ```bash
   firebase deploy --only firestore:indexes
   ```

### Scripts

- `npm run dev`: start Next.js in development
- `npm run build`: production build
- `npm run start`: run the production server
- `npm run lint`: run ESLint

### License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)** — see `LICENSE.md`.

If you deploy a modified version and users interact with it over a network, the AGPL generally requires you to offer those users access to the corresponding source code of your modified version (see the license for details).
