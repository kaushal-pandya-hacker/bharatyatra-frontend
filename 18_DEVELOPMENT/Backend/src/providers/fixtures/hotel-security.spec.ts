import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { HotelsService } from '../../hotels/hotels.service';
import { HotelbedsHotelProvider } from '../hotelbeds/hotelbeds-hotel.provider';
import { HotelbedsClientService } from '../hotelbeds/hotelbeds-client.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('Hotel Booking Security & Idempotency Tests', () => {
  let hotelsService: HotelsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    hotelSearchRecord: {
      create: jest.fn().mockResolvedValue({ id: 'srch-1' }),
    },
    booking: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(undefined) } },
        HotelsService,
        HotelbedsHotelProvider,
        HotelbedsClientService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    hotelsService = module.get<HotelsService>(HotelsService);

    prisma = module.get<PrismaService>(PrismaService);
  });

  it('1. Price manipulation defense: Should reject tampered low-ball fare payload', async () => {
    mockPrismaService.booking.findFirst.mockResolvedValue(null);

    await expect(
      hotelsService.createBooking('user-123', {
        rateKey: 'HBX_RATEKEY_HYATT_105432_DELUXE_BB',
        hotelCode: '105432',
        hotelName: 'Hyatt Regency Ahmedabad',
        checkIn: '2026-10-15',
        checkOut: '2026-10-17',
        roomName: 'Deluxe Room',
        boardName: 'Breakfast Included',
        price: 1.0, // Tampered client fare
        holder: { name: 'Fake', surname: 'Hacker', email: 'hacker@test.com', phone: '0000000000' },
        paxDetails: [{ type: 'AD', name: 'Fake', surname: 'Hacker' }],
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('2. Idempotency protection: Duplicate submission with same idempotency key returns existing booking', async () => {
    const mockExistingBooking = {
      id: 'existing-booking-id-123',
      bookingReference: 'CF-HOTEL-20261015-9999',
      status: 'CONFIRMED',
      totalAmountInr: 9600,
      currency: 'INR',
      createdAt: new Date().toISOString(),
      hotelDetail: {
        supplierReference: 'HBX-SUP-888',
        guests: [{ firstName: 'Kaushal', lastName: 'Pandya' }],
      },
    };

    mockPrismaService.booking.findFirst.mockResolvedValue(mockExistingBooking);

    const res = await hotelsService.createBooking(
      'user-123',
      {
        rateKey: 'HBX_RATEKEY_HYATT_105432_DELUXE_BB',
        hotelCode: '105432',
        hotelName: 'Hyatt Regency Ahmedabad',
        checkIn: '2026-10-15',
        checkOut: '2026-10-17',
        roomName: 'Deluxe Room',
        boardName: 'Breakfast Included',
        price: 9600,
        holder: { name: 'Kaushal', surname: 'Pandya', email: 'kaushal@test.com', phone: '9876543210' },
        paxDetails: [{ type: 'AD', name: 'Kaushal', surname: 'Pandya' }],
      },
      'IDEM-KEY-DUPLICATE-999',
    );

    expect(res).toBeDefined();
    expect(res.chaloFarvaBookingId).toBe('existing-booking-id-123');
    expect(res.idempotent).toBe(true);
    expect(mockPrismaService.booking.create).not.toHaveBeenCalled();
  });

  it('3. Provider health check should not expose API keys or credentials', async () => {
    const health = await hotelsService.getHealthCheck();
    expect(health.providerId).toBe('prov-hotelbeds-hbx');
    expect(health.status).toBe('HEALTHY');
    expect((health as any).apiKey).toBeUndefined();
    expect((health as any).secret).toBeUndefined();
  });
});
