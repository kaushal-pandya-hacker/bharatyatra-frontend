# CHALO FARVA — ADMIN ROLE-BASED ACCESS CONTROL (RBAC) SPECIFICATION v1.0

**Product**: Chalo Farva (Gujarat-First AI Travel Platform)  
**Version**: `v1.0.0` (Build `v1.26.0`)  
**Status**: `IMPLEMENTED`

---

## 1. 6 OPERATIONAL RBAC ROLES & PERMISSION MATRIX

| Feature / Resource | SUPER_ADMIN | OPERATIONS_ADMIN | FINANCE_ADMIN | CONTENT_ADMIN | SUPPORT_ADMIN | AI_OPERATIONS_ADMIN |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **User Management** | READ/WRITE | READ/WRITE | READ | READ | READ | READ |
| **Supplier Approval** | READ/WRITE | READ/WRITE | READ | NO | NO | NO |
| **Financial Ledger** | READ/WRITE | READ | READ/WRITE | NO | NO | NO |
| **Refund Processing** | READ/WRITE | NO | READ/WRITE | NO | READ (Ticket) | NO |
| **Settlement Approval**| READ/WRITE | NO | READ/WRITE | NO | NO | NO |
| **Travel Content** | READ/WRITE | READ | NO | READ/WRITE | READ | NO |
| **AI Monitoring** | READ/WRITE | READ | NO | NO | READ | READ/WRITE |
| **Support Tickets** | READ/WRITE | READ/WRITE | READ | READ | READ/WRITE | READ |

---

## 2. SERVER-SIDE ENFORCEMENT PROTOCOL

All NestJS REST controllers evaluate role guards (`@UseGuards(JwtAuthGuard, RolesGuard)`). Client-side JWT payloads are verified against database role assignments to prevent privilege escalation or unauthorized state mutations.
