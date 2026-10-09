import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import { getHBXAuthHeaders } from '../lib/hotels/hbx-auth';
import { HBXHotelProvider } from '../lib/hotels/providers/hbx-hotel-provider';
import { HotelService } from '../lib/hotels/hotel.service';
import { MOCK_HBX_RAW_RESPONSE } from '../lib/hotels/mock-hbx-data';

describe('HBX Hotel API Sandbox Integration & Supplier Abstraction', () => {
  it('1. Generates valid HBX SHA256 HMAC-style auth headers without exposing secrets', () => {
    const apiKey = 'test_api_key_123';
    const apiSecret = 'test_secret_456';
    const headers = getHBXAuthHeaders(apiKey, apiSecret);

    assert.strictEqual(headers['Api-key'], apiKey);
    assert.ok(headers['X-Signature']);
    assert.strictEqual(typeof headers['X-Signature'], 'string');
    assert.strictEqual(headers['X-Signature'].length, 64); // SHA256 hex length
    assert.strictEqual(headers['Accept'], 'application/json');
    assert.strictEqual(headers['Content-Type'], 'application/json');
  });

  it('2. Normalizes raw HBX response into clean BharatYatra NormalizedHotel schema', () => {
    const provider = new HBXHotelProvider();
    const normalized = provider.normalizeHBXResponse(MOCK_HBX_RAW_RESPONSE, 'Ahmedabad');

    assert.ok(Array.isArray(normalized));
    assert.strictEqual(normalized.length, 3);

    const firstHotel = normalized[0];
    assert.strictEqual(firstHotel.hotelId, '105432');
    assert.strictEqual(firstHotel.name, 'Hyatt Regency Ahmedabad');
    assert.strictEqual(firstHotel.category, '5 STARS');
    assert.strictEqual(firstHotel.price, 12500);
    assert.strictEqual(firstHotel.currency, 'INR');
    assert.strictEqual(firstHotel.provider, 'HBX');
    assert.ok(firstHotel.rateKey.includes('105432'));
  });

  it('3. Preserves original HBX rateKey for subsequent booking operations', () => {
    const provider = new HBXHotelProvider();
    const normalized = provider.normalizeHBXResponse(MOCK_HBX_RAW_RESPONSE, 'Gir Somnath');

    const girHotel = normalized.find((h) => h.hotelId === '105433');
    assert.ok(girHotel);
    assert.ok(girHotel.rateKey);
    assert.strictEqual(girHotel.name, 'Taj Gateway Resort Sasan Gir');
    assert.strictEqual(girHotel.board, 'FULL BOARD (ALL MEALS)');
  });

  it('4. HotelService orchestrates supplier abstraction cleanly', async () => {
    const provider = new HBXHotelProvider();
    const service = new HotelService(provider);

    assert.strictEqual(service.getProviderName(), 'HBX');

    const results = await service.searchHotels({
      destination: 'Ahmedabad',
      checkIn: '2026-10-15',
      checkOut: '2026-10-18',
      rooms: 1,
      adults: 2,
    });

    assert.ok(Array.isArray(results));
    assert.ok(results.length > 0);
    assert.strictEqual(results[0].provider, 'HBX');
  });

  it('5. Handles CheckRate and Sandbox Booking stubs without quota consumption', async () => {
    const service = new HotelService();
    const mockRateKey = MOCK_HBX_RAW_RESPONSE.hotels.hotels[0].rooms[0].rates[0].rateKey;

    const rateResult = await service.checkRate({ rateKey: mockRateKey });
    assert.strictEqual(rateResult.status, 'AVAILABLE');

    const bookingResult = await service.bookHotel({
      rateKey: mockRateKey,
      holder: {
        name: 'Kaushal',
        surname: 'Pandya',
        email: 'kaushal@example.com',
        phone: '+919876543210',
      },
    });

    assert.strictEqual(bookingResult.status, 'TEST_ONLY');
    assert.ok(bookingResult.bookingId.startsWith('HBX-TEST-'));
  });
});
