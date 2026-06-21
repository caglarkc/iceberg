# Demo Day Reflection (M4)

**Date:** 2026-06-21  
**Scenario:** T1 happy path — 14 Oak Lane, SW19 3PQ  
**Presenter:** Sarah (UK estate agent persona)

## What we demonstrated

1. **Problem:** Manual proposal entry after valuation loses transcript detail.
2. **Ingest:** Mock Plaud recording lands in agent inbox (mock-first banner visible).
3. **Match:** 92%+ confidence on 14 Oak Lane with reason chips (appointment, postcode, agent).
4. **Confirm:** Agent confirms match — no auto-bind even at high confidence.
5. **Extract:** Mock LLM pulls 7+ proposal fields with evidence quotes.
6. **Review:** Agent approves 4 fields, rejects/edits optional.
7. **Apply:** Approved fields update mock proposal draft + `plaud_transcript` timeline event.

## Backup paths used in rehearsal

| Risk | Mitigation |
|------|------------|
| LLM timeout | `LLM_PROVIDER=mock` + golden `expected_extractions.json` |
| Wrong match | Switch to T3 review-queue story |
| Offline | Full mock pipeline, no external APIs |

## What we did **not** claim

- ❌ Consumer Plaud account auto-pull (not officially supported)
- ❌ AI auto-completes proposal without human review
- ❌ Production-ready GDPR / legal sign-off

## What resonated with stakeholders

- Transparent confidence + reason chips
- Evidence-backed extraction per field
- Adapter pattern — swap Plaud source without changing pipeline

## Gaps for next iteration

| Gap | Owner | Target |
|-----|-------|--------|
| Live Plaud partner API | Platform + Plaud partner | Faz 2 — keys in `.env`, verify `ApiPlaudAdapter` |
| Postgres persistence | Main team | Faz 2 — `drizzle/0001_initial.sql` |
| Lifesycle CRM API | Main team | Replace `MockCrmAdapter` |
| Legal consent text | Legal | Before real customer data |

## Live Plaud demo note

`ApiPlaudAdapter` is implemented and unit-tested with mocked `fetch`. **Real ingest requires partner credentials** (`PLAUD_API_BASE_URL`, `PLAUD_CLIENT_API_KEY`). When keys are provided:

```bash
PLAUD_MODE=live LLM_PROVIDER=gemini npm run dev --workspace @pip/api
curl -X POST http://localhost:3002/api/plaud/ingest/mock  # replace with live poll endpoint when wired
```

Endpoint shape (`/v1/recordings`) is provisional — adjust when partner spec is confirmed.

## Metrics

- Demo duration target: 5 minutes
- Local test suite: 24 tests (mock env)
- Golden scenarios: T1–T4 match, T5 extraction
