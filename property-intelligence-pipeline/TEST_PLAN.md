# M4 Test Plan

## Automated (CI)

**CI uses `PLAUD_MODE=mock` and `LLM_PROVIDER=mock` only** — no live Plaud API or LLM calls in GitHub Actions.

| Suite | File | Coverage |
|-------|------|----------|
| Lint / types | `npm run lint`, `npm run typecheck` | — |
| Matching unit | `tests/matching.unit.test.ts` | proximity, address, weights |
| Parse unit | `tests/parse.unit.test.ts` | postcode, street, names |
| Golden match | `tests/matching.golden.test.ts` | T1–T4 |
| Extraction schema | `tests/extraction.unit.test.ts` | T5 Zod |
| ApiPlaud adapter | `tests/plaud.api.adapter.test.ts` | mock fetch, webhook HMAC, errors |
| API E2E | `tests/api.pipeline.test.ts` | T1 full, T3 confirm, T5 extract, consent |

GitHub: `.github/workflows/property-intelligence-pipeline-ci.yml` (env: `PLAUD_MODE=mock`, `LLM_PROVIDER=mock`)

**Local ports:** API http://localhost:3002 · Web http://localhost:5174

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

## Live Plaud smoke (manual — requires credentials)

**Not run in CI.** Separate from mock adapter / API E2E tests above.

| # | Step | Expected |
|---|------|----------|
| L1 | Set `PLAUD_MODE=live`, `PLAUD_API_BASE_URL`, `PLAUD_CLIENT_API_KEY`, `PLAUD_WEBHOOK_SECRET` in `.env` | Adapter constructs without error |
| L2 | Start dev (`npm run dev`) | API :3002, web :5174 |
| L3 | `listRecordings()` against partner API | 200 response (recordings or empty array) |
| L4 | Webhook: POST body with HMAC-SHA256 `x-plaud-signature` | `verifyWebhook` accepts |
| L5 | Same body with invalid signature | `verifyWebhook` rejects |

Partner webhook algorithm may differ in production — confirm with Plaud before go-live.

## Live LLM (local only)

- Set `LLM_PROVIDER=gemini` + `GEMINI_API_KEY` → real extraction on T5

**Never** run live Plaud or live LLM in CI (`PLAUD_MODE=mock` only in workflow).
