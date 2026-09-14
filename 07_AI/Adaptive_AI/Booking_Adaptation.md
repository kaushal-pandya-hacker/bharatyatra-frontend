# Booking & Financial Adaptation Strategy v1.0

## 1. Classification & Workflow
When a vendor notifies of a cancellation (e.g. `BUS_CANCELLED` or `HOTEL_CHANGED`):
1. Ingest event & flag affected booking.
2. Mark booking status as `REBOOKING_REQUIRED`.
3. Compute alternative transport/stay option with exact price delta.
4. Present proposal to user with explicit `requiresUserApproval: true`.
5. User confirms -> invoke rebooking API + refund/payment workflow -> issue new confirmation.
6. User rejects -> refund workflow initiated for cancelled segment.
