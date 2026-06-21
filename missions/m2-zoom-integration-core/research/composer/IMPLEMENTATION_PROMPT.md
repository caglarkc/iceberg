# M2: Zoom SDK & Phone Integration — Implementation Prompt (Composer)

> **Bağlam kaynağı:** `SHARED_RESEARCH_REPORT_composer.md` (2026-06-20)  
> **Hedef:** Platform-agnostic Zoom entegrasyon katmanı + etkileyici demo  
> **Yazar:** Composer

---

## Bağlam

Iceberg Digital resmi Zoom Partner. Bu mission, Zoom Meeting SDK, REST API ve Phone API yeteneklerini haritalayıp çalışan bir POC üretir. Çıktı M3 (Lifesycle CRM) için `zoom-integration-core` servisini besler.

**Kritik bulgular (tekrar araştırma gerekmez):**
- Meeting SDK: Pro+ dahil, Zoom-native UI embed
- Video SDK: Credit-based, custom UI — CRM için overkill
- Signature: Server-side JWT, asla client'ta secret yok
- S2S OAuth: `meeting:write:meeting` scope, `/users/{userId}` (me değil)
- Phone: Click-to-call URI + webhook; desktop client bağımlılığı var
- Transcript: Cloud recording + VTT veya RTMS (Developer Pack)

---

## Hedef Ürün

**`zoom-integration-core`** — Iceberg ürünlerine (Lifesycle, Iceberg X demo) sunulabilecek modüler Zoom servisi:

1. Backend auth/signature/token servisi
2. React embed component (Meeting SDK Component View)
3. Phone event listener (webhook receiver)
4. Capability map dokümantasyonu (15+ özellik, etiketli)

---

## Kapsam

### In Scope
- Meeting SDK web embed POC (start/join)
- REST API ile meeting create
- S2S OAuth + signature endpoint
- Zoom Phone webhook listener POC
- Product capability map (Possible Now / Needs License / Not Possible / Escalate)
- Demo uygulama (backend + frontend)

### Out of Scope
- Video SDK custom room
- Marketplace app submission
- Production ISV custCreate (araştırma + escalate listesi yeterli)
- Full Phone headless automation

---

## Mimari

```
┌─────────────────┐     POST /api/zoom/signature     ┌──────────────────┐
│  React Demo UI  │ ──────────────────────────────▶│  zoom-core-api   │
│  (Component View)│     POST /api/zoom/meetings    │  (Node/Laravel)  │
└────────┬────────┘     GET  /api/zoom/meetings/:id └────────┬─────────┘
         │ join(signature)                                      │
         ▼                                                      ▼
┌─────────────────┐                                  ┌──────────────────┐
│  @zoom/meetingsdk│                                  │  Zoom REST API   │
│  /embedded       │                                  │  S2S OAuth       │
└─────────────────┘                                  └──────────────────┘

┌─────────────────┐     POST /webhooks/zoom-phone    ┌──────────────────┐
│  Zoom Phone     │ ──────────────────────────────▶│  webhook-handler │
│  (call events)  │                                  │  (call_element)  │
└─────────────────┘                                  └──────────────────┘
```

### Meeting SDK vs Video SDK Karar Ağacı

```
CRM'den meeting başlat/join?
├─ Evet, Zoom UI kabul edilebilir → Meeting SDK Component View ✅
├─ Evet, tam custom UI gerekli → Video SDK (maliyetli) ⚠️
└─ Sadece link + timeline yeterli → REST API only ✅ (M3 MVP)
```

---

## Tech Stack

| Katman | Öneri | Gerekçe |
|--------|-------|---------|
| Backend | Node.js + Express (veya Iceberg stack) | `meetingsdk-auth-endpoint-sample` uyumu |
| Frontend | React + Vite + TypeScript | Zoom resmi sample uyumu |
| SDK | `@zoom/meetingsdk` Component View | CRM embed için ideal |
| Auth | S2S OAuth + env-based secrets | Zoom best practice |
| Deploy | Docker Compose | Demo + handover kolaylığı |

---

## Data Model

```typescript
interface ZoomMeeting {
  id: string;
  zoom_meeting_id: string;
  host_user_id: string;
  topic: string;
  start_time?: string;
  duration?: number;
  join_url: string;
  password?: string;
  status: 'scheduled' | 'started' | 'ended';
  created_at: string;
}

interface ZoomPhoneCallEvent {
  id: string;
  call_element_id: string;
  direction: 'inbound' | 'outbound';
  caller_number?: string;
  callee_number?: string;
  duration_seconds?: number;
  result: 'completed' | 'missed' | 'voicemail';
  raw_payload: object;
  received_at: string;
}
```

---

## API Spesifikasyonu

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/zoom/signature` | Meeting SDK JWT üret (body: meetingNumber, role) |
| POST | `/api/zoom/meetings` | Zoom REST ile meeting oluştur |
| GET | `/api/zoom/meetings/:id` | Meeting detay + join_url |
| POST | `/webhooks/zoom` | Zoom event webhook (recording.completed vb.) |
| POST | `/webhooks/zoom-phone` | Phone call_element events |
| GET | `/api/zoom/capabilities` | Capability map JSON |

---

## UI/UX Spesifikasyonu

### Demo Ekranları

1. **Dashboard** — "Start Meeting" / "Join Meeting" butonları, son meeting listesi
2. **Meeting Room** — Dedicated route `/meeting/:id` — iframe veya Component View container
3. **Phone Events** — Webhook'tan gelen call log tablosu (real-time veya polling)
4. **Capability Explorer** — 15+ özellik kartı, durum etiketi ile

### CSS İzolasyon
- Meeting embed: `/meeting` dedicated route veya iframe
- `allow="camera; microphone; display-capture"` iframe attribute'ları

---

## GitHub'dan Kullanılacak Referanslar

| Repo | Nasıl Kullanılır |
|------|------------------|
| [zoom/meetingsdk-react-sample](https://github.com/zoom/meetingsdk-react-sample) | Frontend scaffold — fork'la, auth endpoint'i bağla |
| [zoom/meetingsdk-auth-endpoint-sample](https://github.com/zoom/meetingsdk-auth-endpoint-sample) | Signature endpoint — direkt adapte et |
| [zoom/skills](https://github.com/zoom/skills) | AI agent'lara Zoom docs context — M5 entegrasyonu |
| [zoom/meetingsdk-web](https://github.com/zoom/meetingsdk-web) | SDK version tracking |
| [zoom/meetingsdk-sample-signature-node.js](https://github.com/zoom/meetingsdk-sample-signature-node.js) | Alternatif signature impl |

---

## Uygulama Adımları

- [ ] Zoom Marketplace'te Meeting SDK app oluştur (Client ID/Secret)
- [ ] S2S OAuth app oluştur, `meeting:write:meeting` scope ekle
- [ ] `zoom-core-api` repo scaffold (Express + TypeScript)
- [ ] Signature endpoint implement et ve test et
- [ ] Meeting create endpoint (POST /users/{hostId}/meetings)
- [ ] React demo app — meetingsdk-react-sample'dan fork
- [ ] Component View embed — dedicated `/meeting` route
- [ ] Start meeting flow: create → signature → join (role=1, ZAK gerekirse)
- [ ] Join meeting flow: signature → join (role=0)
- [ ] Phone webhook endpoint — `phone.callee_call_element_completed` subscribe
- [ ] Capability map JSON oluştur (15+ özellik)
- [ ] Docker Compose + README + .env.example
- [ ] Demo video kaydı

---

## Test Planı

| Test | Beklenen |
|------|----------|
| Signature endpoint | Valid JWT, 2 saat expiry |
| Meeting create | join_url döner |
| Component View join | Audio/video çalışır |
| Invalid meeting number | Anlamlı hata |
| Phone webhook | Event DB'ye yazılır |
| Secret exposure scan | Client bundle'da secret yok |

---

## Demo Senaryosu

1. Demo dashboard aç — "Valuation Call with Mr. Smith" topic
2. "Start Meeting" tıkla — backend meeting oluşturur
3. Component View'da meeting açılır — kamera/mikrofon test
4. İkinci browser'da "Join as Guest" — participant join
5. Meeting bitir — webhook log'unda event görüntüle
6. (Opsiyonel) Phone tab'da son call webhook event'i göster
7. Capability Explorer'da "CRM Timeline Sync" → "Possible Now via M3" göster

---

## Handover Checklist

- [ ] README: setup, env vars, Zoom app config screenshots
- [ ] ARCHITECTURE.md: auth flow diagram
- [ ] CAPABILITY_MAP.md: 15+ özellik, etiketli
- [ ] ESCALATE_LIST.md: Partner'a sorulacak sorular
- [ ] Known issues: CSS conflicts, mobile limitations
- [ ] M3 integration guide: hangi endpoint'ler paylaşılır

---

## Diğer Mission'lara Bağlantı

| Mission | Bağlantı |
|---------|----------|
| M3 | `zoom-core-api` servisini Lifesycle'a bağla; timeline event emit |
| M4 | Meeting metadata → Plaud correlation timestamp |
| M5 | `zoom/skills` MCP server; boilerplate generation |

---

## Kırmızı Çizgiler

- Client Secret asla frontend'e gitmez
- JWT app type kullanılmaz (deprecated) — S2S OAuth
- Phone legacy webhook'lar kullanılmaz — call_element v3
- Production'a geçmeden Marketplace security review planlanmalı
- ISV custCreate için Zoom Partner support onayı gerekli

---

## Zoom Partner Escalation Listesi

1. ISV Agreement kapsamında custCreate API erişimi var mı?
2. Managed user model — agent'ların ayrı Zoom hesabı gerekli mi?
3. RTMS (Realtime Media Streams) Developer Pack erişimi?
4. Rate limit artırımı (Business+ partner account)?
5. UK GDPR için recording/transcript data residency?

---

## Final Recommendation

**İlk adım:** REST API + Meeting SDK Component View POC.  
**Phone:** Webhook feasibility POC, full automation değil.  
**Uzun vade:** `zoom-integration-core` microservice olarak M3'e handover.
