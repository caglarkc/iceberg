# Iceberg Agent Stack

> ASSUMPTION-BASED PLAN: the checked-in M5 mission brief is known to be wrong, so this repo follows `missions/m5-agent-stack/plans/*` as the source of truth.

Iceberg Agent Stack turns a mission brief into a review-ready POC scaffold plus handover package. It is governance-aware: dry-run is the default behavior, file writes require explicit human approval, and generated output is marked as AI-generated.

## What Works
- Brief parser: Markdown mission brief to validated JSON.
- Template registry: `api-integration-core`, `crm-mock-poc`, `intelligence-layer`.
- Scaffold generator: Handlebars-based file tree rendering.
- Handover generator: `README.md`, `TEST_PLAN.md`, `HANDOVER.md`, `.env.example`.
- LLM fallback: deterministic `LLM_PROVIDER=mock`; real providers are optional and not required.
- CI: lint, typecheck, tests, coverage.

## Quick Start
```bash
npm install
npm run build
LLM_PROVIDER=mock npm run test
```

## CLI
```bash
npm run scaffold -- parse --brief tests/fixtures/briefs/sample-mission.md
npm run scaffold -- generate --brief tests/fixtures/briefs/sample-mission.md --template api-integration-core --dry-run
npm run scaffold -- generate --brief tests/fixtures/briefs/sample-mission.md --template api-integration-core --out worktrees/demo-run-001 --approve
npm run scaffold -- handover --brief tests/fixtures/briefs/sample-mission.md --template api-integration-core --out worktrees/demo-run-001 --approve
```

## Governance
- No autonomous push, merge, or production deploy.
- No secret values are read or logged.
- `.env.example` contains environment variable names and placeholders only.
- `--approve` is required before scaffold or handover files are written.
- Human review is required before any generated code is merged.

## Development
```bash
npm run lint
npm run typecheck
npm run test -- --coverage
```
