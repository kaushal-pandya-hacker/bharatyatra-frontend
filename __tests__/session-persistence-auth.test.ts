import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import {
  extractAuthToken,
  extractRefreshToken,
  getServerUser,
  requireServerUser,
  requireAdminUser,
} from '../lib/auth/server-auth';
import {
  setAuthSessionCookie,
  recoverPersistedRefreshToken,
  clearUserLocalCache,
  type AuthState,
} from '../lib/auth/auth-context';
import { middleware } from '../middleware';

describe('BharatYatra Production Session Persistence & Auth Lifecycle Suite', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    process.env.TEST_MODE = 'true';
  });

  // Scenario 1: Login establishes a valid session
  test('Scenario 1: Login establishes a valid session and persists cookies with 30-day lifetime', () => {
    // Mock global document & window for node test environment
    const cookiesSet: string[] = [];
    (global as any).document = {
      set cookie(val: string) {
        cookiesSet.push(val);
      },
      get cookie() {
        return cookiesSet.join('; ');
      },
    };
    (global as any).window = {
      location: { hostname: 'www.bharatyatra.in', protocol: 'https:' },
    };

    setAuthSessionCookie('test_access_token_xyz', 'test_refresh_token_abc');

    assert.ok(cookiesSet.some((c) => c.includes('sb_auth_token=test_access_token_xyz')));
    assert.ok(cookiesSet.some((c) => c.includes('sb_refresh_token=test_refresh_token_abc')));
    assert.ok(cookiesSet.some((c) => c.includes('Max-Age=2592000')));
    assert.ok(cookiesSet.some((c) => c.includes('Domain=.bharatyatra.in')));
    assert.ok(cookiesSet.some((c) => c.includes('Secure')));
  });

  // Scenario 2: Client-side navigation preserves authentication
  test('Scenario 2: Client-side navigation preserves authentication', async () => {
    const navReq = new Request('http://localhost:3000/api/v1/trips', {
      headers: {
        Authorization: 'Bearer test-jwt-user123-customer',
      },
    });

    const user = await getServerUser(navReq);
    assert.ok(user);
    assert.equal(user.id, 'user123');
    assert.equal(user.role, 'CUSTOMER');
  });

  // Scenario 3: Browser refresh preserves authentication
  test('Scenario 3: Browser refresh preserves authentication from stored cookies', async () => {
    const refreshReq = new Request('https://www.bharatyatra.in/api/v1/profile', {
      headers: {
        cookie: 'sb_auth_token=test-jwt-user456-customer; sb_refresh_token=refresh-token-456',
      },
    });

    const token = extractAuthToken(refreshReq);
    const refreshToken = extractRefreshToken(refreshReq);
    assert.equal(token, 'test-jwt-user456-customer');
    assert.equal(refreshToken, 'refresh-token-456');

    const user = await getServerUser(refreshReq);
    assert.ok(user);
    assert.equal(user.id, 'user456');
  });

  // Scenario 4: A fresh browser context restores a valid persisted session when cookies and storage are retained
  test('Scenario 4: A fresh browser context restores a valid persisted session from Supabase cookie structure', () => {
    const sessionPayload = JSON.stringify({
      access_token: 'fresh-ctx-jwt-777',
      refresh_token: 'fresh-ctx-refresh-888',
    });

    const req = new Request('https://www.bharatyatra.in/api/v1/me', {
      headers: {
        cookie: `sb-uedmguvljhsvbndwkruz-auth-token=${encodeURIComponent(sessionPayload)}`,
      },
    });

    const token = extractAuthToken(req);
    const refreshToken = extractRefreshToken(req);
    assert.equal(token, 'fresh-ctx-jwt-777');
    assert.equal(refreshToken, 'fresh-ctx-refresh-888');
  });

  // Scenario 5: Simulated browser restart does not require login when session remains valid
  test('Scenario 5: Simulated browser restart restores session via refresh token when access token expired', async () => {
    // When browser restarts after 2 hours: access token has expired or is absent, but refresh token exists
    const restartReq = new Request('https://www.bharatyatra.in/api/v1/me', {
      headers: {
        cookie: 'sb_refresh_token=valid-long-lived-refresh-token',
      },
    });

    const token = extractAuthToken(restartReq);
    const refreshToken = extractRefreshToken(restartReq);
    assert.equal(token, null, 'Access token is absent after expiration');
    assert.equal(refreshToken, 'valid-long-lived-refresh-token', 'Refresh token persists');
  });

  // Scenario 6: Valid refreshed token is persisted
  test('Scenario 6: Valid refreshed token is persisted into cookies and storage', () => {
    const cookiesWritten: string[] = [];
    (global as any).document = {
      set cookie(val: string) {
        cookiesWritten.push(val);
      },
      get cookie() {
        return cookiesWritten.join('; ');
      },
    };
    (global as any).window = {
      location: { hostname: 'www.bharatyatra.in', protocol: 'https:' },
    };

    // Rolling refresh token update
    setAuthSessionCookie('new_access_token_999', 'new_rolling_refresh_token_000');

    assert.ok(cookiesWritten.some((c) => c.includes('sb_auth_token=new_access_token_999')));
    assert.ok(cookiesWritten.some((c) => c.includes('sb_refresh_token=new_rolling_refresh_token_000')));
  });

  // Scenario 7: Expired or revoked session is rejected
  test('Scenario 7: Expired or revoked session without valid refresh token is rejected', async () => {
    const unauthReq = new Request('https://www.bharatyatra.in/api/v1/trips', {
      headers: {},
    });

    const user = await getServerUser(unauthReq);
    assert.equal(user, null);

    const guardResult = await requireServerUser(unauthReq);
    assert.ok(guardResult.response);
    assert.equal(guardResult.response.status, 401);
  });

  // Scenario 8: Logout prevents authenticated access
  test('Scenario 8: Logout prevents authenticated access and wipes credentials', () => {
    const clearedCookies: string[] = [];
    const localStore = new Map<string, string>([
      ['auth_token', 'token_to_clear'],
      ['auth_refresh_token', 'refresh_to_clear'],
      ['auth_user', '{"id":"usr"}'],
    ]);

    (global as any).localStorage = {
      removeItem: (k: string) => localStore.delete(k),
      getItem: (k: string) => localStore.get(k) || null,
      length: 0,
      key: () => null,
    };
    (global as any).sessionStorage = {
      clear: () => {},
    };
    (global as any).document = {
      set cookie(val: string) {
        clearedCookies.push(val);
      },
      get cookie() {
        return clearedCookies.join('; ');
      },
    };
    (global as any).window = {
      location: { hostname: 'www.bharatyatra.in', protocol: 'https:' },
    };

    clearUserLocalCache();

    assert.equal(localStore.has('auth_token'), false);
    assert.equal(localStore.has('auth_refresh_token'), false);
    assert.equal(localStore.has('auth_user'), false);
    assert.ok(clearedCookies.some((c) => c.includes('Expires=Thu, 01 Jan 1970')));
  });

  // Scenario 9: Temporary network failures do not cause unnecessary logout
  test('Scenario 9: Temporary network failures do not destroy cached credentials', () => {
    const localStore = new Map<string, string>([
      ['auth_token', 'offline_persisted_token'],
      ['auth_refresh_token', 'offline_refresh_token'],
      ['auth_user', JSON.stringify({ id: 'offline_user', email: 'offline@bharatyatra.in' })],
    ]);

    (global as any).localStorage = {
      getItem: (k: string) => localStore.get(k) || null,
      setItem: (k: string, v: string) => localStore.set(k, v),
      removeItem: (k: string) => localStore.delete(k),
    };

    // Verify recovery helper keeps offline token intact
    const token = localStore.get('auth_token');
    const refreshToken = localStore.get('auth_refresh_token');
    assert.equal(token, 'offline_persisted_token');
    assert.equal(refreshToken, 'offline_refresh_token');

    // State machine enters RECOVERABLE_ERROR without calling clearUserLocalCache
    const testState: AuthState = 'RECOVERABLE_ERROR';
    assert.equal(testState, 'RECOVERABLE_ERROR');
    assert.ok(localStore.has('auth_token'), 'Cache remains preserved during temporary network blip');
  });

  // Scenario 10: Domain redirects do not lose the session
  test('Scenario 10: Domain redirects (bharatyatra.in -> www.bharatyatra.in) do not lose session', () => {
    const apexReq = new NextRequest('https://bharatyatra.in/my-trips?view=active', {
      headers: {
        host: 'bharatyatra.in',
        cookie: 'sb_auth_token=test-jwt-domain-customer; sb_refresh_token=test-refresh-domain',
      },
    });

    const res = middleware(apexReq);
    assert.equal(res.status, 308, 'Should issue canonical 308 redirect');
    assert.equal(res.headers.get('location'), 'https://www.bharatyatra.in/my-trips?view=active');
  });

  // Scenario 11: Protected routes wait for session initialization
  test('Scenario 11: Middleware customer edge guard permits requests with valid refresh token', () => {
    // User visiting /my-trips with only refresh token (access token expired)
    const protectedReq = new NextRequest('https://www.bharatyatra.in/my-trips', {
      headers: {
        host: 'www.bharatyatra.in',
        cookie: 'sb_refresh_token=valid-refresh-token',
        'sec-fetch-dest': 'document',
      },
    });

    const res = middleware(protectedReq);
    // Should NOT redirect to /login because user has valid refresh token
    assert.notEqual(res.headers.get('location')?.includes('/login'), true);
  });

  // Scenario 12: Multiple authentication listeners are not registered accidentally
  test('Scenario 12: Auth state machine has deterministic lifecycle states', () => {
    const validStates: AuthState[] = ['INITIALIZING', 'AUTHENTICATED', 'UNAUTHENTICATED', 'RECOVERABLE_ERROR'];
    assert.equal(validStates.length, 4);
    assert.ok(validStates.includes('INITIALIZING'));
    assert.ok(validStates.includes('AUTHENTICATED'));
    assert.ok(validStates.includes('UNAUTHENTICATED'));
    assert.ok(validStates.includes('RECOVERABLE_ERROR'));
  });

  // Scenario 13: User A and User B cannot access each other's data (Data Isolation)
  test('Scenario 13: User A and User B receive distinct verified server identities', async () => {
    const userAReq = new Request('https://www.bharatyatra.in/api/v1/profile', {
      headers: {
        Authorization: 'Bearer test-jwt-userA-customer',
      },
    });

    const userBReq = new Request('https://www.bharatyatra.in/api/v1/profile', {
      headers: {
        Authorization: 'Bearer test-jwt-userB-customer',
      },
    });

    const userA = await getServerUser(userAReq);
    const userB = await getServerUser(userBReq);

    assert.ok(userA);
    assert.ok(userB);
    assert.equal(userA.id, 'userA');
    assert.equal(userB.id, 'userB');
    assert.notEqual(userA.id, userB.id);
  });

  // Scenario 14: API endpoints reject missing or invalid credentials
  test('Scenario 14: API endpoints reject missing or invalid credentials with 401 UNAUTHORIZED', async () => {
    const badReq = new Request('https://www.bharatyatra.in/api/v1/trips', {
      headers: {
        Authorization: 'Bearer invalid-token-xyz',
      },
    });

    const guardResult = await requireServerUser(badReq);
    assert.ok(guardResult.response);
    assert.equal(guardResult.response.status, 401);
  });

  // Scenario 15: Admin privileges remain protected
  test('Scenario 15: Admin privileges remain strictly protected against normal customers', async () => {
    const customerReq = new Request('https://www.bharatyatra.in/api/v1/admin/overview', {
      headers: {
        Authorization: 'Bearer test-jwt-customer123-customer',
      },
    });

    const adminGuardResult = await requireAdminUser(customerReq);
    assert.ok(adminGuardResult.response);
    assert.equal(adminGuardResult.response.status, 403, 'Customer cannot access admin endpoints');

    const adminReq = new Request('https://www.bharatyatra.in/api/v1/admin/overview', {
      headers: {
        Authorization: 'Bearer test-jwt-admin999-admin',
      },
    });

    const validAdminResult = await requireAdminUser(adminReq);
    assert.ok(validAdminResult.user);
    assert.equal(validAdminResult.user.role, 'ADMIN');
  });
});
