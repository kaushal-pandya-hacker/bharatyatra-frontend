import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HotelbedsProviderAdapter } from '../hotelbeds/hotelbeds-provider.adapter';
import { HotelbedsHotelProvider } from '../hotelbeds/hotelbeds-hotel.provider';
import { HotelbedsClientService } from '../hotelbeds/hotelbeds-client.service';

describe('Hotelbeds Provider Contract Specification Tests', () => {
  let hotelbedsAdapter: HotelbedsProviderAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(undefined) } },
        HotelbedsClientService,
        HotelbedsHotelProvider,
        HotelbedsProviderAdapter,
      ],
    }).compile();

    hotelbedsAdapter = module.get<HotelbedsProviderAdapter>(HotelbedsProviderAdapter);
  });


  it('1. Search contract should return normalized hotel items with room rates', async () => {
    const res = await hotelbedsAdapter.search({
      productType: 'HOTEL',
      destination: 'Ahmedabad',
      checkIn: '2026-10-15',
      checkOut: '2026-10-19',
      rooms: 1,
      adults: 2,
    });

    expect(res).toBeDefined();
    expect(res.productType).toBe('HOTEL');
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.items[0].name).toBeDefined();
    expect(res.items[0].minPrice).toBeGreaterThan(0);
    expect(res.items[0].availableRates).toBeDefined();
    expect(res.items[0].availableRates.length).toBeGreaterThan(0);
  });

  it('2. Details contract should return complete hotel metadata and facilities', async () => {
    const details = await hotelbedsAdapter.getDetails('105432');
    expect(details).toBeDefined();
    expect(details?.id).toBe('105432');
    expect(details?.starRating).toBeGreaterThanOrEqual(1);
    expect(details?.facilities).toBeDefined();
    expect(details?.facilities.length).toBeGreaterThan(0);
    expect(details?.rates).toBeDefined();
  });

  it('3. Price check contract should revalidate rate availability', async () => {
    const check = await hotelbedsAdapter.checkPrice({
      productId: '105432',
      rateKey: 'HBX_RATEKEY_HYATT_105432_DELUXE_BB',
    });

    expect(check).toBeDefined();
    expect(check.status).toBe('AVAILABLE');
    expect(check.netPrice).toBeGreaterThan(0);
    expect(check.currency).toBe('INR');
  });

  it('4. Booking contract fixture should generate confirmation reference and holder details', async () => {
    const booking = await hotelbedsAdapter.createBooking({
      productType: 'HOTEL',
      productId: '105432',
      productName: 'Hyatt Regency Ahmedabad',
      checkIn: '2026-10-15',
      checkOut: '2026-10-19',
      rateKey: 'HBX_RATEKEY_HYATT_105432_DELUXE_BB',
      rateName: 'Deluxe Room',
      boardName: 'Breakfast Included',
      price: 9600,
      currency: 'INR',
      holder: {
        name: 'Kaushal',
        surname: 'Pandya',
        email: 'kaushal@bharatyatra.com',
        phone: '+919876543210',
      },
      paxDetails: [
        { type: 'AD', name: 'Kaushal', surname: 'Pandya' },
        { type: 'AD', name: 'Pooja', surname: 'Pandya' },
      ],
      idempotencyKey: 'CF-TEST-IDEM-001',
    });

    expect(booking).toBeDefined();
    expect(booking.supplierReference).toBeDefined();
    expect(booking.holderName).toBe('Kaushal Pandya');
    expect(booking.totalPrice).toBeGreaterThan(0);
  });

  it('5. Cancellation contract fixture should calculate cancellation fee and status', async () => {
    const cancelRes = await hotelbedsAdapter.cancelBooking({
      bookingIdOrReference: 'HBX-REF-100200',
      simulation: true,
    });

    expect(cancelRes).toBeDefined();
    expect(cancelRes.status).toBe('CANCELLED');
    expect(cancelRes.cancellationFee).toBe(0);
    expect(cancelRes.currency).toBe('INR');
  });
});
