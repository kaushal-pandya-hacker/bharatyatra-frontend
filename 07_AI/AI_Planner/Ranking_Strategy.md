# Destination & Activity Ranking Strategy v1.0

## 1. Overview
Activities are ranked using a multi-factor scoring function:

$$\text{Score}(A) = w_1 \cdot \text{Relevance}(A, U) + w_2 \cdot \text{Rating}(A) + w_3 \cdot \text{ProvenanceScore}(A) - w_4 \cdot \text{DetourDistance}(A)$$

## 2. Weighting Factors
- **Provenance Score**: `VERIFIED_DATA` receives +20 bonus over unverified suggestions.
- **Dietary Match**: Pure Veg / Jain filter compatibility +15 bonus.
- **Pacing Penalty**: Excessive travel detours (> 50 km off primary route) penalized heavily.
