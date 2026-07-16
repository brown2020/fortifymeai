# Auth Provider Migration

- Verdict: Firebase is already the sole auth provider.
- Replacement needed: No.
- Provider configuration, client flows, session cookies, routes, and environment variable names are unchanged.
- This run changes only the server SDK compatibility line from Firebase Admin 14 to 13.
- Firebase Console provider/domain/action URL setup remains an external configuration item from the prior auth run.
