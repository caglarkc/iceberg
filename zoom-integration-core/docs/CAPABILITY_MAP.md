# Capability Map — M2 Zoom Integration Core

> Runtime API: `GET /api/zoom/capability-map`  
> Ay 1: findings based on architecture research + mock verification (no live Zoom tenant).

## Status legend

- **Possible Now** — achievable with current scopes/licenses (may still be mock/simulated in Ay 1)
- **Needs License** — extra Zoom license or account setting
- **Not Possible** — no API/SDK path; document alternative
- **Escalate** — confirm with Zoom Partner Support

## Implementation legend (Ay 1 honesty)

Each item includes an `implementation` field:

| Value | Meaning |
|-------|---------|
| `real` | Working code path in Ay 1 POC (may still use mock Zoom backend) |
| `mock` | Mock adapter / fixture only — not live Zoom |
| `simulated` | UI or flow simulated (e.g. embed panel placeholder) |
| `none` | Not implemented; blocked by license or feasibility |

Filter by status: `?status=not_possible` (unchanged). Consumers can inspect `implementation` per item.

## Highlights for Demo Day

| Feature | Status | Implementation | Ay 1 note |
|---------|--------|----------------|-----------|
| REST meeting create | Possible Now | mock | Mock adapter ✅ |
| Meeting SDK embed | Possible Now | simulated | Simulated UI; WASM Faz 2 |
| Server-side outbound Phone call | **Not Possible** | none | **Demo talking point** |
| Webhook lifecycle events | Possible Now | mock | Mock replay ✅ |
| Cloud transcript | Possible Now | mock | Mock transcript ✅ |
| Smart Embed Phone | Needs License | none | Feasibility tab only |

Full list (27 items) served by API — filter with `?status=not_possible`.

## Meeting SDK vs Video SDK

**Selected for CRM embed:** Meeting SDK (Component View)  
**Not selected:** Video SDK (custom room — different product/license)

## Phone constraints

- Click-to-call requires user interaction (Smart Embed or URI scheme)
- No headless/server-initiated outbound call API
- Webhook events (`phone.*_call_log_completed`) drive workflows

See [`DEMO_AND_ROADMAP_PLAN.md`](../../missions/m2-zoom-integration-core/plans/DEMO_AND_ROADMAP_PLAN.md) for full matrix.
