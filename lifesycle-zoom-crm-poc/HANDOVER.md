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
| Test plan | `TEST_PLAN.md` |

## Setup

1. `cp .env.example .env`
2. `npm install && npm run seed`
3. `npm run dev` — CRM :3003, Zoom mock :4010
4. `npm test` — must pass before demo

## Known Limitations

- Lifesycle production schema unknown — mock entities only
- Meeting SDK embed is **simulated** (no WASM)
- Zoom OAuth/token refresh lives in external service (M2)
- GDPR/consent — documented, not implemented

## Next Steps (Main Team)

1. Validate Lifesycle contact/timeline API mapping (Faz 2)
2. Deploy Zoom Integration Service with sandbox credentials
3. MVP production path: redirect + timeline → embed with fallback
4. Workshop: timeline API, multi-branch Zoom accounts

See `docs/RECOMMENDATION.md` for full decision matrix.
