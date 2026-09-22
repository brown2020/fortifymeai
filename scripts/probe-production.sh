#!/usr/bin/env bash
# Manual production readiness probe (same contract as Actions production-health).
set -euo pipefail
URL="${PRODUCTION_HEALTH_URL:-https://fortifymeai.vercel.app/api/health}"
curl -fsS --max-time 30 "$URL" | tee /tmp/fortifymeai-health.json
python3 - <<'PY'
import json, sys
data = json.load(open("/tmp/fortifymeai-health.json"))
assert data.get("ok") is True and data.get("service") == "fortifymeai", data
print("probe-production: ok")
PY
