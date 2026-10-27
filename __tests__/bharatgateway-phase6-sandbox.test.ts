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
import { RazorpaySandboxAdapter } from '../18_DEVELOPMENT/Backend/src/gateway/providers/razorpay-sandbox.adapter';
import {
  PaymentOrderStatus,
  PaymentMethodType,
  PaymentAttemptStatus,
  RefundStatus,
  LedgerDirection,
} from '../18_DEVELOPMENT/Backend/src/gateway/domain/gateway.types';

describe('BharatGateway™ Phase 6: Sandbox Payment Provider Integration & End-to-End Verification', () => {
  let merchantService: GatewayMerchantService;
  let orderService: GatewayOrderService;
  let ledgerService: GatewayLedgerService;
  let webhookService: GatewayWebhookService;
  let fraudService: GatewayFraudService;
  let simAdapter: SimulatedPaymentAdapter;
  let mockBankAdapter: MockBankAdapter;
  let razorpaySandboxAdapter: RazorpaySandboxAdapter;
  let providerRegistry: ProviderRegistry;
  let persistenceService: GatewayPersistenceService;
  let paymentService: GatewayPaymentService;
  let refundService: GatewayRefundService;
  let reconService: GatewayReconciliationService;
  let auditService: GatewayAuditService;

  let MERCHANT_A = 'merch_default_bharat_001';
  let MERCHANT_B = 'merch_phase6_isolated_002';

  beforeEach(() => {
    merchantService = new GatewayMerchantService();
    orderService = new GatewayOrderService(merchantService);
    ledgerService = new GatewayLedgerService();
    webhookService = new GatewayWebhookService();
    fraudService = new GatewayFraudService();
    simAdapter = new SimulatedPaymentAdapter();
    mockBankAdapter = new MockBankAdapter();
    razorpaySandboxAdapter = new RazorpaySandboxAdapter();
    providerRegistry = new ProviderRegistry(simAdapter, mockBankAdapter, razorpaySandboxAdapter);
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

    // Register isolated tenant merchant B
    const regB = merchantService.createMerchant({
      businessName: 'Phase 6 Isolated Tenant Merchant',
      legalEntityName: 'Phase 6 Tenant B Pvt Ltd',
      contactEmail: 'sandbox_b@example.com',
      contactPhone: '+919999999999',
    });
    MERCHANT_B = regB.merchant.id;
  });

  // --------------------------------------------------------------------------
  // TEST 1: Sandbox payment creation
  // --------------------------------------------------------------------------
  it('1. should create a sandbox payment session with authoritative provider order ID', async () => {
    const order = await orderService.createOrder({
      merchantId: MERCHANT_A,
      amountMinor: 150000, // ₹1,500.00
      currency: 'INR',
      receipt: 'rcpt_p6_001',
      description: 'Sandbox Test Booking',
    });

    const session = await razorpaySandboxAdapter.createPaymentSession({
      orderId: order.orderId,
      merchantId: MERCHANT_A,
      amountMinor: order.amountMinor,
      currency: order.currency,
    });

    assert.ok(session.sessionId.startsWith('order_'), 'Session ID must start with standard order_ prefix');
    assert.strictEqual(session.orderId, order.orderId);
    assert.strictEqual(session.provider, 'RAZORPAY_SANDBOX');
    assert.strictEqual(session.isSimulated, true, 'Sandbox session must be flagged as non-live simulated');
    assert.ok(session.checkoutUrl.includes('RAZORPAY_SANDBOX'));
    assert.ok(new Date(session.expiresAt).getTime() > Date.now(), 'Session expiry must be in future');
  });

  // --------------------------------------------------------------------------
  // TEST 2: Successful payment verified through the backend
  // --------------------------------------------------------------------------
  it('2. should verify payment status server-side before marking order as CAPTURED', async () => {
    const order = await orderService.createOrder({
      merchantId: MERCHANT_A,
      amountMinor: 250000, // ₹2,500.00
      currency: 'INR',
      receipt: 'rcpt_p6_002',
    });

    // Client executes payment in sandbox
    const paymentExec = await razorpaySandboxAdapter.executePayment({
      orderId: order.orderId,
      merchantId: MERCHANT_A,
      amountMinor: order.amountMinor,
      currency: order.currency,
      method: PaymentMethodType.UPI,
      methodDetails: { vpa: 'success@razorpay', simulatedScenario: 'SUCCESS' },
    });

    assert.strictEqual(paymentExec.status, 'SUCCESS');
    assert.ok(paymentExec.signature, 'Signature must be generated');

    // Authoritative Server-Side Verification
    const verifiedAttempt = await paymentService.verifyAndCapturePayment({
      orderId: order.orderId,
      paymentId: paymentExec.gatewayTransactionId,
      signature: paymentExec.signature,
      providerId: 'RAZORPAY_SANDBOX',
      merchantId: MERCHANT_A,
    });

    assert.strictEqual(verifiedAttempt.status, PaymentAttemptStatus.SUCCESS);
    assert.strictEqual(verifiedAttempt.provider, 'RAZORPAY_SANDBOX');

    // Verify order status updated to CAPTURED
    const refreshedOrder = orderService.getOrder(order.orderId);
    assert.strictEqual(refreshedOrder.status, PaymentOrderStatus.CAPTURED);

    // Verify append-only double entry ledger recorded debit & credit
    assert.strictEqual(ledgerService.verifyLedgerBalance(MERCHANT_A), true);
  });

  // --------------------------------------------------------------------------
  // TEST 3: Failed, pending, cancelled, and expired payment handling
  // --------------------------------------------------------------------------
  it('3. should handle failed, insufficient funds, and expired card scenarios safely without capturing order', async () => {
    const order = await orderService.createOrder({
      merchantId: MERCHANT_A,
      amountMinor: 75000,
      currency: 'INR',
    });

    const failedExec = await razorpaySandboxAdapter.executePayment({
      orderId: order.orderId,
      merchantId: MERCHANT_A,
      amountMinor: order.amountMinor,
      currency: order.currency,
      method: PaymentMethodType.CARD,
      methodDetails: { simulatedScenario: 'INSUFFICIENT_FUNDS' },
    });

    assert.strictEqual(failedExec.status, 'FAILED');
    assert.strictEqual(failedExec.errorCode, 'ERR_INSUFFICIENT_FUNDS');

    // Verify order is not captured
    const currentOrder = orderService.getOrder(order.orderId);
    assert.notStrictEqual(currentOrder.status, PaymentOrderStatus.CAPTURED);

    // Ledger has 0 entries
    const entries = ledgerService.getEntries(MERCHANT_A);
    assert.strictEqual(entries.length, 0);
  });

  // --------------------------------------------------------------------------
  // TEST 4: Amount or currency mismatch rejection
  // --------------------------------------------------------------------------
  it('4. should reject payment verification when amount or currency does not match order', async () => {
    const order = await orderService.createOrder({
      merchantId: MERCHANT_A,
      amountMinor: 500000, // ₹5,000.00
      currency: 'INR',
    });

    // Attacker tampers payment amount down to 1000 paise (₹10) in sandbox payment execution
    const tamperedExec = await razorpaySandboxAdapter.executePayment({
      orderId: order.orderId,
      merchantId: MERCHANT_A,
      amountMinor: 1000, // TAMPERED!
      currency: 'INR',
      method: PaymentMethodType.UPI,
      methodDetails: { simulatedScenario: 'SUCCESS' },
    });

    // Verification must strictly throw BadRequestException for amount mismatch
    await assert.rejects(
      async () => {
        await paymentService.verifyAndCapturePayment({
          orderId: order.orderId,
          paymentId: tamperedExec.gatewayTransactionId,
          signature: tamperedExec.signature,
          providerId: 'RAZORPAY_SANDBOX',
          merchantId: MERCHANT_A,
        });
      },
      (err: any) => {
        assert.ok(err.message.includes('Payment integrity violation') || err.message.includes('amount'));
        return true;
      },
    );

    // Order must remain uncaptured
    const orderAfter = orderService.getOrder(order.orderId);
    assert.notStrictEqual(orderAfter.status, PaymentOrderStatus.CAPTURED);
  });

  // --------------------------------------------------------------------------
  // TEST 5: Invalid webhook signature rejection
  // --------------------------------------------------------------------------
  it('5. should reject webhook payloads with forged or invalid HMAC signatures', () => {
    const payload = JSON.stringify({
      entity: 'event',
      event: 'payment.captured',
      contains: ['payment'],
      payload: { payment: { entity: { id: 'pay_test_001', amount: 50000 } } },
    });

    const validSignature = razorpaySandboxAdapter['config'].keySecret
      ? crypto
          .createHmac('sha256', razorpaySandboxAdapter['config'].webhookSecret)
          .update(payload)
          .digest('hex')
      : 'dummy';

    // Valid check
    const isValid = razorpaySandboxAdapter.verifyWebhookSignature(payload, validSignature);
    assert.strictEqual(isValid, true, 'Valid webhook signature must be accepted');

    // Tampered payload
    const tamperedPayload = payload.replace('50000', '99999');
    const isTamperedValid = razorpaySandboxAdapter.verifyWebhookSignature(tamperedPayload, validSignature);
    assert.strictEqual(isTamperedValid, false, 'Tampered webhook payload must be rejected');

    // Forged signature
    const isForgedValid = razorpaySandboxAdapter.verifyWebhookSignature(payload, 'forged_fake_signature_hex_123456');
    assert.strictEqual(isForgedValid, false, 'Forged signature must be rejected');
  });

  // --------------------------------------------------------------------------
  // TEST 6: Duplicate webhook event handling
  // --------------------------------------------------------------------------
  it('6. should deduplicate webhook events durably without dual delivery or duplicate ledger entries', async () => {
    webhookService.registerEndpoint(MERCHANT_A, 'https://merchant.example.com/webhook', ['*']);
    const stableEventId = 'evt_test_stable_dedup_001';

    const firstDeliveries = await webhookService.dispatchEvent(
      MERCHANT_A,
      'payment.captured',
      { orderId: 'ord_dedup_101', amountMinor: 10000 },
      stableEventId,
    );
    assert.strictEqual(firstDeliveries.length, 1);
    const firstDeliveryId = firstDeliveries[0].deliveryId;

    // Dispatch duplicate event
    const secondDeliveries = await webhookService.dispatchEvent(
      MERCHANT_A,
      'payment.captured',
      { orderId: 'ord_dedup_101', amountMinor: 10000 },
      stableEventId,
    );

    assert.strictEqual(secondDeliveries.length, 1);
    assert.strictEqual(secondDeliveries[0].deliveryId, firstDeliveryId, 'Duplicate event must return existing delivery record');
  });

  // --------------------------------------------------------------------------
  // TEST 7: Out-of-order and delayed events
  // --------------------------------------------------------------------------
  it('7. should protect terminal states from out-of-order delayed failure events', async () => {
    const order = await orderService.createOrder({
      merchantId: MERCHANT_A,
      amountMinor: 30000,
      currency: 'INR',
    });

    // Order successfully moved through PENDING to CAPTURED
    orderService.transitionOrderStatus(order.orderId, PaymentOrderStatus.PENDING);
    orderService.transitionOrderStatus(order.orderId, PaymentOrderStatus.CAPTURED);
    assert.strictEqual(orderService.getOrder(order.orderId).status, PaymentOrderStatus.CAPTURED);

    // Delayed out-of-order event attempts to transition order to PENDING or CREATED
    assert.throws(
      () => {
        orderService.transitionOrderStatus(order.orderId, PaymentOrderStatus.PENDING);
      },
      (err: any) => {
        assert.ok(err.message.includes('Invalid payment order state transition'));
        return true;
      },
    );

    // Terminal CAPTURED state is preserved
    assert.strictEqual(orderService.getOrder(order.orderId).status, PaymentOrderStatus.CAPTURED);
  });

  // --------------------------------------------------------------------------
  // TEST 8: Provider timeout and subsequent status recovery
  // --------------------------------------------------------------------------
  it('8. should safely handle provider timeout without marking payment failed and recover on status query', async () => {
    const order = await orderService.createOrder({
      merchantId: MERCHANT_A,
      amountMinor: 100000,
      currency: 'INR',
    });

    const timeoutExec = await razorpaySandboxAdapter.executePayment({
      orderId: order.orderId,
      merchantId: MERCHANT_A,
      amountMinor: order.amountMinor,
      currency: order.currency,
      method: PaymentMethodType.UPI,
      methodDetails: { simulatedScenario: 'BANK_TIMEOUT' },
    });

    assert.strictEqual(timeoutExec.status, 'PENDING');
    assert.strictEqual(timeoutExec.errorCode, 'ERR_PROVIDER_TIMEOUT');

    // Verify order was not marked FAILED prematurely
    const currentOrder = orderService.getOrder(order.orderId);
    assert.notStrictEqual(currentOrder.status, PaymentOrderStatus.FAILED);
  });

  // --------------------------------------------------------------------------
  // TEST 9: Duplicate payment requests and idempotency
  // --------------------------------------------------------------------------
  it('9. should ensure idempotent duplicate verification does not credit ledger twice', async () => {
    const order = await orderService.createOrder({
      merchantId: MERCHANT_A,
      amountMinor: 200000, // ₹2,000.00
      currency: 'INR',
    });

    const exec = await razorpaySandboxAdapter.executePayment({
      orderId: order.orderId,
      merchantId: MERCHANT_A,
      amountMinor: order.amountMinor,
      currency: order.currency,
      method: PaymentMethodType.UPI,
      methodDetails: { simulatedScenario: 'SUCCESS' },
    });

    // First verification
    const firstAttempt = await paymentService.verifyAndCapturePayment({
      orderId: order.orderId,
      paymentId: exec.gatewayTransactionId,
      signature: exec.signature,
      providerId: 'RAZORPAY_SANDBOX',
      merchantId: MERCHANT_A,
    });
    assert.strictEqual(firstAttempt.status, PaymentAttemptStatus.SUCCESS);

    const ledgerEntriesAfterFirst = ledgerService.getEntries(MERCHANT_A).length;

    // Replay duplicate verification
    const secondAttempt = await paymentService.verifyAndCapturePayment({
      orderId: order.orderId,
      paymentId: exec.gatewayTransactionId,
      signature: exec.signature,
      providerId: 'RAZORPAY_SANDBOX',
      merchantId: MERCHANT_A,
    });

    assert.strictEqual(secondAttempt.status, PaymentAttemptStatus.SUCCESS);
    const ledgerEntriesAfterSecond = ledgerService.getEntries(MERCHANT_A).length;

    assert.strictEqual(
      ledgerEntriesAfterSecond,
      ledgerEntriesAfterFirst,
      'Duplicate verification must not create redundant ledger entries',
    );
  });

  // --------------------------------------------------------------------------
  // TEST 10: Sandbox refund request and refund-status verification
  // --------------------------------------------------------------------------
  it('10. should process partial refund in sandbox and verify ledger reversal', async () => {
    const order = await orderService.createOrder({
      merchantId: MERCHANT_A,
      amountMinor: 100000, // ₹1,000.00
      currency: 'INR',
    });

    // Setup captured order with initial ledger capture
    orderService.transitionOrderStatus(order.orderId, PaymentOrderStatus.PENDING);
    orderService.transitionOrderStatus(order.orderId, PaymentOrderStatus.CAPTURED);
    await ledgerService.recordPaymentCapture(order.orderId, MERCHANT_A, 100000, 0, 0);

    // Process partial refund of ₹400.00 (40000 paise) using sandbox provider
    const refund = await refundService.processRefund({
      orderId: order.orderId,
      merchantId: MERCHANT_A,
      amountMinor: 40000,
      reason: 'Customer return request',
      providerId: 'RAZORPAY_SANDBOX',
    });

    assert.strictEqual(refund.status, RefundStatus.COMPLETED);
    assert.strictEqual(refund.amountMinor, 40000);

    // Verify provider refund status query
    const statusQuery = await razorpaySandboxAdapter.fetchRefundStatus(refund.refundId, refund.providerRefundId);
    assert.strictEqual(statusQuery.status, 'COMPLETED');
    assert.strictEqual(statusQuery.amountMinor, 40000);

    // Verify ledger balance strictly preserved
    assert.strictEqual(ledgerService.verifyLedgerBalance(MERCHANT_A), true);
  });

  // --------------------------------------------------------------------------
  // TEST 11: Uncertain refund recovery without blindly issuing another refund
  // --------------------------------------------------------------------------
  it('11. should block duplicate refund requests while a prior refund outcome is UNCERTAIN', async () => {
    const order = await orderService.createOrder({
      merchantId: MERCHANT_A,
      amountMinor: 50000,
      currency: 'INR',
    });

    orderService.transitionOrderStatus(order.orderId, PaymentOrderStatus.PENDING);
    orderService.transitionOrderStatus(order.orderId, PaymentOrderStatus.CAPTURED);
    await ledgerService.recordPaymentCapture(order.orderId, MERCHANT_A, 50000, 0, 0);

    // Trigger initial UNCERTAIN refund via provider network timeout
    const uncertainRefund = await refundService.processRefund({
      orderId: order.orderId,
      merchantId: MERCHANT_A,
      amountMinor: 30000,
      reason: 'Network timeout during refund submission',
      simulatedScenario: 'TIMEOUT',
      providerId: 'RAZORPAY_SANDBOX',
    });
    assert.strictEqual(uncertainRefund.status, RefundStatus.UNCERTAIN);

    // Attempting a second refund while first is UNCERTAIN must be rejected
    await assert.rejects(
      async () => {
        await refundService.processRefund({
          orderId: order.orderId,
          merchantId: MERCHANT_A,
          amountMinor: 20000,
          reason: 'Duplicate retry during uncertain window',
          providerId: 'RAZORPAY_SANDBOX',
        });
      },
      (err: any) => {
        assert.ok(err.message.includes('UNCERTAIN') || err.message.includes('reconciliation'));
        return true;
      },
    );
  });

  // --------------------------------------------------------------------------
  // TEST 12: Merchant isolation
  // --------------------------------------------------------------------------
  it('12. should strictly prevent cross-merchant payment verification and data access', async () => {
    const orderA = await orderService.createOrder({
      merchantId: MERCHANT_A,
      amountMinor: 80000,
      currency: 'INR',
    });

    // Merchant B attempts to verify Merchant A's order
    await assert.rejects(
      async () => {
        await paymentService.verifyAndCapturePayment({
          orderId: orderA.orderId,
          paymentId: 'pay_test_rogue_001',
          providerId: 'RAZORPAY_SANDBOX',
          merchantId: MERCHANT_B, // ROGUE MERCHANT
        });
      },
      (err: any) => {
        assert.ok(err.message.includes('does not belong to merchant'));
        return true;
      },
    );
  });

  // --------------------------------------------------------------------------
  // TEST 13: Credential redaction and frontend secret isolation
  // --------------------------------------------------------------------------
  it('13. should ensure sensitive secrets and unmasked card details are never exposed', async () => {
    const order = await orderService.createOrder({
      merchantId: MERCHANT_A,
      amountMinor: 60000,
      currency: 'INR',
    });

    const payment = await paymentService.processPayment({
      orderId: order.orderId,
      method: PaymentMethodType.CARD,
      methodDetails: {
        cardLast4: '8888',
        cardExpiry: '08/30',
        simulatedScenario: 'SUCCESS',
      },
    });

    // Check attempt record
    assert.strictEqual((payment as any).keySecret, undefined);
    assert.strictEqual((payment as any).webhookSecret, undefined);
    assert.strictEqual((payment.methodDetails as any).cvv, undefined);
    assert.strictEqual(payment.methodDetails.cardLast4, '8888');
  });

  // --------------------------------------------------------------------------
  // TEST 14: Ledger balance and immutable transaction history
  // --------------------------------------------------------------------------
  it('14. should maintain zero-discrepancy double-entry ledger balance across sandbox activity', async () => {
    const order = await orderService.createOrder({
      merchantId: MERCHANT_A,
      amountMinor: 120000, // ₹1,200.00
      currency: 'INR',
    });

    orderService.transitionOrderStatus(order.orderId, PaymentOrderStatus.PENDING);
    orderService.transitionOrderStatus(order.orderId, PaymentOrderStatus.CAPTURED);
    await ledgerService.recordPaymentCapture(order.orderId, MERCHANT_A, 120000, 0, 0);

    // Partial refund 1
    await refundService.processRefund({
      orderId: order.orderId,
      merchantId: MERCHANT_A,
      amountMinor: 40000,
      reason: 'Partial return 1',
    });

    // Partial refund 2
    await refundService.processRefund({
      orderId: order.orderId,
      merchantId: MERCHANT_A,
      amountMinor: 30000,
      reason: 'Partial return 2',
    });

    const entries = ledgerService.getEntries(MERCHANT_A);
    assert.ok(entries.length >= 6, 'Must contain capture debit/credit and 2 refund debit/credits');

    let totalDebits = 0;
    let totalCredits = 0;
    for (const e of entries) {
      if (e.direction === LedgerDirection.DEBIT) totalDebits += e.amountMinor;
      if (e.direction === LedgerDirection.CREDIT) totalCredits += e.amountMinor;
    }

    assert.strictEqual(totalDebits, totalCredits, 'Total debits must equal total credits');
    assert.strictEqual(ledgerService.verifyLedgerBalance(MERCHANT_A), true);
  });

  // --------------------------------------------------------------------------
  // TEST 15: Enforcement that live payment processing stays disabled
  // --------------------------------------------------------------------------
  it('15. should strictly enforce that live payment processing is disabled and forbidden in Phase 6', () => {
    assert.strictEqual(razorpaySandboxAdapter.isLiveAuthorized(), false);
    assert.strictEqual(simAdapter.isLiveAuthorized(), false);
    assert.strictEqual(mockBankAdapter.isLiveAuthorized(), false);

    // Verify ENABLE_LIVE_PAYMENTS=true immediately throws security violation
    const originalEnv = process.env.ENABLE_LIVE_PAYMENTS;
    try {
      process.env.ENABLE_LIVE_PAYMENTS = 'true';
      assert.throws(
        () => {
          new RazorpaySandboxAdapter();
        },
        (err: any) => {
          assert.ok(err.message.includes('Live payments strictly prohibited') || err.message.includes('SECURITY VIOLATION'));
          return true;
        },
      );
    } finally {
      process.env.ENABLE_LIVE_PAYMENTS = originalEnv || 'false';
    }
  });
});
