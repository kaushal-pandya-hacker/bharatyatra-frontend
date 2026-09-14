# AI Decision Log Schema v1.0

## Log Contract
All AI planning decisions generate a structured decision log entry for auditability:

```json
{
  "log_id": "log-771a92f0",
  "timestamp": "2026-09-13T18:49:00Z",
  "request_id": "req-8891f7a2",
  "user_id": "usr-491a02",
  "intent_extracted": {
    "interests": ["heritage"],
    "budget_category": "moderate"
  },
  "retrieved_fact_ids": ["dest-statue-of-unity", "dest-somnath"],
  "route_sequence": ["Ahmedabad", "Kevadia", "Somnath"],
  "llm_provider": "GeminiLLMProvider",
  "validation_status": "PASSED",
  "violations_detected": []
}
```
