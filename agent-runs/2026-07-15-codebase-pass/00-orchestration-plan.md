# Orchestration Plan

## Mode Selection

- Repo: `/Users/stephenbrown/Code/OPENSOURCE/fortifymeai`
- Branch: `dev`
- Work mode: `full`
- Run folder: `agent-runs/2026-07-15-codebase-pass`
- Verifiable gates: `npm run lint`, `npm run build`, `npm outdated --long`, `npm audit --audit-level=low`, targeted source searches, `git diff --check`, Git remote read/dry-run push/sync checks
- Human-decision blockers: product behavior changes, broad architecture redesign, unavailable Firebase/OpenAI credentials or services, and package migrations that cannot be verified locally
- Resume policy: re-run Git preflight, read `run-state.md` and `task-queue.md`, then continue the recorded next action only when file ownership remains clear

## Loop Plan

| Phase | Loop | Verify Gate | Stop Condition |
| --- | --- | --- | --- |
| Preflight and Repo Docs | Orchestration Planning Loop, Docs Sweep Loop | Docs match current repo and checks pass | Plan, state, queue, docs, and report pushed |
| Baseline Validation | Baseline Validation Loop, Quality Gate Selection Loop | Lint/build and dependency diagnostics are classified | Baseline report pushed |
| Findings Backlog | Findings Queue Loop, Architecture Fitness Loop, Lean Code Loop | Evidence-backed backlog and scorecard | Backlog, scorecard, and queue are pushed |
| Execute Fixes | Task Queue Loop, Fix Validation Loop | Confirmed bugs have targeted evidence and lint/build pass | Fix batch pushed or blocked with evidence |
| Package Cleanup | Package Cleanup Loop, Dead Code Loop | Kept dependency/lockfile changes pass lint/build; unused code has proof | Safe updates pushed and risky items deferred |
| Review | Judge Loop | Strict review returns `PASS` or bounded tasks | Review report pushed |
| Stabilization | Stabilization Loop, Judge Loop, Reflect-or-Kill Loop if needed | Final quality and findings criteria pass | Stabilization checkpoint pushed |
| Integrate | Commit-Push Checkpoint Loop | Clean tree and local `dev` matches `origin/dev` | Final report pushed |

## File Ownership

| Task | Owned Files | Notes |
| --- | --- | --- |
| T-001 | `AGENTS.md`, `SPEC.md`, run planning/report files | Startup planning, repo guidance, and resume state |
| T-002 | `02-baseline-validation.md`, run state/queue | Read-only validation evidence |
| T-003 | `03-findings-backlog.md`, run state/queue | Evidence-backed audit and scorecard |
| T-004 | Confirmed-bug source files, `04-execute-fixes-and-improvements.md`, run state/queue | Owned files set after findings |
| T-005 | `package.json`, `package-lock.json`, proven dead-code files, `05-package-and-dead-code-cleanup.md`, run state/queue | Dependency upgrades and lean cleanup |
| T-006 | `06-review.md`, run state/queue | Read-only review evidence |
| T-007 | In-scope stabilization files, `07-stabilization-loop.md`, run state/queue | Bounded fixes only |
| T-008 | `08-integrator.md`, `final-report.md`, run state/queue, skill log | Final gate and closure |
