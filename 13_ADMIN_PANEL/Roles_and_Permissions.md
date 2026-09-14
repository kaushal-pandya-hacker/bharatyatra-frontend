# Role-Based Access Control (RBAC) & Permission Matrix v1.0

## 1. Admin Roles
- `SUPER_ADMIN`: Full operational and system permissions.
- `OPERATIONS_ADMIN`: Manages suppliers, inventory, packages, and bookings.
- `FINANCE_ADMIN`: Manages payments, refunds, settlements, and double-entry ledger oversight.
- `CONTENT_ADMIN`: Manages Gujarat destination travel content, attractions, and reviews.
- `SUPPORT_AGENT`: Manages support tickets, customer communications, and internal notes.
- `AI_OPERATIONS`: Monitors AI planner performance, prompt logs, and adaptive proposals.

## 2. Permission Matrix
- `USER_VIEW`, `USER_MANAGE`
- `SUPPLIER_VIEW`, `SUPPLIER_APPROVE`, `SUPPLIER_SUSPEND`
- `BOOKING_VIEW`, `BOOKING_MANAGE`
- `PAYMENT_VIEW`, `REFUND_MANAGE`
- `SETTLEMENT_VIEW`, `SETTLEMENT_APPROVE`
- `AI_VIEW`, `AI_MANAGE`
- `SUPPORT_VIEW`, `SUPPORT_MANAGE`
