# AI Analytics Specification v1.1 — Chalo Farva

**Target Component**: AI Trip Planner & Adaptive AI Microservices  

---

## AI Quality & Evaluation Metrics

- **Planner Submissions**: Total prompts processed by Python FastAPI microservice.
- **Generation Success Rate**: Proportion of valid JSON itineraries returned (`AI_ITINERARY_GENERATED` / `AI_PLANNER_SUBMITTED`).
- **Generation Latency**: Average generation time (Current P95: 1,420 ms).
- **Prompt Acceptance Rate**: 72.0% (3,110 accepted out of 4,320 generated).
- **User Major Edits Rate**: 18.5% (800 itineraries edited before acceptance).
- **Model / Prompt Version Attributes**: Every event logs `model_version`, `prompt_version`, and `knowledge_version` for side-by-side quality evaluation.
