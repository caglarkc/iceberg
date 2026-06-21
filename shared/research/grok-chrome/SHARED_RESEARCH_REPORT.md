# SHARED_RESEARCH_REPORT.md

## Ortak Araştırma Sentezi (20 Haziran 2026)

### 1. Lifesycle CRM & Iceberg Digital
Lifesycle, Iceberg Digital'in estate agency CRM platformu. Özellikler: Property valuation, listing, applicant matching, timeline tracking.

### 2. Zoom Ekosistemi
Meeting SDK branded embed için ideal. S2S OAuth önerilir. Zoom Phone webhooks mevcut.

### 3. Plaud.ai
API mevcut, transcript retrieval destekli.

### 4. AI Stack
LangGraph + Cursor SDK önerilir.

### Bağımlılık Grafiği
```mermaid
graph TD
    M2 --> M3
    M3 --> M4
    M1 --> M5
```

### Riskler
Zoom Partner escalate, GDPR.