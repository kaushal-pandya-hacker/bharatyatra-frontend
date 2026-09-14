# CHALO FARVA — ADAPTIVE AI OPERATIONAL RULES & THRESHOLDS v1.0

**Product**: Chalo Farva (Gujarat-First AI Travel Platform)  
**Version**: `v1.0.0` (Build `v1.26.0`)  
**Status**: `IMPLEMENTED`

---

## 1. 13 CORE OPERATIONAL RULES

1. **Rule 1 (Zero Silent Financial Mutation)**: Adaptive AI MUST NEVER silently modify, cancel, or rebook paid services. Any change involving costs or bookings requires explicit user authorization.
2. **Rule 2 (Explicit Data Provenance)**: All UI elements must clearly display data origin (`AI GENERATED`, `VERIFIED PLATFORM DATA`, `LIVE PROVIDER DATA`).
3. **Rule 3 (Deterministic Authority)**: IQS deterministic constraint engine is the sole authority for timing, budget, and travel feasibility.
4. **Rule 4 (Threshold Filtering)**: Minor weather fluctuations (e.g., light drizzle $< 5\text{mm/hr}$) must not trigger intrusive alerts.
5. **Rule 5 (Deduplication)**: Disruption events sharing `event_id` or `deduplication_key` must be deduplicated to prevent notification spam.
6. **Rule 6 (Monsoon Sensitivity)**: Gir National Park closures (July 16 – Oct 15) and coastal ferry suspensions are treated as high-severity rules.
7. **Rule 7 (Version Preservation)**: Previous itinerary versions (`v1.0`, `v1.1`, etc.) must be immutably preserved in the database.
8. **Rule 8 (Prompt Injection Defense)**: External event data must be sanitized before passing to LLM explanation prompts.
9. **Rule 9 (Budget Non-Exceedance)**: Recommended replacements must not breach the user's total trip budget limit.
10. **Rule 10 (Rest Buffer Guarantee)**: Minimum 30-minute buffer time must be preserved between consecutive activities.
11. **Rule 11 (User-Initiated Reaction)**: User changes to trip duration or dates automatically trigger itinerary re-sequencing.
12. **Rule 12 (Audit Logging)**: All event detections, impact calculations, recommendations, and user decisions must be logged.
13. **Rule 13 (Graceful Fallback)**: If live disruption data cannot be verified, the UI displays *"Live disruption data unavailable"* rather than fabricating facts.

---

## 2. SEVERITY & THRESHOLD MATRIX

| Disruption Category | Metric / Condition | Severity Level | System Reaction |
| :--- | :--- | :--- | :--- |
| **Light Weather** | Rainfall $< 10\text{mm/hr}$ (Indoor Activity) | `INFO` | No Alert / Silent Log |
| **Moderate Rain** | Rainfall $15\text{--}30\text{mm/hr}$ (Outdoor Sightseeing)| `MEDIUM` | Recommendation Alert |
| **Heavy Monsoon** | Rainfall $> 40\text{mm/hr}$ / Ferry Closure | `HIGH` | Immediate `⚠️ TRIP UPDATE` Modal |
| **Transit Delay** | Bus Delay $> 60\text{ minutes}$ | `HIGH` | Re-sequencing Recommendation |
| **Attraction Closure** | Maintenance / Sanctuary Closed | `CRITICAL` | Replacement POI Recommendation |
