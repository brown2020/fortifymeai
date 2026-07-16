# Auth QA

## Server Compatibility

- The reported failure was reproduced against Firebase Admin 14.
- The same module entry and the built Next.js external wrapper load successfully after the v13 repair under a Node mode that rejects `require(esm)`.

## Browser And Provider QA

- Not rerun: this change does not alter browser UI, Firebase provider setup, cookies, routes, or auth state transitions.
- Production redeploy is the remaining environment-level confirmation.
