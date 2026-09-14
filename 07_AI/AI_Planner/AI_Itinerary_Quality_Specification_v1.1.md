# AI Itinerary Quality Specification v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.21.0  
**Date**: September 13, 2026  

---

## 1. Overview & Quality Philosophy

The Chalo Farva AI Itinerary Quality Specification establishes a quantitative, deterministic framework for scoring and validating generated travel plans. The objective is to eliminate subjective quality assessments and enforce mathematically verifiable standards across 8 core dimensions.

---

## 2. Deterministic Itinerary Quality Score (IQS)

The overall **Itinerary Quality Score ($IQS$)** is a normalized composite index between 0.00 and 100.00 points, calculated using the weighted sum of 8 sub-scores:

$$IQS = \sum_{i=1}^{8} (W_i \times S_i)$$

| Dimension ($i$) | Metric Name | Weight ($W_i$) | Passing Threshold | Scoring Logic Summary |
|---|---|---|---|---|
| 1 | **Route Efficiency ($S_1$)** | 0.20 | $\ge 85.0$ | Minimizes backtracking ratio; penalizes unnecessary transit legs. |
| 2 | **Time Feasibility ($S_2$)** | 0.20 | $\ge 95.0$ | Checks non-overlapping slots, realistic driving speeds (45-60 km/h), meal windows. |
| 3 | **Opening-Hour Compliance ($S_3$)** | 0.15 | $100.0$ | Binary/Strict check: 0 points if any POI is visited during closed hours/days. |
| 4 | **Budget Compliance ($S_4$)** | 0.15 | $\ge 90.0$ | Penalizes cost overruns relative to specified user budget ceiling. |
| 5 | **Preference Match ($S_5$)** | 0.10 | $\ge 80.0$ | Ratio of recommended POI categories matching user selected interest vector. |
| 6 | **Activity Balance ($S_6$)** | 0.05 | $\ge 80.0$ | Enforces activity density appropriate for user selected travel pace (`RELAXED`, `BALANCED`, `ACTIVE`). |
| 7 | **Travel Burden ($S_7$)** | 0.05 | $\ge 85.0$ | Penalizes excessive daily driving hours (>5 hrs/day triggers penalty). |
| 8 | **Weather Compatibility ($S_8$)** | 0.10 | $\ge 90.0$ | Penalizes outdoor activities scheduled during high rain/heat risk. |

**Minimum Acceptance Threshold**: An itinerary must achieve an $IQS \ge 85.00$ and zero hard constraint violations ($S_3 = 100.0$) to be presented to the user.

---

## 3. Detailed Dimension Specifications & Scoring Formulas

### 3.1 Route Efficiency Score ($S_1$)
Calculated as the ratio of optimal Travelling Salesperson Problem (TSP) distance to actual scheduled distance:
$$S_1 = \min\left(100, \frac{D_{\text{optimal}}}{D_{\text{scheduled}}} \times 100\right)$$
Where $D_{\text{optimal}}$ is the shortest road network distance computed via the distance matrix.

### 3.2 Time Feasibility Score ($S_2$)
$$S_2 = 100 - (15 \times N_{\text{overlaps}}) - (10 \times N_{\text{rushed\_transits}})$$
Where $N_{\text{overlaps}}$ is the count of overlapping schedules and $N_{\text{rushed\_transits}}$ is the count of transit legs allocated under minimum driving time.

### 3.3 Opening-Hour Compliance Score ($S_3$)
$$S_3 = \begin{cases} 100.0 & \text{if all POIs visited strictly within open hours and non-closed days} \\ 0.0 & \text{if any POI visited while closed} \end{cases}$$

### 3.4 Budget Compliance Score ($S_4$)
If Total Estimated Cost $C_{\text{total}} \le \text{Budget Ceiling } B$:
$$S_4 = 100.0$$
If $C_{\text{total}} > B$:
$$S_4 = \max\left(0, 100 - \left(\frac{C_{\text{total}} - B}{B} \times 200\right)\right)$$

### 3.5 Weather Compatibility Score ($S_8$)
$$S_8 = 100 - (25 \times N_{\text{weather\_conflict}})$$
Where $N_{\text{weather\_conflict}}$ counts outdoor activities scheduled during heavy rain or monsoon closures.

---

## 4. Conflict Resolution Priority Hierarchy

When user constraints mutually conflict (e.g., active pace + low budget + distant hubs in 1 day), the deterministic engine resolves conflicts using the strict hierarchy below:

```
1. SAFETY & WEATHER CLOSURES (e.g. Gir monsoon closure June 16–Oct 15)
   ↓
2. HARD OPERATING HOURS (Statue of Unity closed Mondays)
   ↓
3. TRAVEL FEASIBILITY (Max physical driving limits per day)
   ↓
4. USER MUST-HAVES (Explicitly listed must-visit POIs)
   ↓
5. BUDGET CONSTRAINTS (Max daily ceiling)
   ↓
6. USER PREFERENCES (Interest category weighting)
   ↓
7. ROUTE SEQUENCE OPTIMIZATION
```

---

## 5. Provenance & Provenance Tracking Specification

Every JSON payload returned by the AI planner must annotate every itinerary node with its provenance state:
- `VERIFIED_PLATFORM_DATA`: Static POI details verified in database.
- `LIVE_PROVIDER_DATA`: Real-time pricing/availability from integration APIs.
- `LIVE_WEATHER_DATA`: Live weather forecast payload.
- `AI_RECOMMENDATION`: Sequence synthesized by AI model.
- `ESTIMATE`: Indicative expense calculated by heuristic rule.

No AI payload may present `AI_RECOMMENDATION` or `ESTIMATE` as `LIVE_PROVIDER_DATA`.
