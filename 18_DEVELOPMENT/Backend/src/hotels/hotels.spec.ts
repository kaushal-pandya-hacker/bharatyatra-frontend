import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HotelsService } from './hotels.service';
import { HotelsController } from './hotels.controller';
import { HotelbedsHotelProvider } from '../providers/hotelbeds/hotelbeds-hotel.provider';
import { HotelbedsClientService } from '../providers/hotelbeds/hotelbeds-client.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('Hotelbeds Hotel Integration Test Suite (16 Lifecycle Scenarios)', () => {
  let service: HotelsService;
  let provider: HotelbedsHotelProvider;
  let clientService: HotelbedsClientService;

  const mockPrismaService = {
    hotelSearchRecord: {
      create: jest.fn().mockResolvedValue({ id: 'search-123' }),
    },
    booking: {
      create: jest.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          id: 'booking-uuid-123',
          bookingReference: data.bookingReference,
          status: data.status,
          startDate: data.startDate,
          endDate: data.endDate,
          guestCount: data.guestCount,
          totalAmountInr: data.totalAmountInr,
          currency: data.currency,
          createdAt: new Date(),
          hotelDetail: {
            supplierReference: data.hotelDetail.create.supplierReference,
            hotelCode: data.hotelDetail.create.hotelCode,
            hotelName: data.hotelDetail.create.hotelName,
            roomName: data.hotelDetail.create.roomName,
            boardName: data.hotelDetail.create.boardName,
            rateKey: data.hotelDetail.create.rateKey,
            cancellationPolicy: data.hotelDetail.create.cancellationPolicy,
            guests: [
              {
                id: 'guest-1',
                firstName: 'Kaushal',
                lastName: 'Pandya',
              },
            ],
          },
        }),
      ),
      findFirst: jest.fn().mockImplementation(({ where }) => {
        if (where?.idempotencyKey === 'IDEM_DUP_KEY_123') {
          return Promise.resolve({
            id: 'existing-booking-id',
            bookingReference: 'CF-HTL-EXISTING',
            status: 'CONFIRMED',
            totalAmountInr: 9600,
            currency: 'INR',
            createdAt: new Date(),
            hotelDetail: { supplierReference: 'HBX-REF-EXISTING', guests: [] },
          });
        }
        if (where?.OR?.[0]?.id === 'invalid-booking') return Promise.resolve(null);
        if (where?.OR?.[0]?.id === 'CF-HTL-TEST-REF' || where?.OR?.[1]?.bookingReference === 'CF-HTL-TEST-REF') {
          return Promise.resolve({
            id: 'booking-uuid-123',
            bookingReference: 'CF-HTL-TEST-REF',
            status: 'CONFIRMED',
            hotelDetail: {
              supplierReference: 'HBX-REF-998877',
            },
          });
        }
        return Promise.resolve(null);
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'b-1',
          bookingReference: 'CF-HTL-1',
          bookingType: 'HOTEL',
          status: 'CONFIRMED',
          hotelDetail: { hotelName: 'Hyatt Regency Ahmedabad' },
        },
      ]),
      update: jest.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          id: 'booking-uuid-123',
          bookingReference: 'CF-HTL-TEST-REF',
          status: data.status,
          cancelledAt: data.cancelledAt,
        }),
      ),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HotelsController],
      providers: [
        HotelsService,
        HotelbedsHotelProvider,
        HotelbedsClientService,
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
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<HotelsService>(HotelsService);
    provider = module.get<HotelbedsHotelProvider>(HotelbedsHotelProvider);
    clientService = module.get<HotelbedsClientService>(HotelbedsClientService);
  });

  describe('1. Authentication & Signature Generation', () => {
    it('should generate valid SHA256 signature and headers', () => {
      const headers = clientService.getAuthHeaders();
      expect(headers['Api-key']).toBe('7b6104baaa08b6bb38a84ff5f006323c');
      expect(headers['X-Signature']).toBeDefined();
      expect(headers['X-Signature'].length).toBe(64);
    });
  });

  describe('2. Search & Search Validation', () => {
    it('should execute successful hotel search', async () => {
      const results = await service.searchHotels({ destination: 'Ahmedabad' });
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle search with empty destination by applying default fallbacks', async () => {
      const results = await service.searchHotels({});
      expect(results).toBeDefined();
      expect(results[0].destination).toBe('Ahmedabad');
    });
  });

  describe('3. Hotel Details Retrieval', () => {
    it('should fetch hotel details by code', async () => {
      const details = await service.getHotelDetails('105432');
      expect(details).toBeDefined();
      expect(details.hotelId).toBe('105432');
    });
  });

  describe('4. Room Selection & Rate Recheck', () => {
    it('should recheck rate availability', async () => {
      const rateRes = await service.checkRate('RATE_KEY_123');
      expect(rateRes.status).toBe('AVAILABLE');
      expect(rateRes.netPrice).toBeGreaterThan(0);
    });
  });

  describe('5. Price Change & Room Unavailable Handling', () => {
    it('should return priceChanged flag if rate has updated and user has not accepted', async () => {
      jest.spyOn(service, 'checkRate').mockResolvedValueOnce({
        status: 'PRICE_CHANGED',
        rateKey: 'RATE_KEY_UPDATED',
        netPrice: 7500,
        currency: 'INR',
        cancellationPolicy: 'Standard',
      });

      const res: any = await service.createBooking('user-1', {
        rateKey: 'RATE_KEY_OLD',
        hotelCode: '105432',
        hotelName: 'Hyatt Regency',
        checkIn: '2026-10-15',
        checkOut: '2026-10-17',
        roomName: 'Deluxe',
        boardName: 'BB',
        price: 6500,
        acceptPriceChange: false,
        holder: { name: 'Kaushal', surname: 'Pandya', email: 'test@example.com', phone: '9999999999' },
        paxDetails: [{ type: 'AD', name: 'Kaushal', surname: 'Pandya' }],
      });

      expect(res.priceChanged).toBe(true);
      expect(res.newPrice).toBe(7500);
    });

    it('should throw BadRequestException if room is unavailable', async () => {
      jest.spyOn(service, 'checkRate').mockResolvedValueOnce({
        status: 'UNAVAILABLE',
        rateKey: '',
        netPrice: 0,
        currency: 'INR',
        cancellationPolicy: 'N/A',
      });

      await expect(
        service.createBooking('user-1', {
          rateKey: 'EXPIRED_KEY',
          hotelCode: '105432',
          hotelName: 'Hyatt Regency',
          checkIn: '2026-10-15',
          checkOut: '2026-10-17',
          roomName: 'Deluxe',
          boardName: 'BB',
          price: 6500,
          holder: { name: 'Kaushal', surname: 'Pandya', email: 'test@example.com', phone: '9999999999' },
          paxDetails: [],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('6. Guest Manifest & Booking Validation', () => {
    it('should throw error if rateKey is missing', async () => {
      await expect(
        service.createBooking('user-1', {
          rateKey: '',
          hotelCode: '105432',
          hotelName: 'Hyatt Regency',
          checkIn: '2026-10-15',
          checkOut: '2026-10-17',
          roomName: 'Deluxe',
          boardName: 'BB',
          price: 6500,
          holder: { name: 'Kaushal', surname: 'Pandya', email: 'test@example.com', phone: '9999999999' },
          paxDetails: [],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('7. Booking Creation & Idempotency', () => {
    it('should execute booking and persist record to DB', async () => {
      const booking = await service.createBooking('user-1', {
        rateKey: 'VALID_KEY',
        hotelCode: '105432',
        hotelName: 'Hyatt Regency Ahmedabad',
        checkIn: '2026-10-15',
        checkOut: '2026-10-17',
        roomName: 'Deluxe Room',
        boardName: 'Breakfast Included',
        price: 9600,
        holder: { name: 'Kaushal', surname: 'Pandya', email: 'kaushal@example.com', phone: '9876543210' },
        paxDetails: [{ type: 'AD', name: 'Kaushal', surname: 'Pandya' }],
      });

      expect(booking).toBeDefined();
      expect(booking.status).toBe('CONFIRMED');
    });

    it('should return existing booking when identical idempotency key is submitted', async () => {
      const res: any = await service.createBooking(
        'user-1',
        {
          rateKey: 'VALID_KEY',
          hotelCode: '105432',
          hotelName: 'Hyatt Regency Ahmedabad',
          checkIn: '2026-10-15',
          checkOut: '2026-10-17',
          roomName: 'Deluxe Room',
          boardName: 'Breakfast Included',
          price: 9600,
          holder: { name: 'Kaushal', surname: 'Pandya', email: 'kaushal@example.com', phone: '9876543210' },
          paxDetails: [{ type: 'AD', name: 'Kaushal', surname: 'Pandya' }],
        },
        'IDEM_DUP_KEY_123',
      );

      expect(res.idempotent).toBe(true);
      expect(res.bookingReference).toBe('CF-HTL-EXISTING');
    });
  });

  describe('8. My Bookings & Cancellation Workflow', () => {
    it('should retrieve user hotel bookings list', async () => {
      const list = await service.getUserHotelBookings('user-1');
      expect(list).toBeDefined();
      expect(list.length).toBeGreaterThan(0);
    });

    it('should cancel booking and update status', async () => {
      const res = await service.cancelBooking('user-1', 'CF-HTL-TEST-REF');
      expect(res.status).toBe('CANCELLED');
    });

    it('should handle duplicate cancellation safely', async () => {
      jest.spyOn(mockPrismaService.booking, 'findFirst').mockResolvedValueOnce({
        id: 'booking-uuid-123',
        bookingReference: 'CF-HTL-CANCELLED-ALREADY',
        status: 'CANCELLED',
      });

      const res = await service.cancelBooking('user-1', 'CF-HTL-CANCELLED-ALREADY');
      expect(res.status).toBe('CANCELLED');
      expect(res.message).toContain('already cancelled');
    });
  });

  describe('9. Credential Protection', () => {
    it('should never expose raw secret keys in log outputs', () => {
      const logSpy = jest.spyOn((clientService as any).logger, 'log');
      clientService.request('/hotel-api/1.0/hotels', 'POST', { test: true });

      for (const call of logSpy.mock.calls) {
        expect(call[0]).not.toContain('apVQNw8hvS');
      }
    });
  });
});
