# M4 — Property Intelligence Pipeline: Demo ve Yol Haritası Planı

> **Mission:** Plaud Transcript Retrieval  
> **Kaynak brief:** `missions/m4-property-intelligence-pipeline/brief/MISSION_BRIEF.md`  
> **Kapsam:** Bu belge yalnızca M4'ü planlar. CRM timeline, Lifesycle property/contact/valuation API'leri **dış entegrasyon noktası** olarak ele alınır; diğer mission'ların iç mimarisi bu planda referans edilmez.  
> **Versiyon:** 1.1  
> **Tarih:** 2026-06-21  
> **Plan v1.1:** Plaud API key'leri sağlanacak — `ApiPlaudAdapter` birincil. Mock sadece test/CI. LLM: Gemini + OpenAI + Anthropic. **Testler zorunlu.** → `shared/plans/SHARED_PLAN_CONSTRAINTS.md`  
> **Dil:** Türkçe

---

## 1. Mission Özeti — Property Intelligence Pipeline (Valuation → Proposal)

### 1.1 Resmi Mission Tanımı

Plaud.ai, müşterilerin property valuation (mülk değerleme) randevularında kullandığı ses kayıt cihazı ve özet/transkript üreten bulut servisidir. Mission'ın amacı:

1. Plaud'dan konuşma özetlerini ve transkriptleri almak,
2. Her kaydın hangi **Company**, **User** ve **Property** ile ilişkili olduğunu güvenilir biçimde belirlemek,
3. Çıkarılan bilgiyi Lifesycle **property proposal** sürecinde kullanılabilir hale getirmek.

Beklenen resmi çıktılar (mission brief):

| Çıktı | Açıklama |
|-------|----------|
| **Entity Association Model** | Transcript → Company / User / Property eşleştirme stratejisi ve güven skoru modeli |
| **Retrieval Documentation** | Plaud'dan veri alma yöntemleri, API/MCP/CLI seçenekleri, kısıtlar ve önerilen mimari |
| **Working POC** | Mümkünse uçtan uca çalışan örnek (mock-first kabul edilir) |

### 1.2 Ürün Vizyonu: Property Intelligence Pipeline

Mission'ı teknik ürün adıyla konumlandırma: **Property Intelligence Pipeline**.

```
Valuation Appointment (sahada Plaud kaydı)
        ↓
   INGEST — transcript/summary al
        ↓
   PARSE — ham metin normalize et, metadata çıkar
        ↓
   MATCH — Company / User / Property eşleştir (confidence score)
        ↓
   EXTRACT — AI ile proposal alanlarına yapılandırılmış çıkarım
        ↓
   REVIEW — agent human-in-the-loop onayı
        ↓
   APPLY — CRM timeline event + property proposal draft alanları
```

### 1.3 Lifesycle Domain Bağlamı

UK estate agent iş akışında tipik valuation süreci:

1. Agent, Lifesycle'da bir **Property** ve ilişkili **Contact** (ev sahibi) kaydı açar.
2. **Valuation appointment** planlanır (tarih/saat, atanan agent).
3. Sahada agent Plaud cihazıyla konuşmayı kaydeder; Plaud özet ve transkript üretir.
4. Agent manuel olarak proposal formuna (durum, motivasyon, fiyat beklentisi, renovasyon notları vb.) bilgi girer — **bu manuel adım otomasyona adaydır**.
5. Proposal tamamlanır, pazarlama sürecine geçilir.

Pipeline'ın değer önerisi: adım 4'teki manuel veri girişini azaltmak, transkriptte geçen kritik detayların kaçmasını önlemek ve valuation sonrası follow-up'ı hızlandırmak.

### 1.4 Kritik Gerçek (Planın Temel Varsayımı)

> **Plaud Developer Platform mevcuttur; ancak mevcut tüketici (consumer) Plaud hesabından resmi API ile kayıt/transkript çekme 2026-06 itibarıyla açıkça desteklenmemektedir.**

Bu bulgu tüm faz planının omurgasıdır:

- Demo ve ilk ay POC **zorunlu olarak mock-first** olmalıdır.
- Gerçek Plaud verisi yalnızca partner erişimi, Transcription API (audio submit), Embedded SDK veya topluluk MCP/CLI ile sınırlı ve riskli olarak denenebilir.
- Demo'da "Plaud'dan otomatik çekiyoruz" iddiası **yapılmamalı**; mimari hazır, veri kaynağı adaptörü değişkendir.

### 1.5 Mimari Bileşenler (M4 İzolasyonu)

```
┌─────────────────────────────────────────────────────────────────┐
│                    plaud-core (M4 servisi)                       │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│ PlaudProvider│ Entity       │ AI Extraction│ Review + Apply     │
│ Adapter      │ Matcher      │ Service      │ Service            │
│ (mock|MCP|   │ (weighted    │ (structured  │ (human gate →      │
│  API|webhook)│  confidence) │  JSON+Zod)   │  CRM adapter)      │
└──────┬───────┴──────┬───────┴──────┬───────┴─────────┬──────────┘
       │              │              │                 │
       ▼              ▼              ▼                 ▼
   Plaud kaynak   PostgreSQL     LLM provider    Lifesycle CRM
   (harici)       (kayıtlar,     (OpenAI /       (dış API —
                   eşleşmeler,    Anthropic)      timeline +
                   extractions)                   proposal draft)
```

**Governance kırmızı çizgisi:** AI çıktısı **asla** doğrudan CRM'e yazılmaz. Her apply işlemi human onayı + audit log gerektirir.

### 1.6 Başarı Kriterleri

| Kriter | Ölçüm |
|--------|-------|
| Pipeline uçtan uca çalışır | Mock veriyle ingest → apply tamamlanır |
| Entity eşleştirme anlaşılırdır | Confidence + reason chips UI'da görünür |
| Proposal alanları yapılandırılmışdır | Her alan `confidence` + `evidence_quote` taşır |
| Retrieval dokümante edilmiştir | Tüm erişim yolları, riskler ve fallback'ler yazılı |
| Demo güvenilir | 5 dakikalık canlı akış kesintisiz |
| Handover hazır | README, env, TEST_PLAN, known issues |

---

## 2. Faz 0 — Plaud Erişim Stratejisi, Mock Veri, Hukuki/Onay Notları

**Süre:** Mission başlangıcından önce ve Faz 1 ile paralel (Hafta 0–1)  
**Amaç:** Veri kaynağı belirsizliğini erken çözmek; hukuki çerçeveyi netleştirmek; mock dataset'i hazırlamak.

### 2.1 Plaud Platform Keşfi ve Erişim Yolu Matrisi

| Yol | Açıklama | Resmiyet | POC uygunluğu | Production uygunluğu | Risk |
|-----|----------|----------|---------------|------------------------|------|
| **Mock / seed JSON** | Yerel sahte transcript + metadata | N/A | ★★★★★ | ★ (yalnızca test) | Düşük |
| **Manuel export upload** | Plaud uygulamasından TXT/PDF export → POC upload endpoint | Resmi (kullanıcı aksiyonu) | ★★★★ | ★★ | Düşük |
| **Transcription API** (audio submit + poll) | Ham ses dosyası gönder, transkript al | Resmi (partner) | ★★★ | ★★★★ | Orta — audio kaynağı gerekir |
| **Webhook** (`transcription.completed`) | Push bildirim → transcript fetch | Resmi (Beta, partner kaydı) | ★★ | ★★★★ | Orta — erişim doğrulanmalı |
| **Plaud MCP / CLI** (topluluk) | `charathram/plaud-mcp`, `rggnkmp/plaud-connector` | Topluluk, resmi değil | ★★★★ | ★ | **Yüksek** — ToS, kırılganlık |
| **Plaud Embedded SDK** | BLE cihaz bağlama + cloud sync | Resmi (uzun vade) | ★ | ★★★★★ | Yüksek effort — mobil app |
| **Zapier bridge** | Plaud → webhook trigger | Resmi entegrasyon | ★★★ | ★★ | Orta — gecikme, sınırlı metadata |

**Faz 0 kararı (v1.1):** Birincil POC kaynağı = **`ApiPlaudAdapter` (sağlanan API key'ler)**. `MockPlaudAdapter` yalnızca unit test ve CI için. Manuel upload fallback olarak kalır.

### 2.2 PlaudProviderAdapter Tasarımı (Erken)

Tüm veri kaynaklarını tek arayüzde birleştir:

```typescript
interface PlaudProviderAdapter {
  /** Kaynak tanımlayıcı: mock | upload | mcp | api_poll | webhook */
  readonly source: string;

  /** Yeni kayıtları listele veya webhook ile al */
  listRecordings(since?: Date): Promise<PlaudRecordingRaw[]>;

  /** Tek kayıt detayı + transcript/summary */
  fetchRecording(providerId: string): Promise<PlaudRecordingRaw>;

  /** Webhook imza doğrulama (varsa) */
  verifyWebhook?(headers: Record<string, string>, body: string): boolean;
}

interface PlaudRecordingRaw {
  provider_recording_id: string;
  title?: string;
  recorded_at: string;          // ISO 8601
  duration_sec?: number;
  owner_hint?: string;          // Plaud hesap / cihaz sahibi
  transcript_text: string;
  summary_text?: string;
  template_type?: string;       // Plaud özet şablonu
  metadata: Record<string, unknown>;
  fetched_via: 'mock' | 'upload' | 'mcp' | 'api_poll' | 'webhook' | 'cli';
}
```

**İlk implementasyon sırası:** `MockPlaudAdapter` (test/CI) → **`ApiPlaudAdapter` (live demo)** → `UploadPlaudAdapter` (fallback)

### 2.3 Mock Dataset Spesifikasyonu

Faz 0'da üretilecek **5 adet** gerçekçi UK valuation transcript'i:

| # | Senaryo | Eşleştirme zorluğu | Amaç |
|---|---------|-------------------|------|
| T1 | Net adres + randevu saati ±30 dk | Yüksek confidence (≥0.90) | Mutlu yol demo |
| T2 | Postcode + sokak adı, tam adres yok | Orta (0.70–0.85) | Review queue demo |
| T3 | Yanlış property'ye yakın adres (komşu ev) | Düşük-orta, top-3 aday | Manuel seçim demo |
| T4 | Agent farklı, zaman ±6 saat | Düşük user_match | Unmatched inbox demo |
| T5 | Zengin proposal içeriği (motivasyon, fiyat, renovasyon) | Yüksek | AI extraction demo |

Her transcript için eşlik eden **seed CRM verisi** (mock Lifesycle adapter):

- 5 Property (adres, postcode, bedrooms, mevcut proposal draft)
- 5 Contact (ev sahibi adı)
- 5 Valuation appointment (tarih/saat, assigned user_id)
- 2 Company (multi-tenant izolasyon testi)

Mock dosya yapısı:

```
/fixtures/m4/
  transcripts/t1.json … t5.json
  crm/properties.json
  crm/contacts.json
  crm/appointments.json
  crm/users.json
  expected_matches.json      # golden test expectations
  expected_extractions.json  # golden AI output (review için)
```

### 2.4 Plaud Metadata Envanteri (Beklenen / Doğrulanacak)

Partner görüşmesi ve MCP spike sırasında doğrulanacak alanlar:

| Metadata | Eşleştirmede kullanım | Kaynak güveni |
|----------|----------------------|---------------|
| `recorded_at` | Appointment proximity (±4 saat penceresi) | Yüksek |
| `duration_sec` | Kalite sinyali | Orta |
| `title` / recording name | Property veya contact ipucu | Orta |
| `owner` / account email | User match | Yüksek (per-user modelde) |
| `device_id` | User ↔ cihaz eşlemesi | Orta |
| `template_type` | Valuation vs genel not ayrımı | Düşük-Orta |
| `summary` | AI extraction girdisi (transcript'ten kısa) | Yüksek |
| `transcript` | Tam metin extraction | Yüksek |
| `speaker_labels` | Ev sahibi vs agent ayrımı | Orta (varsa) |
| `geolocation` | Property proximity | Düşük (çoğu kayıtta yok) |

### 2.5 Hukuki ve Onay (Consent) Notları — Faz 0 Çıktısı

Mission başlamadan **Iceberg Digital / Lifesycle legal** ile netleştirilecek maddeler:

#### Kayıt Öncesi Onay (Recording Consent)

- UK GDPR ve PECR kapsamında, ev sahibi ile yapılan valuation görüşmesinin Plaud ile kaydedilmesi **açık rıza** gerektirir.
- Agent'a gösterilecek minimum onay metni taslağı (POC UI'da placeholder):
  > "Bu görüşme kalite ve doğruluk amacıyla kaydedilecektir. Kayıt yalnızca [Şirket Adı] tarafından property değerleme sürecinde kullanılacaktır."
- POC'ta consent checkbox'ı **zorunlu**; consent kaydı audit log'a yazılır.

#### Veri İşleme Amacı (Purpose Limitation)

- Transcript yalnızca property proposal ve valuation follow-up için işlenir.
- Pazarlama, model eğitimi veya üçüncü taraf paylaşımı **kapsam dışı** (POC ve production).

#### Saklama Politikası (Retention)

| Veri tipi | Önerilen POC saklama | Production önerisi |
|-----------|---------------------|-------------------|
| Ham transcript | 90 gün | 12 ay veya proposal kapanışı + 6 ay |
| AI extraction JSON | Proposal süresi boyunca | Aynı |
| Audit log (match/apply) | 1 yıl | 7 yıl (regülasyon doğrulanmalı) |
| Raw audio | POC'ta **saklanmaz** | Yalnızca açık onay + şifreli depolama |

#### Üçüncü Taraf İşlemciler

- **Plaud.ai** — transkripsiyon ve özet (ABD/Japonya bölgesi; EU "coming soon" riski)
- **LLM sağlayıcı** (OpenAI/Anthropic) — structured extraction
- Her biri için DPA (Data Processing Agreement) ve veri bölgesi (EU residency) Faz 2–3'te zorunlu.

#### Topluluk MCP/CLI Uyarısı

- Kişisel Plaud hesabından topluluk aracıyla veri çekmek **Plaud ToS ihlali riski** taşır.
- POC demo'sunda kullanılırsa: "topluluk aracı, resmi destek yok, production'da kullanılmaz" ibaresi zorunlu.
- Müşteri verisi içeren gerçek kayıtlar topluluk araçlarıyla işlenmemeli; yalnızca anonimleştirilmiş veya kendi test kayıtları.

### 2.6 Faz 0 Teslim Listesi

- [ ] Plaud erişim yolu matrisi (bu belgenin §2.1 güncel hali)
- [ ] `PlaudProviderAdapter` interface + `MockPlaudAdapter` iskeleti
- [ ] 5 mock transcript + seed CRM JSON
- [ ] Consent + retention taslağı (legal review bekliyor işaretiyle)
- [ ] Plaud partner escalation e-postası / ticket şablonu
- [ ] `RETRIEVAL.md` — retrieval dokümantasyonu taslağı

### 2.6 Git ve Push Disiplini (Zorunlu)

Her faz/hafta milestone'ı sonunda: testler yeşil → `git commit` → `git push origin main`. Aşamalar arasında birikmiş commit'siz kod bırakma. Detay: `shared/plans/SHARED_PLAN_CONSTRAINTS.md` §2.6

---

## 3. Faz 1 — 1 Ay: Plaud API Pipeline (Ingest → Match → Extract → Review → Apply)

**Süre:** 4 hafta (20 iş günü)  
**Hedef:** Resmi Plaud API olmadan uçtan uca Property Intelligence Pipeline'ı kanıtlamak.

### 3.1 Haftalık Sprint Planı

#### Hafta 1 — Temel Altyapı ve Ingest

| Gün | Görev | Çıktı |
|-----|-------|-------|
| 1–2 | Repo scaffold: `plaud-core` servisi, PostgreSQL şema, Docker Compose | Çalışan boş API |
| 2–3 | `MockPlaudAdapter` + `UploadPlaudAdapter` | `POST /api/plaud/ingest/mock`, `POST /api/plaud/ingest/upload` |
| 3–4 | `plaud_recordings`, `transcripts` tabloları + seed script | 5 kayıt DB'de |
| 4–5 | Transcript Inbox UI (liste: tarih, başlık, durum, confidence) | Agent inbox görünür |
| 5 | Mock CRM adapter (properties, appointments, contacts) | Eşleştirme girdileri hazır |

**Hafta 1 exit criteria:** Mock ingest → inbox'ta 5 kayıt listelenir.

#### Hafta 2 — Entity Matching

| Gün | Görev | Çıktı |
|-----|-------|-------|
| 1–2 | Weighted confidence scorer (§9) | `POST /api/plaud/recordings/:id/match` |
| 2–3 | Top-3 candidate UI + reason chips | "Neden bu property?" açıklaması |
| 3–4 | Eşik davranışları: auto-suggest / review / unmatched | 3 kuyruk durumu çalışır |
| 4–5 | Manuel hint: agent property seçerse score boost | `manual_hint` sinyali |
| 5 | Golden test: `expected_matches.json` ile unit test | CI'da matching testleri |

**Hafta 2 exit criteria:** T1–T4 senaryoları doğru kuyruğa düşer.

#### Hafta 3 — AI Extraction + Review UI

| Gün | Görev | Çıktı |
|-----|-------|-------|
| 1–2 | Extraction schema + Zod validate (§10) | `PropertyProposalExtraction` tipi |
| 2–3 | LLM prompt + structured output + healing retry | `POST /api/plaud/recordings/:id/extract` |
| 3–4 | Extraction Review UI: alan bazlı onay/red, evidence quote gösterimi | Diff görünümü |
| 4–5 | `ai_runs` + `proposal_extractions` audit tabloları | Her extraction izlenebilir |
| 5 | Düşük confidence alanlar otomatik "review required" | <0.70 alanlar kırmızı |

**Hafta 3 exit criteria:** T5'ten en az 7 alan çıkarılır; 4 alan agent tarafından onaylanır.

#### Hafta 4 — Apply, Timeline Entegrasyonu, Demo Polish

| Gün | Görev | Çıktı |
|-----|-------|-------|
| 1–2 | Apply service: onaylı alanlar → proposal draft | `POST /api/properties/:id/proposal-drafts/apply` |
| 2–3 | CRM Timeline adapter: `TimelineEvent` payload üret | `type: plaud_transcript` event |
| 3 | Idempotency: aynı recording iki kez apply edilemez | Duplicate guard |
| 4 | End-to-end demo script provası (§5) | 5 dk akış kesintisiz |
| 5 | Handover: README, `.env.example`, `TEST_PLAN.md`, `RETRIEVAL.md` | Demo submit paketi |

**Hafta 4 exit criteria:** Tam pipeline + handover paketi + demo provası tamamlandı.

### 3.2 Faz 1 Teknik Stack (Öneri)

| Katman | Seçim | Gerekçe |
|--------|-------|---------|
| API | Node.js + Express + TypeScript | Hızlı POC, Zod native |
| DB | PostgreSQL | JSONB (extractions), audit |
| Queue | BullMQ veya in-process (POC) | Extract job async |
| Matching | TypeScript deterministic scorer | Splink Faz 2'ye ertelenir |
| AI | OpenAI `response_format: json_schema` veya Anthropic structured | Schema garantisi |
| UI | React veya basit server-rendered | Review inbox + diff |
| CRM | Mock adapter (`CrmAdapter` interface) | Lifesycle API gelene kadar |

### 3.3 Faz 1 API Özeti

```
POST   /api/plaud/ingest/mock              # Fixture'tan yükle
POST   /api/plaud/ingest/upload            # Manuel export dosyası
GET    /api/plaud/inbox                    # Tüm kayıtlar (filtre: status)
GET    /api/plaud/recordings/:id           # Detay + transcript
POST   /api/plaud/recordings/:id/match     # Eşleştirme çalıştır
POST   /api/plaud/recordings/:id/match/confirm  # Agent property onayı
POST   /api/plaud/recordings/:id/extract   # AI extraction
GET    /api/plaud/review-queue             # Onay bekleyenler
POST   /api/plaud/review/:id/decide        # Alan bazlı approve/reject
POST   /api/plaud/recordings/:id/apply     # CRM'e yaz (onaylı alanlar)
GET    /api/properties/:id/timeline        # Mock timeline (entegrasyon noktası)
```

### 3.4 Faz 1 Veri Modeli

```sql
-- Plaud kayıtları
plaud_recordings (
  id UUID PK,
  provider_recording_id TEXT UNIQUE,
  company_id UUID,
  fetched_via TEXT,           -- mock|upload|mcp|api_poll|webhook
  title TEXT,
  recorded_at TIMESTAMPTZ,
  duration_sec INT,
  status TEXT,                -- pending|matched|extracted|reviewed|applied
  metadata_json JSONB,
  created_at TIMESTAMPTZ
);

transcripts (
  id UUID PK,
  recording_id UUID FK,
  text TEXT,
  summary TEXT,
  speaker_json JSONB,
  imported_at TIMESTAMPTZ
);

-- Entity eşleştirme
transcript_matches (
  id UUID PK,
  recording_id UUID FK,
  company_id UUID,
  user_id UUID,
  property_id UUID,
  contact_id UUID,
  confidence NUMERIC(4,3),      -- 0.000 – 1.000
  signals_json JSONB,           -- her sinyalin katkısı
  status TEXT,                  -- suggested|confirmed|rejected|unmatched
  decided_by UUID,              -- agent user_id
  decided_at TIMESTAMPTZ
);

-- AI çıkarım
ai_runs (
  id UUID PK,
  recording_id UUID FK,
  model TEXT,
  prompt_version TEXT,
  input_hash TEXT,
  output_json JSONB,
  status TEXT,                  -- success|failed|healed
  created_at TIMESTAMPTZ
);

proposal_extractions (
  id UUID PK,
  recording_id UUID FK,
  property_id UUID,
  ai_run_id UUID FK,
  fields_json JSONB,            -- §10 şeması
  review_status TEXT,           -- pending|partial|approved|rejected
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ
);

proposal_field_applications (
  id UUID PK,
  extraction_id UUID FK,
  field_key TEXT,
  old_value TEXT,
  new_value TEXT,
  applied_at TIMESTAMPTZ,
  applied_by UUID
);

-- Audit
audit_log (
  id UUID PK,
  entity_type TEXT,
  entity_id UUID,
  action TEXT,
  actor_id UUID,
  payload_json JSONB,
  created_at TIMESTAMPTZ
);
```

### 3.5 Faz 1 Kapsam Dışı (Bilinçli Ertelenenler)

- Gerçek Plaud OAuth / partner API entegrasyonu → Faz 2
- Splink probabilistic matching → Faz 2–3
- Plaud Embedded mobil SDK → Faz 3
- Production GDPR legal sign-off → Faz 3
- Multi-tenant şirket izolasyonu hardening → Faz 3
- Raw audio depolama → kapsam dışı

---

## 4. Demo Submit Checklist (Resmi Çıktılar)

Mission brief'teki üç resmi deliverable için submit öncesi kontrol listesi.

### 4.1 Entity Association Model ✓

- [ ] `ENTITY_MATCHING.md` — weighted confidence formülü, sinyal tanımları, eşik tablosu
- [ ] `MatchCandidate` ve `transcript_matches` şema dokümantasyonu
- [ ] 5 mock senaryo için beklenen eşleşme sonuçları (`expected_matches.json`)
- [ ] UI ekran görüntüleri: auto-suggest, review queue, unmatched inbox
- [ ] Manuel onay akışı sequence diagram
- [ ] "AI asla otomatik property bağlamaz" governance notu

### 4.2 Retrieval Documentation ✓

- [ ] `RETRIEVAL.md` — tam retrieval rehberi:
  - [ ] Plaud Developer Platform durumu (partner onboarding, EU region)
  - [ ] Resmi yollar: Transcription API, webhook, Embedded SDK
  - [ ] POC yolları: mock, upload, MCP/CLI (risk notlarıyla)
  - [ ] `PlaudProviderAdapter` interface ve implementasyon listesi
  - [ ] Webhook imza doğrulama (Faz 2 spike notları)
  - [ ] Bilinen kısıt: **consumer account pull resmi değil**
  - [ ] Partner escalation durumu ve ticket referansı
- [ ] API endpoint listesi + örnek request/response
- [ ] Ortam değişkenleri tablosu (`.env.example`)

### 4.3 Working POC ✓

- [ ] Çalışan uygulama (local Docker veya demo URL)
- [ ] `README.md` — kurulum, seed, demo komutları
- [ ] `TEST_PLAN.md` — §13 test senaryoları
- [ ] Mock dataset (`/fixtures/m4/`)
- [ ] 5 dakikalık demo video veya canlı demo script (§5)
- [ ] Known issues listesi
- [ ] Handover notu: main team'e devir adımları

### 4.4 Ek Kalite Kapıları

- [ ] Tüm AI apply işlemleri audit log'da
- [ ] Consent placeholder UI mevcut
- [ ] Hiçbir dosyada API key / secret yok
- [ ] "Mock-first" etiketi demo UI'da görünür (yanıltıcı iddia yok)

---

## 5. Demo Day Senaryosu

**Süre:** 5 dakika canlı demo + 2 dakika Q&A hazırlığı  
**Karakter:** Sarah — UK estate agent, Lifesycle kullanıcısı  
**Property:** 14 Oak Lane, SW19 3PQ, Wimbledon  
**Önkoşul:** T1 mock transcript seed'lenmiş; inbox'ta "pending match" durumunda.

### 5.1 Sahne Akışı (Dakika Dakika)

| Dakika | Sahne | Ekran | Anlatılacak |
|--------|-------|-------|-------------|
| 0:00–0:30 | **Problem** | Lifesycle property sayfası, boş proposal alanları | "Valuation sonrası agent 20+ alanı manuel dolduruyor; transkriptteki detaylar kaybolabiliyor." |
| 0:30–1:00 | **Ingest** | Plaud Inbox — yeni kayıt bildirimi | "Plaud kaydı pipeline'a düştü. Bugün mock adapter; mimari gerçek API'ye hazır." |
| 1:00–1:45 | **Match** | Top-3 property adayları + reason chips | "Sistem %92 confidence ile 14 Oak Lane öneriyor: randevu ±25 dk, postcode eşleşmesi, agent ID." |
| 1:45–2:15 | **Confirm** | Agent "Confirm match" tıklar | "Düşük confidence'da agent seçer; yüksek confidence'da bile otomatik bağlamıyoruz." |
| 2:15–3:15 | **Extract** | AI extraction review — 8 alan, evidence quotes | "AI seller motivation, asking expectation, renovations çıkardı — her alanın kaynak cümlesi görünür." |
| 3:15–4:00 | **Review** | 4 alan onayla, 1 alan reddet, 1 düzenle | "Human-in-the-loop: agent yanlış fiyat beklentisini reddediyor." |
| 4:00–4:30 | **Apply** | Proposal draft güncellendi + timeline event | "Onaylı alanlar proposal'a yazıldı; timeline'da Plaud özeti görünüyor." |
| 4:30–5:00 | **Kapanış** | Mimari diyagram + fallback notu | "Resmi Plaud consumer API henüz yok; pipeline kanıtlandı. Partner görüşmesi devam ediyor." |

### 5.2 Yedek Senaryolar (Demo Risk Azaltma)

| Risk | Yedek |
|------|-------|
| LLM API timeout | Önceden cache'lenmiş `expected_extractions.json` ile "replay" modu |
| UI bug | Terminal'den `curl` ile apply + timeline JSON göster |
| Matching yanlış sonuç | T2 veya T3 senaryosuna geç — "review queue" hikayesi daha etkileyici |
| İnternet yok | Tamamen offline mock + seed |

### 5.3 Demo'da Söylenmeyecekler

- ❌ "Plaud hesabından otomatik çekiyoruz" (resmi API yok)
- ❌ "AI proposal'ı otomatik tamamlıyor" (human onay şart)
- ❌ "Production'da hazır" (Faz 1 POC)
- ❌ Topluluk MCP'yi "resmi entegrasyon" olarak sunmak

### 5.4 Demo'da Vurgulanacaklar

- ✅ Entity matching + confidence şeffaflığı
- ✅ Evidence-backed AI extraction
- ✅ Human-in-the-loop governance
- ✅ `PlaudProviderAdapter` — vendor değişse pipeline aynı
- ✅ CRM timeline entegrasyon noktası hazır

---

## 6. Faz 2 — Gerçek Plaud API / MCP ve Partner Onboarding

**Süre:** Hafta 5–10 (6 hafta, Faz 1 ile kısmen örtüşebilir)  
**Önkoşul:** Plaud partner / early-access yanıtı veya Transcription API erişimi

### 6.1 Partner Onboarding Yol Haritası

```
Hafta 5:  Plaud developer portal kaydı (dev.plaud.ai)
          Partner başvuru formu + use case dokümanı gönder
Hafta 6:  Kickoff call — account model, webhook, metadata soruları
Hafta 7:  Sandbox API key + test audio upload
Hafta 8:  Webhook endpoint deploy + imza doğrulama
Hafta 9:  1 gerçek (anonimleştirilmiş) kayıt uçtan uca
Hafta 10: RETRIEVAL.md güncelle — resmi yol doğrulandı / reddedildi
```

**Partner başvurusunda vurgulanacak use case:**  
"B2B PropTech — UK estate agents record property valuations on Plaud devices; we need programmatic access to transcripts/summaries to populate CRM property proposals. Multi-tenant: per-agent account binding preferred."

### 6.2 Faz 2 Teknik Spike'ları

| Spike | Amaç | Başarı kriteri |
|-------|------|----------------|
| **Transcription API poll** | Audio submit → status poll → transcript | 1 kayıt başarıyla alındı |
| **Webhook ingest** | `transcription.completed` → fetch | <30 sn gecikme |
| **MCP adapter** | `McpPlaudAdapter` production-grade değil, demo | 1 gerçek kayıt inbox'a düştü |
| **OAuth prototype** | Per-user token (varsa) | 1 agent hesabı bağlandı |
| **Metadata enrichment** | device_id, template_type doğrulama | Matching skoruna yeni sinyal |

### 6.3 Faz 2 Mimari Güncellemeler

- `ApiPlaudAdapter` ve `WebhookPlaudAdapter` implementasyonları
- Webhook ingress: imza doğrulama, idempotency key, dead-letter queue
- `plaud_accounts` tablosu: `company_id`, `user_id`, `provider_user_id`, `auth_type`, `token_encrypted`, `status`
- Rate limit ve retry politikası (Plaud API limitleri partner dokümanından)
- EU data residency kontrolü — UK müşteri verisi US region'a gidiyorsa legal flag

### 6.4 Faz 2 Çıktıları

- Güncellenmiş `RETRIEVAL.md` (resmi yol durumu: ✅ / ⚠️ / ❌)
- `ApiPlaudAdapter` + integration testleri
- Partner görüşme notları ve karar logu
- Account model önerisi (§8) — partner yanıtına göre revize

---

## 7. Faz 3 — Production Multi-Tenant Plaud + Lifesycle Otomasyonu

**Süre:** Hafta 11+ (main team ile birlikte, Iceberg X sonrası)  
**Hedef:** Lifesycle production ortamında güvenli, ölçeklenebilir, GDPR-uyumlu otomasyon.

### 7.1 Production Mimari

```
                    ┌─────────────────────────────────┐
                    │     Lifesycle Production CRM     │
                    │  (Property, Contact, Proposal) │
                    └───────────────┬─────────────────┘
                                    │ CrmAdapter (resmi API)
                    ┌───────────────▼─────────────────┐
                    │      plaud-core (K8s / ECS)        │
                    │  ┌─────────┐ ┌─────────────────┐  │
                    │  │ Ingest  │ │ Review Service  │  │
                    │  │ Workers │ │ (agent UI)      │  │
                    │  └────┬────┘ └────────┬────────┘  │
                    │       │    Event Bus   │          │
                    │  ┌────▼────────────────▼────────┐  │
                    │  │ Match + Extract + Apply    │  │
                    │  └────────────────────────────┘  │
                    └───────────────┬─────────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              ▼                     ▼                     ▼
        Plaud API/OAuth      PostgreSQL (encrypted)   LLM (EU region)
```

### 7.2 Multi-Tenant Gereksinimler

| Gereksinim | Uygulama |
|------------|----------|
| Company izolasyonu | Tüm sorgular `company_id` ile scoped; row-level security |
| User attribution | `plaud_accounts.user_id` zorunlu; merkezi hesap yasak |
| Token güvenliği | OAuth refresh token KMS ile şifreli |
| Audit | Her match, extract, apply immutable log |
| Consent registry | `consent_records` tablosu, property/contact bazlı |
| Right to erasure | GDPR silme → transcript + extraction cascade delete |
| SLA | Ingest < 5 dk, extraction < 2 dk (p95) |

### 7.3 Ölçeklenebilir Matching (Faz 3)

- Haftalık 1000+ kayıt için **Splink** (Python microservice) veya batch dedupe
- `goldenmatch` (JS) hızlı ön filtre olarak kalabilir
- Öğrenilmiş ağırlıklar: onaylanan/reddedilen match'lerden feedback loop (opsiyonel)

### 7.4 Lifesycle Entegrasyon Derinliği

| Entegrasyon | Açıklama |
|-------------|----------|
| **Timeline API** | `TimelineEvent { type: 'plaud_transcript', provider: 'plaud', ... }` |
| **Proposal API** | Draft alanlarına suggested value yazma (yalnızca approved) |
| **Appointment webhook** | Yeni valuation → matching penceresi otomatik açılır |
| **Agent notification** | Unmatched / review queue push veya email |
| **Valuation workflow** | Proposal step'te "Import from Plaud" butonu |

### 7.5 Faz 3 Operasyon

- Monitoring: ingest lag, extraction failure rate, match confidence dağılımı
- Alerting: unmatched queue > 10, API error rate > 5%
- Runbook: Plaud outage → fallback upload UI
- Quarterly: retention purge job, consent audit

---

## 8. Account Model (Per-User vs Central)

### 8.1 Model Karşılaştırması

| Model | Açıklama | Artılar | Eksiler | Önerilen kullanım |
|-------|----------|---------|---------|-------------------|
| **A — Per-User OAuth** | Her agent kendi Plaud hesabını Lifesycle'a bağlar | GDPR uyumu, net sahiplik, doğru user_match | Kurulum sürtünmesi, OAuth henüz belirsiz | **Production hedefi** |
| **B — Per-Company Shared** | Şirket tek Plaud business hesabı, agent'lar alt kullanıcı | Operasyon basit | User attribution zayıf, cihaz→agent eşlemesi gerekir | Küçük ajanslar (5–10 agent) |
| **C — Central Iceberg/Demo** | Tek merkezi hesap, tüm kayıtlar oradan | Demo hızlı, tek entegrasyon | Multi-tenant privacy ihlali, eşleştirme zor | **Yalnızca POC/mock** |
| **D — Embedded SDK** | Plaud cihazı Lifesycle mobil/web app'e bağlanır | Resmi, metadata zengin | Mobil app geliştirme, yüksek effort | **Uzun vade (12+ ay)** |

### 8.2 Karar Ağacı

```
Plaud partner OAuth sunuyor mu?
├── EVET → Model A (Per-User OAuth) — production default
└── HAYIR
    ├── Embedded SDK erişimi var mı?
    │   ├── EVET → Model D planla (mobil spike)
    │   └── HAYIR
    │       ├── Company-level API key var mı?
    │       │   ├── EVET → Model B (geçici production)
    │       │   └── HAYIR → Model C yalnızca POC; production bloklu
```

### 8.3 POC → Production Geçiş Planı

| Aşama | Account model |
|-------|---------------|
| Faz 0–1 (POC) | Model C — mock + upload; opsiyonel MCP kişisel hesap |
| Faz 2 (spike) | Model A veya B test — partner yanıtına bağlı |
| Faz 3 (production) | Model A tercih; B kabul edilebilir; C **yasak** |

### 8.4 `plaud_accounts` Şeması

```sql
plaud_accounts (
  id UUID PK,
  company_id UUID NOT NULL,
  user_id UUID,                 -- NULL yalnızca company-shared modelde
  auth_type TEXT,               -- oauth|api_key|embedded|mock
  provider_user_id TEXT,
  access_token_enc TEXT,
  refresh_token_enc TEXT,
  token_expires_at TIMESTAMPTZ,
  status TEXT,                  -- active|revoked|expired
  connected_at TIMESTAMPTZ,
  UNIQUE(company_id, user_id, auth_type)
);
```

### 8.5 Cihaz → Agent Eşlemesi (Model B için)

Company-shared hesapta `device_id` → `user_id` mapping tablosu:

```sql
plaud_device_bindings (
  device_id TEXT PK,
  company_id UUID,
  user_id UUID,
  bound_at TIMESTAMPTZ,
  bound_by UUID
);
```

---

## 9. Entity Matching Algoritması ve Confidence Eşikleri

### 9.1 Eşleştirme Hedefi

```
PlaudRecording → Company (tenant) → User (agent) → Property (+ Contact)
```

Her kayıt için en az bir `Company` zorunlu (tenant context). `Property` ve `Contact` eşleştirmesi asıl değer üreten adımdır.

### 9.2 Sinyaller ve Ağırlıklar

**Birleşik formül (0.0 – 1.0):**

```
confidence = 0.25 × appointment_proximity
           + 0.25 × address_match
           + 0.20 × user_match
           + 0.15 × contact_name_match
           + 0.10 × recording_title_match
           + 0.05 × manual_hint
```

#### Sinyal Detayları

| Sinyal | Hesaplama | 1.0 koşulu | 0.0 koşulu |
|--------|-----------|------------|------------|
| **appointment_proximity** | En yakın valuation appointment'a zaman farkı | ±30 dakika | >8 saat veya appointment yok |
| **address_match** | Transcript'te geçen adres vs `Property.address` fuzzy (Jaro-Winkler + postcode exact) | Tam adres + postcode | Adres/postcode yok |
| **user_match** | Plaud `owner_hint` vs appointment `assigned_user_id` | Exact email/ID | Farklı agent |
| **contact_name_match** | Transcript'te geçen isim vs `Contact.full_name` | Tam isim | İsim geçmiyor |
| **recording_title_match** | Plaud title vs property address fragment | Substring match | İlgisiz başlık |
| **manual_hint** | Agent UI'da property seçtiyse | Seçim yapıldı | Seçim yok |

**appointment_proximity skor eğrisi:**

| Zaman farkı | Skor |
|-------------|------|
| 0–30 dk | 1.00 |
| 31–60 dk | 0.85 |
| 1–2 saat | 0.70 |
| 2–4 saat | 0.50 |
| 4–8 saat | 0.25 |
| >8 saat | 0.00 |

**address_match alt skorları:**

- Postcode exact match (UK format): +0.40 (toplam 1.0'a normalize)
- Street name fuzzy ≥0.90: +0.35
- House number match: +0.25

### 9.3 Eşik Tablosu ve Aksiyonlar

| Confidence | Kategori | Sistem davranışı | Agent aksiyonu |
|------------|----------|------------------|----------------|
| **≥ 0.85** | Yüksek | Top-1 öneri "Suggested match" olarak işaretlenir; **yine de** confirm butonu gösterilir | Tek tık confirm yeterli |
| **0.60 – 0.84** | Orta | Top-3 aday listelenir; reason chips zorunlu | Agent doğru property'yi seçer |
| **< 0.60** | Düşük | "Unmatched inbox" kuyruğu; bildirim | Manuel property arama + bağlama |

**Kırmızı çizgi:** Hiçbir eşikte otomatik property bağlama yapılmaz. ≥0.85 yalnızca UX'i hızlandırır.

### 9.4 Top-3 Candidate Üretimi

1. Aynı `company_id` altındaki tüm active property'ler için confidence hesapla
2. Skora göre sırala, top-3 döndür
3. Her aday için `signals_json` breakdown UI'da chip olarak göster:
   - `"Appointment: 25 min ago (0.95)"`
   - `"Postcode SW19 3PQ match (1.0)"`
   - `"Agent: Sarah Mitchell (1.0)"`

### 9.5 Adres ve İsim Çıkarımı (Pre-Match NLP)

Transcript'ten regex + LLM hafif çıkarım:

- UK postcode: `[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}`
- Adres kalıpları: `\d+\s+[\w\s]+(?:Road|Street|Lane|Avenue|Close)`
- İsim: "Mr/Mrs/Ms …" veya appointment contact adıyla fuzzy

Bu çıkarım `match` adımından önce `parse` içinde çalışır; ayrı AI call değil (maliyet/latency).

### 9.6 Ölçek Notu (Faz 3)

- <500 property/company: brute-force tüm property'lere skor — yeterli
- 500+: postcode ön filtresi → aday kümesi daralt
- 5000+: Splink batch linkage aylık retrain

### 9.7 Golden Test Beklentileri

| Transcript | Beklenen top-1 | Beklenen confidence | Kuyruk |
|------------|----------------|---------------------|--------|
| T1 | 14 Oak Lane | ≥0.90 | Suggested |
| T2 | Doğru property (postcode only) | 0.70–0.85 | Review |
| T3 | Komşu ev DEĞİL, doğru ev top-2/3 | 0.55–0.75 | Review |
| T4 | Unmatched veya düşük skor | <0.60 | Unmatched |
| T5 | 14 Oak Lane | ≥0.85 | Suggested (extraction odaklı) |

---

## 10. AI Extraction Şeması — Property Proposal Alanları

### 10.1 Tasarım İlkeleri

- Her alan: `value`, `confidence` (0–1), `evidence_quote` (transcript'ten birebir alıntı), `status` (suggested|approved|rejected)
- Zod / JSON Schema ile validate; geçersiz çıktıda healing retry (max 2)
- Düşük confidence alanlar (<0.70) UI'da varsayılan işaretli değil
- Boş alan `null` — uydurma yok

### 10.2 JSON Schema

```typescript
interface PropertyProposalExtraction {
  recording_id: string;
  property_id: string;
  extracted_at: string;
  model: string;
  prompt_version: string;

  fields: {
    property_condition: ProposalField<string>;
    seller_motivation: ProposalField<string>;
    asking_expectation: ProposalField<AskingExpectation>;
    timeline: ProposalField<string>;
    renovations: ProposalField<RenovationItem[]>;
    concerns: ProposalField<string[]>;
    follow_up_tasks: ProposalField<FollowUpTask[]>;

    // Genişletilmiş alanlar (Faz 2+)
    bedrooms_mentioned?: ProposalField<number>;
    key_features?: ProposalField<string[]>;
    competing_agents?: ProposalField<string[]>;
    valuation_context?: ProposalField<string>;
    missing_information?: ProposalField<string[]>;
  };
}

interface ProposalField<T> {
  value: T | null;
  confidence: number;           // 0.0 – 1.0
  evidence_quote: string | null;
  status: 'suggested' | 'approved' | 'rejected';
}

interface AskingExpectation {
  amount_gbp: number | null;
  qualifier: 'firm' | 'hopeful' | 'unknown';
  raw_phrase: string;
}

interface RenovationItem {
  area: string;                 // "kitchen", "roof", "garden"
  description: string;
  estimated_cost_gbp: number | null;
  urgency: 'immediate' | 'before_sale' | 'optional' | 'unknown';
}

interface FollowUpTask {
  title: string;
  due_in_days: number | null;
  assignee: 'agent' | 'vendor' | 'internal';
}
```

### 10.3 Zorunlu Çekirdek Alanlar (Mission Minimum)

| Alan | Açıklama | Örnek evidence |
|------|----------|----------------|
| `property_condition` | Genel durum, bakım | "The roof was replaced two years ago" |
| `seller_motivation` | Satış/verme nedeni | "Relocating to Manchester for work" |
| `asking_expectation` | Fiyat beklentisi | "Hoping for around £650,000" |
| `timeline` | Piyasaya çıkış zamanı | "Want to list before September" |
| `renovations` | Yapılması gereken işler | "Bathroom needs updating" |
| `concerns` | Endişeler | "Worried about stamp duty changes" |
| `follow_up_tasks` | Sonraki adımlar | "Send comparable sales for SW19" |

### 10.4 LLM Prompt Yapısı (Özet)

```
System: You extract structured property valuation insights from UK estate agent 
conversation transcripts. Output ONLY valid JSON matching the schema. 
Never invent facts. If not mentioned, set value null and confidence 0.
Include evidence_quote as exact substring from transcript.

User: 
Transcript: {{transcript_text}}
Property context: {{property_address}}, {{contact_name}}
Appointment date: {{appointment_date}}

Extract fields: property_condition, seller_motivation, asking_expectation, 
timeline, renovations, concerns, follow_up_tasks.
```

### 10.5 Validation ve Healing

1. LLM çıktısı → Zod parse
2. Başarısız → "Your previous output failed validation: {errors}. Fix and return valid JSON." (retry 1)
3. Hâlâ başarısız → `ai_runs.status = failed`; agent'a manuel giriş UI
4. `evidence_quote` transcript'te substring değilse → confidence ×0.5 penalty

### 10.6 Proposal Apply Mapping

| Extraction alanı | Lifesycle proposal draft alanı (mock) |
|------------------|--------------------------------------|
| `property_condition` | `proposal.condition_notes` |
| `seller_motivation` | `proposal.vendor_motivation` |
| `asking_expectation` | `proposal.price_expectation` |
| `timeline` | `proposal.marketing_timeline` |
| `renovations` | `proposal.improvements_json` |
| `concerns` | `proposal.vendor_concerns` |
| `follow_up_tasks` | CRM tasks API (dış entegrasyon) |

---

## 11. Privacy / GDPR

### 11.1 Veri Sınıflandırması

| Veri | Kategori | Özel kategori? | İşleme dayanağı |
|------|----------|----------------|-----------------|
| Transcript metni | Kişisel veri (ses → metin) | Hayır* | Meşru menfaat + consent |
| Ev sahibi adı/adres | Kişisel veri | Hayır | Sözleşme / consent |
| Sağlık/finans içeren cümleler | Potansiyel özel kategori | **Evet** | Açık rıza veya silme |
| Agent adı | Çalışan verisi | Hayır | Sözleşme |

\*Ses kaydı biyometrik olabilir; POC'ta raw audio işlenmez.

### 11.2 Teknik Kontroller

| Kontrol | POC | Production |
|---------|-----|------------|
| Transcript encryption at rest | DB disk encryption | AES-256 column-level |
| Transit TLS | Zorunlu | Zorunlu |
| Access control | Company scope | RBAC + RLS |
| PII in LLM prompt | UK property context only | EU region endpoint |
| Log redaction | Transcript loglanmaz | Otomatik PII mask |
| Retention job | Manuel | Scheduled purge |

### 11.3 Veri Sahibi Hakları

| Hak | Uygulama |
|-----|----------|
| Erişim | Agent transcript'i property sayfasından görür; export API Faz 3 |
| Düzeltme | Review UI'da agent düzeltir; apply öncesi |
| Silme | `DELETE /api/plaud/recordings/:id` → cascade transcript, extraction, audit |
| Taşınabilirlik | JSON export (Faz 3) |
| İtiraz | Consent withdraw → ingest durdur |

### 11.4 DPIA (Data Protection Impact Assessment)

Faz 2 başında tamamlanması önerilen DPIA başlıkları:

1. Otomatik profilleme yok — yalnızca öneri, karar agent'ta
2. LLM üçüncü taraf riski — prompt'ta minimum PII
3. Plaud bölge riski — US processing disclosure
4. Data breach runbook — 72 saat ICO bildirimi prosedürü

### 11.5 Consent UI Gereksinimleri (POC Minimum)

- Valuation başlamadan "Record with Plaud" toggle
- Consent metni linki (privacy policy)
- `consent_records(id, property_id, contact_id, consented_at, method, withdrawn_at)`

---

## 12. Fallback Plan — Plaud API Kısıtlı

### 12.1 Kritik Varsayım

> **Resmi consumer Plaud hesabından programatik veri çekme (pull) API'si 2026-06 itibarıyla mevcut değildir veya partner onayı gerektirir.**

Tüm fallback katmanları bu varsayıma göre sıralanmıştır. **Üst katman başarısız olsa bile demo ve POC değeri korunur.**

### 12.2 Fallback Katmanları (Öncelik Sırası)

```
Katman 1: Mock-first pipeline          ← HER ZAMAN ÇALIŞIR (Faz 1)
    ↓ (başarısız olmaz)
Katman 2: Manuel export upload         ← Agent Plaud app'ten export → POC upload
    ↓
Katman 3: Topluluk MCP/CLI             ← Demo opsiyonu; ToS riski; production YASAK
    ↓
Katman 4: Transcription API            ← Ham audio gerekir; partner API key
    ↓
Katman 5: Zapier bridge                ← Gecikmeli, sınırlı metadata
    ↓
Katman 6: Plaud Embedded SDK           ← 6–12 ay; mobil app
    ↓
Katman 7: Vendor-agnostic pipeline     ← Aynı pipeline; kaynak = Zoom transcript / 
                                         yüklenen ses dosyası / başka recorder
```

### 12.3 Katman Detayları

#### Katman 1 — Mock-First (Birincil)

- **Durum:** Varsayılan ve zorunlu
- **Demo:** %100 güvenilir
- **Mesaj:** "Pipeline kanıtlandı; veri kaynağı adaptör değiştirilebilir"

#### Katman 2 — Manuel Upload

- Agent Plaud mobil uygulamasından transcript export (TXT/PDF)
- POC `POST /api/plaud/ingest/upload` endpoint
- Metadata (tarih, başlık) manuel veya dosya adından parse
- **Artı:** Resmi, ToS güvenli
- **Eksi:** Otomasyon yok; agent eforu

#### Katman 3 — Topluluk MCP/CLI

- Repolar: `charathram/plaud-mcp`, `rggnkmp/plaud-connector`
- Kişisel Plaud hesabına bağlanır; transcript listeler
- **Artı:** Hızlı gerçek veri demosu
- **Eksi:** Resmi destek yok; ToS riski; kırılgan; multi-tenant imkansız
- **Kural:** Yalnızca intern test hesabı; müşteri verisi yok

#### Katman 4 — Transcription API

- Audio dosyası (Plaud'dan export veya başka kaynak) → Plaud Transcription API
- Async: submit → poll → result
- **Artı:** Resmi, ölçeklenebilir
- **Eksi:** Otomatik audio sync yok; partner key gerekir

#### Katman 5 — Zapier

- Plaud Zapier entegrasyonu → webhook trigger
- **Artı:** No-code, hızlı spike
- **Eksi:** Gecikme, sınırlı alan, Zapier maliyeti

#### Katman 6 — Embedded SDK

- Resmi uzun vade yolu; cihaz BLE bağlama
- Lifesycle companion app gerekir
- **Artı:** Tam metadata, resmi
- **Eksi:** 6–12 ay effort

#### Katman 7 — Vendor-Agnostic

- `PlaudProviderAdapter` yerine `TranscriptProviderAdapter`
- Aynı match → extract → review → apply pipeline
- Kaynak: Zoom AI Companion transcript, manuel ses upload + Whisper, vb.
- **Mesaj:** "Property Intelligence Pipeline Plaud'a bağımlı değil"

### 12.4 Fallback Karar Matrisi

| Durum | Aksiyon |
|-------|---------|
| Partner API 8 haftada gelmez | Demo Katman 1+2 ile devam; Faz 2 scope küçült |
| MCP çalışmaz | Katman 2 yeterli demo için |
| EU residency bloklar | US processing disclosure + legal onay |
| LLM çıktısı kötü | Cache'lenmiş golden extraction demo |
| CRM API yok | Mock adapter ile timeline JSON göster |

### 12.5 İletişim Mesajı (Stakeholder)

> "Plaud entegrasyonunun değeri entity matching, AI extraction ve human review pipeline'ında. Veri kaynağı **sağlanan Plaud API** (`ApiPlaudAdapter`); test/CI'da mock adaptör. Pipeline ve CRM entegrasyon noktası hazır."

---

## 13. Test Planı, Riskler ve Efor Tahmini

> **v1.1 ZORUNLU:** CI'da `PLAUD_MODE=mock` + `LLM_PROVIDER=mock`. Local demo `PLAUD_MODE=live` (sağlanan API key). Coverage ≥70%. Demo submit testler geçmeden tamamlanmış sayılmaz.

### 13.1 Test Planı

#### Unit Testler

| Test | Kapsam |
|------|--------|
| `appointment_proximity` skor eğrisi | Tüm zaman dilimleri |
| `address_match` postcode + fuzzy | UK format edge cases |
| `confidence` weighted sum | Bilinen input → beklenen output |
| Zod extraction validate | Geçerli/geçersiz JSON |
| `evidence_quote` substring check | Penalty uygulaması |
| Idempotency | Aynı `provider_recording_id` iki kez ingest |

#### Integration Testler

| Test | Kapsam |
|------|--------|
| Mock ingest → match → extract → apply | T1 uçtan uca |
| Review reject | Reddedilen alan apply edilmez |
| Unmatched queue | T4 doğru kuyrukta |
| Company isolation | Company A agent Company B transcript göremez |
| Audit log | Her apply kaydı var |

#### AI Testler

| Test | Kapsam |
|------|--------|
| Golden extraction T5 | ≥7 alan, ≥5 doğru |
| Invalid JSON retry | Healing başarılı |
| Hallucination guard | Transcript'te olmayan fiyat → null veya düşük confidence |
| Low confidence UI | <0.70 alanlar işaretli değil |

#### Manuel / Demo Testler

| # | Senaryo | Beklenen |
|---|---------|----------|
| D1 | Demo script 5 dk | Kesintisiz |
| D2 | Offline mod | Mock çalışır |
| D3 | LLM failover | Cached replay |
| D4 | Upload ingest | TXT dosyası kabul |
| D5 | Timeline görünüm | Plaud event property'de |

### 13.2 Risk Matrisi

| ID | Risk | Olasılık | Etki | Mitigasyon |
|----|------|----------|------|------------|
| R1 | Plaud consumer account pull resmi değil | **Yüksek** | Yüksek | Mock-first POC; partner escalation |
| R2 | Plaud partner API 3+ ay gecikme | Orta | Orta | Manuel upload + vendor-agnostic path |
| R3 | EU data residency (Plaud EU coming soon) | Orta | Yüksek | Legal review; US disclosure |
| R4 | AI hallucination → yanlış proposal | Orta | **Yüksek** | evidence_quote + human review + confidence threshold |
| R5 | Topluluk MCP ToS ihlali | Orta | Orta | Yalnızca test hesabı; production yasak |
| R6 | Lifesycle CRM API erişimi yok | Orta | Orta | Mock CrmAdapter; entegrasyon spec yaz |
| R7 | LLM maliyet / latency | Düşük | Orta | Summary-first extraction; cache |
| R8 | Matching yanlış property | Orta | **Yüksek** | ≥0.85 bile confirm; unmatched queue |
| R9 | GDPR consent eksikliği | Düşük | **Yüksek** | Consent UI POC; legal sign-off Faz 3 |
| R10 | Demo günü API outage | Orta | Orta | Offline mock + cached extraction |

### 13.3 Efor Tahmini (Kişi-Gün)

| Faz | Görev grubu | Gün |
|-----|-------------|-----|
| **Faz 0** | Keşif, mock data, legal taslak, adapter interface | 5 |
| **Faz 1 H1** | Scaffold, ingest, inbox UI | 5 |
| **Faz 1 H2** | Matching algoritma + UI | 5 |
| **Faz 1 H3** | AI extraction + review UI | 5 |
| **Faz 1 H4** | Apply, timeline, demo polish, handover | 5 |
| **Faz 2** | API/MCP spike, webhook, partner süreç | 10–15 |
| **Faz 3** | Production hardening (main team ile) | 30–45 |
| **Toplam POC (Faz 0–1)** | | **~25 kişi-gün** |
| **Toplam Faz 2** | | **~12 kişi-gün** |

*1 FTE intern × 4 hafta ≈ Faz 1; Faz 2 paralel yarım FTE.*

### 13.4 Definition of Done (Faz 1)

- [ ] Tüm §4 checklist maddeleri tamam
- [ ] `TEST_PLAN.md` senaryoları yeşil
- [ ] Demo script 2 kez başarıyla prova edildi
- [ ] Known issues dokümante
- [ ] Main team handover meeting planlandı

---

## 14. Dış Bağımlılıklar (External Dependencies Only)

Bu bölüm yalnızca M4'nün **dış dünyaya** bağımlılıklarını listeler. İç program, diğer mission'lar veya Iceberg X altyapısı dahil değildir.

### 14.1 Plaud.ai

| Bağımlılık | Tür | Kritiklik | Not |
|------------|-----|-----------|-----|
| Plaud Developer Platform (dev.plaud.ai) | Partner onboarding | **Kritik** (production) | Consumer pull henüz yok |
| Transcription API | REST | Yüksek | Audio submit + poll |
| Webhook (`transcription.completed`) | HTTP callback | Orta | Beta; partner kaydı |
| Plaud Embedded SDK | Mobile SDK | Düşük (Faz 3) | Uzun vade |
| Plaud support / partner channel | İnsan süreç | **Kritik** | Escalation |
| EU region availability | Altyapı | Yüksek (UK GDPR) | "Coming soon" riski |

### 14.2 Lifesycle CRM (Dış Entegrasyon)

| Bağımlılık | Tür | Kritiklik | Not |
|------------|-----|-----------|-----|
| Property API | REST | Yüksek | Mock ile başla |
| Contact API | REST | Orta | Matching için |
| Valuation appointment API | REST | Yüksek | Proximity sinyali |
| Proposal draft API | REST | Yüksek | Apply hedefi |
| Timeline / Activity API | REST | Yüksek | `plaud_transcript` event |
| OAuth / API key (Lifesycle) | Auth | Yüksek | Main team sağlar |

### 14.3 AI / LLM Sağlayıcı

| Bağımlılık | Tür | Kritiklik | Not |
|------------|-----|-----------|-----|
| OpenAI veya Anthropic API | Structured output | Yüksek | JSON schema mode |
| EU data processing endpoint | Region | Orta-Yüksek | GDPR |
| API key yönetimi | Secret | Yüksek | Env / vault |

### 14.4 Altyapı ve Araçlar

| Bağımlılık | Tür | Kritiklik | Not |
|------------|-----|-----------|-----|
| PostgreSQL | DB | Yüksek | POC local Docker |
| Object storage (Faz 3) | S3/GCS | Orta | Upload ingest |
| Secret manager (Faz 3) | KMS/Vault | Yüksek | OAuth tokens |

### 14.5 Hukuki / Organizasyonel

| Bağımlılık | Tür | Kritiklik | Not |
|------------|-----|-----------|-----|
| Iceberg Digital legal — consent metni | Onay | Yüksek | POC placeholder |
| DPIA onayı | Süreç | Yüksek (production) | Faz 2 |
| Plaud DPA | Sözleşme | Yüksek (production) | Partner sonrası |
| LLM DPA | Sözleşme | Yüksek (production) | OpenAI/Anthropic |

### 14.6 Topluluk Kaynakları (Opsiyonel, Doğrulanmış)

| Kaynak | Kullanım | Resmiyet |
|--------|----------|----------|
| `Plaud-AI/plaud-template-app` | Resmi transcription flow referans | Resmi |
| `Plaud-AI/plaud-sdk-public` | SDK örnekleri | Resmi |
| `charathram/plaud-mcp` | POC MCP adapter | Topluluk |
| `rggnkmp/plaud-connector` | POC connector | Topluluk |
| `moj-analytical-services/splink` | Faz 3 matching | Açık kaynak |
| `seatgeek/thefuzz` | Fuzzy string match | Açık kaynak |

**Doğrulanmadan kullanılmaması gerekenler:** `openplaud/openplaud`, `goldenmatch`, şüpheli star/commit iddialı repolar.

### 14.7 Bağımlılık Öncelik Sırası (Leadership Aksiyonları)

1. **Plaud partner / early-access görüşmesi başlat** — production için bloklayıcı
2. **Lifesycle internal API erişimi ve şema** — apply + timeline için
3. **GDPR / consent politikası onayı** — gerçek veri işlemeden önce
4. **LLM API key + EU region politikası** — extraction için
5. **Plaud EU region durumu takibi** — UK müşteri verisi

---

## Ek: Doküman Envanteri (M4 Handover)

| Dosya | Açıklama |
|-------|----------|
| `missions/m4-property-intelligence-pipeline/plans/DEMO_AND_ROADMAP_PLAN.md` | Bu belge |
| `RETRIEVAL.md` | Plaud veri alma rehberi |
| `ENTITY_MATCHING.md` | Eşleştirme algoritması |
| `EXTRACTION_SCHEMA.md` | AI çıkarım şeması |
| `PRIVACY_GDPR.md` | Gizlilik kontrol listesi |
| `TEST_PLAN.md` | Test senaryoları |
| `README.md` | Kurulum ve demo |
| `.env.example` | Ortam değişkenleri |
| `fixtures/m4/` | Mock dataset |

---

*Son güncelleme: 2026-06-21 — M4 Property Intelligence Pipeline demo ve yol haritası planı.*
