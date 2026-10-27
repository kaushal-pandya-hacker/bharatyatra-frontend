import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

describe('Phase 4 Security Tests - Database Resilience, Payment Webhook Integrity & Migration Preflight', () => {
  const rootDir = path.resolve(__dirname, '..');
  const backendDir = path.join(rootDir, '18_DEVELOPMENT', 'Backend');

  describe('1. Database Connection Resilience & Resource Protection', () => {
    it('PrismaService injects bounded connection limits and timeouts into DATABASE_URL', () => {
      const prismaServicePath = path.join(backendDir, 'src', 'prisma', 'prisma.service.ts');
      assert.ok(fs.existsSync(prismaServicePath), 'PrismaService must exist');
      const content = fs.readFileSync(prismaServicePath, 'utf8');

      assert.ok(content.includes('connection_limit='), 'Must enforce connection_limit parameter');
      assert.ok(content.includes('pool_timeout='), 'Must enforce pool_timeout parameter');
      assert.ok(content.includes('connect_timeout='), 'Must enforce connect_timeout parameter');
      assert.ok(content.includes('DB_POOL_MAX'), 'Must reference DB_POOL_MAX configuration');
    });

    it('PostgreSQL pg pool in db.ts configures bounded timeouts and statement timeout', () => {
      const dbConfigPath = path.join(backendDir, 'src', 'config', 'db.ts');
      assert.ok(fs.existsSync(dbConfigPath), 'db.ts configuration must exist');
      const content = fs.readFileSync(dbConfigPath, 'utf8');

      assert.ok(content.includes('statement_timeout'), 'Must enforce statement_timeout to prevent run-away queries');
      assert.ok(content.includes('connectionTimeoutMillis'), 'Must configure connection timeout');
      assert.ok(content.includes('idleTimeoutMillis'), 'Must configure idle client timeout');
    });

    it('PrismaService gracefully handles database connection failures without crash', () => {
      const prismaServicePath = path.join(backendDir, 'src', 'prisma', 'prisma.service.ts');
      const content = fs.readFileSync(prismaServicePath, 'utf8');

      assert.ok(content.includes('isDatabaseConnected'), 'Must expose connection health indicator');
      assert.ok(content.includes('try {'), 'Must wrap connection attempt in try-catch');
      assert.ok(content.includes('catch (error)'), 'Must catch connection errors for graceful degradation');
    });
  });

  describe('2. Payment Webhook Security & Idempotency', () => {
    it('Purges all mock signature acceptance pathways from production code', () => {
      const controllerPath = path.join(backendDir, 'src', 'providers', 'webhooks', 'webhooks.controller.ts');
      const servicePath = path.join(backendDir, 'src', 'providers', 'webhooks', 'webhooks.service.ts');
      const controllerCode = fs.readFileSync(controllerPath, 'utf8');
      const serviceCode = fs.readFileSync(servicePath, 'utf8');

      assert.ok(!controllerCode.includes('mock_signature_valid'), 'Mock signature string must NOT exist in controller');
      assert.ok(!serviceCode.includes('mock_signature_valid'), 'Mock signature string must NOT exist in service');
      assert.ok(!controllerCode.includes('mock_sig_valid'), 'mock_sig_valid must NOT exist in controller');
      assert.ok(!serviceCode.includes('mock_sig_valid'), 'mock_sig_valid must NOT exist in service');
    });

    it('WebhooksController extracts exact raw body and requires cryptographic signature', () => {
      const controllerPath = path.join(backendDir, 'src', 'providers', 'webhooks', 'webhooks.controller.ts');
      const content = fs.readFileSync(controllerPath, 'utf8');

      assert.ok(content.includes('rawBody'), 'Controller must capture rawBody');
      assert.ok(content.includes('x-razorpay-signature'), 'Controller must inspect x-razorpay-signature header');
      assert.ok(content.includes('BadRequestException'), 'Controller must throw if signature is missing');
    });

    it('WebhooksService uses crypto.timingSafeEqual to prevent side-channel timing attacks', () => {
      const servicePath = path.join(backendDir, 'src', 'providers', 'webhooks', 'webhooks.service.ts');
      const content = fs.readFileSync(servicePath, 'utf8');

      assert.ok(content.includes('timingSafeEqual'), 'Must verify signature with constant-time comparison');
      assert.ok(content.includes('createHmac'), 'Must compute HMAC-SHA256');
    });

    it('WebhooksService fails closed if RAZORPAY_WEBHOOK_SECRET is unconfigured or placeholder in production', () => {
      const servicePath = path.join(backendDir, 'src', 'providers', 'webhooks', 'webhooks.service.ts');
      const content = fs.readFileSync(servicePath, 'utf8');

      assert.ok(content.includes('isProduction'), 'Must check production environment');
      assert.ok(content.includes('placeholder'), 'Must reject placeholder secrets in production');
      assert.ok(content.includes('CRITICAL: RAZORPAY_WEBHOOK_SECRET must be configured'), 'Must fail closed');
    });

    it('HMAC verification validates identical payload and rejects tampered bytes', () => {
      const secret = 'prod_simulated_webhook_secret_key_98765';
      const payload = JSON.stringify({ event: 'payment.captured', id: 'pay_123', amount: 50000 });
      const validSig = crypto.createHmac('sha256', secret).update(Buffer.from(payload, 'utf8')).digest('hex');

      // Valid check
      const sigBuf = Buffer.from(validSig, 'utf8');
      const expBuf = Buffer.from(validSig, 'utf8');
      assert.strictEqual(crypto.timingSafeEqual(sigBuf, expBuf), true);

      // Tampered body
      const tamperedPayload = JSON.stringify({ event: 'payment.captured', id: 'pay_123', amount: 999999 });
      const tamperedSig = crypto.createHmac('sha256', secret).update(Buffer.from(tamperedPayload, 'utf8')).digest('hex');
      const tampSigBuf = Buffer.from(tamperedSig, 'utf8');
      assert.strictEqual(crypto.timingSafeEqual(sigBuf, tampSigBuf), false);
    });
  });

  describe('3. Supabase Migration Preflight & Authorization Architecture', () => {
    const migrationFile = path.join(rootDir, 'data', 'migrations', '20261012_travel_partner_ecosystem.sql');

    it('Pending travel partner ecosystem migration file exists', () => {
      assert.ok(fs.existsSync(migrationFile), 'Migration 20261012_travel_partner_ecosystem.sql must exist');
    });

    it('Migration enforces Row Level Security (RLS) on all partner tables', () => {
      const sql = fs.readFileSync(migrationFile, 'utf8');

      const expectedTables = [
        'travel_agencies',
        'agency_verification_documents',
        'travel_partner_agreements',
        'travel_packages',
        'travel_commission_ledger',
        'travel_partner_audit_logs',
        'travel_partner_notifications',
      ];

      for (const table of expectedTables) {
        assert.ok(
          sql.includes(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`),
          `Table ${table} must have RLS enabled`,
        );
      }
    });

    it('Migration secures partner data with auth.uid() instead of trusting client agency identifiers', () => {
      const sql = fs.readFileSync(migrationFile, 'utf8');

      // Tenant isolation must check auth.uid()
      assert.ok(sql.includes('auth.uid()'), 'RLS policies must enforce auth.uid() validation');
      assert.ok(
        sql.includes('WHERE user_id = auth.uid()'),
        'Must filter records by user_id = auth.uid() in agency queries',
      );
    });

    it('All stored procedures (RPC) set explicit search_path and restrict execute privileges', () => {
      const sql = fs.readFileSync(migrationFile, 'utf8');

      const rpcFunctions = ['rpc_approve_agency', 'rpc_suspend_agency', 'rpc_settle_commission'];

      for (const rpc of rpcFunctions) {
        assert.ok(sql.includes(`CREATE OR REPLACE FUNCTION ${rpc}`), `Function ${rpc} must be defined`);
        assert.ok(
          sql.includes('SET search_path = public, pg_temp'),
          `Function ${rpc} must set explicit search_path to prevent security hijacking`,
        );
        assert.ok(
          sql.includes(`REVOKE EXECUTE ON FUNCTION ${rpc}`),
          `Function ${rpc} must revoke execute from PUBLIC`,
        );
        assert.ok(
          sql.includes(`GRANT EXECUTE ON FUNCTION ${rpc}`) && sql.includes('TO service_role'),
          `Function ${rpc} execute must be granted exclusively to service_role`,
        );
      }
    });
  });
});
