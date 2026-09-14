# Hotel Booking Flow v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.22.0  
**Date**: September 13, 2026  

---

## 1. End-to-End Hotel Booking Sequence

```
USER                  FRONTEND              BACKEND / DB          PAYMENT GATEWAY       HOTEL PROVIDER API
 │                       │                       │                      │                      │
 │ 1. Select Room & Dates│                       │                      │                      │
 ├──────────────────────►│                       │                      │                      │
 │                       │ 2. Check Room Alloc   │                      │                      │
 │                       ├──────────────────────►│ 3. Query Inventory   │                      │
 │                       │                       ├────────────────────────────────────────────►│
 │                       │ 4. Available Room     │                      │                      │
 │                       │◄──────────────────────┤                      │                      │
 │ 5. Enter Guest Details│                       │                      │                      │
 ├──────────────────────►│ 6. Create Order       │                      │                      │
 │                       ├──────────────────────►│ 7. Payment Order     │                      │
 │                       │                       ├─────────────────────►│                      │
 │ 8. Pay via Razorpay   │                       │                      │                      │
 ├───────────────────────────────────────────────┴─────────────────────►│                      │
 │                       │                       │ 9. Webhook Captured  │                      │
 │                       │                       │◄─────────────────────┤                      │
 │                       │                       │ 10. Issue Hotel Confirmation API            │
 │                       │                       ├────────────────────────────────────────────►│
 │                       │                       │ 11. Voucher ID & Check-in Code             │
 │                       │                       │◄────────────────────────────────────────────┤
 │                       │ 12. Voucher Ready     │                      │                      │
 │                       │◄──────────────────────┤                      │                      │
 │ 13. Download Voucher  │                       │                      │                      │
 └──────────────────────►│                       │                      │                      │
```

---

## 2. Key Reliability Checks & Room Inventory Rules

1. **Guest Detail Validation**: Strict schema checks on primary guest name, phone number, government ID type (Aadhaar, Passport, Driving License), and special meal preferences.
2. **Room Allotment Lock**: Room inventory is locked during payment pending state (`lock:hotel:room:<hotel_id>:<room_type>`).
3. **Voucher Generation Requirement**: Hotel voucher PDF is generated **ONLY** when `hotel_confirmation_code` is returned by hotel provider API.
4. **Cancellation Policy Enforcement**: Free cancellation window (e.g., up to 48 hours before check-in date) stored as integer timestamp. Late cancellations auto-compute applicable cancellation fee per hotel policy.
