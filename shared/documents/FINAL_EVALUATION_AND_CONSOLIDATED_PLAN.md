# Iceberg X — 7 AI Rapor Değerlendirmesi ve Birleşik Master Plan

> **Hazırlanma tarihi:** 20 Haziran 2026  
> **Değerlendirilen kaynaklar:** Opus, Composer, Codex, Codex 5.5 Chrome, Grok, Grok Chrome, Gemini  
> **Yöntem:** Her dosya satır satır okundu; ortak doğrular, çelişkiler ve halüsinasyon riskleri işaretlendi.

---

## BÖLÜM 1 — AI BAŞINA DEĞERLENDİRME

### Puanlama Ölçeği (1–10)

| Boyut | Açıklama |
|-------|----------|
| **Araştırma Derinliği** | Kaynak sayısı, güncellik, ortak sentez kalitesi |
| **Teknik Doğruluk** | Zoom/Plaud/API iddialarının gerçekçiliği, risklerin dürüst yazılması |
| **Uygulanabilirlik** | POC → production path netliği, sprint/adım yapısı |
| **Mission Uyumu** | Resmi brief ile örtüşme, fazla scope creep yok |
| **Demo Etkisi** | Demo day'de etkileyici hikaye potansiyeli |
| **Handover Kalitesi** | README, env, known issues, main team devri |

---

### 1. Opus — **Genel: 9.2/10** 🥇

**Dosyalar:** `SHARED_RESEARCH_REPORT_opus.md` (303 satır), M1–M5 prompts, `EXECUTIVE_SUMMARY_opus.md`

**Güçlü yönler:**
- En dürüst ve en derin ortak araştırma. **Plaud "mevcut hesaptan veri çekme henüz yok"** bulgusu kritik ve doğru yönde.
- **Zoom Phone server-side outbound API yok** — Smart Embed + webhook ile sınırlı kaldığını net yazmış.
- Meeting SDK vs Video SDK vs REST karşılaştırması tablolu, kaynaklı.
- AI Companion transcript için **instance UUID** gereksinimi gibi ince detaylar var.
- Capability map 17 maddelik, etiketli (Possible Now / Not Possible / Escalate).
- M4 için Splink/goldenmatch entity matching + mock-first fallback mantıklı.
- M5 Cursor CLI/SDK + MCP — Iceberg workflow'a uygun.

**Zayıf yönler:**
- M1'de gamification/badge eksik (mission brief'te örnek POC seçenekleri var).
- Laravel stack varsayımı zayıf; Node ağırlıklı öneri Iceberg'in gerçek stack'i bilinmeden riskli.

**Puanlar:** Araştırma 10 | Doğruluk 10 | Uygulanabilirlik 9 | Mission 9 | Demo 9 | Handover 9

---

### 2. Codex 5.5 Chrome — **Genel: 8.8/10** 🥈

**Dosyalar:** `shared/research/codex5.5-chrome/` + mission research (SHARED 355 satır, M1–M5 en detaylı implementation prompts)

**Güçlü yönler:**
- Implementation prompt'ları **en uzun ve en yapılandırılmış** (M1: 251, M2: 257, M3: 271, M4: 263, M5: 237 satır).
- M1 **Evidence Vault + Readiness Score + Handover Generator** — program kalitesi odaklı, gamification tuzağına düşmemiş.
- M2 **Zoom Capability Lab** isimlendirmesi ve RTMS ayrımı net.
- M3 skorlu karşılaştırma tablosu (redirect 8/10, embed 8.5/10).
- M4 weighted confidence model + `PlaudProviderAdapter` interface — production path düşünülmüş.
- Executive Summary **3 fazlı yol haritası** (Demo → Handover → Production Spike) ve leadership decision listesi.

**Zayıf yönler:**
- Shared research Opus kadar Plaud kısıtını vurgulamıyor ("doğrulanmalı" diyor ama "hayır" demiyor).
- Bazı GitHub repo URL'leri şüpheli (`Plaud-Official/plaud-api-template-ts`, `zoom/zoomapps-advanded-sample-react` typo).

**Puanlar:** Araştırma 8 | Doğruluk 8 | Uygulanabilirlik 10 | Mission 9 | Demo 9 | Handover 10

---

### 3. Composer — **Genel: 8.5/10** 🥉

**Dosyalar:** `shared/research/composer/` + `missions/m*/research/composer/` (SHARED 483 satır)

**Güçlü yönler:**
- 30+ web araması iddiası, iyi kaynak formatı (İDDİA/KAYNAK/GÜVENİLİRLİK).
- **HubSpot/Salesforce precedent** — CRM+Zoom için industry benchmark değerli.
- Timeline `TimelineEvent` TypeScript interface — paylaşılabilir model.
- M1 haftalık sprint planı (3 hafta) pratik.
- M2 Docker Compose önerisi demo handover için iyi.
- Plaud EU region "coming soon" riski işaretlenmiş.

**Zayıf yönler:**
- Plaud "pull from account" kısıtı Opus kadar kesin değil; "partner onboarding gerekli" diyor.
- M4'te Fireflies alternatifi — mission brief Plaud odaklı, dikkat dağıtıcı olabilir.
- M5 çok kısa (127 satır), Cursor SDK kod örneği yüzeysel.

**Puanlar:** Araştırma 9 | Doğruluk 8 | Uygulanabilirlik 9 | Mission 8 | Demo 8 | Handover 8

---

### 4. Codex — **Genel: 8.3/10**

**Dosyalar:** `shared/research/codex/` + `missions/m*/research/codex/`

**Güçlü yönler:**
- Temiz, okunabilir governance: **AI output asla doğrudan CRM'e yazılmamalı**.
- Shared `ai_runs`, `ai_run_artifacts`, `human_review_status` tabloları — M1/M4/M5 ortak.
- M1: Submission Tracker + AI Review + Leadership Readiness — mission brief Option C+E+B birleşimi.
- M3: `start_url` encrypted, follow-up task entity — production düşünülmüş.
- AutoGen maintenance mode uyarısı — güncel.

**Zayıf yönler:**
- Shared research kısa (180 satır), Opus/Composer kadar derin değil.
- Grok ile neredeyse birebir aynı implementation prompt'lar (kopya riski).

**Puanlar:** Araştırma 7 | Doğruluk 9 | Uygulanabilirlik 9 | Mission 9 | Demo 8 | Handover 9

---

### 5. Gemini — **Genel: 7.0/10**

**Dosyalar:** `shared/research/gemini/FULL_RESEARCH_OUTPUT.md` (390 satır, tüm çıktılar tek dosyada)

**Güçlü yönler:**
- Çok detaylı Türkçe anlatım, karar matrisleri (M3 REST API 8.6, M4 webhook 9.1).
- Zoom OBF/ZAK, Call History API geçişi gibi **spesifik tarih/idam** referansları (doğrulanması gerekir).
- Lifesycle valuation workflow adım adım anlatılmış.
- Laravel 11 + PostgreSQL + Horizon stack önerisi tutarlı (varsayımsal).

**Zayıf yönler — ciddi:**
- **Halüsinasyon riski yüksek:** `openplaud/openplaud` (520 stars), `goldenmatch`, `donetick` gibi repo'lar ve star/commit tarihleri şüpheli; doğrulanmadan kullanılmamalı.
- M1 tamamen **gamification** (qcod/laravel-gamify, Habitica) — mission brief'in ana POC seçenekleri AI Mission Generator + Dashboard; gamification Option D, ana odak değil.
- M5 `@cursor/sdk` + Braintrust + GitHub Actions otomatik PR yorumu — iddialı, governance riski yüksek.
- "Uzair 2.0" gibi Iceberg iç ürün isimleri kamuya açık doğrulanmadı.
- Tek dosyada format bozuk (markdown birleşik, okunması zor).

**Puanlar:** Araştırma 7 | Doğruluk 5 | Uygulanabilirlik 7 | Mission 6 | Demo 9 | Handover 6

---

### 6. Grok — **Genel: 4.5/10** ❌

**Dosyalar:** `shared/research/grok/` + `missions/m*/research/grok/`

**Bulgu:**
- `SHARED_RESEARCH_REPORT_grok.md` **sadece 7 satır** — görev tamamlanmamış.
- `EXECUTIVE_SUMMARY_grok.md` ve M1–M5 prompts **Codex çıktısının kopyası** ("Grok versiyonu" etiketi eklenmiş).
- Bağımsız araştırma yok.

**Puanlar:** Araştırma 1 | Doğruluk 7* | Uygulanabilirlik 7* | Mission 7* | Demo 7* | Handover 7*  
*Codex'ten kopya olduğu için prompt kalitesi Codex ile aynı ama görev ihlali.

---

### 7. Grok Chrome — **Genel: 1.5/10** ❌

**Dosyalar:** `shared/research/grok-chrome/` + mission research

**Bulgu:**
- SHARED: 25 satır placeholder
- M1–M5: Her biri 6–19 satır, "## Bağlam / ## Hedef" iskeleti, içerik yok
- EXECUTIVE_SUMMARY: 5 satır

**Sonuç:** Kullanılamaz. Değerlendirmeye dahil edilmedi (birleşik planda).

---

## BÖLÜM 2 — KARŞILAŞTIRMALI PUAN TABLOSU

| AI | Araştırma | Doğruluk | Uygulanabilirlik | Mission | Demo | Handover | **ORTALAMA** |
|----|-----------|----------|------------------|---------|------|----------|--------------|
| **Opus** | 10 | 10 | 9 | 9 | 9 | 9 | **9.2** |
| **Codex 5.5 Chrome** | 8 | 8 | 10 | 9 | 9 | 10 | **8.8** |
| **Composer** | 9 | 8 | 9 | 8 | 8 | 8 | **8.5** |
| **Codex** | 7 | 9 | 9 | 9 | 8 | 9 | **8.3** |
| **Gemini** | 7 | 5 | 7 | 6 | 9 | 6 | **7.0** |
| **Grok** | 1 | 7* | 7* | 7* | 7* | 7* | **4.5** |
| **Grok Chrome** | — | — | — | — | — | — | **Diskalifiye** |

---

## BÖLÜM 3 — TÜM AI'LARDA ORTAK DOĞRU BULGULAR (Konsensüs)

Bu maddeler 4+ kaliteli raporda tekrarlanıyor — **birleşik planın temeli:**

1. **Vizyon:** 5 mission → **Lifesycle Communication & Intelligence Layer** + **Iceberg X Intelligence Layer** + **Agent Stack Accelerator**
2. **Öncelik sırası:** M2 (Zoom core) → M3 (CRM) → M4 (Plaud) paralel; M1 program yönetimi; M5 hızlandırıcı
3. **M3 MVP:** REST API meeting create + timeline log + redirect join **önce**; Meeting SDK embed **sonra** (wow factor)
4. **M2:** `zoom-integration-core` paylaşımlı servis; S2S OAuth + SDK JWT backend'de
5. **Zoom Phone:** Tam headless outbound call **mümkün değil**; Smart Embed / URI + webhook event
6. **M4:** Mock-first POC zorunlu; entity matching + human review asıl değer; AI auto-apply yasak
7. **AI governance:** Structured output + validate + human-in-the-loop her yerde
8. **Timeline ortak model:** Zoom meeting + Plaud transcript + manual note aynı `TimelineEvent`
9. **M5 brief hatalı** — çıkarımsal plan; mission brief gelince revize

---

## BÖLÜM 4 — KRİTİK ÇELİŞKİLER VE KARARLAR

| Konu | AI'lar arası fark | **Birleşik karar** |
|------|-------------------|-------------------|
| M1 odak | Gemini: gamification / Opus: AI generator+review / Codex5.5: evidence vault | **Opus + Codex5.5:** AI Mission Generator + Submission Tracker + Evidence Vault + Readiness Score. Badge hafta 3+ opsiyonel |
| M3 embed timing | Composer: hafta 2 / Opus: MVP link önce | **Link+timeline hafta 1, embed hafta 2** |
| Plaud API | Gemini: Embedded API tam / Opus: account pull yok | **Opus:** Resmi API kısıtlı; mock + MCP/CLI POC; Plaud partner görüşmesi başlat |
| M5 stack | Gemini: Cursor SDK+CI / Codex: OpenAI Agents SDK | **Hibrit:** Cursor CLI/SDK günlük dev + OpenAI Agents SDK orchestrator POC |
| Tech stack | Gemini: Laravel kesin / Opus: Node veya Laravel | **Adapter pattern:** POC Node (Zoom sample uyumu); production'da main team stack |

---

# BÖLÜM 5 — BİRLEŞİK MASTER PLAN (5 MİSSİON)

> Kaynak: Opus (araştırma doğruluğu) + Codex 5.5 Chrome (implementation detayı) + Composer (industry benchmark) + Codex (governance)

---

## Ortak Altyapı (Tüm Mission'lar)

```
┌─────────────────────────────────────────────────────────────────────────┐
│              Lifesycle Communication & Intelligence Layer                │
├──────────────┬──────────────┬──────────────┬──────────────────────────┤
│ zoom-core    │ plaud-core   │ ai-service   │ timeline-service           │
│ (M2→M3)      │ (M4)         │ (M1,M4,M5)   │ (M3,M4)                    │
├──────────────┴──────────────┴──────────────┴──────────────────────────┤
│ Shared: IntegrationAccount │ WebhookIngress │ EventQueue │ AuditLog      │
└─────────────────────────────────────────────────────────────────────────┘
         ▲                                    ▲
         │ manages                            │ accelerates
┌────────┴────────┐                  ┌────────┴────────┐
│ M1 Iceberg X    │                  │ M5 Agent Stack  │
│ Intelligence    │                  │ (scaffold+      │
│ Layer           │                  │  handover)      │
└─────────────────┘                  └─────────────────┘
```

### Ortak `TimelineEvent` Modeli

```typescript
interface TimelineEvent {
  id: string;
  subject_type: 'contact' | 'property' | 'valuation' | 'appointment';
  subject_id: string;
  provider: 'zoom' | 'zoom_phone' | 'plaud' | 'ai' | 'manual';
  event_type: string;  // meeting_created | meeting_ended | transcript_ingested | ...
  title: string;
  summary?: string;
  metadata: Record<string, unknown>;
  confidence_score?: number;      // M4 matching
  review_status?: 'pending' | 'approved' | 'rejected';
  occurred_at: string;
  actor_user_id: string;
}
```

### Ortak AI Service Kuralları

- Structured outputs (OpenAI parse / Anthropic output_config) + Zod/Pydantic validate
- Healing retry on validation failure
- **Asla** CRM/proposal alanına doğrudan yazma — review queue zorunlu
- `ai_runs` + `ai_run_artifacts` audit tabloları

### Ortak Risk Register (Top 5)

| # | Risk | Mitigasyon |
|---|------|------------|
| R1 | Plaud account data pull resmi değil | Mock POC + Plaud partner escalation |
| R2 | Zoom Phone headless call yok | Smart Embed + event-only automation |
| R3 | Lifesycle internal API bilinmiyor | Mock CRM adapter + main team interview |
| R4 | AI hallucination → yanlış property data | Confidence threshold + human review |
| R5 | GDPR/transcript consent | Consent UI + retention policy + audit |

---

## M1 — Iceberg X Intelligence Layer

### Hedef Ürün
R&D programının **kalite kontrol merkezi**: mission yönetimi, kanıt toplama, AI destekli planlama/review, demo readiness.

### Modüller (Öncelik sırasıyla)

| # | Modül | Kaynak AI | Sprint |
|---|-------|-----------|--------|
| 1 | **AI Mission Generator** | Opus A + Composer | Sprint 1 |
| 2 | **Evidence Vault** (iddia-kaynak formatı) | Codex5.5 | Sprint 1 |
| 3 | **Submission Tracker** + deliverable checklist | Codex C | Sprint 1 |
| 4 | **Mission Progress Dashboard** + mentor workload | Composer B | Sprint 2 |
| 5 | **AI Project Review Assistant** | Opus E | Sprint 2 |
| 6 | **Demo Readiness Score** | Codex5.5 | Sprint 2 |
| 7 | **Handover Checklist Generator** | Codex5.5 M5 | Sprint 2 |
| 8 | Badge/Gamification hooks | Gemini (opsiyonel) | Sprint 3 |

### Tech Stack
- **POC:** React + Vite + TypeScript + Node/Express + PostgreSQL
- **Production path:** Main team stack'e migrate (Laravel ise LaraCollab pattern)

### Demo Senaryosu
1. Admin "Plaud transcript CRM entegrasyonu" brief'i girer
2. AI mission taslağı üretir (M4'e bağlantılı!)
3. Intern evidence vault'a Zoom/Plaud kaynakları ekler
4. Intern submission yapar → AI review draft
5. Mentor onaylar → Readiness score %85 → Leadership dashboard'da "handover-ready"

### Kırmızı Çizgiler
- AI final karar vermez
- Production Iceberg X DB'sine yazma
- Gamification kaliteyi düşürmemeli

---

## M2 — Zoom Integration Core (`zoom-integration-core`)

### Hedef Ürün
**Zoom Capability Lab** — partner-level yetenek haritası + yeniden kullanılabilir servis.

### Mimari

```
zoom-integration-core/
├── auth/          # S2S OAuth token cache (1 saat)
├── meetings/      # REST create/read/update
├── sdk/           # JWT signature endpoint (HMAC-SHA256)
├── webhooks/      # verify + idempotent ingest
├── phone/         # Smart Embed feasibility + event adapter
├── recordings/    # transcript fetch (cloud + AI Companion UUID)
└── crm-adapter/   # TimelineEvent payload generator
```

### Capability Map (Özet — 17 özellik)

| Durum | Örnekler |
|-------|----------|
| ✅ Possible Now | REST create, SDK embed, click-to-call, webhook events, transcript (cloud) |
| ⚠️ Needs License | Video SDK, Smart Embed Phone, RTMS |
| ❌ Not Possible | Server-side outbound call, Meeting SDK full re-skin, AI bot via Meeting SDK |
| 📞 Escalate | Partner-only scopes, ISV custCreate |

### GitHub Temel Referanslar (Doğrulanmış)
1. `zoom/meetingsdk-auth-endpoint-sample` — signature
2. `zoom/meetingsdk-react-sample` — React embed
3. `zoom/webhook-sample` — webhook
4. `zoom/skills` — AI agent docs
5. `zoom/meetingsdk-web-sample` — Component vs Client View

### Demo Akışı
Create meeting → Component View join → webhook `meeting.ended` → transcript çek → Phone tab feasibility

### Sprint Planı
- **Hafta 1:** S2S OAuth + signature + meeting create
- **Hafta 2:** Embed + webhook + capability map
- **Hafta 3:** Phone Smart Embed + escalation doc + M3 handover

---

## M3 — Lifesycle Zoom Meeting Flow

### Hedef Ürün
Agent contact/property'den Zoom meeting → timeline → opsiyonel embed → follow-up.

### Karar Matrisi (Birleşik Skor)

| Yaklaşım | TTV | Production | UX Wow | **Karar** |
|----------|-----|------------|--------|-----------|
| A: Link redirect + timeline | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | **MVP — Hafta 1** |
| B: REST + Meeting SDK embed | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **Preferred — Hafta 2** |
| C: Video SDK custom room | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | Archive |

### Data Model (Mock CRM)

```
contacts, properties, appointments
zoom_meetings (valuation_id, join_url, status)
timeline_events (SHARED model)
follow_up_tasks (opsiyonel)
```

### API (M2 core'u tüketir)

- `POST /contacts/:id/meetings` → core create → TimelineEvent
- `POST /meetings/:id/embed-signature` → core proxy
- `POST /webhooks/zoom` → timeline update + transcript attach

### Agent UX Journey
1. Property valuation sayfası → "Schedule Zoom Meeting"
2. Topic auto: `Valuation call — {address}`
3. Meeting card + timeline event
4. Join (redirect veya embed slide-over)
5. Post-meeting: transcript pending → follow-up task draft

### M4 Bağlantısı
Aynı `TimelineEvent` tablosu — Zoom + Plaud yan yana valuation appointment'ta.

---

## M4 — Property Intelligence Pipeline

### Hedef Ürün
Plaud transcript → match → AI extract → human review → proposal auto-fill.

### Kritik Gerçek (Opus)
> Plaud Developer Platform var AMA mevcut consumer hesabından API ile veri çekme **resmi olarak henüz açık değil**.

### Pipeline

```
Ingest (webhook/poll/mock/CLI) → Parse → Entity Match → AI Extract → Review Queue → Apply
```

### Account Model
- **POC:** Central account + mock data + opsiyonel plaud-mcp/connector (ToS riski belirtilerek)
- **Production:** Per-user OAuth veya Plaud Embedded SDK (uzun vade)
- **Aksiyon:** Plaud partner/early-access görüşmesi başlat

### Entity Matching (Weighted)

```
confidence = 0.25×appointment_proximity + 0.25×address_match + 0.20×user_match 
           + 0.15×contact_name + 0.10×recording_title + 0.05×manual_hint
```

| Eşik | Aksiyon |
|------|---------|
| ≥ 0.85 | Suggested auto-link (yine review visible) |
| 0.60–0.85 | Manual confirmation required |
| < 0.60 | Unmatched inbox |

### Extraction Schema (Property Proposal)

`property_condition, seller_motivation, asking_expectation, timeline, renovations, concerns, follow_up_tasks` — her alan `confidence` + `evidence_quote` ile.

### GitHub Referanslar
1. `Plaud-AI/plaud-template-app` — resmi transcription flow
2. `charathram/plaud-mcp` / `rggnkmp/plaud-connector` — POC fallback (community)
3. `moj-analytical-services/splink` — ölçeklenebilir matching
4. `benseverndev-oss/goldenmatch` — hızlı JS matching (doğrula)

### Demo (Mock-first)
5 sahte valuation transcript → match UI → AI extract → 4 alan onay → timeline + proposal draft

---

## M5 — Agent Stack (Iceberg Dev Workflow Assistant)

### Hedef Ürün
Mission brief → POC scaffold + test plan + handover package (human review gate).

### Mimari (Hibrit)

| Katman | Teknoloji | Kaynak |
|--------|-----------|--------|
| Günlük dev | Cursor CLI + `.cursor/rules` + MCP | Opus |
| Orchestrator POC | OpenAI Agents SDK veya `@cursor/sdk` | Codex5.5 + Composer |
| Template registry | M1–M4 mission scaffolds | Codex5.5 |
| Governance | Human approval before write/merge | Tümü |

### Capability Map
1. Mission brief parser (P0)
2. POC scaffold generator — Zoom/Plaud/CRM templates (P0)
3. Handover doc generator — README, env, TEST_PLAN (P0)
4. Evidence/source format checker (P1)
5. PR review checklist (P1)
6. CI integration (P2 — production)

### Demo
Input: M2 brief → Output: `zoom-integration-core` iskelet + README + TEST_PLAN + HANDOVER.md (dry-run, human approve)

### Kırmızı Çizgiler
- Production merge yok
- Secret okuma yok
- Brief hatası açıkça etiketli

---

## BÖLÜM 6 — UYGULAMA TAKVİMİ (12 Hafta)

| Hafta | M2 | M3 | M4 | M1 | M5 |
|-------|----|----|----|----|-----|
| 1–2 | OAuth + signature + create | Mock CRM + timeline MVP | Mock pipeline + schema | Mission gen + evidence vault | Cursor rules + template v1 |
| 3–4 | Embed + webhook | Link flow polish | Matching algorithm | Submission tracker | Scaffold generator |
| 5–6 | Phone feasibility | SDK embed | AI extraction + review UI | AI review + readiness | Handover generator |
| 7–8 | Capability map final | Follow-up draft | Plaud API spike (real) | Dashboard + leadership | GitHub integration |
| 9–10 | M3 handover | Production adapter spec | Partner escalation | Demo polish | CI checklist (ops) |
| 11–12 | **Demo Day** — birleşik hikaye | | | | |

### Demo Day Birleşik Hikaye (60 saniye)

> "Bir estate agent Lifesycle'da contact açar, Zoom valuation call başlatır — meeting timeline'a düşer. Sahada Plaud ile konuşma kaydeder — transcript otomatik eşleşir, AI proposal alanlarını önerir, agent onaylar. Tüm bu R&D Iceberg X'te mission olarak yönetilir; AI mission üretir, evidence toplanır, handover paketi otomatik hazırlanır."

---

## BÖLÜM 7 — LEADERSHIP'TEN İSTENEN 6 KARAR

1. **Lifesycle internal API/şema erişimi** — M3/M4 production için
2. **Zoom developer + Partner hesap + Phone lisansı** — M2 demo
3. **Plaud partner/early-access görüşmesi** — M4 production
4. **M1: mevcut Iceberg X'e entegre mi, standalone POC mu?**
5. **M5: Cursor/API key politikası ve agent governance onayı**
6. **GDPR/transcript consent politikası** — M3/M4

---

## BÖLÜM 8 — KAYNAK AI HARİTASI (Hangi bölüm nereden)

| Plan Bölümü | Birincil Kaynak | İkincil |
|-------------|-----------------|---------|
| Ortak araştırma / riskler | Opus | Composer |
| M1 Evidence Vault | Codex 5.5 | Opus |
| M1 AI Generator + Review | Opus | Composer |
| M2 Capability map | Opus | Codex 5.5 |
| M2 RTMS ayrımı | Codex 5.5 | Codex |
| M3 Karar matrisi | Composer + Codex 5.5 | Opus |
| M3 Follow-up task | Codex | Codex 5.5 |
| M4 Plaud kısıtı | Opus | — |
| M4 Matching weights | Codex 5.5 | Composer |
| M4 Fallback plan | Opus | Codex |
| M5 Governance | Codex | Codex 5.5 |
| M5 Cursor SDK | Opus + Composer | — |
| Executive 3-phase roadmap | Codex 5.5 | Opus |
| Industry CRM precedent | Composer | — |

---

*Bu doküman 7 AI çıktısının satır satır okunması sonucu üretilmiştir. Grok Chrome diskalifiye; Grok eksik araştırma nedeniyle düşük puan. Birleşik plan için Opus + Codex 5.5 Chrome + Composer üçlüsü temel alınmıştır.*
