import { Test, TestingModule } from '@nestjs/testing';
import { TransportService } from '../../transport/transport.service';
import { UniversalProviderRegistry } from '../registry/universal-provider.registry';
import { HotelbedsProviderAdapter } from '../hotelbeds/hotelbeds-provider.adapter';
import { TboFlightAdapter } from '../flights/tbo-flight.provider.adapter';
import { EtravelsmartBusAdapter } from '../buses/etravelsmart-bus.provider.adapter';
import { TrainProviderAdapter } from '../trains/train-provider.adapter';
import { PrismaService } from '../../prisma/prisma.service';

describe('Universal Transport End-to-End (E2E) Flow Tests', () => {
  let transportService: TransportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransportService,
        UniversalProviderRegistry,
        TboFlightAdapter,
        EtravelsmartBusAdapter,
        TrainProviderAdapter,
        {
          provide: HotelbedsProviderAdapter,
          useValue: {
            providerId: 'prov-hotelbeds',
            providerName: 'Hotelbeds',
            supportedProductTypes: ['HOTEL'],
          },
        },
        {
          provide: PrismaService,
          useValue: {
            transportSearch: { create: jest.fn().mockResolvedValue({}) },
            booking: {
              findUnique: jest.fn().mockResolvedValue(null),
              findFirst: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockImplementation(args => ({
                id: 'mock-booking-uuid-101',
                bookingReference: args.data.bookingReference,
                createdAt: new Date(),
                totalAmountInr: args.data.totalAmountInr,
                currency: 'INR',
              })),
              update: jest.fn().mockResolvedValue({}),
            },
            transportBookingDetail: { create: jest.fn().mockResolvedValue({ id: 'mock-detail-uuid-101' }) },
            transportSegment: { create: jest.fn().mockResolvedValue({}) },
            transportPassenger: { create: jest.fn().mockResolvedValue({}) },
          },
        },
      ],
    }).compile();

    transportService = module.get<TransportService>(TransportService);
  });

  it('1. FLIGHT E2E Flow: Search -> Revalidate -> Checkout -> Confirmation', async () => {
    const searchRes = await transportService.search({
      type: 'FLIGHT',
      origin: 'BOM',
      destination: 'DEL',
      departureDate: '2026-11-10',
    });
    expect(searchRes.items.length).toBeGreaterThan(0);
    const selectedFlight = searchRes.items[0];

    const reval = await transportService.revalidate(
      {
        transportId: selectedFlight.id,
        passengersCount: 1,
      },
      'FLIGHT',
    );
    expect(reval.status).toBe('AVAILABLE');

    const checkoutRes = await transportService.checkout({
      transportId: selectedFlight.id,
      type: 'FLIGHT',
      providerId: 'prov-tbo-air',
      agreedFare: selectedFlight.price,
      currency: 'INR',
      contactEmail: 'passenger@example.com',
      contactPhone: '+91 9876543210',
      passengers: [
        {
          passengerType: 'ADULT',
          title: 'Mr',
          firstName: 'Kaushal',
          lastName: 'Pandya',
          gender: 'Male',
        },
      ],
      idempotencyKey: `IDEM-E2E-FLT-${Date.now()}`,
    });

    expect(checkoutRes.chaloFarvaBookingId).toBeDefined();
    expect(checkoutRes.status).toBe('CONFIRMED');
    expect(checkoutRes.pnr).toBeDefined();
    expect(checkoutRes.totalPrice).toBeGreaterThan(selectedFlight.price);
  });

  it('2. BUS E2E Flow: Search -> Seat Map -> Checkout', async () => {
    const searchRes = await transportService.search({
      type: 'BUS',
      origin: 'Ahmedabad',
      destination: 'Surat',
      departureDate: '2026-11-12',
    });
    expect(searchRes.items[0].seatMapSupported).toBe(true);

    const checkoutRes = await transportService.checkout({
      transportId: searchRes.items[0].id,
      type: 'BUS',
      providerId: 'prov-etravelsmart-bus',
      agreedFare: 450,
      currency: 'INR',
      contactEmail: 'bus.traveler@example.com',
      contactPhone: '+91 9876543210',
      boardingPoint: 'Geeta Mandir (07:00 AM)',
      passengers: [
        {
          passengerType: 'ADULT',
          title: 'Mr',
          firstName: 'Rohan',
          lastName: 'Shah',
          seatNumber: 'SL-04',
        },
      ],
      idempotencyKey: `IDEM-E2E-BUS-${Date.now()}`,
    });

    expect(checkoutRes.status).toBe('CONFIRMED');
    expect(checkoutRes.pnr).toBeDefined();
  });

  it('3. TRAIN E2E Flow: Request Confirmation Mode Verification', async () => {
    const searchRes = await transportService.search({
      type: 'TRAIN',
      origin: 'ADI',
      destination: 'MAO',
      departureDate: '2026-11-15',
    });

    const checkoutRes = await transportService.checkout({
      transportId: searchRes.items[0].id,
      type: 'TRAIN',
      providerId: 'prov-train-irctc',
      agreedFare: 1350,
      currency: 'INR',
      contactEmail: 'train.pass@example.com',
      contactPhone: '+91 9876543210',
      passengers: [
        {
          passengerType: 'ADULT',
          title: 'Mrs',
          firstName: 'Pooja',
          lastName: 'Patel',
        },
      ],
      idempotencyKey: `IDEM-E2E-TRN-${Date.now()}`,
    });

    expect(checkoutRes.confirmationMode).toBe('REQUEST_CONFIRMATION');
    expect(checkoutRes.status).toBe('REQUEST_CONFIRMATION');
  });
});
