import { Test, TestingModule } from '@nestjs/testing';
import { BusesService } from '../../buses/buses.service';
import { TransportService } from '../../transport/transport.service';
import { UniversalProviderRegistry } from '../registry/universal-provider.registry';
import { HotelbedsProviderAdapter } from '../hotelbeds/hotelbeds-provider.adapter';
import { TboFlightAdapter } from '../flights/tbo-flight.provider.adapter';
import { EtravelsmartBusAdapter } from '../buses/etravelsmart-bus.provider.adapter';
import { TrainProviderAdapter } from '../trains/train-provider.adapter';
import { PrismaService } from '../../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';

describe('Bus Security & Vulnerability Defense Tests', () => {
  let busesService: BusesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusesService,
        TransportService,
        UniversalProviderRegistry,
        TboFlightAdapter,
        EtravelsmartBusAdapter,
        TrainProviderAdapter,
        {
          provide: HotelbedsProviderAdapter,
          useValue: { providerId: 'prov-hotelbeds', providerName: 'Hotelbeds', supportedProductTypes: ['HOTEL'] },
        },
        {
          provide: PrismaService,
          useValue: {
            transportSearch: { create: jest.fn().mockResolvedValue({}) },
            booking: {
              findUnique: jest.fn().mockResolvedValue(null),
              findFirst: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockImplementation(args => ({
                id: 'mock-bus-sec-booking-id',
                bookingReference: args.data.bookingReference,
                createdAt: new Date(),
                totalAmountInr: args.data.totalAmountInr,
                currency: 'INR',
              })),
              update: jest.fn().mockResolvedValue({}),
            },
            transportBookingDetail: { create: jest.fn().mockResolvedValue({ id: 'mock-detail-sec-bus' }) },
            transportSegment: { create: jest.fn().mockResolvedValue({}) },
            transportPassenger: { create: jest.fn().mockResolvedValue({}) },
          },
        },
      ],
    }).compile();

    busesService = module.get<BusesService>(BusesService);
  });

  it('1. Price Manipulation Defense: Rejects client payload with tampered bus fare', async () => {
    const busId = 'BUS-Ahmedabad-Surat-GSRTC01';
    const busItem = await busesService.getDetails(busId);

    const tamperedPayload = {
      transportId: busItem.id,
      type: 'BUS' as const,
      providerId: 'prov-etravelsmart-bus',
      agreedFare: 5.00, // Attack: Attempting ₹5 instead of ₹450
      currency: 'INR',
      contactEmail: 'attacker@example.com',
      contactPhone: '+91 9999999999',
      passengers: [
        {
          passengerType: 'ADULT' as const,
          title: 'Mr',
          firstName: 'Attacker',
          lastName: 'User',
          seatNumber: 'S2',
        },
      ],
    };

    await expect(busesService.createBooking(tamperedPayload, 'usr-attacker')).rejects.toThrow(ConflictException);
  });

  it('2. Seat Tampering Defense: Rejects booking attempt on already booked/restricted seat', async () => {
    const busId = 'BUS-Ahmedabad-Surat-GSRTC01';
    const busItem = await busesService.getDetails(busId);

    // Seat L1 is defined as 'BOOKED' in seat map
    const bookedSeatPayload = {
      transportId: busItem.id,
      type: 'BUS' as const,
      providerId: 'prov-etravelsmart-bus',
      agreedFare: busItem.price,
      currency: 'INR',
      contactEmail: 'user@example.com',
      contactPhone: '+91 9876543210',
      passengers: [
        {
          passengerType: 'ADULT' as const,
          title: 'Mr',
          firstName: 'Illegal',
          lastName: 'SeatClaim',
          seatNumber: 'L1', // Booked seat
        },
      ],
    };

    await expect(busesService.createBooking(bookedSeatPayload, 'usr-seat-claimer')).rejects.toThrow(ConflictException);
  });

  it('3. Legitimate Booking: Accepts valid available seat and correct server fare', async () => {
    const busId = 'BUS-Ahmedabad-Surat-GSRTC01';
    const busItem = await busesService.getDetails(busId);

    const validPayload = {
      transportId: busItem.id,
      type: 'BUS' as const,
      providerId: 'prov-etravelsmart-bus',
      agreedFare: busItem.price,
      currency: 'INR',
      contactEmail: 'legit.bus@example.com',
      contactPhone: '+91 9876543210',
      passengers: [
        {
          passengerType: 'ADULT' as const,
          title: 'Mr',
          firstName: 'Valid',
          lastName: 'Passenger',
          seatNumber: 'L2', // Available seat
        },
      ],
      idempotencyKey: `IDEM-BUS-SEC-LEGIT-${Date.now()}`,
    };

    const result = await busesService.createBooking(validPayload, 'usr-legit-bus');
    expect(result.status).toBe('CONFIRMED');
    expect(result.chaloFarvaBookingId).toBeDefined();
  });
});
