# Capability Map — M2 Zoom Integration Core

> Runtime API: `GET /api/zoom/capability-map`  
> Ay 1: findings based on architecture research + mock verification (no live Zoom tenant).

## Status legend

- **Possible Now** — achievable with current scopes/licenses in Faz 1
- **Needs License** — extra Zoom license or account setting
- **Not Possible** — no API/SDK path; document alternative
- **Escalate** — confirm with Zoom Partner Support

## Highlights for Demo Day

| Feature | Status | Ay 1 note |
|---------|--------|-----------|
| REST meeting create | Possible Now | Mock adapter ✅ |
| Meeting SDK embed | Possible Now | Simulated UI; WASM Faz 2 |
| Server-side outbound Phone call | **Not Possible** | **Demo talking point** |
| Webhook lifecycle events | Possible Now | Mock replay ✅ |
| Cloud transcript | Possible Now | Mock transcript ✅ |
| Smart Embed Phone | Needs License | Feasibility tab only |

Full list (27 items) served by API — filter with `?status=not_possible`.

## Meeting SDK vs Video SDK

**Selected for CRM embed:** Meeting SDK (Component View)  
**Not selected:** Video SDK (custom room — different product/license)

## Phone constraints

- Click-to-call requires user interaction (Smart Embed or URI scheme)
- No headless/server-initiated outbound call API
- Webhook events (`phone.*_call_log_completed`) drive workflows

See [`DEMO_AND_ROADMAP_PLAN.md`](../../missions/m2-zoom-integration-core/plans/DEMO_AND_ROADMAP_PLAN.md) for full matrix.
