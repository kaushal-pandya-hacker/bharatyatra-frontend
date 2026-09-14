# Booking Failure Handling v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.22.0  
**Date**: September 13, 2026  

---

## 1. Overview & Failure Resolution Strategy

This document specifies the failure isolation, recovery protocols, and user communication matrices for all potential failure modes during the Chalo Farva checkout and booking journey.

---

## 2. Failure Scenarios & Recovery Matrix

| Failure Case | Symptom | Underlying Cause | Automated System Action | User Messaging |
|---|---|---|---|---|
| **CASE A** | Payment Fails | Card declined / insufficient funds | Transition to `FAILED`. Do NOT initiate provider booking API. Release inventory lock. | `"Payment declined by bank. Please try another payment method. No charges were made."` |
| **CASE B** | Payment Succeeds | Gateway callback verified | Transition to `PAYMENT_CONFIRMED` → `BOOKING_PENDING`. Dispatch provider API. | `"Payment received! Confirming your booking with the provider..."` |
| **CASE C** | Payment & Provider Succeed | Instant PNR / Voucher returned | Transition to `CONFIRMED`. Generate PDF voucher. Send WhatsApp & Email alert. | `"Booking Confirmed! Your voucher is ready in My Trip."` |
| **CASE D** | Payment Succeeds + Provider Rejects | Room / seat sold out during checkout | Transition to `FAILED`. Automatically trigger 100% refund job (`REFUND_PENDING`). Log ledger reversal. | `"We couldn't confirm your seat with the bus operator. A full refund of ₹X has been initiated to your original payment method."` |
| **CASE E** | Payment Succeeds + Provider Times Out | Provider API >10s timeout or 504 Gateway Error | Transition to `PROVIDER_UNKNOWN`. Do NOT retry booking API. Dispatch background status polling job every 30s for up to 5 min. | `"Your payment was received, but we're awaiting final operator confirmation. Check My Trip shortly or we'll notify you via SMS."` |
| **CASE F** | Webhook Repeated | Duplicate `payment.captured` event | Idempotency engine detects existing `event_id` in Redis. Returns HTTP 200 OK without re-processing. | No duplicate user alert. Existing status maintained. |
| **CASE G** | Network / Browser Refresh | User closes tab during checkout | Webhook handles payment confirmation asynchronously. Updating database state regardless of browser connection. | User views updated state upon returning to My Trip. |

---

## 3. Unknown Provider State Resolution Algorithm

```python
def resolve_unknown_provider_state(booking_id: str):
    booking = get_booking(booking_id)
    if booking.state != "PROVIDER_UNKNOWN":
        return
    
    # Query provider by idempotency key / merchant transaction ref
    provider_status = provider_adapter.query_booking_status(
        merchant_ref=booking.merchant_ref,
        idempotency_key=booking.idempotency_key
    )
    
    if provider_status.is_confirmed:
        booking.transition_to("CONFIRMED", provider_ref=provider_status.pnr)
        generate_voucher(booking)
        send_notification(booking, event="BOOKING_CONFIRMED")
    elif provider_status.is_rejected:
        booking.transition_to("FAILED", reason=provider_status.error_message)
        trigger_automatic_refund(booking, reason="PROVIDER_REJECTION_AFTER_TIMEOUT")
        send_notification(booking, event="BOOKING_FAILED_REFUND_INITIATED")
    else:
        # Re-queue for next polling interval if within 5-minute window
        if booking.created_at > now() - timedelta(minutes=5):
            schedule_polling_job(booking_id, delay_seconds=30)
        else:
            # Escalate to manual ops queue & trigger auto-refund safeguard
            booking.transition_to("RECONCILIATION_REQUIRED")
            trigger_automatic_refund(booking, reason="PROVIDER_TIMEOUT_EXCEEDED")
```

---

## 4. Idempotency & Replay Protection

1. **API Request Level**: Endpoints (`POST /api/v1/bookings/checkout`) enforce the `Idempotency-Key` HTTP header. Repeated submissions return the cached HTTP response payload.
2. **Database Level**: Unique index on `bookings(payment_order_id)` and `booking_items(provider_reference)`.
3. **Webhook Level**: Payment gateway `event_id` stored in Redis with 7-day TTL (`seen:webhook:<event_id>`).
