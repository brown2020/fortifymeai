# Firebase Auth

## Dependency Repair

- Changed `firebase-admin` from `^14.1.0` to `^13.10.0`.
- The resolved chain is now `firebase-admin@13.10.0 -> jwks-rsa@3.2.2 -> jose@4.15.9`.
- JOSE 4 provides a CommonJS export, so Firebase Admin Auth loads even when Node's `require(esm)` bridge is unavailable.

## Behavior

- Provider flows, email verification, error mapping, session creation, token verification, and account/profile code are unchanged.
- No secrets or client-visible admin configuration changed.
