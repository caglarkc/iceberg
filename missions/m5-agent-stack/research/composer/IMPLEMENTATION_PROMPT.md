# M5: Agent Stack — AI Dev Workflow Assistant — Implementation Prompt (Composer)

> ⚠️ **Mission dosyası içeriği hatalı** — çıkarımsal plan. Doğru brief gelince revize edilecek.  
> **Bağlam kaynağı:** `SHARED_RESEARCH_REPORT_composer.md`  
> **Yazar:** Composer

---

## Bağlam

Mission 5 brief'i yanlışlıkla M3 metni içeriyor. Çıkarımsal kapsam:

- Kod yazma, review, test, docs, debugging'de AI agent
- Mission POC üretimi hızlandırma
- MCP, RAG, handover doc generation
- M1-M4 geliştirme force multiplier

---

## Hedef Ürün

**Iceberg Dev Agent** — Cursor SDK tabanlı:

1. Mission brief'ten POC iskeleti üret
2. Zoom/Plaud boilerplate scaffold
3. Handover dokümantasyonu otomatik üret
4. Codebase-aware RAG

---

## Architecture Options

| Yaklaşım | Skor |
|----------|------|
| A: IDE-embedded (Cursor SDK) | **Önerilen** |
| B: Standalone CLI (Aider) | Alternatif |
| C: CI-integrated (PR bot) | Uzun vade |

---

## Tool Chain

| Bileşen | Seçim |
|---------|-------|
| Agent runtime | Cursor SDK (`@cursor/sdk`) |
| LLM | Composer 2.5 |
| MCP | GitHub, filesystem, zoom/skills |
| RAG | Cursor codebase indexing |

```typescript
import { Agent } from "@cursor/sdk";

const agent = await Agent.create({
  apiKey: process.env.CURSOR_API_KEY!,
  model: { id: "composer-2.5" },
  local: { cwd: process.cwd() },
});

const run = await agent.send(
  "Create Zoom meeting SDK POC scaffold based on M2_IMPLEMENTATION_PROMPT_composer.md"
);
```

---

## Capability Map

| Capability | Priority |
|------------|----------|
| Mission scaffolding | P0 |
| Handover doc gen | P0 |
| Code generation | P0 |
| Zoom/Plaud templates | P1 |
| Code review | P1 |

---

## GitHub Referansları

| Repo | Kullanım |
|------|----------|
| [Cursor SDK docs](https://cursor.com/docs/sdk/typescript) | Primary runtime |
| [zoom/skills](https://github.com/zoom/skills) | Zoom MCP pattern |
| [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) | MCP examples |
| [openai/openai-agents-python](https://github.com/openai/openai-agents-python) | Orchestration ref |
| [Aider](https://github.com/Aider-AI/aider) | Git-native alt |

---

## Uygulama Fazları

### Faz 1: Cursor SDK + mission templates
### Faz 2: MCP servers + scaffold skill
### Faz 3: Handover generator + demo

---

## Demo Senaryosu

1. `iceberg-agent scaffold --mission M4`
2. Agent M4_IMPLEMENTATION_PROMPT_composer.md okur
3. 5-10 dk'da repo iskeleti üretir
4. `docker-compose up` — endpoint responds
5. handover/ klasörü dolu

---

## Security & Governance

- API keys env-only
- Agent output = draft, human merge zorunlu
- PII mock data

---

## ⚠️ Brief Güncelleme Sonrası Revize

- [ ] Resmi deliverable listesi
- [ ] Evaluation rubric
- [ ] CI/CD gereksinimi

---

## Final Recommendation

**Cursor SDK + MCP** — en hızlı time-to-value.  
**Alternatif:** Aider (open source).
