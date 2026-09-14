# Output Validation Strategy v1.0

## Validation Pipeline
1. **JSON Markdown Cleanup**: Strips ` ```json ` fences.
2. **Pydantic Validation**: Ensures exact field types and required fields.
3. **Hard Constraint Validation**:
   - Closed days check
   - Monsoon closure check
   - Daily transit limit check
4. **Budget Cap Enforcement**: Ensures total cost <= budget cap.
5. **Fallback Correction**: If validation fails after 1 retry, falls back to deterministic safe itinerary template.
