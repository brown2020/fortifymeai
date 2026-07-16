# Session And Proxy

- Session truth remains the Firebase Admin-verified `fortify_session_v1` cookie.
- `/api/auth/session`, `src/lib/session.ts`, protected layout checks, server actions, and `src/proxy.ts` are unchanged.
- The fix restores the ability to load `firebase-admin/auth` before session creation or verification.
- The production build still reports `ƒ Proxy (Middleware)` and all protected routes as dynamic.
- No admin routes exist.
