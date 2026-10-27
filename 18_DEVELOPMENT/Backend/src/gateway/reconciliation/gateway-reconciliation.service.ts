import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  PaymentOrderStatus,
  ReconciliationStatus,
  LedgerAccountType,
  LedgerDirection,
  RefundStatus,
} from '../domain/gateway.types';
import { GatewayOrderService } from '../orders/gateway-order.service';
import { GatewayPaymentService } from '../payments/gateway-payment.service';
import { GatewayLedgerService } from '../ledger/gateway-ledger.service';
import { GatewayRefundService } from '../refunds/gateway-refund.service';
import { GatewayPersistenceService } from '../database/gateway-persistence.service';

/**
 * Simulated Provider Statement Line Item
 */
export interface ProviderStatementItem {
  providerReference: string; // e.g. txn_sim_123 or utr_sim_123
  orderId: string;
  type: 'PAYMENT' | 'REFUND';
  amountMinor: number;
  currency: string;
  status: 'SETTLED' | 'REVERSED' | 'FAILED';
  settledAt: string;
}

export interface ProviderStatement {
  statementId: string;
  providerName: string;
  merchantId: string;
  statementDate: string;
  items: ProviderStatementItem[];
}

export interface ReconciliationDiscrepancy {
  orderId?: string;
  providerReference?: string;
  type: ReconciliationStatus;
  reason: string;
  orderAmountMinor?: number;
  statementAmountMinor?: number;
  ledgerAmountMinor?: number;
  currency?: string;
  evidence: Record<string, any>;
}

export interface ReconciliationBatchReport {
  batchId: string;
  merchantId?: string;
  statementId?: string;
  executedAt: string;
  totalOrdersScanned: number;
  totalStatementItemsScanned: number;
  totalCapturedAmountMinor: number;
  totalLedgerAmountMinor: number;
  matchedCount: number;
  discrepancyCount: number;
  status: 'MATCHED' | 'DISCREPANCIES_DETECTED';
  discrepancies: ReconciliationDiscrepancy[];
}

@Injectable()
export class GatewayReconciliationService {
  private readonly logger = new Logger(GatewayReconciliationService.name);
  private readonly batchReports = new Map<string, ReconciliationBatchReport>();
  private readonly statements = new Map<string, ProviderStatement>();
  private readonly activeBatchLocks = new Set<string>(); // Lock per merchant to prevent concurrent duplicate execution

  constructor(
    private readonly orderService: GatewayOrderService,
    private readonly paymentService: GatewayPaymentService,
    private readonly ledgerService: GatewayLedgerService,
    private readonly refundService?: GatewayRefundService,
    private readonly persistenceService?: GatewayPersistenceService,
  ) {}

  /**
   * Import or register a simulated provider settlement statement
   */
  registerProviderStatement(statement: ProviderStatement): ProviderStatement {
    this.statements.set(statement.statementId, statement);
    this.logger.log(
      `[RECONCILIATION] Registered provider statement ${statement.statementId} with ${statement.items.length} items for Merchant ${statement.merchantId}`,
    );
    return statement;
  }

  /**
   * Generate a deterministic simulated statement for testing matching or discrepancy scenarios
   */
  generateSimulatedStatement(
    merchantId: string,
    options?: {
      injectMissingInternal?: boolean;
      injectMissingProvider?: boolean;
      injectAmountMismatch?: boolean;
      injectCurrencyMismatch?: boolean;
      injectDuplicateProvider?: boolean;
      injectInvalidReference?: boolean;
      injectRefundMismatch?: boolean;
    },
  ): ProviderStatement {
    const orders = this.orderService.listOrders(merchantId);
    const attempts = this.paymentService.listAttempts(merchantId);
    const refunds = this.refundService ? this.refundService.listRefunds(merchantId) : [];

    const statementId = `stmt_sim_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const items: ProviderStatementItem[] = [];

    // Map captured attempts into normal statement items
    for (const order of orders) {
      if (
        order.status === PaymentOrderStatus.CAPTURED ||
        order.status === PaymentOrderStatus.PARTIALLY_REFUNDED ||
        order.status === PaymentOrderStatus.REFUNDED
      ) {
        const successfulAttempt = attempts.find(a => a.orderId === order.orderId && a.status === 'SUCCESS');
        const ref = successfulAttempt?.gatewayTransactionId || `txn_sim_${order.orderId}`;

        // If injectMissingProvider is requested, skip one order from the statement
        if (options?.injectMissingProvider && items.length === 0) {
          continue;
        }

        let amountMinor = order.amountMinor;
        let currency = order.currency;

        if (options?.injectAmountMismatch && items.length === 0) {
          amountMinor += 5000; // Tamper by ₹50
        }

        if (options?.injectCurrencyMismatch && items.length === 0) {
          currency = 'USD';
        }

        items.push({
          providerReference: ref,
          orderId: order.orderId,
          type: 'PAYMENT',
          amountMinor,
          currency,
          status: 'SETTLED',
          settledAt: new Date().toISOString(),
        });

        if (options?.injectDuplicateProvider && items.length === 1) {
          // Push duplicate record with same reference
          items.push({
            providerReference: ref,
            orderId: order.orderId,
            type: 'PAYMENT',
            amountMinor,
            currency,
            status: 'SETTLED',
            settledAt: new Date().toISOString(),
          });
        }
      }
    }

    // Add settled refunds to statement
    for (const refund of refunds) {
      if (refund.status === RefundStatus.COMPLETED) {
        let refundAmount = refund.amountMinor;
        if (options?.injectRefundMismatch && items.length > 0) {
          refundAmount += 1000; // Discrepant refund amount
        }

        items.push({
          providerReference: refund.providerRefundId || `ref_stmt_${refund.refundId}`,
          orderId: refund.orderId,
          type: 'REFUND',
          amountMinor: refundAmount,
          currency: refund.currency,
          status: 'REVERSED',
          settledAt: new Date().toISOString(),
        });
      }
    }

    if (options?.injectMissingInternal) {
      items.push({
        providerReference: `txn_ghost_${Date.now()}`,
        orderId: `order_ghost_${Date.now()}`,
        type: 'PAYMENT',
        amountMinor: 250000,
        currency: 'INR',
        status: 'SETTLED',
        settledAt: new Date().toISOString(),
      });
    }

    if (options?.injectInvalidReference) {
      items.push({
        providerReference: '', // Malformed empty reference
        orderId: 'MALFORMED_ORDER_REF',
        type: 'PAYMENT',
        amountMinor: 10000,
        currency: 'INR',
        status: 'SETTLED',
        settledAt: new Date().toISOString(),
      });
    }

    const statement: ProviderStatement = {
      statementId,
      providerName: 'BHARATGATEWAY_SIMULATOR',
      merchantId,
      statementDate: new Date().toISOString().split('T')[0],
      items,
    };

    return this.registerProviderStatement(statement);
  }

  /**
   * Run Comprehensive 4-Way Reconciliation Batch Engine
   * Compares Orders, Attempts, Double-Entry Ledger, and External Provider Statement.
   * Concurrent-safe with per-merchant execution mutex locks.
   */
  async runReconciliationBatch(
    merchantId?: string,
    statementId?: string,
    batchIdOverride?: string,
  ): Promise<ReconciliationBatchReport> {
    const lockKey = merchantId || 'GLOBAL';
    const workerOwnerId = `recon_worker_${process.pid}_${crypto.randomBytes(4).toString('hex')}`;

    if (this.activeBatchLocks.has(lockKey)) {
      throw new ConflictException(
        `A reconciliation batch is currently active for Merchant ${lockKey}. Concurrent batch execution rejected.`,
      );
    }

    if (this.persistenceService) {
      const lockAcquired = await this.persistenceService.acquireDistributedLock(
        `recon:merchant:${lockKey}`,
        'RECONCILIATION',
        lockKey,
        workerOwnerId,
        60000,
      );
      if (!lockAcquired) {
        throw new ConflictException(
          `A reconciliation batch is currently active for Merchant ${lockKey} across the cluster. Concurrent batch execution rejected.`,
        );
      }
    }

    this.activeBatchLocks.add(lockKey);

    try {
      const batchId = batchIdOverride || `rec_batch_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      this.logger.log(`[RECONCILIATION] Starting batch ${batchId} for Merchant ${lockKey}`);

      const orders = this.orderService.listOrders(merchantId);
      const attempts = this.paymentService.listAttempts(merchantId);
      const ledgerEntries = this.ledgerService.getEntries(merchantId);
      const refunds = this.refundService ? this.refundService.listRefunds(merchantId) : [];

      // Retrieve or automatically synthesize statement if not provided
      let statement: ProviderStatement | undefined;
      if (statementId) {
        statement = this.statements.get(statementId);
      } else if (merchantId) {
        // Find existing statement or generate matched baseline
        statement = Array.from(this.statements.values()).find(s => s.merchantId === merchantId);
        if (!statement) {
          statement = this.generateSimulatedStatement(merchantId);
        }
      }

      let matchedCount = 0;
      let discrepancyCount = 0;
      let totalCapturedMinor = 0;
      let totalLedgerMinor = 0;
      const discrepancies: ReconciliationDiscrepancy[] = [];

      // Map attempts by orderId
      const attemptsByOrder = new Map<string, typeof attempts>();
      for (const att of attempts) {
        const list = attemptsByOrder.get(att.orderId) || [];
        list.push(att);
        attemptsByOrder.set(att.orderId, list);
      }

      // Map ledger clearing entries by orderId
      const ledgerByOrder = new Map<string, number>();
      for (const ent of ledgerEntries) {
        if (ent.accountType === LedgerAccountType.GATEWAY_CLEARING && ent.direction === LedgerDirection.DEBIT) {
          const orderId = ent.transactionReference.replace('tx_pay_', '');
          const current = ledgerByOrder.get(orderId) || 0;
          ledgerByOrder.set(orderId, current + ent.amountMinor);
          totalLedgerMinor += ent.amountMinor;
        }
      }

      // Map statement items by orderId and providerReference
      const statementItemsByOrder = new Map<string, ProviderStatementItem[]>();
      const statementRefCounts = new Map<string, number>();

      if (statement) {
        for (const item of statement.items) {
          // Check for duplicate provider references
          if (item.providerReference) {
            const count = statementRefCounts.get(item.providerReference) || 0;
            statementRefCounts.set(item.providerReference, count + 1);
            if (count >= 1) {
              discrepancyCount++;
              discrepancies.push({
                orderId: item.orderId,
                providerReference: item.providerReference,
                type: ReconciliationStatus.DUPLICATE_PROVIDER,
                reason: `Duplicate provider reference detected in statement: ${item.providerReference}`,
                statementAmountMinor: item.amountMinor,
                currency: item.currency,
                evidence: { item },
              });
            }
          } else {
            // Malformed/invalid reference
            discrepancyCount++;
            discrepancies.push({
              orderId: item.orderId,
              providerReference: 'N/A',
              type: ReconciliationStatus.INVALID_REFERENCE,
              reason: `Statement line item contains missing or invalid provider reference.`,
              statementAmountMinor: item.amountMinor,
              currency: item.currency,
              evidence: { item },
            });
          }

          const list = statementItemsByOrder.get(item.orderId) || [];
          list.push(item);
          statementItemsByOrder.set(item.orderId, list);
        }
      }

      // 1. Evaluate Internal Orders against Attempts, Ledger & Statement
      for (const order of orders) {
        if (
          order.status === PaymentOrderStatus.CAPTURED ||
          order.status === PaymentOrderStatus.PARTIALLY_REFUNDED ||
          order.status === PaymentOrderStatus.REFUNDED
        ) {
          totalCapturedMinor += order.amountMinor;

          const orderAttempts = attemptsByOrder.get(order.orderId) || [];
          const successfulAttempt = orderAttempts.find(a => a.status === 'SUCCESS');
          const ledgerAmount = ledgerByOrder.get(order.orderId) || 0;
          const stmtItems = statementItemsByOrder.get(order.orderId) || [];
          const stmtPayment = stmtItems.find(i => i.type === 'PAYMENT');

          // Check 1: Missing successful attempt
          if (!successfulAttempt) {
            discrepancyCount++;
            discrepancies.push({
              orderId: order.orderId,
              type: ReconciliationStatus.DISCREPANCY,
              reason: `Order ${order.orderId} is ${order.status} but lacks matching successful payment attempt.`,
              orderAmountMinor: order.amountMinor,
              evidence: { orderStatus: order.status },
            });
            continue;
          }

          // Check 2: Missing in ledger
          if (ledgerAmount !== order.amountMinor) {
            discrepancyCount++;
            discrepancies.push({
              orderId: order.orderId,
              type: ReconciliationStatus.MISSING_IN_LEDGER,
              reason: `Order ${order.orderId} captured for ₹${order.amountMinor / 100} but ledger record totals ₹${ledgerAmount / 100}.`,
              orderAmountMinor: order.amountMinor,
              ledgerAmountMinor: ledgerAmount,
              evidence: { order, ledgerAmount },
            });
            continue;
          }

          // Check 3: Statement Comparison (if statement present)
          if (statement) {
            if (!stmtPayment) {
              discrepancyCount++;
              discrepancies.push({
                orderId: order.orderId,
                type: ReconciliationStatus.MISSING_PROVIDER,
                reason: `Captured order ${order.orderId} is missing from provider statement.`,
                orderAmountMinor: order.amountMinor,
                evidence: { orderId: order.orderId },
              });
              continue;
            }

            if (stmtPayment.currency !== order.currency) {
              discrepancyCount++;
              discrepancies.push({
                orderId: order.orderId,
                providerReference: stmtPayment.providerReference,
                type: ReconciliationStatus.CURRENCY_MISMATCH,
                reason: `Currency mismatch: internal ${order.currency} vs statement ${stmtPayment.currency}.`,
                orderAmountMinor: order.amountMinor,
                currency: stmtPayment.currency,
                evidence: { internalCurrency: order.currency, statementCurrency: stmtPayment.currency },
              });
              continue;
            }

            if (stmtPayment.amountMinor !== order.amountMinor) {
              discrepancyCount++;
              discrepancies.push({
                orderId: order.orderId,
                providerReference: stmtPayment.providerReference,
                type: ReconciliationStatus.AMOUNT_MISMATCH,
                reason: `Amount mismatch: internal ₹${order.amountMinor / 100} vs statement ₹${stmtPayment.amountMinor / 100}.`,
                orderAmountMinor: order.amountMinor,
                statementAmountMinor: stmtPayment.amountMinor,
                evidence: { internal: order.amountMinor, statement: stmtPayment.amountMinor },
              });
              continue;
            }
          }

          // All payment checks passed for this order
          matchedCount++;
        }
      }

      // 2. Check for Statement items not present in Internal Orders (MISSING_INTERNAL)
      if (statement) {
        for (const item of statement.items) {
          if (item.type === 'PAYMENT') {
            const internalOrder = orders.find(o => o.orderId === item.orderId);
            if (!internalOrder) {
              discrepancyCount++;
              discrepancies.push({
                orderId: item.orderId,
                providerReference: item.providerReference,
                type: ReconciliationStatus.MISSING_INTERNAL,
                reason: `Provider statement contains transaction ${item.providerReference} for unknown order ${item.orderId}.`,
                statementAmountMinor: item.amountMinor,
                currency: item.currency,
                evidence: { item },
              });
            }
          } else if (item.type === 'REFUND') {
            // Check refund against internal refunds
            const matchingRefund = refunds.find(r => r.orderId === item.orderId);
            if (!matchingRefund || matchingRefund.amountMinor !== item.amountMinor) {
              discrepancyCount++;
              discrepancies.push({
                orderId: item.orderId,
                providerReference: item.providerReference,
                type: ReconciliationStatus.REFUND_MISMATCH,
                reason: `Refund mismatch for Order ${item.orderId}: statement refund ₹${item.amountMinor / 100} does not match recorded internal refund.`,
                statementAmountMinor: item.amountMinor,
                evidence: { statementRefund: item, internalRefund: matchingRefund },
              });
            }
          }
        }
      }

      const report: ReconciliationBatchReport = {
        batchId,
        merchantId,
        statementId: statement?.statementId,
        executedAt: new Date().toISOString(),
        totalOrdersScanned: orders.length,
        totalStatementItemsScanned: statement ? statement.items.length : 0,
        totalCapturedAmountMinor: totalCapturedMinor,
        totalLedgerAmountMinor: totalLedgerMinor,
        matchedCount,
        discrepancyCount,
        status: discrepancyCount === 0 ? 'MATCHED' : 'DISCREPANCIES_DETECTED',
        discrepancies,
      };

      this.batchReports.set(batchId, report);
      this.logger.log(
        `[RECONCILIATION] Batch ${batchId} complete. Matched: ${matchedCount}, Discrepancies: ${discrepancyCount}`,
      );

      return report;
    } finally {
      this.activeBatchLocks.delete(lockKey);
      if (this.persistenceService) {
        await this.persistenceService.releaseDistributedLock(
          `recon:merchant:${lockKey}`,
          workerOwnerId,
        ).catch(() => {});
      }
    }
  }

  getReport(batchId: string, merchantId?: string): ReconciliationBatchReport {
    const report = this.batchReports.get(batchId);
    if (!report) {
      throw new NotFoundException(`Reconciliation batch ${batchId} not found.`);
    }
    if (merchantId && report.merchantId && report.merchantId !== merchantId) {
      throw new NotFoundException(`Reconciliation batch ${batchId} not authorized for merchant.`);
    }
    return report;
  }

  listReports(merchantId?: string): ReconciliationBatchReport[] {
    const all = Array.from(this.batchReports.values());
    if (merchantId) {
      return all.filter(r => !r.merchantId || r.merchantId === merchantId);
    }
    return all;
  }
}
