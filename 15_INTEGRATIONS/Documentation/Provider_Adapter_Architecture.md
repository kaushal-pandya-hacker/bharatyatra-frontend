# Provider Adapter Architecture — Chalo Farva

## Response Normalization Standard
All external provider responses are converted into Chalo Farva Standard Models before returning to controllers or the AI engine.

```typescript
export interface NormalizedItem {
  id: string;
  providerId: string;
  externalReference: string;
  title: string;
  priceInr: number;
  provenance: 'LIVE' | 'VERIFIED' | 'AI_SUGGESTED';
  retrievedAt: string;
}
```
