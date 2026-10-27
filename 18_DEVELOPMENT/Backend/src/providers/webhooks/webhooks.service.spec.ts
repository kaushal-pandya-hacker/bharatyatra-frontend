import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksService } from './webhooks.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

describe('WebhooksService - Razorpay Webhook Cryptographic Verification & Idempotency', () => {
  let service: WebhooksService;
  const originalEnv = process.env;
  const testSecret = 'secret_webhook_test_key_12345';

  beforeEach(async () => {
    process.env = { ...originalEnv, RAZORPAY_WEBHOOK_SECRET: testSecret, NODE_ENV: 'test' };

    const module: TestingModule = await Test.createTestingModule({
      providers: [WebhooksService],
    }).compile();

    service = module.get<WebhooksService>(WebhooksService);
    service.clearProcessedEventsForTesting();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  function generateSignature(payload: any | Buffer | string, secret: string): string {
    const data = Buffer.isBuffer(payload)
      ? payload
      : typeof payload === 'string'
        ? Buffer.from(payload, 'utf8')
        : Buffer.from(JSON.stringify(payload), 'utf8');
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }

  describe('1. Cryptographic HMAC-SHA256 Signature Verification', () => {
    it('successfully processes a valid webhook with matching raw body and HMAC signature', async () => {
      const payload = {
        event: 'payment.captured',
        id: 'evt_test_valid_001',
        payload: {
          payment: {
            entity: {
              id: 'pay_test_12345',
              order_id: 'order_test_67890',
              amount: 150000,
              currency: 'INR',
              status: 'captured',
            },
          },
        },
      };

      const rawBody = Buffer.from(JSON.stringify(payload), 'utf8');
      const signature = generateSignature(rawBody, testSecret);

      const result = await service.processWebhook(
        'razorpay',
        'payment.captured',
        payload,
        signature,
        rawBody,
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe('PROCESSED');
      expect(result.eventId).toBe('evt_test_valid_001');
      expect(result.paymentId).toBe('pay_test_12345');
      expect(result.orderId).toBe('order_test_67890');
      expect(result.amount).toBe(150000);
      expect(result.currency).toBe('INR');
    });

    it('rejects an invalid / forged cryptographic signature with UnauthorizedException', async () => {
      const payload = {
        event: 'payment.captured',
        id: 'evt_test_fraud_001',
        payload: { payment: { entity: { id: 'pay_test_fraud', amount: 5000 } } },
      };
      const rawBody = Buffer.from(JSON.stringify(payload), 'utf8');
      const invalidSignature = 'a'.repeat(64); // Invalid 64-char hex signature

      await expect(
        service.processWebhook('razorpay', 'payment.captured', payload, invalidSignature, rawBody),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects when payload is tampered after signature calculation (altered raw body)', async () => {
      const originalPayload = { id: 'evt_tamper_001', amount: 1000 };
      const rawBodyOriginal = Buffer.from(JSON.stringify(originalPayload), 'utf8');
      const signature = generateSignature(rawBodyOriginal, testSecret);

      // Malicious actor alters body to 99999
      const tamperedPayload = { id: 'evt_tamper_001', amount: 99999 };
      const tamperedRawBody = Buffer.from(JSON.stringify(tamperedPayload), 'utf8');

      await expect(
        service.processWebhook(
          'razorpay',
          'payment.captured',
          tamperedPayload,
          signature,
          tamperedRawBody,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects missing or empty signatures', async () => {
      const payload = { id: 'evt_empty_sig' };
      const rawBody = Buffer.from(JSON.stringify(payload), 'utf8');

      await expect(
        service.processWebhook('razorpay', 'payment.captured', payload, '', rawBody),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('2. Fail-Closed Production Secret Protection', () => {
    it('throws fatal Error in production if RAZORPAY_WEBHOOK_SECRET is missing or empty', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.RAZORPAY_WEBHOOK_SECRET;

      const payload = { id: 'evt_prod_missing' };
      const rawBody = Buffer.from(JSON.stringify(payload), 'utf8');

      await expect(
        service.processWebhook('razorpay', 'payment.captured', payload, 'sig_dummy', rawBody),
      ).rejects.toThrow(/CRITICAL: RAZORPAY_WEBHOOK_SECRET must be configured/);
    });

    it('throws fatal Error in production if RAZORPAY_WEBHOOK_SECRET is a placeholder', async () => {
      process.env.NODE_ENV = 'production';
      process.env.RAZORPAY_WEBHOOK_SECRET = 'placeholder_secret_for_razorpay';

      const payload = { id: 'evt_prod_placeholder' };
      const rawBody = Buffer.from(JSON.stringify(payload), 'utf8');

      await expect(
        service.processWebhook('razorpay', 'payment.captured', payload, 'sig_dummy', rawBody),
      ).rejects.toThrow(/CRITICAL: RAZORPAY_WEBHOOK_SECRET must be configured/);
    });
  });

  describe('3. Webhook Idempotency & Duplicate Delivery Suppression', () => {
    it('returns SKIPPED_DUPLICATE on second delivery of identical event without duplicate processing', async () => {
      const payload = {
        event: 'order.paid',
        id: 'evt_unique_order_1001',
        payload: {
          order: {
            entity: {
              id: 'order_1001',
              amount: 25000,
              currency: 'INR',
            },
          },
        },
      };

      const rawBody = Buffer.from(JSON.stringify(payload), 'utf8');
      const signature = generateSignature(rawBody, testSecret);

      // First delivery: PROCESSED
      const firstResult = await service.processWebhook(
        'razorpay',
        'order.paid',
        payload,
        signature,
        rawBody,
      );
      expect(firstResult.status).toBe('PROCESSED');

      // Second delivery: SKIPPED_DUPLICATE
      const secondResult = await service.processWebhook(
        'razorpay',
        'order.paid',
        payload,
        signature,
        rawBody,
      );
      expect(secondResult.status).toBe('SKIPPED_DUPLICATE');
      expect(secondResult.success).toBe(true);
      expect(secondResult.eventId).toBe('evt_unique_order_1001');
    });

    it('handles concurrent duplicate webhook processing safely', async () => {
      const payload = {
        event: 'payment.captured',
        id: 'evt_concurrent_test_999',
        payload: { payment: { entity: { id: 'pay_concurrent', amount: 5000 } } },
      };
      const rawBody = Buffer.from(JSON.stringify(payload), 'utf8');
      const signature = generateSignature(rawBody, testSecret);

      // Fire 5 identical concurrent deliveries
      const results = await Promise.all([
        service.processWebhook('razorpay', 'payment.captured', payload, signature, rawBody),
        service.processWebhook('razorpay', 'payment.captured', payload, signature, rawBody),
        service.processWebhook('razorpay', 'payment.captured', payload, signature, rawBody),
        service.processWebhook('razorpay', 'payment.captured', payload, signature, rawBody),
        service.processWebhook('razorpay', 'payment.captured', payload, signature, rawBody),
      ]);

      const processedCount = results.filter((r) => r.status === 'PROCESSED').length;
      const skippedCount = results.filter((r) => r.status === 'SKIPPED_DUPLICATE').length;

      expect(processedCount).toBe(1);
      expect(skippedCount).toBe(4);
    });
  });

  describe('4. Replay Attack Protection (Timestamp Header)', () => {
    it('accepts webhooks with timestamp within 300 seconds window', async () => {
      const payload = { id: 'evt_fresh_ts', amount: 1000 };
      const rawBody = Buffer.from(JSON.stringify(payload), 'utf8');
      const signature = generateSignature(rawBody, testSecret);
      const currentEpoch = Math.floor(Date.now() / 1000).toString();

      const result = await service.processWebhook(
        'razorpay',
        'payment.captured',
        payload,
        signature,
        rawBody,
        currentEpoch,
      );
      expect(result.status).toBe('PROCESSED');
    });

    it('rejects webhooks with expired timestamp (> 300s old)', async () => {
      const payload = { id: 'evt_stale_ts', amount: 1000 };
      const rawBody = Buffer.from(JSON.stringify(payload), 'utf8');
      const signature = generateSignature(rawBody, testSecret);
      const staleEpoch = (Math.floor(Date.now() / 1000) - 400).toString(); // 400 seconds ago

      await expect(
        service.processWebhook(
          'razorpay',
          'payment.captured',
          payload,
          signature,
          rawBody,
          staleEpoch,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('5. Payment Amount & Data Integrity', () => {
    it('rejects payment events with negative amount', async () => {
      const payload = {
        event: 'payment.captured',
        id: 'evt_negative_amt',
        payload: { payment: { entity: { id: 'pay_neg', amount: -500 } } },
      };
      const rawBody = Buffer.from(JSON.stringify(payload), 'utf8');
      const signature = generateSignature(rawBody, testSecret);

      await expect(
        service.processWebhook('razorpay', 'payment.captured', payload, signature, rawBody),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
