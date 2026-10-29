import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { extractAuthToken } from '../lib/auth/server-auth';

describe('BharatYatra Session Persistence & Auth Token Extraction Suite', () => {
  test('Scenario 1: Extract auth token from Authorization header', () => {
    const req = new Request('http://localhost:3000/api/v1/me', {
      headers: {
        Authorization: 'Bearer supabase-access-token-12345',
      },
    });

    const token = extractAuthToken(req);
    assert.equal(token, 'supabase-access-token-12345');
  });

  test('Scenario 2: Extract auth token from sb_auth_token cookie', () => {
    const req = new Request('http://localhost:3000/api/v1/me', {
      headers: {
        cookie: 'sb_auth_token=cookie-access-token-67890; other_cookie=xyz',
      },
    });

    const token = extractAuthToken(req);
    assert.equal(token, 'cookie-access-token-67890');
  });

  test('Scenario 3: Extract auth token from sb-access-token cookie', () => {
    const req = new Request('http://localhost:3000/api/v1/me', {
      headers: {
        cookie: 'sb-access-token=sb-legacy-token-abcde; other=123',
      },
    });

    const token = extractAuthToken(req);
    assert.equal(token, 'sb-legacy-token-abcde');
  });

  test('Scenario 4: Extract auth token from standard Supabase project-ref cookie sb-*-auth-token', () => {
    const sessionPayload = JSON.stringify({
      access_token: 'project-ref-jwt-token-99999',
      refresh_token: 'refresh-token-11111',
    });

    const req = new Request('http://localhost:3000/api/v1/me', {
      headers: {
        cookie: `sb-uedmguvljhsvbndwkruz-auth-token=${encodeURIComponent(sessionPayload)}`,
      },
    });

    const token = extractAuthToken(req);
    assert.equal(token, 'project-ref-jwt-token-99999');
  });

  test('Scenario 5: Handle missing or invalid token cleanly', () => {
    const req = new Request('http://localhost:3000/api/v1/me', {
      headers: {
        cookie: 'unrelated_cookie=foo',
      },
    });

    const token = extractAuthToken(req);
    assert.equal(token, null);
  });
});
