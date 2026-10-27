import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
  Optional,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { SecurityMonitoringService, SecurityEventType } from '../../security/security-monitoring.service';

export interface WebhookProcessResult {
  success: boolean;
  status: 'PROCESSED' | 'SKIPPED_DUPLICATE';
  provider: string;
  event: string;
  eventId: string;
  paymentId?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  processedAt: string;
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  private processedEventIds: Set<string> = new Set();
  private readonly maxStoredEvents = 10000;

  constructor(
    @Optional() private readonly monitoringService?: SecurityMonitoringService,
  ) {}

  /**
   * Cryptographically verifies and processes inbound provider webhooks.
   * Enforces HMAC-SHA256 signature integrity, replay protection, and idempotency.
   */
  async processWebhook(
    provider: string,
    event: string,
    payload: any,
    signature: string,
    rawBody?: Buffer | string,
    timestampHeader?: string,
  ): Promise<WebhookProcessResult> {
    const isProduction = process.env.NODE_ENV === 'production';
    const isTest = process.env.NODE_ENV === 'test';

    // 1. Resolve and Validate Webhook Signing Secret
    const webhookSecret = this.resolveWebhookSecret(provider, isProduction, isTest);

    // 2. Cryptographic Signature Verification (HMAC-SHA256 with Constant-Time Comparison)
    this.verifyHmacSignature(provider, signature, rawBody, payload, webhookSecret);

    // 3. Replay Protection: Validate Timestamp Header (within 5 minutes)
    if (timestampHeader) {
      const eventTime = Number(timestampHeader);
      const currentTime = Math.floor(Date.now() / 1000);
      if (isNaN(eventTime) || Math.abs(currentTime - eventTime) > 300) {
        this.logger.warn(`[WEBHOOK REJECTED] Replay attack detected. Timestamp expired for provider ${provider}`);
        throw new UnauthorizedException('Webhook timestamp expired (Replay protection triggered).');
      }
    }

    // 4. Derive Unique Event Identifier for Idempotency
    const eventId = this.extractEventId(provider, event, payload, rawBody);

    // 5. Idempotency Check: Prevent Duplicate Event Processing
    if (this.processedEventIds.has(eventId)) {
      this.logger.log(`[WEBHOOK IDEMPOTENT] Event '${eventId}' already processed cleanly. Skipping duplicate execution.`);
      if (this.monitoringService) {
        try {
          this.monitoringService.recordEvent({
            eventType: SecurityEventType.WEBHOOK_DUPLICATE_DELIVERY,
            severity: 'WARN',
            message: `Duplicate webhook delivery detected for event ${eventId}`,
            resource: { entityType: 'PAYMENT_WEBHOOK', entityId: eventId },
            metadata: { provider, event },
          });
        } catch {}
      }
      return {
        success: true,
        status: 'SKIPPED_DUPLICATE',
        provider,
        event,
        eventId,
        processedAt: new Date().toISOString(),
      };
    }

    // 6. Payment Integrity & Entity Extraction
    const entity =
      payload.payload?.payment?.entity ||
      payload.payload?.order?.entity ||
      payload.entity ||
      payload;

    const paymentId = entity?.id || payload.payment_id;
    const orderId = entity?.order_id || payload.order_id;
    const amount = entity?.amount !== undefined ? Number(entity.amount) : undefined;
    const currency = entity?.currency || 'INR';

    // Validate that financial events contain non-negative amounts
    if (event.includes('payment') || event.includes('order')) {
      if (amount !== undefined && (isNaN(amount) || amount < 0)) {
        if (this.monitoringService) {
          try {
            this.monitoringService.recordEvent({
              eventType: SecurityEventType.PRICE_MANIPULATION_ATTEMPT,
              severity: 'CRITICAL',
              message: `Negative or invalid payment amount (${amount}) detected in webhook`,
              resource: { entityType: 'PAYMENT_WEBHOOK', entityId: eventId },
              metadata: { provider, event, amount },
            });
          } catch {}
        }
        throw new BadRequestException('Invalid payment amount specified in webhook payload.');
      }
    }

    // Mark event ID processed (bounded cache)
    if (this.processedEventIds.size >= this.maxStoredEvents) {
      const firstEntry = this.processedEventIds.values().next().value;
      if (firstEntry) this.processedEventIds.delete(firstEntry);
    }
    this.processedEventIds.add(eventId);

    // Safe audit logging (never logs secret or full payload tokens)
    const maskedOrderId = orderId ? `${orderId.substring(0, 8)}***` : 'N/A';
    this.logger.log(
      `[WEBHOOK VERIFIED] Provider '${provider}' event '${event}' (ID: ${eventId}, Order: ${maskedOrderId}) verified and processed safely.`,
    );

    return {
      success: true,
      status: 'PROCESSED',
      provider,
      event,
      eventId,
      paymentId,
      orderId,
      amount,
      currency,
      processedAt: new Date().toISOString(),
    };
  }

  private resolveWebhookSecret(provider: string, isProduction: boolean, isTest: boolean): string {
    const configuredSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (isProduction) {
      if (
        !configuredSecret ||
        configuredSecret.trim().length === 0 ||
        configuredSecret.includes('placeholder')
      ) {
        this.logger.error(
          `[FATAL] Webhook secret for '${provider}' is not configured in production. Refusing to process unverified webhooks.`,
        );
        throw new Error(`CRITICAL: RAZORPAY_WEBHOOK_SECRET must be configured in production environment.`);
      }
      return configuredSecret;
    }

    // Test environment fallback
    return configuredSecret || (isTest ? 'test_isolated_webhook_secret_key' : 'dev_webhook_secret_fallback');
  }

  private verifyHmacSignature(
    provider: string,
    signature: string,
    rawBody: Buffer | string | undefined,
    payload: any,
    secret: string,
  ): void {
    if (!signature || typeof signature !== 'string') {
      throw new UnauthorizedException('Missing or invalid webhook signature.');
    }

    // Convert rawBody to Buffer for bit-exact HMAC computation
    let bodyBuffer: Buffer;
    if (Buffer.isBuffer(rawBody)) {
      bodyBuffer = rawBody;
    } else if (typeof rawBody === 'string') {
      bodyBuffer = Buffer.from(rawBody, 'utf8');
    } else {
      bodyBuffer = Buffer.from(JSON.stringify(payload), 'utf8');
    }

    const expectedSignature = crypto.createHmac('sha256', secret).update(bodyBuffer).digest('hex');

    const signatureBuffer = Buffer.from(signature.trim(), 'utf8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

    // Constant-time comparison to prevent timing side-channel attacks
    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      this.logger.warn(`[WEBHOOK REJECTED] Cryptographic signature mismatch for provider '${provider}'.`);
      if (this.monitoringService) {
        try {
          this.monitoringService.recordEvent({
            eventType: SecurityEventType.WEBHOOK_SIGNATURE_FAILURE,
            severity: 'CRITICAL',
            message: `Cryptographic signature mismatch for provider '${provider}'`,
            resource: { entityType: 'PAYMENT_WEBHOOK', entityId: provider },
          });
        } catch {}
      }
      throw new UnauthorizedException('Invalid cryptographic webhook signature.');
    }
  }

  private extractEventId(provider: string, event: string, payload: any, rawBody?: Buffer | string): string {
    if (payload.event_id && typeof payload.event_id === 'string') return payload.event_id;
    if (payload.id && typeof payload.id === 'string') return payload.id;
    if (payload.payload?.payment?.entity?.id) {
      return `${event}_${payload.payload.payment.entity.id}`;
    }

    // Deterministic hash fallback from rawBody
    const bodyStr = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody || JSON.stringify(payload));
    const digest = crypto.createHash('sha256').update(bodyStr).digest('hex').substring(0, 16);
    return `evt_${provider}_${digest}`;
  }

  public clearProcessedEventsForTesting(): void {
    this.processedEventIds.clear();
  }
}
