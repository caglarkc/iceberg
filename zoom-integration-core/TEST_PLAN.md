# TEST_PLAN.md — M2 Zoom Integration Core

## Automated (CI)

```bash
ZOOM_MODE=mock npm run lint && npm run typecheck && npm run test -- --coverage
```

| Suite | Coverage |
|-------|----------|
| MockZoomAdapter unit | OAuth cache, signature JWT, webhook verify |
| API integration | health, meetings, signature, webhooks, capability map, CRM adapter |
| Timeline mapper | recording.completed → zoom.recording.ready |

## Manual — Demo Day (5–7 min)

1. **Dashboard** (`/`) — OAuth ok, mode=mock, capability summary
2. **Meeting** (`/meeting`) — Create "Valuation Demo Call" → join URL + simulated embed + signature
3. **Events** (`/events`) — Replay `meeting.ended` → timeline updates
4. **Phone** (`/phone`) — Needs License banner + mock call log + tel: link
5. **Capability Map** (`/capability-map`) — Filter "Not Possible" → highlight server-side outbound call
6. **Diagnostics** (`/diagnostics`) — Limitations list

## Webhook replay (no ngrok)

```bash
curl -X POST http://localhost:4010/internal/webhooks/replay \
  -H 'Content-Type: application/json' \
  -d '{"fixture":"meetingEnded"}'
```

Fixtures: `urlValidation`, `meetingStarted`, `meetingEnded`, `recordingCompleted`, `phoneCallCompleted`

## Security checks

- [ ] `start_url` absent from public meeting API responses
- [ ] Invalid webhook signature → 401
- [ ] Duplicate `event_id` → single DB record
- [ ] No SDK secret in demo-web bundle

## Faz 2 regression (when credentials available)

- Real S2S OAuth token from Zoom
- Live webhook URL validation via Zoom Console
- Meeting SDK Component View in Chrome
- Cloud recording transcript fetch (or documented settings error)
