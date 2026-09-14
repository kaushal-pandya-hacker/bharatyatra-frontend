# Provider Reliability v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.22.0  
**Date**: September 13, 2026  

---

## 1. Executive Summary & Adapter Architecture

The Chalo Farva Provider Reliability architecture decouples core booking domain logic from external supplier and aggregator APIs through a unified **Adapter Pattern** (`ProviderAdapter`).

---

## 2. Normalized Adapter Interface

Every travel provider integration implements the `IProviderAdapter` contract:

```typescript
export interface IProviderAdapter {
  providerId: string;
  category: 'BUS' | 'HOTEL' | 'PACKAGE' | 'ACTIVITY';
  
  checkAvailability(params: AvailabilityParams): Promise<AvailabilityResult>;
  revalidatePrice(params: PriceCheckParams): Promise<PriceResult>;
  createBooking(params: BookingRequestParams): Promise<BookingResult>;
  queryBookingStatus(params: StatusCheckParams): Promise<BookingStatusResult>;
  cancelBooking(params: CancelParams): Promise<CancelResult>;
  processRefund(params: RefundParams): Promise<RefundResult>;
}
```

---

## 3. Circuit Breaker & Health Monitoring

To protect system stability from failing external APIs, every adapter is wrapped in a **Circuit Breaker** (`CircuitBreakerService`):

- **Failure Threshold**: 5 consecutive 5xx errors or timeouts within 60 seconds triggers `OPEN` state.
- **Open Duration**: 30 seconds. While `OPEN`, search requests fallback to cached inventory or alternative providers.
- **Half-Open Probe**: 2 trial requests. If successful, resets to `CLOSED`; if failing, returns to `OPEN`.

---

## 4. Operational Provider SLA Matrix

| Provider ID | Provider Name | Category | Timeout Limit | Retry Strategy | Idempotency Support |
|---|---|---|---|---|---|
| `PRV-GSRTC` | Gujarat State Road Transport (GSRTC) | Bus | 8,000 ms | Status Lookup First | Native (`client_ref`) |
| `PRV-PRVT-BUS` | Private Bus Aggregator (Mantris) | Bus | 6,000 ms | Status Lookup First | Native (`booking_tx_id`) |
| `PRV-HTL-DIRECT`| Chalo Farva Supplier Portal Hotels | Hotel | 5,000 ms | Safe Retry (2x) | Native (`idempotency_key`) |
| `PRV-HTL-AGGR` | Hotel Aggregator API | Hotel | 10,000 ms | Status Lookup First | Native (`merchant_ref`) |
| `PRV-PKG-SOU` | Statue of Unity Ticketing API | Package | 12,000 ms | Status Lookup First | Native (`order_id`) |
| `PRV-WLD-GIR` | Gir National Park Forest Permit | Activity | 15,000 ms | Status Lookup First | Native (`permit_req_id`) |

---

## 5. Safe vs Unsafe Retry Policy

> [!CAUTION]
> **UNSAFE RETRY**: Submitting a secondary `createBooking()` HTTP POST after a network timeout is strictly prohibited unless the provider API explicitly accepts an idempotency key.
> 
> **SAFE RETRY**: Always query `queryBookingStatus()` first to determine whether the original transaction succeeded on the provider side before initiating any secondary booking call.
