# Agent Report

## Agent

Name: Codex

## Scope

Inspected auth/session/server boundaries, research streaming/history state, health comparison state, dose-toggle concurrency, Firestore actions/services, shared UI state, package imports/peers, PostCSS configuration, unused exports, module hotspots, and major-upgrade requirements. No application or package files were edited.

## Inputs

Baseline report; prior improvement/auth reports; critical server/client source files; `rg` risk/import/export/reference searches; npm `view`/`why` metadata; official AI SDK/Firebase migration and release documentation; module-size inventory; lint/build evidence.

## Branch and Push

- Branch: dev
- Upstream: origin/dev
- Commit: f912b54 before this report checkpoint
- Pushed to: Pending checkpoint
- Sync status: Clean and synchronized before findings work

## Loop

- Name: Findings Queue Loop, Architecture Fitness Loop, and Lean Code Loop
- Goal: produce an evidence-backed, prioritized backlog with exact ownership and local verification
- Verify gate: every finding has severity, evidence, risk, effort, owned files, and verification; scorecard has no taste-only failures
- Stop condition: highest-priority executable task and package/dead-code batch are clear
- Attempt: 1/2
- Result: Passed; confirmed bug batch F-001 through F-005 and package/cleanup batch F-006 through F-009 are locally executable

## Run State

- Current phase: Findings Backlog
- Current task: T-003
- Last pushed commit: f912b54
- Next action: Checkpoint findings, then fix F-001 through F-005
- Blockers: None

## Commands Run

```text
rg risk/auth/import/export/reference searches across `src`
sed inspections of critical route, action, service, store, provider, and page files
npm view ai/@ai-sdk/firebase-admin/lucide/typescript/next/recharts metadata
npm why react-is/openai/@tailwindcss/forms
official AI SDK and Firebase Admin migration/release documentation lookup
npx --yes knip@latest --no-progress (blocked; no code executed)
```

## Findings

| ID | Severity | Type | Status | Area | Summary | Evidence | Risk | Effort | Verification | Next Step |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F-001 | P1 | Bug/data correctness | Open | Research history | A new request does not clear `completionRef`; if it fails before producing text, the loading transition can save the prior answer under the new query. | `research/page.tsx` keeps the ref only when `completion` is truthy, then saves it on `isLoading` true-to-false. | Corrupted/misleading saved research history. | Small | Clear the ref on reset; lint/build and diff inspection. | Execute first. |
| F-002 | P2 | Bug | Open | Health comparison | `getRecentHealthMetrics` returns ascending dates, but health page uses index 1 as yesterday; with today present, index 1 is today, and with only yesterday present no comparison is set. | `healthMetricsService.ts` orders ascending; `health/page.tsx` uses `recentMetrics[1]` only when length > 1. | Trend cards compare today to itself or omit valid prior data. | Small | Select the non-today entry and explicitly clear absent prior state; lint/build. | Execute with F-001. |
| F-003 | P2 | Bug/API correctness | Open | Research API | Malformed JSON throws before schema validation and is caught as a 500; the request is also rate-counted before body validation. | `api/research/route.ts` calls `safeParse(await request.json())` inside the outer 500 catch after rate-limit mutation. | Client mistakes are misreported as server outages and consume quota. | Small | Parse/validate before rate mutation and return 400; lint/build. | Execute with bug batch. |
| F-004 | P2 | Bug/UI state | Open | Research tabs | Clicking a history item changes `activeCategory`, but the custom Tabs component is uncontrolled after `defaultValue`, leaving the selected tab/content out of sync with the category used/displayed. | Research history handler sets category; `ui/tabs.tsx` owns independent state initialized once. | Misleading category UI and subsequent request context. | Small | Add controlled Tabs support and bind research tabs to `activeCategory`; lint/build. | Execute with bug batch. |
| F-005 | P2 | Race condition | Open | Dose toggle | The optimistic dose button remains enabled while an async toggle is pending, allowing same-entry requests/responses to race and leave client state inconsistent with the serialized transaction result. | `today-schedule.tsx` exposes `isPending` but does not disable toggle buttons. | Dashboard may show the wrong final taken state after rapid clicks. | Small | Disable toggles while pending; lint/build and flow review. | Execute with bug batch. |
| F-006 | P1 | Package update/security | Open | Dependencies | 15 direct packages are behind; AI SDK, Firebase Admin, Lucide, Node types, and TypeScript have major updates. Ten moderate transitive advisories remain. | Baseline `npm outdated`/`npm audit`; npm package metadata. | Stale APIs, known vulnerable paths, and unsupported legacy Admin namespace on v14. | Medium | Update coherent batches, migrate Firebase Admin to modular entry points, prune/install, audit, lint/build. | T-005 after bugs. |
| F-007 | P2 | Dead dependency/config | Open | Dependency lean-ness | `openai` is used only by an otherwise unreferenced wrapper; Tailwind forms/typography have no used utilities; duplicate `postcss.config.mjs` is stale while the passing build uses the v4 `.js` config. | Exact import searches; no `prose`/form-plugin class matches; passing v4 build; `npm why`. | Unneeded install/update surface and ambiguous CSS configuration. | Small | Remove packages/wrapper/stale config and verify CSS build. | T-005. |
| F-008 | P3 | Dead code | Open | Service/action surface | Multiple exported helpers have definition/internal-only references; four research actions and their bookmark type have no callers. | Exact symbol searches across `src`. | Larger public surface and maintenance burden; one unused batch action also exceeds Firestore's 500-write limit. | Small/Medium | Remove only proven-unused exports/functions/types; lint/build. | T-005 after package migration. |
| F-009 | P2 | Test gap | Deferred | Validation | No unit/integration/browser test script exists. | `package.json` scripts and baseline. | Behavior relies on lint/build and targeted inspection. | Medium | Product/test workflow should add a focused harness; document residual risk. | Defer; do not invent broad harness in package pass. |
| F-010 | P3 | Architecture | Watch | Module cohesion | Research page (692 lines) and dashboard page (432 lines) remain large. | Module-size inventory. | Harder local reasoning, but no standalone failure justifies broad split. | Medium/Large | Defer until a focused behavior seam is approved. | Watch only. |

## Changes Made

- Updated findings report, task ownership, run state, and baseline checkpoint metadata only.

## Verification

Each executable finding has direct local source/command evidence and a lint/build verification path. `react-is` was retained because Recharts declares it as a peer. The blocked Knip attempt executed no third-party code and was replaced with safer direct searches.

## Architecture and Lean Code Scorecard

| Area | Status | Evidence | Action |
| --- | --- | --- | --- |
| Dependency direction | Pass | Client Firestore services and server Admin/session code remain separated; build passes. | Preserve during Admin v14 migration |
| Module cohesion | Watch | Research/dashboard modules are large without a bounded split target. | Defer broad redesign |
| Public surface area | Fail | Exact searches show unused service/action exports and wrapper module. | Remove in T-005 |
| Data and side-effect flow | Fail | Research completion ref and health prior-day selection produce incorrect persisted/displayed data. | Fix F-001/F-002 |
| Async/cache/resource lifecycle | Fail | Rapid dose toggles allow response ordering to overwrite final UI truth. | Fix F-005 |
| Duplication and dead code | Fail | Duplicate PostCSS configs, unused wrapper/actions/helpers, and unused plugins. | Remove with proof in T-005 |
| Dependency lean-ness | Fail | 15 direct updates and 10 audit advisories; unused direct packages found. | Execute F-006/F-007 |
| Testability | Watch | No automated harness; lint/build available. | Document and use targeted checks |

## Quality Gate

- Command: `npm run lint`; `git diff --check`; workflow validator
- Result: Passed
- Notes: Findings phase changed reports only; lint has no warnings/errors and run scaffolding remains valid

## Commit-Push Checkpoint

- Status inspected: Findings/run-report files only
- Diff checked: Passed; whitespace check clean and report diff reviewed
- Files staged: Findings report, baseline checkpoint metadata, run state, and queue
- Dry-run push: Pending
- Push: Pending
- Post-push sync: Pending

## Stabilization

- Cycle: Not started
- Completion criteria status: Actionable bugs and package cleanup queued
- Remaining blockers: None

## Risks

AI SDK 7, Firebase Admin 14, Lucide 1, TypeScript 7, and Node types 26 are major upgrades and must be applied in coherent, independently verified steps. Live Firebase/OpenAI behavior cannot be exercised without credentials; local build and route/type checks remain mandatory.

## Open Questions

- None.

## Recommended Next Step

Checkpoint findings, fix F-001 through F-005 in one focused behavior batch, run lint/build, review, and push before dependency changes.
