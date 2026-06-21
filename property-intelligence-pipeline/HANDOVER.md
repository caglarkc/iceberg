# M4 Handover

## What ships

- Property Intelligence Pipeline POC (`property-intelligence-pipeline/`)
- Full chain: ingest → match → confirm → extract → review → apply
- Mock Plaud + `ApiPlaudAdapter` (unit-tested, live keys required for real ingest)
- Golden tests T1–T4 + T5 extraction E2E (mock LLM)
- Review UI + governance (no auto-apply, consent gate, audit log)

## Run for stakeholders

```bash
cd property-intelligence-pipeline
npm install
PLAUD_MODE=mock LLM_PROVIDER=mock npm run dev
```

Open http://localhost:5174 → **Load mock fixtures** → **14 Oak Lane** (T1).

## CI

Workflow: **`.github/workflows/property-intelligence-pipeline-ci.yml`** (repository root).

```bash
PLAUD_MODE=mock LLM_PROVIDER=mock npm run lint && npm run typecheck && npm run test -- --coverage
```

## Integration points (Faz 2)

| Component | Replace |
|-----------|---------|
| `MockCrmAdapter` | Lifesycle Property / Proposal / Timeline REST |
| `ApiPlaudAdapter` | Partner-confirmed Plaud endpoints |
| In-memory `PipStore` | PostgreSQL — see `drizzle/0001_initial.sql` + `docker-compose.yml` |
| Demo auth (`actorId` constant) | SSO / per-agent session |

## Live Plaud demo

`ApiPlaudAdapter` is implemented and covered by unit tests (mocked `fetch`). **Real ingest is not verified in CI** — partner credentials required:

```bash
PLAUD_MODE=live
PLAUD_API_BASE_URL=<partner-url>
PLAUD_CLIENT_API_KEY=<key>
```

Endpoint shape `/v1/recordings` is provisional until partner spec is confirmed. See `DEMO_DAY_REFLECTION.md`.

## Known issues

- In-memory store — restart clears pipeline state (Postgres schema ready in `drizzle/`)
- EU data residency for Plaud/LLM not enforced in POC
- Community MCP/CLI **not** integrated (ToS risk)
- Web UI has no automated tests (API E2E covers pipeline)

## Devir checklist

- [x] Repo hygiene — `.gitignore`, no `node_modules` in git
- [x] Root CI workflow
- [x] `README`, `TEST_PLAN`, `HANDOVER`, `PRIVACY_GDPR`, `DEMO_DAY_REFLECTION`
- [ ] Legal sign-off on consent placeholder (`PRIVACY_GDPR.md`)
- [ ] Plaud partner API credentials in vault + live smoke test
- [ ] Lifesycle internal API access for apply

## Contact

Iceberg R&D — `missions/m4-property-intelligence-pipeline/`
