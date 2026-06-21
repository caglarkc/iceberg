# M3 — Starter Implementation Prompt

> **Kullanım:** Bu prompt'u yeni bir AI coding agent oturumuna **tek başına** yapıştır. Agent sıfırdan `lifesycle-zoom-crm-poc` reposunu implement edecek.

---

## Rolün

Sen Iceberg Digital için **M3 — Lifesycle Zoom Meeting Flow** POC'sini sıfırdan yazan senior full-stack geliştiricisin. Lifesycle CRM production şeması bilinmiyor — **mock CRM** + harici **Zoom Integration Service** (siyah kutu) ile çalışıyorsun.

---

## Okuma Sırası (ZORUNLU)

1. `shared/plans/SHARED_PLAN_CONSTRAINTS.md`
2. `missions/m3-lifesycle-zoom-meeting-flow/plans/DEMO_AND_ROADMAP_PLAN.md` — özellikle Bölüm 2.2 Zoom API sözleşmesi, Bölüm 9 veri modeli
3. `missions/m3-lifesycle-zoom-meeting-flow/brief/MISSION_BRIEF.md`
3. M2 OpenAPI (varsa) veya plandaki REST örnekleri

---

## v1.1 Kısıtları

| Konu | Karar |
|------|--------|
| Zoom Integration Service | **Mock HTTP client** — `ZOOM_SERVICE_URL` local mock server veya in-process adapter |
| Şirket Zoom hesabı | **Yok** |
| Lifesycle CRM | **Mock CRM** — seed data, SQLite/Postgres |
| Meeting SDK embed | Simulated panel (gerçek WASM yok) |
| Test | CI merge blocker |

M3, Zoom'un içini bilmez — yalnızca HTTP sözleşmesini tüketir.

---

## Repo ve Yapı

**Repo adı:** `lifesycle-zoom-crm-poc/`

```
lifesycle-zoom-crm-poc/
├── apps/
│   └── web/                    # Next.js 15 + API routes (veya ayrı Express)
├── packages/
│   ├── crm-mock/               # seed contacts, properties, timeline
│   └── zoom-client/            # ZoomIntegrationService HTTP client
├── contracts/
│   └── zoom-integration-service.openapi.yaml
├── src/
│   ├── domain/                 # Contact, Property, Meeting, TimelineEvent
│   ├── services/
│   │   ├── meeting.service.ts
│   │   └── timeline.service.ts
│   └── adapters/
│       └── mock-zoom-service.adapter.ts   # Ay 1
├── fixtures/seed/
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

- Next.js 15 + React + Tailwind (CRM-style UI)
- SQLite (dev) veya PostgreSQL
- TypeScript, Zod
- Vitest + Supertest
- Mock Zoom Service (in-repo mini server veya adapter)

---

## Mock CRM Ekranları (Minimum)

1. Contact list (5 seed)
2. Contact detail + ilişkili properties
3. Property / Valuation detail
4. Timeline panel (kronolojik feed)
5. "Schedule Zoom Meeting" / "Start Instant Meeting" butonları
6. Meeting card (aktif/geçmiş)
7. Settings: `ZOOM_SERVICE_URL`, service token

**Seed senaryo:**
- Contact: Sarah Mitchell
- Property: 14 Oak Lane, SW19 — valuation 2026-06-25 10:00
- Agent: demo_agent@lifesycle.mock

---

## Zoom Integration Service Client

Plandaki sözleşmeyi implement et (tüketici tarafı):

| Endpoint | Amaç |
|----------|------|
| `POST /meetings` | Scheduled meeting |
| `POST /meetings/instant` | Instant meeting |
| `GET /meetings/:id` | Detail |
| `POST /meetings/:id/embed-signature` | Mock SDK signature |
| `POST /webhooks/replay` (opsiyonel) | Demo webhook simülasyonu |

**Ay 1:** `MockZoomServiceAdapter` — M2 sözleşmesiyle uyumlu fixture cevapları. Env: `ZOOM_MODE=mock`.

---

## Veri Modeli (Özet)

- `contacts`, `properties`, `valuation_appointments`
- `meetings` — zoom_service_meeting_id, tracking JSON (contact/property/valuation ids)
- `timeline_events` — type: `meeting_scheduled`, `meeting_started`, `meeting_ended`, `recording_ready`
- `meeting_tracking` — CRM ↔ Zoom köprüsü

---

## Implementasyon Sırası

### Faz 0 (2–3 gün)

1. Next.js scaffold + mock CRM seed
2. `MockZoomServiceAdapter` + contract tests
3. OpenAPI yaml (`contracts/`)
4. CI yeşil

### Hafta 1 — MVP Akış

- Contact detail → "Schedule Meeting" → mock Zoom service → meeting DB kaydı
- Timeline'a `meeting_scheduled` event
- **Test:** create meeting integration

### Hafta 2 — Embed + Webhook

- Instant meeting akışı
- Simulated embed panel (signature endpoint mock)
- Webhook handler: meeting.started/ended → timeline update
- **Test:** webhook → timeline contract

### Hafta 3 — Polish

- Slide-over meeting panel UX
- Error states, loading
- Valuation appointment context (topic auto-generate)

### Hafta 4 — Demo + Handover

- 5 dk demo script provası
- Entegrasyon karşılaştırma doc (Meeting API vs SDK — plandaki tablo)
- README, TEST_PLAN, HANDOVER

---

## Demo Akışı (5–10 dk)

1. Agent login → Contact list
2. Sarah Mitchell → Property 14 Oak Lane
3. "Schedule Valuation Call" → form → create
4. Timeline'da yeni event
5. "Join Meeting" → simulated embed
6. Webhook replay → meeting ended → timeline güncellenir

---

## Zorunlu Testler

| Seviye | Kapsam |
|--------|--------|
| Unit | Topic generator, event mapper, tracking encryption (varsa) |
| Contract | Mock Zoom service request/response şekli |
| Integration | create → timeline → webhook |
| CI | merge blocker |

```bash
ZOOM_MODE=mock npm run lint && npm run typecheck && npm run test
```

---

## Definition of Done

- [ ] Mock CRM'de contact → meeting → timeline uçtan uca
- [ ] Zoom servisi siyah kutu — iç implementasyon yok
- [ ] `contracts/zoom-integration-service.openapi.yaml` mevcut
- [ ] Simulated embed (gerçek WASM yok)
- [ ] CI yeşil
- [ ] Demo submit checklist (plandaki Bölüm 4) tamam

---

## Yapma

- Gerçek Lifesycle API'ye bağlanma (Faz 2)
- Zoom OAuth/token refresh M3 içinde (M2'nin işi)
- Gerçek Meeting SDK WASM
- Testleri ertelemek

---

## Git Workflow (Zorunlu)

Her **Faz 0 / Hafta 1–4** aşaması bittiğinde:

```bash
ZOOM_MODE=mock npm run lint && npm run typecheck && npm run test
git add -A && git commit -m "feat(m3): <aşama özeti>"
git push origin main
```

Testler yeşil değilse commit yok. Her aşama sonunda **commit + push** — unutma.

---

## Başlangıç Komutu

İlk iş: Next.js + seed CRM + `MockZoomServiceAdapter` + `POST meetings` client + timeline event on create + ilk integration test. Faz 0 bitince commit + push.
