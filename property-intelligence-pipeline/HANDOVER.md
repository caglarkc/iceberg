# M4 Handover

## What ships

- Working Property Intelligence Pipeline POC (`property-intelligence-pipeline/`)
- Mock Plaud ingest + optional live `ApiPlaudAdapter`
- Weighted entity matcher with golden tests T1–T4
- Structured AI extraction with mock/live LLM
- Human review UI + apply to mock CRM proposal + timeline

## Run for stakeholders

```bash
cd property-intelligence-pipeline
npm install
PLAUD_MODE=mock LLM_PROVIDER=mock npm run dev
```

Open http://localhost:5174 → **Load mock fixtures** → open **14 Oak Lane** recording.

## Integration points (Faz 2)

| Component | Replace |
|-----------|---------|
| `MockCrmAdapter` | Lifesycle Property / Proposal / Timeline REST |
| `ApiPlaudAdapter` | Partner-confirmed Plaud endpoints |
| In-memory `PipStore` | PostgreSQL + Drizzle migrations |
| Demo auth (`actorId` constant) | SSO / per-agent session |

## Known issues

- In-memory store — restart clears pipeline state
- `ApiPlaudAdapter` expects partner URL shape (`/v1/recordings`) — adjust when spec confirmed
- EU data residency for Plaud/LLM not enforced in POC
- Community MCP/CLI **not** integrated (ToS risk)

## Devir checklist

- [ ] Legal sign-off on consent placeholder text
- [ ] Plaud partner API credentials in vault
- [ ] Lifesycle internal API access for apply
- [ ] CI green on `main` (`property-intelligence-pipeline/.github/workflows/ci.yml`)

## Contact

Iceberg R&D — M4 Property Intelligence Pipeline mission folder: `missions/m4-property-intelligence-pipeline/`
