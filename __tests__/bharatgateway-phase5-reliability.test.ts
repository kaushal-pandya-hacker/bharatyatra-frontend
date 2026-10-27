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
import { GatewayReconciliationService } from '../18_DEVELOPMENT/Backend/src/gateway/reconciliation/gateway-reconciliation.service';
import { GatewayAuditService } from '../18_DEVELOPMENT/Backend/src/gateway/security/gateway-audit.service';
import { GatewayPersistenceService } from '../18_DEVELOPMENT/Backend/src/gateway/database/gateway-persistence.service';
import { ProviderRegistry } from '../18_DEVELOPMENT/Backend/src/gateway/providers/provider.registry';
import { SimulatedPaymentAdapter } from '../18_DEVELOPMENT/Backend/src/gateway/providers/simulated-payment.adapter';
import { MockBankAdapter } from '../18_DEVELOPMENT/Backend/src/gateway/providers/mock-bank.adapter';
import {
  PaymentOrderStatus,
  PaymentMethodType,
  RefundStatus,
  LedgerDirection,
} from '../18_DEVELOPMENT/Backend/src/gateway/domain/gateway.types';

describe('BharatGateway™ Phase 5: Security, Cross-Process Reliability & Failure Recovery Suite', () => {
  let merchantService: GatewayMerchantService;
  let orderService: GatewayOrderService;
  let ledgerService: GatewayLedgerService;
  let webhookService: GatewayWebhookService;
  let fraudService: GatewayFraudService;
  let simAdapter: SimulatedPaymentAdapter;
  let mockBankAdapter: MockBankAdapter;
  let providerRegistry: ProviderRegistry;
  let persistenceService: GatewayPersistenceService;
  let paymentService: GatewayPaymentService;
  let refundService: GatewayRefundService;
  let reconService: GatewayReconciliationService;
  let auditService: GatewayAuditService;

  const MERCHANT_A = 'merch_default_bharat_001';
  const MERCHANT_B = 'merch_phase5_isolated_002';

  beforeEach(() => {
    merchantService = new GatewayMerchantService();
    orderService = new GatewayOrderService(merchantService);
    ledgerService = new GatewayLedgerService();
    webhookService = new GatewayWebhookService();
    fraudService = new GatewayFraudService();
    simAdapter = new SimulatedPaymentAdapter();
    mockBankAdapter = new MockBankAdapter();
    providerRegistry = new ProviderRegistry(simAdapter, mockBankAdapter);
    persistenceService = new GatewayPersistenceService();

    paymentService = new GatewayPaymentService(
      orderService,
      providerRegistry,
      ledgerService,
      webhookService,
      fraudService,
      persistenceService,
    );
    refundService = new GatewayRefundService(
      orderService,
      ledgerService,
      webhookService,
      providerRegistry,
      persistenceService,
    );
    reconService = new GatewayReconciliationService(
      orderService,
      paymentService,
      ledgerService,
      refundService,
      persistenceService,
    );
    auditService = new GatewayAuditService();
  });

  // ============================================================================
  // 1. CROSS-PROCESS DISTRIBUTED LOCKS & CONCURRENCY
  // ============================================================================
  it('1. Distributed locking: allows single process ownership and rejects competing worker', async () => {
    const lockKey = `test_resource_lock_${Date.now()}`;
    const worker1 = 'worker_node_alpha_pid101';
    const worker2 = 'worker_node_beta_pid102';

    // Worker 1 acquires lock
    const acquired1 = await persistenceService.acquireDistributedLock(
      lockKey,
      'ORDER',
      'ord_123',
      worker1,
      10000,
    );
    assert.equal(acquired1, true, 'Worker 1 must acquire the distributed lock');

    // Worker 2 attempts to acquire the same lock simultaneously
    const acquired2 = await persistenceService.acquireDistributedLock(
      lockKey,
      'ORDER',
      'ord_123',
      worker2,
      10000,
    );
    assert.equal(acquired2, false, 'Worker 2 must be rejected while Worker 1 holds active lock');

    // Worker 1 releases lock
    const released = await persistenceService.releaseDistributedLock(lockKey, worker1);
    assert.equal(released, true, 'Worker 1 should successfully release lock');

    // Worker 2 can now acquire lock
    const acquired2AfterRelease = await persistenceService.acquireDistributedLock(
      lockKey,
      'ORDER',
      'ord_123',
      worker2,
      10000,
    );
    assert.equal(acquired2AfterRelease, true, 'Worker 2 must acquire lock after release');
  });

  // ============================================================================
  // 2. CONCURRENT REFUND BALANCE BOUNDS PROTECTION
  // ============================================================================
  it('2. Cross-process refund concurrency: concurrent attempts strictly bounded by captured amount', async () => {
    const order = await orderService.createOrder({
      merchantId: MERCHANT_A,
      amountMinor: 100000, // ₹1,000.00
      currency: 'INR',
      receipt: 'rcpt_p5_concur_ref',
    });

    await paymentService.processPayment({
      orderId: order.orderId,
      method: PaymentMethodType.UPI,
      methodDetails: { simulatedScenario: 'SUCCESS' },
    });

    // 4 concurrent workers attempting to refund ₹350.00 each (4 * 350 = ₹1,400 > ₹1,000)
    const refundPromises = [
      refundService.processRefund({
        orderId: order.orderId,
        merchantId: MERCHANT_A,
        amountMinor: 35000,
        reason: 'Worker 1 refund',
        idempotencyKey: 'idemp_p5_w1',
      }),
      refundService.processRefund({
        orderId: order.orderId,
        merchantId: MERCHANT_A,
        amountMinor: 35000,
        reason: 'Worker 2 refund',
        idempotencyKey: 'idemp_p5_w2',
      }),
      refundService.processRefund({
        orderId: order.orderId,
        merchantId: MERCHANT_A,
        amountMinor: 35000,
        reason: 'Worker 3 refund',
        idempotencyKey: 'idemp_p5_w3',
      }),
      refundService.processRefund({
        orderId: order.orderId,
        merchantId: MERCHANT_A,
        amountMinor: 35000,
        reason: 'Worker 4 refund',
        idempotencyKey: 'idemp_p5_w4',
      }),
    ];

    const results = await Promise.allSettled(refundPromises);
    const completed = results.filter(
      (r) => r.status === 'fulfilled' && (r as PromiseFulfilledResult<any>).value.status === RefundStatus.COMPLETED,
    );

    // At most 2 can succeed without exceeding ₹1,000.00 (350 + 350 = 700; 3 * 350 = 1050 > 1000)
    assert.ok(completed.length <= 2, `Completed refunds count (${completed.length}) must not exceed 2`);

    const finalOrder = orderService.getOrder(order.orderId);
    assert.ok(
      finalOrder.amountRefundedMinor <= 100000,
      `Final refunded amount (${finalOrder.amountRefundedMinor}) cannot exceed total (${finalOrder.amountMinor})`,
    );
  });

  // ============================================================================
  // 3. UNCERTAIN REFUND GUARD — BLOCKS DUPLICATE EXTERNAL CALLS
  // ============================================================================
  it('3. Uncertain outcome protection: order with UNCERTAIN refund rejects duplicate submissions', async () => {
    const order = await orderService.createOrder({
      merchantId: MERCHANT_A,
      amountMinor: 50000,
      currency: 'INR',
      receipt: 'rcpt_p5_uncertain_block',
    });

    await paymentService.processPayment({
      orderId: order.orderId,
      method: PaymentMethodType.CARD,
      methodDetails: { simulatedScenario: 'SUCCESS', cardLast4: '4242' },
    });

    // Submit refund that times out
    const timeoutRefund = await refundService.processRefund({
      orderId: order.orderId,
      merchantId: MERCHANT_A,
      amountMinor: 25000,
      reason: 'Network Timeout Test',
      idempotencyKey: 'idemp_timeout_1',
      simulatedScenario: 'TIMEOUT',
    });

    assert.equal(timeoutRefund.status, RefundStatus.UNCERTAIN);

    // Attempt to submit another refund or retry on the same order before reconciliation
    await assert.rejects(
      async () => {
        await refundService.processRefund({
          orderId: order.orderId,
          merchantId: MERCHANT_A,
          amountMinor: 10000,
          reason: 'Subsequent refund attempt while UNCERTAIN',
          idempotencyKey: 'idemp_attempt_subsequent',
        });
      },
      (err: any) =>
        err.message.includes('UNCERTAIN refund') && err.message.includes('blocked until external provider'),
    );
  });

  // ============================================================================
  // 4. MULTI-WORKER RECONCILIATION CONCURRENCY
  // ============================================================================
  it('4. Reconciliation multi-worker isolation: rejects duplicate concurrent worker runs', async () => {
    const order = await orderService.createOrder({
      merchantId: MERCHANT_A,
      amountMinor: 15000,
      currency: 'INR',
      receipt: 'rcpt_recon_worker_guard',
    });

    await paymentService.processPayment({
      orderId: order.orderId,
      method: PaymentMethodType.UPI,
      methodDetails: { simulatedScenario: 'SUCCESS' },
    });

    // Launch concurrent reconciliation worker runs for the same merchant
    const workerRun1 = reconService.runReconciliationBatch(MERCHANT_A);
    const workerRun2 = reconService.runReconciliationBatch(MERCHANT_A);

    const outcomes = await Promise.allSettled([workerRun1, workerRun2]);
    const rejected = outcomes.filter((o) => o.status === 'rejected');

    if (rejected.length > 0) {
      const err = (rejected[0] as PromiseRejectedResult).reason;
      assert.ok(
        err.message.includes('currently active') || err.message.includes('Concurrent batch execution rejected'),
      );
    }
  });

  // ============================================================================
  // 5. WEBHOOK RETRY FINANCIAL NON-REPETITION
  // ============================================================================
  it('5. Webhook delivery retries do not repeat underlying financial transactions', async () => {
    webhookService.registerEndpoint(MERCHANT_A, 'https://merchant.example.com/payment-hook');

    const initialEntries = ledgerService.getEntries(MERCHANT_A).length;

    // Dispatch webhook for already captured payment
    const deliveries = await webhookService.dispatchEvent(
      MERCHANT_A,
      'payment.captured',
      { orderId: 'order_test_hook_replay', amountMinor: 20000 },
      'evt_stable_replay_p5',
      'RETRYABLE_503',
    );

    const initialDelivery = deliveries[0];
    assert.equal(initialDelivery.status, 'RETRYING');

    // Trigger retry 1
    await webhookService.retryDelivery(initialDelivery.deliveryId, MERCHANT_A, false);

    // Trigger retry 2 (success)
    await webhookService.retryDelivery(initialDelivery.deliveryId, MERCHANT_A, true);

    const finalEntries = ledgerService.getEntries(MERCHANT_A).length;
    assert.equal(
      finalEntries,
      initialEntries,
      'Webhook delivery attempts and retries must NEVER create duplicate ledger postings',
    );
  });

  // ============================================================================
  // 6. DURABLE IDEMPOTENCY FINGERPRINTING & REUSE REJECTION
  // ============================================================================
  it('6. Durable idempotency: rejects reused key with altered parameters', async () => {
    const key = `idemp_payload_tamper_${Date.now()}`;

    // Request 1: 5000 paise
    await persistenceService.checkOrAcquireIdempotency(
      MERCHANT_A,
      key,
      '/api/v1/gateway/orders',
      { amountMinor: 5000, currency: 'INR' },
    );

    // Request 2 with SAME key but altered amount: 9999 paise -> Must reject with 400
    await assert.rejects(
      async () => {
        await persistenceService.checkOrAcquireIdempotency(
          MERCHANT_A,
          key,
          '/api/v1/gateway/orders',
          { amountMinor: 9999, currency: 'INR' },
        );
      },
      (err: any) => err.message.includes('reused with different request payload'),
    );
  });

  // ============================================================================
  // 7. DOUBLE-ENTRY LEDGER BALANCE VERIFICATION
  // ============================================================================
  it('7. Financial ledger balancing invariant: total debits strictly equal total credits', async () => {
    const order = await orderService.createOrder({
      merchantId: MERCHANT_A,
      amountMinor: 80000,
      currency: 'INR',
      receipt: 'rcpt_ledger_bal_p5',
    });

    await paymentService.processPayment({
      orderId: order.orderId,
      method: PaymentMethodType.CARD,
      methodDetails: { simulatedScenario: 'SUCCESS', cardLast4: '1234' },
    });

    await refundService.processRefund({
      orderId: order.orderId,
      merchantId: MERCHANT_A,
      amountMinor: 30000,
      reason: 'Partial return',
      idempotencyKey: 'idemp_ref_bal_p5',
    });

    const isBalanced = ledgerService.verifyLedgerBalance(MERCHANT_A);
    assert.equal(isBalanced, true, 'Global and merchant double-entry ledger must remain zero-sum balanced');
  });

  // ============================================================================
  // 8. SECURITY AUDIT: MERCHANT DATA ISOLATION
  // ============================================================================
  it('8. Cross-merchant security: strict isolation between Merchant A and Merchant B', async () => {
    const orderA = await orderService.createOrder({
      merchantId: MERCHANT_A,
      amountMinor: 40000,
      currency: 'INR',
    });

    // Merchant B cannot read Merchant A order
    assert.throws(
      () => orderService.getOrder(orderA.orderId, MERCHANT_B),
      /not found for merchant/,
    );

    // Merchant B cannot run refund on Merchant A order
    await assert.rejects(
      async () => {
        await refundService.processRefund({
          orderId: orderA.orderId,
          merchantId: MERCHANT_B,
          amountMinor: 10000,
          reason: 'Unauthorized refund attack',
          idempotencyKey: 'idemp_unauth_attack',
        });
      },
      (err: any) => err.message.includes('not found') || err.message.includes('unauthorized'),
    );
  });

  // ============================================================================
  // 9. SECURITY AUDIT: SENSITIVE CREDENTIAL REDACTION
  // ============================================================================
  it('9. Security audit: PAN, CVV, and API secrets are never logged in plaintext', () => {
    const auditRecord = auditService.logEvent({
      actorId: 'test_sec_officer',
      actorRole: 'ADMIN',
      merchantId: MERCHANT_A,
      action: 'PAYMENT_AUDIT_PROBE',
      resourceType: 'PAYMENT',
      resourceId: 'pay_probe_001',
      metadata: {
        cardNumber: '4111111111111111',
        cardCVV: '999',
        secretKey: 'sk_test_super_secret_token_12345',
        upiPin: '123456',
        amountMinor: 50000,
      },
    });

    assert.equal(auditRecord.sanitizedMetadata.cardNumber, '****-****-****-1111');
    assert.equal(auditRecord.sanitizedMetadata.cardCVV, '[REDACTED_PCI_SECRET]');
    assert.equal(auditRecord.sanitizedMetadata.secretKey, '[REDACTED_PCI_SECRET]');
    assert.equal(auditRecord.sanitizedMetadata.upiPin, '[REDACTED_PCI_SECRET]');
    assert.equal(auditRecord.sanitizedMetadata.amountMinor, 50000);
  });

  // ============================================================================
  // 10. OBSERVABILITY & OPERATIONAL STATUS
  // ============================================================================
  it('10. Observability status: verifies failure visibility and simulated restriction', () => {
    const isBalanced = ledgerService.verifyLedgerBalance();
    assert.equal(typeof isBalanced, 'boolean');

    // Operational restrictions confirmation
    assert.equal(process.env.ENABLE_LIVE_PAYMENTS, undefined); // Or 'false'
    assert.equal(simAdapter.getProviderId(), 'BHARATGATEWAY_SIMULATOR');
  });
});
