# CLAUDE.md

This file provides guidance for Claude Code when working on this repository.

## Project Overview

FortifyMeAI is an AI-powered supplement tracking and research application. Users can track their supplement routines, log doses, schedule intake times, and get AI-powered research insights about supplements.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode)
- **React**: 19.0
- **Auth & Database**: Firebase (Auth + Firestore + Storage)
- **State Management**: Zustand
- **AI**: Vercel AI SDK with OpenAI
- **Forms**: react-hook-form with Zod validation
- **Styling**: Tailwind CSS 4.0 with @tailwindcss/typography and @tailwindcss/forms

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Auth routes (login, signup) - public
│   ├── (protected)/        # Protected routes requiring auth
│   │   ├── dashboard/      # Main dashboard
│   │   ├── supplements/    # Supplement management
│   │   ├── research/       # AI research feature
│   │   └── profile/        # User profile
│   ├── api/                # API routes
│   │   ├── auth/session/   # Session management
│   │   └── research/       # AI research endpoint
│   └── logout/             # Logout route handler
├── components/
│   ├── ui/                 # Reusable UI components (button, card, input, etc.)
│   ├── supplements/        # Supplement-specific components
│   ├── dashboard/          # Dashboard components
│   └── providers/          # React context providers
└── lib/
    ├── models/             # TypeScript interfaces/types
    ├── services/           # Business logic services
    ├── store/              # Zustand stores
    ├── firebase.ts         # Firebase client config
    ├── firebase-admin.ts   # Firebase Admin SDK config
    ├── session.ts          # JWT session utilities
    └── utils.ts            # Utility functions (cn for classnames)
```

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Run production server
npm run lint     # Run ESLint
```

## Key Patterns

### Path Aliases
Use `@/*` to import from `src/*`:
```typescript
import { Button } from "@/components/ui/button";
import { Supplement } from "@/lib/models/supplement";
```

### Route Groups
- `(auth)` - Public authentication pages
- `(protected)` - Pages requiring authentication (uses ProtectedRoute wrapper)

### Component Conventions
- UI components in `src/components/ui/` follow a consistent pattern with `cn()` for class merging
- Feature components are grouped by domain (supplements, dashboard)

### Server/Client Split
- Server components are default in App Router
- Client components marked with `"use client"` directive
- Server actions in `actions.ts` files within route directories

### State Management
- Auth state managed via Zustand store (`src/lib/store/auth-store.ts`)
- Firebase Auth wrapped with AuthProvider context

### Session Handling
- JWT-based sessions using jose library
- HTTP-only cookies for session tokens
- Session verification in API routes via `verifySession()`

## Key Types

```typescript
// Schedule times for supplements
type ScheduleTime = "morning" | "midday" | "evening" | "bedtime";

// Core supplement interface
interface Supplement {
  id: string;
  name: string;
  brand?: string;
  dosage?: string;
  frequency?: string;
  scheduleTimes?: ScheduleTime[];
  notes?: string;
  startDate?: Timestamp;
  imageUrl?: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Environment Variables

Required environment variables (see README.md for full list):
- `JWT_SECRET` - Session signing key
- `OPENAI_API_KEY` - For AI research feature
- Firebase client config (`NEXT_PUBLIC_FIREBASE_*`)
- Firebase Admin config (`FIREBASE_*`)

## Testing

No test framework is currently configured. When adding tests, consider:
- Jest + React Testing Library for component tests
- Playwright for E2E tests

## License

AGPL-3.0 - Source code sharing required for network deployments.
