# M1: Iceberg X Platform Improvement — Implementation Prompt (Composer)

> **Bağlam kaynağı:** `SHARED_RESEARCH_REPORT_composer.md`  
> **Hedef:** Iceberg X Intelligence Layer — AI + analytics + tracking modülleri  
> **Yazar:** Composer

---

## Bağlam

Iceberg X, Iceberg Digital'in R&D mission, intern, mentor yönetim platformu. Resmi POC seçenekleri: AI Mission Generator (A), Progress Dashboard (B), Submission Tracker (C), Badge System (D), AI Review Assistant (E).

**Stratejik öneri:** Tek POC yerine bağlantılı **Iceberg X Intelligence Layer** — modüler ama demo'da birlikte etkileyici.

---

## Hedef Ürün

**Iceberg X Intelligence Layer** — 3 entegre modül:

1. **AI Mission Generator** — brief'ten structured mission üret
2. **Mission Progress Dashboard** — mentor/admin analytics
3. **Submission Tracker** — deliverable checklist + status

Opsiyonel hafta 3+: Badge hooks, AI Review Assistant stub

---

## Kapsam

### In Scope
- Platform audit metodolojisi uygulama
- Pain point matrix
- 1-3 modül POC (A+B+C önerilen)
- AI integration (OpenAI/Anthropic API)
- Demo day senaryosu

### Out of Scope
- Full Iceberg X rewrite
- Production deployment
- Slack bot (quick win doc only)

---

## Mimari

```
┌─────────────────────────────────────────────────────────────┐
│                 Iceberg X Intelligence Layer POC               │
├──────────────────┬──────────────────┬───────────────────────┤
│ AI Mission Gen   │ Progress Dashboard│ Submission Tracker    │
│ (Module A)       │ (Module B)        │ (Module C)            │
├──────────────────┴──────────────────┴───────────────────────┤
│                    Shared: missions, users, submissions        │
│                    AI Service Layer (LLM + prompt templates)   │
└─────────────────────────────────────────────────────────────┘
```

### Özellik Karşılaştırma

| POC | Değer | Zorluk | Demo Impact | Öncelik |
|-----|-------|--------|-------------|---------|
| A: AI Mission Generator | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | P0 |
| B: Progress Dashboard | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | P0 |
| C: Submission Tracker | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | P1 |
| D: Badge System | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | P2 |
| E: AI Review Assistant | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | P2 |

---

## Tech Stack

| Katman | Öneri | Gerekçe |
|--------|-------|---------|
| Backend | Laravel (Iceberg stack) veya Node.js | Main team'e sor |
| Frontend | React veya mevcut Iceberg X stack | Tutarlılık |
| AI | OpenAI GPT-4o / Anthropic Claude | Structured output |
| DB | PostgreSQL | Mevcut infra |
| Cache | Redis (opsiyonel) | Dashboard queries |

---

## Data Model

```typescript
interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'active' | 'completed' | 'archived';
  category: string;
  estimated_hours: number;
  learning_objectives: string[];
  deliverables: Deliverable[];
  created_by: string;
  assigned_mentor_id?: string;
  created_at: string;
}

interface Deliverable {
  id: string;
  mission_id: string;
  title: string;
  type: 'code' | 'doc' | 'demo' | 'research';
  required: boolean;
  due_date?: string;
}

interface Submission {
  id: string;
  mission_id: string;
  intern_id: string;
  deliverable_id: string;
  status: 'pending' | 'submitted' | 'reviewed' | 'approved';
  repo_url?: string;
  demo_url?: string;
  notes?: string;
  submitted_at?: string;
}

interface MissionProgress {
  mission_id: string;
  intern_id: string;
  completion_percent: number;
  deliverables_submitted: number;
  deliverables_total: number;
  last_activity_at: string;
}
```

---

## API Spesifikasyonu

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/ai/missions/generate` | Brief'ten mission üret |
| GET | `/api/missions` | Liste (filter: status, difficulty) |
| GET | `/api/missions/:id` | Detay + deliverables |
| GET | `/api/dashboard/progress` | Aggregated progress (mentor view) |
| GET | `/api/dashboard/mentor-workload` | Mentor başına aktif mission |
| POST | `/api/submissions` | Deliverable submit |
| PATCH | `/api/submissions/:id` | Status update |
| GET | `/api/missions/:id/submissions` | Mission submissions |

**AI Mission Generator prompt template:**
```
Given this R&D brief, generate a structured mission with:
- title, description (2-3 paragraphs)
- difficulty (beginner/intermediate/advanced)
- 3-5 learning objectives
- 4-6 deliverables with types
- estimated hours
- evaluation rubric (5 criteria, 1-5 scale)

Brief: {{user_input}}
```

---

## UI/UX Spesifikasyonu

### Sayfalar

1. **Admin: AI Mission Creator** — textarea brief + "Generate" + edit form
2. **Mentor: Progress Dashboard** — cards: active missions, completion %, at-risk interns
3. **Intern: My Missions** — mission list + submission checklist per mission
4. **Intern: Submit Work** — deliverable form (repo URL, demo URL, notes)

### Roller

| Rol | Erişim |
|-----|--------|
| Admin | AI generator, all dashboards |
| Mentor | Assigned missions progress, review submissions |
| Intern | Own missions, submit deliverables |
| Leadership | Read-only aggregate dashboard |

---

## GitHub Referansları

| Repo | Kullanım |
|------|----------|
| [franverona/questlog](https://github.com/franverona/questlog) | Badge system pattern (Module D) |
| [ActiDoo/gamification-engine](https://github.com/ActiDoo/gamification-engine) | Achievement rules engine |
| [openai/openai-agents-python](https://github.com/openai/openai-agents-python) | AI evaluation agent pattern |
| [ntatoud/achievements-manager](https://github.com/ntatoud/achievements-manager) | Lightweight achievement tracking |
| LangGraph examples | Multi-step mission generation workflow |

---

## Uygulama Adımları

### Hafta 1: Foundation
- [ ] Mevcut Iceberg X audit (user interview soruları)
- [ ] Pain point matrix doldur
- [ ] POC repo scaffold
- [ ] Data model migration

### Hafta 2: Core Modules
- [ ] AI Mission Generator endpoint + UI
- [ ] Progress Dashboard queries + UI
- [ ] Submission Tracker CRUD

### Hafta 3: Polish
- [ ] Demo seed data (5 missions, 3 interns)
- [ ] AI review assistant stub (opsiyonel)
- [ ] Badge event hooks (opsiyonel)
- [ ] Demo rehearsal

---

## Test Planı

- AI generator: valid JSON mission output
- Dashboard: doğru completion % hesabı
- Submission: status workflow (pending→submitted→approved)
- Role permissions: intern başka intern'in submission'ını göremez

---

## Demo Senaryosu

1. Admin yeni brief girer: "Build Zoom CRM integration POC"
2. AI 30 saniyede structured mission üretir — edit, publish
3. Intern dashboard'da mission görür — deliverable checklist
4. Mentor dashboard'da 3 intern progress — 1 "at risk" (kırmızı)
5. Intern repo URL submit eder — status "submitted"
6. Mentor review — "approved" — progress %100

---

## Handover Checklist

- [ ] Platform Review Document
- [ ] User Workflow Analysis (4 rol)
- [ ] Technical Proposal (data model, API)
- [ ] Improvement Ideas List (prioritized)
- [ ] POC source code + README
- [ ] Final Recommendation

---

## Metrikler

| Metrik | Hedef |
|--------|-------|
| Mission creation time | <2 min (AI vs 30+ min manual) |
| Mentor visibility | 100% assigned mission progress |
| Submission tracking | 0 missed deliverables (demo) |

---

## Diğer Mission Bağlantıları

- M2/M3/M4 mission'ları Iceberg X'te yönetilir — bu POC direkt senin workflow'unu iyileştirir
- M5 Agent Stack, mission generator'ı dev workflow'a taşır

---

## Kırmızı Çizgiler

- AI output her zaman human review'dan geçmeli
- Production Iceberg X DB'sine direkt yazma — ayrı POC schema
- PII içeren intern data mock'la

---

## Final Recommendation

**İlk yapılacak:** AI Mission Generator (A) + Progress Dashboard (B)  
**Quick win:** Submission Tracker (C)  
**Derin planlama:** Badge system (D), Slack integration
