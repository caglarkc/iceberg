# Handover

## Current State

This repo implements a standalone M1 demo POC. It is intentionally separate from production Iceberg X and does not write to any production database.

## Setup

```bash
npm install
LLM_PROVIDER=mock npm run dev
```

For Gemini-backed local testing, set `LLM_PROVIDER=gemini` and `GEMINI_API_KEY`.

## Known Limitations

- Mock auth is for demo only.
- Persistence currently uses an in-memory store for deterministic tests and fast demo startup.
- PostgreSQL schema and migration are included as the Phase 2 persistence path.
- No Zoom, Plaud, Lifesycle, Slack or SSO integration is implemented in M1.
- Handover export is markdown content via API response; file download can be added in production UI.

## Production Next Steps

1. Replace mock auth with Iceberg X SSO/session integration.
2. Swap in a Drizzle/PostgreSQL repository behind the current store contract.
3. Add `IcebergXAdapter` read-only mission sync.
4. Add rate limiting and prompt/cost observability for live LLM providers.
5. Pilot Submission Tracker and Readiness Score first.

## Demo Day Reflection

What worked:

- The 7-step Plaud transcript CRM scenario is now covered by an automated API integration test.
- Mock LLM mode makes the demo deterministic and safe for CI.
- Human review gating is visible in both API behavior and UI workflow.

What to say honestly:

- PostgreSQL is scaffolded with Drizzle schema/migration, but runtime persistence is intentionally in-memory for the POC.
- The web app is a single demo workspace instead of the full multi-route product map.
- shadcn/ui is not installed; the current UI uses custom CSS with lucide icons and a Tailwind-ready config.

Recommended demo framing:

1. Lead with the quality-control lifecycle, not the AI novelty.
2. Show the intern cannot see unpublished AI feedback.
3. Close with the production path: real auth, Drizzle repository, Iceberg X adapter, then pilot Submission Tracker + Readiness Score.

## Verification

```bash
LLM_PROVIDER=mock npm run lint
LLM_PROVIDER=mock npm run typecheck
LLM_PROVIDER=mock npm run test -- --coverage
```
