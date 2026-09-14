# CHALO FARVA — SUPPLIER ONBOARDING & VERIFICATION SPECIFICATION v1.0

**Product**: Chalo Farva (Gujarat-First AI Travel Platform)  
**Version**: `v1.0.0` (Build `v1.26.0`)  
**Status**: `IMPLEMENTED`

---

## 1. VERIFICATION STATE MACHINE

```
 [ DRAFT ] ──► [ SUBMITTED ] ──► [ UNDER_REVIEW ] ──► [ APPROVED ]
                                         │
                                         ├────────────► [ REJECTED ]
                                         │
                                         └────────────► [ SUSPENDED ]
```

### State Definitions
1. **`DRAFT`**: Initial registration; supplier is filling business profile.
2. **`SUBMITTED`**: Profile and documents submitted for admin verification.
3. **`UNDER_REVIEW`**: Operations team is conducting penny drop and document checks.
4. **`APPROVED`**: Verification complete; inventory published to live marketplace.
5. **`REJECTED`**: Documents rejected; supplier must rectify and resubmit.
6. **`SUSPENDED`**: Admin suspended account due to quality or compliance breach.
