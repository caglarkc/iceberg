# M5 — Starter Implementation Prompt

> **Kullanım:** Bu prompt'u yeni bir AI coding agent oturumuna **tek başına** yapıştır. Agent sıfırdan `agent-stack` reposunu implement edecek.

---

## Rolün

Sen Iceberg Digital için **M5 — Agent Stack: AI Powered Developer Workflow Assistant** POC'sini sıfırdan yazan senior tooling/AI engineer'ısın.

**Uyarı:** `missions/m5-agent-stack/brief/MISSION_BRIEF.md` dosyası hatalı (Zoom CRM içeriği). Bu plan **çıkarımsal** mission tanımına göre ilerler — plandaki Bölüm 1'e bak.

---

## Okuma Sırası (ZORUNLU)

1. `shared/plans/SHARED_PLAN_CONSTRAINTS.md`
2. `missions/m5-agent-stack/plans/DEMO_AND_ROADMAP_PLAN.md`
3. `shared/documents/FINAL_EVALUATION_AND_CONSOLIDATED_PLAN.md` (M5 bölümü)

---

## v1.1 Kısıtları

| Konu | Karar |
|------|--------|
| LLM | gemini varsayılan + openai + anthropic + mock |
| Cursor API / SDK | **Opsiyonel** — scaffold LLM'siz de çalışmalı |
| Secrets | Agent **asla** secret değeri okumaz — yalnızca env var **isimleri** |
| Governance | Human approve olmadan push/merge yok |
| Test | CI merge blocker |

---

## Repo ve Yapı

**Repo adı:** `agent-stack/`

```
agent-stack/
├── packages/
│   ├── parser/             # mission brief → JSON
│   ├── scaffolder/         # template registry + renderer
│   ├── handover-gen/       # README, TEST_PLAN, HANDOVER, .env.example
│   ├── llm/                # LlmService
│   ├── orchestrator/       # CLI: dry-run scaffold
│   └── mcp-server/         # Iceberg docs + template + policy tools (opsiyonel POC)
├── templates/
│   ├── api-integration-core/
│   ├── crm-mock-poc/
│   └── intelligence-layer/
├── apps/
│   └── cli/                # `npx iceberg-scaffold` veya `pnpm scaffold`
├── tests/
│   ├── golden/             # brief → expected tree snapshots
│   └── fixtures/briefs/
├── .github/workflows/ci.yml
├── .env.example
├── README.md
├── TEST_PLAN.md
└── HANDOVER.md
```

---

## Tech Stack

- Node.js 20, TypeScript
- Handlebars veya EJS template rendering
- Zod — brief schema + output validation
- Vitest — golden file tests
- Commander.js CLI
- `packages/llm` — multi-provider
- Cursor SDK entegrasyonu: **opsiyonel** wrapper

---

## Core Özellikler (POC)

### 1. Brief Parser (`packages/parser`)

Markdown/text mission brief → structured JSON:

```typescript
{
  mission_id: string;
  problem: string;
  deliverables: string[];
  constraints: string[];
  tech_hints?: string[];
  expected_outputs?: string[];
}
```

Validation errors açık mesaj.

### 2. Template Registry + Scaffolder

- `api-integration-core` — M2 benzeri adapter pattern
- `crm-mock-poc` — M3 benzeri
- `intelligence-layer` — M1 benzeri

Brief'ten template seçimi (rule-based + opsiyonel LLM suggest).

Çıktı: dosya ağacı + boilerplate + `// @ai-generated` metadata.

### 3. Handover Generator

Zorunlu dosyalar:
- `README.md`
- `TEST_PLAN.md`
- `HANDOVER.md`
- `.env.example` (isimler only)

### 4. Governance

- `dry-run` modu — dosya yazmadan stdout
- `approve` gate — `--approve` flag olmadan write yok
- Audit log: `scaffold_runs` table veya JSON log

### 5. CLI

```bash
pnpm scaffold parse --brief ./fixtures/briefs/m2.md
pnpm scaffold generate --brief ./fixtures/briefs/m2.md --template api-integration-core --dry-run
pnpm scaffold generate --brief ./fixtures/briefs/m2.md --template api-integration-core --out ./output --approve
pnpm scaffold handover --repo ./output
```

---

## LLM Kullanımı (Opsiyonel Katman)

- Template seçimi suggest
- Brief eksik bölüm tamamlama **öneri** (auto-write yok)
- Handover narrative draft

CI: `LLM_PROVIDER=mock` — deterministik.

Scaffold **LLM olmadan** rule-based çalışmalı (kırmızı çizgi).

---

## Implementasyon Sırası

### Faz 0

1. Monorepo + parser Zod schema
2. 1 template (`api-integration-core`) + golden test
3. CLI skeleton
4. CI yeşil

### Hafta 1 — Parser + Scaffolder

- Brief parser + 3 fixture brief
- Template renderer
- Golden tree match tests
- **Test:** `m2.md` → expected file list

### Hafta 2 — Handover + 2. Template

- Handover generator
- `crm-mock-poc` template
- `.env.example` generator (secret isimleri only)

### Hafta 3 — LLM + Governance

- LlmService entegrasyonu (suggest only)
- Approve gate + audit log
- `intelligence-layer` template

### Hafta 4 — Demo + Self-Dogfooding

- Kendi repo'su için HANDOVER üret (self-dogfooding)
- 5 dk demo: brief → dry-run → approve → output tree
- Opsiyonel: minimal MCP server

---

## Zorunlu Testler

| Bileşen | Test |
|---------|------|
| Brief parser | Geçerli → JSON; eksik → validation error |
| Template renderer | Golden tree match |
| Handover gen | Zorunlu dosyalar mevcut |
| CLI dry-run | Dosya yazmaz |
| CLI without --approve | Write yapmaz |
| LLM mock | Deterministik suggest |
| CI | merge blocker |

```bash
LLM_PROVIDER=mock npm run lint && npm run typecheck && npm run test
```

---

## Demo Senaryosu (5 dk)

1. `fixtures/briefs/sample-mission.md` göster
2. `scaffold parse` — structured JSON
3. `scaffold generate --dry-run` — tree preview
4. `--approve` ile output/
5. `scaffold handover` — README/TEST_PLAN/HANDOVER
6. Mentor review vurgusu — auto-merge yok

---

## Definition of Done

- [ ] Brief'ten 5 dk içinde scaffold (dry-run gösterimi)
- [ ] 3 template çalışıyor
- [ ] Handover paketi şablon uyumlu
- [ ] Secret değeri hiçbir yerde yok
- [ ] AI-generated metadata etiketli
- [ ] LLM'siz fallback çalışıyor
- [ ] CI yeşil
- [ ] Self-dogfooding HANDOVER tamam

---

## Yapma

- Otonom git push / merge
- Secret okuma veya `.env` değerlerini loglama
- Cursor API'ye hard dependency (opsiyonel kalmalı)
- Hatalı mission brief dosyasındaki Zoom CRM scope'unu M5'e taşıma
- Testleri ertelemek

---

## Başlangıç Komutu

İlk iş: `packages/parser` + Zod schema + 1 fixture brief test + `api-integration-core` minimal template + CLI `parse` command + CI.
