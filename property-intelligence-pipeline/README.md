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

## Demo flow (T1 happy path)

```bash
# Terminal 1
PLAUD_MODE=mock LLM_PROVIDER=mock npm run dev --workspace @pip/api

# Terminal 2
npm run dev --workspace @pip/web

# Or curl-only:
curl -X POST http://localhost:3002/api/plaud/ingest/mock
curl http://localhost:3002/api/plaud/inbox
# … match → confirm → extract → review → apply (see TEST_PLAN.md)
```

## Environment

Copy `.env.example` → `.env`:

| Variable | Description |
|----------|-------------|
| `PLAUD_MODE` | `mock` (CI) or `live` (ApiPlaudAdapter) |
| `PLAUD_API_BASE_URL` | Plaud partner API base URL |
| `PLAUD_CLIENT_API_KEY` | Partner API key |
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
apps/api            Express pipeline API
apps/web            React review inbox UI
fixtures/m4/        T1–T5 golden transcripts + CRM seed
```

## Governance

- AI output **never** auto-applies to CRM — agent review required
- High confidence (≥0.85) only speeds up UX; confirm still required
- Consent checkbox in UI before extraction (POC placeholder)

## Tests

```bash
npm run lint && npm run typecheck && npm run test -- --coverage
```

## Docs

- `RETRIEVAL.md` — Plaud data access paths
- `ENTITY_MATCHING.md` — confidence formula
- `TEST_PLAN.md` — manual + automated scenarios
- `HANDOVER.md` — main team devir
