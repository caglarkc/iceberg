# Ortak AI Araştırma Çıktıları

Tüm mission'lar için **cross-cutting** araştırma raporları. Mission'a özel implementation prompt'ları ilgili `missions/m*/research/` altındadır.

## Model Klasörleri

| Klasör | İçerik |
|--------|--------|
| `opus/` | SHARED_RESEARCH_REPORT + EXECUTIVE_SUMMARY |
| `composer/` | SHARED_RESEARCH_REPORT + EXECUTIVE_SUMMARY |
| `codex/` | SHARED_RESEARCH_REPORT + EXECUTIVE_SUMMARY |
| `grok/` | SHARED_RESEARCH_REPORT + EXECUTIVE_SUMMARY |
| `codex5.5-chrome/` | SHARED + EXECUTIVE (en detaylı implementation prompt'lar mission altında) |
| `grok-chrome/` | SHARED + EXECUTIVE |
| `gemini/` | `FULL_RESEARCH_OUTPUT.md` — tüm mission çıktıları tek dosyada |

## Değerlendirme

7 AI karşılaştırması: [`../documents/FINAL_EVALUATION_AND_CONSOLIDATED_PLAN.md`](../documents/FINAL_EVALUATION_AND_CONSOLIDATED_PLAN.md)

## Mission Implementation Prompt'ları

```
missions/m1-iceberg-x-intelligence-layer/research/{model}/IMPLEMENTATION_PROMPT.md
missions/m2-zoom-integration-core/research/{model}/IMPLEMENTATION_PROMPT.md
missions/m3-lifesycle-zoom-meeting-flow/research/{model}/IMPLEMENTATION_PROMPT.md
missions/m4-property-intelligence-pipeline/research/{model}/IMPLEMENTATION_PROMPT.md
missions/m5-agent-stack/research/{model}/IMPLEMENTATION_PROMPT.md
```

`{model}` = `opus` | `composer` | `codex` | `grok` | `codex5.5-chrome` | `grok-chrome`
