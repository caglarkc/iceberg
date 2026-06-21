# Zoom Integration Core — Zoom Capability Lab

Iceberg Digital M2 POC: reusable Zoom integration service with **mock-first** architecture (`ZOOM_MODE=mock`).

## Quick start

```bash
cp .env.example .env
npm install
npm run test
npm run dev
```

- API: http://localhost:4010
- Demo UI: http://localhost:5174

Docker:

```bash
docker compose up
```

## Environment

| Variable | Default | Notes |
|----------|---------|-------|
| `ZOOM_MODE` | `mock` | Ay 1 — no Zoom credentials required |
| `PORT` | `4010` | API port |
| `APP_BASE_URL` | `http://localhost:4010` | Public base URL |
| `DATABASE_URL` | — | Optional PostgreSQL; in-memory store when unset |

Faz 2 credentials (commented in `.env.example`): `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`, `ZOOM_SDK_KEY`, `ZOOM_SDK_SECRET`.

## API (M3 contract)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/zoom/health` | Service health |
| POST | `/api/zoom/meetings` | Create meeting |
| GET | `/api/zoom/meetings` | List meetings |
| POST | `/api/zoom/signature` | Meeting SDK JWT |
| POST | `/api/zoom/webhooks` | Webhook receiver |
| GET | `/api/zoom/events` | Event log |
| GET | `/api/zoom/capability-map` | 27-item capability matrix |
| GET | `/api/zoom/phone/capabilities` | Phone license status |

OpenAPI: [`docs/openapi.yaml`](docs/openapi.yaml)

## Architecture

```
ZoomProvider (interface)
  ├── MockZoomAdapter   ← Ay 1 default
  └── RealZoomAdapter   ← Faz 2 stub
```

Modules: `auth/`, `meetings/`, `sdk/`, `webhooks/`, `phone/`, `recordings/`, `crm-adapter/`, `api/`

## Ay 1 scope (honest)

- ✅ Mock meeting create, signature, webhook ingest, capability map
- ✅ Demo UI with simulated embed panel
- ✅ CRM TimelineEvent adapter
- ⏸ Real Meeting SDK WASM — Faz 2
- ⏸ Zoom Phone Smart Embed — Faz 2
- ⏸ Live webhooks via ngrok — Faz 2

## Tests

```bash
npm run lint && npm run typecheck && npm run test -- --coverage
```

## Docs

- [`TEST_PLAN.md`](TEST_PLAN.md)
- [`HANDOVER.md`](HANDOVER.md)
- [`docs/CAPABILITY_MAP.md`](docs/CAPABILITY_MAP.md)
- [`docs/ZOOM_PARTNER_ESCALATION.md`](docs/ZOOM_PARTNER_ESCALATION.md)
