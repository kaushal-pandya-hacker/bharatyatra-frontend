# CHALO FARVA — DATABASE SECURITY & PRIVACY SPECIFICATION
**Version:** v1.0.0  
**Date:** September 13, 2026  

---

## 1. Sensitive PII & Financial Safeguards

1. **Passwords**: Stored using Argon2/Bcrypt hash digests with minimum cost factor 12 in `users.password_hash`.
2. **Identity Proofs**: National ID numbers (Aadhaar/Passport) are hashed (`travellers.id_proof_number_hash`) before insertion.
3. **PCI-DSS Compliance**: Raw payment card numbers and CVVs are **NEVER** received or stored. Gateway tokens from Razorpay/UPI handle payment authorization.
4. **Field Encryption**: Sensitive supplier bank accounts use AES-256 field-level encryption with cloud KMS keys.
