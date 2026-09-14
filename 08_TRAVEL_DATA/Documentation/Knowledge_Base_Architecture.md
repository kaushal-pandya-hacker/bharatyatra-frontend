# Knowledge Base & RAG Architecture — Chalo Farva

## Normalized Fact Format for AI RAG Engine
Normalized facts stored under [`08_TRAVEL_DATA/Knowledge_Base/normalized_facts.json`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/08_TRAVEL_DATA/Knowledge_Base/normalized_facts.json) feed into vector embeddings (pgvector / Pinecone) for retrieval-augmented generation.

```json
{
  "entityId": "dest-somnath",
  "factCategory": "AARTI_TIMINGS",
  "factContent": "Somnath Temple conducts daily Mahapuja and Aarti at 07:00 AM, 12:00 PM, and 07:00 PM.",
  "provenanceBadge": "VERIFIED_DATA",
  "sourceId": "src-tcgl-official"
}
```
