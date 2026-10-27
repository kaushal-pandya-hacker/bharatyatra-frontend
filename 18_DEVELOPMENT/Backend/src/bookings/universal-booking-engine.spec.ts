import { Test, TestingModule } from '@nestjs/testing';
import { UniversalBookingEngineService } from './universal-booking-engine.service';
import { UniversalProviderRegistry } from '../providers/registry/universal-provider.registry';
import { HotelbedsProviderAdapter } from '../providers/hotelbeds/hotelbeds-provider.adapter';
import { HotelbedsHotelProvider } from '../providers/hotelbeds/hotelbeds-hotel.provider';
import { HotelbedsClientService } from '../providers/hotelbeds/hotelbeds-client.service';
import { TboFlightAdapter } from '../providers/flights/tbo-flight.provider.adapter';
import { EtravelsmartBusAdapter } from '../providers/buses/etravelsmart-bus.provider.adapter';
import { TrainProviderAdapter } from '../providers/trains/train-provider.adapter';
import { PricingEngineService } from '../pricing/pricing-engine.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('Universal Booking Engine Test Suite', () => {
  let service: UniversalBookingEngineService;
  let registry: UniversalProviderRegistry;
  let pricingEngine: PricingEngineService;

  const mockPrismaService = {
    hotelSearchRecord: {
      create: jest.fn().mockResolvedValue({ id: 'search-1' }),
    },
    booking: {
      create: jest.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          id: 'uni-booking-123',
          bookingReference: data.bookingReference,
          bookingType: data.bookingType,
          status: data.status,
          totalAmountInr: data.totalAmountInr,
          currency: data.currency,
          createdAt: new Date(),
          hotelDetail: { supplierReference: 'HBX-UNI-99', guests: [] },
        }),
      ),
      findFirst: jest.fn().mockImplementation(({ where }) => {
        if (where?.idempotencyKey === 'IDEM_UNI_EXISTS') {
          return Promise.resolve({
            id: 'uni-existing-id',
            bookingReference: 'CF-HOT-EXISTING',
            bookingType: 'HOTEL',
            status: 'CONFIRMED',
            totalAmountInr: 9600,
            currency: 'INR',
            createdAt: new Date(),
            hotelDetail: { supplierReference: 'HBX-UNI-EXISTING', guests: [] },
          });
        }
        if (where?.OR?.[0]?.id === 'invalid-booking') return Promise.resolve(null);
        if (where?.OR?.[0]?.id === 'CF-HOT-12345' || where?.OR?.[1]?.bookingReference === 'CF-HOT-12345') {
          return Promise.resolve({
            id: 'uni-booking-123',
            bookingReference: 'CF-HOT-12345',
            bookingType: 'HOTEL',
            status: 'CONFIRMED',
            currency: 'INR',
            hotelDetail: { supplierReference: 'HBX-UNI-99' },
          });
        }
        return Promise.resolve(null);
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'b-1',
          bookingReference: 'CF-HOT-12345',
          bookingType: 'HOTEL',
          status: 'CONFIRMED',
        },
      ]),
      update: jest.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          id: 'uni-booking-123',
          bookingReference: 'CF-HOT-12345',
          status: data.status,
        }),
      ),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UniversalBookingEngineService,
        UniversalProviderRegistry,
        HotelbedsProviderAdapter,
        HotelbedsHotelProvider,
        HotelbedsClientService,
        TboFlightAdapter,
        EtravelsmartBusAdapter,
        TrainProviderAdapter,
        PricingEngineService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'HBX_API_KEY') return '7b6104baaa08b6bb38a84ff5f006323c';
              if (key === 'HBX_API_SECRET') return 'apVQNw8hvS';
              if (key === 'HBX_BASE_URL') return 'https://api.test.hotelbeds.com';
              return null;
            }),
          },
        },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UniversalBookingEngineService>(UniversalBookingEngineService);
    registry = module.get<UniversalProviderRegistry>(UniversalProviderRegistry);
    pricingEngine = module.get<PricingEngineService>(PricingEngineService);
  });

  describe('1. Provider Resolution', () => {
    it('should resolve Hotelbeds adapter for HOTEL product type', () => {
      const provider = registry.getProvider('HOTEL');
      expect(provider).toBeDefined();
      expect(provider.providerName).toContain('Hotelbeds');
    });

    it('should throw NotFoundException if product type has no registered provider', () => {
      expect(() => registry.getProvider('TRANSFER', 'unregistered-id')).toThrow(NotFoundException);
    });
  });

  describe('2. Universal Search Normalization', () => {
    it('should execute universal search and return normalized results', async () => {
      const result = await service.search({
        productType: 'HOTEL',
        destination: 'Ahmedabad',
        checkIn: '2026-10-15',
        checkOut: '2026-10-17',
      });

      expect(result).toBeDefined();
      expect(result.productType).toBe('HOTEL');
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items[0].minPrice).toBeDefined();
    });
  });

  describe('3. Pricing Engine Calculations', () => {
    it('should calculate customer price using rule engine (Net + Markup + Tax)', () => {
      pricingEngine.addOrUpdateRule({
        id: 'test-markup-rule',
        productType: 'HOTEL',
        pricingModel: 'NET_MARKUP',
        commissionRatePercent: 0,
        markupAmountInr: 500,
        taxRatePercent: 10,
        feeAmountInr: 50,
        currency: 'INR',
        isEnabled: true,
      });

      const calculated = pricingEngine.calculateCustomerPrice(4500, 'HOTEL');
      // Subtotal = 4500 + 500 + 50 = 5050. Tax 10% = 505. Total = 5555.
      expect(calculated.totalCustomerPrice).toBe(5555);
      expect(calculated.markupAmount).toBe(500);
      expect(calculated.taxAmount).toBe(505);
    });
  });

  describe('4. Rate Recheck & Price Change Handling', () => {
    it('should handle AVAILABLE rate check', async () => {
      const check = await service.checkPrice({ rateKey: 'RATE_KEY_123', productType: 'HOTEL' });
      expect(check.status).toBe('AVAILABLE');
      expect(check.netPrice).toBeGreaterThan(0);
    });

    it('should return priceChanged response when rate updates and acceptPriceChange is false', async () => {
      jest.spyOn(service, 'checkPrice').mockResolvedValueOnce({
        status: 'PRICE_CHANGED',
        rateKey: 'RATE_KEY_UPDATED',
        netPrice: 7500,
        currency: 'INR',
        cancellationPolicy: 'Standard',
      });

      const res = await service.createBooking('user-1', {
        rateKey: 'OLD_KEY',
        productType: 'HOTEL',
        productId: '105432',
        productName: 'Hyatt Regency',
        checkIn: '2026-10-15',
        checkOut: '2026-10-17',
        rateName: 'Deluxe',
        price: 6500,
        acceptPriceChange: false,
        holder: { name: 'Kaushal', surname: 'Pandya', email: 'test@example.com', phone: '9999999999' },
        paxDetails: [{ type: 'AD', name: 'Kaushal', surname: 'Pandya' }],
      });

      expect(res.priceChanged).toBe(true);
      expect(res.newPrice).toBe(7500);
    });
  });

  describe('5. Idempotency Protection', () => {
    it('should return existing booking when identical idempotency key is submitted', async () => {
      const res = await service.createBooking(
        'user-1',
        {
          rateKey: 'VALID_KEY',
          productType: 'HOTEL',
          productId: '105432',
          productName: 'Hyatt Regency',
          checkIn: '2026-10-15',
          checkOut: '2026-10-17',
          rateName: 'Deluxe',
          price: 9600,
          holder: { name: 'Kaushal', surname: 'Pandya', email: 'test@example.com', phone: '9999999999' },
          paxDetails: [{ type: 'AD', name: 'Kaushal', surname: 'Pandya' }],
        },
        'IDEM_UNI_EXISTS',
      );

      expect(res.idempotent).toBe(true);
      expect(res.bookingReference).toBe('CF-HOT-EXISTING');
    });
  });

  describe('6. Universal Booking Creation', () => {
    it('should execute booking and persist record in Prisma DB', async () => {
      const booking = await service.createBooking('user-1', {
        rateKey: 'RATE_KEY_UNI',
        productType: 'HOTEL',
        productId: '105432',
        productName: 'Hyatt Regency Ahmedabad',
        checkIn: '2026-10-15',
        checkOut: '2026-10-17',
        rateName: 'Deluxe Heritage Room',
        boardName: 'Breakfast Included',
        price: 9600,
        holder: { name: 'Kaushal', surname: 'Pandya', email: 'kaushal@example.com', phone: '9876543210' },
        paxDetails: [{ type: 'AD', name: 'Kaushal', surname: 'Pandya' }],
      });

      expect(booking).toBeDefined();
      expect(booking.status).toBe('CONFIRMED');
      expect(booking.supplierReference).toBeDefined();
    });
  });

  describe('7. Universal Cancellation', () => {
    it('should route cancellation to Hotelbeds adapter and update DB state', async () => {
      const res = await service.cancelBooking('user-1', {
        bookingIdOrReference: 'CF-HOT-12345',
        reason: 'Customer requested',
      });

      expect(res.status).toBe('CANCELLED');
    });
  });
});
