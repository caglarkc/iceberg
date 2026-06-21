# M1 — Starter Implementation Prompt

> **Kullanım:** Bu prompt'u yeni bir AI coding agent oturumuna **tek başına** yapıştır. Agent sıfırdan `iceberg-x-intelligence-poc` reposunu implement edecek.

---

## Rolün

Sen Iceberg Digital için **M1 — Iceberg X Intelligence Layer** POC'sini sıfırdan yazan senior full-stack geliştiricisin. Araştırma tamamlandı; şimdi **çalışan kod + zorunlu testler + CI** üretiyorsun.

---

## Okuma Sırası (ZORUNLU — kod yazmadan önce)

1. `shared/plans/SHARED_PLAN_CONSTRAINTS.md` — credential politikası, LLM, test kuralları
2. `missions/m1-iceberg-x-intelligence-layer/plans/DEMO_AND_ROADMAP_PLAN.md` — tam plan (Faz 0–3, data model, API, demo script)
3. `missions/m1-iceberg-x-intelligence-layer/brief/MISSION_BRIEF.md` — resmi mission brief

---

## v1.1 Kısıtları (Özet)

| Konu | Karar |
|------|--------|
| Zoom | **Yok** — M1 Zoom kullanmaz |
| LLM | `LLM_PROVIDER=gemini` varsayılan; **gemini + openai + anthropic** destekli `LlmService` |
| Test | **CI merge blocker** — `lint + typecheck + test`; coverage ≥70% API/services |
| DB | Ayrı PostgreSQL schema — production Iceberg X'e yazma |
| AI governance | Tüm AI çıktıları `human_review_status` ile onay kuyruğunda |

---

## Repo ve Yapı

**Repo adı:** `iceberg-x-intelligence-poc/`

```
iceberg-x-intelligence-poc/
├── apps/
│   ├── api/              # Express + TypeScript
│   └── web/              # React + Vite + Tailwind + shadcn/ui
├── packages/
│   ├── shared/           # Zod schemas, types
│   └── llm/              # LlmService + gemini/openai/anthropic/mock providers
├── drizzle/              # migrations
├── tests/                # integration helpers
├── fixtures/             # demo seed data
├── .github/workflows/ci.yml
├── docker-compose.yml
├── .env.example
├── README.md
├── TEST_PLAN.md
└── HANDOVER.md
```

---

## Tech Stack

- Node.js 20, TypeScript 5, Express 4
- React 18 + Vite 5 + Tailwind + shadcn/ui
- PostgreSQL 16 + Drizzle ORM
- Zod validation
- Vitest + Supertest
- Docker Compose

---

## Implementasyon Sırası

### Faz 0 (İlk 2–3 gün)

1. Monorepo scaffold (npm workspaces veya pnpm)
2. Docker Compose: postgres + api + web
3. `packages/llm`: `LlmService` interface + `GeminiProvider`, `OpenAiProvider`, `AnthropicProvider`, `MockLlmProvider`
4. Drizzle schema: `users`, `missions`, `evidence_entries`, `submissions`, `ai_runs`, `ai_run_artifacts`, `readiness_scores`, `handover_packages`
5. `.env.example` — tüm env var isimleri dokümante
6. CI skeleton — **ilk PR'dan itibaren yeşil**

### Hafta 1 — Core CRUD + Auth Mock

- Mock auth (admin/mentor/intern/leadership rolleri)
- Mission CRUD API + basit web list/detail
- Evidence Vault CRUD
- **Test:** mission + evidence API happy/error paths

### Hafta 2 — AI Modülleri

- **AI Mission Generator** — brief → structured mission (Zod schema + mock/gemini)
- **AI Review Assistant** — submission → review draft
- **Handover Checklist Generator**
- `ai_runs` audit log her çağrıda
- **Test:** `LLM_PROVIDER=mock` ile deterministik AI output testleri

### Hafta 3 — Submission + Dashboard + Readiness

- Submission Tracker (repo_url, demo_url, checklist)
- Mission Progress Dashboard
- Demo Readiness Score (weighted rubric)
- **Test:** uçtan uca akış integration testi

### Hafta 4 — Polish + Demo + Handover

- Demo seed: "Plaud transcript CRM entegrasyonu" cross-mission senaryosu
- UI polish, error states
- README, TEST_PLAN, HANDOVER tamamla
- Demo video script'e uygun akış doğrula

---

## Zorunlu Modüller (7'den 6'sı)

1. AI Mission Generator ✅
2. Evidence Vault ✅
3. Submission Tracker ✅
4. Mission Progress Dashboard ✅
5. AI Review Assistant ✅
6. Demo Readiness Score ✅
7. Handover Checklist Generator ✅
8. ~~Gamification/Badge~~ — **kapsam dışı**

---

## LLM Implementasyon Detayı

```typescript
// packages/llm/src/index.ts
interface LlmService {
  completeStructured<T>(params: {
    schema: z.ZodSchema<T>;
    system: string;
    user: string;
    maxRetries?: number;
  }): Promise<{ data: T; usage?: TokenUsage }>;
}
```

- Env: `LLM_PROVIDER=gemini|openai|anthropic|mock`
- Env: `GEMINI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`
- Structured output: Zod validate → fail ise 1 healing retry
- CI: **her zaman** `LLM_PROVIDER=mock`

---

## Zorunlu Testler

```bash
npm run lint && npm run typecheck && npm run test -- --coverage
```

| Katman | Minimum |
|--------|---------|
| Unit | Mission generator rubric, readiness score weights, Zod parsers |
| API | Tüm public endpoints — Supertest happy + 1 error |
| Integration | 7 adımlı demo akışı (mock LLM) |
| CI | GitHub Actions — merge blocker |

`TEST_PLAN.md` — manuel demo senaryoları listele.

---

## Definition of Done (Demo Submit)

- [ ] Tek mission üzerinde uçtan uca 7 adımlık demo kesintisiz
- [ ] 6 modül entegre çalışıyor
- [ ] %100 AI çıktısı insan onayına tabi; audit trail mevcut
- [ ] `docker compose up` ile 30 dk içinde ayağa kalkıyor
- [ ] CI yeşil, coverage ≥70% services
- [ ] README + TEST_PLAN + HANDOVER + `.env.example` tamam

---

## Yapma

- Production Iceberg X DB'ye bağlanma
- AI çıktısını otomatik onaylama
- Testleri "sonra yazarız" diye erteleme
- Tek provider'a kilitlenme (3 provider + mock şart)
- Zoom entegrasyonu ekleme

---

## Git Workflow (Zorunlu)

Her **Faz 0 / Hafta 1–4** aşaması bittiğinde:

```bash
npm run lint && npm run typecheck && npm run test
git add -A && git commit -m "feat(m1): <aşama özeti>"
git push origin main   # veya develop
```

Testler yeşil değilse commit yok. Aşama arasında push atmayı unutma.

---

## Başlangıç Komutu

İlk iş: repo scaffold + Docker + `LlmService` mock provider + ilk migration + CI. Her milestone'da testleri **aynı commit/PR'da** yaz. İlk milestone bitince **commit + push**.
