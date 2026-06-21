# M4 — Starter Implementation Prompt

> **Kullanım:** Bu prompt'u yeni bir AI coding agent oturumuna **tek başına** yapıştır. Agent sıfırdan `property-intelligence-pipeline` reposunu implement edecek.

---

## Rolün

Sen Iceberg Digital için **M4 — Property Intelligence Pipeline** (Plaud → Entity Match → AI Extract → Human Review → Proposal) POC'sini sıfırdan yazan senior full-stack geliştiricisin.

---

## Okuma Sırası (ZORUNLU)

1. `shared/plans/SHARED_PLAN_CONSTRAINTS.md`
2. `missions/m4-property-intelligence-pipeline/plans/DEMO_AND_ROADMAP_PLAN.md` — entity matching, extraction schema, demo script
3. `missions/m4-property-intelligence-pipeline/brief/MISSION_BRIEF.md`

---

## v1.1 Kısıtları

| Konu | Karar |
|------|--------|
| Plaud API | **Kullanıcı API key sağlayacak** — `ApiPlaudAdapter` birincil (live demo) |
| Mock Plaud | **Sadece test/CI** — `MockPlaudAdapter` |
| Upload fallback | Manuel export upload endpoint (opsiyonel ama önerilir) |
| LLM | `LLM_PROVIDER=gemini` varsayılan; openai + anthropic + mock |
| Lifesycle CRM | Mock adapter — external integration point |
| Test | CI'da `PLAUD_MODE=mock` + `LLM_PROVIDER=mock` |

---

## Repo ve Yapı

**Repo adı:** `property-intelligence-pipeline/`

```
property-intelligence-pipeline/
├── apps/
│   ├── api/                # Express
│   └── web/                # React review UI
├── packages/
│   ├── llm/                # LlmService (paylaşılan pattern)
│   ├── plaud/
│   │   ├── plaud-provider.interface.ts
│   │   ├── mock-plaud.adapter.ts
│   │   ├── api-plaud.adapter.ts      # LIVE
│   │   └── upload-plaud.adapter.ts
│   ├── matching/           # entity matching engine
│   └── extraction/         # proposal field extraction schemas
├── fixtures/m4/            # t1..t5 transcripts + golden expectations
├── drizzle/
├── tests/
├── .github/workflows/ci.yml
├── docker-compose.yml
├── .env.example
├── README.md
├── TEST_PLAN.md
└── HANDOVER.md
```

---

## Tech Stack

- Node.js 20, Express, TypeScript
- React + Vite + Tailwind
- PostgreSQL 16 + Drizzle
- Zod schemas for extraction output
- Vitest + Supertest
- `packages/llm` — gemini/openai/anthropic/mock

---

## PlaudProviderAdapter (Zorunlu)

```typescript
interface PlaudProviderAdapter {
  readonly source: 'mock' | 'api' | 'upload';
  listRecordings(since?: Date): Promise<PlaudRecordingRaw[]>;
  fetchRecording(providerId: string): Promise<PlaudRecordingRaw>;
  verifyWebhook?(headers: Record<string, string>, body: string): boolean;
}
```

Factory: `PLAUD_MODE=mock|live` — CI her zaman mock.

**Implementasyon sırası:** `MockPlaudAdapter` (test) → `ApiPlaudAdapter` (demo) → `UploadPlaudAdapter` (fallback)

---

## Pipeline Aşamaları

```
Ingest → Normalize → Entity Match → Confidence Gate → AI Extract → Human Review → Apply to Proposal
```

| Aşama | Açıklama |
|-------|----------|
| Ingest | Plaud API poll veya webhook |
| Normalize | `PlaudRecordingRaw` → internal `TranscriptRecord` |
| Entity Match | Company/User/Property — weighted confidence |
| Gate | ≥0.85 auto-suggest, 0.60–0.85 review queue, <0.60 unmatched |
| AI Extract | Structured proposal fields (Zod) |
| Review | Human approve/reject/edit UI |
| Apply | Mock CRM proposal draft update |

---

## Mock Fixtures (Zorunlu — Test)

`fixtures/m4/` — 5 UK valuation transcript (T1–T5) + `expected_matches.json` + `expected_extractions.json`

Plandaki T1–T5 senaryolarını birebir uygula.

---

## Entity Matching (Özet)

Skor bileşenleri (plandan):
- `appointment_proximity` — recorded_at vs valuation time
- `address_match` — postcode + fuzzy street
- `user_match` — agent/email
- `confidence` — weighted sum

Unit test: golden fixtures ile T1≥0.90, T3 top-3 candidates, T4 unmatched.

---

## AI Extraction Schema (Zod)

Proposal alanları (plandan): motivation, asking_price_hint, renovation_notes, comparables_mentioned, timeline_to_sell, condition_summary, key_concerns, recommended_actions.

`LlmService.completeStructured` + mock provider testleri.

---

## Implementasyon Sırası

### Faz 0

1. Scaffold + fixtures/m4 seed
2. `MockPlaudAdapter` + `ApiPlaudAdapter` skeleton (env-driven)
3. `LlmService` + mock
4. CI yeşil

### Hafta 1 — Ingest + Match

- Ingest job/API
- Matching engine + confidence
- Review queue API (unmatched + low confidence)
- **Test:** golden match expectations

### Hafta 2 — Extract + Review UI

- AI extraction endpoint
- Web: review queue, side-by-side transcript vs extraction
- Approve/reject → audit log
- **Test:** mock LLM extraction

### Hafta 3 — Apply + Plaud Live

- `ApiPlaudAdapter` — gerçek API (key'ler `.env`'den)
- Apply to mock proposal
- Consent checkbox + GDPR placeholder UI
- Upload fallback endpoint

### Hafta 4 — Demo + Docs

- 5 dk demo: T1 happy path + T3 manual pick
- Privacy/GDPR notes doc
- README, TEST_PLAN, HANDOVER

---

## Env Vars

```bash
PLAUD_MODE=live              # live | mock
PLAUD_API_BASE_URL=
PLAUD_CLIENT_ID=
PLAUD_CLIENT_API_KEY=

LLM_PROVIDER=gemini
GEMINI_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

DATABASE_URL=
```

CI workflow env: `PLAUD_MODE=mock`, `LLM_PROVIDER=mock`

---

## Zorunlu Testler

| Test | Kapsam |
|------|--------|
| appointment_proximity | Tüm zaman dilimleri |
| address_match | UK postcode edge cases |
| confidence weighted sum | Golden I/O |
| Extract schema | Zod validation |
| API ingest | Supertest |
| E2E pipeline | mock plaud + mock llm |
| CI | merge blocker, coverage ≥70% |

---

## Definition of Done

- [ ] Live Plaud API ile en az 1 gerçek kayıt ingest (local demo)
- [ ] CI tamamen mock — credential gerektirmez
- [ ] 5 fixture senaryosu testlerde geçiyor
- [ ] Human review zorunlu — auto-apply yok (yüksek confidence bile)
- [ ] Mock CRM proposal apply çalışıyor
- [ ] README + TEST_PLAN + HANDOVER

---

## Yapma

- Topluluk MCP/CLI'yi production path olarak kullanma
- CI'da gerçek Plaud/LLM API çağrısı
- Entity match olmadan extraction
- Testleri ertelemek

---

## Başlangıç Komutu

İlk iş: fixtures/m4 + `MockPlaudAdapter` + matching unit tests + ingest API + CI.
