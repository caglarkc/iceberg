# Privacy & GDPR (M4 POC)

> **Status:** POC placeholder — legal sign-off required before production (Faz 3).

## Data processed

| Data | Category | POC handling |
|------|----------|--------------|
| Transcript text | Personal data | In-memory store; not persisted across restart |
| Vendor name/address | Personal data | Mock CRM fixtures only |
| Agent email | Employee data | `owner_hint` matching signal |

Raw audio is **not** stored in POC.

## Lawful basis (draft)

- **Consent:** UI checkbox before extraction (placeholder text — legal review pending)
- **Purpose limitation:** Proposal + valuation follow-up only; no marketing / model training
- **Retention:** POC — process memory only; production target 12 months or proposal close + 6 months

## Third-party processors

| Processor | Role | POC note |
|-----------|------|----------|
| Plaud.ai | Transcription | `ApiPlaudAdapter` when `PLAUD_MODE=live` |
| LLM provider | Structured extraction | Gemini default; EU endpoint TBD |
| Lifesycle CRM | Proposal storage | Mock adapter in POC |

## Technical controls (POC)

- TLS for external API calls (Plaud/LLM)
- No transcript text in application logs
- Human review gate before CRM apply
- Audit log for match / extract / apply / consent

## Data subject rights (Faz 3)

| Right | Planned implementation |
|-------|------------------------|
| Access | Property page transcript view |
| Erasure | `DELETE /api/plaud/recordings/:id` cascade |
| Rectification | Review UI edit before apply |

## DPIA triggers

- Automated profiling: **No** — suggestions only, agent decides
- Cross-border transfer: Plaud US/JP — disclose before live UK customer data
- Special category data: Health/finance in transcript — delete or redact if detected (Faz 2)

## Consent record

`POST /api/consent` stores `property_id`, `contact_id`, `method`, `consented_at` in audit trail.

**Legal review:** Pending Iceberg Digital / Lifesycle sign-off.
