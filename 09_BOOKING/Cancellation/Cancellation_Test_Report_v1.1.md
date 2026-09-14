# Cancellation Test Report v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.22.0  
**Date**: September 13, 2026  
**QA Tester**: Senior QA Lead & Reliability Team  

---

## 1. Executive Summary

This report documents the verification of the Chalo Farva Cancellation Engine across customer-initiated, provider-initiated, admin-initiated, and automated system cancellations.

All cancellation workflows strictly adhere to policy eligibility rules, updating booking states to `CANCELLED` and logging financial ledger debit entries without corrupting booking data.

---

## 2. Cancellation Test Case Results

| Test ID | Cancellation Trigger | Condition / Policy | Expected Outcome | Result |
|---|---|---|---|---|
| `TC-CAN-001` | Customer Initiated | Bus booking >24 hrs before departure | 100% refund minus flat ₹50 fee. State → `CANCELLED`. | **PASS** |
| `TC-CAN-002` | Customer Initiated | Bus booking 6-24 hrs before departure | 50% refund per operator policy. State → `CANCELLED`. | **PASS** |
| `TC-CAN-003` | Customer Initiated | Bus booking <2 hrs before departure | 0% refund per policy. Booking marked `CANCELLED_NO_REFUND`. | **PASS** |
| `TC-CAN-004` | Provider Initiated | Operator cancels bus trip (breakdown) | 100% full refund to customer. System dispatches alert. | **PASS** |
| `TC-CAN-005` | System Initiated | Payment success + Provider rejection | Instant 100% refund. State → `FAILED` → `REFUNDED`. | **PASS** |
| `TC-CAN-006` | Admin Initiated | Support ticket manual refund override | Admin RBAC verified. Full refund processed with audit log. | **PASS** |
| `TC-CAN-007` | Unauthorized Attempt | User A attempts cancelling User B trip | IDOR protection blocks attempt with HTTP 403 Forbidden. | **PASS** |

---

## 3. Financial Isolation & Double Cancellation Prevention

- **Idempotent Cancellation API**: Calling `POST /api/v1/bookings/:id/cancel` twice returns HTTP 200 with existing cancellation summary (`CANCELLED` state). No duplicate refund request is generated.
- **Audit Logging**: Every cancellation event generates an immutable record in `booking_audit_logs` detailing user ID, cancellation fee, net refund amount, and timestamp.
