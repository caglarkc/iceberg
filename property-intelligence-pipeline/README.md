# Property Intelligence Pipeline (M4)

Plaud → Entity Match → AI Extract → Human Review → Proposal Apply POC for Iceberg Digital / Lifesycle.

**Mock-first:** CI uses `PLAUD_MODE=mock` and `LLM_PROVIDER=mock`. Live demo can use real Plaud API keys and Gemini.

## Quick start

```bash
cd property-intelligence-pipeline
npm install
PLAUD_MODE=mock LLM_PROVIDER=mock npm run dev
```

- API: http://localhost:3002
- Web: http://localhost:5174

> **Repo hygiene:** `node_modules/`, `coverage/`, `dist/` are gitignored. Run `npm install` after clone.

## Demo flow (T1 happy path)

```bash
PLAUD_MODE=mock LLM_PROVIDER=mock npm run dev --workspace @pip/api   # terminal 1
npm run dev --workspace @pip/web                                      # terminal 2

# Or curl-only:
curl -X POST http://localhost:3002/api/plaud/ingest/mock
curl http://localhost:3002/api/plaud/inbox
# … match → confirm → extract → review → apply (see TEST_PLAN.md)
```

## Environment

Copy `.env.example` → `.env`:

| Variable | Description |
|----------|-------------|
| `PLAUD_MODE` | `mock` (CI) or `live` (`ApiPlaudAdapter`) |
| `PLAUD_API_BASE_URL` | Plaud partner API base URL |
| `PLAUD_CLIENT_API_KEY` | Partner API key |
| `PLAUD_WEBHOOK_SECRET` | HMAC-SHA256 webhook secret (`x-plaud-signature`; partner algorithm may differ) |
| `LLM_PROVIDER` | `mock` \| `gemini` \| `openai` \| `anthropic` |
| `GEMINI_API_KEY` | For live extraction |
| `COMPANY_ID` | Tenant scope (`company-iceberg-001` demo) |

## Architecture

```
packages/plaud      PlaudProviderAdapter (mock | api | upload)
packages/matching   Weighted confidence entity matcher
packages/extraction Zod proposal field schema
packages/llm        Structured LLM + healing retry
packages/crm        Mock Lifesycle adapter (timeline + proposal draft)
apps/api            Express pipeline API (in-memory PipStore)
apps/web            React review inbox UI
fixtures/m4/        T1–T5 golden transcripts + CRM seed
drizzle/            Postgres DDL reference (Faz 2)
```

**Persistence:** POC uses in-memory store. Optional Postgres: `docker compose up -d postgres` (port 5433).

## Governance

- AI output **never** auto-applies to CRM — agent review required
- High confidence (≥0.85) only speeds up UX; confirm still required
- Consent checkbox in UI before extraction (POC placeholder)

## Tests & CI

```bash
PLAUD_MODE=mock LLM_PROVIDER=mock npm run lint && npm run typecheck && npm run test -- --coverage
```

GitHub Actions: `.github/workflows/property-intelligence-pipeline-ci.yml` (repo root).

## Docs

| File | Description |
|------|-------------|
| `RETRIEVAL.md` | Plaud data access paths |
| `ENTITY_MATCHING.md` | Confidence formula |
| `PRIVACY_GDPR.md` | Privacy checklist (POC) |
| `DEMO_DAY_REFLECTION.md` | Demo script + gaps |
| `TEST_PLAN.md` | Manual + automated scenarios |
| `HANDOVER.md` | Main team devir |
