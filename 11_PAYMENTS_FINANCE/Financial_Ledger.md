# Immutable Double-Entry Financial Ledger v1.0

## 1. Overview
All financial movements are recorded as balanced double-entry pairs (`DEBIT` and `CREDIT`) across 8 core accounts.

## 2. Core Ledger Accounts
1. `CUSTOMER_RECEIVABLE`
2. `PAYMENT_GATEWAY`
3. `SUPPLIER_PAYABLE`
4. `PLATFORM_REVENUE`
5. `TAX_PAYABLE`
6. `REFUND_PAYABLE`
7. `DISCOUNT_EXPENSE`
8. `COMMISSION`

## 3. Balance Rule
$$\sum \text{Debits} = \sum \text{Credits}$$
- Historical ledger entries are immutable; updates are made exclusively via reversing/adjustment ledger entries.
