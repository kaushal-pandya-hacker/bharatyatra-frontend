# CHALO FARVA — ADAPTIVE AI ARCHITECTURE SPECIFICATION v1.0

**Product**: Chalo Farva (Gujarat-First AI Travel Platform)  
**Version**: `v1.0.0` (Build `v1.26.0`)  
**Status**: `IMPLEMENTED & AUDITED`

---

## 1. SYSTEM TOPOLOGY & REAL-TIME DISRUPTION PIPELINE

The Adaptive AI system operates as a real-time event-driven orchestration layer monitoring live/verified external conditions and evaluating their impact on active traveler itineraries.

```
 [ EXTERNAL EVENT ] ──► [ CHANGE EVENT NORMALIZER ]
(Weather/Traffic/Close)        │ (Event ID, Severity, Location, Time Window)
                               ▼
                   [ IMPACT ANALYSIS ENGINE ]
               (Determine Affected Itinerary Items)
                               │
                               ▼
               [ ALTERNATIVE GENERATION ENGINE ]
              (RAG Knowledge Base / Verified POIs)
                               │
                               ▼
           [ DETERMINISTIC IQS CONSTRAINT VALIDATOR ]
         (Check Opening Hours, Route Math & Budget Cap)
                               │
                               ▼
               [ NATURAL LANGUAGE EXPLANATION ]
              (LLM Formatted Clear Reason & Impact)
                               │
                               ▼
                  [ USER APPROVAL INTERFACE ]
               (ACCEPT CHANGE / VIEW ALTERNATIVES)
                               │
                               ▼
             [ IMMUTABLE ITINERARY VERSIONING ]
            (Version v1.0 -> Version v2.0 + Change Diff)
```

---

## 2. 11-STEP DISRUPTION ORCHESTRATION STAGES

1. **Live/Verified Event Ingestion**: Ingests normalized events (`WEATHER_CHANGE`, `TRANSPORT_DELAY`, `ATTRACTION_CLOSED`).
2. **Relevance & Threshold Checking**: Filters minor fluctuations; evaluates thresholds (e.g., rainfall $> 25\text{mm/hr}$ for outdoor activities).
3. **Impact Assessment**: Calculates time overlap, location distance, and activity sensitivity.
4. **Affected Item Identification**: Isolates affected itinerary slots.
5. **Alternative Candidate Retrieval**: Queries RAG knowledge base for nearby indoor/alternative attractions.
6. **Deterministic IQS Validation**: Validates operating hours, transit time, and budget compliance ($\le \text{budget}$).
7. **Multi-Criteria Alternative Ranking**: Ranks options based on distance, cost, safety, and user preference.
8. **AI Explanation Generation**: Formats clear, jargon-free explanation detailing what changed, why, and budget/time impact.
9. **User Approval Presentation**: Displays `⚠️ TRIP UPDATE` UI modal with explicit `[ACCEPT CHANGE]` button.
10. **Immutable Version Creation**: Advances itinerary version from `v1.0` to `v2.0` upon user acceptance.
11. **Multi-Channel Notification Dispatch**: Sends in-app and push notification updates.
