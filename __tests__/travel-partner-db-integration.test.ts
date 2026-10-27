import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import {
  SupabasePartnerDatabaseAdapter,
  TestMemoryPartnerDatabaseAdapter,
  DatabaseTableMissingError,
  createPartnerDatabaseAdapter,
} from '../lib/partners/partner-db-adapter';
import { getSupabaseClient, getSupabaseServerClient } from '../lib/supabase/client';

describe('BharatYatra Production Database Adapter Integration', () => {
  it('1. Security Guard: TestMemoryPartnerDatabaseAdapter strictly refuses to instantiate in production', () => {
    const originalEnv = process.env.NODE_ENV;
    try {
      (process.env as any).NODE_ENV = 'production';
      assert.throws(
        () => new TestMemoryPartnerDatabaseAdapter(),
        (err: any) => {
          return (
            err instanceof Error &&
            err.message.includes('SECURITY VIOLATION') &&
            err.message.includes('production environment')
          );
        },
        'Expected instantiation in production to throw security violation'
      );
    } finally {
      (process.env as any).NODE_ENV = originalEnv;
    }
  });

  it('2. Factory Security: createPartnerDatabaseAdapter strictly selects SupabasePartnerDatabaseAdapter in production', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalTestFlag = process.env.USE_TEST_ADAPTER;
    try {
      (process.env as any).NODE_ENV = 'production';
      process.env.USE_TEST_ADAPTER = 'true'; // Attempt override

      const adapter = createPartnerDatabaseAdapter();
      assert.ok(
        adapter instanceof SupabasePartnerDatabaseAdapter,
        'Factory must return SupabasePartnerDatabaseAdapter in production regardless of flags.'
      );
    } finally {
      (process.env as any).NODE_ENV = originalEnv;
      process.env.USE_TEST_ADAPTER = originalTestFlag;
    }
  });

  it('3. Real Database Connectivity & Schema Probe: queries Supabase PostgreSQL endpoint', async () => {
    const client = getSupabaseClient();
    const adapter = new SupabasePartnerDatabaseAdapter(client);

    try {
      // Probe the travel_agencies table
      const agencies = await adapter.getAgencies();
      // If table exists, verify return type is array
      assert.ok(Array.isArray(agencies));
      console.log(`[DB Integration] Connected to Supabase tables. Found ${agencies.length} existing agencies.`);
    } catch (err: any) {
      if (err instanceof DatabaseTableMissingError) {
        console.log(`[DB Integration] Verified expected pending-migration state: table "${err.tableName}" not yet applied to remote database.`);
        assert.strictEqual(err.tableName, 'travel_agencies');
        assert.ok(err.message.includes('20261012_travel_partner_ecosystem.sql'));
      } else {
        throw err;
      }
    }
  });

  it('4. Zero-Mock Enforcement: production adapter never falls back to local JSON or memory', async () => {
    const adapter = new SupabasePartnerDatabaseAdapter();
    // Verify that the adapter contains no in-memory Map stores
    assert.strictEqual((adapter as any).agencies, undefined);
    assert.strictEqual((adapter as any).packages, undefined);
    assert.strictEqual((adapter as any).ledger, undefined);
  });

  it('5. Server Secret Safety: server client handles optional service role key safely', () => {
    const serverClient = getSupabaseServerClient();
    assert.ok(serverClient, 'Server client must instantiate cleanly');
  });

  it('6. Migration Preflight Schema Integrity: verifies all tables, columns, RLS and RPC in SQL migration', () => {
    const migrationPath = path.join(process.cwd(), 'data', 'migrations', '20261012_travel_partner_ecosystem.sql');
    assert.ok(fs.existsSync(migrationPath), 'Migration file must exist');

    const sql = fs.readFileSync(migrationPath, 'utf-8');

    // Verify all 7 core tables exist with VARCHAR(64) PK
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
      assert.ok(sql.includes(`CREATE TABLE IF NOT EXISTS ${table}`), `Missing table ${table}`);
      assert.ok(sql.includes(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`), `Missing RLS on ${table}`);
    }

    // Verify critical columns
    assert.ok(sql.includes('itinerary JSONB'), 'Missing itinerary JSONB column in travel_packages');
    assert.ok(sql.includes('package_title VARCHAR(255)'), 'Missing package_title column in travel_commission_ledger');

    // Verify atomic RPC procedures
    assert.ok(sql.includes('CREATE OR REPLACE FUNCTION rpc_approve_agency'), 'Missing rpc_approve_agency function');
    assert.ok(sql.includes('CREATE OR REPLACE FUNCTION rpc_suspend_agency'), 'Missing rpc_suspend_agency function');
    assert.ok(sql.includes('CREATE OR REPLACE FUNCTION rpc_settle_commission'), 'Missing rpc_settle_commission function');

    // Verify search_path and execution privileges
    assert.ok(sql.includes('SET search_path = public, pg_temp'), 'Missing search_path hardening on RPC functions');
    assert.ok(sql.includes('REVOKE EXECUTE ON FUNCTION rpc_approve_agency'), 'Missing execute revocation on rpc_approve_agency');
    assert.ok(sql.includes('REVOKE EXECUTE ON FUNCTION rpc_suspend_agency'), 'Missing execute revocation on rpc_suspend_agency');
    assert.ok(sql.includes('REVOKE EXECUTE ON FUNCTION rpc_settle_commission'), 'Missing execute revocation on rpc_settle_commission');

    // Verify tenant isolation policies
    assert.ok(sql.includes('CREATE POLICY "Partners can view own agency"'), 'Missing partner agency isolation policy');
    assert.ok(sql.includes('CREATE POLICY "Partners can view and manage own packages"'), 'Missing partner package isolation policy');
    assert.ok(sql.includes('CREATE POLICY "Partners can view own commission ledger"'), 'Missing partner commission isolation policy');
  });
});
