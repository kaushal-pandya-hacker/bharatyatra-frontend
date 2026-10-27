import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs';
import * as path from 'path';
import {
  SecurityMonitoringService,
  SecurityEventType,
} from '../18_DEVELOPMENT/Backend/src/security/security-monitoring.service';

describe('Phase 7 Security Tests - Monitoring, Threat Detection, Redaction & Incident Signals', () => {
  const rootDir = path.resolve(__dirname, '..');
  const backendDir = path.join(rootDir, '18_DEVELOPMENT', 'Backend');

  describe('1. Security Event Taxonomy & Schema Conformity', () => {
    it('implements complete 14-event taxonomy covering auth, IDOR, webhooks, rate limits, and DB', () => {
      const expectedEvents = [
        'AUTH_FAILURE',
        'AUTH_TOKEN_INVALID',
        'ACCESS_DENIED_IDOR',
        'RATE_LIMIT_TRIGGERED',
        'PRIVILEGE_CHANGE',
        'WEBHOOK_SIGNATURE_FAILURE',
        'WEBHOOK_DUPLICATE_DELIVERY',
        'BOOKING_STATE_INVALID',
        'PRICE_MANIPULATION_ATTEMPT',
        'DB_CONNECTION_FAILURE',
        'REDIS_FALLBACK_ACTIVATED',
        'NEXI_TOOL_AUTH_DENIAL',
        'SECRET_VALIDATION_FAILURE',
        'SUSPICIOUS_PAYMENT_ACTIVITY',
      ];

      for (const eventName of expectedEvents) {
        assert.ok(
          (SecurityEventType as any)[eventName] === eventName,
          `SecurityEventType must define ${eventName}`,
        );
      }
    });

    it('generates structured audit logs with ISO timestamp, correlation ID, and sanitized actor metadata', () => {
      const service = new SecurityMonitoringService();
      const event = service.recordEvent({
        eventType: SecurityEventType.AUTH_FAILURE,
        severity: 'HIGH',
        message: 'Invalid credentials provided for user login',
        correlationId: 'test_corr_123',
        actor: {
          userId: 'usr_abc456',
          ip: '203.0.113.195',
          userAgent: 'Mozilla/5.0 Synthetic Test Agent',
          role: 'CUSTOMER',
        },
        resource: {
          entityType: 'AUTH_SESSION',
          entityId: 'sess_999',
        },
        metadata: {
          attemptCount: 3,
        },
      });

      assert.strictEqual(event.schemaVersion, '1.0');
      assert.strictEqual(event.eventType, SecurityEventType.AUTH_FAILURE);
      assert.strictEqual(event.severity, 'HIGH');
      assert.strictEqual(event.correlationId, 'test_corr_123');
      assert.strictEqual(event.actor.userId, 'usr_abc456');
      assert.strictEqual(event.actor.ip, '203.0.113.195');
      assert.strictEqual(event.resource.entityType, 'AUTH_SESSION');
      assert.strictEqual(event.resource.entityId, 'sess_999');
      assert.strictEqual(event.metadata.attemptCount, 3);
      assert.ok(new Date(event.timestamp).getTime() > 0, 'Timestamp must be valid ISO-8601');
    });
  });

  describe('2. Secret & Sensitive Data Redaction', () => {
    it('redacts Bearer tokens and JWTs from log strings and objects', () => {
      const service = new SecurityMonitoringService();
      const rawJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doNotLeakThisSignature';
      const rawMessage = `User failed auth with Authorization: Bearer ${rawJwt}`;

      const sanitized = service.redactSensitiveData(rawMessage);
      assert.ok(!sanitized.includes(rawJwt), 'Raw JWT must be redacted');
      assert.ok(sanitized.includes('[REDACTED_TOKEN]') || sanitized.includes('[REDACTED_JWT]'), 'Must contain redacted marker');
    });

    it('redacts payment card numbers (13-19 digits) from log payloads', () => {
      const service = new SecurityMonitoringService();
      const cardPayload = {
        cardNumber: '4111 2222 3333 4444',
        cvv: '123',
        holder: 'Test User',
      };

      const redacted = service.redactSensitiveData(cardPayload);
      assert.strictEqual(redacted.cardNumber, '[REDACTED]');
      assert.strictEqual(redacted.cvv, '[REDACTED]');
      assert.strictEqual(redacted.holder, 'Test User');
    });

    it('recursively redacts sensitive keys: password, secret, token, apiKey, signature', () => {
      const service = new SecurityMonitoringService();
      const complexObject = {
        user: 'kaushal@example.com',
        credentials: {
          password: 'SuperSecretPassword123!',
          api_key: 'sk_live_998877665544',
          webhook_secret: 'whsec_abcdef',
        },
        safeData: {
          destination: 'Goa',
          days: 5,
        },
      };

      const redacted = service.redactSensitiveData(complexObject);
      assert.strictEqual(redacted.credentials.password, '[REDACTED]');
      assert.strictEqual(redacted.credentials.api_key, '[REDACTED]');
      assert.strictEqual(redacted.credentials.webhook_secret, '[REDACTED]');
      assert.strictEqual(redacted.safeData.destination, 'Goa');
      assert.strictEqual(redacted.safeData.days, 5);
    });
  });

  describe('3. Log Injection Protection (CRLF Defense)', () => {
    it('strips CRLF control characters to prevent log forgery attacks', () => {
      const service = new SecurityMonitoringService();
      const maliciousInput = 'admin_login_success\r\n[SECURITY_EVENT] {"eventType":"PRIVILEGE_CHANGE","severity":"CRITICAL"}';
      const sanitized = service.sanitizeForLogging(maliciousInput);

      assert.ok(!sanitized.includes('\r'), 'Must strip carriage returns');
      assert.ok(!sanitized.includes('\n'), 'Must strip newlines');
      assert.ok(sanitized.includes('admin_login_success [SECURITY_EVENT]'));
    });
  });

  describe('4. Sliding-Window Threshold Evaluation & Alert Cooldown Deduplication', () => {
    it('triggers high-severity alert when threshold is reached within sliding window', () => {
      const service = new SecurityMonitoringService();
      service.resetForTesting();

      // Rule: AUTH_FAILURE threshold = 5 within 60s
      for (let i = 0; i < 4; i++) {
        service.recordEvent({
          eventType: SecurityEventType.AUTH_FAILURE,
          severity: 'HIGH',
          message: `Failed attempt ${i + 1}`,
          actor: { ip: '198.51.100.42' },
        });
      }

      assert.strictEqual(service.getAlertHistory().length, 0, 'No alert before threshold');

      // 5th attempt reaches threshold
      service.recordEvent({
        eventType: SecurityEventType.AUTH_FAILURE,
        severity: 'HIGH',
        message: 'Failed attempt 5',
        actor: { ip: '198.51.100.42' },
      });

      const alerts = service.getAlertHistory();
      assert.strictEqual(alerts.length, 1, 'Exactly 1 alert must be triggered upon reaching threshold');
      assert.strictEqual(alerts[0].eventType, SecurityEventType.AUTH_FAILURE);
      assert.strictEqual(alerts[0].severity, 'HIGH');
      assert.strictEqual(alerts[0].triggerCount, 5);
    });

    it('suppresses alert storms via cooldown deduplication', () => {
      const service = new SecurityMonitoringService();
      service.resetForTesting();

      // Trigger initial alert (threshold = 3 for ACCESS_DENIED_IDOR)
      for (let i = 0; i < 3; i++) {
        service.recordEvent({
          eventType: SecurityEventType.ACCESS_DENIED_IDOR,
          severity: 'HIGH',
          message: `IDOR denial ${i + 1}`,
          actor: { ip: '198.51.100.99' },
        });
      }

      assert.strictEqual(service.getAlertHistory().length, 1, 'Initial alert fired');

      // Subsequent 10 requests during cooldown must NOT fire new alerts
      for (let i = 0; i < 10; i++) {
        service.recordEvent({
          eventType: SecurityEventType.ACCESS_DENIED_IDOR,
          severity: 'HIGH',
          message: `IDOR denial flood ${i + 4}`,
          actor: { ip: '198.51.100.99' },
        });
      }

      assert.strictEqual(
        service.getAlertHistory().length,
        1,
        'Alert count must remain 1 due to active cooldown window',
      );

      const activeAlerts = service.getActiveAlerts();
      assert.ok(activeAlerts.length >= 1, 'Active alert should be present in cooldown registry');
      assert.ok(activeAlerts[0].triggerCount > 3, 'Trigger count should continue accumulating');
    });
  });

  describe('5. Health, Liveness, Readiness & Low-Cardinality Metrics', () => {
    it('verifies HealthController exposes liveness, readiness, and metrics endpoints', () => {
      const healthControllerPath = path.join(backendDir, 'src', 'health', 'health.controller.ts');
      assert.ok(fs.existsSync(healthControllerPath), 'HealthController file must exist');
      const content = fs.readFileSync(healthControllerPath, 'utf8');

      assert.ok(content.includes("@Get('liveness')"), 'Must define liveness probe');
      assert.ok(content.includes("@Get('readiness')"), 'Must define readiness probe');
      assert.ok(content.includes("@Get('metrics')"), 'Must define metrics endpoint');
    });

    it('verifies liveness probe is decoupled from external DB and Redis dependencies', () => {
      const healthControllerPath = path.join(backendDir, 'src', 'health', 'health.controller.ts');
      const content = fs.readFileSync(healthControllerPath, 'utf8');

      const livenessMethodMatch = content.match(/getLiveness\(\)\s*\{([^}]+)\}/);
      assert.ok(livenessMethodMatch, 'getLiveness method must exist');
      const livenessBody = livenessMethodMatch[1];

      assert.ok(!livenessBody.includes('await this.prisma'), 'Liveness must not block on database queries');
      assert.ok(!livenessBody.includes('await this.redis'), 'Liveness must not block on Redis queries');
      assert.ok(livenessBody.includes("status: 'UP'"), 'Liveness must return immediate process status');
    });

    it('verifies metrics endpoint uses only low-cardinality system telemetry without personal data', () => {
      const healthControllerPath = path.join(backendDir, 'src', 'health', 'health.controller.ts');
      const content = fs.readFileSync(healthControllerPath, 'utf8');

      assert.ok(content.includes('uptimeSeconds'), 'Must include process uptime');
      assert.ok(content.includes('memoryUsage'), 'Must include memory statistics');
      assert.ok(content.includes('cpuUsage'), 'Must include CPU statistics');
      assert.ok(!content.includes('email:'), 'Metrics must never expose customer emails');
      assert.ok(!content.includes('bookingId:'), 'Metrics must never expose individual booking IDs');
    });
  });

  describe('6. Monitoring Fault-Tolerance & Exception Filter Integration', () => {
    it('SecurityMonitoringService handles malformed payloads gracefully without throwing', () => {
      const service = new SecurityMonitoringService();
      
      // Pass circular structure to simulate extreme edge-case
      const circular: any = {};
      circular.self = circular;

      assert.doesNotThrow(() => {
        service.recordEvent({
          eventType: SecurityEventType.DB_CONNECTION_FAILURE,
          severity: 'CRITICAL',
          message: 'Database dropped connection',
          metadata: circular,
        });
      }, 'Monitoring failure must NEVER throw an unhandled exception');
    });

    it('SecurityExceptionFilter integrates SecurityMonitoringService and sanitizes public error responses', () => {
      const filterPath = path.join(backendDir, 'src', 'security', 'security-exception.filter.ts');
      assert.ok(fs.existsSync(filterPath), 'SecurityExceptionFilter must exist');
      const content = fs.readFileSync(filterPath, 'utf8');

      assert.ok(content.includes('SecurityMonitoringService'), 'Filter must reference SecurityMonitoringService');
      assert.ok(content.includes('recordEvent'), 'Filter must record security events');
      assert.ok(content.includes('AUTH_FAILURE'), 'Filter must record auth failures');
      assert.ok(content.includes('ACCESS_DENIED_IDOR'), 'Filter must record forbidden IDOR access');
      assert.ok(content.includes('RATE_LIMIT_TRIGGERED'), 'Filter must record rate-limit breaches');
      assert.ok(content.includes('sanitizedResponse'), 'Filter must sanitize client response body');
    });
  });
});
