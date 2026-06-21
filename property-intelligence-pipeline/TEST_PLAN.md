# M4 Test Plan

## Automated (CI)

| Suite | Command | Coverage |
|-------|---------|----------|
| Lint | `npm run lint` | — |
| Types | `npm run typecheck` | — |
| Unit | `tests/matching.unit.test.ts` | proximity, address, weights |
| Golden | `tests/matching.golden.test.ts` | T1–T4 fixtures |
| Extraction | `tests/extraction.unit.test.ts` | Zod schema T5 |
| API E2E | `tests/api.pipeline.test.ts` | ingest→apply T1 |

Env: `PLAUD_MODE=mock LLM_PROVIDER=mock`

## Manual scenarios

| # | Scenario | Steps | Expected |
|---|----------|-------|----------|
| D1 | Demo script 5 min | Web: load mock → T1 match → extract → approve 4 fields → apply | Proposal + timeline updated |
| D2 | Offline | No network, mock env | Full pipeline works |
| D3 | T3 review queue | Open T3 recording, run match | 16 Oak Lane top-1, review queue |
| D4 | T4 unmatched | Open T4 recording | confidence <0.60, unmatched |
| D5 | Upload ingest | POST plain text to `/api/plaud/ingest/upload` | New inbox item |
| D6 | Duplicate apply | Apply same recording twice | 400 error |
| D7 | Consent gate | Extract without checkbox | UI blocks / message |

## Live (local only)

- Set `PLAUD_MODE=live` + Plaud credentials → `listRecordings` against partner API
- Set `LLM_PROVIDER=gemini` + `GEMINI_API_KEY` → real extraction on T5

**Never** run live Plaud/LLM in CI.
