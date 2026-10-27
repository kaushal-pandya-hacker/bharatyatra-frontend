import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

export interface AuditEventRecord {
  id: string;
  actorId: string;
  actorRole: string;
  merchantId?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  sanitizedMetadata: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

@Injectable()
export class GatewayAuditService {
  private readonly logger = new Logger(GatewayAuditService.name);
  private readonly events: AuditEventRecord[] = [];

  logEvent(params: {
    actorId: string;
    actorRole: string;
    merchantId?: string;
    action: string;
    resourceType: string;
    resourceId: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
  }): AuditEventRecord {
    const eventId = `aud_${crypto.randomBytes(8).toString('hex')}`;
    const sanitizedMetadata = this.redactSensitiveData(params.metadata || {});

    const record: AuditEventRecord = {
      id: eventId,
      actorId: params.actorId,
      actorRole: params.actorRole,
      merchantId: params.merchantId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      sanitizedMetadata,
      ipAddress: params.ipAddress,
      createdAt: new Date().toISOString(),
    };

    this.events.push(record);
    this.logger.log(`[AUDIT] ${params.action} on ${params.resourceType}:${params.resourceId} by ${params.actorId}`);

    return record;
  }

  getEvents(merchantId?: string): AuditEventRecord[] {
    if (merchantId) {
      return this.events.filter(e => !e.merchantId || e.merchantId === merchantId);
    }
    return this.events;
  }

  /**
   * Recursive data redactor protecting PANs, CVVs, and API secrets
   */
  private redactSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const credentialKeys = ['secret', 'password', 'key', 'token', 'cvv', 'pin'];
    const result: Record<string, any> = Array.isArray(data) ? [] : {};

    for (const [k, v] of Object.entries(data)) {
      const lowerKey = k.toLowerCase();

      if (typeof v === 'string' && /^\d{13,19}$/.test(v.replace(/[\s-]/g, ''))) {
        // Redact potential 13-19 digit card numbers preserving last 4
        const clean = v.replace(/[\s-]/g, '');
        result[k] = `****-****-****-${clean.slice(-4)}`;
      } else if (credentialKeys.some(sk => lowerKey.includes(sk))) {
        result[k] = '[REDACTED_PCI_SECRET]';
      } else if (typeof v === 'object' && v !== null) {
        result[k] = this.redactSensitiveData(v);
      } else {
        result[k] = v;
      }
    }

    return result;
  }
}
