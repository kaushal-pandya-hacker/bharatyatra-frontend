import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HotelsService } from '../../hotels/hotels.service';
import { HotelbedsHotelProvider } from '../hotelbeds/hotelbeds-hotel.provider';
import { HotelbedsClientService } from '../hotelbeds/hotelbeds-client.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('Hotel Booking End-to-End Workflow Specification', () => {
  let hotelsService: HotelsService;

  const mockPrismaService = {
    hotelSearchRecord: {
      create: jest.fn().mockResolvedValue({ id: 'srch-1' }),
    },
    booking: {
      findFirst: jest.fn(),
      create: jest.fn().mockImplementation((args: any) =>
        Promise.resolve({
          id: 'booking-uuid-100',
          bookingReference: args.data.bookingReference,
          userId: args.data.userId,
          status: 'CONFIRMED',
          totalAmountInr: args.data.totalAmountInr,
          currency: args.data.currency,
          createdAt: new Date().toISOString(),
          hotelDetail: {
            supplierReference: args.data.hotelDetail.create.supplierReference,
            guests: args.data.hotelDetail.create.guests.create,
          },
        }),
      ),
      update: jest.fn().mockImplementation((args: any) =>
        Promise.resolve({
          id: args.where.id,
          bookingReference: 'CF-HOTEL-20261015-1000',
          status: args.data.status,
          cancelledAt: args.data.cancelledAt,
          cancellationReason: args.data.cancellationReason,
          hotelDetail: { supplierReference: 'HBX-REF-999' },
        }),
      ),
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
  });

  it('1. Step 1: Destination Search should return normalized hotel list', async () => {
    const searchResults = await hotelsService.searchHotels({
      destination: 'Ahmedabad',
      checkIn: '2026-10-15',
      checkOut: '2026-10-19',
      rooms: 1,
      adults: 2,
    });

    expect(searchResults).toBeDefined();
    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults[0].hotelId).toBeDefined();
    expect(searchResults[0].minPrice).toBeGreaterThan(0);
  });

  it('2. Step 2: Hotel details & room selection should return rates', async () => {
    const details = await hotelsService.getHotelDetails('105432');
    expect(details).toBeDefined();
    expect(details.hotelId).toBe('105432');

    const rooms = await hotelsService.getHotelRooms('105432');
    expect(rooms.length).toBeGreaterThan(0);
    expect(rooms[0].rateKey).toBeDefined();
  });

  it('3. Step 3: Server-side pricing calculation should compute room subtotal, 10% taxes, and fees', () => {
    const breakdown = hotelsService.calculateServerPrice({
      rateKey: 'HBX_RATEKEY_HYATT_105432_DELUXE_BB',
      hotelCode: '105432',
      roomPricePerNight: 4000,
      checkIn: '2026-10-15',
      checkOut: '2026-10-19', // 4 nights
      rooms: 1,
    });

    expect(breakdown.nights).toBe(4);
    expect(breakdown.roomRateSubtotal).toBe(16000); // 4000 * 4
    expect(breakdown.taxes).toBe(1600); // 10% of 16000
    expect(breakdown.serviceFee).toBe(100);
    expect(breakdown.totalAmount).toBe(17700);
  });

  it('4. Step 4: Price revalidation should confirm rate availability before checkout', async () => {
    const reval = await hotelsService.revalidatePrice({
      rateKey: 'HBX_RATEKEY_HYATT_105432_DELUXE_BB',
      hotelCode: '105432',
      expectedPrice: 4800,
    });

    expect(reval.available).toBe(true);
    expect(reval.status).toBe('AVAILABLE');
  });

  it('5. Step 5: Complete Booking Creation & Database Persistence', async () => {
    mockPrismaService.booking.findFirst.mockResolvedValue(null);

    const bookingResult = await hotelsService.createBooking('user-456', {
      rateKey: 'HBX_RATEKEY_HYATT_105432_DELUXE_BB',
      hotelCode: '105432',
      hotelName: 'Hyatt Regency Ahmedabad',
      checkIn: '2026-10-15',
      checkOut: '2026-10-19',
      roomName: 'King Deluxe Room',
      boardName: 'Breakfast Included',
      price: 4800,
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
    });

    expect(bookingResult).toBeDefined();
    expect(bookingResult.bookingReference).toContain('CF-HOTEL');
    expect(bookingResult.status).toBe('CONFIRMED');
    expect(bookingResult.supplierReference).toBeDefined();
  });

  it('6. Step 6: Booking Cancellation should trigger supplier cancellation and update DB status', async () => {
    mockPrismaService.booking.findFirst.mockResolvedValue({
      id: 'booking-uuid-100',
      bookingReference: 'CF-HOTEL-20261015-1000',
      status: 'CONFIRMED',
      currency: 'INR',
      hotelDetail: { supplierReference: 'HBX-REF-999' },
    });

    const cancelRes = await hotelsService.cancelBooking('user-456', 'CF-HOTEL-20261015-1000', 'Customer requested cancellation');

    expect(cancelRes).toBeDefined();
    expect(cancelRes.status).toBe('CANCELLED');
    expect(cancelRes.cancellationFee).toBe(0);
  });
});
