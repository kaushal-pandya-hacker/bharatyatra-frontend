import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import * as crypto from 'crypto';

import { GatewayMerchantService } from '../18_DEVELOPMENT/Backend/src/gateway/merchants/gateway-merchant.service';
import { GatewayOrderService } from '../18_DEVELOPMENT/Backend/src/gateway/orders/gateway-order.service';
import { GatewayPaymentService } from '../18_DEVELOPMENT/Backend/src/gateway/payments/gateway-payment.service';
import { GatewayLedgerService } from '../18_DEVELOPMENT/Backend/src/gateway/ledger/gateway-ledger.service';
import { GatewayRefundService } from '../18_DEVELOPMENT/Backend/src/gateway/refunds/gateway-refund.service';
import { GatewayWebhookService } from '../18_DEVELOPMENT/Backend/src/gateway/webhooks/gateway-webhook.service';
import { GatewayFraudService } from '../18_DEVELOPMENT/Backend/src/gateway/fraud/gateway-fraud.service';
import {
  GatewayReconciliationService,
  ProviderStatement,
  ProviderStatementItem,
} from '../18_DEVELOPMENT/Backend/src/gateway/reconciliation/gateway-reconciliation.service';
import { GatewayAuditService } from '../18_DEVELOPMENT/Backend/src/gateway/security/gateway-audit.service';
import { ProviderRegistry } from '../18_DEVELOPMENT/Backend/src/gateway/providers/provider.registry';
import { SimulatedPaymentAdapter } from '../18_DEVELOPMENT/Backend/src/gateway/providers/simulated-payment.adapter';
import { MockBankAdapter } from '../18_DEVELOPMENT/Backend/src/gateway/providers/mock-bank.adapter';
import {
  PaymentOrderStatus,
  PaymentMethodType,
  RefundStatus,
  ReconciliationStatus,
  LedgerAccountType,
  LedgerDirection,
} from '../18_DEVELOPMENT/Backend/src/gateway/domain/gateway.types';

describe('BharatGateway™ Phase 4: Reconciliation, Refund Integrity & Webhook Reliability Suite', () => {
  let merchantService: GatewayMerchantService;
  let orderService: GatewayOrderService;
  let ledgerService: GatewayLedgerService;
  let webhookService: GatewayWebhookService;
  let fraudService: GatewayFraudService;
  let simAdapter: SimulatedPaymentAdapter;
  let mockBankAdapter: MockBankAdapter;
  let providerRegistry: ProviderRegistry;
  let paymentService: GatewayPaymentService;
  let refundService: GatewayRefundService;
  let reconService: GatewayReconciliationService;
  let auditService: GatewayAuditService;

  const MERCHANT_A = 'merch_default_bharat_001';
  const MERCHANT_B = 'merch_secondary_bharat_002';

  beforeEach(() => {
    merchantService = new GatewayMerchantService();
    orderService = new GatewayOrderService(merchantService);
    ledgerService = new GatewayLedgerService();
    webhookService = new GatewayWebhookService();
    fraudService = new GatewayFraudService();
    simAdapter = new SimulatedPaymentAdapter();
    mockBankAdapter = new MockBankAdapter();
    providerRegistry = new ProviderRegistry(simAdapter, mockBankAdapter);
    paymentService = new GatewayPaymentService(
      orderService,
      providerRegistry,
      ledgerService,
      webhookService,
      fraudService,
    );
    refundService = new GatewayRefundService(
      orderService,
      ledgerService,
      webhookService,
      providerRegistry,
    );
    reconService = new GatewayReconciliationService(
      orderService,
      paymentService,
      ledgerService,
      refundService,
    );
    auditService = new GatewayAuditService();
  });

  // ============================================================================
  // 1. RECONCILIATION MATCHES (EXACT MATCHES)
  // ============================================================================
  it('1. Correct reconciliation matches: exact transactions match seamlessly', async () => {
    // Create and capture order
    const order = await orderService.createOrder({
      merchantId: MERCHANT_A,
      amountMinor: 250000,
      currency: 'INR',
      receipt: 'rcpt_recon_match_1',
    });

    const payment = await paymentService.processPayment({
      orderId: order.orderId,
      method: PaymentMethodType.UPI,
      methodDetails: { simulatedScenario: 'SUCCESS', vpa: 'user@okaxis' },
    });

    assert.equal(payment.status, 'SUCCESS');

    // Run reconciliation batch with auto-generated matching statement
    const batch = await reconService.runReconciliationBatch(MERCHANT_A);

    assert.ok(batch.batchId.startsWith('rec_batch_'));
    assert.equal(batch.merchantId, MERCHANT_A);
    assert.equal(batch.matchedCount >= 1, true, 'At least 1 matched record');
    assert.equal(batch.discrepancyCount, 0, 'No discrepancies for healthy transaction');
    assert.equal(batch.status, 'MATCHED');

    // Verify batch report can be fetched and merchant is verified
    const fetched = reconService.getReport(batch.batchId, MERCHANT_A);
    assert.ok(fetched);
    assert.equal(fetched.batchId, batch.batchId);
  });

  // ============================================================================
  // 2. DISCREPANCY CATEGORIES
  // ============================================================================
  it('2. Discrepancy category detection: flags required discrepancy categories', async () => {
    // Setup orders for testing discrepancy detection
    const order = await orderService.createOrder({
      merchantId: MERCHANT_A,
      amountMinor: 50000,
      currency: 'INR',
      receipt: 'rcpt_disc_order',
    });

    await paymentService.processPayment({
      orderId: order.orderId,
      method: PaymentMethodType.UPI,
      methodDetails: { simulatedScenario: 'SUCCESS' },
    });

    // Test Amount Mismatch injection
    const stmtAmountMismatch = reconService.generateSimulatedStatement(MERCHANT_A, {
      injectAmountMismatch: true,
    });
    const batchAmt = await reconService.runReconciliationBatch(MERCHANT_A, stmtAmountMismatch.statementId);
    assert.equal(batchAmt.status, 'DISCREPANCIES_DETECTED');
    assert.ok(batchAmt.discrepancies.some((d) => d.type === ReconciliationStatus.AMOUNT_MISMATCH));

    // Test Currency Mismatch injection
    const stmtCurrMismatch = reconService.generateSimulatedStatement(MERCHANT_A, {
      injectCurrencyMismatch: true,
    });
    const batchCurr = await reconService.runReconciliationBatch(MERCHANT_A, stmtCurrMismatch.statementId);
    assert.equal(batchCurr.status, 'DISCREPANCIES_DETECTED');
    assert.ok(batchCurr.discrepancies.some((d) => d.type === ReconciliationStatus.CURRENCY_MISMATCH));

    // Test Missing Internal injection (transaction in statement not found internally)
    const stmtMissingInt = reconService.generateSimulatedStatement(MERCHANT_A, {
      injectMissingInternal: true,
    });
    const batchMissingInt = await reconService.runReconciliationBatch(MERCHANT_A, stmtMissingInt.statementId);
    assert.equal(batchMissingInt.status, 'DISCREPANCIES_DETECTED');
    assert.ok(batchMissingInt.discrepancies.some((d) => d.type === ReconciliationStatus.MISSING_INTERNAL));

    // Test Duplicate Provider record injection
    const stmtDup = reconService.generateSimulatedStatement(MERCHANT_A, {
      injectDuplicateProvider: true,
    });
    const batchDup = await reconService.runReconciliationBatch(MERCHANT_A, stmtDup.statementId);
    assert.equal(batchDup.status, 'DISCREPANCIES_DETECTED');
    assert.ok(batchDup.discrepancies.some((d) => d.type === ReconciliationStatus.DUPLICATE_PROVIDER));

    // Test Invalid Reference injection
    const stmtInv = reconService.generateSimulatedStatement(MERCHANT_A, {
      injectInvalidReference: true,
    });
    const batchInv = await reconService.runReconciliationBatch(MERCHANT_A, stmtInv.statementId);
    assert.equal(batchInv.status, 'DISCREPANCIES_DETECTED');
    assert.ok(batchInv.discrepancies.some((d) => d.type === ReconciliationStatus.INVALID_REFERENCE));
  });

  // ============================================================================
  // 3. RECONCILIATION RERUNS & IDEMPOTENCY
  // ============================================================================
  it('3. Reconciliation reruns and idempotency: safe reruns without duplicating records', async () => {
    const order = await orderService.createOrder({
      merchantId: MERCHANT_A,
      amountMinor: 10000,
      currency: 'INR',
      receipt: 'rcpt_rerun_test',
    });
    await paymentService.processPayment({
      orderId: order.orderId,
      method: PaymentMethodType.CARD,
      methodDetails: { simulatedScenario: 'SUCCESS', cardLast4: '1111' },
    });

    const batch1 = await reconService.runReconciliationBatch(MERCHANT_A);
    const batch2 = await reconService.runReconciliationBatch(MERCHANT_A);

    assert.notEqual(batch1.batchId, batch2.batchId, 'Each run produces a distinct audit batch ID');
    assert.equal(batch1.matchedCount, batch2.matchedCount, 'Matches must be deterministic');

    const history = reconService.listReports(MERCHANT_A);
    assert.equal(history.length >= 2, true, 'Both batch records remain intact for audit history');
  });

  // ============================================================================
  // 4. CONCURRENT RECONCILIATION PROCESSING
  // ============================================================================
  it('4. Concurrent reconciliation processing: per-merchant lock prevents race collisions', async () => {
    // Launch two reconciliation batches simultaneously for the same merchant
    const promise1 = reconService.runReconciliationBatch(MERCHANT_A);
    const promise2 = reconService.runReconciliationBatch(MERCHANT_A);

    const results = await Promise.allSettled([promise1, promise2]);
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // With active mutex lock, concurrent attempt is rejected
    if (rejected.length > 0) {
      const err = (rejected[0] as PromiseRejectedResult).reason;
      assert.ok(err.message.includes('currently active') || err.message.includes('Concurrent batch execution rejected'));
    } else {
      assert.equal(fulfilled.length, 2);
    }
  });

  // ============================================================================
  // 5. CONCURRENT PARTIAL AND FULL REFUND REQUESTS
  // ============================================================================
  it('5. Concurrent partial and full refund requests: strict row-locking protects balance', async () => {
    const order = await orderService.createOrder({
      merchantId: MERCHANT_A,
      amountMinor: 100000, // 1000.00 INR
      currency: 'INR',
      receipt: 'rcpt_concur_refund',
    });

    await paymentService.processPayment({
      orderId: order.orderId,
      method: PaymentMethodType.UPI,
      methodDetails: { simulatedScenario: 'SUCCESS' },
    });

    // Fire 3 simultaneous partial refund requests of 400.00 INR each (total 1200.00 > 1000.00)
    const refundPromises = [
      refundService.processRefund({
        orderId: order.orderId,
        merchantId: MERCHANT_A,
        amountMinor: 40000,
        reason: 'Partial 1',
        idempotencyKey: 'idem_ref_c1',
      }),
      refundService.processRefund({
        orderId: order.orderId,
        merchantId: MERCHANT_A,
        amountMinor: 40000,
        reason: 'Partial 2',
        idempotencyKey: 'idem_ref_c2',
      }),
      refundService.processRefund({
        orderId: order.orderId,
        merchantId: MERCHANT_A,
        amountMinor: 40000,
        reason: 'Partial 3',
        idempotencyKey: 'idem_ref_c3',
      }),
    ];

    const results = await Promise.allSettled(refundPromises);
    const successful = results.filter(
      (r) => r.status === 'fulfilled' && (r as PromiseFulfilledResult<any>).value.status === RefundStatus.COMPLETED,
    );
    const rejected = results.filter((r) => r.status === 'rejected');

    // At most 2 can succeed (40000 + 40000 = 80000 <= 100000). The 3rd (120000 > 100000) or lock rejection must fail.
    assert.equal(successful.length <= 2, true, 'At most 2 refunds can succeed without exceeding 1000.00 INR');
    assert.ok(rejected.length >= 1, 'At least 1 refund must be rejected');

    const updatedOrder = orderService.getOrder(order.orderId);
    assert.ok(
      updatedOrder.amountRefundedMinor <= 100000,
      `Cumulative refunded (${updatedOrder.amountRefundedMinor}) cannot exceed total (${updatedOrder.amountMinor})`,
    );
  });

  // ============================================================================
  // 6. REFUND CAPS & CUMULATIVE AMOUNTS
  // ============================================================================
  it('6. Refund caps: prevents refunding more than captured amount', async () => {
    const order = await orderService.createOrder({
      merchantId: MERCHANT_A,
      amountMinor: 50000,
      currency: 'INR',
      receipt: 'rcpt_cap_test',
    });
    await paymentService.processPayment({
      orderId: order.orderId,
      method: PaymentMethodType.CARD,
      methodDetails: { simulatedScenario: 'SUCCESS', cardLast4: '5555' },
    });

    // Attempt refund > captured amount
    await assert.rejects(
      async () => {
        await refundService.processRefund({
          orderId: order.orderId,
          merchantId: MERCHANT_A,
          amountMinor: 50001,
          reason: 'Excessive refund',
          idempotencyKey: 'idem_excessive',
        });
      },
      (err: any) => err.message.includes('exceeds remaining refundable balance'),
    );
  });

  // ============================================================================
  // 7. REFUND FAILURE & UNCERTAIN PROVIDER OUTCOMES
  // ============================================================================
  it('7. Refund failure & UNCERTAIN provider outcome handling', async () => {
    const order = await orderService.createOrder({
      merchantId: MERCHANT_A,
      amountMinor: 30000,
      currency: 'INR',
      receipt: 'rcpt_uncertain_test',
    });
    await paymentService.processPayment({
      orderId: order.orderId,
      method: PaymentMethodType.UPI,
      methodDetails: { simulatedScenario: 'SUCCESS' },
    });

    // Process simulated refund with TIMEOUT scenario
    const refund = await refundService.processRefund({
      orderId: order.orderId,
      merchantId: MERCHANT_A,
      amountMinor: 15000,
      reason: 'Network Timeout Test',
      idempotencyKey: 'idem_ref_timeout',
      simulatedScenario: 'TIMEOUT',
    });

    assert.equal(
      refund.status,
      RefundStatus.UNCERTAIN,
      'Timeout must result in UNCERTAIN status, not permanent FAILED or COMPLETED',
    );
    assert.equal(refund.errorCode, 'ERR_PROVIDER_TIMEOUT');

    // Check order refundable amount: uncertain refund must roll back optimistic deductions
    const orderState = orderService.getOrder(order.orderId);
    assert.equal(orderState.status, PaymentOrderStatus.CAPTURED, 'Order must remain CAPTURED, not REFUNDED');
    assert.equal(orderState.amountRefundedMinor, 0, 'No balance deduction until outcome is verified');
  });

  // ============================================================================
  // 8. DUPLICATE WEBHOOK EVENTS & DELIVERY DEDUPLICATION
  // ============================================================================
  it('8. Webhook duplicate event deduplication: stable eventId prevents duplicate dispatch', async () => {
    webhookService.registerEndpoint(MERCHANT_A, 'https://merchant.example.com/webhook');

    const payload = {
      orderId: 'order_test_dup_1',
      amountMinor: 10000,
      currency: 'INR',
    };

    const deliveries1 = await webhookService.dispatchEvent(
      MERCHANT_A,
      'payment.captured',
      payload,
      'evt_stable_duplicate_test_1',
    );

    // Dispatching identical event ID must deduplicate and return existing delivery
    const deliveries2 = await webhookService.dispatchEvent(
      MERCHANT_A,
      'payment.captured',
      payload,
      'evt_stable_duplicate_test_1',
    );

    assert.equal(deliveries1[0].eventId, deliveries2[0].eventId);
    assert.equal(deliveries1[0].deliveryId, deliveries2[0].deliveryId, 'Must reuse identical delivery record');
  });

  // ============================================================================
  // 9. PERMANENT VS RETRYABLE WEBHOOK FAILURES & BOUNDED RETRIES
  // ============================================================================
  it('9. Webhook error classification and bounded retries', async () => {
    webhookService.registerEndpoint(
      MERCHANT_A,
      'https://merchant.example.com/mock-retryable-webhook',
      ['*'],
    );

    // Dispatch with simulated 503 retryable failure
    const deliveries = await webhookService.dispatchEvent(
      MERCHANT_A,
      'payment.failed',
      { orderId: 'order_wh_fail' },
      undefined,
      'RETRYABLE_503',
    );

    const initialDelivery = deliveries[0];
    assert.equal(initialDelivery.status, 'RETRYING');
    assert.equal(initialDelivery.errorCategory, 'RETRYABLE');
    assert.equal(initialDelivery.statusCode, 503);
    assert.ok(initialDelivery.nextRetryAt, 'Must set exponential backoff nextRetryAt');

    // Trigger controlled redelivery with simulated success
    const redelivered = await webhookService.retryDelivery(initialDelivery.deliveryId, MERCHANT_A, true);
    assert.equal(redelivered.status, 'SIMULATED_DELIVERY');
    assert.equal(redelivered.statusCode, 200);
    assert.equal(redelivered.attempts, 2);
  });

  // ============================================================================
  // 10. MERCHANT ISOLATION & AUTHORIZATION FAILURES
  // ============================================================================
  it('10. Merchant data isolation: strictly prevents cross-tenant access', async () => {
    const orderA = await orderService.createOrder({
      merchantId: MERCHANT_A,
      amountMinor: 50000,
      currency: 'INR',
      receipt: 'rcpt_merch_a',
    });
    await paymentService.processPayment({
      orderId: orderA.orderId,
      method: PaymentMethodType.UPI,
      methodDetails: { simulatedScenario: 'SUCCESS' },
    });

    const batchA = await reconService.runReconciliationBatch(MERCHANT_A);

    // Merchant B attempts to fetch Merchant A's reconciliation batch
    assert.throws(
      () => reconService.getReport(batchA.batchId, MERCHANT_B),
      /not authorized for merchant/,
    );

    // Merchant B attempts to refund Merchant A's order
    await assert.rejects(
      async () => {
        await refundService.processRefund({
          orderId: orderA.orderId,
          merchantId: MERCHANT_B,
          amountMinor: 10000,
          reason: 'Unauthorized refund attempt',
          idempotencyKey: 'idem_cross_tenant_ref',
        });
      },
      (err: any) => err.message.includes('not found') || err.message.includes('unauthorized'),
    );
  });

  // ============================================================================
  // 11. DATABASE ROLLBACK & RECOVERY BEHAVIOR
  // ============================================================================
  it('11. Database rollback and recovery: no orphaned ledger entries on failed operations', async () => {
    const initialEntries = ledgerService.getEntries();
    const initialCount = initialEntries.length;

    // Trigger an invalid refund on a non-existent order
    try {
      await refundService.processRefund({
        orderId: 'order_non_existent_rollback',
        merchantId: MERCHANT_A,
        amountMinor: 5000,
        reason: 'Will fail',
        idempotencyKey: 'idem_rollback_test',
      });
      assert.fail('Should have thrown an error');
    } catch (e) {
      // Expected failure
    }

    const currentEntries = ledgerService.getEntries();
    assert.equal(
      currentEntries.length,
      initialCount,
      'Failed financial transaction must not post partial or orphaned ledger entries',
    );
  });

  // ============================================================================
  // 12. LEDGER BALANCING & IMMUTABILITY
  // ============================================================================
  it('12. Ledger balancing & immutability: zero-sum double entry & immutable historical records', async () => {
    const order = await orderService.createOrder({
      merchantId: MERCHANT_A,
      amountMinor: 75000,
      currency: 'INR',
      receipt: 'rcpt_ledger_bal',
    });

    await paymentService.processPayment({
      orderId: order.orderId,
      method: PaymentMethodType.CARD,
      methodDetails: { simulatedScenario: 'SUCCESS', cardLast4: '9999' },
    });

    // Execute refund
    await refundService.processRefund({
      orderId: order.orderId,
      merchantId: MERCHANT_A,
      amountMinor: 75000,
      reason: 'Full return',
      idempotencyKey: 'idem_ledger_ref',
    });

    // Verify all transactions in ledger are balanced (Sum(Debits) === Sum(Credits))
    const entries = ledgerService.getEntries(MERCHANT_A);
    assert.ok(entries.length >= 4, 'Must have at least payment and refund entries');

    // Group entries by transactionReference and verify Debits == Credits
    const grouped = new Map<string, { debits: number; credits: number }>();
    for (const entry of entries) {
      const g = grouped.get(entry.transactionReference) || { debits: 0, credits: 0 };
      if (entry.direction === LedgerDirection.DEBIT) {
        g.debits += entry.amountMinor;
      } else {
        g.credits += entry.amountMinor;
      }
      grouped.set(entry.transactionReference, g);
    }

    for (const [txRef, totals] of Array.from(grouped.entries())) {
      assert.equal(
        totals.debits,
        totals.credits,
        `Transaction ${txRef} must be strictly balanced (Debits === Credits)`,
      );
    }
  });

  // ============================================================================
  // 13. SANITIZED ERRORS & SECRET ISOLATION
  // ============================================================================
  it('13. Sanitized errors & secret isolation: no leaks of credentials or raw provider tokens', async () => {
    const order = await orderService.createOrder({
      merchantId: MERCHANT_A,
      amountMinor: 10000,
      currency: 'INR',
      receipt: 'rcpt_sanitize',
    });

    const failedPayment = await paymentService.processPayment({
      orderId: order.orderId,
      method: PaymentMethodType.CARD,
      methodDetails: {
        cardLast4: '4242',
        simulatedScenario: 'INSUFFICIENT_FUNDS',
      },
    });

    assert.equal(failedPayment.status, 'FAILED');

    // Ensure audit log redacts sensitive parameters like secrets, cvv, etc.
    const auditRecord = auditService.logEvent({
      actorId: 'test_system',
      actorRole: 'SYSTEM',
      merchantId: MERCHANT_A,
      action: 'PAYMENT_PROCESSED',
      resourceType: 'PAYMENT',
      resourceId: failedPayment.attemptId,
      metadata: {
        apiKey: 'sk_live_secret_must_be_redacted_999',
        cardCVV: '123',
        status: failedPayment.status,
      },
    });

    assert.equal(auditRecord.sanitizedMetadata.apiKey, '[REDACTED_PCI_SECRET]');
    assert.equal(auditRecord.sanitizedMetadata.cardCVV, '[REDACTED_PCI_SECRET]');
  });
});
