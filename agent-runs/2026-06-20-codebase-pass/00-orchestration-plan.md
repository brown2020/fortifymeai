# Orchestration Plan

## Mode Selection

- Repo: /Users/stephenbrown/Code/OPENSOURCE/fortifymeai
- Branch: dev
- Work mode: full
- Run folder: /Users/stephenbrown/Code/OPENSOURCE/fortifymeai/agent-runs/2026-06-20-codebase-pass
- Verifiable gates: `npm run lint`; `npm run build` for runtime/type-impacting work; `git diff --check`; Git remote read and dry-run push.
- Human-decision blockers: product roadmap changes, broad auth/security policy choices, Firebase/OpenAI credential setup, and risky major package migrations.
- Resume policy: resume from `run-state.md`, `task-queue.md`, current Git state, and the last pushed commit; stop if dirty files are unrelated to the active task.

## Loop Plan

| Phase | Loop | Verify Gate | Stop Condition |
| --- | --- | --- | --- |
| Preflight and Repo Docs | Orchestration Planning Loop, Docs Sweep Loop | Docs match current repo and checks pass | Plan, state, queue, docs, and report pushed |
| Baseline Validation | Baseline Validation Loop, Quality Gate Selection Loop | Lint/build results are recorded and failures classified | Baseline report pushed |
| Findings Backlog | Findings Queue Loop, Architecture Fitness Loop, Lean Code Loop | Evidence-backed backlog and scorecard | Backlog, scorecard, and queue are pushed |
| Execute Fixes and Improvements | Task Queue Loop, Fix Validation Loop, Architecture Fitness Loop, Lean Code Loop | Highest-priority local fixes pass targeted checks and lint/build as needed | Fix batch report pushed or blocker recorded |
| Package and Dead-Code Cleanup | Package Cleanup Loop, Dead Code Loop | Safe dependency/dead-code changes have evidence and checks | Cleanup report pushed or risky items deferred |
| Review | Judge Loop | No P0/P1 findings, no introduced regressions, scorecard has no high-confidence unresolved Fail | Review report pushed |
| Stabilization | Stabilization Loop, Judge Loop | Final completion criteria pass or real blocker recorded | Stabilization report pushed |
| Integrator | Final Completion Gate | Branch clean/synced, final verification recorded | Final report pushed |

## File Ownership

| Task | Owned Files | Notes |
| --- | --- | --- |
| T-001 | `AGENTS.md`, `SPEC.md`, `agent-runs/2026-06-20-codebase-pass/00-orchestration-plan.md`, `run-state.md`, `task-queue.md`, `01-preflight-and-repo-docs.md` | Startup planning, repo guidance, current-state docs, and resume state |
| T-002 | `agent-runs/2026-06-20-codebase-pass/02-baseline-validation.md`, `run-state.md`, `task-queue.md` | Record lint/build baseline and classify failures |
| T-003 | `agent-runs/2026-06-20-codebase-pass/03-findings-backlog.md`, `run-state.md`, `task-queue.md` | Evidence-backed findings and scorecard |
| T-004 | Source files named by findings plus `04-execute-fixes-and-improvements.md`, `run-state.md`, `task-queue.md` | Focused fix batch |
| T-005 | `package.json`, `package-lock.json`, proven dead-code files if any, `05-package-and-dead-code-cleanup.md`, `run-state.md`, `task-queue.md` | Safe package/dead-code cleanup only with evidence |
| T-006 | `06-review.md`, `run-state.md`, `task-queue.md` | Judge review and bounded follow-up tasks |
| T-007 | Source/report files named by stabilization, `07-stabilization-loop.md`, `run-state.md`, `task-queue.md` | Final stabilization cycles |
| T-008 | `08-integrator.md`, `final-report.md`, `run-state.md`, `task-queue.md` | Final completion gate |

## Evidence Snapshot

- Package manager: npm with lockfile v3 (`package-lock.json`).
- Framework: Next.js App Router (`src/app`, `next.config.ts`).
- Primary language: TypeScript with strict mode (`tsconfig.json`).
- Auth/session: Firebase Auth client, Firebase Admin verification, signed `fortify_session_v1` cookie.
- Data: Firestore client services under `src/lib/services` and Admin SDK server actions.
- AI: Vercel AI SDK/OpenAI route at `src/app/api/research/route.ts`.
- Current configured scripts: `dev`, `build`, `start`, `lint`.
