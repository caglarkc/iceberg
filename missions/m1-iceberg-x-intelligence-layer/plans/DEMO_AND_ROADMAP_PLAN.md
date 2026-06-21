# M1 — Iceberg X Intelligence Layer: Demo Submit ve Yol Haritası Planı

> **Mission:** Iceberg X Platform Improvement Research & POC  
> **Ürün vizyonu:** Iceberg X Intelligence Layer — R&D programının kalite kontrol merkezi  
> **Plan versiyonu:** 1.1  
> **Hazırlanma tarihi:** 21 Haziran 2026  
> **Kapsam:** Yalnızca M1 — demo submit (Ay 1) + post-demo yol haritası (Ay 2–12)  
> **Durum:** Araştırma tamamlandı; uygulama planı — handover-ready  
> **Plan v1.1 (21 Haz 2026):** Zoom credentials yok. LLM: **Gemini varsayılan**, OpenAI+Anthropic destekli `LlmService`. **Testler CI blocker zorunlu.** → `shared/plans/SHARED_PLAN_CONSTRAINTS.md`

---

## 1. Mission Özeti ve Demo Submit Hedefi

### 1.1 Resmi Mission Tanımı (Özet)

Iceberg X, Iceberg Digital içinde R&D mission'ları, staj görevleri, mentor atamaları, fikirler, ilerleme ve proje çıktılarını yöneten operasyonel platformdur. M1'in amacı yalnızca fikir önermek değil; mevcut R&D iş akışını analiz etmek, admin/mentor/intern ihtiyaçlarını anlamak ve **gerçekçi, çalışan bir POC** ile platform iyileştirmesini kanıtlamaktır.

### 1.2 Birleşik Vizyon: Iceberg X Intelligence Layer

Resmi brief'teki POC seçenekleri (A: AI Mission Generator, B: Progress Dashboard, C: Submission Tracker, E: AI Review Assistant) birleşik planda tek bir ürün hattına dönüştürülmüştür:

| Katman | Açıklama |
|--------|----------|
| **Planlama** | AI Mission Generator — kaba fikirden yapılandırılmış mission taslağı |
| **Kanıt** | Evidence Vault — iddia-kaynak formatında araştırma/delil arşivi |
| **Teslim** | Submission Tracker — repo, demo link, notlar, deliverable checklist |
| **Görünürlük** | Mission Progress Dashboard — durum, mentor yükü, blokaj vurgusu |
| **Kalite** | AI Review Assistant — güçlü/zayıf yönler, mentor feedback taslağı |
| **Karar desteği** | Demo Readiness Score — leadership için objektif hazırlık skoru |
| **Devir** | Handover Checklist Generator — README, env, test plan, known issues paketi |

**Kırmızı çizgiler (tüm fazlarda geçerli):**
- AI **asla nihai karar vermez** — tüm çıktılar `human_review_status` ile onay kuyruğundadır.
- POC, **production Iceberg X veritabanına yazmaz** — ayrı schema veya mock adapter.
- Gamification/badge sistemi kaliteyi düşürmemeli; Ay 1'de **kapsam dışı** (opsiyonel Ay 2+).

### 1.3 Demo Submit'te Kanıtlanması Gerekenler

Leadership'a sunulacak demo submit paketi şunları **uçtan uca çalışır** halde göstermelidir:

1. **Araştırma tamamlanmış:** Platform review, kullanıcı workflow analizi, önceliklendirilmiş iyileştirme listesi (dokümanlar).
2. **Seçilmiş POC çalışıyor:** Standalone web uygulaması; en az 6 modülden 5'i entegre akışta demo edilebilir (Badge hariç).
3. **AI entegrasyonu güvenli:** Structured output + schema validation + audit log (`ai_runs`, `ai_run_artifacts`).
4. **Gerçekçi senaryo:** "Plaud transcript CRM entegrasyonu" benzeri cross-mission brief'i ile mission üretimi → evidence → submission → AI review → readiness score → handover paketi.
5. **Production path net:** Technical proposal ile data model, API, entegrasyon noktaları ve productionise effort tahmini.

### 1.4 Demo Submit Başarı Kriterleri (Özet)

| Kriter | Hedef |
|--------|-------|
| Uçtan uca akış | Tek mission üzerinde 7 adımlık demo senaryosu kesintisiz |
| Modül kapsamı | 7 modülden 6'sı çalışır (Badge opsiyonel/deferred) |
| Dokümantasyon | Resmi brief'teki 7 deliverable tamam |
| AI governance | %100 AI çıktısı insan onayına tabi; audit trail mevcut |
| Handover | Main team 30 dk içinde local'de ayağa kaldırabilir |

---

## 2. Faz 0 — Hazırlık (Hafta 0, 2–3 Gün)

### 2.1 Hedef

Geliştirme öncesi kararları kilitlemek, repo iskeletini kurmak, erişimleri doğrulamak.

### 2.2 Ortam ve Repo

| Görev | Detay | Sorumlu | Süre |
|-------|-------|---------|------|
| Monorepo oluştur | `iceberg-x-intelligence-poc/` — `apps/web`, `apps/api`, `packages/shared` | Dev | 0.5 gün |
| Git branching | `main` (stable demo), `develop` (aktif) | Dev | 0.5 saat |
| Docker Compose | PostgreSQL 16, API, Web — tek komut `docker compose up` | Dev | 0.5 gün |
| CI skeleton | Lint + typecheck + unit test (GitHub Actions) | Dev | 0.5 gün |
| `.env.example` | Tüm secret placeholder'ları dokümante | Dev | 1 saat |

**Repo yapısı (hedef):**
```
iceberg-x-intelligence-poc/
├── apps/
│   ├── web/          # React + Vite + TypeScript + Tailwind
│   └── api/          # Node.js + Express + TypeScript
├── packages/
│   └── shared/       # Zod schemas, types, constants
├── docs/             # Araştırma deliverable'ları
├── docker-compose.yml
├── README.md
└── HANDOVER.md
```

### 2.3 Stack Kararları (Kilitli)

| Katman | Seçim | Gerekçe |
|--------|-------|---------|
| Frontend | React 18 + Vite 5 + TypeScript + Tailwind + shadcn/ui | Hızlı POC, component library, main team'e yakın |
| Backend | Node.js 20 + Express + TypeScript | Zoom/Lifesycle POC örnekleriyle uyum; adapter pattern |
| ORM | Drizzle ORM | Type-safe, migration basit |
| DB | PostgreSQL 16 | Production path (Laravel/Postgres) uyumu |
| AI | **LlmService** — varsayılan `gemini` (`GEMINI_API_KEY`); ayrıca `openai`, `anthropic`, `mock` (CI) | Structured outputs + Zod validate; bkz. `shared/plans/SHARED_PLAN_CONSTRAINTS.md` |
| Validation | Zod | Shared package'ta schema paylaşımı |
| Auth (POC) | Mock role switcher (Admin / Mentor / Intern) | Gerçek SSO Ay 2+ |

**Production path notu:** Main team Laravel kullanıyorsa Ay 2–3'te API katmanı LaraCollab pattern ile migrate edilir; frontend aynı kalır.

### 2.4 Erişim ve Onay Gereksinimleri

| Erişim | Amaç | Blocker mı? | Fallback |
|--------|------|-------------|----------|
| `GEMINI_API_KEY` (+ opsiyonel OpenAI/Anthropic) | Mission gen + review | Evet (Gemini) | `LLM_PROVIDER=mock` ile API'siz geliştirme |
| Mevcut Iceberg X staging URL + ekran görüntüleri | Platform review dokümanı | Hayır | Public demo + mentor görüşmesi |
| Iceberg X DB schema dokümantasyonu | Entegrasyon spec | Hayır | Mock entity'ler |
| Leadership kararı: standalone vs entegre POC | Mimari yön | Hayır (Ay 1) | Standalone default |
| GitHub org repo oluşturma izni | Handover | Evet | Personal repo → transfer |

### 2.5 Faz 0 Definition of Done

- [ ] `docker compose up` ile web (localhost:5173) + API (localhost:3001) + Postgres ayakta
- [ ] Health check: `GET /api/health` → `{ status: "ok" }`
- [ ] Mock auth: UI'da rol değiştirici çalışıyor
- [ ] Migration v001: core tablolar oluşturulmuş
- [ ] `docs/PLATFORM_REVIEW.md` taslağı başlatılmış (mevcut Iceberg X analizi)
- [ ] Risk register dokümanı oluşturulmuş

### 2.6 Faz 0 Riskleri

| Risk | Olasılık | Etki | Mitigasyon |
|------|----------|------|------------|
| Iceberg X staging erişimi yok | Orta | Platform review eksik | Mentor/admin 30 dk walkthrough kaydı |
| OpenAI key gecikmesi | Düşük | AI modülleri blok | Mock AI responses ile parallel dev |
| Main team stack belirsiz | Orta | Production path belirsiz | Adapter pattern; TECH_PROPOSAL'da iki senaryo |

---

## 3. Faz 1 — 1 Aylık Demo Submit Planı

**Toplam süre:** 4 hafta (20 iş günü)  
**Demo submit deadline:** Hafta 4 Cuma EOD  
**Modül öncelik sırası:** AI Mission Generator → Evidence Vault → Submission Tracker → Progress Dashboard → AI Review Assistant → Demo Readiness Score → Handover Generator

---

### Hafta 1 — Temel Altyapı + Planlama Modülleri

**Tema:** "Mission yarat, kanıt topla"

#### Hedefler
- Core data model ve CRUD API'leri
- AI Mission Generator uçtan uca
- Evidence Vault MVP (iddia-kaynak formatı)
- Admin mission oluşturma/düzenleme UI

#### Deliverables

| Tür | Somut çıktı |
|-----|-------------|
| **Ekranlar** | `/missions` listesi, `/missions/new` (AI generator form), `/missions/:id` detay, `/missions/:id/evidence` vault |
| **API** | `POST /api/missions/generate`, `CRUD /api/missions`, `CRUD /api/missions/:id/evidence` |
| **AI** | Mission generation prompt + Zod schema; `ai_runs` audit |
| **Docs** | `docs/PLATFORM_REVIEW.md` v1, `docs/USER_WORKFLOW_ANALYSIS.md` v1, `docs/IMPROVEMENT_IDEAS.md` v1 |

#### Modül Detayı

**AI Mission Generator**
- Input: kaba fikir (textarea, min 20 karakter), opsiyonel kategori ipucu
- Output (structured): `title`, `description`, `context`, `problem_statement`, `expected_deliverables[]`, `difficulty_level` (1–5), `category`, `estimated_weeks`, `suggested_skills[]`
- UX: streaming değil — generate → preview → edit → save
- Admin tüm alanları düzenleyebilir; AI badge "AI-generated draft" gösterir

**Evidence Vault**
- Her evidence kaydı: `claim` (iddia), `source_type` (url | document | screenshot | meeting | manual), `source_url`, `source_title`, `reliability` (high | medium | low | unverified), `notes`, `created_by`
- Mission'a bağlı; intern ve admin ekleyebilir
- Liste görünümü: iddia + kaynak linki + güvenilirlik badge

#### Hafta 1 Definition of Done (Demo Submit parçası)
- [ ] Admin kaba fikir girer → AI mission taslağı üretilir → kaydedilir
- [ ] Kaydedilen mission'a en az 3 evidence eklenebilir
- [ ] Tüm AI çağrıları `ai_runs` tablosunda loglanır
- [ ] Platform review dokümanı 4 kullanıcı rolünü kapsar

#### Hafta 1 Kapsam Dışı
- Submission flow
- Dashboard aggregations
- Readiness score
- Gerçek Iceberg X SSO/entegrasyon
- Badge/gamification

---

### Hafta 2 — Teslim + Görünürlük

**Tema:** "Teslim et, ilerlemeyi gör"

#### Hedefler
- Submission Tracker + deliverable checklist
- Mission Progress Dashboard (mentor workload dahil)
- Mentor review queue (submission listesi, henüz AI review yok)
- Notification stub (in-app only)

#### Deliverables

| Tür | Somut çıktı |
|-----|-------------|
| **Ekranlar** | `/missions/:id/submit` (intern form), `/submissions` (mentor queue), `/dashboard` (admin/leadership) |
| **API** | `POST /api/missions/:id/submissions`, `GET /api/submissions`, `PATCH /api/submissions/:id/status`, `GET /api/dashboard/summary` |
| **Docs** | `docs/USER_WORKFLOW_ANALYSIS.md` v2 (mentor + intern akışları doğrulanmış) |

#### Modül Detayı

**Submission Tracker**
- Intern submit eder: `repo_url`, `demo_url`, `video_url` (opsiyonel), `notes`, `deliverable_checklist[]` (mission'daki expected_deliverables'dan türetilir)
- Durum makinesi: `draft` → `submitted` → `under_review` → `revision_requested` → `approved`
- Her submission'da checklist item: `{ name, completed, evidence_link? }`
- Mentor: status değiştir + serbest metin feedback (AI review Hafta 3'te)

**Mission Progress Dashboard**
- Kart/grid görünümü: mission adı, status, difficulty, category, assigned mentor, intern, son aktivite
- Filtreler: status, category, difficulty, mentor, "blocked" (7+ gün aktivite yok)
- Mentor workload paneli: mentor başına aktif mission sayısı, bekleyen submission sayısı
- Leadership özeti: toplam mission, submitted this week, blocked count, avg readiness (Hafta 3'te dolar)

#### Hafta 2 Definition of Done
- [ ] Intern submission yapar; checklist tamamlanmadan submit engellenir (soft warning, hard block opsiyonel)
- [ ] Mentor submission queue'da görür ve status günceller
- [ ] Dashboard en az 5 mock mission ile filtreleme/ gruplama gösterir
- [ ] Improvement ideas listesi 15+ fikir, POC uygunluk etiketi ile

#### Hafta 2 Kapsam Dışı
- AI review generation
- Readiness score hesaplama
- Handover PDF/export
- Slack/email bildirimleri
- Gerçek zamanlı websocket updates

---

### Hafta 3 — AI Kalite Katmanı

**Tema:** "AI destekli review ve hazırlık skoru"

#### Hedefler
- AI Project Review Assistant
- Demo Readiness Score algoritması + UI
- Human review workflow (approve/reject/edit AI output)

#### Deliverables

| Tür | Somut çıktı |
|-----|-------------|
| **Ekranlar** | `/submissions/:id/review` (AI review panel + mentor actions), mission detayda readiness score badge |
| **API** | `POST /api/submissions/:id/ai-review`, `GET /api/submissions/:id/ai-review`, `PATCH /api/ai-reviews/:id`, `GET /api/missions/:id/readiness` |
| **AI** | Review prompt: strengths, weaknesses, review_questions[], suggested_feedback, risk_flags[] |
| **Docs** | `docs/TECHNICAL_PROPOSAL.md` v1 |

#### Modül Detayı

**AI Project Review Assistant**
- Trigger: submission status `submitted` olduğunda otomatik draft VEYA mentor "Generate AI Review" butonu
- Input context: mission brief + evidence vault entries + submission content (repo URL metadata mock — title/description manual)
- Output: structured review draft; mentor edit eder → "Publish Feedback" ile intern'e görünür
- `human_review_status`: `pending` → `approved` | `rejected` | `edited`

**Demo Readiness Score (0–100)**
- Bileşenler ve ağırlıklar:

| Bileşen | Ağırlık | Hesaplama |
|---------|---------|-----------|
| Deliverable checklist tamamlanma | 25% | completed / total |
| Evidence kalitesi | 20% | high=1, medium=0.7, low=0.4, unverified=0.2 ortalaması |
| Submission tamlığı | 15% | repo + demo + notes dolu mu |
| AI review risk flags | 15% | kritik flag varsa düşür |
| Mentor approval status | 15% | approved=1, revision=0.5, other=0 |
| Dokümantasyon (README link) | 10% | repo'da README var mı (manual checkbox POC) |

- Skor renk kodu: ≥85 yeşil "Handover-ready", 60–84 sarı "Needs work", <60 kırmızı "Not ready"
- Leadership dashboard'da skor sıralaması

#### Hafta 3 Definition of Done
- [ ] AI review submission için üretilir; mentor onaylamadan intern görmez
- [ ] Readiness score en az 3 farklı mission durumunda doğru farklılaşır (test senaryoları)
- [ ] Technical proposal: data model, API listesi, Iceberg X entegrasyon noktaları
- [ ] Tüm AI output'ları `ai_run_artifacts` tablosunda JSON olarak saklanır

#### Hafta 3 Kapsam Dışı
- Handover doc auto-generation (Hafta 4)
- Otomatik GitHub repo analizi (README detection manual)
- Multi-submission versioning
- Production Iceberg X API entegrasyonu

---

### Hafta 4 — Handover + Demo Submit Paketi

**Tema:** "Devir paketi üret, demo'yu cilala"

#### Hedefler
- Handover Checklist Generator
- Seed data + demo senaryo script
- Tüm resmi deliverable'ların finalizasyonu
- Demo video kaydı + screenshots

#### Deliverables

| Tür | Somut çıktı |
|-----|-------------|
| **Ekranlar** | `/missions/:id/handover` — preview + export markdown |
| **API** | `POST /api/missions/:id/handover/generate`, `GET /api/missions/:id/handover` |
| **Export** | `HANDOVER.md`, `README.md`, `TEST_PLAN.md`, `.env.example` otomatik doldurulmuş |
| **Docs** | Tüm 7 resmi deliverable final; `docs/FINAL_RECOMMENDATION.md` |
| **Media** | 5–8 screenshot, 3–5 dk demo video, `docs/DEMO_SCRIPT.md` |

#### Modül Detayı

**Handover Checklist Generator**
- Input: mission + evidence + submission + AI review + readiness breakdown
- Output sections (markdown):
  1. Project summary
  2. Architecture overview
  3. Setup instructions (step-by-step)
  4. Environment variables
  5. API endpoint summary
  6. Known issues / limitations
  7. Test plan checklist
  8. Production integration checklist
  9. Evidence/source bibliography
- Mentor/admin preview → edit → "Export" (markdown download + clipboard)
- AI-assisted narrative; structured template Zod ile validate

#### Hafta 4 Definition of Done (DEMO SUBMIT FINAL)
- [ ] 7 modülden 6'sı uçtan uca demo senaryosunda çalışır
- [ ] Handover generator en az 1 mission için export üretir
- [ ] `docker compose up` + README ile sıfırdan kurulum ≤15 dk
- [ ] Resmi brief'teki 7 dokümant deliverable tamamlandı
- [ ] Demo video kaydedildi
- [ ] Known issues listesi dürüst ve eksiksiz
- [ ] Leadership sunumu için 5–10 dk demo script hazır

#### Hafta 4 Kapsam Dışı (Ay 1 genel)
- Badge & Achievement System
- Slack notification integration
- Mission Recommendation Engine
- R&D Analytics Dashboard (temel dashboard var; advanced analytics yok)
- Production deployment / Iceberg X merge
- Multi-tenant / gerçek kullanıcı yönetimi
- Mobile responsive polish (temel responsive yeterli)
- i18n (İngilizce UI yeterli; Türkçe docs ayrı)

---

## 4. Demo Submit Paketi Checklist

Leadership ve resmi brief'in beklediği **tam artifact listesi:**

### 4.1 Araştırma Deliverable'ları

| # | Artifact | Dosya yolu | Min. içerik |
|---|----------|------------|-------------|
| 1 | Platform Review Document | `docs/PLATFORM_REVIEW.md` | Roller, workflow, güçlü yönler, limitasyonlar, UX sorunları, otomasyon/depthrsatları |
| 2 | User Workflow Analysis | `docs/USER_WORKFLOW_ANALYSIS.md` | Admin, Mentor, Intern, Leadership — ihtiyaçlar, aksiyonlar, pain points, öneriler |
| 3 | Improvement Ideas List | `docs/IMPROVEMENT_IDEAS.md` | ≥15 fikir; feature name, description, target user, value, difficulty, backend/frontend changes, POC suitability |
| 4 | Final Recommendation | `docs/FINAL_RECOMMENDATION.md` | İlk build önerisi, quick wins, derin planlama gerektirenler, kaçınılacaklar, evrim vizyonu |

### 4.2 Teknik Deliverable'lar

| # | Artifact | Dosya yolu | Min. içerik |
|---|----------|------------|-------------|
| 5 | Working Demo | `apps/web` + `apps/api` | Docker ile çalışır; seed data |
| 6 | Technical Proposal | `docs/TECHNICAL_PROPOSAL.md` | Data model, API endpoints, frontend pages, permissions, Iceberg X integration points, risks, production effort |
| 7 | README | `README.md` | Setup, usage, architecture diagram, demo credentials |

### 4.3 Handover ve Demo Medya

| # | Artifact | Dosya yolu | Min. içerik |
|---|----------|------------|-------------|
| 8 | Handover doc | `HANDOVER.md` | Env, known issues, main team devralma adımları |
| 9 | Test plan | `TEST_PLAN.md` | Manuel test senaryoları, acceptance criteria |
| 10 | Screenshots | `docs/screenshots/` | 5–8 adet: dashboard, mission gen, evidence, submission, AI review, readiness, handover |
| 11 | Demo video | `docs/demo/demo-recording.mp4` veya link | 3–5 dk; sesli anlatım |
| 12 | Demo script | `docs/DEMO_SCRIPT.md` | Adım adım, konuşma metni, beklenen ekran |
| 13 | Environment template | `.env.example` | Tüm değişkenler açıklamalı |

### 4.4 Demo Submit Öncesi Final Kontrol

```
[ ] docker compose up — hatasız
[ ] npm test — geçiyor (unit + integration smoke)
[ ] Seed data ile demo senaryosu 10 dk'da tamamlanıyor
[ ] AI key olmadan mock mode çalışıyor
[ ] Tüm docs son review'dan geçti
[ ] Git tag: v0.1.0-demo-submit
[ ] Leadership'e email/slack: repo link + video link + 1 paragraf özet
```

---

## 5. Demo Day Senaryosu (5–10 Dakika)

**Senaryo adı:** "Plaud Transcript CRM Entegrasyonu — Mission Lifecycle"  
**Sunucu rolü:** Admin (mission creator) → Intern (executor) → Mentor (reviewer) → Leadership (dashboard viewer)  
**Önkoşul:** Seed data temizlenmiş; demo mission oluşturulacak

### Adım 1 — Problem Tanımı (30 sn)
> "Iceberg X'te R&D mission'ları büyüdükçe kanıt toplama, teslim takibi ve demo hazırlığı dağınık kalıyor. Intelligence Layer bunu tek akışta topluyor."

### Adım 2 — AI Mission Generator (90 sn)
1. Admin olarak giriş → `/missions/new`
2. Kaba fikir gir: *"Plaud kayıt cihazından gelen transcript'leri Lifesycle CRM'deki property valuation görüşmeleriyle eşleştir"*
3. "Generate with AI" → 3 sn bekle
4. Oluşan mission taslağını göster: title, problem statement, deliverables, difficulty
5. Küçük edit → Save
6. **Vurgu:** "AI taslak üretir; admin onaylar ve düzenler."

### Adım 3 — Evidence Vault (90 sn)
1. Mission detay → Evidence sekmesi
2. 3 evidence ekle:
   - İddia: "Plaud Developer Platform resmi API kısıtlı" — Kaynak: research doc URL — Reliability: High
   - İddia: "Entity matching weighted confidence model önerildi" — Kaynak: internal doc — Reliability: Medium
   - İddia: "Mock-first POC zorunlu" — Kaynak: manual — Reliability: High
3. **Vurgu:** "Her iddianın kaynağı var — halüsinasyon kontrolü."

### Adım 4 — Intern Submission (90 sn)
1. Intern rolüne geç → mission'a assign (önceden seed)
2. `/missions/:id/submit` — repo URL, demo URL, notlar
3. Deliverable checklist'i işaretle (4/5)
4. Submit
5. **Vurgu:** "Teslim yapılandırılmış; checklist eksik teslimi engelliyor."

### Adım 5 — AI Review + Mentor Onay (2 dk)
1. Mentor rolü → submission queue
2. "Generate AI Review" → strengths, weaknesses, suggested feedback göster
3. Mentor feedback'i edit et → Approve → Publish
4. **Vurgu:** "AI mentor'a taslak verir; nihai feedback insandan."

### Adım 6 — Readiness Score + Dashboard (90 sn)
1. Mission detay → Readiness Score: **%85 — Handover-ready** (yeşil)
2. Leadership dashboard → mission listesi, blocked highlight, mentor workload
3. Skor breakdown modal: checklist %, evidence quality, mentor approval
4. **Vurgu:** "Leadership objektif hazırlık görür."

### Adım 7 — Handover Generator (90 sn)
1. `/missions/:id/handover` → Generate
2. Preview: README, setup, env, known issues, test plan sections
3. Export markdown → indir
4. **Vurgu:** "Main team'e devir paketi dakikalar içinde."

### Kapanış (30 sn)
> "Bu POC standalone çalışıyor; production'da Iceberg X API adapter ile entegre edilir. İlk production adımı: Submission Tracker + Readiness Score. Tahmini effort: 6–8 hafta main team."

**Toplam süre:** ~8 dakika + 2 dk Q&A buffer

---

## 6. Faz 2 — Post-Demo → Production-Ready (Ay 2–3)

**Önkoşul:** Demo submit onaylandı; leadership standalone vs entegre kararı verildi.

### Ay 2 — Entegrasyon ve Sertleştirme

| Hafta | Odak | Deliverables |
|-------|------|--------------|
| 5 | Iceberg X adapter layer | `IcebergXAdapter` interface; mock → staging API; mission sync read-only |
| 6 | Auth + RBAC | Gerçek SSO (Iceberg X session) veya OAuth; role permissions |
| 7 | Submission production flow | File upload (S3/local); submission versioning; email/in-app notifications |
| 8 | AI service hardening | Rate limiting, retry/healing, cost tracking, prompt versioning |

**Ay 2 Definition of Done:**
- Staging Iceberg X'ten mission listesi çekilir (read-only)
- Gerçek kullanıcı rolleri ile login
- Submission file attachment çalışır
- AI error handling production-grade

### Ay 3 — Analytics + Opsiyonel Gamification

| Hafta | Odak | Deliverables |
|-------|------|--------------|
| 9 | R&D Analytics Dashboard v1 | Mission completion rate, avg readiness, mentor response time, category breakdown |
| 10 | Badge hooks (opsiyonel) | Readiness ≥85 badge, evidence contributor badge — **kalite odaklı**, puan yarışı yok |
| 11 | Slack integration | Submission submitted, review requested, readiness threshold event |
| 12 | Production deploy + UAT | Staging → production; main team UAT; migration runbook |

**Faz 2 Definition of Done:**
- Production'da pilot: 2 aktif mission, 5 kullanıcı
- UAT sign-off: admin + 1 mentor
- Runbook + on-call notları
- Performance: dashboard <2s p95

### Faz 2 Kapsam Dışı
- Full Iceberg X rewrite
- Mission Recommendation Engine (Ay 4+)
- Automated weekly progress summary (Ay 4+)

---

## 7. Faz 3 — Mükemmel/Uç Nokta Vizyonu (Ay 4–12)

### Vizyon: Tam Iceberg X Intelligence Layer

R&D operasyonlarının **uçtan uca zeka katmanı** — Lifesycle Communication & Intelligence Layer ile uyumlu:

```
┌─────────────────────────────────────────────────────────────┐
│                 Iceberg X Intelligence Layer                 │
├──────────────┬──────────────┬──────────────┬────────────────┤
│ Plan         │ Execute      │ Review       │ Operate        │
│ AI Mission   │ Evidence     │ AI Review    │ Readiness      │
│ Generator    │ Vault        │ Assistant    │ Score          │
│ Mission      │ Submission   │ Mentor       │ Handover       │
│ Templates    │ Tracker      │ Workload     │ Generator      │
├──────────────┴──────────────┴──────────────┴────────────────┤
│ Shared: ai-service │ TimelineEvent (cross-mission) │ Audit   │
└─────────────────────────────────────────────────────────────┘
```

### Ay 4–6: Akıllı Operasyonlar

| Özellik | Açıklama |
|---------|----------|
| Mission Recommendation Engine | Intern skill profile + geçmiş mission → öneri |
| Automated Weekly Progress Summary | AI özet → mentor/admin inbox |
| Mission Template Registry | Onaylı mission şablonları (M2 Zoom, M3 CRM, M4 Plaud) |
| Cross-mission Timeline | Zoom meeting + Plaud transcript + manual note → mission Evidence Vault auto-ingest |
| GitHub Integration | Repo activity, PR count, README detection otomatik |

### Ay 7–9: Enterprise Kalite

| Özellik | Açıklama |
|---------|----------|
| Advanced Analytics | Cohort analysis, mission success prediction, mentor capacity planning |
| Review Checklist Engine | Kategori bazlı otomatik review checklist |
| Compliance & GDPR | Evidence retention policy, consent tracking, export/delete |
| Multi-workspace | Farklı R&D programları izole |
| API public | Iceberg X Intelligence API — third-party integrations |

### Ay 10–12: Uç Nokta

| Özellik | Açıklama |
|---------|----------|
| Agent-assisted mission execution | M5 Agent Stack entegrasyonu — brief → scaffold → handover loop |
| Predictive Readiness | Submission quality erken uyarı (skor düşmeden) |
| Knowledge Graph | Evidence'lar arası ilişki; "bu iddia hangi mission'larda kullanıldı" |
| Full Lifesycle bridge | CRM valuation mission'ları ↔ Iceberg X mission sync |
| Self-improving prompts | Reviewed AI output'lardan prompt fine-tuning (human approved) |

### Uç Nokta Başarı Metrikleri (Yıl 1)

| Metrik | Hedef |
|--------|-------|
| Mission creation time | −60% (AI generator) |
| Submission completeness | ≥90% checklist completion |
| Mentor review turnaround | −40% |
| Demo-ready missions | ≥70% readiness ≥85 at deadline |
| Handover time (main team) | −50% |

---

## 8. Tech Stack, Data Model, API (Ay 1 POC Detayı)

### 8.1 Tech Stack

| Bileşen | Teknoloji | Versiyon |
|---------|-----------|----------|
| Runtime | Node.js | 20 LTS |
| API Framework | Express | 4.x |
| Frontend | React + Vite | 18 + 5 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS + shadcn/ui | latest stable |
| Database | PostgreSQL | 16 |
| ORM | Drizzle ORM | latest |
| Migration | drizzle-kit | — |
| AI / LLM | `packages/llm` — Gemini (varsayılan) + OpenAI + Anthropic + mock | — |
| Validation | Zod | 3.x |
| Testing | Vitest + Supertest | — |
| Container | Docker Compose | — |

### 8.2 Data Model (PostgreSQL)

```sql
-- users (POC mock)
users (
  id UUID PK,
  email VARCHAR UNIQUE,
  name VARCHAR,
  role ENUM('admin','mentor','intern','leadership'),
  created_at TIMESTAMPTZ
)

-- missions
missions (
  id UUID PK,
  title VARCHAR NOT NULL,
  description TEXT,
  context TEXT,
  problem_statement TEXT,
  expected_deliverables JSONB,  -- string[]
  difficulty_level SMALLINT CHECK (1-5),
  category VARCHAR,
  estimated_weeks SMALLINT,
  suggested_skills JSONB,
  status ENUM('draft','active','blocked','completed','archived'),
  assigned_mentor_id UUID FK users,
  assigned_intern_id UUID FK users,
  ai_generated BOOLEAN DEFAULT false,
  created_by UUID FK users,
  created_at, updated_at TIMESTAMPTZ
)

-- evidence_vault
evidence_entries (
  id UUID PK,
  mission_id UUID FK missions,
  claim TEXT NOT NULL,
  source_type ENUM('url','document','screenshot','meeting','manual'),
  source_url VARCHAR,
  source_title VARCHAR,
  reliability ENUM('high','medium','low','unverified'),
  notes TEXT,
  created_by UUID FK users,
  created_at TIMESTAMPTZ
)

-- submissions
submissions (
  id UUID PK,
  mission_id UUID FK missions,
  intern_id UUID FK users,
  repo_url VARCHAR,
  demo_url VARCHAR,
  video_url VARCHAR,
  notes TEXT,
  deliverable_checklist JSONB,  -- [{name, completed, evidence_link?}]
  status ENUM('draft','submitted','under_review','revision_requested','approved'),
  mentor_feedback TEXT,
  submitted_at, reviewed_at TIMESTAMPTZ,
  created_at, updated_at TIMESTAMPTZ
)

-- ai_runs (shared pattern)
ai_runs (
  id UUID PK,
  run_type ENUM('mission_generate','review_generate','handover_generate','readiness_explain'),
  subject_type VARCHAR,
  subject_id UUID,
  model VARCHAR,
  prompt_version VARCHAR,
  input_hash VARCHAR,
  status ENUM('pending','completed','failed'),
  latency_ms INT,
  token_usage JSONB,
  error_message TEXT,
  created_by UUID FK users,
  created_at TIMESTAMPTZ
)

-- ai_run_artifacts
ai_run_artifacts (
  id UUID PK,
  ai_run_id UUID FK ai_runs,
  artifact_type ENUM('raw_response','parsed_output','validated_output'),
  content JSONB,
  human_review_status ENUM('pending','approved','rejected','edited') DEFAULT 'pending',
  reviewed_by UUID FK users,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)

-- ai_reviews (1:1 submission)
ai_reviews (
  id UUID PK,
  submission_id UUID FK submissions UNIQUE,
  ai_run_id UUID FK ai_runs,
  strengths JSONB,           -- string[]
  weaknesses JSONB,
  review_questions JSONB,
  suggested_feedback TEXT,
  risk_flags JSONB,          -- [{severity, message}]
  human_review_status ENUM(...),
  published_at TIMESTAMPTZ
)

-- readiness_scores (computed, cached)
readiness_scores (
  id UUID PK,
  mission_id UUID FK missions UNIQUE,
  total_score SMALLINT CHECK (0-100),
  breakdown JSONB,           -- {checklist: 25, evidence: 20, ...}
  computed_at TIMESTAMPTZ
)

-- handover_packages
handover_packages (
  id UUID PK,
  mission_id UUID FK missions,
  ai_run_id UUID FK ai_runs,
  content_markdown TEXT,
  exported_at TIMESTAMPTZ,
  created_by UUID FK users,
  created_at TIMESTAMPTZ
)
```

### 8.3 API Endpoints (Ay 1)

| Method | Endpoint | Rol | Açıklama |
|--------|----------|-----|----------|
| GET | `/api/health` | public | Health check |
| **Missions** |
| GET | `/api/missions` | all | Liste + filtre (status, category, mentor) |
| POST | `/api/missions` | admin | Manuel mission oluştur |
| POST | `/api/missions/generate` | admin | AI mission draft üret |
| GET | `/api/missions/:id` | all | Detay |
| PATCH | `/api/missions/:id` | admin | Güncelle |
| DELETE | `/api/missions/:id` | admin | Soft delete |
| **Evidence** |
| GET | `/api/missions/:id/evidence` | all | Liste |
| POST | `/api/missions/:id/evidence` | intern, admin | Ekle |
| PATCH | `/api/evidence/:id` | creator, admin | Güncelle |
| DELETE | `/api/evidence/:id` | admin | Sil |
| **Submissions** |
| GET | `/api/submissions` | mentor, admin | Queue (filtre: status) |
| POST | `/api/missions/:id/submissions` | intern | Oluştur/güncelle |
| POST | `/api/submissions/:id/submit` | intern | Final submit |
| PATCH | `/api/submissions/:id/status` | mentor | Status + feedback |
| **AI Review** |
| POST | `/api/submissions/:id/ai-review` | mentor | AI review üret |
| GET | `/api/submissions/:id/ai-review` | mentor, intern* | Review getir (*published only) |
| PATCH | `/api/ai-reviews/:id` | mentor | Edit + approve/reject |
| POST | `/api/ai-reviews/:id/publish` | mentor | Intern'e göster |
| **Readiness** |
| GET | `/api/missions/:id/readiness` | all | Skor + breakdown |
| POST | `/api/missions/:id/readiness/compute` | admin, system | Yeniden hesapla |
| **Dashboard** |
| GET | `/api/dashboard/summary` | admin, leadership | Aggregated stats |
| GET | `/api/dashboard/mentor-workload` | admin, leadership | Mentor başına yük |
| **Handover** |
| POST | `/api/missions/:id/handover/generate` | admin, mentor | AI handover üret |
| GET | `/api/missions/:id/handover` | admin, mentor | Son handover |
| **AI Audit** |
| GET | `/api/ai-runs` | admin | Audit log listesi |
| GET | `/api/ai-runs/:id` | admin | Detay + artifacts |

### 8.4 Frontend Sayfa Haritası

| Route | Bileşenler | Rol |
|-------|------------|-----|
| `/` | Redirect → dashboard | all |
| `/dashboard` | SummaryCards, MissionGrid, MentorWorkload, BlockedAlert | admin, leadership |
| `/missions` | MissionList, Filters | all |
| `/missions/new` | IdeaInput, AIGenerateButton, MissionPreviewForm | admin |
| `/missions/:id` | MissionHeader, Tabs(Evidence, Submission, Review, Handover) | all |
| `/missions/:id/evidence` | EvidenceList, EvidenceForm, ReliabilityBadge | intern, admin |
| `/missions/:id/submit` | SubmissionForm, ChecklistEditor | intern |
| `/submissions` | SubmissionQueue, StatusBadge | mentor |
| `/submissions/:id/review` | AIReviewPanel, FeedbackEditor, PublishButton | mentor |
| `/missions/:id/handover` | HandoverPreview, ExportButton | admin, mentor |

### 8.5 AI Prompt Governance

| Run Type | Schema (Zod) | Prompt Version | Max Tokens |
|----------|--------------|----------------|------------|
| mission_generate | `MissionDraftSchema` | v1.0.0 | 2000 |
| review_generate | `AIReviewSchema` | v1.0.0 | 3000 |
| handover_generate | `HandoverDocSchema` | v1.0.0 | 4000 |

**Validation flow:** API call → parse JSON → Zod validate → fail ise 1 retry (healing prompt) → fail ise error + log

### 8.6 Iceberg X Entegrasyon Noktaları (Adapter — Ay 1 Mock)

```typescript
interface IcebergXAdapter {
  listMissions(filters): Promise<ExternalMission[]>;
  getMission(id): Promise<ExternalMission>;
  // Ay 2+: createMission, syncSubmission
}
// POC: MockIcebergXAdapter — seed JSON
// Production: HttpIcebergXAdapter — staging API
```

---

## 9. Test Plan + Metrikler

> **v1.1 ZORUNLU:** `npm run test` CI'da merge blocker. Coverage: API/services ≥70%. LLM testlerinde `LLM_PROVIDER=mock`. Demo submit testler geçmeden tamamlanmış sayılmaz.

### 9.1 Test Stratejisi (Ay 1)

| Katman | Araç | Kapsam |
|--------|------|--------|
| Unit | Vitest | Readiness score calculator, Zod schemas, checklist validation |
| Integration | Supertest | API endpoints + DB |
| E2E (smoke) | Playwright (Hafta 4) | Demo senaryosu 1 critical path |
| AI | Snapshot + schema | Mock OpenAI responses; schema validation tests |
| Manual | TEST_PLAN.md | Role-based flows |

### 9.2 Kritik Test Senaryoları

| ID | Senaryo | Beklenen |
|----|---------|----------|
| T01 | Admin AI mission generate | Valid schema; mission DB'de draft |
| T02 | Evidence ekle — claim boş | 400 validation error |
| T03 | Intern submit — checklist incomplete | Warning göster; submit allowed (configurable block) |
| T04 | AI review — mentor reject | Intern'e publish edilmez |
| T05 | Readiness — all approved | Score ≥85 |
| T06 | Readiness — no evidence | Score <60 |
| T07 | Handover generate | Markdown tüm section'ları içerir |
| T08 | Mock auth — intern admin endpoint | 403 |
| T09 | AI API fail | Graceful error; ai_run status failed |
| T10 | docker compose fresh install | 15 dk içinde demo çalışır |

### 9.3 Demo Submit Metrikleri

| Metrik | Hedef (Ay 1) | Ölçüm |
|--------|--------------|-------|
| API p95 latency (non-AI) | <300ms | Local benchmark |
| AI generation latency | <15s | ai_runs.latency_ms |
| Test coverage (API) | ≥70% | Vitest coverage |
| Demo scenario success rate | 100% (10 trial) | Manual rehearsal |
| Docs completeness | 13/13 artifact | Checklist |
| Known P0 bugs | 0 | Issue tracker |

### 9.4 Post-Demo KPI'lar (Faz 2+)

| KPI | Baseline | Hedef (6 ay) |
|-----|----------|--------------|
| Mission creation time | ~2 saat manual | <30 dk |
| Submission first-pass approval | bilinmiyor | ≥60% |
| Evidence entries per mission | 0 (today) | ≥5 ortalama |
| Mentor review SLA | bilinmiyor | <48 saat |

---

## 10. Riskler ve Mitigasyon

| # | Risk | Olasılık | Etki | Mitigasyon | Sahip |
|---|------|----------|------|------------|-------|
| R1 | AI hallucination — yanlış mission/review | Orta | Yüksek | Structured output + Zod; evidence vault zorunluluğu; human review gate | Dev |
| R2 | OpenAI API maliyet/limit | Düşük | Orta | gpt-4.1-mini default; rate limit; mock mode | Dev |
| R3 | Scope creep — 7 modül 4 haftada | Yüksek | Yüksek | Modül öncelik sırası; Badge deferred; MVP first | PM/Dev |
| R4 | Iceberg X gerçek stack farklı | Orta | Orta | Adapter pattern; TECH_PROPOSAL'da Laravel migration path | Dev |
| R5 | Demo günü AI API down | Düşük | Yüksek | Mock mode toggle; pre-recorded AI responses seed | Dev |
| R6 | Platform review eksik bilgi | Orta | Düşük | Mentor walkthrough; ekran görüntüleri; "assumption" etiketle | Dev |
| R7 | Readiness score güvenilmez | Orta | Orta | Ağırlıklar dokümante; breakdown UI; manual override | Dev |
| R8 | Handover generator generic output | Orta | Orta | Template sections Zod; mentor edit before export | Dev |
| R9 | Security — POC mock auth | Düşük (demo) | Orta | Demo-only disclaimer; Faz 2 SSO | Dev |
| R10 | Tek geliştirici bottleneck | Orta | Yüksek | Haftalık milestone; cut scope listesi hazır (Badge, analytics) | PM |

---

## 11. Effort (T-shirt) ve Kaynak İhtiyacı

### 11.1 T-shirt Tahminleri (Modül Bazlı)

| Modül | Effort | Ay 1 dahil? |
|-------|--------|-------------|
| Faz 0 — Setup | S | Evet |
| AI Mission Generator | M | Evet |
| Evidence Vault | S | Evet |
| Submission Tracker | M | Evet |
| Progress Dashboard | M | Evet |
| AI Review Assistant | L | Evet |
| Demo Readiness Score | M | Evet |
| Handover Generator | M | Evet |
| Badge/Gamification | M | Hayır (Faz 2 opsiyonel) |
| Docs (7 resmi deliverable) | L | Evet |
| **Ay 1 Toplam** | **XL** | — |

### 11.2 Kaynak İhtiyacı (Ay 1)

| Rol | FTE | Süre | Notlar |
|-----|-----|------|--------|
| Full-stack Developer | 1.0 | 4 hafta | Primary builder |
| Product/PM (part-time) | 0.2 | 4 hafta | Scope, demo script, stakeholder |
| Mentor/SME (Iceberg X) | 0.1 | 2 hafta | Platform review validation, 2× 1hr interview |
| Leadership reviewer | 0.05 | Hafta 4 | Demo feedback |
| Designer (opsiyonel) | 0.1 | Hafta 3–4 | Screenshot polish |

**Minimum viable team:** 1 full-stack developer + part-time PM

### 11.3 Productionise Effort (Tahmini)

| Faz | Süre | Ekip |
|-----|------|------|
| Faz 2 (production-ready) | 8 hafta | 1–2 backend + 1 frontend |
| Faz 3 (full vision) | 9 ay | 2–3 kişi + main team entegrasyon |

---

## 12. Bağımlılıklar (Dış Sistemler)

> **Not:** Bu bölüm yalnızca M1 POC'nin bağımlı olduğu **dış sistemleri** listeler. Diğer mission planları ile koordinasyon kapsam dışıdır.

| Dış Sistem | Bağımlılık Türü | Ay 1 Kullanım | Blocker? | Fallback |
|------------|-----------------|---------------|----------|----------|
| **OpenAI API** | AI inference | Mission gen, review, handover | Evet (AI modülleri için) | Mock responses; local template fill |
| **PostgreSQL** | Veritabanı | Tüm persistence | Evet | Docker local instance |
| **GitHub** | Repo hosting, opsiyonel metadata | Repo URL validation (manual POC) | Hayır | URL format validation only |
| **Iceberg X (mevcut platform)** | Referans sistem | Platform review, adapter spec | Hayır | Screenshots + mock adapter |
| **Docker / Docker Compose** | Container runtime | Local dev + demo | Hayır | Manual npm run (README'de) |
| **Node.js runtime** | Execution | API + tooling | Evet | — |
| **Leadership demo environment** | Sunum | Demo Day | Hayır | Local laptop demo |

**Bilinçli olarak dış bağımlılık YAPILMAYAN sistemler (Ay 1):**
- Slack API
- Iceberg X production DB
- Zoom / Plaud / Lifesycle API'leri (cross-mission hikaye senaryoda **metin olarak** referans; teknik entegrasyon yok)
- SSO/Identity provider
- S3/cloud storage

---

## Ek: Haftalık Milestone Özet Tablosu

| Hafta | Milestone | Demo edilebilir? |
|-------|-----------|------------------|
| 0 | Repo + Docker + DB | Health check |
| 1 | Mission Gen + Evidence | Admin akışı |
| 2 | Submission + Dashboard | Intern + mentor akışı |
| 3 | AI Review + Readiness | Kalite katmanı |
| 4 | Handover + Docs + Video | **DEMO SUBMIT** |

---

## Ek: Scope Cut Priority (Gecikme Durumunda)

Sırayla kesilecek özellikler (en son kesilen en az kritik):

1. Handover AI narrative (manual template kalır)
2. Dashboard mentor workload panel
3. Readiness breakdown modal (sadece total score)
4. Evidence reliability scoring (basit liste kalır)
5. **Asla kesilmez:** AI Mission Generator, Submission Tracker, AI Review, temel docs

---

*Plan sahibi: M1 Implementation Team*  
*Sonraki adım: Faz 0 kickoff — repo oluştur, Docker Compose, `.env.example`*
