import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GatewayClient } from '../lib/gateway/gateway-client';

describe('BharatGateway™ Phase 3: Merchant Dashboard & Customer Checkout Integration', () => {
  it('1. Order creation enforces integer paise minor units and returns valid order record', async () => {
    const order = await GatewayClient.createOrder({
      amountRupees: 1999,
      description: 'Somnath Temple VIP Darshan Pass',
      customerEmail: 'dev.tester@bharatyatra.in',
    });

    assert.ok(order.orderId.startsWith('order_bg_'), 'Order ID must have order_bg_ prefix');
    assert.equal(order.amountMinor, 199900, '1999 INR must equal 199900 paise');
    assert.equal(order.currency, 'INR');
    assert.equal(order.status, 'CREATED');
    assert.equal(order.amountRefundedMinor, 0);
  });

  it('2. Customer checkout executes payment and transitions status to CAPTURED', async () => {
    const order = await GatewayClient.createOrder({
      amountRupees: 850,
      description: 'Dwarka Coastal Ferry Transit',
      customerEmail: 'pilgrim@gmail.com',
    });

    const paymentResult = await GatewayClient.processSimulatedPayment({
      orderId: order.orderId,
      method: 'UPI',
      scenario: 'SUCCESS',
      methodDetails: { vpa: 'pilgrim@okaxis' },
    });

    assert.equal(paymentResult.success, true);
    assert.equal(paymentResult.attempt.status, 'SUCCESS');
    assert.ok(paymentResult.attempt.signature, 'Must return authentic HMAC signature');

    const updatedOrder = GatewayClient.getOrder(order.orderId);
    assert.equal(updatedOrder?.status, 'CAPTURED', 'Order must be updated to CAPTURED state');
  });

  it('3. Checkout handles failure scenarios safely without marking order CAPTURED', async () => {
    const order = await GatewayClient.createOrder({
      amountRupees: 1200,
      description: 'Kutch Handicraft Workshop',
    });

    const result = await GatewayClient.processSimulatedPayment({
      orderId: order.orderId,
      method: 'CARD',
      scenario: 'INSUFFICIENT_FUNDS',
      methodDetails: { cardLast4: '4242' },
    });

    assert.equal(result.success, false);
    assert.equal(result.attempt.status, 'FAILED');
    assert.equal(result.attempt.errorCode, 'ERR_INSUFFICIENT_FUNDS');

    const failedOrder = GatewayClient.getOrder(order.orderId);
    assert.equal(failedOrder?.status, 'FAILED', 'Order status must remain FAILED, not CAPTURED');
  });

  it('4. Merchant dashboard processes partial refund with double-entry ledger update', async () => {
    const order = await GatewayClient.createOrder({
      amountRupees: 3000,
      description: 'Rann Resort Tent Suite',
    });

    await GatewayClient.processSimulatedPayment({
      orderId: order.orderId,
      method: 'NETBANKING',
      scenario: 'SUCCESS',
      methodDetails: { bankCode: 'HDFC' },
    });

    // Partial refund of ₹1000
    const refund = await GatewayClient.createRefund(order.orderId, 1000, 'Customer requested downgrade');

    assert.ok(refund.refundId.startsWith('ref_bg_'));
    assert.equal(refund.amountMinor, 100000, 'Refund of ₹1000 must be 100000 minor units');

    const refundedOrder = GatewayClient.getOrder(order.orderId);
    assert.equal(refundedOrder?.status, 'PARTIALLY_REFUNDED');
    assert.equal(refundedOrder?.amountRefundedMinor, 100000);

    // Verify ledger has entries
    const ledger = GatewayClient.getLedger();
    const reversal = ledger.find(e => e.transactionReference === `tx_ref_${refund.refundId}`);
    assert.ok(reversal, 'Compensating ledger reversal must be posted');
    assert.equal(reversal.direction, 'DEBIT');
  });

  it('5. Full refund transitions order to REFUNDED and rejects further refunds', async () => {
    const order = await GatewayClient.createOrder({
      amountRupees: 500,
      description: 'Heritage Guided Walk Pass',
    });

    await GatewayClient.processSimulatedPayment({
      orderId: order.orderId,
      method: 'UPI',
      scenario: 'SUCCESS',
    });

    // Full refund
    await GatewayClient.createRefund(order.orderId);

    const finalizedOrder = GatewayClient.getOrder(order.orderId);
    assert.equal(finalizedOrder?.status, 'REFUNDED');
    assert.equal(finalizedOrder?.amountRefundedMinor, 50000);

    // Attempting additional refund must be rejected
    await assert.rejects(
      async () => {
        await GatewayClient.createRefund(order.orderId, 100);
      },
      /Invalid refund amount|exceeds/,
    );
  });

  it('6. Reconciliation batch verifies balanced orders and reports zero discrepancies', async () => {
    const recon = await GatewayClient.runReconciliation();
    assert.ok(recon.batchId.startsWith('rec_batch_'));
    assert.equal(recon.status, 'MATCHED');
    assert.equal(recon.discrepancyCount, 0);
  });

  it('7. Sensitive credentials protection: Secret key is never returned in client credentials list', async () => {
    const creds = await GatewayClient.fetchCredentials();
    assert.ok(creds.length > 0);
    for (const cred of creds) {
      assert.ok(cred.publishableKey.startsWith('pk_test_'));
      assert.ok(cred.secretKeyPrefix);
      assert.equal((cred as any).secretKeyPlaintext, undefined, 'Plaintext secret key must never be exposed');
    }
  });
});
