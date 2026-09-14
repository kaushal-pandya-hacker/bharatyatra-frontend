# Promotion & Referral Strategy v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.25.0  
**Date**: September 13, 2026  

---

## 1. Overview & Anti-Abuse Rules

This document specifies coupon management, referral tracking, and promotional discount guardrails on Chalo Farva.

---

## 2. Coupon Validation Engine

- **Single Active Coupon**: Only 1 promotional code (`coupon_code`) can be applied per checkout transaction.
- **Minimum Booking Threshold**: Coupons (e.g. `GUJARAT500` for ₹500 off) enforce minimum booking values (e.g. ₹5,000).
- **Positive Margin Guard**: The system hard-blocks any coupon application that would reduce the Net Contribution Margin below ₹100.00.

---

## 3. Referral Program & Anti-Abuse Governance

```
Referrer (User A) ──► Shares Unique Code ──► Friend (User B) Signs Up
                                                     │
                                                     ▼
                                          User B Completes 1st Trip
                                                     │
                                                     ▼
                                    ₹250 Travel Voucher Credited to A & B
```

- **Fraud Guard**: Unique device fingerprinting + mobile OTP validation prevents self-referrals or fake account creation. Duplicate IPs/devices block reward generation.
