# Travel Data Architecture v1.0 — Chalo Farva

## 1. Vision & Expandable Scope
Chalo Farva's Travel Knowledge Base provides a structured, provenance-tagged travel knowledge foundation.

```text
[ Data Sources: TCGL / ASI / Forest Dept / Official Sites ]
                         │
                         ▼
┌───────────────────────────────────────────────────┐
│        Normalization & Validation Pipeline        │ (Coordinates check, Slug uniqueness)
└────────────────────────┬──────────────────────────┘
                         │
                         ▼
┌───────────────────────────────────────────────────┐
│      Structured JSON Datasets & Provenance        │ ([VERIFIED_DATA], [LIVE_PROVIDER_DATA])
└────────────────────────┬──────────────────────────┘
                         │
                         ▼
┌───────────────────────────────────────────────────┐
│          PostgreSQL DB & RAG Knowledge Base       │ (Normalized facts, Vector RAG ready)
└───────────────────────────────────────────────────┘
```

The data architecture is structured for scalable geographic expansion:
`Gujarat → India → International Destinations`.
