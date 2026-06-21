# M4 Test Plan

## Automated (CI)

| Suite | File | Coverage |
|-------|------|----------|
| Lint / types | `npm run lint`, `npm run typecheck` | — |
| Matching unit | `tests/matching.unit.test.ts` | proximity, address, weights |
| Parse unit | `tests/parse.unit.test.ts` | postcode, street, names |
| Golden match | `tests/matching.golden.test.ts` | T1–T4 |
| Extraction schema | `tests/extraction.unit.test.ts` | T5 Zod |
| ApiPlaud adapter | `tests/plaud.api.adapter.test.ts` | mock fetch, errors |
| API E2E | `tests/api.pipeline.test.ts` | T1 full, T3 confirm, T5 extract, consent |

GitHub: `.github/workflows/property-intelligence-pipeline-ci.yml`

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
