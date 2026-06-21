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

- API: http://localhost:3002
- Web: http://localhost:5174

Open http://localhost:5174 → **Load mock fixtures** → **14 Oak Lane** (T1).

## Persistence (POC)

Pipeline state uses an **in-memory `PipStore`** — restart clears inbox, matches, and review queue. Postgres schema (`drizzle/0001_initial.sql`) and `docker-compose.yml` are optional for Faz 2; not required for demo or CI.

## CI

Workflow: **`.github/workflows/property-intelligence-pipeline-ci.yml`** (repository root). **CI always sets `PLAUD_MODE=mock`** (and `LLM_PROVIDER=mock`) — no live Plaud or LLM calls in GitHub Actions.

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

## Live Plaud smoke (manual — not CI)

`ApiPlaudAdapter` is implemented and covered by unit tests (mocked `fetch`). **Real ingest is not verified in CI** — partner credentials required. Run locally only:

| Step | Action | Expected |
|------|--------|----------|
| L1 | Copy `.env.example` → `.env`; set `PLAUD_MODE=live`, `PLAUD_API_BASE_URL`, `PLAUD_CLIENT_API_KEY`, `PLAUD_WEBHOOK_SECRET` | Env loads without error |
| L2 | `PLAUD_MODE=live LLM_PROVIDER=mock npm run dev` | API on :3002, web on :5174 |
| L3 | Call `listRecordings` via adapter or partner poll endpoint | ≥1 recording or empty list (not 401/403) |
| L4 | POST sample webhook body with valid `x-plaud-signature` (HMAC-SHA256 of body with `PLAUD_WEBHOOK_SECRET`) | `verifyWebhook` returns true |
| L5 | Repeat L4 with wrong signature | `verifyWebhook` returns false |

Endpoint shape `/v1/recordings` is provisional until partner spec is confirmed. Partner webhook algorithm may differ in production — confirm with Plaud before go-live. See `DEMO_DAY_REFLECTION.md`.

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
