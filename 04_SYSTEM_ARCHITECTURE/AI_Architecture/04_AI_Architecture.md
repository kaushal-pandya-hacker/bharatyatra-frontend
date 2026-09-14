# Adaptive AI Engine Architecture — Chalo Farva

## 1. Multi-Stage AI Pipeline

```text
[ User Input / Preference ]
            │
            ▼
┌───────────────────────┐
│ Generative AI Engine  │ (Generates candidate itinerary slots)
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Deterministic Rules   │ (Validates operating hours, travel times, budget caps)
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Provenance Annotator  │ (Attaches [Verified Data], [Live Availability], [AI Recommendation])
└───────────┬───────────┘
            │
            ▼
[ Final Validated Itinerary ]
```

## 2. Adaptive Re-Routing Architecture
When external weather alerts (e.g., heavy rains in Kutch/Gir) or road closures occur:
1. Event listener captures weather advisory.
2. System identifies affected itinerary day slots.
3. Deterministic engine evaluates candidate replacements.
4. User receives instant notification with one-tap itinerary acceptance.
