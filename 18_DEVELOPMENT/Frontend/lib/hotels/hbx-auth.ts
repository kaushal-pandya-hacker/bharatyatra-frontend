import crypto from 'crypto';

export interface HBXAuthHeaders {
  'Api-key': string;
  'X-Signature': string;
  'Accept': string;
  'Content-Type': string;
  'Accept-Encoding': string;
}

/**
 * Generates official HBX Group (Hotelbeds) authentication headers.
 * SHA256 Signature = SHA256(apiKey + apiSecret + timestampInSeconds)
 * NEVER expose credentials to client-side JS.
 */
export function getHBXAuthHeaders(customKey?: string, customSecret?: string): HBXAuthHeaders {
  const apiKey = customKey || process.env.HBX_API_KEY || '7b6104baaa08b6bb38a84ff5f006323c';
  const apiSecret = customSecret || process.env.HBX_API_SECRET || 'apVQNw8hvS';

  if (!apiKey || !apiSecret) {
    throw new Error('HBX Group API credentials (HBX_API_KEY, HBX_API_SECRET) are not configured.');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const dataToHash = apiKey + apiSecret + timestamp;
  const signature = crypto.createHash('sha256').update(dataToHash).digest('hex');

  return {
    'Api-key': apiKey,
    'X-Signature': signature,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Accept-Encoding': 'gzip',
  };
}

/**
 * Helper to get configured HBX base URL (defaults to test environment)
 */
export function getHBXBaseUrl(): string {
  return process.env.HBX_BASE_URL || 'https://api.test.hotelbeds.com';
}
