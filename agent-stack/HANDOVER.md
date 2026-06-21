# HANDOVER

## Summary
This initial Agent Stack POC implements the M5 plan from the shared constraints and mission roadmap: brief parser, scaffold generator, handover generator, mock LLM fallback, governance gate, tests, and CI.

## Completed Scope
- Faz 0: monorepo structure, governance docs, env policy, CI workflow.
- Hafta 1: parser, template registry, one golden scaffold path, CLI parse/generate.
- Hafta 2: handover generator and additional templates.
- Hafta 3: mock LLM suggestion, approve gate, audit log.
- Hafta 4: demo fixture, demo script, self-dogfooding handover.

## LLM providers (optional stubs in POC)

Gemini, OpenAI, and Anthropic entries in `packages/llm` are **optional stubs**, not production adapters. `LLM_PROVIDER=mock` is the supported path for tests, smoke, and demo. Remote provider names validate env vars then throw with a clear message — scaffold and handover flows do not depend on live LLM calls.

Per [`shared/plans/SHARED_PLAN_CONSTRAINTS.md`](../shared/plans/SHARED_PLAN_CONSTRAINTS.md) §1.4, M5 must run LLM-free; real provider wiring is a later enhancement.

### Cross-mission note (X-05 — M5 portion)

M1 ([`iceberg-x-intelligence-poc`](../iceberg-x-intelligence-poc/)) and M4 ([`property-intelligence-pipeline`](../property-intelligence-pipeline/)) ship **full** Gemini/OpenAI/Anthropic clients because inference is core to those product demos (classification, extraction, review). M5 intentionally differs: it meta-scaffolds other missions and prioritizes deterministic governance over API spend. Shared env naming (`LLM_PROVIDER`, `LLM_MODEL`) keeps the monorepo consistent; only M1/M4 perform live calls today.

## Smoke vs demo output

- **`npm run smoke`** writes to `/tmp` only — safe for CI, nothing committed.
- **`demo/output/`** is a committed reviewer artefact; regenerate with `--out demo/output --approve` when templates change (see [`docs/DEMO_OUTPUT.md`](docs/DEMO_OUTPUT.md)).

## Known Issues
- Cursor SDK and MCP server are represented as optional POC stubs, not live integrations.
- Remote LLM providers intentionally throw unless later wired through provider-specific clients.
- Generated app scaffolds are boilerplate, not production services.

## Next Steps
- Add provider-specific LLM JSON healing retries.
- Expand template manifests with richer file-level metadata.
- Add a real MCP server transport when the demo needs tool invocation.
- Add GitHub PR automation in a sandbox repository only.

## Demo Day Reflection
- Better plan: the root CI workflow and gitignore exceptions should have been verified from a fresh clone before declaring the demo ready.
- Earlier tests: CLI script-path smoke tests and all-template golden tests should have been present from day one.
- Scope cut: Cursor SDK orchestration should stay optional until deterministic scaffold and handover flows are fully reproducible.
- Communication: the known-wrong mission brief needs to remain visible in README and HANDOVER so reviewers understand why the plan files are authoritative.

## Governance
- The original M5 brief is not trusted.
- No autonomous merge.
- No secret value reads.
- Human approval required before write operations.
