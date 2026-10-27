import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as crypto from 'crypto';

// Import Gateway Services directly from Backend source
import { GatewayMerchantService } from '../18_DEVELOPMENT/Backend/src/gateway/merchants/gateway-merchant.service';
import { GatewayOrderService } from '../18_DEVELOPMENT/Backend/src/gateway/orders/gateway-order.service';
import { GatewayPaymentService } from '../18_DEVELOPMENT/Backend/src/gateway/payments/gateway-payment.service';
import { GatewayLedgerService } from '../18_DEVELOPMENT/Backend/src/gateway/ledger/gateway-ledger.service';
import { GatewayRefundService } from '../18_DEVELOPMENT/Backend/src/gateway/refunds/gateway-refund.service';
import { GatewayWebhookService } from '../18_DEVELOPMENT/Backend/src/gateway/webhooks/gateway-webhook.service';
import { GatewayFraudService } from '../18_DEVELOPMENT/Backend/src/gateway/fraud/gateway-fraud.service';
import { GatewayReconciliationService } from '../18_DEVELOPMENT/Backend/src/gateway/reconciliation/gateway-reconciliation.service';
import { GatewayAuditService } from '../18_DEVELOPMENT/Backend/src/gateway/security/gateway-audit.service';
import { ProviderRegistry } from '../18_DEVELOPMENT/Backend/src/gateway/providers/provider.registry';
import { SimulatedPaymentAdapter } from '../18_DEVELOPMENT/Backend/src/gateway/providers/simulated-payment.adapter';
import { MockBankAdapter } from '../18_DEVELOPMENT/Backend/src/gateway/providers/mock-bank.adapter';
import {
  PaymentOrderStatus,
  PaymentMethodType,
  LedgerAccountType,
  LedgerDirection,
} from '../18_DEVELOPMENT/Backend/src/gateway/domain/gateway.types';

describe('BharatGateway™ Independent Fintech Platform — Verification Suite', () => {
  // Setup unified service graph
  const merchantService = new GatewayMerchantService();
  const orderService = new GatewayOrderService(merchantService);
  const ledgerService = new GatewayLedgerService();
  const webhookService = new GatewayWebhookService();
  const fraudService = new GatewayFraudService();
  const simAdapter = new SimulatedPaymentAdapter();
  const mockBankAdapter = new MockBankAdapter();
  const providerRegistry = new ProviderRegistry(simAdapter, mockBankAdapter);
  const paymentService = new GatewayPaymentService(
    orderService,
    providerRegistry,
    ledgerService,
    webhookService,
    fraudService,
  );
  const refundService = new GatewayRefundService(
    orderService,
    ledgerService,
    webhookService,
    providerRegistry,
  );
  const reconService = new GatewayReconciliationService(
    orderService,
    paymentService,
    ledgerService,
  );
  const auditService = new GatewayAuditService();

  const DEFAULT_MERCH_ID = 'merch_default_bharat_001';

  // ----------------------------------------------------------------------------
  // 1. MERCHANT AUTHORIZATION & SECRETS SAFETY
  // ----------------------------------------------------------------------------
  describe('1. Merchant Auth & API Key Security', () => {
    it('generates publishable (pk_test_) and secret (sk_test_) keys without storing plaintext secret', () => {
      const keys = merchantService.generateApiCredentials(DEFAULT_MERCH_ID, 'Test Key Pair');
      assert.ok(keys.publishableKey.startsWith('pk_test_'));
      assert.ok(keys.secretKeyPlaintext.startsWith('sk_test_'));

      // Validate secret key validation hash lookup
      const validated = merchantService.validateKey(keys.secretKeyPlaintext);
      assert.strictEqual(validated.merchantId, DEFAULT_MERCH_ID);
      assert.strictEqual(validated.isSecretKey, true);

      // Verify that stored credentials never expose plaintext secret
      const stored = merchantService.listCredentials(DEFAULT_MERCH_ID);
      const target = stored.find(s => s.id === keys.credentialId);
      assert.ok(target);
      assert.strictEqual((target as any).secretKeyPlaintext, undefined);
      assert.strictEqual((target as any).secretKeyHash, undefined); // omitted in public list
    });

    it('rejects unrecognized or malformed API keys', () => {
      assert.throws(
        () => merchantService.validateKey('invalid_key_format_123'),
        /Unrecognized API key format/,
      );
    });
  });

  // ----------------------------------------------------------------------------
  // 2. CROSS-MERCHANT TENANT ISOLATION
  // ----------------------------------------------------------------------------
  describe('2. Multi-Tenant Data Isolation', () => {
    it('prevents Merchant B from accessing Merchant A orders', async () => {
      // Create Merchant B
      const merchB = merchantService.createMerchant({
        businessName: 'Merchant B Logistics',
        legalEntityName: 'Merchant B Pvt Ltd',
        contactEmail: 'merchb@example.com',
        contactPhone: '+919876543211',
      });

      // Merchant A creates order
      const orderA = await orderService.createOrder({
        merchantId: DEFAULT_MERCH_ID,
        amountMinor: 50000,
        currency: 'INR',
      });

      // Merchant B attempts to fetch Order A
      assert.throws(
        () => orderService.getOrder(orderA.orderId, merchB.merchant.id),
        /not found for merchant/,
      );
    });
  });

  // ----------------------------------------------------------------------------
  // 3. INTEGER MINOR UNIT PRECISION & AMOUNT SAFETY
  // ----------------------------------------------------------------------------
  describe('3. Amount and Currency Safety', () => {
    it('enforces positive integer minor units (rejects floating decimals and negative numbers)', async () => {
      // Reject negative amount
      await assert.rejects(
        orderService.createOrder({
          merchantId: DEFAULT_MERCH_ID,
          amountMinor: -5000,
        }),
        /Order amount must be a positive integer in minor units/,
      );

      // Reject floating-point amount (e.g. 100.50)
      await assert.rejects(
        orderService.createOrder({
          merchantId: DEFAULT_MERCH_ID,
          amountMinor: 100.5,
        }),
        /Order amount must be a positive integer in minor units/,
      );

      // Reject unsupported currency
      await assert.rejects(
        orderService.createOrder({
          merchantId: DEFAULT_MERCH_ID,
          amountMinor: 10000,
          currency: 'XYZ',
        }),
        /Unsupported currency/,
      );
    });

    it('creates valid order with integer paise and locks amount immutably', async () => {
      const order = await orderService.createOrder({
        merchantId: DEFAULT_MERCH_ID,
        amountMinor: 249900, // ₹2,499.00
        currency: 'INR',
        receipt: 'RCPT_TEST_101',
      });

      assert.strictEqual(order.amountMinor, 249900);
      assert.strictEqual(order.currency, 'INR');
      assert.strictEqual(order.status, PaymentOrderStatus.CREATED);
    });
  });

  // ----------------------------------------------------------------------------
  // 4. IDEMPOTENCY PROTECTION
  // ----------------------------------------------------------------------------
  describe('4. Idempotency Protection', () => {
    it('returns the existing order when identical idempotency key is submitted', async () => {
      const idempKey = `idemp_test_${Date.now()}`;

      const order1 = await orderService.createOrder({
        merchantId: DEFAULT_MERCH_ID,
        amountMinor: 150000,
        idempotencyKey: idempKey,
      });

      const order2 = await orderService.createOrder({
        merchantId: DEFAULT_MERCH_ID,
        amountMinor: 150000,
        idempotencyKey: idempKey,
      });

      assert.strictEqual(order1.orderId, order2.orderId);
      assert.strictEqual(order1.amountMinor, order2.amountMinor);
    });
  });

  // ----------------------------------------------------------------------------
  // 5. PAYMENT STATE MACHINE & SIMULATOR
  // ----------------------------------------------------------------------------
  describe('5. Payment State Transitions & Simulation Engine', () => {
    it('executes successful payment simulation, transitions order to CAPTURED, and returns HMAC signature', async () => {
      const order = await orderService.createOrder({
        merchantId: DEFAULT_MERCH_ID,
        amountMinor: 350000, // ₹3,500.00
        currency: 'INR',
      });

      const attempt = await paymentService.processPayment({
        orderId: order.orderId,
        method: PaymentMethodType.UPI,
        methodDetails: {
          vpa: 'kaushal@okhdfcbank',
          simulatedScenario: 'SUCCESS',
        },
      });

      assert.strictEqual(attempt.status, 'SUCCESS');
      assert.strictEqual(attempt.isSimulated, true);
      assert.ok(attempt.signature);

      // Verify order state transition to CAPTURED
      const updatedOrder = orderService.getOrder(order.orderId);
      assert.strictEqual(updatedOrder.status, PaymentOrderStatus.CAPTURED);
    });

    it('rejects invalid state machine transitions', async () => {
      const order = await orderService.createOrder({
        merchantId: DEFAULT_MERCH_ID,
        amountMinor: 100000,
      });

      // Order is in CREATED status; trying to transition directly to REFUNDED must fail
      assert.throws(
        () => orderService.transitionOrderStatus(order.orderId, PaymentOrderStatus.REFUNDED),
        /Invalid payment order state transition/,
      );
    });

    it('handles simulated failure scenarios deterministically (INSUFFICIENT_FUNDS)', async () => {
      const order = await orderService.createOrder({
        merchantId: DEFAULT_MERCH_ID,
        amountMinor: 99000,
      });

      const attempt = await paymentService.processPayment({
        orderId: order.orderId,
        method: PaymentMethodType.CARD,
        methodDetails: {
          cardLast4: '0002',
          simulatedScenario: 'INSUFFICIENT_FUNDS',
        },
      });

      assert.strictEqual(attempt.status, 'FAILED');
      assert.strictEqual(attempt.errorCode, 'ERR_INSUFFICIENT_FUNDS');

      const updatedOrder = orderService.getOrder(order.orderId);
      assert.strictEqual(updatedOrder.status, PaymentOrderStatus.FAILED);
    });
  });

  // ----------------------------------------------------------------------------
  // 6. APPEND-ONLY DOUBLE-ENTRY FINANCIAL LEDGER
  // ----------------------------------------------------------------------------
  describe('6. Append-Only Double-Entry Financial Ledger', () => {
    it('strictly enforces balanced double-entry (Debits == Credits)', async () => {
      // Unbalanced entry must throw
      await assert.rejects(
        ledgerService.postBalancedTransaction({
          transactionReference: 'tx_unbalanced_test',
          referenceType: 'PAYMENT',
          referenceId: 'ref_1',
          merchantId: DEFAULT_MERCH_ID,
          description: 'Unbalanced test',
          entries: [
            {
              accountType: LedgerAccountType.GATEWAY_CLEARING,
              direction: LedgerDirection.DEBIT,
              amountMinor: 10000,
              description: 'Debit 10000',
            },
            {
              accountType: LedgerAccountType.MERCHANT_SETTLEMENT_PAYABLE,
              direction: LedgerDirection.CREDIT,
              amountMinor: 8000, // OUT OF BALANCE!
              description: 'Credit 8000',
            },
          ],
        }),
        /Ledger out-of-balance!/,
      );
    });

    it('records balanced double-entry payment capture and updates running balances', async () => {
      const res = await ledgerService.recordPaymentCapture(
        'order_test_ledg_101',
        DEFAULT_MERCH_ID,
        50000, // ₹500.00
      );

      assert.strictEqual(res.totalAmountMinor, 50000);
      assert.strictEqual(res.entriesCount, 2);

      const clearingBalance = ledgerService.getAccountBalance(DEFAULT_MERCH_ID, LedgerAccountType.GATEWAY_CLEARING);
      const payableBalance = ledgerService.getAccountBalance(DEFAULT_MERCH_ID, LedgerAccountType.MERCHANT_SETTLEMENT_PAYABLE);

      // Cumulative balance includes test 5 (350,000) + test 6 (50,000) = 400,000 paise
      assert.strictEqual(clearingBalance, 400000); // Debit balance
      assert.strictEqual(payableBalance, -400000); // Credit balance
    });
  });

  // ----------------------------------------------------------------------------
  // 7. FULL & PARTIAL REFUND WORKFLOW
  // ----------------------------------------------------------------------------
  describe('7. Full & Partial Refund Lifecycle', () => {
    it('executes partial refund, updates order status, and posts compensating ledger reversal', async () => {
      const order = await orderService.createOrder({
        merchantId: DEFAULT_MERCH_ID,
        amountMinor: 100000, // ₹1,000.00
      });

      // Capture order first
      await paymentService.processPayment({
        orderId: order.orderId,
        method: PaymentMethodType.UPI,
        methodDetails: { simulatedScenario: 'SUCCESS' },
      });

      // Execute Partial Refund of ₹400.00 (40000 paise)
      const refund = await refundService.processRefund({
        orderId: order.orderId,
        merchantId: DEFAULT_MERCH_ID,
        amountMinor: 40000,
        reason: 'Customer cancelled 1 ticket',
      });

      assert.strictEqual(refund.amountMinor, 40000);
      assert.strictEqual(refund.status, 'COMPLETED');

      const updatedOrder = orderService.getOrder(order.orderId);
      assert.strictEqual(updatedOrder.amountRefundedMinor, 40000);
      assert.strictEqual(updatedOrder.status, PaymentOrderStatus.PARTIALLY_REFUNDED);

      // Reject refund exceeding remaining refundable balance (remaining is ₹600.00)
      await assert.rejects(
        refundService.processRefund({
          orderId: order.orderId,
          merchantId: DEFAULT_MERCH_ID,
          amountMinor: 70000, // > 60000
          reason: 'Excess refund',
        }),
        /exceeds remaining refundable balance/,
      );
    });
  });

  // ----------------------------------------------------------------------------
  // 8. SIGNED WEBHOOKS & REPLAY ATTACK DEFENSE
  // ----------------------------------------------------------------------------
  describe('8. Webhook Signatures & Replay Protection', () => {
    it('generates HMAC-SHA256 signature and verifies authentic payload', () => {
      const payload = { event: 'payment.captured', orderId: 'order_test_999' };
      const secret = 'whsec_test_secret_key_84918294819284';
      const timestamp = Math.floor(Date.now() / 1000);

      const sigHeader = webhookService.generateSignatureHeader(payload, secret, timestamp);
      const verified = webhookService.verifyWebhookSignature(payload, sigHeader, secret, 300);

      assert.strictEqual(verified, true);
    });

    it('rejects tampered webhook payload', () => {
      const payload = { event: 'payment.captured', amount: 500 };
      const tamperedPayload = { event: 'payment.captured', amount: 999999 };
      const secret = 'whsec_test_secret_key_84918294819284';
      const timestamp = Math.floor(Date.now() / 1000);

      const sigHeader = webhookService.generateSignatureHeader(payload, secret, timestamp);

      assert.throws(
        () => webhookService.verifyWebhookSignature(tamperedPayload, sigHeader, secret, 300),
        /Invalid webhook signature/,
      );
    });

    it('rejects replayed webhook request where timestamp drift exceeds 300 seconds', () => {
      const payload = { event: 'payment.captured' };
      const secret = 'whsec_test_secret_key_84918294819284';
      const oldTimestamp = Math.floor(Date.now() / 1000) - 400; // 400s old (> 300s)

      const sigHeader = webhookService.generateSignatureHeader(payload, secret, oldTimestamp);

      assert.throws(
        () => webhookService.verifyWebhookSignature(payload, sigHeader, secret, 300),
        /Webhook timestamp drift exceeds tolerance window/,
      );
    });
  });

  // ----------------------------------------------------------------------------
  // 9. 4-WAY FINANCIAL RECONCILIATION
  // ----------------------------------------------------------------------------
  describe('9. 4-Way Reconciliation Batch Engine', () => {
    it('successfully scans and verifies captured orders match ledger and payment attempts', async () => {
      const report = await reconService.runReconciliationBatch(DEFAULT_MERCH_ID);
      assert.ok(report.batchId.startsWith('rec_batch_'));
      assert.ok(report.totalOrdersScanned >= 1);
      assert.strictEqual(report.discrepancyCount, 0);
      assert.strictEqual(report.status, 'MATCHED');
    });
  });

  // ----------------------------------------------------------------------------
  // 10. FRAUD & VELOCITY MONITORING
  // ----------------------------------------------------------------------------
  describe('10. Fraud & Velocity Rules', () => {
    it('flags high-value order anomalies (> ₹100,000 / 10,000,000 paise)', async () => {
      const evalResult = await fraudService.evaluateTransactionRisk({
        orderId: 'order_high_val',
        merchantId: DEFAULT_MERCH_ID,
        amountMinor: 15000000, // ₹1,50,000
        method: 'CARD',
      });

      assert.ok(evalResult.triggeredRules.includes('RULE_HIGH_VALUE_ANOMALY'));
      assert.ok(evalResult.riskScore >= 30);
    });

    it('blocks known fraud test scenarios', async () => {
      const evalResult = await fraudService.evaluateTransactionRisk({
        orderId: 'order_fraud_test',
        merchantId: DEFAULT_MERCH_ID,
        amountMinor: 10000,
        method: 'CARD',
        methodDetails: { simulatedScenario: 'FRAUD_BLOCKED' },
      });

      assert.strictEqual(evalResult.action, 'BLOCK');
      assert.ok(evalResult.riskScore >= 75);
    });
  });

  // ----------------------------------------------------------------------------
  // 11. PCI DATA REDACTION & AUDIT TRAILS
  // ----------------------------------------------------------------------------
  describe('11. PCI-DSS Data Redaction & Audit Integrity', () => {
    it('redacts PAN card numbers, CVVs, and API secrets from audit log payloads', () => {
      const audit = auditService.logEvent({
        actorId: 'test_admin',
        actorRole: 'ADMIN',
        merchantId: DEFAULT_MERCH_ID,
        action: 'PAYMENT_PROCESSED',
        resourceType: 'PAYMENT',
        resourceId: 'pay_test_001',
        metadata: {
          apiKey: 'sk_test_secret_123',
          cardCVV: '999',
          cardNumber: '4111111111111111',
          customerName: 'Kaushal Pandya',
        },
      });

      assert.strictEqual(audit.sanitizedMetadata.apiKey, '[REDACTED_PCI_SECRET]');
      assert.strictEqual(audit.sanitizedMetadata.cardCVV, '[REDACTED_PCI_SECRET]');
      assert.strictEqual(audit.sanitizedMetadata.cardNumber, '****-****-****-1111');
      assert.strictEqual(audit.sanitizedMetadata.customerName, 'Kaushal Pandya');
    });
  });

  // ----------------------------------------------------------------------------
  // 12. PHASE 2: SECURITY & CONCURRENCY HARDENING REGRESSION TESTS
  // ----------------------------------------------------------------------------
  describe('12. Phase 2 Hardening: Auth Revocation, Scope Enforcement & Mutex Locks', () => {
    it('immediately blocks API key operations upon revocation', () => {
      const keys = merchantService.generateApiCredentials(DEFAULT_MERCH_ID, 'Revocation Test Key');
      const validCheck = merchantService.validateKey(keys.secretKeyPlaintext);
      assert.strictEqual(validCheck.merchantId, DEFAULT_MERCH_ID);
      assert.ok(validCheck.permissions.includes('orders:create'));

      // Revoke the key
      merchantService.revokeKey(DEFAULT_MERCH_ID, keys.credentialId);

      // Subsequent validation must fail
      assert.throws(
        () => merchantService.validateKey(keys.secretKeyPlaintext),
        /API key has been revoked/,
      );
    });

    it('prevents concurrent double-capture via in-flight processing lock', async () => {
      const order = await orderService.createOrder({
        merchantId: DEFAULT_MERCH_ID,
        amountMinor: 250000,
        currency: 'INR',
      });

      // Launch two simultaneous payment process calls
      const p1 = paymentService.processPayment({
        orderId: order.orderId,
        method: PaymentMethodType.UPI,
        methodDetails: {
          vpa: 'success@upi',
          simulatedScenario: 'SUCCESS',
        },
      });

      // The second call initiated immediately before p1 completes should hit mutex lock or already captured
      const p2 = paymentService.processPayment({
        orderId: order.orderId,
        method: PaymentMethodType.UPI,
        methodDetails: {
          vpa: 'success@upi',
          simulatedScenario: 'SUCCESS',
        },
      });

      const results = await Promise.allSettled([p1, p2]);
      const fulfilled = results.filter(r => r.status === 'fulfilled');
      const rejected = results.filter(r => r.status === 'rejected');

      // Exactly one must succeed and one must be rejected (either via in-flight mutex or status check)
      assert.strictEqual(fulfilled.length, 1);
      assert.strictEqual(rejected.length, 1);
      const err = (rejected[0] as PromiseRejectedResult).reason;
      assert.ok(
        err.message.includes('Duplicate concurrent attempts rejected') ||
        err.message.includes('Cannot process payment for Order') ||
        err.message.includes('already in progress'),
      );
    });

    it('prevents concurrent double-refund via in-flight refund mutex', async () => {
      const order = await orderService.createOrder({
        merchantId: DEFAULT_MERCH_ID,
        amountMinor: 100000,
        currency: 'INR',
      });

      await paymentService.processPayment({
        orderId: order.orderId,
        method: PaymentMethodType.UPI,
        methodDetails: {
          vpa: 'success@upi',
          simulatedScenario: 'SUCCESS',
        },
      });

      // Launch two simultaneous refund calls for the same order
      const r1 = refundService.processRefund({
        orderId: order.orderId,
        amountMinor: 100000,
        reason: 'Concurrent test refund 1',
        merchantId: DEFAULT_MERCH_ID,
      });

      const r2 = refundService.processRefund({
        orderId: order.orderId,
        amountMinor: 100000,
        reason: 'Concurrent test refund 2',
        merchantId: DEFAULT_MERCH_ID,
      });

      const results = await Promise.allSettled([r1, r2]);
      const fulfilled = results.filter(r => r.status === 'fulfilled');
      const rejected = results.filter(r => r.status === 'rejected');

      assert.strictEqual(fulfilled.length, 1);
      assert.strictEqual(rejected.length, 1);
      const err = (rejected[0] as PromiseRejectedResult).reason;
      assert.ok(
        err.message.includes('Duplicate concurrent attempts rejected') ||
        err.message.includes('exceeds remaining refundable balance') ||
        err.message.includes('already has an active refund in progress'),
      );
    });
  });
});

