# Demo Day Reflection — M3 Lifesycle Zoom Meeting Flow

> Brief requirement: honest retrospective on planning, testing, scope, and execution.

## 1. Which user flow should we have frozen earlier?

**Valuation call flow** (Sarah Mitchell → 14 Oak Lane → schedule → timeline → join) should have been locked on Day 2. We spent time on generic contact/instant paths before the demo script was fixed. Freezing the 90-second demo script first would have reduced UI churn.

## 2. Which integration test should have been automated before demo day?

**Full webhook chain:** `create meeting → meeting.ended → recording.completed → timeline assertions`. This was manually documented in TEST_PLAN but not fully automated until the coverage fix sprint. Automating this earlier would have caught the missing `recording.completed` handler sooner.

## 3. How could we explain mock CRM vs real Lifesycle more clearly to stakeholders?

Add a **side-by-side slide**: Mock entity (`contacts.id = cnt_sarah`) vs assumed Lifesycle mapping (`Contact` / `Valuation` / `activity_log`). Label every mock field with “assumption — validate in Faz 2 workshop.” HANDOVER now includes M2 path mapping for the same reason.

## 4. Was the embed fallback scenario rehearsed enough?

Partially. Redirect fallback was always visible in UI, but **simulated embed failure → auto-redirect** was not exercised in a scripted run. Recommendation: one Playwright smoke test that forces embed-signature 404 and asserts “Join in Zoom” remains enabled.

## 5. What was the single biggest gap in the handover package?

**CI coverage gate** — tests passed locally without `--coverage`, masking a functions threshold failure. Root workflow + coverage in the standard `npm test` path are now required before calling the mission merge-ready.

## Improvements for next mission

| Area | Action |
|------|--------|
| CI | Run `npm run test -- --coverage` in every phase commit |
| Contracts | Explicit M2↔M3 path mapping table in HANDOVER |
| Demo | Record 90s Loom before polish week |
| Tests | One E2E smoke per demo script step |
