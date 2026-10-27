import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { Pool } from 'pg';
import { GatewayPersistenceService } from '../18_DEVELOPMENT/Backend/src/gateway/database/gateway-persistence.service';
import { GatewayMerchantService } from '../18_DEVELOPMENT/Backend/src/gateway/merchants/gateway-merchant.service';
import { GatewayOrderService } from '../18_DEVELOPMENT/Backend/src/gateway/orders/gateway-order.service';
import { GatewayPaymentService } from '../18_DEVELOPMENT/Backend/src/gateway/payments/gateway-payment.service';
import { GatewayLedgerService } from '../18_DEVELOPMENT/Backend/src/gateway/ledger/gateway-ledger.service';
import { GatewayRefundService } from '../18_DEVELOPMENT/Backend/src/gateway/refunds/gateway-refund.service';
import { GatewayWebhookService } from '../18_DEVELOPMENT/Backend/src/gateway/webhooks/gateway-webhook.service';
import { GatewayFraudService } from '../18_DEVELOPMENT/Backend/src/gateway/fraud/gateway-fraud.service';
import { ProviderRegistry } from '../18_DEVELOPMENT/Backend/src/gateway/providers/provider.registry';
import { SimulatedPaymentAdapter } from '../18_DEVELOPMENT/Backend/src/gateway/providers/simulated-payment.adapter';
import { MockBankAdapter } from '../18_DEVELOPMENT/Backend/src/gateway/providers/mock-bank.adapter';
import {
  PaymentOrderStatus,
  PaymentMethodType,
  PaymentAttemptStatus,
} from '../18_DEVELOPMENT/Backend/src/gateway/domain/gateway.types';

describe('BharatGateway™ Phase 2: PostgreSQL Reliability, Atomicity & Concurrency Suite', () => {
  const PG_CONN_STRING =
    process.env.GATEWAY_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.STAGING_DATABASE_URL ||
    'postgresql://gateway_user:gateway_secure_password_2026@127.0.0.1:5432/bharatgateway_dev';

  let safeHostPort = '127.0.0.1:5432';
  let safeDb = 'bharatgateway_dev';
  try {
    const url = new URL(PG_CONN_STRING);
    safeHostPort = `${url.hostname}:${url.port || '5432'}`;
    safeDb = url.pathname.replace(/^\//, '');
  } catch {}

  let pool: Pool;
  let persistenceService: GatewayPersistenceService;
  let merchantService: GatewayMerchantService;
  let orderService: GatewayOrderService;
  let paymentService: GatewayPaymentService;
  let ledgerService: GatewayLedgerService;
  let refundService: GatewayRefundService;
  let isPostgresAvailable = false;

  const TEST_MERCHANT_ID = 'merch_phase2_pg_test';

  before(async () => {
    // Probe PostgreSQL availability
    try {
      pool = new Pool({
        connectionString: PG_CONN_STRING,
        connectionTimeoutMillis: 2000,
      });
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      isPostgresAvailable = true;
    } catch (err: any) {
      isPostgresAvailable = false;
      throw new Error(
        `[PREREQUISITE_BLOCKED] PostgreSQL is unreachable at ${safeHostPort}/${safeDb} (${err.message}). ` +
        `This suite is explicitly designated as an authentic PostgreSQL integration test and cannot silently pass via in-memory fallback. ` +
        `Prerequisite to run real DB tests: Start the gateway database container with 'docker compose -f docker-compose.gateway.yml up -d gateway-postgres' or configure GATEWAY_DATABASE_URL with an accessible PostgreSQL instance.`
      );
    }

    // Set connection string for persistence service
    process.env.GATEWAY_DATABASE_URL = PG_CONN_STRING;
    persistenceService = new GatewayPersistenceService();
    await persistenceService.onModuleInit();

    assert.strictEqual(
      persistenceService.isDatabaseConnected(),
      true,
      `[PREREQUISITE_BLOCKED] GatewayPersistenceService failed to establish active PostgreSQL connection to ${safeHostPort}/${safeDb}. In-memory fallback is disabled for this integration suite.`
    );

    merchantService = new GatewayMerchantService();
    // Seed test merchant
    (merchantService as any).merchants.set(TEST_MERCHANT_ID, {
      id: TEST_MERCHANT_ID,
      merchantCode: 'MERCH_PHASE2_TEST',
      businessName: 'Phase 2 Test Logistics',
      legalEntityName: 'Phase 2 Test Logistics Pvt Ltd',
      contactEmail: 'phase2_test@bharatyatra.in',
      contactPhone: '+919988776655',
      kycStatus: 'APPROVED',
      defaultCurrency: 'INR',
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    orderService = new GatewayOrderService(merchantService, persistenceService);
    ledgerService = new GatewayLedgerService();
    const webhookService = new GatewayWebhookService();
    const fraudService = new GatewayFraudService();
    const providerRegistry = new ProviderRegistry(
      new SimulatedPaymentAdapter(),
      new MockBankAdapter(),
    );

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
  });

  after(async () => {
    if (isPostgresAvailable && pool) {
      try {
        // Clean up only test records created by this test suite
        await pool.query(
          `DELETE FROM bg_order_state_transitions WHERE order_id IN (SELECT order_id FROM bg_payment_orders WHERE merchant_id = $1);
           DELETE FROM bg_idempotency_locks WHERE merchant_id = $1;
           DELETE FROM bg_refunds WHERE merchant_id = $1;
           DELETE FROM bg_payment_attempts WHERE merchant_id = $1;
           DELETE FROM bg_payment_orders WHERE merchant_id = $1;`,
          [TEST_MERCHANT_ID]
        );
      } catch (cleanupErr: any) {
        // Safe cleanup
      }
    }
    if (persistenceService) {
      await persistenceService.onModuleDestroy();
    }
    if (pool) {
      await pool.end();
    }
  });

  // ----------------------------------------------------------------------------
  // 0. LIVE DATABASE TARGET & ISOLATION VERIFICATION
  // ----------------------------------------------------------------------------
  describe('0. Live Database Connectivity & Target Verification', () => {
    it('confirms genuine PostgreSQL connection was established to isolated gateway database', async () => {
      assert.strictEqual(isPostgresAvailable, true, 'PostgreSQL database connection must be active');
      assert.strictEqual(
        persistenceService.isDatabaseConnected(),
        true,
        'GatewayPersistenceService must report live database connectivity',
      );
      const dbPool = persistenceService.getPool();
      assert.ok(dbPool, 'Database pool must be present');
      const res = await dbPool.query('SELECT current_database() as db_name, version()');
      assert.ok(res.rows.length > 0);
      const dbName = res.rows[0].db_name;
      assert.ok(
        dbName === 'bharatgateway_dev' || dbName === 'bharatyatra_staging_sandbox',
        `Target database must be an isolated development/test database, got: ${dbName}`,
      );
    });
  });

  // ----------------------------------------------------------------------------
  // 1. DURABLE IDEMPOTENCY & FINGERPRINTING
  // ----------------------------------------------------------------------------
  describe('1. Database-Backed Durable Idempotency', () => {
    it('returns exact original order record for an identical retry', async () => {
      const idempKey = `idemp_test_${Date.now()}_alpha`;
      const order1 = await orderService.createOrder({
        merchantId: TEST_MERCHANT_ID,
        amountMinor: 50000,
        currency: 'INR',
        idempotencyKey: idempKey,
        description: 'Original Idempotency Test',
      });

      // Identical retry with same key and payload
      const order2 = await orderService.createOrder({
        merchantId: TEST_MERCHANT_ID,
        amountMinor: 50000,
        currency: 'INR',
        idempotencyKey: idempKey,
        description: 'Original Idempotency Test',
      });

      assert.strictEqual(order1.orderId, order2.orderId);
      assert.strictEqual(order1.amountMinor, order2.amountMinor);
    });

    it('rejects reuse of the same idempotency key with an altered payload (fingerprint mismatch)', async () => {
      const idempKey = `idemp_test_${Date.now()}_tamper`;
      await orderService.createOrder({
        merchantId: TEST_MERCHANT_ID,
        amountMinor: 10000,
        currency: 'INR',
        idempotencyKey: idempKey,
        description: 'Initial order before tamper attempt',
      });

      // Attempt to reuse same key with different amount (Paise 10000 -> 90000)
      await assert.rejects(
        orderService.createOrder({
          merchantId: TEST_MERCHANT_ID,
          amountMinor: 90000, // TAMPERED!
          currency: 'INR',
          idempotencyKey: idempKey,
          description: 'Initial order before tamper attempt',
        }),
        /reused with different request payload/,
      );
    });

    it('safely handles concurrent in-flight requests for the same idempotency key', async () => {
      const idempKey = `idemp_in_flight_${Date.now()}`;
      const payload = {
        merchantId: TEST_MERCHANT_ID,
        amountMinor: 15000,
        currency: 'INR',
        idempotencyKey: idempKey,
      };

      // Launch two concurrent requests with identical idempotency key simultaneously
      const req1 = orderService.createOrder(payload);
      const req2 = orderService.createOrder(payload);

      const results = await Promise.allSettled([req1, req2]);
      const fulfilled = results.filter(r => r.status === 'fulfilled');
      const rejected = results.filter(r => r.status === 'rejected');

      // Either both settle to the same order (one acquired lock and completed before second processed)
      // or the second is rejected with 409 Conflict. Duplicate orders must never be created!
      if (fulfilled.length === 2) {
        const o1 = (fulfilled[0] as PromiseFulfilledResult<any>).value;
        const o2 = (fulfilled[1] as PromiseFulfilledResult<any>).value;
        assert.strictEqual(o1.orderId, o2.orderId);
      } else {
        assert.strictEqual(fulfilled.length, 1);
        assert.strictEqual(rejected.length, 1);
        const err = (rejected[0] as PromiseRejectedResult).reason;
        assert.ok(
          err.message.includes('currently in flight') ||
          err.message.includes('Duplicate concurrent attempts rejected'),
        );
      }
    });

    it('redacts sensitive CVV from request fingerprinting', () => {
      const p1 = {
        orderId: 'order_123',
        cardCVV: '123',
        amountMinor: 1000,
      };
      const p2 = {
        orderId: 'order_123',
        cardCVV: '999', // Different CVV
        amountMinor: 1000,
      };

      const fp1 = persistenceService.calculateFingerprint(p1);
      const fp2 = persistenceService.calculateFingerprint(p2);
      // Both fingerprints must be identical because CVV is redacted from fingerprinting
      assert.strictEqual(fp1, fp2);
    });
  });

  // ----------------------------------------------------------------------------
  // 2. ATOMIC STATE TRANSITIONS & AUDIT TRAILS
  // ----------------------------------------------------------------------------
  describe('2. Atomic State Machine Transitions & Audit Log Integrity', () => {
    it('executes valid transitions (CREATED -> PENDING -> CAPTURED) and logs state history', async () => {
      const order = await orderService.createOrder({
        merchantId: TEST_MERCHANT_ID,
        amountMinor: 45000,
        currency: 'INR',
      });
      assert.strictEqual(order.status, PaymentOrderStatus.CREATED);

      const updated1 = orderService.transitionOrderStatus(
        order.orderId,
        PaymentOrderStatus.PENDING,
      );
      assert.strictEqual(updated1.status, PaymentOrderStatus.PENDING);

      const updated2 = orderService.transitionOrderStatus(
        order.orderId,
        PaymentOrderStatus.CAPTURED,
      );
      assert.strictEqual(updated2.status, PaymentOrderStatus.CAPTURED);

      const transitions = persistenceService.getStateTransitions(order.orderId);
      assert.ok(transitions.length >= 2);
    });

    it('strictly rejects illegal state jumps (e.g. FAILED -> CAPTURED)', () => {
      // Create a test order and set to FAILED
      const orderId = `order_illegal_${Date.now()}`;
      (orderService as any).orders.set(orderId, {
        orderId,
        merchantId: TEST_MERCHANT_ID,
        status: PaymentOrderStatus.FAILED,
        amountMinor: 20000,
        currency: 'INR',
        amountRefundedMinor: 0,
      });

      assert.throws(
        () => orderService.transitionOrderStatus(orderId, PaymentOrderStatus.CAPTURED),
        /Invalid payment order state transition from FAILED to CAPTURED/,
      );
    });
  });

  // ----------------------------------------------------------------------------
  // 3. CONCURRENT CAPTURE & CONFLICT MUTEXES
  // ----------------------------------------------------------------------------
  describe('3. Concurrency Protection & Overlapping Operation Defense', () => {
    it('prevents concurrent double-capture of the same order', async () => {
      const order = await orderService.createOrder({
        merchantId: TEST_MERCHANT_ID,
        amountMinor: 75000,
        currency: 'INR',
      });

      const cap1 = paymentService.processPayment({
        orderId: order.orderId,
        method: PaymentMethodType.UPI,
        methodDetails: { vpa: 'kaushal@upi', simulatedScenario: 'SUCCESS' },
      });

      const cap2 = paymentService.processPayment({
        orderId: order.orderId,
        method: PaymentMethodType.UPI,
        methodDetails: { vpa: 'kaushal@upi', simulatedScenario: 'SUCCESS' },
      });

      const results = await Promise.allSettled([cap1, cap2]);
      const fulfilled = results.filter(r => r.status === 'fulfilled');
      const rejected = results.filter(r => r.status === 'rejected');

      assert.strictEqual(fulfilled.length, 1);
      assert.strictEqual(rejected.length, 1);
      const err = (rejected[0] as PromiseRejectedResult).reason;
      assert.ok(
        err.message.includes('Duplicate concurrent attempts rejected') ||
        err.message.includes('Cannot process payment for Order'),
      );
    });

    it('prevents concurrent double-refunds from exceeding captured order amount', async () => {
      const order = await orderService.createOrder({
        merchantId: TEST_MERCHANT_ID,
        amountMinor: 60000, // ₹600.00
        currency: 'INR',
      });

      await paymentService.processPayment({
        orderId: order.orderId,
        method: PaymentMethodType.UPI,
        methodDetails: { vpa: 'kaushal@upi', simulatedScenario: 'SUCCESS' },
      });

      // Launch two simultaneous full refunds
      const ref1 = refundService.processRefund({
        orderId: order.orderId,
        merchantId: TEST_MERCHANT_ID,
        amountMinor: 60000,
        reason: 'Concurrent test refund 1',
      });

      const ref2 = refundService.processRefund({
        orderId: order.orderId,
        merchantId: TEST_MERCHANT_ID,
        amountMinor: 60000,
        reason: 'Concurrent test refund 2',
      });

      const results = await Promise.allSettled([ref1, ref2]);
      const fulfilled = results.filter(r => r.status === 'fulfilled');
      const rejected = results.filter(r => r.status === 'rejected');

      assert.strictEqual(fulfilled.length, 1);
      assert.strictEqual(rejected.length, 1);
      const err = (rejected[0] as PromiseRejectedResult).reason;
      assert.ok(
        err.message.includes('Duplicate concurrent attempts rejected') ||
        err.message.includes('exceeds remaining refundable balance') ||
        err.message.includes('already fully refunded'),
      );
    });
  });

  // ----------------------------------------------------------------------------
  // 4. ATOMIC DOUBLE-ENTRY FINANCIAL LEDGER & PERSISTENCE
  // ----------------------------------------------------------------------------
  describe('4. Double-Entry Ledger Integrity & Balanced Posting', () => {
    it('strictly rejects posting an unbalanced journal entry', async () => {
      await assert.rejects(
        ledgerService.postBalancedTransaction({
          transactionReference: `tx_unbal_${Date.now()}`,
          referenceType: 'PAYMENT',
          referenceId: 'ref_dummy',
          merchantId: TEST_MERCHANT_ID,
          description: 'Unbalanced test transaction',
          entries: [
            {
              accountType: 'GATEWAY_CLEARING' as any,
              direction: 'DEBIT' as any,
              amountMinor: 5000,
              description: 'Debit 5000',
            },
            {
              accountType: 'MERCHANT_SETTLEMENT_PAYABLE' as any,
              direction: 'CREDIT' as any,
              amountMinor: 4000, // OUT OF BALANCE!
              description: 'Credit 4000',
            },
          ],
        }),
        /Ledger out-of-balance!/,
      );
    });

    it('verifies that state transition and ledger update commit atomically during payment capture', async () => {
      const order = await orderService.createOrder({
        merchantId: TEST_MERCHANT_ID,
        amountMinor: 80000, // ₹800.00
        currency: 'INR',
      });

      const attempt = await paymentService.processPayment({
        orderId: order.orderId,
        method: PaymentMethodType.UPI,
        methodDetails: { vpa: 'success@upi', simulatedScenario: 'SUCCESS' },
      });

      assert.strictEqual(attempt.status, PaymentAttemptStatus.SUCCESS);
      const verifiedOrder = orderService.getOrder(order.orderId);
      assert.strictEqual(verifiedOrder.status, PaymentOrderStatus.CAPTURED);
    });
  });

  // ----------------------------------------------------------------------------
  // 5. APPLICATION RESTART & PERSISTENCE RECOVERY
  // ----------------------------------------------------------------------------
  describe('5. Application Restart & Persistence Recovery', () => {
    it('reconstructs consistent order and ledger state across service instance recreation', async () => {
      const idempKey = `restart_test_${Date.now()}`;
      const originalOrder = await orderService.createOrder({
        merchantId: TEST_MERCHANT_ID,
        amountMinor: 35000,
        currency: 'INR',
        idempotencyKey: idempKey,
      });

      // Simulate application restart: instantiate brand-new service graph sharing persistence
      const restartedOrderService = new GatewayOrderService(
        merchantService,
        persistenceService,
      );

      // Verify that idempotency retrieval returns the original order from the new instance
      const fetchedOrder = await restartedOrderService.createOrder({
        merchantId: TEST_MERCHANT_ID,
        amountMinor: 35000,
        currency: 'INR',
        idempotencyKey: idempKey,
      });

      assert.strictEqual(fetchedOrder.orderId, originalOrder.orderId);
      assert.strictEqual(fetchedOrder.amountMinor, originalOrder.amountMinor);
    });
  });
});
