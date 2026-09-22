#!/usr/bin/env bash
# Local mirror of .github/workflows/ci.yml. Prefer hosted Actions on push;
# still run this before discretionary pushes. Failures block merges and alert
# via GitHub watchers / Slack #eng (see AGENTS.md Operations / monitoring).
set -euo pipefail
cd "$(dirname "$0")/.."
npm ci
npm run lint
npm run typecheck
npm test
npm run build
echo "ci-gate: all checks passed"
