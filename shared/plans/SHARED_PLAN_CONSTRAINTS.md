# Ortak Plan Kısıtları ve Zorunlu Kurallar (v1.1)

> **Güncelleme:** 21 Haziran 2026  
> **Tüm mission planları ve implementation starter prompt'ları bu belgeye uyar.**  
> AI agent'lar kod yazmadan önce bu dosyayı + ilgili mission `plans/DEMO_AND_ROADMAP_PLAN.md` + `plans/STARTER_IMPLEMENTATION_PROMPT.md` dosyalarını okumalıdır. İndeks: `shared/plans/IMPLEMENTATION_INDEX.md`

---

## 1. Ortam ve Credential Politikası

### 1.1 Zoom (M2, M3) — ŞİMDİLİK ATLA

| Öğe | Durum |
|-----|--------|
| Zoom Developer / Marketplace app | **Ertelendi** — şirket test hesabı ve Zoom dev credentials verilmeyecek (şimdilik) |
| Zoom Phone lisansı / Smart Embed | **Ertelendi** — demo'da yok |
| Gerçek Meeting SDK join | **Ertelendi** |

**Ay 1 zorunlu yaklaşım:**
- `ZOOM_MODE=mock` (varsayılan) — tüm Zoom REST/SDK/webhook cevapları **MockZoomAdapter** ile simüle edilir
- Mimari, interface'ler, route'lar, DB şeması **gerçek entegrasyona hazır** yazılır (`RealZoomAdapter` Faz 2'de takılır)
- Demo: mock meeting create → mock join URL → mock webhook replay → capability map dokümantasyonu
- M3, harici **Zoom Integration Service** HTTP sözleşmesini mock endpoint ile tüketir

**`.env` (mock):**
```bash
ZOOM_MODE=mock
# Aşağıdakiler Faz 2'ye kadar boş kalabilir:
# ZOOM_ACCOUNT_ID=
# ZOOM_CLIENT_ID=
# ZOOM_CLIENT_SECRET=
# ZOOM_SDK_KEY=
# ZOOM_SDK_SECRET=
```

### 1.2 Plaud (M4) — API KEY VERİLECEK

| Öğe | Durum |
|-----|--------|
| Plaud API / Partner credentials | **Kullanıcı sağlayacak** — 1 aylık demo için yeterli |
| Birincil adapter | `ApiPlaudAdapter` (gerçek API) |
| Mock adapter | **Sadece unit test ve CI** için (`MockPlaudAdapter`) |

**`.env` (beklenen):**
```bash
PLAUD_API_BASE_URL=          # bölgeye göre (US/EU)
PLAUD_CLIENT_ID=
PLAUD_CLIENT_API_KEY=
# veya partner token modeli — docs'a göre doldur
PLAUD_MODE=live                # live | mock (testlerde mock)
```

### 1.3 LLM (M1, M4, M5) — Çoklu Sağlayıcı, Gemini Varsayılan

| Sağlayıcı | Env | Varsayılan model (POC) |
|-----------|-----|------------------------|
| **Google Gemini** | `GEMINI_API_KEY` | `gemini-2.0-flash` veya güncel flash |
| OpenAI | `OPENAI_API_KEY` | `gpt-4o-mini` |
| Anthropic | `ANTHROPIC_API_KEY` | `claude-3-5-sonnet-latest` |

**Zorunlu mimari:**
```bash
LLM_PROVIDER=gemini          # gemini | openai | anthropic
LLM_MODEL=                     # opsiyonel override
```

- `packages/llm` veya `services/llm/` — **tek `LlmService` interface**, 3 provider implementasyonu
- Structured output: Zod schema validate + healing retry (tüm provider'larda)
- Testlerde: `LLM_PROVIDER=mock` — deterministik JSON fixture, **gerçek API çağrısı yok**

### 1.4 Diğer

| Öğe | Not |
|-----|-----|
| GitHub | Free — repo + Actions |
| PostgreSQL | Local Docker / SQLite POC |
| Cursor API (M5) | Opsiyonel — template scaffold LLM'siz de çalışmalı |

---

## 2. Test Zorunluluğu (TÜM MİSSION'LAR)

### 2.1 Kırmızı Çizgi

**Hiçbir PR / demo submit / hafta sonu milestone, testler geçmeden tamamlanmış sayılmaz.**

### 2.2 Minimum Standart

| Katman | Araç | Minimum |
|--------|------|---------|
| Unit | Vitest (veya Jest) | Kritik business logic %80+ |
| API | Supertest | Tüm public endpoint'ler happy path + 1 error path |
| Integration | Vitest + test DB | En az 1 uçtan uca akış / mission |
| CI | GitHub Actions | `lint` + `typecheck` + `test` — **merge blocker** |
| E2E (opsiyonel Ay 1) | Playwright | Demo senaryosunun 1 smoke test'i |

### 2.3 Her Mission İçin Zorunlu Test Dosyaları

```
TEST_PLAN.md          # Manuel senaryolar
tests/                # Otomatik testler
.github/workflows/ci.yml
```

### 2.4 CI Komutu (standart)

```bash
npm run lint && npm run typecheck && npm run test -- --coverage
```

Coverage eşiği (Ay 1): **API/services ≥70%**, UI opsiyonel.

### 2.5 Mock-First Test Prensibi

- Zoom: `MockZoomAdapter` — credential gerektirmez
- Plaud: `MockPlaudAdapter` — CI'da varsayılan; local'de `PLAUD_MODE=live` ile gerçek API
- LLM: `MockLlmProvider` — CI'da zorunlu

### 2.6 Git Workflow (Zorunlu — Tüm Mission Agent'ları)

**Her aşama milestone'ı tamamlandığında** (Faz 0, Hafta 1, Hafta 2, …):

1. `npm run lint && npm run typecheck && npm run test` — yeşil olmadan commit yok
2. Anlamlı commit mesajı (ör. `feat(m1): add mission CRUD API and tests`)
3. `git push origin <branch>` — değişiklikleri remote'a gönder; birikmiş iş bırakma

| Kural | Açıklama |
|-------|----------|
| Sıklık | Her faz/hafta sonu minimum 1 commit+push |
| Mesaj | `feat` / `fix` / `test` / `chore` + mission kısa adı |
| Push | Aşama bittiğinde hemen push — "sonra pushlarım" yok |
| Branch | `main` veya `develop` — mission planında belirtildiği gibi |

Kickoff prompt'ları: `shared/plans/AGENT_KICKOFF_PROMPTS.md`

---

## 3. Implementation Sırası (AI Agent'lar İçin)

1. Repo scaffold + Docker + `.env.example`
2. `LlmService` + mock providers
3. Domain models + migrations
4. **Testler ile birlikte** API (TDD veya hemen ardından test)
5. UI
6. README + HANDOVER + TEST_PLAN
7. CI yeşil → demo hazır

---

## 4. Dosya Referansları

| Mission | Klasör | Plan | Starter Prompt |
|---------|--------|------|----------------|
| M1 | `missions/m1-iceberg-x-intelligence-layer/` | `plans/DEMO_AND_ROADMAP_PLAN.md` | `plans/STARTER_IMPLEMENTATION_PROMPT.md` |
| M2 | `missions/m2-zoom-integration-core/` | `plans/DEMO_AND_ROADMAP_PLAN.md` | `plans/STARTER_IMPLEMENTATION_PROMPT.md` |
| M3 | `missions/m3-lifesycle-zoom-meeting-flow/` | `plans/DEMO_AND_ROADMAP_PLAN.md` | `plans/STARTER_IMPLEMENTATION_PROMPT.md` |
| M4 | `missions/m4-property-intelligence-pipeline/` | `plans/DEMO_AND_ROADMAP_PLAN.md` | `plans/STARTER_IMPLEMENTATION_PROMPT.md` |
| M5 | `missions/m5-agent-stack/` | `plans/DEMO_AND_ROADMAP_PLAN.md` | `plans/STARTER_IMPLEMENTATION_PROMPT.md` |

Ortak: `shared/plans/SHARED_PLAN_CONSTRAINTS.md`, `shared/plans/IMPLEMENTATION_INDEX.md`
