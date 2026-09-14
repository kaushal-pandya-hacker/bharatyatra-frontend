# Bus Booking Flow v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.22.0  
**Date**: September 13, 2026  

---

## 1. End-to-End Bus Booking Sequence

```
USER                  FRONTEND              BACKEND / DB          PAYMENT GATEWAY       BUS OPERATOR API
 │                       │                       │                      │                      │
 │ 1. Select Seat(s)     │                       │                      │                      │
 ├──────────────────────►│                       │                      │                      │
 │                       │ 2. Hold Seat (10m)    │                      │                      │
 │                       ├──────────────────────►│                      │                      │
 │                       │                       │ 3. Lock Seat in Redis│                      │
 │                       │                       ├─────────────────────►│                      │
 │                       │                       │                      │ 4. Hold Seat API     │
 │                       │                       ├────────────────────────────────────────────►│
 │                       │ 5. Seat Locked        │                      │                      │
 │                       │◄──────────────────────┤                      │                      │
 │ 6. Confirm & Pay      │                       │                      │                      │
 ├──────────────────────►│ 7. Create Payment Order                       │                      │
 │                       ├──────────────────────►│ 8. Razorpay Order    │                      │
 │                       │                       ├─────────────────────►│                      │
 │                       │ 9. Launch Payment Modal                      │                      │
 │                       │◄─────────────────────────────────────────────┤                      │
 │ 10. Enter OTP / Pay   │                       │                      │                      │
 ├───────────────────────────────────────────────┴─────────────────────►│                      │
 │                       │                       │ 11. Payment Webhook  │                      │
 │                       │                       │◄─────────────────────┤                      │
 │                       │                       │ 12. Confirm Bus Booking API                │
 │                       │                       ├────────────────────────────────────────────►│
 │                       │                       │ 13. Returns PNR & Bus Ticket PDF            │
 │                       │                       │◄────────────────────────────────────────────┤
 │                       │ 14. Confirmed Status  │                      │                      │
 │                       │◄──────────────────────┤                      │                      │
 │ 15. View E-Ticket     │                       │                      │                      │
 └──────────────────────►│                       │                      │                      │
```

---

## 2. Key Reliability Checks & Seat Hold Governance

1. **Atomic 10-Minute Seat Hold**: Seats selected by a user are held in Redis (`lock:bus:seat:<trip_id>:<seat_no>`) for 600 seconds.
2. **Price Revalidation**: If bus operator updates seat pricing between selection and checkout, checkout flags price mismatch (`PRICE_CHANGED_EVENT`) and requests user confirmation.
3. **Seat Availability Check**: Before payment order creation, backend checks live seat matrix. If seat is lost during checkout, checkout is aborted before charging user.
4. **Payment Success + Seat Loss Handling**: If payment succeeds but seat operator rejects confirmation (e.g. offline counter booking conflict), system sets booking to `FAILED`, triggers 100% immediate refund, and notifies passenger via WhatsApp & SMS.
