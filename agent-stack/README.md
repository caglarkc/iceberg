# Iceberg Agent Stack

> ASSUMPTION-BASED PLAN: the checked-in M5 mission brief is known to be wrong, so this repo follows `missions/m5-agent-stack/plans/*` as the source of truth.

Iceberg Agent Stack turns a mission brief into a review-ready POC scaffold plus handover package. It is governance-aware: dry-run is the default behavior, file writes require explicit human approval, and generated output is marked as AI-generated.

## What Works
- Brief parser: Markdown mission brief to validated JSON.
- Template registry: `api-integration-core`, `crm-mock-poc`, `intelligence-layer`.
- Scaffold generator: Handlebars-based file tree rendering.
- Handover generator: `README.md`, `TEST_PLAN.md`, `HANDOVER.md`, `.env.example`.
- LLM fallback: deterministic `LLM_PROVIDER=mock` for template suggestions; remote providers are optional stubs (see below).
- MCP: stdio read-only `iceberg-template-mcp` server for template discovery.
- CI: root GitHub Actions workflow runs build, lint, typecheck, tests, coverage, and smoke.

## Quick Start
```bash
npm install
npm run build
LLM_PROVIDER=mock npm run test -- --coverage
npm run smoke
```

## CLI
```bash
npm run scaffold -- parse --brief tests/fixtures/briefs/sample-mission.md
npm run scaffold -- generate --brief tests/fixtures/briefs/sample-mission.md --template api-integration-core --dry-run
npm run scaffold -- generate --brief tests/fixtures/briefs/sample-mission.md --template api-integration-core --out worktrees/demo-run-001 --approve
npm run scaffold -- handover --brief tests/fixtures/briefs/sample-mission.md --template api-integration-core --out worktrees/demo-run-001 --approve
```

## LLM providers (optional stubs in POC)

**Gemini, OpenAI, and Anthropic adapters in `packages/llm` are intentional stubs in this POC.** They expose the shared `LlmService` interface and env vars (`LLM_PROVIDER`, `LLM_MODEL`, provider API keys) but do not perform live API calls. Use `LLM_PROVIDER=mock` for deterministic, CI-safe behavior.

Production would add real provider adapters with structured JSON output and healing retries. **Core M5 value is the parser, scaffolder, governance gate, and template library — not remote LLM inference.** This matches [`shared/plans/SHARED_PLAN_CONSTRAINTS.md`](../shared/plans/SHARED_PLAN_CONSTRAINTS.md) §1.3–1.4: M5 scaffold must work without LLM; Cursor API is optional.

## Demo artefacts and output policy

| Path | Purpose |
|------|---------|
| `/tmp/agent-stack-*` | Written by `npm run smoke` only — ephemeral, CI-safe |
| `demo/output/` | Committed example scaffold for reviewers (not updated by smoke) |

- `demo/sample-brief.md`: demo input.
- `demo/expected-tree.txt`: expected scaffold tree.
- `demo/output/`: approved sample scaffold output (regenerate locally when templates change; see [`docs/DEMO_OUTPUT.md`](docs/DEMO_OUTPUT.md)).
- `demo/screenshots/`: captured CLI transcripts for parse, dry-run, and approve flows.
- `docs/DEMO_SCRIPT.md`: five-minute live demo script.
- `docs/DEMO_OUTPUT.md`: smoke vs committed demo output policy and regeneration steps.

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
npm run smoke
```
