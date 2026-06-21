# M3 Handover

## Deliverables

| Item | Location |
|------|----------|
| Mock CRM POC | `lifesycle-zoom-crm-poc/` |
| Zoom service contract | `contracts/zoom-integration-service.openapi.yaml` |
| Mock Zoom HTTP server | `tools/zoom-service-mock/` |
| Research | `docs/ZOOM_CRM_RESEARCH.md` |
| Recommendation | `docs/RECOMMENDATION.md` |
| UX flow | `docs/UX_FLOW.md` |
| Demo Day reflection | `docs/DEMO_DAY_REFLECTION.md` |
| Test plan | `TEST_PLAN.md` |

## Setup

1. `cp .env.example .env`
2. `npm install && npm run seed`
3. `npm run dev` — CRM :3003, Zoom mock :4010
4. `npm run test -- --coverage` — must pass before demo (CI merge blocker)

## M2 ↔ M3 Integration (Path Mapping)

M3 treats Zoom as a **black box**. The in-repo M2 service (`zoom-integration-core`) and M3 consumer contract differ by design in Ay 1:

| Concern | M2 (`zoom-integration-core`) | M3 consumer (`lifesycle-zoom-crm-poc`) |
|---------|------------------------------|----------------------------------------|
| Base path | `/api/zoom/...` | `/api/v1/...` |
| Auth | None in Ay 1 mock | `Authorization: Bearer {CRM_SERVICE_TOKEN}` |
| Mock server | In-process `MockZoomAdapter` | `tools/zoom-service-mock/` HTTP server |
| Webhook shape | Raw Zoom events | Normalized CRM events (`meeting.ended`, etc.) |

**Production bridge:** deploy an API gateway or adapter layer that maps M3 client calls to M2 routes and translates webhooks. Do not point M3 directly at M2 without this mapping.

Example mapping:

```
M3 POST /api/v1/meetings     →  M2 POST /api/zoom/meetings
M3 GET  /api/v1/capabilities →  M2 GET  /api/zoom/capabilities
M2 webhook (raw)             →  normalize → M3 POST /api/webhooks/zoom
```

## Known Limitations

- Lifesycle production schema unknown — mock entities only
- Meeting SDK embed is **simulated** (no WASM)
- Zoom OAuth/token refresh lives in external service (M2)
- GDPR/consent — documented, not implemented

## Next Steps (Main Team)

1. Validate Lifesycle contact/timeline API mapping (Faz 2)
2. Deploy Zoom Integration Service with sandbox credentials + M2↔M3 adapter
3. MVP production path: redirect + timeline → embed with fallback
4. Workshop: timeline API, multi-branch Zoom accounts

See `docs/RECOMMENDATION.md` for full decision matrix.
