# Payment Architecture — Chalo Farva

## Payment Provider Abstraction
- Gateway integration operates behind `PaymentProvider` interface.
- Initial development environment uses `MockPaymentProvider` clearly labeled as `DEVELOPMENT MOCK`.
- Webhook signature verification implemented in `PaymentsController`.
- Zero raw credit card or CVV storage.
