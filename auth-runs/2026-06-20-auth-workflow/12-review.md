# Auth Review

## Findings

- P1 external setup: Firebase Console provider enablement, authorized domains, and action URL domains cannot be proven locally. Code is ready; production setup must confirm Google, Email/Password, Email link, and action URLs.
- P2 test coverage: no auth test framework exists. Add Firebase Emulator/Playwright smoke tests in a future task.
- P2 account deletion/uploaded avatar: profile still has placeholder account deletion and no uploaded-avatar flow; out of scope for this pass.

## Verdict

PASS for local hardening batch with external Firebase Console QA items recorded.
