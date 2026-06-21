# Zoom × Lifesycle CRM — Research Summary (M3)

## Products Compared

| Product | Use case | M3 demo |
|---------|----------|---------|
| Meeting REST API | Schedule/join links | ✅ Mock service |
| Meeting SDK for Web | In-app embed | ✅ Simulated panel |
| Video SDK | Custom room | ❌ Archived (ROI) |
| Zoom Phone | PSTN | ❌ Out of scope |

## Auth Model

- **Recommended:** Server-to-Server OAuth in external Zoom Integration Service
- M3 consumes bearer token (`ZOOM_SERVICE_API_KEY`) — no OAuth in CRM

## OAuth Scopes (External Service)

| Capability | Scope |
|------------|-------|
| Create meeting | `meeting:write:admin` |
| Read meeting | `meeting:read:admin` |
| SDK signature | App SDK credentials |
| Recording/transcript | `recording:read:admin` |

## CRM Binding

- `tracking` payload on create: contact, property, valuation IDs
- Timeline polymorphic events: `meeting.scheduled`, `meeting.ended`, etc.
- `start_url` encrypted at rest (AES-256-GCM); never returned to UI

## Post-Meeting Metadata

- Normalized webhook → CRM `/api/webhooks/zoom`
- Duration, participant count, transcript pending state

## Recommendation

**Phase 1:** Redirect + timeline (Week 1 MVP)  
**Phase 2:** REST + Meeting SDK embed with redirect fallback  
**Archive:** Video SDK custom room
