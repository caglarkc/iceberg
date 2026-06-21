# M2 — Starter Implementation Prompt

> **Kullanım:** Bu prompt'u yeni bir AI coding agent oturumuna **tek başına** yapıştır. Agent sıfırdan `zoom-integration-core` reposunu implement edecek.

---

## Rolün

Sen Iceberg Digital için **M2 — Zoom Integration Core** (`zoom-integration-core`) servisini sıfırdan yazan senior backend/full-stack geliştiricisin. Demo ürün adı: **Zoom Capability Lab**.

---

## Okuma Sırası (ZORUNLU)

1. `shared/plans/SHARED_PLAN_CONSTRAINTS.md`
2. `missions/m2-zoom-integration-core/plans/DEMO_AND_ROADMAP_PLAN.md`
3. `missions/m2-zoom-integration-core/brief/MISSION_BRIEF.md`

---

## v1.1 Kısıtları (KRİTİK)

| Konu | Karar |
|------|--------|
| Zoom Developer Console | **ERTELENDİ** — şirket test hesabı yok |
| Zoom Phone / Smart Embed | **ERTELENDİ** — yalnızca feasibility doc + mock call event |
| Gerçek Meeting SDK WASM | **ERTELENDİ** — simulated embed UI |
| Ay 1 yaklaşım | `ZOOM_MODE=mock` + `MockZoomAdapter` |
| Mimari | `ZoomProvider` interface — `RealZoomAdapter` Faz 2 için hazır ama implement etme |
| Test | CI merge blocker, mock ile tam suite |

**Gerçek Zoom API çağrısı yapma. Credential bekleme.**

---

## Repo ve Yapı

**Repo adı:** `zoom-integration-core/`

```
zoom-integration-core/
├── src/
│   ├── auth/           # token cache (mock: fixture token)
│   ├── meetings/       # create/read/update
│   ├── sdk/            # signature endpoint (mock: deterministic JWT)
│   ├── webhooks/       # verify + ingest + idempotency
│   ├── phone/          # mock event log + feasibility notes
│   ├── recordings/     # mock transcript fetch
│   ├── crm-adapter/    # TimelineEvent payload generator
│   ├── providers/
│   │   ├── zoom-provider.interface.ts
│   │   ├── mock-zoom.adapter.ts    # Ay 1 birincil
│   │   └── real-zoom.adapter.ts    # stub/TODO Faz 2
│   └── api/            # Express routes + OpenAPI
├── apps/
│   └── demo-web/       # React/Vite — Capability Lab UI
├── docs/
│   └── CAPABILITY_MAP.md
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

- Node.js 20, TypeScript, Express
- PostgreSQL 16 (meetings, webhook_events, phone_events, recordings)
- React + Vite demo frontend
- Vitest + Supertest
- OpenAPI 3 spec export
- Docker Compose

---

## ZoomProvider Interface (Zorunlu)

```typescript
interface ZoomProvider {
  createMeeting(input: CreateMeetingInput): Promise<Meeting>;
  getMeeting(id: string): Promise<Meeting>;
  generateSdkSignature(input: SignatureInput): Promise<SdkSignature>;
  verifyWebhook(headers: Record<string, string>, body: string): boolean;
  parseWebhookEvent(body: unknown): ZoomWebhookEvent;
  // phone: mock only
  listPhoneEvents?(since?: Date): Promise<PhoneEvent[]>;
}
```

Factory: `ZOOM_MODE=mock` → `MockZoomAdapter`, `real` → stub throw "Faz 2".

---

## Implementasyon Sırası

### Faz 0

1. Scaffold + `MockZoomAdapter` fixture'ları (meeting create, signature, webhook payloads)
2. Vitest: adapter unit tests
3. `.env.example` — gerçek Zoom key'leri yorum satırı + `ZOOM_MODE=mock`
4. CI yeşil

### Hafta 1 — Core API

- `POST /api/meetings` — mock create
- `GET /api/meetings/:id`
- `POST /api/meetings/:id/signature` — mock HMAC/JWT (deterministic test vector)
- `POST /api/zoom/webhooks` — signature verify + idempotent store
- DB migrations
- **Test:** her endpoint Supertest

### Hafta 2 — Demo UI + Recordings

- Demo web: meeting create form → mock join URL göster
- "Simulated embed" panel (gerçek WASM yok — açıklayıcı placeholder)
- Mock cloud recording + AI Companion transcript endpoint
- `CAPABILITY_MAP.md` — Meetings ✅ mock, Phone ⏸, Embed ⏸ notları

### Hafta 3 — Phone Feasibility + CRM Adapter

- Phone sekmesi: mock call event log + dokümantasyon
- `crm-adapter`: generic `TimelineEvent` payload üretimi
- Webhook replay CLI veya admin endpoint (demo için)

### Hafta 4 — Polish + Handover

- OpenAPI spec tamamla
- Demo script provası
- README, TEST_PLAN, HANDOVER

---

## MockZoomAdapter Davranışı

- Deterministic meeting ID'ler (test reproducibility)
- Webhook: `meeting.started`, `meeting.ended`, `recording.completed` fixture'ları
- Signature: bilinen test vector ile unit test
- Token cache: mock TTL simülasyonu (ikinci istek "cache hit")

---

## Zorunlu Testler

| Test | Beklenen |
|------|----------|
| Mock token cache | İkinci istek provider'a gitmez |
| Signature format | sdkKey, mn, role, iat, exp alanları |
| Webhook valid signature | 200 + processed |
| Webhook duplicate | idempotent — tek kayıt |
| Create meeting API | 201 + join_url |
| CI | lint + typecheck + test — **blocker** |

```bash
ZOOM_MODE=mock LLM_PROVIDER=mock npm run test -- --coverage
```

---

## Definition of Done

- [ ] `ZOOM_MODE=mock` ile tüm demo akışı credential'sız çalışıyor
- [ ] `ZoomProvider` interface + `MockZoomAdapter` tam; `RealZoomAdapter` stub
- [ ] Capability map dürüstçe "neye hazırız / ne ertelendi" diyor
- [ ] Phone: yalnızca mock + feasibility — gerçek embed yok
- [ ] CI yeşil, coverage ≥70%
- [ ] M3'nin tüketeceği HTTP sözleşmesine uygun endpoint'ler (OpenAPI)

---

## Yapma

- Zoom Marketplace app oluşturma veya gerçek API key bekleme
- `@zoom/meetingsdk` WASM entegrasyonu (Faz 2)
- Zoom Phone Smart Embed iframe (Faz 2)
- ngrok/webhook live setup (Faz 2)
- Testleri atlamak

---

## M3 Entegrasyon Notu

M3 bu servisi harici siyah kutu olarak tüketir. OpenAPI spec'i `docs/openapi.yaml` olarak export et — M3 `contracts/zoom-integration-service.openapi.yaml` ile uyumlu olsun.

---

## Git Workflow (Zorunlu)

Her **Faz 0 / Hafta 1–4** aşaması bittiğinde:

```bash
npm run lint && npm run typecheck && npm run test
git add -A && git commit -m "feat(m2): <aşama özeti>"
git push origin main
```

Testler yeşil değilse commit yok. Her aşama sonunda **commit + push** — unutma.

---

## Başlangıç Komutu

İlk iş: `ZoomProvider` interface + `MockZoomAdapter` + `POST /api/meetings` + ilk Vitest + CI. Faz 0 bitince commit + push.
