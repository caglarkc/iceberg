# M3 Bridge Mapping — Consumer Contract to M2 Routes

M3 (`lifesycle-zoom-crm-poc`) consumes a **versioned black-box API** defined in
`lifesycle-zoom-crm-poc/contracts/zoom-integration-service.openapi.yaml` (base path
`/api/v1`, bearer auth).

M2 (`zoom-integration-core`) exposes its **native routes** under `/api/zoom/*` and
`/internal/*` (see [`openapi.yaml`](openapi.yaml)).

Until M2 serves the M3 contract directly, an adapter layer (reverse proxy, API gateway,
or thin bridge service) maps M3 calls to M2. This document is the official mapping.

## Base URLs (local)

| Layer | URL | Notes |
|-------|-----|-------|
| M3 consumer | `http://localhost:4010/api/v1` | `ZOOM_SERVICE_URL` in M3 |
| M2 native API | `http://localhost:4010` | `PORT` / `APP_BASE_URL` in M2 |
| M2 demo web | `http://localhost:5174` | Vite dev server |

> M3's bundled mock (`tools/zoom-service-mock`) also listens on port `4010` with
> `/api/v1` paths. When integrating against real M2, point M3 at a bridge that
> translates paths below, or run M2 on a different host/port.

## Path mapping

| M3 consumer (method + path) | M2 native route | Adapter notes |
|-----------------------------|-----------------|---------------|
| `GET /api/v1/capabilities` | `GET /api/zoom/capability-map` | Map `items[]` → boolean flags (`create_meeting`, `instant_meeting`, `embed_sdk`, etc.). See [`bridge-contract.yaml`](bridge-contract.yaml). |
| `POST /api/v1/meetings` | `POST /api/zoom/meetings` | M3 requires `tracking.crm_contact_id`; store in meeting metadata/settings. M2 body uses `topic`, `type`, `start_time`, … |
| `POST /api/v1/meetings/instant` | `POST /api/zoom/meetings` | Set `type: 1` (instant). Pass `tracking` into metadata. |
| `GET /api/v1/meetings/{id}` | `GET /api/zoom/meetings/{id}` | Map `zoom_meeting_id` / `zoom_meeting_uuid` ↔ M3 `id` field |
| `POST /api/v1/meetings/{id}/embed-signature` | `POST /api/zoom/signature` | Resolve meeting → `meetingNumber`; body `{ meetingNumber, role }` from M3 `{ role, user_name, user_email }` |
| `POST /api/v1/webhooks/replay` | `POST /internal/webhooks/replay` | M3 sends arbitrary JSON; M2 expects `{ fixture: "meetingEnded" \| … }`. Map or proxy fixture names. |

## Auth

| M3 | M2 (Ay 1) |
|----|-----------|
| `Authorization: Bearer <ZOOM_SERVICE_API_KEY>` | No bearer on public `/api/zoom/*` in mock POC |

Bridge should validate M3 bearer token and forward to M2 without auth, or add M2 API-key middleware in Faz 2.

## Response shape differences

### Create meeting

**M3 expects** (`ZoomMeetingResponse`): `id`, `zoom_meeting_id`, `join_url`, `status`, `created_at`, …

**M2 returns**: `zoom_meeting_id` (number), `zoom_meeting_uuid`, `join_url`, `topic`, `status`, …

Bridge maps `id` ← `zoom_meeting_uuid` or stringified `zoom_meeting_id`.

### Embed signature

**M3 expects**: `{ signature, sdk_key, meeting_number, password?, zak?, expires_at }`

**M2 returns**: `{ signature, sdkKey }` — bridge adds `meeting_number`, `expires_at`, optional `password`.

### Capabilities

**M3 expects**: `{ create_meeting, instant_meeting, embed_sdk, cloud_recording, transcript_webhook, phone }`

**M2 returns**: `{ items: CapabilityItem[], total }` — bridge derives booleans from capability map + `implementation` field.

## M2-only endpoints (no M3 equivalent)

These remain on M2 for demo, ops, and CRM adapter work:

- `GET /api/zoom/health`
- `GET /api/zoom/events`, `GET /api/zoom/events/{id}`
- `POST /api/zoom/webhooks` (live Zoom callbacks)
- `GET /api/zoom/meetings/{uuid}/recordings`, `…/transcript`
- `GET /api/zoom/phone/*`
- `POST /internal/crm-adapter/timeline-event`
- `POST /internal/oauth/refresh`, `POST /internal/jobs/transcript-fetch`

## Reference artifacts

- M2 native OpenAPI: [`openapi.yaml`](openapi.yaml)
- M3 consumer OpenAPI: `lifesycle-zoom-crm-poc/contracts/zoom-integration-service.openapi.yaml`
- Bridge overlay (adapter-facing): [`bridge-contract.yaml`](bridge-contract.yaml)
