# M5 — Agent Stack: AI Powered Developer Workflow Assistant — Implementation Prompt

> ⚠️ **Brief uyarısı:** Orijinal mission dosyası hatalı (M3 ile aynı metin). Bu plan **dosya adı + Iceberg X bağlamı**ndan çıkarılmıştır; doğru brief gelince §"Brief Güncelleme Notu" maddeleri revize edilecek.
> **Referans:** `SHARED_RESEARCH_REPORT_opus.md` §4 (Cursor CLI/SDK, MCP, structured outputs, coding agents).
> **Tarih:** 2026-06-20

## Bağlam

Iceberg Digital dev team + Iceberg X intern'leri çok sayıda paralel mission/POC üretiyor (M1–M4 dahil). M5'in amacı: bu geliştirme akışını hızlandıran, **AI destekli bir Agent Stack** — diğer mission'ların force multiplier'ı. 2026 araçları (Cursor CLI/SDK, MCP, structured outputs) bunu handover-ready kılacak olgunlukta.

## Problem Definition (Iceberg dev workflow yavaşlıkları)
- Her yeni mission/POC sıfırdan boilerplate (Zoom core, Plaud pipeline, CRM mock).
- Handover dokümanları tutarsız.
- Mission brief → çalışan iskelet arası süre uzun.
- Code review / test yazımı manuel.

## Agent Stack Vizyonu
"Mission brief'ten çalışan POC iskeleti + handover paketi üreten" iç developer assistant. Cursor CLI/SDK çekirdeği + Iceberg'e özel MCP server'lar + RAG (Iceberg repo'ları + bu araştırma).

## Capability Map
- **Scaffolding:** mission brief → repo iskeleti (örn. "Zoom POC boilerplate", "Plaud pipeline template", "CRM mock").
- **Code generation/review/test/docs/debugging.**
- **Handover doc generation:** README + env + known issues standardı (M1–M4 formatı).
- **Mission-aware:** SHARED_RESEARCH_REPORT'u RAG ile bilir (tekrar araştırma yapmaz).

## Architecture Options

| Yaklaşım | Açıklama | Skor |
|----------|----------|------|
| **A) IDE-embedded** (Cursor rules + MCP) | Geliştirici Cursor'da; `.cursor/rules` + Iceberg MCP | Hızlı, düşük effort ✅ |
| **B) Standalone orchestrator** (Cursor SDK) | `@cursor/sdk` ile programatik agent servisi (brief→PR) | Güçlü, "wow" ✅ |
| **C) CI-integrated** (Cursor CLI in GitHub Actions) | PR'da otomatik review/test/docs | Production değer ✅ |

**Öneri:** POC = B (brief→iskelet, en etkileyici) + A (günlük kullanım). C production yol haritası.

## Tool Chain Design
- **LLM:** Claude / GPT (Cursor üzerinden frontier model seçilebilir).
- **MCP servers:** GitHub (repo ops), Iceberg-docs (bu araştırma + mission'lar), Zoom-docs, Plaud-docs, codebase (RAG). Bkz. SHARED §4.3.
- **RAG:** Iceberg repo'ları + SHARED_RESEARCH_REPORT_opus.md indexlenir (pgvector).
- **Orchestration:** Cursor SDK `Agent.create({ runtime: 'cloud'|'local' })`, worktree izolasyonu.

## Agent Orchestration Pattern
- **POC:** single agent + tool'lar (scaffolder).
- **İleri:** multi-agent (planner → coder → reviewer), her biri ayrı worktree; OpenPraxis benzeri DAG (idea→manifest→task→review).

## POC Spesifikasyonu
**Somut demo:** "Verilen mission brief'ten çalışan POC iskeleti üret."
- Input: mission brief (örn. M2 Zoom).
- Cursor SDK agent: ilgili MCP/RAG context'i çeker → repo iskeleti (paket, env.example, README, temel endpoint stub'ları) → review task → çıktı PR/worktree.
- Output: çalıştırılabilir iskelet + standart handover README.

## Diğer Mission'lara Etki
- **M1:** AI mission generator → dev workflow'a (brief→kod).
- **M2/M3:** zoom-integration-core boilerplate'i saniyeler içinde.
- **M4:** Plaud pipeline template + API keşif otomasyonu.
- Tüm mission'larda standart handover paketi.

## Tech Stack
- **Cursor SDK** (`@cursor/sdk`, TypeScript) + **Cursor CLI** (`agent -p --output-format json`).
- **MCP** (`@modelcontextprotocol/sdk`) — Iceberg-özel server'lar.
- **RAG:** pgvector / embeddings.
- **Gerekçe:** SHARED §4.1–4.3.

## GitHub Referansları
1. **@cursor/sdk** (https://cursor.com/blog/typescript-sdk) — orchestration çekirdeği.
2. **modelcontextprotocol/servers** (https://github.com/modelcontextprotocol/servers) — MCP referans server'lar.
3. **cyanheads/model-context-protocol-resources** — MCP server geliştirme rehberi.
4. **k8nstantin/OpenPraxis** — multi-agent DAG + audit + cost (ileri orchestration).
5. **modelcontextprotocol/typescript-sdk** — kendi Iceberg MCP server'ı.

## Uygulama Adımları
- [ ] Cursor CLI/SDK kurulum + `CURSOR_API_KEY`
- [ ] Iceberg-docs MCP server (mission + araştırma RAG)
- [ ] GitHub MCP bağlantısı
- [ ] Scaffolder agent (brief → iskelet) — Cursor SDK
- [ ] Handover doc generator (standart README)
- [ ] `.cursor/rules` (Iceberg konvansiyonları)
- [ ] (Ops.) GitHub Actions ile CI review
- [ ] README + güvenlik (key yönetimi)

## Security & Governance
- API key'ler vault/secret manager; frontend'e sızmaz.
- Agent çıktısı **zorunlu human code review** (PR onayı).
- Cloud agent çalışmaları audit'lenir (Cursor Agents Window).
- MCP gateway (auth/RBAC/rate-limit) — production'da (SHARED §4.3).

## Test Planı
- Scaffolder: bilinen brief → beklenen dosya/dizin yapısı (snapshot).
- MCP server: tool çağrıları unit test.
- Güvenlik: key sızıntısı / yetki testleri.

## Demo Senaryosu
1. Operatör M2 brief'ini verir.
2. Agent SHARED araştırmayı RAG'den çeker (Zoom kararları).
3. `zoom-integration-core` iskeleti + signature endpoint stub + README üretir (worktree).
4. Reviewer agent diff'i denetler.
5. Çıktı: çalıştırılabilir iskelet + handover README. "M2 başlangıcı dakikalar içinde."

## Diğer Mission'lara Bağlantı
- M1 AI layer ile ortak prompt/agent pattern.
- M2–M4 boilerplate üreticisi.

## Kırmızı Çizgiler
- Agent çıktısı insan review'u olmadan merge edilmez.
- API key güvenliği taviz verilmez.
- Brief hatalı olduğu için spekülatif kısımlar açıkça işaretli.

## ⚠️ Brief Güncelleme Notu (doğru mission gelince revize)
- [ ] Resmi deliverable listesi (bu plan çıkarımsal).
- [ ] Hedef kullanıcı (sadece intern mi, tüm dev team mi?).
- [ ] Kapsam: salt research mi yoksa çalışan agent mı?
- [ ] Mevcut Iceberg dev stack/CI detayları.
- [ ] IDE-embedded vs standalone vs CI önceliği.
