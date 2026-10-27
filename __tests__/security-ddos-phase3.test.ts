import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import nextConfig from '../next.config.mjs';

describe('Phase 3 Security Regression Tests - Edge Protection, Anti-Caching & Origin Shielding', () => {
  it('1. Next.js Configuration: Enforces no-store Cache-Control on all /api routes', async () => {
    assert.ok(typeof nextConfig.headers === 'function', 'nextConfig must define a headers function');
    const headerRules = await nextConfig.headers!();

    const apiRule = headerRules.find((r: any) => r.source === '/api/:path*');
    assert.ok(apiRule, 'Must contain an explicit header rule for /api/:path*');

    const cacheControl = apiRule.headers.find((h: any) => h.key === 'Cache-Control');
    assert.ok(cacheControl, 'Must set Cache-Control header on API routes');
    assert.ok(cacheControl.value.includes('no-store'), 'API Cache-Control MUST specify no-store');
    assert.ok(cacheControl.value.includes('no-cache'), 'API Cache-Control MUST specify no-cache');

    const pragma = apiRule.headers.find((h: any) => h.key === 'Pragma');
    assert.ok(pragma, 'Must set Pragma header');
    assert.strictEqual(pragma.value, 'no-cache');
  });

  it('2. Next.js Configuration: Enforces immutable long-term caching for static assets', async () => {
    assert.ok(typeof nextConfig.headers === 'function');
    const headerRules = await nextConfig.headers!();
    const staticRule = headerRules.find((r: any) => r.source === '/_next/static/:path*');
    assert.ok(staticRule, 'Must contain a rule for /_next/static/:path*');

    const cacheControl = staticRule.headers.find((h: any) => h.key === 'Cache-Control');
    assert.ok(cacheControl, 'Static assets must have Cache-Control');
    assert.ok(cacheControl.value.includes('public'), 'Static assets should be public');
    assert.ok(cacheControl.value.includes('immutable'), 'Static assets should be marked immutable');
  });

  it('3. Security Headers: Enforces Frameguard (SAMEORIGIN) and NoSniff', async () => {
    assert.ok(typeof nextConfig.headers === 'function');
    const headerRules = await nextConfig.headers!();
    const globalRule = headerRules.find((r: any) => r.source === '/:path*');
    assert.ok(globalRule, 'Must contain global security header rule');

    const frameOptions = globalRule.headers.find((h: any) => h.key === 'X-Frame-Options');
    assert.ok(frameOptions);
    assert.strictEqual(frameOptions.value, 'SAMEORIGIN');

    const contentTypeOptions = globalRule.headers.find((h: any) => h.key === 'X-Content-Type-Options');
    assert.ok(contentTypeOptions);
    assert.strictEqual(contentTypeOptions.value, 'nosniff');
  });
});
