# M3 Recommendation

## Should we continue?

**Yes — conditionally.** The mock POC proves CRM-native Zoom flow is feasible without context switching. Production requires Lifesycle API access and Zoom license approval.

## Simplest MVP

Link redirect + timeline + external Zoom Integration Service. Ship in ~1 week.

## Preferred Demo Path

Meeting API create → Meeting SDK embed (slide-over) → webhook timeline update. Embed must always have redirect fallback.

## Do Not Build (Yet)

- Video SDK custom room
- Production Laravel merge before adapter spec
- OAuth inside CRM (belongs in M2 service)

## Main Team Next Steps

1. Schema workshop — contacts, valuations, timeline API
2. Staging Zoom sandbox + service deploy
3. Feature flag `zoom_meetings_enabled` per tenant
4. Security review — start_url encryption, RBAC
