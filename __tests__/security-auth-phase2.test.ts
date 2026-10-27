import test, { describe, it, before, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { NextRequest } from 'next/server';
import { getAuthenticatedAgencyId, getAuthenticatedAgency, verifyAdminRequest } from '../lib/partners/partner-auth';
import { partnerService } from '../lib/partners/partner-service';
import { TestMemoryPartnerDatabaseAdapter } from '../lib/partners/partner-db-adapter';
import { setSupabaseClientForTesting } from '../lib/supabase/client';

describe('Phase 2 Security Regression Tests - Authentication & Account Security Hardening', () => {
  let mockSupabaseUsers: Map<string, any>;
  let agencyA: any;
  let agencyB: any;

  before(async () => {
    partnerService.setAdapter(new TestMemoryPartnerDatabaseAdapter());
    await partnerService.clearAllForTesting();

    // Create test agency A
    const resA = await partnerService.createAgencyApplication({
      businessName: 'Secure Safari Travels Ltd',
      businessType: 'PVT_LTD',
      representativeName: 'Alice Operator',
      businessEmail: 'alice@securesafari.com',
      contactPhone: '+91 98251 11111',
      city: 'Ahmedabad',
      stateCode: 'Gujarat',
      yearsInOperation: 5,
      businessDescription: 'Authentic wildlife journeys',
      userId: 'user-alice-123',
    });
    assert.strictEqual(resA.success, true);
    agencyA = resA.agency;

    // Create test agency B
    const resB = await partnerService.createAgencyApplication({
      businessName: 'Royal Rajasthan Heritage',
      businessType: 'LLP',
      representativeName: 'Bob Operator',
      businessEmail: 'bob@royalheritage.com',
      contactPhone: '+91 98251 22222',
      city: 'Jaipur',
      stateCode: 'Rajasthan',
      yearsInOperation: 8,
      businessDescription: 'Palaces and deserts',
      userId: 'user-bob-456',
    });
    assert.strictEqual(resB.success, true);
    agencyB = resB.agency;
  });

  beforeEach(() => {
    mockSupabaseUsers = new Map();

    // Inject isolated test client into Supabase module
    setSupabaseClientForTesting({
      auth: {
        getUser: async (token: string) => {
          if (!mockSupabaseUsers.has(token)) {
            return { data: { user: null }, error: { message: 'Invalid or expired token', status: 401 } };
          }
          return { data: { user: mockSupabaseUsers.get(token) }, error: null };
        },
      },
    } as any);
  });

  afterEach(() => {
    setSupabaseClientForTesting(null);
  });

  describe('A. Partner Authorization & Account Takeover Elimination', () => {
    it('1. Rejects missing Authorization header (returns null)', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/partner/packages', {
        headers: {},
      });

      const agencyId = await getAuthenticatedAgencyId(req);
      assert.strictEqual(agencyId, null);
    });

    it('2. Rejects forged or unsigned by_agency_id cookie (Account Takeover elimination)', async () => {
      // Attacker attempts to take over Agency A by injecting raw cookie
      const req = new NextRequest('http://localhost:3000/api/v1/partner/packages', {
        headers: {
          cookie: `by_agency_id=${agencyA.id}`,
        },
      });

      const agencyId = await getAuthenticatedAgencyId(req);
      assert.strictEqual(agencyId, null, 'Unsigned by_agency_id cookie MUST NOT grant partner access');
    });

    it('3. Rejects client-injected x-agency-id or x-partner-id headers', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/partner/packages', {
        headers: {
          'x-agency-id': agencyA.id,
          'x-partner-id': agencyA.id,
        },
      });

      const agencyId = await getAuthenticatedAgencyId(req);
      assert.strictEqual(agencyId, null, 'Client-controlled agency headers MUST NOT grant access');
    });

    it('4. Rejects forged, malformed or unsigned JWT Bearer tokens', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/partner/packages', {
        headers: {
          authorization: 'Bearer forged.unsigned.token.payload',
        },
      });

      const agencyId = await getAuthenticatedAgencyId(req);
      assert.strictEqual(agencyId, null, 'Forged token must return null');
    });

    it('5. Successfully authorizes legitimate partner with verified Supabase token', async () => {
      const validToken = 'valid_signed_token_alice';
      mockSupabaseUsers.set(validToken, {
        id: 'user-alice-123',
        email: 'alice@securesafari.com',
        app_metadata: { role: 'partner' },
      });

      const req = new NextRequest('http://localhost:3000/api/v1/partner/packages', {
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      });

      const agencyId = await getAuthenticatedAgencyId(req);
      assert.strictEqual(agencyId, agencyA.id, 'Legitimate token must resolve user agency');

      const agency = await getAuthenticatedAgency(req);
      assert.ok(agency);
      assert.strictEqual(agency.id, agencyA.id);
      assert.strictEqual(agency.businessName, 'Secure Safari Travels Ltd');
    });

    it('6. IDOR Protection: User A token CANNOT access User B agency', async () => {
      const aliceToken = 'valid_token_alice_only';
      mockSupabaseUsers.set(aliceToken, {
        id: 'user-alice-123',
        email: 'alice@securesafari.com',
      });

      // User A attempts to request Agency B data while providing their own valid token
      const req = new NextRequest(`http://localhost:3000/api/v1/partner/packages?agencyId=${agencyB.id}`, {
        headers: {
          authorization: `Bearer ${aliceToken}`,
        },
      });

      const derivedAgencyId = await getAuthenticatedAgencyId(req);
      assert.strictEqual(derivedAgencyId, agencyA.id);
      assert.notStrictEqual(derivedAgencyId, agencyB.id, 'User A token must never resolve Agency B');
    });

    it('7. Rejects authenticated user who has no linked agency (no false agency match)', async () => {
      const nonPartnerToken = 'valid_token_regular_tourist';
      mockSupabaseUsers.set(nonPartnerToken, {
        id: 'regular-customer-uuid-999',
        email: 'tourist@example.com',
      });

      const req = new NextRequest('http://localhost:3000/api/v1/partner/packages', {
        headers: {
          authorization: `Bearer ${nonPartnerToken}`,
        },
      });

      const agencyId = await getAuthenticatedAgencyId(req);
      assert.strictEqual(agencyId, null, 'Non-partner user must receive null agency identity');
    });
  });

  describe('B. Privilege Escalation Elimination & Admin Verification', () => {
    it('1. Email suffix @bharatyatra.in ALONE does NOT grant administrative privileges', async () => {
      const imposterToken = 'token_imposter_bharatyatra_in';
      mockSupabaseUsers.set(imposterToken, {
        id: 'imposter-uuid',
        email: 'attacker@bharatyatra.in', // Email ends with @bharatyatra.in!
        app_metadata: {}, // No verified admin role
      });

      const req = new NextRequest('http://localhost:3000/api/v1/admin/agencies', {
        headers: {
          authorization: `Bearer ${imposterToken}`,
        },
      });

      const result = await verifyAdminRequest(req);
      assert.strictEqual(result.authorized, false, '@bharatyatra.in suffix alone MUST NOT grant admin access');
    });

    it('2. Client-controlled user_metadata cannot grant admin privileges', async () => {
      const clientForgedToken = 'token_forged_client_metadata';
      mockSupabaseUsers.set(clientForgedToken, {
        id: 'forger-uuid',
        email: 'sneaky@example.com',
        user_metadata: { role: 'admin' }, // Client-editable field!
        app_metadata: {}, // Server-controlled claims have no admin role
      });

      const req = new NextRequest('http://localhost:3000/api/v1/admin/agencies', {
        headers: {
          authorization: `Bearer ${clientForgedToken}`,
        },
      });

      const result = await verifyAdminRequest(req);
      assert.strictEqual(result.authorized, false, 'Client user_metadata.role must be ignored');
    });

    it('3. Cryptographically verified app_metadata.role === "admin" grants admin privileges', async () => {
      const genuineAdminToken = 'token_genuine_admin';
      mockSupabaseUsers.set(genuineAdminToken, {
        id: 'real-admin-uuid',
        email: 'security.officer@bharatyatra.in',
        app_metadata: { role: 'admin' }, // Cryptographically verified claim
      });

      const req = new NextRequest('http://localhost:3000/api/v1/admin/agencies', {
        headers: {
          authorization: `Bearer ${genuineAdminToken}`,
        },
      });

      const result = await verifyAdminRequest(req);
      assert.strictEqual(result.authorized, true);
      assert.strictEqual(result.adminId, 'real-admin-uuid');
    });

    it('4. Rejects invalid x-admin-key or x-admin-token headers', async () => {
      const originalSecret = process.env.ADMIN_SECRET_KEY;
      process.env.ADMIN_SECRET_KEY = 'real_super_secure_admin_secret_key_2026';

      try {
        const req = new NextRequest('http://localhost:3000/api/v1/admin/agencies', {
          headers: {
            'x-admin-key': 'wrong_guess_password',
          },
        });

        const result = await verifyAdminRequest(req);
        assert.strictEqual(result.authorized, false);
      } finally {
        process.env.ADMIN_SECRET_KEY = originalSecret;
      }
    });

    it('5. Grants access when correct ADMIN_SECRET_KEY is provided in x-admin-key header', async () => {
      const originalSecret = process.env.ADMIN_SECRET_KEY;
      const testSecret = 'production_grade_verified_admin_key_999888';
      process.env.ADMIN_SECRET_KEY = testSecret;

      try {
        const req = new NextRequest('http://localhost:3000/api/v1/admin/agencies', {
          headers: {
            'x-admin-key': testSecret,
          },
        });

        const result = await verifyAdminRequest(req);
        assert.strictEqual(result.authorized, true);
        assert.strictEqual(result.adminId, 'admin-operations-secret');
      } finally {
        process.env.ADMIN_SECRET_KEY = originalSecret;
      }
    });
  });
});
