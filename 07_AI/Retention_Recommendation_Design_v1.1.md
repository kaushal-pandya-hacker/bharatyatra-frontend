# Retention Recommendation Design v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.25.0  
**Date**: September 13, 2026  
**Author**: AI Product Engineer & ML Lead  

---

## 1. Recommendation Architecture & Similarity Matching

The **AI Repeat Trip Recommendation Engine** generates personalized travel suggestions based on past user interactions, trip types, seasonal appeal, and interest vectors.

```
+-----------------------------------------------------------------------------------+
| User Vector (Past Destinations, Pace, Budget, Interest Weights)                   |
+-----------------------------------┬-----------------------------------------------+
|                                   │
|                                   ▼
|         [Cosine Similarity Vector Search over 24 Gujarat Hubs]                   |
|                                   │
|                                   ▼
|       [Deterministic Constraint Filtering (Season, Weather, Hours)]              |
|                                   │
|                                   ▼
|      [Top 3 Relevant Next-Trip Cards Displayed in My Trip Dashboard]             |
+-----------------------------------------------------------------------------------+
```

---

## 2. Safety & Grounding Guardrails

- **Zero Hallucination Grounding**: Every recommended POI and hotel is fetched from verified database records.
- **Explainable Rationale**: Every recommendation presents concise user-facing reasoning (e.g., *"Since you enjoyed the heritage stepwells in Ahmedabad, you might like the Champaner-Pavagadh UNESCO World Heritage circuit"*).
- **Non-Invasive UI Placement**: Recommendations appear natively inside My Trip and post-trip emails; zero intrusive popups or disruptive modals.
