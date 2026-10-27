import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { LedgerAccountType, LedgerDirection } from '../domain/gateway.types';

export interface PostJournalEntryParams {
  transactionReference: string;
  referenceType: 'PAYMENT' | 'REFUND' | 'SETTLEMENT' | 'DISCREPANCY_ADJUSTMENT';
  referenceId: string;
  merchantId: string;
  description: string;
  entries: Array<{
    accountType: LedgerAccountType;
    direction: LedgerDirection;
    amountMinor: number;
    description: string;
  }>;
}

export interface LedgerEntryRecord {
  id: string;
  transactionReference: string;
  merchantId: string;
  accountType: LedgerAccountType;
  direction: LedgerDirection;
  amountMinor: number;
  currency: string;
  description: string;
  createdAt: string;
}

export interface LedgerAccountBalance {
  accountType: LedgerAccountType;
  merchantId?: string;
  balanceMinor: number; // Positive = Debit balance, Negative = Credit balance
  currency: string;
}

@Injectable()
export class GatewayLedgerService {
  private readonly logger = new Logger(GatewayLedgerService.name);
  private readonly ledgerEntries: LedgerEntryRecord[] = [];
  private readonly accountBalances = new Map<string, number>();

  /**
   * Post a balanced double-entry transaction to the append-only ledger.
   * Invariant: Total Debits strictly equals Total Credits.
   */
  async postBalancedTransaction(params: PostJournalEntryParams): Promise<{
    transactionReference: string;
    totalAmountMinor: number;
    entriesCount: number;
  }> {
    if (!params.entries || params.entries.length < 2) {
      throw new BadRequestException('A double-entry ledger transaction requires at least 2 entries.');
    }

    let totalDebits = 0;
    let totalCredits = 0;

    for (const entry of params.entries) {
      if (!Number.isInteger(entry.amountMinor) || entry.amountMinor <= 0) {
        throw new BadRequestException(`Invalid ledger amount: ${entry.amountMinor}. Must be a positive integer minor unit.`);
      }

      if (entry.direction === LedgerDirection.DEBIT) {
        totalDebits += entry.amountMinor;
      } else if (entry.direction === LedgerDirection.CREDIT) {
        totalCredits += entry.amountMinor;
      } else {
        throw new BadRequestException(`Invalid ledger direction: ${entry.direction}`);
      }
    }

    if (totalDebits !== totalCredits) {
      throw new BadRequestException(
        `Ledger out-of-balance! Total Debits (${totalDebits}) does not equal Total Credits (${totalCredits}). Transaction rejected.`,
      );
    }

    const now = new Date().toISOString();

    for (const entry of params.entries) {
      const entryId = `ledg_ent_${crypto.randomBytes(8).toString('hex')}`;
      const record: LedgerEntryRecord = {
        id: entryId,
        transactionReference: params.transactionReference,
        merchantId: params.merchantId,
        accountType: entry.accountType,
        direction: entry.direction,
        amountMinor: entry.amountMinor,
        currency: 'INR',
        description: entry.description,
        createdAt: now,
      };

      this.ledgerEntries.push(record);

      // Update cached running balances
      const accountKey = `${params.merchantId || 'PLATFORM'}:${entry.accountType}`;
      const current = this.accountBalances.get(accountKey) || 0;
      const delta = entry.direction === LedgerDirection.DEBIT ? entry.amountMinor : -entry.amountMinor;
      this.accountBalances.set(accountKey, current + delta);
    }

    this.logger.log(
      `[LEDGER] Posted balanced transaction ${params.transactionReference} (Total: ₹${(totalDebits / 100).toFixed(2)}, Entries: ${params.entries.length})`,
    );

    return {
      transactionReference: params.transactionReference,
      totalAmountMinor: totalDebits,
      entriesCount: params.entries.length,
    };
  }

  /**
   * Helper to post a standard Payment Capture balanced transaction
   */
  async recordPaymentCapture(
    orderId: string,
    merchantId: string,
    amountMinor: number,
    feeMinor: number = 0,
    taxMinor: number = 0,
  ) {
    const netPayableMinor = amountMinor - feeMinor - taxMinor;
    const txRef = `tx_pay_${orderId}`;

    const entries = [
      {
        accountType: LedgerAccountType.GATEWAY_CLEARING,
        direction: LedgerDirection.DEBIT,
        amountMinor,
        description: `Customer payment received for Order ${orderId}`,
      },
      {
        accountType: LedgerAccountType.MERCHANT_SETTLEMENT_PAYABLE,
        direction: LedgerDirection.CREDIT,
        amountMinor: netPayableMinor,
        description: `Settlement payable to Merchant ${merchantId} for Order ${orderId}`,
      },
    ];

    if (feeMinor > 0) {
      entries.push({
        accountType: LedgerAccountType.PLATFORM_FEE_INCOME,
        direction: LedgerDirection.CREDIT,
        amountMinor: feeMinor,
        description: `Platform fee for Order ${orderId}`,
      });
    }

    if (taxMinor > 0) {
      entries.push({
        accountType: LedgerAccountType.TAX_GST_PAYABLE,
        direction: LedgerDirection.CREDIT,
        amountMinor: taxMinor,
        description: `GST tax on platform fee for Order ${orderId}`,
      });
    }

    return this.postBalancedTransaction({
      transactionReference: txRef,
      referenceType: 'PAYMENT',
      referenceId: orderId,
      merchantId,
      description: `Payment captured for order ${orderId}`,
      entries,
    });
  }

  /**
   * Helper to post a compensating reversal transaction for a refund
   */
  async recordRefundReversal(
    refundId: string,
    orderId: string,
    merchantId: string,
    amountMinor: number,
  ) {
    const txRef = `tx_ref_${refundId}`;

    return this.postBalancedTransaction({
      transactionReference: txRef,
      referenceType: 'REFUND',
      referenceId: refundId,
      merchantId,
      description: `Compensating reversal for Refund ${refundId} (Order ${orderId})`,
      entries: [
        {
          accountType: LedgerAccountType.MERCHANT_SETTLEMENT_PAYABLE,
          direction: LedgerDirection.DEBIT,
          amountMinor,
          description: `Debit merchant settlement for refund ${refundId}`,
        },
        {
          accountType: LedgerAccountType.REFUND_CLEARING,
          direction: LedgerDirection.CREDIT,
          amountMinor,
          description: `Credit refund clearing to customer for refund ${refundId}`,
        },
      ],
    });
  }

  getEntries(merchantId?: string): LedgerEntryRecord[] {
    if (merchantId) {
      return this.ledgerEntries.filter(e => e.merchantId === merchantId);
    }
    return this.ledgerEntries;
  }

  getAccountBalance(merchantId: string, accountType: LedgerAccountType): number {
    const accountKey = `${merchantId}:${accountType}`;
    return this.accountBalances.get(accountKey) || 0;
  }

  verifyLedgerBalance(merchantId?: string): boolean {
    const entries = this.getEntries(merchantId);
    let debits = 0;
    let credits = 0;
    for (const e of entries) {
      if (e.direction === LedgerDirection.DEBIT) {
        debits += e.amountMinor;
      } else {
        credits += e.amountMinor;
      }
    }
    return debits === credits;
  }
}
