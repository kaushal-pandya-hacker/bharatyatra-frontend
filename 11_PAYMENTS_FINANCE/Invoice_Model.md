# Customer Invoicing & Receipt Model v1.0

## 1. Customer Invoice Specification
- Unique sequential format: `INV-2026-XXXXX`.
- Contains customer details, itemized line items (Hotel/Bus/Activity), subtotal, CGST, SGST, total tax, platform fee, discount, final total, and storage URI under `12_DOCUMENTS/Invoices/`.

## 2. Payment Receipt Specification
- Unique sequential format: `REC-2026-XXXXX`.
- Contains payment reference, gateway transaction ID, payment method (UPI/Card), date, and storage URI under `12_DOCUMENTS/Receipts/`.
