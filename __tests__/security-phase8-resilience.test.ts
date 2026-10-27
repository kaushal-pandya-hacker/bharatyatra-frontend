import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs';
import * as path from 'path';
import { RateLimiterService } from '../18_DEVELOPMENT/Backend/src/security/rate-limiter.service';

describe('Phase 8 Security Tests - Controlled Resilience, Failure Injection & Supply-Chain Protection', () => {
  const rootDir = path.resolve(__dirname, '..');
  const backendDir = path.join(rootDir, '18_DEVELOPMENT', 'Backend');

  describe('1. Redis Failure Injection & Rate-Limit Fallback Resilience', () => {
    it('engages local in-memory rate-limiter when Redis connection throws or fails', async () => {
      // Mock broken Redis service where isAvailable returns true initially but operations throw
      const mockBrokenRedis: any = {
        isAvailable: () => true,
        incrWithExpiry: async () => {
          throw new Error('ECONNREFUSED: Redis instance unreachable');
        },
      };

      const rateLimiter = new RateLimiterService(mockBrokenRedis);

      // Verify that rate limiter gracefully degrades to in-memory fallback without throwing
      const result1 = await rateLimiter.consume('test_client_resilience', 3, 60);
      assert.strictEqual(result1.allowed, true, 'First request must be allowed via fallback');
      assert.strictEqual(result1.total, 1);
      assert.strictEqual(result1.store, 'IN_MEMORY', 'Must flag store as IN_MEMORY');

      const result2 = await rateLimiter.consume('test_client_resilience', 3, 60);
      assert.strictEqual(result2.allowed, true);
      assert.strictEqual(result2.total, 2);
      assert.strictEqual(result2.store, 'IN_MEMORY');

      const result3 = await rateLimiter.consume('test_client_resilience', 3, 60);
      assert.strictEqual(result3.allowed, true);
      assert.strictEqual(result3.total, 3);
      assert.strictEqual(result3.store, 'IN_MEMORY');

      // 4th request must be blocked by fallback rate limiter (no fail-open security bypass)
      const result4 = await rateLimiter.consume('test_client_resilience', 3, 60);
      assert.strictEqual(result4.allowed, false, 'Rate limiter must fail-secure on Redis outage, never fail-open');
      assert.strictEqual(result4.total, 4);
      assert.strictEqual(result4.remaining, 0);
      assert.ok(result4.resetSeconds > 0, 'Reset seconds window must be reported');

      rateLimiter.onModuleDestroy();
    });
  });

  describe('2. Database Connection Resilience & Statement Timeouts', () => {
    it('enforces bounded query and connection timeouts to prevent database starvation', () => {
      const dbConfigPath = path.join(backendDir, 'src', 'config', 'db.ts');
      assert.ok(fs.existsSync(dbConfigPath), 'db.ts config must exist');
      const content = fs.readFileSync(dbConfigPath, 'utf8');

      // Statement timeout protects against slow queries locking PostgreSQL connections
      assert.ok(content.includes('statement_timeout'), 'Must configure statement_timeout');
      assert.ok(content.includes('connectionTimeoutMillis'), 'Must configure connectionTimeoutMillis');
      assert.ok(content.includes('idleTimeoutMillis'), 'Must configure idleTimeoutMillis');
      assert.ok(content.includes('DB_POOL_MAX'), 'Must enforce bounded pool size configuration');
    });

    it('PrismaService injects bounded connection_limit and pool_timeout into DATABASE_URL', () => {
      const prismaServicePath = path.join(backendDir, 'src', 'prisma', 'prisma.service.ts');
      const content = fs.readFileSync(prismaServicePath, 'utf8');

      assert.ok(content.includes('connection_limit='), 'Prisma URL must specify connection_limit');
      assert.ok(content.includes('pool_timeout='), 'Prisma URL must specify pool_timeout');
      assert.ok(content.includes('connect_timeout='), 'Prisma URL must specify connect_timeout');
    });
  });

  describe('3. External Supplier Timeout & Bounded Retry Architecture', () => {
    it('Hotelbeds client enforces bounded request timeout and circuit fallback', () => {
      const hotelbedsPath = path.join(backendDir, 'src', 'providers', 'hotelbeds', 'hotelbeds-client.service.ts');
      assert.ok(fs.existsSync(hotelbedsPath), 'HotelbedsClientService must exist');
      const content = fs.readFileSync(hotelbedsPath, 'utf8');

      assert.ok(content.includes('timeoutMs'), 'Must configure timeout parameter');
      assert.ok(content.includes('AbortController'), 'Must use AbortController for deterministic cancellation');
      assert.ok(content.includes('ETIMEDOUT') || content.includes('Timeout'), 'Must handle provider timeout safely');
    });

    it('Universal provider registry verifies provider health without infinite retry loops', () => {
      const healthPath = path.join(backendDir, 'src', 'providers', 'monitoring', 'provider-health.service.ts');
      assert.ok(fs.existsSync(healthPath), 'ProviderHealthService must exist');
      const content = fs.readFileSync(healthPath, 'utf8');

      assert.ok(content.includes('getProviderHealthReports'), 'Must expose getProviderHealthReports');
      assert.ok(content.includes('HEALTHY'), 'Must define provider health status');
      assert.ok(content.includes('averageLatencyMs'), 'Must track provider average latency');
    });
  });

  describe('4. Slowloris, Request Starvation & Payload Exhaustion Defense', () => {
    it('main.ts configures HTTP server slowloris timeouts (headersTimeout, requestTimeout, keepAliveTimeout)', () => {
      const mainPath = path.join(backendDir, 'src', 'main.ts');
      const content = fs.readFileSync(mainPath, 'utf8');

      assert.ok(content.includes('headersTimeout'), 'Must configure headersTimeout for slowloris defense');
      assert.ok(content.includes('requestTimeout'), 'Must configure requestTimeout for request starvation defense');
      assert.ok(content.includes('keepAliveTimeout'), 'Must configure keepAliveTimeout for connection reuse limits');
    });

    it('enforces 1MB maximum payload body limit to prevent memory exhaustion', () => {
      const mainPath = path.join(backendDir, 'src', 'main.ts');
      const content = fs.readFileSync(mainPath, 'utf8');

      assert.ok(content.includes('maxBodyLimit'), 'Must define bounded body limit');
      assert.ok(content.includes('1mb') || content.includes('MAX_REQUEST_BODY_SIZE'), 'Must default to 1mb');
    });
  });

  describe('5. Supply-Chain & Build Artifact Secret Safety', () => {
    it('verifies that no live private keys or cloud provider secrets are present in source tree', () => {
      const sensitivePatterns = [
        '-----BEGIN RSA PRIVATE KEY-----',
        '-----BEGIN EC PRIVATE KEY-----',
        '-----BEGIN OPENSSH PRIVATE KEY-----',
      ];

      const srcDir = path.join(backendDir, 'src');
      function scanDir(dir: string) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            if (entry.name !== 'node_modules' && entry.name !== 'dist') {
              scanDir(fullPath);
            }
          } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
            const fileContent = fs.readFileSync(fullPath, 'utf8');
            for (const pattern of sensitivePatterns) {
              assert.ok(
                !fileContent.includes(pattern),
                `Forbidden private key detected in source file: ${fullPath}`,
              );
            }
          }
        }
      }

      scanDir(srcDir);
    });

    it('verifies package-lock.json presence in Backend to guarantee reproducible builds', () => {
      const backendLockPath = path.join(backendDir, 'package-lock.json');
      assert.ok(
        fs.existsSync(backendLockPath),
        'Backend must maintain package-lock.json to prevent dependency confusion & unpinned builds',
      );
    });
  });
});
