# Auth Validation

| Check | Result | Evidence |
| --- | --- | --- |
| Failure reproduction | Pass | `node --no-experimental-require-module` failed to load v14 `firebase-admin/auth` with the reported `ERR_REQUIRE_ESM` |
| Dependency graph | Pass | `firebase-admin@13.10.0 -> jwks-rsa@3.2.2 -> jose@4.15.9` |
| CommonJS compatibility | Pass | `firebase-admin/auth` loads with `--no-experimental-require-module` |
| Built external module | Pass | `.next` Firebase Admin ESM wrapper loads with the same restrictive Node flag |
| Lint | Pass | `npm run lint` |
| Production build | Pass | `npm run build` on Next.js 16.2.10/Turbopack |
| Dependency audit | Pass | `npm audit --audit-level=low`: 0 vulnerabilities |
| Patch whitespace | Pass | `git diff --check` |

Auth interaction matrices were not rerun because no auth behavior or UI source changed.
