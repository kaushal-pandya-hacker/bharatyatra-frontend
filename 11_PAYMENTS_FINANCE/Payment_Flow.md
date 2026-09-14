# Customer Payment Execution Flow v1.0

## 1. Step-by-Step Payment Journey
1. **Checkout Session Creation**: Customer selects travel booking (hotel, bus, activity). Frontend invokes `POST /api/v1/payments/orders` with idempotency key.
2. **Price Breakdown Verification**: Server calculates Subtotal + Taxes (GST) + Platform Fee - Discount.
3. **Gateway Tokenization**: Order instantiated on Razorpay / UPI Gateway; checkout session link returned.
4. **Server-Side Verification**: Frontend posts payment signature to `POST /api/v1/payments/orders/:id/verify`.
5. **Provider Inventory Request**: Backend attempts provider booking confirmation (GSRTC / Hotel channel manager).
6. **Confirmation & Invoicing**: Once confirmed, invoice (`INV-2026-XXXXX`) and receipt (`REC-2026-XXXXX`) are generated and stored under `12_DOCUMENTS/`.
