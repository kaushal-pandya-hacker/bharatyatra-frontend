# Analytics Architecture Specification v1.1 — Chalo Farva

**Centralized Event Collector & Telemetry Ingestion Flow**

---

## Architectural Diagram

```
[ Frontend Client SDK (client.ts) ] / [ Backend Services ]
                        ↓
            [ POST /api/v1/analytics/events ]
                        ↓
       [ AnalyticsService.validateAndTrackEvent() ]
   (Schema Check, Deduplication, Timestamp Sanity)
                        ↓
        [ Session & Identity Merging Engine ]
   (Maps anonymous_id -> session_id -> user_id)
                        ↓
     [ Authoritative DB Storage / Aggregation Engine ]
                        ↓
       [ 12 Admin REST Reporting APIs ]
                        ↓
    [ Next.js 14 Admin Analytics Dashboard ]
```

### Key Architectural Principles
- **Authoritative Financial Metrics**: Derived from database tables (`payments`, `bookings`, `financial_ledger`), independent of client tracking errors.
- **Asynchronous Execution**: Ingestion runs non-blockingly; failure to log analytics never interrupts traveler booking or search flows.
- **Idempotent Ingestion**: `eventId` deduplication prevents artificial metric inflation.
