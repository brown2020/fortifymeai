# Auth Validation

| Check | Command Or Manual Path | Result | Evidence | Notes |
| --- | --- | --- | --- | --- |
| Lint | `npm run lint -- --max-warnings=0` | Pass | Completed after implementation | Zero warnings. |
| Build | `npm run build` | Pass | Build output includes `ƒ Proxy (Middleware)` and 18 routes | Confirms `src/proxy.ts` included. |
| Sign in | Source and route shell | Partial | Login source uses Firebase password, Google, email link, mapped errors | Real provider submit depends on Firebase Console/test user. |
| Password visibility toggles | Source/static rendered signup/reset | Pass | Shared `PasswordField`; signup HTML showed `aria-label="Show password"` | Login is client-rendered due search params; source confirms usage. |
| Protected route | `curl -I http://localhost:3010/dashboard` | Pass | `307` to `/login?callbackUrl=%2Fdashboard` | Fresh production server after build. |
| Admin route | Discovery | N/A | No admin route/link/API found | Future admin needs server-only UID/claim gate. |
| Hard sign-out | Footer source and session endpoint | Pass | Footer renders control; DELETE returns 200 with expired cookie | Signed-out click safe by design. |
| Auth state matrix | Source/report review | Partial | Unknown/signed-out/signed-in/unverified/stale/signing-out covered | Real verified/admin/revoked states need test users. |
| Route protection matrix | HTTP/source | Pass/partial | Public/auth/protected checks recorded in `06-session-and-proxy.md` | Authenticated redirect not run without session cookie. |
| Navbar state matrix | Source/report review | Partial | Loading hides protected links; account menu/signout added | Visual browser automation not available in this run. |
| Footer hard logout while signed out | `curl -X DELETE` and `/logout` | Pass | Session clear/logout expire cookie | UI click not browser-automated. |
| Client/server mismatch | Source | Partial | AuthProvider sync failure signs out; server cookie verification authoritative | Revoked/deleted user needs Firebase test action. |
