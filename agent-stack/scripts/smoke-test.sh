#!/usr/bin/env bash
# Smoke test: writes only under /tmp (CI-safe, ephemeral).
# Committed reviewer artefacts live in demo/output/ — see docs/DEMO_OUTPUT.md.
set -euo pipefail

rm -rf /tmp/agent-stack-smoke

node apps/cli/dist/src/index.js parse --brief demo/sample-brief.md >/tmp/agent-stack-parse.json
node apps/cli/dist/src/index.js generate --brief demo/sample-brief.md --template api-integration-core --dry-run >/tmp/agent-stack-dry-run.txt
node apps/cli/dist/src/index.js generate --brief demo/sample-brief.md --template api-integration-core --out /tmp/agent-stack-smoke --approve
node apps/cli/dist/src/index.js handover --brief demo/sample-brief.md --template api-integration-core --out /tmp/agent-stack-smoke --approve

test -f /tmp/agent-stack-smoke/.ai-metadata.json
test -f /tmp/agent-stack-smoke/.env.example
test -f /tmp/agent-stack-smoke/README.md
test -f /tmp/agent-stack-smoke/TEST_PLAN.md
test -f /tmp/agent-stack-smoke/HANDOVER.md

if grep -R "sk-" /tmp/agent-stack-smoke; then
  echo "secret-like value found in smoke output" >&2
  exit 1
fi

echo "smoke ok"
