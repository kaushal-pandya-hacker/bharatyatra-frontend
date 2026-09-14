# Domain Event Model & Normalization Matrix — Chalo Farva

**Last Updated:** September 13, 2026  
**Version:** v1.0  

---

## 1. Normalized Domain Event Catalog

| Event Name | Domain Category | Default Channels | Priority | Description |
| :--- | :--- | :--- | :--- | :--- |
| `USER_REGISTERED` | Auth / User | EMAIL | NORMAL | Welcome email & account verification |
| `BOOKING_CREATED` | Booking | PUSH, EMAIL | NORMAL | Booking request received |
| `BOOKING_CONFIRMED` | Booking | PUSH, EMAIL, SMS | HIGH | Provider confirmed reservation (ticket attached) |
| `BOOKING_FAILED` | Booking | PUSH, EMAIL | HIGH | Provider reservation failed / slot unavailable |
| `PAYMENT_SUCCESS` | Payment | PUSH, EMAIL, SMS | NORMAL | Payment received confirmation |
| `PAYMENT_FAILED` | Payment | PUSH, EMAIL | HIGH | Payment authorization failure |
| `REFUND_REQUESTED` | Refund | EMAIL | NORMAL | Refund request lodged |
| `REFUND_COMPLETED` | Refund | PUSH, EMAIL, SMS | HIGH | Refund credited to original payment method |
| `TRIP_REMINDER` | Trip | PUSH, WHATSAPP | NORMAL | Trip departure / check-in reminder |
| `ADAPTATION_PROPOSED`| Adaptive AI | PUSH, EMAIL, WHATSAPP | URGENT | Weather / traffic disruption alternative proposed |
| `SUPPLIER_BOOKING` | Supplier | EMAIL, PUSH | HIGH | New vendor reservation received |
| `SUPPORT_UPDATED` | Support | EMAIL, PUSH | NORMAL | Customer support ticket agent reply |

---

## 2. Event Normalization Guarantee

Provider-specific event names (e.g. `GSRTC_SEAT_RESERVED`, `HOTEL_BOOKING_OK`, `RAZORPAY_PAYMENT_CAPTURED`) are transformed into standardized domain events before ingestion into `NotificationService`. Business logic logic and template lookup operate solely on standardized domain events.
