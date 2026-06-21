# Plaud Retrieval Guide (M4)

## Status (2026-06)

| Path | Resmiyet | POC | Production |
|------|----------|-----|------------|
| Mock fixtures | N/A | ✅ Primary for CI | ❌ |
| Manual upload (`UploadPlaudAdapter`) | User export | ✅ Fallback | ⚠️ |
| Partner API (`ApiPlaudAdapter`) | Partner | ✅ Live demo | 🎯 Target |
| Transcription API (audio submit) | Partner | Faz 2 | ✅ |
| Webhook `transcription.completed` | Beta | Faz 2 | ✅ |
| Consumer account pull | ❌ Not supported | ❌ | ❌ |
| Community MCP/CLI | Unofficial | Spike only | ❌ |

## Adapter interface

```typescript
interface PlaudProviderAdapter {
  readonly source: 'mock' | 'api' | 'upload';
  listRecordings(since?: Date): Promise<PlaudRecordingRaw[]>;
  fetchRecording(providerId: string): Promise<PlaudRecordingRaw>;
}
```

Factory: `PLAUD_MODE=mock|live` via `createPlaudAdapterFromEnv()`.

## Environment

```bash
PLAUD_MODE=live
PLAUD_API_BASE_URL=https://api.plaud.ai   # example — confirm with partner docs
PLAUD_CLIENT_ID=
PLAUD_CLIENT_API_KEY=
```

## API endpoints (this POC)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/plaud/ingest/mock` | Load `fixtures/m4/transcripts` |
| POST | `/api/plaud/ingest/upload` | Manual TXT / JSON body |
| GET | `/api/plaud/inbox` | List recordings |

## Risks

- Consumer Plaud accounts cannot reliably pull transcripts programmatically
- US/JP processing — EU region "coming soon" for UK GDPR
- Community tools (`plaud-mcp`) — ToS violation risk with customer data

## Escalation template

> B2B PropTech — UK estate agents record property valuations on Plaud devices; we need programmatic access to transcripts/summaries for CRM property proposals. Multi-tenant per-agent binding preferred.

Partner portal: https://dev.plaud.ai
