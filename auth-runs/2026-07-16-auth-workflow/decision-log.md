# Decision Log

| ID | Decision | Evidence | Alternatives | Result |
| --- | --- | --- | --- | --- |
| DEC-001 | Keep Firebase as the sole auth provider and scope this run to deployment compatibility | Existing auth inventory and current code show Firebase client/Admin session truth | Auth migration | No migration needed |
| DEC-002 | Use `firebase-admin@^13.10.0` | v14 pulls `jwks-rsa@4` -> ESM-only `jose@6`; the hosting handler rejects its CommonJS `require()` | Force-bundle Firebase Admin; override JOSE outside its declared range; patch `node_modules` | Latest v13 uses `jwks-rsa@3.2.2` and CommonJS-compatible `jose@4.15.9` |
