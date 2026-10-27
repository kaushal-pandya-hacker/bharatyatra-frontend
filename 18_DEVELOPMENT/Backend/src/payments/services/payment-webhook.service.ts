import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

export interface WebhookEventRecord {
  eventId: string;
  provider: string;
  eventType: string;
  processed: boolean;
  receivedAt: string;
}

@Injectable()
export class PaymentWebhookService {
  private readonly logger = new Logger(PaymentWebhookService.name);
  private readonly processedEventIds = new Set<string>();
  private readonly webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || 'chalo_farva_webhook_secret_key_2026';

  verifyAndNormalizeWebhook(provider: string, payload: any, signature: string, timestamp?: string): WebhookEventRecord {
    // 1. Signature Verification
    if (!signature || signature.trim().length === 0) {
      throw new UnauthorizedException('Missing webhook HMAC signature.');
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const secret = process.env.PAYMENT_WEBHOOK_SECRET || (isProduction ? undefined : 'chalo_farva_webhook_secret_key_2026');
    if (isProduction && (!secret || secret.includes('placeholder'))) {
      this.logger.error(`[FATAL] PAYMENT_WEBHOOK_SECRET is not configured in production.`);
      throw new Error('CRITICAL: PAYMENT_WEBHOOK_SECRET must be configured in production environment.');
    }

    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const expectedSignature = crypto
      .createHmac('sha256', secret || 'chalo_farva_webhook_secret_key_2026')
      .update(payloadString)
      .digest('hex');

    const signatureBuffer = Buffer.from(signature.trim(), 'utf8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

    const isValid =
      signatureBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

    if (!isValid) {
      throw new UnauthorizedException('Invalid payment gateway webhook signature.');
    }

    // 2. Timestamp Replay Defense (5 minute tolerance window)
    if (timestamp) {
      const eventTime = new Date(timestamp).getTime();
      const now = Date.now();
      if (Math.abs(now - eventTime) > 300000) {
        throw new BadRequestException('Webhook timestamp outside 5-minute replay tolerance window.');
      }
    }

    // 3. Deduplication Check
    const eventId = payload.eventId || payload.id || `evt_${crypto.createHash('md5').update(payloadString).digest('hex')}`;
    if (this.processedEventIds.has(eventId)) {
      this.logger.warn(`[PaymentWebhookService] Duplicate webhook event ignored (${eventId})`);
      return {
        eventId,
        provider,
        eventType: 'DUPLICATE_IGNORED',
        processed: false,
        receivedAt: new Date().toISOString(),
      };
    }

    this.processedEventIds.add(eventId);

    // 4. Normalize Event Type
    const rawEvent = (payload.event || payload.type || 'PAYMENT.CAPTURED').toUpperCase();
    let normalizedType = 'UNKNOWN_WEBHOOK';
    if (rawEvent.includes('CAPTURED') || rawEvent.includes('SUCCESS') || rawEvent.includes('PAYMENT.SUCCESS')) {
      normalizedType = 'PAYMENT_CAPTURED';
    } else if (rawEvent.includes('FAILED')) {
      normalizedType = 'PAYMENT_FAILED';
    } else if (rawEvent.includes('REFUND')) {
      normalizedType = 'REFUND_PROCESSED';
    } else {
      normalizedType = rawEvent;
    }

    this.logger.log(`[PaymentWebhookService] Processed valid webhook event '${normalizedType}' from provider ${provider} (EventId: ${eventId})`);

    return {
      eventId,
      provider,
      eventType: normalizedType,
      processed: true,
      receivedAt: new Date().toISOString(),
    };
  }
}
