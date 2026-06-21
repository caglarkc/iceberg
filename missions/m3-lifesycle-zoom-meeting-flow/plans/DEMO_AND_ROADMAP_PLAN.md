# M3 — Lifesycle Zoom Meeting Flow: Demo ve Yol Haritası Planı

> **Kapsam:** Bu doküman yalnızca **Misyon 3 (M3)** için hazırlanmıştır. Zoom entegrasyonu, iç implementasyonu planlanmayan harici bir **"Zoom Integration Service"** (siyah kutu API) olarak kabul edilir. Lifesycle CRM'in production şeması bilinmediği için Faz 0–1 mock-first; Faz 2–3 gerçek adapter ve Communication Hub hedeflerini tanımlar.

**Versiyon:** 1.1  
**Tarih:** 21 Haziran 2026  
**Plan v1.1:** Zoom Integration Service **mock** (`ZOOM_SERVICE_URL` + `ZOOM_MODE=mock`). Şirket Zoom hesabı yok. **Testler CI blocker.** → `shared/plans/SHARED_PLAN_CONSTRAINTS.md`  
**Workspace:** `/Users/caglarkc/Desktop/GitHub/iceberg`

---

## 1. Misyon Özeti ve Demo Submit Hedefi (Lifesycle CRM Zoom Flow)

### 1.1 Misyon Tanımı

Lifesycle CRM kullanan emlak acentelerinin (estate agents) **harici araçlara geçmeden** Zoom görüntülü görüşme başlatmasını, planlamasını ve görüşme bilgisinin ilgili CRM kaydına (contact, lead, property, valuation appointment) bağlanmasını araştırmak; teknik seçenekleri karşılaştırmak; çalışan bir POC ve net bir öneri sunmaktır.

Bu misyon **production-ready özellik değil**; ana geliştirme ekibinin karar vermesini kolaylaştıracak **teknik netlik + demo** üretir.

### 1.2 Temel Problem

Acenteler mülk değerleme (Market Appraisal), sanal viewing veya lead görüşmelerini Zoom'da yaparken Lifesycle ile Zoom arasında **bağlam kopması** yaşar: toplantı linki e-posta/WhatsApp'ta kaybolur, timeline'a elle girilir, görüşme sonrası follow-up gecikir.

### 1.3 Hedef Ürün (North Star)

```
Agent → Contact/Property açar
     → "Schedule / Start Zoom Meeting"
     → Meeting CRM kaydına + timeline'a yazılır
     → Agent join eder (redirect veya embed)
     → Toplantı bitince metadata (ve opsiyonel transcript) timeline'da görünür
     → Opsiyonel follow-up task taslağı oluşur
```

### 1.4 Demo Submit Hedefi (Resmi Brief Uyumu)

Iceberg X demo submit paketi şu sorulara **kanıtlı** cevap vermelidir:

| Soru | Demo Submit'te Kanıt |
|------|----------------------|
| Zoom meeting Lifesycle'dan oluşturulabilir mi? | Mock CRM'den gerçek veya sandbox meeting create |
| Hangi auth modeli gerekir? | Araştırma dokümanı + harici servis env örneği |
| Embed mümkün mü? | Hafta 2 slide-over embed POC |
| Meeting CRM kaydına bağlanabilir mi? | Timeline event + meeting card |
| Post-meeting metadata alınabilir mi? | Webhook simülasyonu → timeline güncelleme |
| En basit MVP nedir? | Hafta 1: link + timeline (redirect join) |
| Devam / arşiv önerisi? | Recommendation bölümü handover'da |

### 1.5 Başarı Kriterleri (Ölçülebilir)

| Kriter | Hedef |
|--------|-------|
| Meeting create → timeline latency | < 3 sn (mock CRM + harici API) |
| Demo akışı kesintisiz | Contact aç → schedule → timeline → join (< 90 sn canlı demo) |
| Handover paketi | README, env, API notları, bilinen sorunlar, next steps |
| Teknik öneri | Redirect vs REST vs embed kararı gerekçeli |
| Lifesycle uyumu | Valuation workflow'a oturan UX (property + contact bağlamı) |

### 1.6 Kapsam Dışı (M3 Demo Submit)

- Production Lifesycle Laravel modülü deploy
- Zoom Phone entegrasyonu
- Video SDK ile custom video room
- Plaud / transcript intelligence pipeline (ayrı misyon)
- GDPR/legal final onay (risk olarak dokümante, implementasyon değil)
- Zoom Integration Service'in iç mimarisi (siyah kutu)

---

## 2. Faz 0 — Mock CRM Setup, Zoom API Assumptions, Domain Model

**Süre:** Demo öncesi 2–3 gün (Hafta 1'in ilk yarısı)  
**Amaç:** Lifesycle bilinmediği için izole, tekrarlanabilir mock ortam; harici Zoom servisine karşı net sözleşme.

### 2.1 Mock CRM Uygulaması

**Teknoloji önerisi (POC):**

| Katman | Seçim | Gerekçe |
|--------|-------|---------|
| Frontend | Next.js 15 + React + Tailwind | Hızlı CRM-style UI, slide-over panel |
| Backend | Next.js API Routes veya Node/Express | Tek repo, handover kolay |
| DB | SQLite (dev) / Postgres (opsiyonel) | Migration + seed script |
| Auth | Basit session veya mock agent login | Demo için yeterli |

**Mock CRM ekranları (minimum):**

1. **Contact list** — 5 seed contact
2. **Contact detail** — iletişim bilgisi, ilişkili property'ler
3. **Property / Valuation detail** — adres, valuation appointment tarihi
4. **Timeline panel** — kronolojik activity feed (sağ veya alt panel)
5. **Meeting card** — aktif/geçmiş meeting özeti
6. **Settings** — Zoom servis base URL + API key (demo env)

**Seed veri senaryosu (valuation odaklı):**

```
Contact: Sarah Mitchell — seller lead
Property: 14 Oak Lane, SW19 — Market Appraisal scheduled 2026-06-25 10:00
Appointment: valuation_id = val_001
Agent: demo_agent@lifesycle.mock
```

### 2.2 Zoom Integration Service — Varsayılan Harici API (Siyah Kutu)

M3, aşağıdaki REST sözleşmesini **tüketir**. Servisin içinde OAuth token refresh, Zoom REST çağrıları, SDK signature üretimi **bu misyonun dışındadır**.

**Base URL:** `https://zoom-integration.internal/api/v1` (env: `ZOOM_SERVICE_URL`)

#### 2.2.1 Meeting Oluşturma

```http
POST /meetings
Authorization: Bearer {CRM_SERVICE_TOKEN}
Content-Type: application/json

{
  "topic": "Valuation call — 14 Oak Lane, SW19",
  "type": 2,
  "start_time": "2026-06-25T09:00:00Z",
  "duration": 60,
  "timezone": "Europe/London",
  "agenda": "Market appraisal discussion",
  "settings": {
    "host_video": true,
    "participant_video": true,
    "join_before_host": false,
    "waiting_room": true,
    "auto_recording": "cloud"
  },
  "tracking": {
    "crm_contact_id": "cnt_abc123",
    "crm_property_id": "prop_xyz789",
    "crm_valuation_id": "val_001",
    "crm_agent_id": "agent_42"
  }
}
```

**Response 201:**

```json
{
  "id": "zm_meet_7f3a",
  "zoom_meeting_id": "87654321098",
  "topic": "Valuation call — 14 Oak Lane, SW19",
  "start_time": "2026-06-25T09:00:00Z",
  "duration": 60,
  "timezone": "Europe/London",
  "join_url": "https://zoom.us/j/87654321098?pwd=...",
  "start_url": "https://zoom.us/s/87654321098?zak=...",
  "password": "abc123",
  "status": "scheduled",
  "created_at": "2026-06-21T14:00:00Z"
}
```

> **Güvenlik notu:** `start_url` yalnızca host için; mock CRM'de şifreli saklanır, UI'da gösterilmez. Join için `join_url` kullanılır.

#### 2.2.2 Anlık Toplantı Başlatma (Instant)

```http
POST /meetings/instant
Authorization: Bearer {CRM_SERVICE_TOKEN}

{
  "topic": "Quick call — Sarah Mitchell",
  "tracking": { "crm_contact_id": "cnt_abc123", ... }
}
```

**Response:** Aynı meeting şeması, `status: "started"`, `start_time` ≈ now.

#### 2.2.3 Meeting Detayı

```http
GET /meetings/{zoom_service_meeting_id}
Authorization: Bearer {CRM_SERVICE_TOKEN}
```

**Response:** Meeting + `participants_count`, `actual_start`, `actual_end`, `recording_status`.

#### 2.2.4 Embed Signature (Meeting SDK for Web)

```http
POST /meetings/{zoom_service_meeting_id}/embed-signature
Authorization: Bearer {CRM_SERVICE_TOKEN}

{
  "role": 0,
  "user_name": "Demo Agent",
  "user_email": "demo_agent@lifesycle.mock"
}
```

**Response 200:**

```json
{
  "signature": "eyJ...",
  "sdk_key": "abcSDKKey",
  "meeting_number": "87654321098",
  "password": "abc123",
  "zak": null,
  "expires_at": "2026-06-25T09:05:00Z"
}
```

`role`: `1` = host, `0` = participant.

#### 2.2.5 Webhook Ingest (Harici Servis → CRM Mock)

Harici servis Zoom webhook'larını işler; CRM mock'a normalize event POST eder:

```http
POST /webhooks/zoom-events   (CRM mock endpoint)
X-Webhook-Secret: {SECRET}

{
  "event": "meeting.ended",
  "zoom_meeting_id": "87654321098",
  "payload": {
    "duration_minutes": 47,
    "participant_count": 2,
    "recording_files": [
      { "type": "audio_transcript", "status": "processing", "download_url": null }
    ]
  },
  "tracking": { "crm_contact_id": "cnt_abc123", "crm_valuation_id": "val_001" }
}
```

#### 2.2.6 Health / Capability Discovery

```http
GET /capabilities
```

```json
{
  "create_meeting": true,
  "instant_meeting": true,
  "embed_sdk": true,
  "cloud_recording": true,
  "transcript_webhook": "beta",
  "phone": false
}
```

### 2.3 Mock CRM ↔ Harici Servis Adapter Katmanı

```
┌─────────────────────┐     ┌──────────────────────────┐     ┌─────────────────┐
│  Mock CRM UI        │────▶│  CRM Backend (M3)        │────▶│ Zoom Integration│
│  Contact/Property   │     │  /api/contacts/:id/      │     │ Service (black  │
│  Timeline           │◀────│  meetings, timeline      │◀────│ box)            │
└─────────────────────┘     └──────────────────────────┘     └─────────────────┘
                                      │
                                      ▼
                            ┌──────────────────┐
                            │ SQLite / Postgres │
                            │ contacts, meetings│
                            │ timeline_events   │
                            └──────────────────┘
```

**Adapter sorumluluğu (M3):**

- CRM domain ID'lerini `tracking` payload'ına map etmek
- `start_url` encrypt-at-rest (AES-256-GCM veya libsodium)
- Harici servis hatalarını kullanıcı dostu mesaja çevirmek
- Her başarılı create sonrası `TimelineEvent` yazmak

### 2.4 Domain Model (Faz 0 Taslak)

Detaylı şema Bölüm 9'da; Faz 0'da migration ile oluşturulacak minimum tablolar:

- `contacts`
- `properties`
- `appointments` (valuation)
- `meetings`
- `timeline_events`
- `follow_up_tasks` (opsiyonel, hafta 3)

### 2.5 Faz 0 Çıktıları (Definition of Done)

- [ ] Repo: `lifesycle-zoom-crm-poc/` (veya monorepo alt paket)
- [ ] `docker compose up` veya `npm run dev` ile mock CRM ayağa kalkar
- [ ] Seed data yüklenir
- [ ] Harici servise karşı contract test (mock server veya gerçek sandbox)
- [ ] `.env.example` tüm değişkenlerle
- [ ] Mimari diyagram (bu dokümandaki genişletilmiş hali README'de)

### 2.6 Ortam Değişkenleri (Mock CRM)

```bash
# Mock CRM
DATABASE_URL=sqlite://./dev.db
CRM_SERVICE_TOKEN=local-dev-token
ENCRYPTION_KEY=32-byte-hex-key

# Harici Zoom Integration Service (siyah kutu)
ZOOM_SERVICE_URL=https://zoom-integration.internal/api/v1
ZOOM_SERVICE_API_KEY=...

# Webhook
ZOOM_WEBHOOK_SECRET=whsec_...

# Feature flags
FEATURE_EMBED_SDK=true
FEATURE_FOLLOW_UP_TASKS=false
```

### 2.8 Git ve Push Disiplini (Zorunlu)

Her faz/hafta milestone'ı sonunda: testler yeşil → `git commit` → `git push origin main`. Aşamalar arasında birikmiş commit'siz kod bırakma. Detay: `shared/plans/SHARED_PLAN_CONSTRAINTS.md` §2.6

---

## 3. Faz 1 — 1 Ay: Hafta 1 MVP, Hafta 2 Embed, Hafta 3 Polish + Handover

**Toplam süre:** 4 hafta (demo submit deadline'a göre ilk 3 hafta kritik, 4. hafta buffer)

### 3.1 Hafta 1 — MVP: Link + Timeline (Redirect Join)

**Hedef:** Resmi brief'in "minimum acceptable demo" seviyesini aşan, gerçek meeting create + timeline entegrasyonu.

#### Gün 1–2: Temel CRUD + UI iskelet

| Görev | Detay |
|-------|-------|
| Contact/Property sayfaları | Liste + detay routing |
| Timeline bileşeni | Event type icon, timestamp, expandable detail |
| API: `GET /api/contacts/:id` | Contact + properties + timeline |

#### Gün 3–4: Meeting create akışı

| Görev | Detay |
|-------|-------|
| `POST /api/contacts/:id/meetings` | Schedule meeting form → harici `POST /meetings` |
| `POST /api/contacts/:id/meetings/instant` | "Start Now" butonu |
| Topic auto-generate | `Valuation call — {property.address}` veya `Call with {contact.name}` |
| Meeting card UI | Topic, time, join link, copy button, status badge |
| Timeline write | `meeting.scheduled` veya `meeting.started` event |

#### Gün 5: Join (redirect) + hata yönetimi

| Görev | Detay |
|-------|-------|
| "Join Meeting" | `window.open(join_url)` — yeni sekme |
| Loading / error states | Zoom servis down, 429, invalid scope simülasyonu |
| Meeting listesi | Contact timeline'da geçmiş meetings |

**Hafta 1 Demo Checkpoint:**

> Agent property valuation sayfasını açar → "Schedule Zoom Meeting" → tarih/saat seçer → meeting card + timeline event görünür → "Join" tıklar → Zoom yeni sekmede açılır.

### 3.2 Hafta 2 — Meeting SDK Embed (Slide-over)

**Hedef:** "Preferred demo" — embed deneyimi; wow factor.

#### Gün 1–2: Embed altyapısı

| Görev | Detay |
|-------|-------|
| Slide-over panel | Sağdan açılan 480px+ panel, CRM sayfası arkada kalır |
| `POST /api/meetings/:id/embed-signature` | Harici servis proxy |
| Meeting SDK for Web | Component View veya Client View (tarayıcı uyumluluk tablosu README'de) |
| Fallback | Embed fail → redirect join butonu göster |

#### Gün 3–4: Host vs participant UX

| Görev | Detay |
|-------|-------|
| Host flow | Agent = host → `role: 1` signature |
| Pre-join | Kamera/mik test (SDK default) |
| Leave meeting | Panel kapanır, timeline'a `meeting.joined` / `meeting.left` (client-side) |

#### Gün 5: Webhook simülasyonu

| Görev | Detay |
|-------|-------|
| `POST /api/webhooks/zoom` | meeting.ended mock payload |
| Timeline güncelleme | duration, participant count |
| Transcript pending state | `recording.processing` badge |

**Hafta 2 Demo Checkpoint:**

> Aynı schedule akışı → "Join in Lifesycle" → slide-over'da Zoom → meeting bitince (veya simüle) timeline'da süre görünür.

### 3.3 Hafta 3 — Polish, Araştırma Dokümanı, Handover

#### Gün 1–2: UX polish + edge cases

| Görev | Detay |
|-------|-------|
| Empty states | Henüz meeting yok |
| Duplicate schedule guard | Aynı appointment için 2 aktif meeting uyarısı |
| Mobile responsive | Timeline okunabilir (embed mobilde redirect fallback) |
| Accessibility | Buton labels, keyboard focus trap slide-over'da |

#### Gün 3: Follow-up task taslağı (opsiyonel P1)

| Görev | Detay |
|-------|-------|
| Post-meeting card | "Create follow-up" → draft task |
| `follow_up_tasks` tablosu | title, due_date, status=draft |
| Timeline link | `follow_up.created` event |

#### Gün 4: Teknik araştırma dokümanı

`docs/ZOOM_CRM_RESEARCH.md` — Bölüm 8 karar matrisi özeti, OAuth scope tablosu, licensing notları, browser limits, GDPR checklist (yüksek seviye).

#### Gün 5: Handover paketi

`HANDOVER.md` + `README.md` + `TEST_PLAN.md` + demo video/GIF + screenshots.

### 3.4 Hafta 4 — Buffer, Demo Prova, Reflection

| Görev | Detay |
|-------|-------|
| Demo script provası | 3× tam akış, timing |
| Bilinen sorunlar listesi | ISSUES.md |
| Demo Day reflection taslağı | Bölüm 4 checklist |
| Stakeholder review | Lifesycle main team feedback toplama |

### 3.5 Faz 1 Milestone Özeti

| Hafta | Milestone | Kullanıcı Görünürlüğü |
|-------|-----------|----------------------|
| 1 | Link + timeline MVP | Schedule, join redirect, timeline event |
| 2 | Embed slide-over | In-app Zoom, webhook simülasyonu |
| 3 | Polish + docs + handover | Follow-up draft, research doc |
| 4 | Demo-ready | Prova + reflection |

---

## 4. Demo Submit Checklist (Resmi Brief Deliverables)

### 4.1 Teknik Araştırma Dokümanı

**Dosya:** `docs/ZOOM_CRM_RESEARCH.md`

| Bölüm | İçerik | Durum |
|-------|--------|-------|
| İncelenen Zoom ürünleri | Meeting API, Meeting SDK Web, Video SDK karşılaştırması | ☐ |
| Auth gereksinimleri | OAuth vs S2S — harici servis varsayımı | ☐ |
| OAuth scope matrisi | Bölüm 11 tablosu | ☐ |
| Meeting create via API | Evet + örnek payload | ☐ |
| Embed feasibility | SDK + browser matrix | ☐ |
| CRM kaydına bağlama | tracking + timeline modeli | ☐ |
| Post-meeting metadata | Webhook events, recording/transcript limits | ☐ |
| Limitasyonlar | Lisans, rate limit, waiting room, GDPR | ☐ |
| Önerilen yön | Redirect MVP → embed → production adapter | ☐ |

### 4.2 Çalışan POC / Demo

| Minimum (brief) | Planlanan | ☐ |
|-----------------|-----------|---|
| Create/Start butonu | Schedule + Start Now | ☐ |
| Backend create flow | Harici servis entegrasyonu | ☐ |
| Meeting detayları | topic, time, join URL, meeting ID | ☐ |
| Timeline attachment | TimelineEvent | ☐ |
| Meeting history | Geçmiş meeting listesi | ☐ |
| **Preferred:** gerçek Zoom sandbox | Hafta 1 sonu | ☐ |
| **Preferred:** CRM contact profile | Mock Lifesycle UI | ☐ |
| **Preferred:** embed test | Hafta 2 | ☐ |

### 4.3 UX Flow

**Dosya:** `docs/UX_FLOW.md` + wireframe görselleri (`docs/wireframes/`)

| Akış | Dokümante | ☐ |
|------|-----------|---|
| Contact aç → schedule | Evet | ☐ |
| Meeting oluştur/store | Evet | ☐ |
| Share / join | Redirect + embed dallanması | ☐ |
| Timeline activity | Evet | ☐ |
| Opsiyonel follow-up | Hafta 3 | ☐ |

### 4.4 Öneri (Recommendation)

**Dosya:** `docs/RECOMMENDATION.md`

| Soru | Cevap formatı |
|------|---------------|
| Devam edilmeli mi? | Evet / Koşullu / Hayır + gerekçe |
| En basit MVP? | Link + timeline + harici servis |
| Main team next steps? | Adapter spec, API erişimi, lisans |
| Ne inşa edilmemeli? | Video SDK custom room, production merge |
| Daha fazla araştırma? | Lifesycle schema, GDPR, transcript |

### 4.5 Handover Paketi

**Dosya:** `HANDOVER.md` (master index)

| Öğe | Dosya | ☐ |
|-----|-------|---|
| README | Kurulum, mimari | ☐ |
| Setup instructions | Adım adım | ☐ |
| Env examples | `.env.example` | ☐ |
| API notes | Bölüm 10 + harici servis sözleşmesi | ☐ |
| Demo link / screenshots | `docs/demo/` | ☐ |
| Repo / branch link | GitHub URL | ☐ |
| Known issues | `ISSUES.md` | ☐ |
| Next-step recommendation | `docs/RECOMMENDATION.md` | ☐ |

### 4.6 Demo Day Reflection

**Dosya:** `docs/DEMO_DAY_REFLECTION.md`

Brief gereği: **mazeret yok** — planlama, test, iletişim, kapsam, dokümantasyon, execution iyileştirmeleri.

Şablon sorular:

1. Hangi kullanıcı akışını daha erken dondurmalıydık?
2. Hangi entegrasyon testi demo gününden önce otomatikleştirilmeliydi?
3. Mock CRM ile gerçek Lifesycle farkını stakeholder'a nasıl daha net anlatırdık?
4. Embed fallback senaryosu yeterince prova edildi mi?
5. Handover paketinde eksik kalan tek şey neydi?

---

## 5. Demo Day Senaryosu (Agent Opens Contact → Meeting → Timeline)

### 5.1 Senaryo: Market Appraisal Zoom Call

**Süre:** 60–90 saniye canlı demo + 2 dk yedek slayt  
**Karakter:** Emma, senior estate agent @ Lifesycle Mock  
**Kayıt:** Sarah Mitchell — 14 Oak Lane satıcı lead

### 5.2 Adım Adım Script

| # | Aksiyon | Ekranda Görünen | Süre |
|---|---------|-----------------|------|
| 1 | Login → Contacts | Contact listesi, Sarah Mitchell satırı | 5s |
| 2 | Sarah Mitchell'e tıkla | Contact profili, ilişkili property "14 Oak Lane" | 8s |
| 3 | Property / Valuation kartına git | Appointment: 25 Haziran 10:00 Valuation | 5s |
| 4 | **"Schedule Zoom Meeting"** tıkla | Modal: tarih ön-dolu, topic auto-filled | 8s |
| 5 | Confirm | Loading → Meeting card belirir | 5s |
| 6 | Timeline'a kaydır | Yeni event: "Zoom meeting scheduled — Valuation call — 14 Oak Lane" | 7s |
| 7 | **"Join in Lifesycle"** (veya Hafta 1'de "Join in Zoom") | Slide-over açılır / yeni sekme | 15s |
| 8 | (Kısa) meeting içi görünüm | Video panel aktif — hızlı wave | 10s |
| 9 | Leave meeting / panel kapat | Timeline'da "Meeting ended — 0 min" veya simüle webhook ile "47 min" | 8s |
| 10 | (Opsiyonel) "Create follow-up" | Draft task: "Send valuation summary to Sarah" | 8s |
| 11 | Kapanış slayt | Recommendation özeti: MVP = link+timeline, next = Lifesycle adapter | 10s |

### 5.3 Demo Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Zoom SDK yüklenmez | Önceden cache; redirect fallback butonu her zaman görünür |
| Ağ kopması | Offline demo video (Loom) + screenshots |
| Webhook gecikmesi | Demo öncesi `curl` ile meeting.ended inject |
| Yanlış hesap host değil | Demo agent = Zoom host olarak önceden yapılandırılmış sandbox user |

### 5.4 Yedek Senaryo (Hafta 1 Only)

Embed hazır değilse: Adım 7'de "Join in Zoom" → yeni sekme; timeline akışı aynı kalır. Narration: "Hafta 2'de bu sekme slide-over olacak."

---

## 6. Faz 2 — Ay 2–3: Gerçek Lifesycle Adapter

**Önkoşul:** Lifesycle main team'den internal API / DB şema erişimi veya resmi adapter spec.

### 6.1 Hedef

Mock CRM'deki adapter katmanını **gerçek Lifesycle backend** ile değiştirmek; POC mantığını Laravel (veya Lifesycle stack) modülü olarak paketlemek — **henüz production deploy değil**, staging entegrasyonu.

### 6.2 Lifesycle Adapter Araştırma Sprinti (Hafta 5–6)

| Aktivite | Çıktı |
|----------|-------|
| Main team interview | API endpoints, auth, multi-tenant model |
| Schema mapping doc | `contacts` → Lifesycle Contact model |
| Timeline API | Mevcut activity feed'e event ekleme yöntemi |
| Permission model | Hangi roller meeting create edebilir |
| Staging credentials | Test tenant |

### 6.3 Adapter Mimarisi

```
┌────────────────────────────────────────────────────────────┐
│ Lifesycle CRM (Staging)                                     │
│  ┌──────────────┐   ┌─────────────────┐   ┌────────────┐ │
│  │ Contact UI   │──▶│ ZoomModule       │──▶│ Timeline   │ │
│  │ (Blade/Vue)  │   │ (Adapter)        │   │ Service    │ │
│  └──────────────┘   └────────┬────────┘   └────────────┘ │
└──────────────────────────────┼─────────────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Zoom Integration      │
                    │ Service (black box)   │
                    └──────────────────────┘
```

### 6.4 Faz 2 Deliverables

| Deliverable | Açıklama |
|-------------|----------|
| `LIFESYCLE_ADAPTER_SPEC.md` | Entity mapping, API contract, error codes |
| Laravel service class | `ZoomMeetingService` — harici API client |
| Feature flag | `zoom_meetings_enabled` per tenant |
| Migration plan | `zoom_meetings` tablosu Lifesycle DB'de |
| Staging demo | Gerçek contact üzerinde meeting create |
| Security review checklist | start_url encryption, RBAC |

### 6.5 Faz 2 Kabul Kriterleri

- [ ] Gerçek Lifesycle contact'tan meeting oluşturulur
- [ ] Timeline native feed'de görünür
- [ ] Harici Zoom servisi değişmeden çalışır
- [ ] Rollback planı dokümante
- [ ] Performance: create < 5s p95 staging

### 6.6 Bilinmeyen Lifesycle Şeması — Geçici Stratejiler

| Strateji | Ne zaman |
|----------|----------|
| Read-only DB replica exploration | API yoksa |
| Webhook-out timeline | Lifesycle timeline API kapalıysa |
| iframe POC embed | UI değişikliği minimal ise |
| Feature branch isolation | Merge riski yüksekse |

---

## 7. Faz 3 — Full Communication Hub (Production CRM)

**Zaman ufku:** Ay 4–6+ (Lifesycle product roadmap ile hizalı)  
**Vizyon:** Zoom meetings, aramalar, e-posta, SMS ve ileride transcript intelligence — tek **Communication Hub** deneyimi.

### 7.1 Communication Hub Bileşenleri

```
┌─────────────────────────────────────────────────────────────┐
│                 Lifesycle Communication Hub                  │
├─────────────┬─────────────┬─────────────┬───────────────────┤
│ Zoom Video  │ Zoom Phone  │ Email/SMS   │ Field Recordings  │
│ (M3)        │ (harici)    │ (mevcut)    │ (ayrı pipeline)   │
├─────────────┴─────────────┴─────────────┴───────────────────┤
│              Unified Timeline (all channels)                 │
│              Unified Contact Activity View                   │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Faz 3 Özellik Seti

| Özellik | Öncelik | Açıklama |
|---------|---------|----------|
| Unified timeline | P0 | Tüm kanallar tek feed |
| Meeting templates | P0 | Valuation, viewing, internal |
| Calendar sync | P1 | Google/Outlook ↔ Zoom |
| Recording playback in CRM | P1 | Zoom cloud recording embed |
| Transcript attach | P1 | Webhook → timeline (consent gated) |
| AI meeting summary | P2 | Harici AI servis |
| Bulk schedule | P2 | Open house virtual |
| Mobile app join | P2 | Deep link |
| Admin analytics | P2 | Meeting volume per branch |

### 7.3 Production Non-Functional Requirements

| NFR | Hedef |
|-----|-------|
| Availability | 99.5% meeting create |
| Audit log | Kim, hangi contact için meeting oluşturdu |
| GDPR | Consent flag, retention policy, EU data residency |
| Multi-tenant | Branch-level Zoom account mapping |
| Rate limiting | Per-agent create throttle |
| Disaster recovery | Harici servis down → graceful degrade (manual link) |

### 7.4 Faz 3 Rollout Stratejisi

1. **Pilot branch** (1 ofis, 10 agent) — 4 hafta
2. **Feedback loop** — UX + support ticket analizi
3. **Gradual rollout** — feature flag %10 → %50 → %100
4. **Training** — in-app tooltip + 2 dk video
5. **Sunset** — harici Zoom link manuel giriş (opsiyonel deprecate)

### 7.5 Faz 3 Başarı Metrikleri

| Metrik | Baseline → Hedef |
|--------|------------------|
| Avg. tools per valuation call | 3 → 1 |
| Timeline manual entry rate | −40% |
| Time to join meeting from CRM | < 15 sn |
| Agent NPS (communication) | +15 puan |

---

## 8. Entegrasyon Seçenekleri Karşılaştırması ve Karar

### 8.1 Seçenek A — Link Redirect + Timeline Log

**Nasıl çalışır:** Harici servis meeting oluşturur → CRM `join_url` saklar → agent yeni sekmede Zoom'a gider → timeline'a event yazılır.

| Boyut | Puan (1–5) | Not |
|-------|------------|-----|
| Time-to-value | ⭐⭐⭐⭐⭐ | 3–5 gün |
| Production uygunluk | ⭐⭐⭐⭐ | Olgun, az risk |
| UX wow | ⭐⭐ | Context switch |
| Bakım yükü | ⭐⭐⭐⭐⭐ | Minimal |
| Browser uyumu | ⭐⭐⭐⭐⭐ | Tüm tarayıcılar |

### 8.2 Seçenek B — REST API Create + Meeting SDK Embed

**Nasıl çalışır:** Meeting API ile oluştur → SDK signature ile in-app embed → webhook ile post-meeting data.

| Boyut | Puan (1–5) | Not |
|-------|------------|-----|
| Time-to-value | ⭐⭐⭐⭐ | 2 hafta |
| Production uygunluk | ⭐⭐⭐⭐ | Zoom önerilen yol |
| UX wow | ⭐⭐⭐⭐⭐ | Ajan CRM'de kalır |
| Bakım yükü | ⭐⭐⭐ | SDK versiyon, CSP |
| Browser uyumu | ⭐⭐⭐ | Safari/IT policy riskleri |

### 8.3 Seçenek C — Video SDK Custom Room

**Nasıl çalışır:** Tam custom UI, Zoom altyapısı arkada; Lifesycle branded experience.

| Boyut | Puan (1–5) | Not |
|-------|------------|-----|
| Time-to-value | ⭐⭐ | 2–3 ay+ |
| Production uygunluk | ⭐⭐⭐ | Yüksek lisans maliyeti |
| UX wow | ⭐⭐⭐⭐ | Custom ama pahalı |
| Bakım yükü | ⭐⭐ | Çok yüksek |
| Browser uyumu | ⭐⭐⭐ | WebRTC complexity |

### 8.4 Birleşik Karar Matrisi (Ağırlıklı)

| Kriter | Ağırlık | A: Redirect | B: REST+Embed | C: Video SDK |
|--------|---------|-------------|---------------|--------------|
| TTV | 25% | 5 | 4 | 2 |
| Production fit | 25% | 4 | 4 | 3 |
| UX | 20% | 2 | 5 | 4 |
| Maintenance | 15% | 5 | 3 | 2 |
| Lifesycle stack fit | 15% | 4 | 4 | 2 |
| **Ağırlıklı toplam** | | **4.15** | **4.05** | **2.55** |

### 8.5 Nihai Karar

| Faz | Seçim | Gerekçe |
|-----|-------|---------|
| **Demo Hafta 1 (MVP)** | **A — Redirect + timeline** | Brief minimum'unu hızla aşar; risk düşük |
| **Demo Hafta 2 (Preferred)** | **B — REST + Meeting SDK embed** | Lifesycle "communication hub" vizyonuna uygun wow |
| **Production** | **B primary, A fallback** | Embed fail → redirect; her zaman degrade path |
| **Arşiv** | **C — Video SDK** | ROI düşük; sadece white-label ihtiyacı olursa yeniden değerlendir |

### 8.6 Kavram Ayrımı (Brief Sorularına Cevap)

| Kavram | Açıklama |
|--------|----------|
| **Create meeting** | API ile gelecekteki toplantı kaydı; join_url + start_url döner |
| **Start meeting** | Host anlık başlatır (instant veya scheduled start) |
| **Join meeting** | Participant/host meeting'e katılır (redirect veya SDK) |
| **Embed meeting** | Meeting SDK ile CRM sayfası içinde video UI |

---

## 9. Veri Modeli: Contact, Property, TimelineEvent, Meeting

### 9.1 ER Diyagramı

```
┌─────────────┐       ┌─────────────┐       ┌──────────────────┐
│  Contact    │──1:N──│  Property   │──1:N──│  Appointment     │
│             │       │             │       │  (valuation)     │
└──────┬──────┘       └──────┬──────┘       └────────┬─────────┘
       │                     │                        │
       └──────────┬──────────┴────────────────────────┘
                  │ 1:N
                  ▼
           ┌─────────────┐
           │  Meeting    │
           └──────┬──────┘
                  │ generates
                  ▼
           ┌─────────────┐       ┌──────────────────┐
           │ TimelineEvent│──N:1─│ FollowUpTask     │
           │ (polymorphic)│      │ (optional)       │
           └─────────────┘       └──────────────────┘
```

### 9.2 Contact

```sql
CREATE TABLE contacts (
  id            TEXT PRIMARY KEY,          -- cnt_abc123
  external_id   TEXT,                      -- Lifesycle ID (Faz 2)
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  type          TEXT NOT NULL,               -- lead | seller | buyer | landlord
  assigned_agent_id TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### 9.3 Property

```sql
CREATE TABLE properties (
  id            TEXT PRIMARY KEY,          -- prop_xyz789
  external_id   TEXT,
  contact_id    TEXT REFERENCES contacts(id),
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city          TEXT,
  postcode      TEXT,
  listing_type  TEXT,                      -- sale | let
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### 9.4 Appointment (Valuation)

```sql
CREATE TABLE appointments (
  id            TEXT PRIMARY KEY,          -- val_001
  external_id   TEXT,
  property_id   TEXT REFERENCES properties(id),
  contact_id    TEXT REFERENCES contacts(id),
  type          TEXT NOT NULL,             -- valuation | viewing | follow_up
  scheduled_at  TIMESTAMPTZ NOT NULL,
  status        TEXT DEFAULT 'scheduled',  -- scheduled | completed | cancelled
  agent_id      TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### 9.5 Meeting

```sql
CREATE TABLE meetings (
  id                  TEXT PRIMARY KEY,      -- meet_uuid (CRM internal)
  zoom_service_id     TEXT NOT NULL,         -- zm_meet_7f3a
  zoom_meeting_id     TEXT NOT NULL,         -- 87654321098
  contact_id          TEXT REFERENCES contacts(id),
  property_id         TEXT REFERENCES properties(id),
  appointment_id      TEXT REFERENCES appointments(id),
  topic               TEXT NOT NULL,
  agenda              TEXT,
  start_time          TIMESTAMPTZ,
  duration_minutes    INT,
  timezone            TEXT DEFAULT 'Europe/London',
  join_url            TEXT NOT NULL,
  start_url_encrypted TEXT,                  -- host only, AES-GCM
  password            TEXT,
  status              TEXT NOT NULL,         -- scheduled | started | ended | cancelled
  host_agent_id       TEXT,
  actual_duration_min INT,
  participant_count   INT,
  recording_status    TEXT,                  -- none | processing | available
  transcript_status   TEXT,                  -- none | pending | available
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meetings_contact ON meetings(contact_id);
CREATE INDEX idx_meetings_appointment ON meetings(appointment_id);
CREATE INDEX idx_meetings_zoom_id ON meetings(zoom_meeting_id);
```

### 9.6 TimelineEvent (Paylaşılan Model)

Timeline, Zoom dışı kanallarla da genişleyebilecek **polymorphic activity feed**.

```sql
CREATE TABLE timeline_events (
  id              TEXT PRIMARY KEY,          -- tle_uuid
  contact_id      TEXT REFERENCES contacts(id),
  property_id     TEXT REFERENCES properties(id),
  appointment_id  TEXT REFERENCES appointments(id),
  meeting_id      TEXT REFERENCES meetings(id),
  event_type      TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  metadata        JSONB DEFAULT '{}',
  actor_type      TEXT,                      -- agent | system | webhook
  actor_id        TEXT,
  occurred_at     TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_timeline_contact ON timeline_events(contact_id, occurred_at DESC);
```

**event_type enum (M3):**

| event_type | title örneği |
|------------|--------------|
| `meeting.scheduled` | Zoom meeting scheduled |
| `meeting.started` | Zoom meeting started |
| `meeting.ended` | Zoom meeting ended — 47 min |
| `meeting.recording_ready` | Recording available |
| `meeting.transcript_ready` | Transcript attached |
| `meeting.cancelled` | Meeting cancelled |
| `follow_up.created` | Follow-up task drafted |

### 9.7 FollowUpTask (Opsiyonel)

```sql
CREATE TABLE follow_up_tasks (
  id              TEXT PRIMARY KEY,
  contact_id      TEXT REFERENCES contacts(id),
  meeting_id      TEXT REFERENCES meetings(id),
  title           TEXT NOT NULL,
  description     TEXT,
  due_date        DATE,
  status          TEXT DEFAULT 'draft',    -- draft | open | done
  created_by      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 9.8 Lifesycle Mapping Notları (Faz 2)

| Mock entity | Lifesycle (varsayılan) | Doğrulanacak |
|-------------|------------------------|--------------|
| `contacts` | `contacts` / `leads` | Tablo adı |
| `properties` | `properties` / `listings` | |
| `appointments` | `valuations` / `appointments` | |
| `timeline_events` | `activity_log` / `communications` | API var mı? |

---

## 10. API Tasarımı ve UX Wireflow

### 10.1 Mock CRM REST API (M3 Sahibi)

#### Contacts

```http
GET    /api/contacts
GET    /api/contacts/:id              # contact + properties + recent timeline
```

#### Meetings

```http
POST   /api/contacts/:id/meetings
       Body: { property_id?, appointment_id?, start_time, duration?, type: "scheduled"|"instant" }

GET    /api/meetings/:id

POST   /api/meetings/:id/join
       Response: { mode: "redirect", join_url } | { mode: "embed", signature_endpoint }

POST   /api/meetings/:id/embed-signature
       Body: { role?: 0|1 }
       Response: { signature, sdk_key, meeting_number, password, expires_at }

DELETE /api/meetings/:id              # cancel
```

#### Timeline

```http
GET    /api/contacts/:id/timeline?limit=50&cursor=...
```

#### Webhooks (inbound)

```http
POST   /api/webhooks/zoom
       Header: X-Webhook-Secret
       Body: normalized event (Bölüm 2.2.5)
```

#### Follow-up (opsiyonel)

```http
POST   /api/meetings/:id/follow-up
       Body: { title, due_date?, description? }
```

### 10.2 API Hata Kodları

| HTTP | code | Mesaj (agent-facing) |
|------|------|----------------------|
| 400 | `INVALID_SCHEDULE_TIME` | Toplantı zamanı geçmişte olamaz |
| 401 | `UNAUTHORIZED` | Oturum süresi doldu |
| 403 | `NOT_HOST` | Bu toplantıyı yalnızca host başlatabilir |
| 409 | `DUPLICATE_ACTIVE_MEETING` | Bu randevu için zaten aktif meeting var |
| 502 | `ZOOM_SERVICE_UNAVAILABLE` | Zoom servisi geçici olarak kullanılamıyor |
| 504 | `ZOOM_SERVICE_TIMEOUT` | İstek zaman aşımına uğradı, tekrar deneyin |

### 10.3 UX Wireflow

```
[Contact List]
      │
      ▼ click row
[Contact Detail] ─────────────────────────────────────┐
      │                                                │
      │ click property                                 │
      ▼                                                │
[Property / Valuation Page]                            │
      │                                                │
      ├── "Schedule Zoom Meeting" ──▶ [Schedule Modal] │
      │         │ confirm                            │
      │         ▼                                      │
      │    [Meeting Card] ◀────────────────────────────┤
      │         │                                      │
      │         ├── "Copy Link" ──▶ clipboard           │
      │         ├── "Join in Zoom" ──▶ new tab        │
      │         └── "Join in Lifesycle" ──▶ [Slide-over Embed]
      │                                                │
      └── [Timeline Panel] ◀── events appended ────────┘
                │
                └── meeting.ended ──▶ [Follow-up CTA]
```

### 10.4 Ekran Wireframe Notları

**Contact Detail:**
- Sol: contact bilgisi
- Orta: property kartları
- Sağ: timeline (sticky)

**Schedule Modal:**
- Topic (auto, editable)
- Date/time picker (appointment default)
- Duration dropdown (30/60/90)
- Waiting room toggle (default on)
- Primary CTA: "Create Meeting"

**Meeting Card:**
- Status badge (Scheduled / Live / Ended)
- Join buttons (primary: in-app, secondary: external)
- Metadata: ID, password (copy), duration when ended

**Embed Slide-over:**
- Header: topic + minimize + "Open in Zoom"
- Body: SDK mount point
- Footer: "End & return to CRM"

### 10.5 Topic Auto-Generation Kuralları

| Bağlam | Topic şablonu |
|--------|---------------|
| Valuation + property | `Valuation call — {address_line1}, {postcode}` |
| Contact only | `Call with {first_name} {last_name}` |
| Viewing | `Virtual viewing — {address_line1}` |
| Internal | `Internal meeting — {agent_team}` |

---

## 11. OAuth Scope Matrisi

> Zoom OAuth scope'ları **harici Zoom Integration Service** tarafından yönetilir. M3, gerekli scope listesini dokümante eder ve capability endpoint ile doğrular.

### 11.1 Scope Gereksinim Matrisi

| Yetenek | OAuth Scope | Grant tipi | M3 Demo | Production |
|---------|-------------|------------|---------|------------|
| Meeting oluşturma | `meeting:write:admin` veya `meeting:write` | S2S / User OAuth | ✅ | ✅ |
| Meeting okuma | `meeting:read:admin` | S2S | ✅ | ✅ |
| Kullanıcı bilgisi | `user:read:admin` | S2S | ✅ | ✅ |
| Cloud recording list | `recording:read:admin` | S2S | ⚠️ Hafta 2 | ✅ |
| Recording transcript | `recording:read:admin` + plan | S2S | ⚠️ Simüle | ✅ |
| Meeting SDK signature | SDK credentials (ayrı) | App credentials | ✅ Hafta 2 | ✅ |
| Webhook registration | Marketplace app config | Admin | ❌ Harici servis | ✅ |
| Calendar sync | `calendar:write` | User OAuth | ❌ Faz 3 | P1 |
| Phone | `phone:read` / `phone:write` | Ayrı ürün | ❌ Kapsam dışı | ❌ |

### 11.2 Auth Model Karşılaştırması

| Model | Artı | Eksi | M3 Öneri |
|-------|------|------|----------|
| **Server-to-Server OAuth** | Merkezi, agent login gerekmez | Admin kurulum | Harici servis default |
| **User OAuth** | Agent kendi Zoom hesabı | Her agent authorize | Faz 3 opsiyon |
| **Account-level install** | Kurumsal lisans yönetimi | Onboarding sürtünmesi | Production |

### 11.3 Marketplace App Gereksinimleri (Production Checklist)

- [ ] Zoom Marketplace app oluşturuldu (Account-level)
- [ ] Redirect URL whitelist
- [ ] Webhook endpoint TLS + secret validation
- [ ] Scope minimal principle — yalnızca kullanılanlar
- [ ] Data retention policy dokümante
- [ ] EU region (GDPR) değerlendirmesi

### 11.4 Recording / Transcript Limitleri

| Özellik | Kısıt | M3 Yaklaşımı |
|---------|-------|--------------|
| Cloud recording | Paid Zoom plan | Sandbox'ta test |
| Audio transcript | Business+ / addon | Webhook simülasyonu |
| Real-time transcript | RTMS ayrı ürün | Dokümante, implement etme |
| Summary API | Beta / region-limited | Faz 3 araştırma |

---

## 12. Test Planı ve Riskler

> **v1.1 ZORUNLU:** `ZOOM_MODE=mock` + mock Zoom Integration Service ile tam test suite. CI merge blocker. Demo submit testler geçmeden tamamlanmış sayılmaz.

### 12.1 Test Stratejisi

| Seviye | Kapsam | Araç |
|--------|--------|------|
| Unit | Topic generator, encryption, event mapper | Vitest/Jest |
| Contract | Harici Zoom servis request/response | Pact veya mock server |
| Integration | create → timeline → webhook | Supertest + test DB |
| E2E | Full demo script | Playwright |
| Manual | Embed Safari/Chrome/Firefox | Checklist |
| Load (Faz 2+) | 50 concurrent create | k6 lite |

### 12.2 Test Senaryoları (Öncelikli)

| ID | Senaryo | Beklenen |
|----|---------|----------|
| T01 | Schedule meeting from valuation page | Meeting + timeline event |
| T02 | Instant meeting from contact | status=started |
| T03 | Join redirect | join_url valid, new tab |
| T04 | Embed signature + mount SDK | Video panel renders |
| T05 | Embed fail fallback | Redirect button visible |
| T06 | Webhook meeting.ended | Timeline duration updated |
| T07 | Duplicate active meeting | 409 DUPLICATE_ACTIVE_MEETING |
| T08 | Zoom service 502 | User-friendly error, no partial state |
| T09 | start_url not in API response | Encrypted at rest, never in GET |
| T10 | Cancel meeting | status=cancelled, timeline event |
| T11 | Timezone BST/GMT switch | Correct displayed time |
| T12 | Copy join link | Clipboard + tracking event |

### 12.3 Demo Submit Test Gate

Demo submit öncesi tüm **T01–T08** otomatik yeşil; **T09** güvenlik review; **T04** manual checklist.

### 12.4 Risk Kaydı

| ID | Risk | Olasılık | Etki | Mitigation |
|----|------|----------|------|------------|
| R1 | **Lifesycle internal schema/API bilinmiyor** | Yüksek | Yüksek | Mock-first; Faz 2 öncesi main team workshop; adapter spec |
| R2 | Harici Zoom servis gecikmesi / API değişikliği | Orta | Yüksek | Contract tests; capability endpoint; version pinning |
| R3 | Meeting SDK browser/CSP çakışması | Orta | Orta | Redirect fallback; iframe isolation |
| R4 | Zoom lisans yetersiz (recording/transcript) | Orta | Orta | Demo'da simüle; scope doc'ta belirt |
| R5 | GDPR — görüşme kaydı consent | Yüksek | Yüksek | Faz 3 legal; demo'da mock consent flag |
| R6 | Agent host değil (wrong Zoom user) | Orta | Orta | Demo sandbox dedicated host |
| R7 | Webhook delivery failure | Orta | Düşük | Manual reconcile job (Faz 2); demo inject |
| R8 | Rate limit 429 | Düşük | Orta | Exponential backoff; demo cache |
| R9 | Lifesycle UI framework çakışması (Bootstrap/React) | Orta | Orta | Slide-over isolation; Shadow DOM değerlendir |
| R10 | Stakeholder "embed zorunlu" beklentisi | Orta | Orta | Hafta 1'de link demo ile erken göster |

### 12.5 Lifesycle Schema Unknown — Detaylı Mitigation Planı

```
Hafta 1–3: Mock CRM (tam kontrol)
     │
Hafta 4:   Main team'e 10 soruluk schema questionnaire gönder
     │
Hafta 5:   Workshop (1 saat): timeline API, contact model, auth
     │
Hafta 6:   Adapter spec v0.1 — assumption'lar explicit labeled
     │
Hafta 8+:  Staging integration — assumption validation
```

**Workshop soru örnekleri:**

1. Contact ve Lead ayrı tablolar mı?
2. Timeline event eklemek için public API var mı?
3. Property-valuation-contact ilişkisi nasıl?
4. Multi-branch Zoom account modeli?
5. Mevcut Zoom entegrasyonu (varsa) hangi scope'ları kullanıyor?

---

## 13. Effort Tahmini

### 13.1 Faz 1 — Demo Submit (1 Ay)

| Görev | Kişi-gün | Not |
|-------|----------|-----|
| Faz 0 mock CRM setup | 3 | DB, seed, routing |
| Hafta 1 MVP (link+timeline) | 5 | API + UI |
| Hafta 2 embed | 5 | SDK + slide-over |
| Hafta 3 polish + docs | 4 | Research, handover |
| Hafta 4 buffer + prova | 2 | |
| **Faz 1 toplam** | **~19 kişi-gün** | ~1 FTE × 4 hafta |

### 13.2 Faz 2 — Lifesycle Adapter (Ay 2–3)

| Görev | Kişi-gün |
|-------|----------|
| Discovery + workshop | 3 |
| Adapter spec + mapping | 4 |
| Laravel module implementation | 10 |
| Staging integration test | 5 |
| Security + RBAC review | 3 |
| **Faz 2 toplam** | **~25 kişi-gün** |

### 13.3 Faz 3 — Communication Hub (Ay 4–6+)

| Görev | Kişi-gün |
|-------|----------|
| Unified timeline refactor | 15 |
| Recording playback | 8 |
| Transcript + consent | 10 |
| Calendar sync | 10 |
| Pilot + rollout | 10 |
| **Faz 3 toplam** | **~53 kişi-gün** (paralel product team ile paylaşımlı) |

### 13.4 Rol Dağılımı (Faz 1)

| Rol | Sorumluluk | Yük |
|-----|------------|-----|
| Full-stack dev | CRM POC, API, embed | %70 |
| UX/UI | Wireframe, polish | %15 |
| Tech writer | Research, handover | %10 |
| QA | Test plan execution | %5 |

### 13.5 Bağımlılık Bekleme Süreleri (Buffer)

| Bekleme | Süre | Etki |
|---------|------|------|
| Zoom sandbox credentials | 1–3 gün | Faz 0 gecikme |
| Harici servis deploy | 2–5 gün | Contract test mock ile paralel |
| Lifesycle API erişimi | 2–4 hafta | Faz 2 başlangıcı kayar |

---

## 14. Harici Bağımlılıklar: Zoom Integration Service (Siyah Kutu)

### 14.1 Servis Tanımı

**Zoom Integration Service**, Zoom platformu ile tüm düşük seviye iletişimi üstlenen harici bir mikroservistir. M3 bu servisi **yalnızca HTTP API** ile tüketir; kaynak koduna, OAuth implementasyonuna veya SDK entegrasyon detaylarına erişimi yoktur.

### 14.2 M3'nin Servisten Beklediği SLA (Varsayımsal)

| Metrik | Değer |
|--------|-------|
| `POST /meetings` p95 latency | < 2s |
| Uptime | 99% (demo dönemi) |
| Signature TTL | ≥ 5 dakika |
| Webhook delivery | At-least-once, < 30s |

### 14.3 Sözleşme Özeti (Consumer View)

```
M3 Mock CRM                          Zoom Integration Service
─────────────────────────────────────────────────────────────
POST /api/contacts/:id/meetings  →   POST /meetings
POST /api/meetings/:id/embed...  →   POST /meetings/:id/embed-signature
POST /api/webhooks/zoom          ←   POST (normalized webhook)
GET  /capabilities               →   GET /capabilities
```

### 14.4 Servis Yokken Geliştirme (Local Dev)

| Yöntem | Kullanım |
|--------|----------|
| **Mock server** (`msw`, `wiremock`, `json-server`) | Faz 0–1 default |
| **Recorded fixtures** | CI contract tests |
| **Sandbox stub** | Harici ekip servisi deploy edince swap |

Mock server örnek: `tools/zoom-service-mock/` — OpenAPI spec'ten üretilmiş.

### 14.5 OpenAPI Spec Referansı (Tüketici)

M3 repo'sunda: `contracts/zoom-integration-service.openapi.yaml`

Servis versiyonu header: `X-Service-Version: 1.x` — breaking change'de adapter güncellenir.

### 14.6 Sorumluluk Sınırı

| Konu | Zoom Integration Service | M3 Mock CRM |
|------|--------------------------|-------------|
| Zoom OAuth token refresh | ✅ | ❌ |
| Meeting create/update/delete | ✅ | ❌ |
| SDK signature generation | ✅ | ❌ |
| Raw Zoom webhook verify | ✅ | ❌ |
| CRM entity mapping | ❌ | ✅ |
| Timeline UI | ❌ | ✅ |
| start_url encryption at rest | ❌ | ✅ |
| Agent-facing UX | ❌ | ✅ |
| Follow-up task logic | ❌ | ✅ |

### 14.7 Entegrasyon Doğrulama Checklist

- [ ] `GET /capabilities` — embed_sdk=true
- [ ] `POST /meetings` — 201 + join_url
- [ ] `POST /meetings/instant` — status=started
- [ ] `POST /meetings/:id/embed-signature` — signature expires_at gelecekte
- [ ] Webhook test event — CRM timeline güncellenir
- [ ] 401 invalid token — CRM hata mesajı gösterir
- [ ] 429 rate limit — retry-after header respected

---

## Ekler

### Ek A — Repo Yapısı Önerisi

```
lifesycle-zoom-crm-poc/
├── README.md
├── HANDOVER.md
├── .env.example
├── contracts/
│   └── zoom-integration-service.openapi.yaml
├── docs/
│   ├── ZOOM_CRM_RESEARCH.md
│   ├── UX_FLOW.md
│   ├── RECOMMENDATION.md
│   ├── DEMO_DAY_REFLECTION.md
│   └── wireframes/
├── prisma/ or migrations/
├── src/
│   ├── app/                 # Next.js pages
│   ├── components/          # MeetingCard, Timeline, EmbedPanel
│   ├── lib/
│   │   ├── zoom-client.ts   # Harici servis HTTP client
│   │   ├── encryption.ts
│   │   └── topic-generator.ts
│   └── pages/api/           # CRM API routes
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── tools/
    └── zoom-service-mock/
```

### Ek B — Karar Özeti (Executive)

1. **MVP = redirect + timeline** (Hafta 1) — hızlı değer, düşük risk.
2. **Preferred demo = Meeting SDK embed** (Hafta 2) — Lifesycle communication hub vizyonu.
3. **Video SDK arşiv** — ROI yetersiz.
4. **Zoom Integration Service siyah kutu** — M3 CRM adapter ve UX'e odaklanır.
5. **Lifesycle production** Faz 2'de adapter ile; şema bilinmediği için mock-first zorunlu.
6. **Devam önerisi:** Evet — koşullu (Lifesycle API erişimi + Zoom lisans onayı ile).

---

*Bu plan, `missions/m3-lifesycle-zoom-meeting-flow/brief/MISSION_BRIEF.md` resmi mission brief'i ve `shared/documents/FINAL_EVALUATION_AND_CONSOLIDATED_PLAN.md` M3 bölümü esas alınarak hazırlanmıştır. Zoom entegrasyon implementasyonu bilinçli olarak kapsam dışı bırakılmıştır.*
