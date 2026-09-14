# AI Planner Execution Flow v1.0

## Execution Steps
1. **User Prompt Intake**: Received at NestJS `/api/v1/ai/trip-plan`.
2. **Intent Parsing & Security Filtering**: Untrusted user prompt is sanitized for prompt injection keywords (`ignore previous instructions`).
3. **Verified Knowledge Retrieval**: Relevant facts fetched from `normalized_facts.json`.
4. **Sequence Optimization**: Route sequence computed by `RouteOptimizer` using Haversine & nearest-neighbor matrix.
5. **LLM Generation**: Prompt constructed with strict JSON formatting instructions.
6. **Pydantic Schema Parsing**: JSON auto-repaired and validated.
7. **Deterministic Rule Validation**: Opening hours, monsoon dates, distance caps checked by `HardConstraintEngine`.
8. **Budget Engine Calculation**: Exact cost breakdowns calculated by `BudgetEngine`.
9. **Provenance Marking**: Activities tagged as `VERIFIED_DATA` or `AI_GENERATED_RECOMMENDATION`.
