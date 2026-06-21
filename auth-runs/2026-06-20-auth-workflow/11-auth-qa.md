# Auth QA

## Browser QA

- Full in-browser automation was not used; validation used production build plus HTTP route/content checks.
- Static built content confirmed signup password toggles, forgot-password page, verify-email page, and footer hard sign-out content.
- Login page is client-rendered because it reads search params; source and build confirm password toggle/email-link/forgot-password wiring.

## API/Server QA

- `POST /api/auth/session` with cross-origin `Origin` returned `403`.
- `POST /api/auth/session` with same-origin invalid token returned `401`.
- `DELETE /api/auth/session` with same-origin headers returned `200` and expired `fortify_session_v1`.
- `GET /logout` returned `307` to `/` and expired `fortify_session_v1`.
- `GET /dashboard` signed out returned `307` to `/login?callbackUrl=%2Fdashboard` after moving proxy to `src/proxy.ts`.

## Accessibility

- Password toggles use accessible names and `aria-pressed`.
- Form errors/status states are visible in page UI.
- Keyboard-only submit not separately automated.

## Responsive States

- Existing responsive auth shell retained.
- Mobile navbar includes account and sign-out options for authenticated users.
- No screenshot-based responsive QA was run.
