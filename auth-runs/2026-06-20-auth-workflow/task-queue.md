# Task Queue

| ID | Priority | Status | Phase | Owned Files | Done-Check | Verification | Attempts | Stop Condition | Next Action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AUTH-001 | P1 | Done | Discovery | 01-auth-inventory.md | Auth surfaces inventoried | Evidence matrix | 1/2 | Inventory complete or blocker recorded | Complete |
| AUTH-002 | P1 | Done | Provider migration | 02-auth-provider-migration.md | Existing provider replacement path documented | Migration matrix | 1/2 | Firebase path executable or setup blocker recorded | Complete |
| AUTH-003 | P1 | Done | Session truth | `src/lib/session.ts`, `src/app/api/auth/session/route.ts`, `src/proxy.ts` | Firebase Admin session-cookie truth and early route gating | Lint/build/API QA | 1/3 | Server truth verified or blocker recorded | Complete |
| AUTH-004 | P1 | Done | Auth UI | Auth pages/components | Password toggles, reset, email-link, verification states | Lint/build/content QA | 1/2 | UI states complete or blocker recorded | Complete |
| AUTH-005 | P1 | Done | Sign-out/nav | Navbar, footer, auth store/provider | Hard sign-out and nav state cleanup | Source/API/content QA | 1/2 | Drift/sign-out behavior verified or blocker recorded | Complete |
