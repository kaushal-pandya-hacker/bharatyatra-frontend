# CHALO FARVA — DATABASE SECURITY & PRIVACY POLICY
**Version:** v1.0.0  
**Date:** September 13, 2026  

---

## 1. Sensitive Data Classification

| Data Type | Field Names | Protection Requirement |
| :--- | :--- | :--- |
| **Authentication Secrets** | `users.password_hash` | Argon2/Bcrypt hash (minimum work factor 12) |
| **Personally Identifiable (PII)** | `users.email`, `users.phone_number`, `travellers.full_name` | Encrypted at rest (AES-256) & SSL in transit |
| **Identity Proofs** | `travellers.id_proof_number_hash` | SHA-256 hashed digest (no plain ID storage) |
| **Payment Card Details** | Credit / Debit Card Number, CVV | **STRICTLY PROHIBITED** (Handled via Razorpay Vault) |
| **Supplier Financials** | `supplier_bank_details_reference.account_number_encrypted` | AES-256 KMS field-level encryption |

---

## 2. Access Control & Row-Level Security (RLS)

- **Database Users**: Separate DB user credentials for `app_backend`, `analytics_worker`, and `admin_migration`.
- **Least Privilege Principle**: `app_backend` has `SELECT, INSERT, UPDATE` access to core tables, but `DELETE` is restricted to soft-delete columns (`deleted_at`).
- **Audit Logging**: All admin updates, payment status modifications, and commission changes write immutable entries to `audit_logs`.
