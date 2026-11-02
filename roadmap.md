# Roadmap

Engineering notes for the current `dev` line. Product feature choices stay in the product workflow (`SPEC.md`).

## Stack (November 2026)

Direct dependencies and devDependencies are on the newest published versions that install, lint, typecheck, test, and build on Node 24.

Notable majors already in tree: Next.js 16, React 19, Firebase client 13, firebase-admin 14, Zod 4, AI SDK 7, Tailwind CSS 4, ESLint 10, Vitest 5, `@hookform/resolvers` 7.

The research route still calls OpenAI `gpt-4o` through `@ai-sdk/openai`. Model IDs are unchanged.

## Held back

- **TypeScript 7.0.2.** `tsc --noEmit` succeeds on this repo, and ESLint does not. `typescript-eslint` (dependency of `eslint-config-next@16.4.3`) exits on startup because TypeScript 7.0 ships no compiler API. Newest working compiler is TypeScript 6.0.3. Adopt 7 when `typescript-eslint` supports the 7.1 API and `eslint-config-next` picks that up.

## Security overrides

Kept:

- `jwks-rsa` → `jose@5.10.0` (exact). `jose@6` is ESM-only and `require("firebase-admin/auth")` fails without this pin.
- `@grpc/grpc-js` `^1.14.6` (resolves to 1.14.7).
- `postcss` `^8.5.32`.
- `uuid` `^11.1.1` (no current dependent; left in place).

Updated:

- `glob` `^13.0.6` → `^14.0.3`. Versions through 14.0.1 are in GHSA-3g3m-2fjr-6pw4; 14.0.2+ is the fix. `rimraf` (via firebase-admin) still declares `glob@^10`.
- `minimatch@11.0.4` for `eslint` and `@typescript-eslint/typescript-estree` (GHSA-g3hv-75wg-m249, patched in 11.0.1).

Not overridden:

- `minimatch@3.1.5` under `eslint-plugin-import`, `eslint-plugin-jsx-a11y`, and `eslint-plugin-react`. Those plugins call minimatch as a function. minimatch 11's CommonJS build is an `__esModule` namespace without a callable default, so a blanket override breaks lint. `npm audit` still reports 5 moderate findings for this chain. `npm audit fix --force` would install `eslint-config-next@0.2.4` and is not applied.

## Install scripts

`allowScripts` approves the current `@firebase/util@1.15.3`, `protobufjs@7.6.6`, and `unrs-resolver@1.12.2` postinstalls. `sharp@0.35.5` no longer ships an install script.
