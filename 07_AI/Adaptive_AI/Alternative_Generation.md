# Alternative Generation & Ranking Strategy v1.0

## 1. Candidate Retrieval Pipeline
1. Identify disrupted slot (e.g. Sabarmati Riverfront Boating).
2. Query verified indoor catalog or nearby POIs in same city.
3. Filter by operational hours and weather sensitivity.
4. Calculate cost difference: $\Delta \text{Cost} = \text{Cost}_{\text{New}} - \text{Cost}_{\text{Original}}$.

## 2. Ranking Score Formula
$$\text{RankScore}(A) = 0.4 \cdot \text{PreferenceMatch} + 0.3 \cdot \text{IndoorSafety} - 0.2 \cdot \Delta \text{Cost} - 0.1 \cdot \text{DetourDistance}$$
- Highest scoring candidate presented as `recommendedSlot`.
