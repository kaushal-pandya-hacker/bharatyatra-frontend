/**
 * BharatGateway™ Domain Interfaces & Types
 * Enforces integer minor currency units (paise/cents), immutable states,
 * and zero-vendor-lockin provider interfaces.
 */

export enum PaymentOrderStatus {
  CREATED = 'CREATED',
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentAttemptStatus {
  INITIATED = 'INITIATED',
  PENDING_OTP = 'PENDING_OTP',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  TIMEOUT = 'TIMEOUT',
}

export enum PaymentMethodType {
  UPI = 'UPI',
  CARD = 'CARD',
  NETBANKING = 'NETBANKING',
  WALLET = 'WALLET',
}

export enum LedgerAccountType {
  CUSTOMER_RECEIVABLE = 'CUSTOMER_RECEIVABLE',
  GATEWAY_CLEARING = 'GATEWAY_CLEARING',
  MERCHANT_SETTLEMENT_PAYABLE = 'MERCHANT_SETTLEMENT_PAYABLE',
  PLATFORM_FEE_INCOME = 'PLATFORM_FEE_INCOME',
  TAX_GST_PAYABLE = 'TAX_GST_PAYABLE',
  REFUND_CLEARING = 'REFUND_CLEARING',
  SUSPENSE_DISCREPANCY = 'SUSPENSE_DISCREPANCY',
}

export enum LedgerDirection {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

export enum RefundStatus {
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REJECTED = 'REJECTED',
  UNCERTAIN = 'UNCERTAIN', // Provider timeout / pending investigation
}

export enum ReconciliationStatus {
  MATCHED = 'MATCHED',
  DISCREPANCY = 'DISCREPANCY',
  MISSING_INTERNAL = 'MISSING_INTERNAL',       // Found in provider statement, missing in BharatGateway
  MISSING_PROVIDER = 'MISSING_PROVIDER',       // Captured in BharatGateway, missing in provider statement
  MISSING_IN_LEDGER = 'MISSING_IN_LEDGER',     // Missing in double-entry ledger
  AMOUNT_MISMATCH = 'AMOUNT_MISMATCH',         // Internal amount != statement amount
  CURRENCY_MISMATCH = 'CURRENCY_MISMATCH',     // Internal currency != statement currency
  DUPLICATE_PROVIDER = 'DUPLICATE_PROVIDER',   // Duplicate txn ID in statement
  INVALID_REFERENCE = 'INVALID_REFERENCE',     // Malformed or unknown reference in statement
  REFUND_MISMATCH = 'REFUND_MISMATCH',         // Statement refund != internal refund state
  UNSETTLED = 'UNSETTLED',
}

export interface SupportedCurrency {
  code: string;
  minorUnitFactor: number; // e.g. 100 for INR, USD (1 INR = 100 paise)
  symbol: string;
}

export const SUPPORTED_CURRENCIES: Record<string, SupportedCurrency> = {
  INR: { code: 'INR', minorUnitFactor: 100, symbol: '₹' },
  USD: { code: 'USD', minorUnitFactor: 100, symbol: '$' },
  EUR: { code: 'EUR', minorUnitFactor: 100, symbol: '€' },
  GBP: { code: 'GBP', minorUnitFactor: 100, symbol: '£' },
};
