# M3: Zoom Video Meetings in Lifesycle CRM — Implementation Prompt (Composer)

> **Bağlam kaynağı:** `SHARED_RESEARCH_REPORT_composer.md` + `M2_IMPLEMENTATION_PROMPT_composer.md`  
> **Hedef:** Lifesycle agent journey'sine entegre Zoom meeting flow + timeline  
> **Yazar:** Composer

---

## Bağlam

Lifesycle, Iceberg Digital'in UK estate agent'lara yönelik AI operating system'idir. Mevcut Zoom entegrasyonu yüzeysel (Zapier/listing). Bu mission, agent'ın contact profile'dan meeting başlatıp timeline'a loglamasını sağlar.

**Industry precedent:** HubSpot/Salesforce link-based + sync modeli kullanıyor; full embed nadir. Lifesycle için MVP link+timeline, preferred embed.

---

## Hedef Ürün

**Lifesycle Zoom Meeting Module** — CRM-native communication:

- Contact/Property profile'dan "Start Valuation Call" 
- Meeting link + opsiyonel in-app embed
- Unified timeline event (M4 Plaud ile birleşecek)
- Handover-ready POC

---

## Kapsam

### In Scope
- CRM-style contact profile mock
- Meeting create + timeline log
- OAuth scope matrisi dokümantasyonu
- UX flow (agent journey)
- M2 `zoom-core-api` entegrasyonu
- Minimum + Preferred demo seviyeleri

### Out of Scope
- Production Lifesycle deployment
- Full Uzair AI integration
- Marketplace listing
- Mobile native app

---

## Mimari

### Integration Option Comparison

| Yaklaşım | Time-to-Value | Production Ready | Demo Impact | Skor |
|----------|---------------|------------------|-------------|------|
| A: Link redirect only | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | **MVP** |
| B: REST create + embed (M2 core) | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **Preferred** |
| C: Video SDK custom room | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | Archive |
| D: Deep link to Zoom app | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ | Quick win |

**Önerilen MVP:** A (1 hafta) → B (2-3 hafta) iterasyon

---

## Tech Stack

| Katman | Öneri | Gerekçe |
|--------|-------|---------|
| Frontend | React + Tailwind (Lifesycle UI mock) | Hızlı POC, handover görsel |
| API | Node.js veya Laravel (main team stack'e uy) | M2 core reuse |
| DB | PostgreSQL / SQLite | Timeline persistence |
| Zoom | M2 zoom-core-api | DRY |

---

## Data Model

```typescript
interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_id: string;
}

interface Property {
  id: string;
  address_line_1: string;
  postcode: string;
  contact_id: string;
  valuation_status: 'pending' | 'booked' | 'completed';
}

interface Meeting {
  id: string;
  zoom_meeting_id: string;
  contact_id: string;
  property_id?: string;
  host_user_id: string;
  topic: string;
  join_url: string;
  scheduled_at?: string;
  status: 'scheduled' | 'live' | 'completed';
}

interface TimelineEvent {
  id: string;
  entity_type: 'contact' | 'property';
  entity_id: string;
  source: 'zoom_meeting' | 'zoom_phone' | 'plaud' | 'manual';
  event_type: string;
  title: string;
  summary?: string;
  metadata: Record<string, unknown>;
  occurred_at: string;
}
```

---

## API Spesifikasyonu

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/contacts/:id` | Contact + timeline |
| GET | `/api/properties/:id` | Property + related contact |
| POST | `/api/contacts/:id/meetings` | Meeting oluştur + timeline event |
| GET | `/api/contacts/:id/timeline` | Timeline events (filter by source) |
| POST | `/api/meetings/:id/join-token` | SDK signature (M2 proxy) |
| POST | `/webhooks/zoom` | Post-meeting metadata update |

---

## UI/UX: Agent Journey

**Adım 1:** Contact Profile — "Start Valuation Call" CTA  
**Adım 2:** Meeting Setup Modal — topic, duration  
**Adım 3a (MVP):** Link flow + timeline event  
**Adım 3b (Preferred):** Embed route + Component View  
**Adım 4:** Post-meeting timeline update  
**Adım 5:** M4 hook — "Create Proposal"

---

## OAuth Scope Matrisi

| Scope | Gerekli? | Amaç |
|-------|----------|------|
| meeting:write:meeting | ✅ | Create meeting |
| meeting:read:meeting | ✅ | Get details |
| user:read:user | ✅ | Host validation |
| recording:read | Preferred | Post-meeting transcript |

---

## GitHub Referansları

| Repo | Kullanım |
|------|----------|
| [zoom/meetingsdk-react-sample](https://github.com/zoom/meetingsdk-react-sample) | Embed component |
| [afras23/meeting-notes-crm-sync](https://github.com/afras23/meeting-notes-crm-sync) | Timeline→CRM pattern |
| [Vexa-ai/vexa](https://github.com/Vexa-ai/vexa) | Transcript fallback |
| M2 zoom-core-api | Shared service |

---

## Demo Senaryosu

1. Agent "Sarah" — Contact "John Smith" aç
2. "Start Valuation Call" — meeting oluşur
3. Embed'de görüşme veya link paylaş
4. Timeline'da event görünür
5. M4 preview: "Plaud recording would appear here"

---

## M2/M4 Bağlantısı

- M2: `zoom-core-api` shared service
- M4: Timeline `appointment_id` correlation key

---

## Final Recommendation

**Continue** — MVP link+timeline hemen değer üretir; embed hafta 2'de eklenir.
