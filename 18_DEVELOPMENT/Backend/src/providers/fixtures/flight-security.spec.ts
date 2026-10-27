import { Test, TestingModule } from '@nestjs/testing';
import { FlightsService } from '../../flights/flights.service';
import { TransportService } from '../../transport/transport.service';
import { UniversalProviderRegistry } from '../registry/universal-provider.registry';
import { HotelbedsProviderAdapter } from '../hotelbeds/hotelbeds-provider.adapter';
import { TboFlightAdapter } from '../flights/tbo-flight.provider.adapter';
import { EtravelsmartBusAdapter } from '../buses/etravelsmart-bus.provider.adapter';
import { TrainProviderAdapter } from '../trains/train-provider.adapter';
import { PrismaService } from '../../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';

describe('Flight Security & Vulnerability Defense Tests', () => {
  let flightsService: FlightsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlightsService,
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
                id: 'mock-booking-uuid-sec-01',
                bookingReference: args.data.bookingReference,
                createdAt: new Date(),
                totalAmountInr: args.data.totalAmountInr,
                currency: 'INR',
              })),
              update: jest.fn().mockResolvedValue({}),
            },
            transportBookingDetail: { create: jest.fn().mockResolvedValue({ id: 'mock-detail-sec-01' }) },
            transportSegment: { create: jest.fn().mockResolvedValue({}) },
            transportPassenger: { create: jest.fn().mockResolvedValue({}) },
          },
        },
      ],
    }).compile();

    flightsService = module.get<FlightsService>(FlightsService);
  });

  it('1. Price Manipulation Defense: Rejects client attempt to modify server-computed fare', async () => {
    const flightId = 'FL-BOM-DEL-6E101';
    const serverFlight = await flightsService.getDetails(flightId);
    const legitimateFare = serverFlight.price; // e.g. 4850

    // Tampered payload attempting to pay ₹1.00 instead of ₹4850
    const tamperedPayload = {
      transportId: flightId,
      type: 'FLIGHT' as const,
      providerId: 'prov-tbo-air',
      agreedFare: 1.00, // Price manipulation attack
      currency: 'INR',
      contactEmail: 'attacker@example.com',
      contactPhone: '+91 9999999999',
      passengers: [
        {
          passengerType: 'ADULT' as const,
          title: 'Mr',
          firstName: 'Attacker',
          lastName: 'User',
        },
      ],
    };

    await expect(flightsService.createBooking(tamperedPayload, 'usr-attacker')).rejects.toThrow(ConflictException);
  });

  it('2. Legitimate Price Calculation Verification: Server accepts matched base price', async () => {
    const flightId = 'FL-BOM-DEL-6E101';
    const serverFlight = await flightsService.getDetails(flightId);

    const validPayload = {
      transportId: flightId,
      type: 'FLIGHT' as const,
      providerId: 'prov-tbo-air',
      agreedFare: serverFlight.price, // Matched price
      currency: 'INR',
      contactEmail: 'legit@example.com',
      contactPhone: '+91 9876543210',
      passengers: [
        {
          passengerType: 'ADULT' as const,
          title: 'Mr',
          firstName: 'Legitimate',
          lastName: 'Customer',
        },
      ],
      idempotencyKey: `IDEM-SEC-LEGIT-${Date.now()}`,
    };

    const res = await flightsService.createBooking(validPayload, 'usr-legit-123');
    expect(res.status).toBe('CONFIRMED');
    expect(res.chaloFarvaBookingId).toBeDefined();
  });
});
