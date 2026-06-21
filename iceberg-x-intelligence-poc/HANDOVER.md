# Handover

## Current State

This repo implements a standalone M1 demo POC. It is intentionally separate from production Iceberg X and does not write to any production database.

**Runtime persistence is in-memory.** The API reads and writes through `apps/api/src/store.ts` only. Drizzle schema (`drizzle/schema.ts`), SQL migration (`drizzle/0001_initial.sql`), and `docker-compose.yml` postgres service are scaffolding for a future PostgreSQL repository — they are not wired into the running API today.

## Local Ports

| Service | Port | URL |
| --- | --- | --- |
| API | 3001 | http://localhost:3001/api/health |
| Web | 5173 | http://localhost:5173 |

These match `.env.example` (`PORT=3001`, `WEB_PORT=5173`).

## Setup

```bash
npm install
LLM_PROVIDER=mock npm run dev
```

For Gemini-backed local testing, set `LLM_PROVIDER=gemini` and `GEMINI_API_KEY`.

## Docker Smoke (optional)

`docker-compose.yml` starts postgres (schema init), API on port 3001, and web on port 5173. The API container still uses the **in-memory store** — `DATABASE_URL` is set for future wiring but is unused at runtime.

```bash
cp .env.example .env
docker compose config    # validate compose file and interpolated env
docker compose up      # wait for postgres healthy, then api + web
```

Expect:

- `GET http://localhost:3001/api/health` → `{ "status": "ok" }`
- Web UI at http://localhost:5173

Stop with `docker compose down` (add `-v` to drop the postgres volume).

## Known Limitations

- Mock auth is for demo only.
- Persistence uses an in-memory store (see Current State above); data is lost on API restart.
- PostgreSQL schema and migration are included as the Phase 2 persistence path only.
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
