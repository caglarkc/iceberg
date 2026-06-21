# M3 Test Plan

## Automated (CI)

```bash
ZOOM_MODE=mock npm run lint && npm run typecheck && npm run test
```

| ID | Scenario | Suite |
|----|----------|-------|
| T01 | Schedule meeting from valuation | integration |
| T02 | Instant meeting | integration |
| T06 | Webhook meeting.ended | integration |
| T07 | Duplicate active meeting 409 | integration |
| T09 | start_url not in API response | integration |
| — | Zoom service contract | contract |
| — | Topic generator / encryption | unit |

## Manual Checklist

- [ ] Contact list shows 5 seed contacts
- [ ] Sarah Mitchell → 14 Oak Lane valuation visible
- [ ] Schedule meeting → meeting card + timeline event < 3s
- [ ] Join in Zoom opens new tab
- [ ] Join in Lifesycle opens slide-over mock panel
- [ ] Webhook inject updates duration on timeline
- [ ] Settings page shows env config
- [ ] Embed fail → redirect fallback button visible

## Webhook Replay

```bash
curl -X POST http://localhost:3003/api/webhooks/zoom \
  -H "X-Webhook-Secret: whsec_local_dev_secret" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "meeting.ended",
    "zoom_meeting_id": "87654321001",
    "payload": {
      "duration_minutes": 47,
      "participant_count": 2,
      "recording_files": [{"type": "audio_transcript", "status": "processing"}]
    },
    "tracking": {"crm_contact_id": "cnt_sarah", "crm_valuation_id": "val_001"}
  }'
```

Replace `zoom_meeting_id` with the meeting created in UI.
