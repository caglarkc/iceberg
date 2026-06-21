# Iceberg X — R&D Mission Workspace

Iceberg Digital **5 paralel R&D mission** için araştırma, planlama ve implementation dokümantasyonu.

**Güncelleme:** 21 Haziran 2026

**GitHub:** https://github.com/caglarkc/iceberg

---

## Klasör Yapısı

```
iceberg/
├── shared/                          # Tüm mission'lar için ortak
│   ├── documents/                   # Genel bakış, değerlendirme, research prompt
│   ├── plans/                       # Ortak kısıtlar + implementation indeksi
│   └── research/                    # AI ortak araştırma raporları (model bazlı)
│       ├── opus/
│       ├── composer/
│       ├── codex/
│       ├── grok/
│       ├── gemini/
│       ├── codex5.5-chrome/
│       └── grok-chrome/
└── missions/
    ├── m1-iceberg-x-intelligence-layer/
    ├── m2-zoom-integration-core/
    ├── m3-lifesycle-zoom-meeting-flow/
    ├── m4-property-intelligence-pipeline/
    └── m5-agent-stack/
        ├── brief/                   # Resmi mission brief
        ├── plans/                   # Demo roadmap + starter implementation prompt
        └── research/                # Mission'a özel AI çıktıları (model bazlı)
            └── {model}/IMPLEMENTATION_PROMPT.md
```

---

## Hızlı Başlangıç (AI Agent)

1. [`shared/plans/IMPLEMENTATION_INDEX.md`](shared/plans/IMPLEMENTATION_INDEX.md)
2. [`shared/plans/SHARED_PLAN_CONSTRAINTS.md`](shared/plans/SHARED_PLAN_CONSTRAINTS.md)
3. İlgili mission: `missions/m[N]-*/plans/STARTER_IMPLEMENTATION_PROMPT.md`

---

## Mission Özeti

| # | Klasör | Ürün |
|---|--------|------|
| M1 | `missions/m1-iceberg-x-intelligence-layer/` | Iceberg X Intelligence Layer |
| M2 | `missions/m2-zoom-integration-core/` | Zoom Integration Core |
| M3 | `missions/m3-lifesycle-zoom-meeting-flow/` | Lifesycle Zoom Meeting Flow |
| M4 | `missions/m4-property-intelligence-pipeline/` | Property Intelligence Pipeline |
| M5 | `missions/m5-agent-stack/` | Agent Stack |

Detay: [`shared/documents/MISSIONS_OVERVIEW.md`](shared/documents/MISSIONS_OVERVIEW.md)

---

## Araştırma Değerlendirmesi

7 AI çıktısı karşılaştırması: [`shared/documents/FINAL_EVALUATION_AND_CONSOLIDATED_PLAN.md`](shared/documents/FINAL_EVALUATION_AND_CONSOLIDATED_PLAN.md)
# iceberg
