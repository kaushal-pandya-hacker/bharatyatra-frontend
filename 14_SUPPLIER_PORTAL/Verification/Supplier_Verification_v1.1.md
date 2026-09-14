# Supplier Verification Specification v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.23.0  
**Date**: September 13, 2026  

---

## 1. Overview & Verification Lifecycle

The Chalo Farva **Supplier Verification Engine** ensures that only legitimate, legal, and verified travel suppliers can sell inventory to customers.

```
[APPLICATION] ──► [DOCUMENT SUBMISSION] ──► [PENDING / UNDER REVIEW]
                                                   │
                        ┌──────────────────────────┴──────────────────────────┐
                        ▼                                                     ▼
                   [VERIFIED]                                            [REJECTED]
                        │                                                     │
               (Live Inventory Enabled)                                (Re-apply Allowed)
```

---

## 2. Mandatory Verification Documents

| Document Type | Verification Standard | Security & Access Rule |
|---|---|---|
| **GST Registration Certificate** | Verified via NSDL / GST portal API | Private; S3 encrypted with 15-min signed URL access. |
| **Business PAN Card** | Verified via NSDL API lookup | Private; masked except last 4 digits in admin UI. |
| **Cancelled Cheque / Bank Proof** | Verified via Penny Drop API (IFSC + Acc No) | Private; encrypted at rest (AES-256). |
| **Property Ownership / Lease Proof** | Verified manually by Chalo Farva Ops team | Private; strictly accessible by `ROLE_ADMIN`. |
| **Trade / Tourism License** | Government tourism department permit | Private; expiry date tracked in DB. |

---

## 3. Verification State Rules

- **Unverified Block**: A supplier in `PENDING`, `UNDER_REVIEW`, or `REJECTED` state **CANNOT** publish live inventory to the public travel search catalog.
- **Expiry Notification**: Documents nearing expiry (within 30 days) trigger automated email alerts to the supplier. If expired, supplier transitions to `UNDER_REVIEW` until updated.
