# Payment Integration — Chalo Farva

## Supported Payment Gateways
- **Razorpay**: Primary gateway for UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and Wallet payments.
- **UPI Deep Linking**: Direct mobile app redirection for instant UPI payments.

## Transaction Flow & Webhooks
1. Client initiates checkout via `POST /api/v1/payments/checkout`.
2. Backend creates Razorpay order ID and returns session parameters.
3. User completes payment on client.
4. Razorpay sends HMAC-SHA256 signed webhook to `POST /api/v1/payments/webhook`.
5. Backend verifies signature, updates payment status to `CAPTURED`, and triggers invoice generation.
