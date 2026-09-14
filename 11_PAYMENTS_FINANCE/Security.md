# Payment Security & Compliance Guidelines v1.0

## 1. Zero Credential Storage Policy
- Raw credit/debit card numbers, CVV, bank passwords, and UPI PINs are NEVER transmitted to or stored on Chalo Farva servers.
- All checkout flows use PCI-DSS compliant hosted iframe or SDK tokenization provided by Razorpay / UPI Gateway.

## 2. Webhook & Secret Protection
- Webhook endpoints require HMAC-SHA256 signature verification.
- Timestamp replay protection rejects payloads older than 5 minutes.
- Secrets are retrieved strictly from environment variables (`PAYMENT_WEBHOOK_SECRET`, `RAZORPAY_KEY_SECRET`), never hard-coded in Git.
