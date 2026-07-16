# Auth Architecture Plan

## Scope

1. Reproduce the module-format failure without changing auth behavior.
2. Replace the incompatible Firebase Admin dependency line with the latest compatible v13 release.
3. Verify the resolved dependency graph, auth-module load, lint, build, audit, and diff.

## Owned Files

- `package.json`, `package-lock.json`, `README.md`, and this run record.

## Non-Goals

- No route, session, provider, UI, cookie, credential, or Firebase Console changes.
