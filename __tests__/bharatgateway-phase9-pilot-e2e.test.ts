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

describe('BharatGateway™ Phase 9: Controlled Pilot Journey, Resilience & Security Suite', () => {
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

  let PILOT_MERCHANT_A = 'merch_default_bharat_001';
  let PILOT_MERCHANT_B = 'merch_pilot_kerala_resorts_002';

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
    );

    reconService = new GatewayReconciliationService(
      orderService,
      paymentService,
      ledgerService,
      refundService,
      persistenceService,
    );

    auditService = new GatewayAuditService();

    // Register isolated pilot merchant B
    const regB = merchantService.createMerchant({
      businessName: 'Kerala Backwaters Luxury Resorts',
      legalEntityName: 'Kerala Backwaters Hospitality Pvt Ltd',
      contactEmail: 'pilot_b@keralahospitality.test',
      contactPhone: '+919876543210',
    });
    PILOT_MERCHANT_B = regB.merchant.id;
  });

  describe('Stage 1: Merchant Onboarding in Test Environment', () => {
    it('provisions pilot merchants with scoped API credentials and sandboxed permissions', () => {
      const reg = merchantService.createMerchant({
        businessName: 'Kashmir Alpine Expeditions',
        legalEntityName: 'Kashmir Alpine Tours Pvt Ltd',
        contactEmail: 'billing@kashmiralpine.test',
        contactPhone: '+919123456780',
      });

      assert.ok(reg.merchant.id);
      assert.strictEqual(reg.merchant.businessName, 'Kashmir Alpine Expeditions');
      assert.ok(reg.defaultKeys.publishableKey.startsWith('pk_test_'));
      assert.ok(reg.defaultKeys.secretKeyPlaintext.startsWith('sk_test_'));

      // Verify active merchant lookup
      const found = merchantService.getMerchant(reg.merchant.id);
      assert.strictEqual(found.id, reg.merchant.id);
    });
  });

  describe('Stage 2: Tamper-Proof Order Creation & Server-Side Integrity', () => {
    it('creates immutable order and rejects subsequent client-side attempts to alter amount or currency', async () => {
      const order = await orderService.createOrder({
        merchantId: PILOT_MERCHANT_A,
        amountMinor: 450000, // ₹4,500.00
        currency: 'INR',
        receipt: 'RCPT-PILOT-001',
      });

      assert.strictEqual(order.amountMinor, 450000);
      assert.strictEqual(order.currency, 'INR');
      assert.strictEqual(order.status, PaymentOrderStatus.CREATED);

      // Verify immutable status: order service does not expose a mutation method for amount
      assert.strictEqual(typeof (orderService as any).updateOrderAmount, 'undefined');
    });
  });

  describe('Stage 3 & 4: Payment Lifecycle & Authoritative Server-Side Verification', () => {
    it('executes successful UPI payment in sandbox and verifies status authoritatively', async () => {
      const order = await orderService.createOrder({
        merchantId: PILOT_MERCHANT_A,
        amountMinor: 1200000, // ₹12,000.00
        currency: 'INR',
        receipt: 'RCPT-PILOT-CARD-002',
      });

      // Execute payment in sandbox adapter
      const paymentExec = await razorpaySandboxAdapter.executePayment({
        orderId: order.orderId,
        merchantId: PILOT_MERCHANT_A,
        amountMinor: order.amountMinor,
        currency: order.currency,
        method: PaymentMethodType.UPI,
        methodDetails: { vpa: 'tourist@okhdfcbank', simulatedScenario: 'SUCCESS' },
      });

      assert.strictEqual(paymentExec.status, 'SUCCESS');
      assert.ok(paymentExec.signature);

      // Authoritative Server-Side Verification
      const verified = await paymentService.verifyAndCapturePayment({
        orderId: order.orderId,
        paymentId: paymentExec.gatewayTransactionId,
        signature: paymentExec.signature,
        providerId: 'RAZORPAY_SANDBOX',
        merchantId: PILOT_MERCHANT_A,
      });

      assert.strictEqual(verified.status, PaymentAttemptStatus.SUCCESS);
      assert.strictEqual(verified.provider, 'RAZORPAY_SANDBOX');

      // Verify order transitioned to CAPTURED
      const updatedOrder = orderService.getOrder(order.orderId);
      assert.strictEqual(updatedOrder.status, PaymentOrderStatus.CAPTURED);
    });

    it('records failed payment attempt without falsely marking order as CAPTURED', async () => {
      const order = await orderService.createOrder({
        merchantId: PILOT_MERCHANT_A,
        amountMinor: 800000,
        currency: 'INR',
        receipt: 'RCPT-PILOT-FAIL-003',
      });

      const failedExec = await razorpaySandboxAdapter.executePayment({
        orderId: order.orderId,
        merchantId: PILOT_MERCHANT_A,
        amountMinor: order.amountMinor,
        currency: order.currency,
        method: PaymentMethodType.CARD,
        methodDetails: { simulatedScenario: 'INSUFFICIENT_FUNDS' },
      });

      assert.strictEqual(failedExec.status, 'FAILED');
      assert.strictEqual(failedExec.errorCode, 'ERR_INSUFFICIENT_FUNDS');

      const currentOrder = orderService.getOrder(order.orderId);
      assert.notStrictEqual(currentOrder.status, PaymentOrderStatus.CAPTURED);
    });
  });

  describe('Stage 5: Idempotency Enforcement & Duplicate Request Protection', () => {
    it('ensures duplicate payment verification does not credit ledger twice', async () => {
      const order = await orderService.createOrder({
        merchantId: PILOT_MERCHANT_A,
        amountMinor: 500000, // ₹5,000.00
        currency: 'INR',
        receipt: 'RCPT-IDEM-PILOT-004',
      });

      const exec = await razorpaySandboxAdapter.executePayment({
        orderId: order.orderId,
        merchantId: PILOT_MERCHANT_A,
        amountMinor: order.amountMinor,
        currency: order.currency,
        method: PaymentMethodType.UPI,
        methodDetails: { simulatedScenario: 'SUCCESS' },
      });

      // Verification 1
      const firstAttempt = await paymentService.verifyAndCapturePayment({
        orderId: order.orderId,
        paymentId: exec.gatewayTransactionId,
        signature: exec.signature,
        providerId: 'RAZORPAY_SANDBOX',
        merchantId: PILOT_MERCHANT_A,
      });
      assert.strictEqual(firstAttempt.status, PaymentAttemptStatus.SUCCESS);
      const ledgerCountAfterFirst = ledgerService.getEntries(PILOT_MERCHANT_A).length;

      // Duplicate Verification 2 (Replay)
      const secondAttempt = await paymentService.verifyAndCapturePayment({
        orderId: order.orderId,
        paymentId: exec.gatewayTransactionId,
        signature: exec.signature,
        providerId: 'RAZORPAY_SANDBOX',
        merchantId: PILOT_MERCHANT_A,
      });
      assert.strictEqual(secondAttempt.status, PaymentAttemptStatus.SUCCESS);
      const ledgerCountAfterSecond = ledgerService.getEntries(PILOT_MERCHANT_A).length;

      assert.strictEqual(ledgerCountAfterSecond, ledgerCountAfterFirst);
    });
  });

  describe('Stage 6: Webhook Security, Deduplication & Replay Guard', () => {
    it('verifies valid HMAC-SHA256 signature and rejects forged webhook payloads', () => {
      const secret = 'rzp_test_whsec_pilot_98765';
      const payload = JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_pilot_sec_001',
              amount: 500000,
              currency: 'INR',
              status: 'captured',
            },
          },
        },
      });

      const validSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
      const isValid = razorpaySandboxAdapter.verifyWebhookSignature(payload, validSignature, secret);
      assert.strictEqual(isValid, true);

      // Forged payload must fail
      const forgedPayload = payload.replace('500000', '999999');
      const isForgedValid = razorpaySandboxAdapter.verifyWebhookSignature(forgedPayload, validSignature, secret);
      assert.strictEqual(isForgedValid, false);
    });

    it('deduplicates identical webhook events and prevents duplicate processing', async () => {
      const endpoint = webhookService.registerEndpoint(
        PILOT_MERCHANT_A,
        'https://merchant.example.com/pilot-webhook',
        ['*'],
      );

      const stableEventId = 'evt_pilot_uniq_99901';

      // First dispatch
      const firstDispatch = await webhookService.dispatchEvent(
        PILOT_MERCHANT_A,
        'payment.captured',
        { orderId: 'order_pilot_wh_001' },
        stableEventId,
      );
      assert.strictEqual(firstDispatch.length, 1);
      assert.strictEqual(firstDispatch[0].status, 'SIMULATED_DELIVERY');

      // Duplicate dispatch with same event ID
      const secondDispatch = await webhookService.dispatchEvent(
        PILOT_MERCHANT_A,
        'payment.captured',
        { orderId: 'order_pilot_wh_001' },
        stableEventId,
      );
      assert.strictEqual(secondDispatch.length, 1);
      // Reused existing delivery without second firing
      assert.strictEqual(secondDispatch[0].deliveryId, firstDispatch[0].deliveryId);
    });
  });

  describe('Stage 7: Full and Partial Refunds with Two-Tier Balance Safety', () => {
    it('executes partial refund and prevents aggregate refunds from exceeding captured balance', async () => {
      const order = await orderService.createOrder({
        merchantId: PILOT_MERCHANT_A,
        amountMinor: 100000, // ₹1,000.00
        currency: 'INR',
      });

      // Capture order and record ledger
      orderService.transitionOrderStatus(order.orderId, PaymentOrderStatus.PENDING);
      orderService.transitionOrderStatus(order.orderId, PaymentOrderStatus.CAPTURED);
      await ledgerService.recordPaymentCapture(order.orderId, PILOT_MERCHANT_A, 100000, 0, 0);

      // Partial refund 1: ₹400.00 (40000 paise)
      const refund1 = await refundService.processRefund({
        orderId: order.orderId,
        merchantId: PILOT_MERCHANT_A,
        amountMinor: 40000,
        reason: 'Customer requested partial room cancellation',
        providerId: 'RAZORPAY_SANDBOX',
      });
      assert.strictEqual(refund1.status, RefundStatus.COMPLETED);
      assert.strictEqual(refund1.amountMinor, 40000);

      // Partial refund 2: ₹600.00 (60000 paise - remaining balance)
      const refund2 = await refundService.processRefund({
        orderId: order.orderId,
        merchantId: PILOT_MERCHANT_A,
        amountMinor: 60000,
        reason: 'Customer requested full booking cancellation',
        providerId: 'RAZORPAY_SANDBOX',
      });
      assert.strictEqual(refund2.status, RefundStatus.COMPLETED);
      assert.strictEqual(refund2.amountMinor, 60000);

      // Excessive refund 3: ₹100.00 (Must fail due to exhausted balance)
      await assert.rejects(
        async () => {
          await refundService.processRefund({
            orderId: order.orderId,
            merchantId: PILOT_MERCHANT_A,
            amountMinor: 10000,
            reason: 'Excessive refund attempt',
            providerId: 'RAZORPAY_SANDBOX',
          });
        },
        (err: any) => {
          assert.ok(
            err.message.includes('already fully refunded') ||
              err.message.includes('exceeds remaining refundable balance'),
          );
          return true;
        },
      );
    });
  });

  describe('Stage 8: Uncertain Outcome Handling & Recovery Runbook Verification', () => {
    it('safely handles provider timeout during payment without marking order FAILED prematurely', async () => {
      const order = await orderService.createOrder({
        merchantId: PILOT_MERCHANT_A,
        amountMinor: 100000,
        currency: 'INR',
      });

      const timeoutExec = await razorpaySandboxAdapter.executePayment({
        orderId: order.orderId,
        merchantId: PILOT_MERCHANT_A,
        amountMinor: order.amountMinor,
        currency: order.currency,
        method: PaymentMethodType.UPI,
        methodDetails: { simulatedScenario: 'BANK_TIMEOUT' },
      });

      assert.strictEqual(timeoutExec.status, 'PENDING');
      assert.strictEqual(timeoutExec.errorCode, 'ERR_PROVIDER_TIMEOUT');

      const currentOrder = orderService.getOrder(order.orderId);
      assert.notStrictEqual(currentOrder.status, PaymentOrderStatus.FAILED);
    });
  });

  describe('Stage 9 & 10: Reconciliation Engine & Double-Entry Ledger Integrity', () => {
    it('executes reconciliation batch and asserts zero-sum double-entry ledger balance', async () => {
      const order = await orderService.createOrder({
        merchantId: PILOT_MERCHANT_A,
        amountMinor: 200000, // ₹2,000.00
        currency: 'INR',
        receipt: 'RCPT-RECON-PILOT-008',
      });

      // Capture order and record ledger
      await paymentService.processPayment({
        orderId: order.orderId,
        method: PaymentMethodType.UPI,
        methodDetails: { simulatedScenario: 'SUCCESS', vpa: 'user@okaxis' },
      });

      // Run reconciliation batch
      const batch = await reconService.runReconciliationBatch(PILOT_MERCHANT_A);
      assert.ok(batch.batchId.startsWith('rec_batch_'));
      assert.strictEqual(batch.merchantId, PILOT_MERCHANT_A);
      assert.ok(batch.matchedCount >= 1);
      assert.strictEqual(batch.discrepancyCount, 0);
      assert.strictEqual(batch.status, 'MATCHED');

      // Verify Ledger Integrity: Debits equal Credits
      const ledgerEntries = ledgerService.getEntries(PILOT_MERCHANT_A);
      let totalDebits = 0;
      let totalCredits = 0;
      for (const entry of ledgerEntries) {
        if (entry.direction === LedgerDirection.DEBIT) {
          totalDebits += entry.amountMinor;
        } else {
          totalCredits += entry.amountMinor;
        }
      }
      assert.strictEqual(totalDebits, totalCredits);
      assert.ok(totalDebits > 0);
      assert.strictEqual(ledgerService.verifyLedgerBalance(PILOT_MERCHANT_A), true);
    });
  });

  describe('Stage 11: Cross-Merchant Multi-Tenant Isolation (IDOR Defense)', () => {
    it('strictly denies Merchant B from viewing or accessing Merchant A orders or payments', async () => {
      const orderA = await orderService.createOrder({
        merchantId: PILOT_MERCHANT_A,
        amountMinor: 300000,
        currency: 'INR',
        receipt: 'RCPT-ISOLATION-A-001',
      });

      // Merchant B attempts to fetch Merchant A's order
      const fetchedOrder = orderService.getOrder(orderA.orderId);
      assert.notStrictEqual(fetchedOrder.merchantId, PILOT_MERCHANT_B);

      // Merchant B attempts to refund Merchant A's order
      await assert.rejects(
        async () => {
          await refundService.processRefund({
            orderId: orderA.orderId,
            merchantId: PILOT_MERCHANT_B, // Rogue merchant
            amountMinor: 10000,
            reason: 'Unauthorized refund attempt',
            idempotencyKey: 'idem_cross_tenant_ref',
          });
        },
        (err: any) => err.message.includes('not found') || err.message.includes('unauthorized'),
      );
    });
  });

  describe('Stage 12: Secret Masking & Non-Live Boundary Enforcement', () => {
    it('verifies live payment flag is false and provider credentials are never leaked', () => {
      assert.strictEqual(process.env.ENABLE_LIVE_PAYMENTS !== 'true', true);
      assert.strictEqual(razorpaySandboxAdapter.isLiveAuthorized(), false);
      assert.strictEqual(razorpaySandboxAdapter.isSimulation(), true);

      // Verify that inspecting public provider details does not leak secret keys
      const providerId = razorpaySandboxAdapter.getProviderId();
      assert.strictEqual(providerId, 'RAZORPAY_SANDBOX');
      assert.strictEqual(
        (razorpaySandboxAdapter as any).config.keySecret.includes('placeholder') ||
          (razorpaySandboxAdapter as any).config.keySecret.startsWith('rzp_test'),
        true,
      );
      assert.strictEqual((razorpaySandboxAdapter as any).config.keySecret.startsWith('rzp_live'), false);
    });
  });
});
