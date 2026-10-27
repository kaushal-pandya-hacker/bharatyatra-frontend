import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

export type SecurityEventSeverity = 'INFO' | 'WARN' | 'HIGH' | 'CRITICAL';

export enum SecurityEventType {
  AUTH_FAILURE = 'AUTH_FAILURE',
  AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  ACCESS_DENIED_IDOR = 'ACCESS_DENIED_IDOR',
  RATE_LIMIT_TRIGGERED = 'RATE_LIMIT_TRIGGERED',
  PRIVILEGE_CHANGE = 'PRIVILEGE_CHANGE',
  WEBHOOK_SIGNATURE_FAILURE = 'WEBHOOK_SIGNATURE_FAILURE',
  WEBHOOK_DUPLICATE_DELIVERY = 'WEBHOOK_DUPLICATE_DELIVERY',
  BOOKING_STATE_INVALID = 'BOOKING_STATE_INVALID',
  PRICE_MANIPULATION_ATTEMPT = 'PRICE_MANIPULATION_ATTEMPT',
  DB_CONNECTION_FAILURE = 'DB_CONNECTION_FAILURE',
  REDIS_FALLBACK_ACTIVATED = 'REDIS_FALLBACK_ACTIVATED',
  NEXI_TOOL_AUTH_DENIAL = 'NEXI_TOOL_AUTH_DENIAL',
  SECRET_VALIDATION_FAILURE = 'SECRET_VALIDATION_FAILURE',
  SUSPICIOUS_PAYMENT_ACTIVITY = 'SUSPICIOUS_PAYMENT_ACTIVITY',
}

export interface SecurityEventActor {
  userId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  role?: string | null;
}

export interface SecurityEventResource {
  entityType?: string | null;
  entityId?: string | null;
}

export interface SecurityEventPayload {
  eventType: SecurityEventType;
  severity: SecurityEventSeverity;
  message: string;
  correlationId?: string;
  actor?: SecurityEventActor;
  resource?: SecurityEventResource;
  metadata?: Record<string, any>;
}

export interface StructuredSecurityLog {
  timestamp: string;
  schemaVersion: '1.0';
  eventType: SecurityEventType;
  severity: SecurityEventSeverity;
  message: string;
  correlationId: string;
  actor: {
    userId: string;
    ip: string;
    userAgent: string;
    role: string;
  };
  resource: {
    entityType: string;
    entityId: string;
  };
  metadata: Record<string, any>;
}

export interface SecurityAlert {
  alertId: string;
  severity: SecurityEventSeverity;
  alertTitle: string;
  eventType: SecurityEventType;
  triggerCount: number;
  windowSeconds: number;
  firstObservedAt: string;
  lastObservedAt: string;
  cooldownExpiresAt: string;
  sampleCorrelationId: string;
  actorContext: string;
}

@Injectable()
export class SecurityMonitoringService {
  private readonly logger = new Logger('SecurityMonitoring');

  // In-memory sliding window for threat detection
  private readonly eventCounter = new Map<string, { count: number; firstSeen: number; lastSeen: number }>();
  private readonly activeAlerts = new Map<string, SecurityAlert>();
  private readonly alertHistory: SecurityAlert[] = [];
  private readonly maxAlertHistory = 100;

  // Configurable alert thresholds: [thresholdCount, windowSeconds, cooldownSeconds]
  private readonly alertRules: Record<SecurityEventType, { threshold: number; window: number; cooldown: number; severity: SecurityEventSeverity; title: string }> = {
    [SecurityEventType.AUTH_FAILURE]: { threshold: 5, window: 60, cooldown: 300, severity: 'HIGH', title: 'Suspicious Authentication Brute-Force Spike' },
    [SecurityEventType.AUTH_TOKEN_INVALID]: { threshold: 10, window: 60, cooldown: 300, severity: 'WARN', title: 'High Volume of Invalid Authentication Tokens' },
    [SecurityEventType.ACCESS_DENIED_IDOR]: { threshold: 3, window: 60, cooldown: 600, severity: 'HIGH', title: 'Repeated Cross-User / Cross-Agency Access Denials (IDOR/BOLA)' },
    [SecurityEventType.RATE_LIMIT_TRIGGERED]: { threshold: 20, window: 60, cooldown: 300, severity: 'WARN', title: 'High-Frequency Rate Limit Exceeded Spike' },
    [SecurityEventType.PRIVILEGE_CHANGE]: { threshold: 1, window: 10, cooldown: 300, severity: 'CRITICAL', title: 'Privileged Role or Administrative State Changed' },
    [SecurityEventType.WEBHOOK_SIGNATURE_FAILURE]: { threshold: 3, window: 120, cooldown: 600, severity: 'CRITICAL', title: 'Payment Webhook Signature Mismatches (Tampering Risk)' },
    [SecurityEventType.WEBHOOK_DUPLICATE_DELIVERY]: { threshold: 15, window: 60, cooldown: 300, severity: 'WARN', title: 'Payment Webhook Duplicate Delivery Retry Storm' },
    [SecurityEventType.BOOKING_STATE_INVALID]: { threshold: 2, window: 60, cooldown: 600, severity: 'HIGH', title: 'Illegal Booking State Machine Transition Attempt' },
    [SecurityEventType.PRICE_MANIPULATION_ATTEMPT]: { threshold: 1, window: 10, cooldown: 600, severity: 'CRITICAL', title: 'Financial Price Manipulation / Negative Amount Attempt' },
    [SecurityEventType.DB_CONNECTION_FAILURE]: { threshold: 3, window: 30, cooldown: 300, severity: 'CRITICAL', title: 'Database Pool Exhaustion / Connection Drops' },
    [SecurityEventType.REDIS_FALLBACK_ACTIVATED]: { threshold: 5, window: 60, cooldown: 300, severity: 'WARN', title: 'Redis Cache Outage: Local In-Memory Fallback Active' },
    [SecurityEventType.NEXI_TOOL_AUTH_DENIAL]: { threshold: 3, window: 60, cooldown: 600, severity: 'HIGH', title: 'NEXI AI Tool Authorization Denied Repeatedly' },
    [SecurityEventType.SECRET_VALIDATION_FAILURE]: { threshold: 1, window: 10, cooldown: 600, severity: 'CRITICAL', title: 'Missing or Placeholder Secret in Production Configuration' },
    [SecurityEventType.SUSPICIOUS_PAYMENT_ACTIVITY]: { threshold: 2, window: 60, cooldown: 600, severity: 'CRITICAL', title: 'Anomalous Payment or Refund Hijack Attempt' },
  };

  /**
   * Sanitizes strings to prevent CRLF Log Injection (log forgery attacks)
   */
  public sanitizeForLogging(input: string | undefined | null): string {
    if (!input) return '';
    return String(input)
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/[\u0000-\u001f\u007f-\u009f]/g, '')
      .trim();
  }

  /**
   * Deeply redacts secrets, credentials, tokens, and payment card numbers
   */
  public redactSensitiveData(obj: any): any {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
      let cleaned = obj;
      // Redact Bearer tokens
      cleaned = cleaned.replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer [REDACTED_TOKEN]');
      // Redact JWT tokens
      cleaned = cleaned.replace(/ey[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g, '[REDACTED_JWT]');
      // Redact credit cards (13-19 digits)
      cleaned = cleaned.replace(/\b(?:\d[ -]*?){13,19}\b/g, '[REDACTED_CARD]');
      // Redact secrets in key=value or key:value
      cleaned = cleaned.replace(/(password|secret|token|apikey|apiKey|cvv|private_key)["']?\s*[:=]\s*["']?[^"'\s,]+["']?/gi, '$1="[REDACTED]"');
      return this.sanitizeForLogging(cleaned);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.redactSensitiveData(item));
    }

    if (typeof obj === 'object') {
      const result: Record<string, any> = {};

      for (const [key, val] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes('secret') ||
          lowerKey.includes('password') ||
          lowerKey.includes('token') ||
          lowerKey.includes('key') ||
          lowerKey.includes('card') ||
          lowerKey.includes('cvv') ||
          lowerKey.includes('cvc') ||
          lowerKey.includes('jwt') ||
          lowerKey.includes('authorization') ||
          lowerKey.includes('signature')
        ) {
          result[key] = '[REDACTED]';
        } else {
          result[key] = this.redactSensitiveData(val);
        }
      }
      return result;
    }

    return obj;
  }

  /**
   * Emits a standardized, structured security audit event and evaluates real-time alert thresholds
   */
  public recordEvent(payload: SecurityEventPayload): StructuredSecurityLog {
    try {
      const timestamp = new Date().toISOString();
      const correlationId = this.sanitizeForLogging(
        payload.correlationId || `sec_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      );

      const actor: StructuredSecurityLog['actor'] = {
        userId: this.sanitizeForLogging(payload.actor?.userId || 'ANONYMOUS'),
        ip: this.sanitizeForLogging(payload.actor?.ip || 'UNKNOWN_IP'),
        userAgent: this.sanitizeForLogging(payload.actor?.userAgent ? payload.actor.userAgent.substring(0, 100) : 'UNKNOWN_UA'),
        role: this.sanitizeForLogging(payload.actor?.role || 'NONE'),
      };

      const resource: StructuredSecurityLog['resource'] = {
        entityType: this.sanitizeForLogging(payload.resource?.entityType || 'SYSTEM'),
        entityId: this.sanitizeForLogging(payload.resource?.entityId || 'N/A'),
      };

      const sanitizedMessage = this.sanitizeForLogging(this.redactSensitiveData(payload.message));
      const sanitizedMetadata = this.redactSensitiveData(payload.metadata || {});

      const structuredLog: StructuredSecurityLog = {
        timestamp,
        schemaVersion: '1.0',
        eventType: payload.eventType,
        severity: payload.severity,
        message: sanitizedMessage,
        correlationId,
        actor,
        resource,
        metadata: sanitizedMetadata,
      };

      // Emit structured JSON string to stdout for central log ingestion (Datadog, CloudWatch, Loki)
      const logLine = JSON.stringify(structuredLog);
      if (payload.severity === 'CRITICAL') {
        this.logger.error(`[SECURITY_EVENT] ${logLine}`);
      } else if (payload.severity === 'HIGH' || payload.severity === 'WARN') {
        this.logger.warn(`[SECURITY_EVENT] ${logLine}`);
      } else {
        this.logger.log(`[SECURITY_EVENT] ${logLine}`);
      }

      // Evaluate real-time alerting rule
      this.evaluateAlertThreshold(structuredLog);

      return structuredLog;
    } catch (err: any) {
      // Isolation guarantee: Monitoring failures must NEVER crash the main application
      this.logger.error(`Failed to record security event safely: ${err?.message}`);
      return {
        timestamp: new Date().toISOString(),
        schemaVersion: '1.0',
        eventType: payload.eventType,
        severity: payload.severity,
        message: 'Security event recorded with degraded metadata',
        correlationId: 'fallback_correlation_id',
        actor: { userId: 'ANONYMOUS', ip: 'UNKNOWN', userAgent: 'UNKNOWN', role: 'NONE' },
        resource: { entityType: 'SYSTEM', entityId: 'N/A' },
        metadata: {},
      };
    }
  }

  /**
   * Real-time sliding window alert threshold evaluator with alert cooldown deduplication
   */
  private evaluateAlertThreshold(log: StructuredSecurityLog): void {
    const rule = this.alertRules[log.eventType];
    if (!rule) return;

    const now = Date.now();
    const actorKey = log.actor.ip !== 'UNKNOWN_IP' ? log.actor.ip : log.actor.userId;
    const trackingKey = `${log.eventType}:${actorKey}`;

    // 1. Check if an active alert for this key is in cooldown
    const existingAlert = this.activeAlerts.get(trackingKey);
    if (existingAlert && new Date(existingAlert.cooldownExpiresAt).getTime() > now) {
      existingAlert.triggerCount++;
      existingAlert.lastObservedAt = log.timestamp;
      return; // Suppressed by cooldown deduplication to avoid alert storm
    }

    // 2. Sliding window counter update
    let entry = this.eventCounter.get(trackingKey);
    if (!entry || now - entry.firstSeen > rule.window * 1000) {
      entry = { count: 1, firstSeen: now, lastSeen: now };
    } else {
      entry.count++;
      entry.lastSeen = now;
    }
    this.eventCounter.set(trackingKey, entry);

    // 3. Trigger alert when threshold is reached
    if (entry.count >= rule.threshold) {
      const cooldownExpiresAt = new Date(now + rule.cooldown * 1000).toISOString();
      const alert: SecurityAlert = {
        alertId: `alert_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        severity: rule.severity,
        alertTitle: rule.title,
        eventType: log.eventType,
        triggerCount: entry.count,
        windowSeconds: rule.window,
        firstObservedAt: new Date(entry.firstSeen).toISOString(),
        lastObservedAt: log.timestamp,
        cooldownExpiresAt,
        sampleCorrelationId: log.correlationId,
        actorContext: `${log.actor.userId}@${log.actor.ip}`,
      };

      this.activeAlerts.set(trackingKey, alert);
      this.alertHistory.unshift(alert);
      if (this.alertHistory.length > this.maxAlertHistory) {
        this.alertHistory.pop();
      }

      // Safe alert dispatch: log to operational alerts stream (does not send real email/slack in dev/test)
      this.logger.error(
        `[SECURITY_ALERT_TRIGGERED] Severity: ${alert.severity} | Alert: ${alert.alertTitle} | Count: ${alert.triggerCount} in ${alert.windowSeconds}s | Actor: ${alert.actorContext} | Correlation: ${alert.sampleCorrelationId} | Cooldown Until: ${alert.cooldownExpiresAt}`,
      );

      // Reset counter
      this.eventCounter.delete(trackingKey);
    }
  }

  /**
   * Diagnostics: Returns recent alert history for monitoring checks & tests
   */
  public getAlertHistory(): SecurityAlert[] {
    return [...this.alertHistory];
  }

  /**
   * Diagnostics: Returns active alerts currently in cooldown
   */
  public getActiveAlerts(): SecurityAlert[] {
    return Array.from(this.activeAlerts.values());
  }

  /**
   * Resets alert history for testing
   */
  public resetForTesting(): void {
    this.eventCounter.clear();
    this.activeAlerts.clear();
    this.alertHistory.length = 0;
  }
}
