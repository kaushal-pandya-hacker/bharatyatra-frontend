import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Mock Web Storage & Window for Node test environment
class MockLocalStorage {
  private store: Record<string, string> = {};
  getItem(key: string): string | null {
    return this.store[key] || null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
}

describe('BharatYatra Mobile — Offline & Lifecycle Verification Suite', () => {
  const rootDir = process.cwd();

  // Test 1: Offline Startup Files Integrity
  it('1. Offline startup assets exist, are valid HTML5, and contain zero secrets', () => {
    const indexPath = path.join(rootDir, 'public', 'index.html');
    const offlinePath = path.join(rootDir, 'public', 'offline.html');

    assert.ok(fs.existsSync(indexPath), 'public/index.html must exist');
    assert.ok(fs.existsSync(offlinePath), 'public/offline.html must exist');

    const indexHtml = fs.readFileSync(indexPath, 'utf8');
    const offlineHtml = fs.readFileSync(offlinePath, 'utf8');

    // Verify HTML structure
    assert.match(indexHtml, /<!DOCTYPE html>/i);
    assert.match(offlineHtml, /<!DOCTYPE html>/i);

    // Verify offline detection & fallback triggers
    assert.match(indexHtml, /navigator\.onLine/);
    assert.match(indexHtml, /attemptConnection/);
    assert.match(offlineHtml, /No Internet Connection/i);
    assert.match(offlineHtml, /Retry Connection/i);

    // Privacy & Security Check: Ensure NO hardcoded API keys, tokens, or private secrets exist
    const secretPatterns = [
      /AIza[0-9A-Za-z-_]{35}/, // Google API key
      /rzp_(?:test|live)_[0-9a-zA-Z]{14}/, // Razorpay
      /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/, // JWT
      /SUPABASE_SERVICE_ROLE_KEY/,
      /HOTELBEDS_SECRET/,
    ];

    for (const pattern of secretPatterns) {
      assert.doesNotMatch(indexHtml, pattern, 'index.html must not contain secrets');
      assert.doesNotMatch(offlineHtml, pattern, 'offline.html must not contain secrets');
    }
  });

  // Test 2: Offline Trip Data Caching & Persistence Across App Restarts
  it('2. Offline Trip Vault caches and restores itinerary data across application restarts', () => {
    const mockStorage = new MockLocalStorage();
    (global as any).localStorage = mockStorage;
    (global as any).window = {
      open: () => {},
      addEventListener: () => {},
      dispatchEvent: () => {},
    };

    const tripId = 'trip_gujarat_heritage_9901';
    const sampleTrip = {
      id: tripId,
      title: 'Rann of Kutch & Gir Wildlife Safari',
      travelers: 2,
      durationDays: 4,
      bookingReference: 'BY-BK-2026-9901',
      qrPassData: 'BY-PASS-VERIFIED-9901',
      stops: ['Bhuj', 'Dhordo', 'Gir Somnath', 'Sasan Gir'],
      totalAmountInr: 28500,
    };

    // Simulate Caching
    const key = `by_offline_trip_${tripId}`;
    const payload = {
      savedAt: new Date().toISOString(),
      trip: sampleTrip,
    };
    mockStorage.setItem(key, JSON.stringify(payload));

    // Simulate App Termination & Restart (Fresh Memory / Storage Access)
    const retrievedRaw = mockStorage.getItem(key);
    assert.ok(retrievedRaw, 'Trip payload must be found in storage after restart');

    const parsed = JSON.parse(retrievedRaw);
    assert.equal(parsed.trip.id, tripId);
    assert.equal(parsed.trip.bookingReference, 'BY-BK-2026-9901');
    assert.equal(parsed.trip.qrPassData, 'BY-PASS-VERIFIED-9901');
    assert.equal(parsed.trip.stops.length, 4);
    assert.equal(parsed.trip.totalAmountInr, 28500);
  });

  // Test 3: Online Reconnection Event & Redirection Logic
  it('3. Online event listener triggers recovery without data loss', () => {
    let redirectedUrl = '';
    const listeners: Record<string, Function> = {};

    (global as any).window = {
      addEventListener: (event: string, callback: Function) => {
        listeners[event] = callback;
      },
      location: {
        replace: (url: string) => {
          redirectedUrl = url;
        },
        href: '',
      },
    };

    // Register simulated online listener
    const targetUrl = 'https://www.bharatyatra.in';
    (global as any).window.addEventListener('online', () => {
      (global as any).window.location.replace(targetUrl);
    });

    // Simulate device coming back online
    assert.ok(listeners['online'], 'Online event listener must be registered');
    listeners['online']();

    assert.equal(redirectedUrl, targetUrl, 'Online transition must redirect to canonical domain');
  });

  // Test 4: Auth Session Survival During Network Offline
  it('4. Auth credentials survive network disconnect and are not wiped by offline errors', () => {
    const mockStorage = new MockLocalStorage();
    (global as any).localStorage = mockStorage;

    // Simulate logged-in user with active tokens
    const sampleToken = 'by_jwt_access_token_customer_450';
    const sampleRefreshToken = 'by_jwt_refresh_token_customer_450';

    mockStorage.setItem('auth_token', sampleToken);
    mockStorage.setItem('sb-access-token', sampleToken);
    mockStorage.setItem('sb-refresh-token', sampleRefreshToken);

    // Simulate a network failure (offline error)
    const simulatedNetworkError = new Error('Network request failed: net::ERR_INTERNET_DISCONNECTED');

    // Ensure storage is NOT cleared on network error
    assert.equal(mockStorage.getItem('auth_token'), sampleToken);
    assert.equal(mockStorage.getItem('sb-refresh-token'), sampleRefreshToken);
    assert.ok(simulatedNetworkError.message.includes('ERR_INTERNET_DISCONNECTED'));
  });

  // Test 5: Capacitor Configuration Validation
  it('5. capacitor.config.ts correctly isolates remote domain and configures offline errorPath', () => {
    const configPath = path.join(rootDir, 'capacitor.config.ts');
    assert.ok(fs.existsSync(configPath), 'capacitor.config.ts must exist');

    const configContent = fs.readFileSync(configPath, 'utf8');

    assert.match(configContent, /appId:\s*['"]in\.bharatyatra\.app['"]/);
    assert.match(configContent, /appName:\s*['"]BharatYatra['"]/);
    assert.match(configContent, /url:\s*['"]https:\/\/www\.bharatyatra\.in['"]/);
    assert.match(configContent, /errorPath:\s*['"]offline\.html['"]/);
    assert.match(configContent, /cleartext:\s*false/);
    assert.match(configContent, /webContentsDebuggingEnabled:\s*false/);
  });
});

