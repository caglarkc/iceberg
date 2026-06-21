# Lifesycle Zoom CRM POC (M3)

Mock Lifesycle CRM demonstrating Zoom meeting scheduling, timeline integration, and simulated in-app embed — consuming the external **Zoom Integration Service** as a black-box HTTP API.

## Architecture

```
Mock CRM UI (Next.js) → CRM API routes → MeetingService → ZoomIntegrationClient
                                              ↓
                                    SQLite (contacts, meetings, timeline)
                                              ↓
                              Zoom Integration Service (mock HTTP / in-process)
```

## Quick Start

```bash
cd lifesycle-zoom-crm-poc
cp .env.example .env
npm install
npm run seed
npm run dev
```

- **CRM UI:** http://localhost:3003
- **Mock Zoom Service:** http://localhost:4010/api/v1

## Demo Flow

1. Open Contacts → **Sarah Mitchell**
2. Property **14 Oak Lane** → Schedule Valuation Call
3. Confirm meeting → timeline event appears
4. **Join in Lifesycle** (simulated embed) or **Join in Zoom** (redirect)
5. Simulate webhook: `curl -X POST http://localhost:3003/api/webhooks/zoom -H "X-Webhook-Secret: whsec_local_dev_secret" -H "Content-Type: application/json" -d '{"event":"meeting.ended","zoom_meeting_id":"<ID>","payload":{"duration_minutes":47,"participant_count":2}}'`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | CRM + mock Zoom service |
| `npm run test -- --coverage` | Unit + contract + integration (CI gate) |
| `npm run lint` | ESLint |
| `npm run seed` | Load demo contacts/properties |

## Environment

See `.env.example`. Key vars: `ZOOM_MODE=mock`, `ZOOM_SERVICE_URL`, `ENCRYPTION_KEY`, `ZOOM_WEBHOOK_SECRET`.

## Docs

- `contracts/zoom-integration-service.openapi.yaml` — consumer API contract
- `docs/ZOOM_CRM_RESEARCH.md` — integration research
- `docs/RECOMMENDATION.md` — MVP recommendation
- `docs/DEMO_DAY_REFLECTION.md` — demo retrospective
- `HANDOVER.md` — handover index (includes M2↔M3 path mapping)
- `TEST_PLAN.md` — manual test scenarios
