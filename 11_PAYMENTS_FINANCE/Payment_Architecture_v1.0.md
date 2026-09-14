# Chalo Farva Payments & Financial Infrastructure Architecture v1.0

## 1. Overview
Production-ready financial infrastructure separating Payment Orders, Payment Gateway Adapters, Booking Engine, Customer Invoicing, Deterministic Refunds, Marketplace Commercials, Balanced Double-Entry Accounting Ledger, Supplier Settlements, and 4-Way Reconciliation.

## 2. Core Architecture Pipeline

```mermaid
graph TD
    A[Customer Checkout] --> B[PaymentOrderService]
    B --> C[RazorpayPaymentAdapter]
    C --> D[Gateway Payment Collector]
    D --> E[Server-Side Payment Signature & Webhook Verification]
    E --> F{Payment Captured?}
    F -- Yes --> G[Provider Booking API Engine]
    G --> H{Provider Confirmation?}
    H -- Confirmed --> I[Mark Booking CONFIRMED]
    I --> J[Customer Invoice & Receipt]
    J --> K[Financial Ledger Double-Entry]
    K --> L[Commission & Supplier Settlement Engine]
    H -- Failed --> M[Reconciliation Engine Trigger]
    M --> N[Automated 100% Refund & Audit Entry]
```

## 3. Core Principles
- **Payment and Booking are Separate State Machines**: `Payment SUCCESS != Booking CONFIRMED`.
- **Zero Raw Card / CVV Storage**: Tokenized hosted payment gateways only.
- **Double-Entry Immutable Accounting**: Balanced debits and credits across all 8 ledger accounts.
