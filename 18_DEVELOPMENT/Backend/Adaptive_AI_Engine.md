# Adaptive AI Engine — Chalo Farva

## Core Architectural Principle
The Adaptive AI Engine continuously monitors trip conditions (monsoon alerts, traffic delays, venue closures) and recalculates alternative itinerary slots.

## Hard Constraint Validation Pipeline
Before presenting any AI-suggested itinerary change to the traveler, candidate slots MUST pass deterministic rule checks:
1. **Operating Hours Check**: Target venue open during candidate slot window.
2. **Travel Distance Constraint**: Distance between slots within max travel time threshold (+30 mins).
3. **Budget Constraint**: Price of alternative activity within user budget preference (+15% max margin).
4. **Accessibility / Interest Fit**: Preserves original traveler preferences.

## Data Provenance Badges
- `VERIFIED_DATA`: Official operating hours, official entry fees.
- `LIVE_AVAILABILITY`: Live bus/hotel/ticket availability.
- `AI_RECOMMENDATION`: Generative AI suggested route & spot recommendations.
