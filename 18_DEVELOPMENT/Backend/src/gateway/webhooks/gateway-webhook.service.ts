import { Injectable, Logger, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';

export interface WebhookEndpoint {
  id: string;
  merchantId: string;
  url: string;
  secret: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
}

export type WebhookDeliveryStatus = 'PENDING' | 'QUEUED' | 'DELIVERED' | 'RETRYING' | 'PERMANENTLY_FAILED' | 'SIMULATED_DELIVERY';

export interface WebhookDeliveryEvent {
  deliveryId: string; // Unique per delivery attempt
  eventId: string;    // Stable across retries for the same underlying event
  merchantId: string;
  endpointId: string;
  url: string;
  eventType: string;
  payload: any;
  signatureHeader: string;
  status: WebhookDeliveryStatus;
  attempts: number;
  maxAttempts: number;
  statusCode?: number;
  lastError?: string;
  errorCategory?: 'RETRYABLE' | 'PERMANENT' | 'TIMEOUT' | 'NONE';
  nextRetryAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

@Injectable()
export class GatewayWebhookService {
  private readonly logger = new Logger(GatewayWebhookService.name);
  private readonly endpoints = new Map<string, WebhookEndpoint[]>();
  private readonly deliveries = new Map<string, WebhookDeliveryEvent>(); // deliveryId -> record
  private readonly eventDeliveryIndex = new Map<string, string>(); // `${endpointId}:${eventId}` -> deliveryId

  registerEndpoint(merchantId: string, url: string, events: string[] = ['*']): WebhookEndpoint {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new BadRequestException('Webhook URL must start with http:// or https://');
    }

    const endpointId = `whk_${crypto.randomBytes(8).toString('hex')}`;
    const secret = `whsec_${crypto.randomBytes(24).toString('hex')}`;
    const endpoint: WebhookEndpoint = {
      id: endpointId,
      merchantId,
      url,
      secret,
      events,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const existing = this.endpoints.get(merchantId) || [];
    existing.push(endpoint);
    this.endpoints.set(merchantId, existing);

    this.logger.log(`[WEBHOOK] Registered endpoint ${endpointId} for Merchant ${merchantId} at ${url}`);
    return endpoint;
  }

  getEndpoints(merchantId: string): WebhookEndpoint[] {
    return this.endpoints.get(merchantId) || [];
  }

  /**
   * Dispatch a signed webhook event to all subscribed endpoints for a merchant
   * Idempotent per eventId: duplicate calls reuse existing event ID and prevent dual delivery
   */
  async dispatchEvent(
    merchantId: string,
    eventType: string,
    eventData: any,
    stableEventId?: string,
    simulatedFailureScenario?: 'NONE' | 'RETRYABLE_503' | 'PERMANENT_404' | 'TIMEOUT',
  ): Promise<WebhookDeliveryEvent[]> {
    const endpoints = this.getEndpoints(merchantId).filter(ep => ep.isActive);
    const deliveries: WebhookDeliveryEvent[] = [];

    const eventId = stableEventId || `evt_${crypto.randomBytes(12).toString('hex')}`;
    const payload = {
      id: eventId,
      event: eventType,
      data: eventData,
      createdAt: new Date().toISOString(),
    };

    for (const ep of endpoints) {
      if (ep.events.includes('*') || ep.events.includes(eventType)) {
        const idempotencyKey = `${ep.id}:${eventId}`;
        const existingDeliveryId = this.eventDeliveryIndex.get(idempotencyKey);

        if (existingDeliveryId) {
          const existing = this.deliveries.get(existingDeliveryId);
          if (existing) {
            this.logger.warn(`[WEBHOOK] Idempotent dispatch skipped duplicate for Event ${eventId}`);
            deliveries.push(existing);
            continue;
          }
        }

        const timestamp = Math.floor(Date.now() / 1000);
        const signatureHeader = this.generateSignatureHeader(payload, ep.secret, timestamp);
        const deliveryId = `deliv_${crypto.randomBytes(8).toString('hex')}`;

        // Determine outcome based on simulation scenario
        const scenario = simulatedFailureScenario || 'NONE';
        let status: WebhookDeliveryStatus = 'SIMULATED_DELIVERY';
        let statusCode = 200;
        let lastError: string | undefined;
        let errorCategory: 'RETRYABLE' | 'PERMANENT' | 'TIMEOUT' | 'NONE' = 'NONE';
        let nextRetryAt: string | undefined;

        if (scenario === 'RETRYABLE_503') {
          status = 'RETRYING';
          statusCode = 503;
          lastError = 'Service Unavailable (Upstream Switch Busy)';
          errorCategory = 'RETRYABLE';
          nextRetryAt = new Date(Date.now() + 5000).toISOString(); // Backoff: 5s
        } else if (scenario === 'PERMANENT_404') {
          status = 'PERMANENTLY_FAILED';
          statusCode = 404;
          lastError = 'Endpoint Not Found (HTTP 404 Permanent)';
          errorCategory = 'PERMANENT';
        } else if (scenario === 'TIMEOUT') {
          status = 'RETRYING';
          statusCode = 504;
          lastError = 'Gateway Request Timeout (5000ms exceeded)';
          errorCategory = 'TIMEOUT';
          nextRetryAt = new Date(Date.now() + 10000).toISOString();
        }

        const delivery: WebhookDeliveryEvent = {
          deliveryId,
          eventId,
          merchantId,
          endpointId: ep.id,
          url: ep.url,
          eventType,
          payload,
          signatureHeader,
          status,
          attempts: 1,
          maxAttempts: 5,
          statusCode,
          lastError,
          errorCategory,
          nextRetryAt,
          deliveredAt: (status as WebhookDeliveryStatus) === 'SIMULATED_DELIVERY' || (status as WebhookDeliveryStatus) === 'DELIVERED' ? new Date().toISOString() : undefined,
          createdAt: new Date().toISOString(),
        };

        this.deliveries.set(deliveryId, delivery);
        this.eventDeliveryIndex.set(idempotencyKey, deliveryId);
        deliveries.push(delivery);

        this.logger.log(
          `[WEBHOOK] Event ${eventType} (${eventId}) to ${ep.url} -> Status: ${status} (${statusCode})`,
        );
      }
    }

    return deliveries;
  }

  /**
   * Controlled Redelivery / Retry of a failed webhook
   * Reuses the identical stable eventId and does NOT duplicate underlying financial operations.
   */
  async retryDelivery(deliveryId: string, merchantId?: string, simulateSuccess = true): Promise<WebhookDeliveryEvent> {
    const delivery = this.deliveries.get(deliveryId);
    if (!delivery) {
      throw new NotFoundException(`Webhook delivery ${deliveryId} not found.`);
    }

    if (merchantId && delivery.merchantId !== merchantId) {
      throw new UnauthorizedException('Unauthorized access to webhook delivery record.');
    }

    if (delivery.attempts >= delivery.maxAttempts) {
      delivery.status = 'PERMANENTLY_FAILED';
      delivery.lastError = `Max retry attempts (${delivery.maxAttempts}) exhausted.`;
      delivery.errorCategory = 'PERMANENT';
      delivery.nextRetryAt = undefined;
      return delivery;
    }

    delivery.attempts += 1;

    if (simulateSuccess) {
      delivery.status = 'SIMULATED_DELIVERY';
      delivery.statusCode = 200;
      delivery.lastError = undefined;
      delivery.errorCategory = 'NONE';
      delivery.nextRetryAt = undefined;
      delivery.deliveredAt = new Date().toISOString();
      this.logger.log(`[WEBHOOK REDELIVERY] Successfully retried delivery ${deliveryId} (Attempt ${delivery.attempts})`);
    } else {
      delivery.status = delivery.attempts >= delivery.maxAttempts ? 'PERMANENTLY_FAILED' : 'RETRYING';
      delivery.statusCode = 503;
      delivery.lastError = 'Retry attempt failed again.';
      delivery.nextRetryAt = delivery.status === 'RETRYING' ? new Date(Date.now() + 15000).toISOString() : undefined;
    }

    return delivery;
  }

  /**
   * Generates standard signed signature header: t=1729...,v1=hex_hmac
   */
  generateSignatureHeader(payload: any, secret: string, timestamp: number): string {
    const serialized = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const signaturePayload = `${timestamp}.${serialized}`;
    const hmac = crypto.createHmac('sha256', secret).update(signaturePayload).digest('hex');
    return `t=${timestamp},v1=${hmac}`;
  }

  /**
   * Replay-Protected Webhook Verification Algorithm
   */
  verifyWebhookSignature(
    rawPayload: string | object,
    signatureHeader: string,
    secret: string,
    toleranceSeconds: number = 300,
  ): boolean {
    if (!signatureHeader || !secret) {
      throw new UnauthorizedException('Missing signature header or secret.');
    }

    const parts = signatureHeader.split(',');
    let timestampStr = '';
    let expectedSignature = '';

    for (const part of parts) {
      const [key, value] = part.trim().split('=');
      if (key === 't') timestampStr = value;
      if (key === 'v1') expectedSignature = value;
    }

    if (!timestampStr || !expectedSignature) {
      throw new UnauthorizedException('Malformed webhook signature header format. Expected t=...,v1=...');
    }

    const timestamp = parseInt(timestampStr, 10);
    const now = Math.floor(Date.now() / 1000);

    // Replay attack defense
    if (Math.abs(now - timestamp) > toleranceSeconds) {
      this.logger.warn(
        `[WEBHOOK SECURITY] Rejected webhook signature: Timestamp drift ${Math.abs(now - timestamp)}s exceeds tolerance of ${toleranceSeconds}s.`,
      );
      throw new UnauthorizedException(
        `Webhook timestamp drift exceeds tolerance window of ${toleranceSeconds} seconds (Replay Defense).`,
      );
    }

    const serialized = typeof rawPayload === 'string' ? rawPayload : JSON.stringify(rawPayload);
    const signaturePayload = `${timestamp}.${serialized}`;
    const computedSignature = crypto.createHmac('sha256', secret).update(signaturePayload).digest('hex');

    const computedBuf = Buffer.from(computedSignature, 'utf8');
    const expectedBuf = Buffer.from(expectedSignature, 'utf8');

    if (computedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(computedBuf, expectedBuf)) {
      throw new UnauthorizedException('Invalid webhook signature. HMAC verification failed.');
    }

    return true;
  }

  getDeliveryHistory(merchantId?: string): WebhookDeliveryEvent[] {
    const list = Array.from(this.deliveries.values());
    if (merchantId) {
      return list.filter(d => d.merchantId === merchantId);
    }
    return list;
  }

  getDeliveries(merchantId?: string): WebhookDeliveryEvent[] {
    return this.getDeliveryHistory(merchantId);
  }
}
