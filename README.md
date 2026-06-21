# Iceberg X

Monorepo for the **Iceberg X** product portfolio: five mission-scoped proof-of-concept applications, shared planning assets, and the agent scaffolding toolchain. Each POC is an independent Node.js workspace with its own README, tests, and CI workflow.

**Last updated:** June 2026

---

## Repository layout

```
iceberg/
├── missions/          # Mission plans, starter prompts, and acceptance criteria (M1–M5)
├── shared/plans/      # Cross-mission constraints, implementation index, agent kickoff prompts
├── agent-stack/       # M5 — POC scaffolder, governance, and template library
├── iceberg-x-intelligence-poc/   # M1 — Intelligence layer (ingest, LLM, review UI)
├── zoom-integration-core/      # M2 — Zoom provider abstraction (mock-first)
├── lifesycle-zoom-crm-poc/     # M3 — CRM + Zoom meeting flow POC
└── property-intelligence-pipeline/  # M4 — Plaud ingest → match → extract → apply
```

| Mission | Product | Directory | Local API port |
|---------|---------|-----------|----------------|
| M1 | Iceberg X Intelligence Layer | [`iceberg-x-intelligence-poc/`](iceberg-x-intelligence-poc/) | 3101 |
| M2 | Zoom Integration Core | [`zoom-integration-core/`](zoom-integration-core/) | 3201 |
| M3 | Lifesycle Zoom Meeting Flow | [`lifesycle-zoom-crm-poc/`](lifesycle-zoom-crm-poc/) | 3301 |
| M4 | Property Intelligence Pipeline | [`property-intelligence-pipeline/`](property-intelligence-pipeline/) | 3002 (API) / 5174 (Web) |
| M5 | Agent Stack | [`agent-stack/`](agent-stack/) | — |

Planning and agent onboarding: [`shared/plans/IMPLEMENTATION_INDEX.md`](shared/plans/IMPLEMENTATION_INDEX.md)

---

## Continuous integration

Each POC has a path-scoped workflow under [`.github/workflows/`](.github/workflows/). Pipelines run on `push` and `pull_request` to `main` when files in that POC change.

| Workflow | POC |
|----------|-----|
| `iceberg-x-intelligence-poc-ci.yml` | M1 |
| `zoom-integration-core-ci.yml` | M2 |
| `lifesycle-zoom-crm-poc-ci.yml` | M3 |
| `property-intelligence-pipeline-ci.yml` | M4 |
| `agent-stack-ci.yml` | M5 |

All workflows use **Node 20**, `npm ci`, lint, typecheck, and tests with coverage gates where configured.

---

## Quick start (any POC)

```bash
cd <poc-directory>
cp .env.example .env    # adjust keys per README
npm ci
npm run dev             # or npm run build && npm start — see POC README
npm run lint && npm run typecheck && npm run test
```

Month-1 defaults (no live Zoom): `ZOOM_MODE=mock`, `LLM_PROVIDER=mock` where applicable.

---

## Missions folder

[`missions/`](missions/) holds product plans and **STARTER_IMPLEMENTATION_PROMPT** files for AI-assisted implementation. These are specification documents, not runtime code.

| Mission | Folder |
|---------|--------|
| M1 | [`missions/m1-iceberg-x-intelligence-layer/`](missions/m1-iceberg-x-intelligence-layer/) |
| M2 | [`missions/m2-zoom-integration-core/`](missions/m2-zoom-integration-core/) |
| M3 | [`missions/m3-lifesycle-zoom-meeting-flow/`](missions/m3-lifesycle-zoom-meeting-flow/) |
| M4 | [`missions/m4-property-intelligence-pipeline/`](missions/m4-property-intelligence-pipeline/) |
| M5 | [`missions/m5-agent-stack/`](missions/m5-agent-stack/) |

---

## Shared plans

[`shared/plans/`](shared/plans/) — credential policy, LLM defaults, test requirements, and copy-paste agent kickoff prompts.

---

## Contributing

1. Work in the POC directory for your mission; do not cross-mix unrelated missions in one commit.
2. Keep commits scoped (`feat(mN):`, `fix(mN):`, `chore(repo):`).
3. Ensure local `lint`, `typecheck`, and `test` pass before push.
4. Each POC must maintain `README.md`, `TEST_PLAN.md`, `HANDOVER.md`, and `.env.example`.

---

## License

Private — Iceberg X internal use.
