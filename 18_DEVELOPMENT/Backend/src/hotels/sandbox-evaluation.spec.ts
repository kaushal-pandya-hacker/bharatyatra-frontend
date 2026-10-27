import { ConfigService } from '@nestjs/config';
import { HotelbedsClientService } from '../providers/hotelbeds/hotelbeds-client.service';
import { HotelbedsHotelProvider } from '../providers/hotelbeds/hotelbeds-hotel.provider';

describe('Real Hotelbeds Sandbox API Handshake Test', () => {
  it('performs live HTTP request to api.test.hotelbeds.com with saved credentials', async () => {
    const configService = new ConfigService({
      HBX_API_KEY: process.env.HBX_API_KEY || '7b6104baaa08b6bb38a84ff5f006323c',
      HBX_API_SECRET: process.env.HBX_API_SECRET || 'apVQNw8hvS',
      HBX_BASE_URL: process.env.HBX_BASE_URL || 'https://api.test.hotelbeds.com',
    });

    const client = new HotelbedsClientService(configService);
    const provider = new HotelbedsHotelProvider(client);

    console.log('[REAL SANDBOX TEST] Contacting https://api.test.hotelbeds.com...');
    const results = await provider.searchHotels({
      destination: 'Ahmedabad',
      checkIn: '2026-11-10',
      checkOut: '2026-11-12',
      rooms: 1,
      adults: 2,
    });

    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    console.log(`[REAL SANDBOX TEST SUCCESS] Successfully queried Hotelbeds Sandbox API! Returned ${results.length} normalized hotels.`);
  }, 15000);
});
