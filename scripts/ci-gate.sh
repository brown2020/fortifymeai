#!/usr/bin/env bash
# Local stand-in for GitHub Actions ci.yml until a workflow-scoped token can land
# .github/workflows/ci.yml on origin/dev. Failures should block merges to dev and
# be reported via repo watchers / Slack #eng (see AGENTS.md App-eval holds).
set -euo pipefail
cd "$(dirname "$0")/.."
npm ci
npm run lint
npm run typecheck
npm test
npm run build
echo "ci-gate: all checks passed"
