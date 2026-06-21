# M4: Plaud Transcript Retrieval — Implementation Prompt (Composer)

> **Bağlam kaynağı:** `SHARED_RESEARCH_REPORT_composer.md`  
> **Hedef:** Plaud özetlerini Lifesycle property workflow'una bağlama  
> **Yazar:** Composer

---

## Bağlam

UK estate agent'lar valuation randevularında detaylı konuşma yapıyor. Plaud cihazları bu konuşmaları kaydediyor. Hedef: transcript/summary'yi otomatik Lifesycle'a aktarmak, doğru property ile eşleştirmek, proposal alanlarına auto-fill.

**Plaud API durumu (2026-06-20):** Developer Platform mevcut, partner onboarding gerekli (dev.plaud.ai). US/JP region aktif; EU coming soon.

---

## Hedef Ürün

**Property Intelligence Pipeline:**

```
Plaud Recording → Ingest → Parse → Match → Review → Apply to Property Proposal
```

---

## Kapsam

### In Scope
- Plaud Transcription API entegrasyonu (veya mock)
- Entity matching + confidence score
- Property proposal field mapping
- Review UI (manual confirmation)
- M3 timeline entegrasyonu
- Fallback plan

### Out of Scope
- Plaud device SDK (mobile BLE) — stretch
- Production GDPR legal review
- Full Uzair integration

---

## Mimari

### Retrieval Options

| Yaklaşım | Skor |
|----------|------|
| Polling API | **MVP** |
| Webhook push | Preferred |
| Manual CSV export | Fallback |

**Account Model Önerisi:** Hybrid — company API key + per-agent user token

---

## Data Model

```typescript
interface PlaudRecording {
  id: string;
  plaud_transcription_id: string;
  company_id: string;
  user_id: string;
  recorded_at: string;
  raw_transcript: string;
  summary?: string;
  status: 'pending' | 'transcribed' | 'matched' | 'reviewed' | 'applied';
}

interface EntityMatch {
  recording_id: string;
  property_id?: string;
  contact_id?: string;
  confidence: number;
  match_signals: Record<string, number>;
  status: 'auto' | 'suggested' | 'confirmed' | 'rejected';
}

interface PropertyProposalDraft {
  property_id: string;
  source_recording_id: string;
  fields: {
    asking_price_estimate?: number;
    property_condition?: string;
    seller_motivation?: string;
    key_features?: string[];
    next_steps?: string[];
  };
}
```

---

## Entity Matching

1. Appointment correlation (M3 timeline ±30dk)
2. Address fuzzy match
3. Contact name match
4. Manual confirmation (confidence <0.7)

```
confidence = 0.35*appointment + 0.30*address + 0.20*contact + 0.10*timestamp + 0.05*geo
```

---

## API Spesifikasyonu

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/plaud/ingest` | Audio URL veya mock transcript |
| GET | `/api/plaud/recordings` | Liste |
| GET | `/api/plaud/recordings/:id` | Detay + match suggestions |
| POST | `/api/plaud/recordings/:id/match` | Manual confirm |
| POST | `/api/plaud/recordings/:id/apply` | Proposal apply |

---

## GitHub Referansları

| Repo | Kullanım |
|------|----------|
| [Plaud-AI/plaud-template-app](https://github.com/Plaud-AI/plaud-template-app) | API auth + transcription |
| [afras23/meeting-notes-crm-sync](https://github.com/afras23/meeting-notes-crm-sync) | CRM sync pattern |
| [Vexa-ai/vexa](https://github.com/Vexa-ai/vexa) | Fallback pipeline |

---

## Fallback Plan

| Senaryo | Çözüm |
|---------|-------|
| API erişim gecikmesi | Mock transcript JSON |
| EU region yok | US host + DPA |
| API kısıtlı | Fireflies GraphQL alternatif |

---

## Demo Senaryosu

1. Mock Plaud recording ingest
2. Inbox: "94% match: 47 High Street"
3. Review panel — extracted fields
4. Confirm → property proposal draft güncellenir
5. M3 timeline'da "Plaud summary applied"

---

## Final Recommendation

**MVP:** Mock data + full pipeline — API beklemeden demo-ready  
**Production:** Plaud partner onboarding + EU region escalate
