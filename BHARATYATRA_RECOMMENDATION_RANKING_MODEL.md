# BharatYatra AI 2.0 — Multi-Factor Recommendation Ranking Model & Quality Metrics

## 1. Mathematical Formulation

The BharatYatra Destination Ranking Engine scores candidate destinations using a multi-factor objective function:

$$\text{FitScore}(D) = \min\left(100, \max\left(10, \left(0.40 \cdot S_{\text{interest}} + W_{\text{budget}} + W_{\text{season}} + 0.20 \cdot W_{\text{dist}}\right) - P_{\text{penalty}}\right)\right)$$

Where each component is deterministically computed from verified data:

---

## 2. Component Scoring Breakdown

### 1. Interest Alignment Score ($S_{\text{interest}}$)
$$S_{\text{interest}} = 40 + \left(18 \cdot N_{\text{explicit\_matches}}\right) + \sum_{k} \left(15 \cdot W_{\text{inferred}}[k]\right) + B_{\text{feedback}}$$
- $N_{\text{explicit\_matches}}$: Number of user's explicit interests matching destination categories.
- $W_{\text{inferred}}[k]$: Learned weights for matching inferred tags ($0.0 \le W \le 1.0$).
- $B_{\text{feedback}}$:
  - $+25$ if destination was previously `LIKED`.
  - $+20$ if destination is in `savedDestinations`.
  - $-\infty$ if destination was `DISLIKED` or in `excludedDestinations`.

### 2. Budget Compatibility Weight ($W_{\text{budget}}$)
Evaluated against Phase 5/6 calibrated trip cost:
- If trip cost $\le \text{UserBudget} \cdot 0.85$: $W_{\text{budget}} = +25$ (High budget surplus).
- If trip cost $\le \text{UserBudget} \cdot 1.25$: $W_{\text{budget}} = +25$ (Within tolerance).
- If trip cost $> \text{UserBudget} \cdot 1.25$: $W_{\text{budget}} = -15$ and $P_{\text{budget\_penalty}} = 30$.

### 3. Seasonal Suitability Weight ($W_{\text{season}}$)
Evaluated against Phase 3/4 weather intelligence:
$$W_{\text{season}} = \text{round}\left(\frac{\text{SeasonalSuitabilityScore}}{100} \cdot 25\right)$$
- Ideal weather window (e.g. Rajasthan/Goa in Nov-Feb): $+25$.
- Moderate weather (e.g. October/March): $+18$.
- Extreme monsoon / winter freeze: $+5$.

### 4. Distance & Route Feasibility Weight ($W_{\text{dist}}$)
Based on Haversine distance $D_{\text{km}}$ from origin:
$$W_{\text{dist}} = \max\left(10, \min\left(25, 25 - \text{round}\left(\frac{D_{\text{km}}}{100}\right)\right)\right)$$
- Weekend getaways ($\le 350\text{ km}$): $+22$ to $+25$.
- Long-haul corridors: Scaled proportionally, constrained to duration feasibility ($D_{\text{km}} \le \text{DurationDays} \cdot 700\text{ km}$).

### 5. Senior & Family Penalty ($P_{\text{penalty}}$)
- If traveling with seniors ($\ge 60\text{y}$) and destination elevation $\ge 2,800\text{m}$ (e.g. Leh):
  $$P_{\text{altitude\_penalty}} = 30$$

---

## 3. Sort Order & Budget Priority

When presenting recommendations to users who have declared a budget ceiling, destinations are sorted with hard budget priority:
1. Candidate destinations whose total trip cost fits within $\text{UserBudget} \cdot 1.25$ always sort before destinations with budget shortfalls.
2. Within the same budget feasibility tier, candidates sort descending by $\text{FitScore}$.

---

## 4. Recommendation Quality Evaluation Metrics

To rigorously monitor the engine's performance without relying on subjective chatbot impressions, BharatYatra measures five formal mathematical metrics:

| Metric | Formula | Definition & Target |
|---|---|---|
| **Precision@K** | $\frac{|\text{Relevant} \cap \text{TopK}|}{K}$ | Fraction of top-$K$ recommendations that match explicit or inferred user interests. Target: $\ge 0.75$. |
| **NDCG@K** | $\frac{\text{DCG}@K}{\text{IDCG}@K}$ | Normalized Discounted Cumulative Gain penalizing relevant items ranked lower down. Target: $\ge 0.75$. |
| **Diversity Score** | $\frac{|\text{Unique States in TopK}|}{K}$ | Ratio of distinct Indian states represented in top-$K$ ensuring no regional monopoly. Target: $\ge 0.30$. |
| **Duplicate Rate** | $\frac{K - |\text{Unique Items}|}{K}$ | Fraction of duplicate items presented in the recommendation carousel. Target: $\mathbf{0.0}$. |
| **Constraint Violation Rate** | $\frac{|\text{Items Violating Budget or Duration}|}{K}$ | Percentage of returned destinations exceeding user budget or travel physics. Target: $\le \mathbf{0.10}$. |

