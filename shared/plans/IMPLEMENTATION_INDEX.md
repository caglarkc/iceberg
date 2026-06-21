# Iceberg X — Implementation Starter Index

> AI agent'lar kod yazmaya başlamadan önce bu indeksi, ardından `SHARED_PLAN_CONSTRAINTS.md` ve ilgili mission dosyalarını okur.

**Güncelleme:** 21 Haziran 2026 (v1.1)

---

## Ortak Kurallar

📄 **[SHARED_PLAN_CONSTRAINTS.md](./SHARED_PLAN_CONSTRAINTS.md)** — credential politikası, LLM, zorunlu testler

| Kısıt | Ay 1 |
|-------|------|
| Zoom dev + şirket test hesabı + Zoom Phone | **Atla** (M2/M3 mock) |
| Plaud API | **Live** — key'ler sağlanacak (M4) |
| LLM | Gemini varsayılan; OpenAI + Anthropic destekli |
| Testler | CI merge blocker — her mission |

---

## 5 Mission — Plan + Starter Prompt

| # | Ürün | Plan | Starter Prompt | Repo adı |
|---|------|------|----------------|----------|
| M1 | Iceberg X Intelligence Layer | [DEMO_AND_ROADMAP_PLAN.md](../../missions/m1-iceberg-x-intelligence-layer/plans/DEMO_AND_ROADMAP_PLAN.md) | [STARTER_IMPLEMENTATION_PROMPT.md](../../missions/m1-iceberg-x-intelligence-layer/plans/STARTER_IMPLEMENTATION_PROMPT.md) | `iceberg-x-intelligence-poc` |
| M2 | Zoom Integration Core | [DEMO_AND_ROADMAP_PLAN.md](../../missions/m2-zoom-integration-core/plans/DEMO_AND_ROADMAP_PLAN.md) | [STARTER_IMPLEMENTATION_PROMPT.md](../../missions/m2-zoom-integration-core/plans/STARTER_IMPLEMENTATION_PROMPT.md) | `zoom-integration-core` |
| M3 | Lifesycle Zoom Meeting Flow | [DEMO_AND_ROADMAP_PLAN.md](../../missions/m3-lifesycle-zoom-meeting-flow/plans/DEMO_AND_ROADMAP_PLAN.md) | [STARTER_IMPLEMENTATION_PROMPT.md](../../missions/m3-lifesycle-zoom-meeting-flow/plans/STARTER_IMPLEMENTATION_PROMPT.md) | `lifesycle-zoom-crm-poc` |
| M4 | Property Intelligence Pipeline | [DEMO_AND_ROADMAP_PLAN.md](../../missions/m4-property-intelligence-pipeline/plans/DEMO_AND_ROADMAP_PLAN.md) | [STARTER_IMPLEMENTATION_PROMPT.md](../../missions/m4-property-intelligence-pipeline/plans/STARTER_IMPLEMENTATION_PROMPT.md) | `property-intelligence-pipeline` |
| M5 | Agent Stack | [DEMO_AND_ROADMAP_PLAN.md](../../missions/m5-agent-stack/plans/DEMO_AND_ROADMAP_PLAN.md) | [STARTER_IMPLEMENTATION_PROMPT.md](../../missions/m5-agent-stack/plans/STARTER_IMPLEMENTATION_PROMPT.md) | `agent-stack` |

---

## Önerilen Başlatma Sırası

1. **M2** önce veya M3 ile paralel — M3, M2'nin HTTP sözleşmesini mock olarak tüketir
2. **M1, M4, M5** birbirinden bağımsız
3. Her agent **tek repo**, **tek mission**

---

## AI Agent Başlatma (Kopyala-Yapıştır)

📋 **Hazır kısa prompt'lar:** [AGENT_KICKOFF_PROMPTS.md](./AGENT_KICKOFF_PROMPTS.md)

```
Görev: M[N] mission'ını sıfırdan implement et.

1. Önce oku: shared/plans/SHARED_PLAN_CONSTRAINTS.md
2. Sonra oku: missions/m[N]-*/plans/DEMO_AND_ROADMAP_PLAN.md
3. Uygula: missions/m[N]-*/plans/STARTER_IMPLEMENTATION_PROMPT.md

Kurallar:
- Testler her milestone'da zorunlu; CI yeşil olmadan ilerleme sayılmaz
- Her aşama (Faz 0, Hafta 1, …) sonunda commit + push — unutma
- v1.1 credential kısıtlarına uy
- README + TEST_PLAN + HANDOVER + .env.example üret
```

---

## Env Checklist (Kullanıcı Sağlar)

```bash
GEMINI_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
LLM_PROVIDER=gemini

# M4
PLAUD_API_BASE_URL=
PLAUD_CLIENT_ID=
PLAUD_CLIENT_API_KEY=

# M2/M3 — Ay 1
ZOOM_MODE=mock
```
