import { Injectable, Logger } from '@nestjs/common';

export type LedgerAccountType =
  | 'CUSTOMER_RECEIVABLE'
  | 'PAYMENT_GATEWAY'
  | 'SUPPLIER_PAYABLE'
  | 'PLATFORM_REVENUE'
  | 'TAX_PAYABLE'
  | 'REFUND_PAYABLE'
  | 'DISCOUNT_EXPENSE'
  | 'COMMISSION';

export interface LedgerEntry {
  entryId: string;
  referenceType: 'BOOKING' | 'PAYMENT' | 'REFUND' | 'SETTLEMENT';
  referenceId: string;
  account: LedgerAccountType;
  direction: 'DEBIT' | 'CREDIT';
  amountInr: number;
  currency: string;
  description: string;
  createdAt: string;
}

@Injectable()
export class FinancialLedgerService {
  private readonly logger = new Logger(FinancialLedgerService.name);
  private readonly ledgerEntries: LedgerEntry[] = [];

  async recordDoubleEntryTransaction(
    referenceType: 'BOOKING' | 'PAYMENT' | 'REFUND' | 'SETTLEMENT',
    referenceId: string,
    debitAccount: LedgerAccountType,
    creditAccount: LedgerAccountType,
    amountInr: number,
    description: string
  ): Promise<{ debitEntry: LedgerEntry; creditEntry: LedgerEntry }> {
    const now = new Date().toISOString();
    const entryBase = `ledg_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;

    const debitEntry: LedgerEntry = {
      entryId: `${entryBase}_dr`,
      referenceType,
      referenceId,
      account: debitAccount,
      direction: 'DEBIT',
      amountInr,
      currency: 'INR',
      description: `[DEBIT] ${description}`,
      createdAt: now,
    };

    const creditEntry: LedgerEntry = {
      entryId: `${entryBase}_cr`,
      referenceType,
      referenceId,
      account: creditAccount,
      direction: 'CREDIT',
      amountInr,
      currency: 'INR',
      description: `[CREDIT] ${description}`,
      createdAt: now,
    };

    this.ledgerEntries.push(debitEntry, creditEntry);
    this.logger.log(`[FinancialLedgerService] Recorded balanced double-entry (DEBIT ${debitAccount}: ₹${amountInr}, CREDIT ${creditAccount}: ₹${amountInr})`);

    return { debitEntry, creditEntry };
  }

  async getLedgerEntries(): Promise<LedgerEntry[]> {
    return this.ledgerEntries;
  }
}
