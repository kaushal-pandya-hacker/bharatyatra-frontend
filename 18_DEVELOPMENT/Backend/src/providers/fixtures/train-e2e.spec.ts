import { Test, TestingModule } from '@nestjs/testing';
import { TrainsService } from '../../trains/trains.service';
import { TransportService } from '../../transport/transport.service';
import { UniversalProviderRegistry } from '../registry/universal-provider.registry';
import { HotelbedsProviderAdapter } from '../hotelbeds/hotelbeds-provider.adapter';
import { TboFlightAdapter } from '../flights/tbo-flight.provider.adapter';
import { EtravelsmartBusAdapter } from '../buses/etravelsmart-bus.provider.adapter';
import { TrainProviderAdapter } from '../trains/train-provider.adapter';
import { PrismaService } from '../../prisma/prisma.service';

describe('Train Booking End-to-End (E2E) Flow Tests', () => {
  let trainsService: TrainsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrainsService,
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
                id: 'mock-train-e2e-booking-id',
                bookingReference: args.data.bookingReference,
                createdAt: new Date(),
                totalAmountInr: args.data.totalAmountInr,
                currency: 'INR',
              })),
              update: jest.fn().mockResolvedValue({}),
            },
            transportBookingDetail: { create: jest.fn().mockResolvedValue({ id: 'mock-detail-train-e2e' }) },
            transportSegment: { create: jest.fn().mockResolvedValue({}) },
            transportPassenger: { create: jest.fn().mockResolvedValue({}) },
          },
        },
      ],
    }).compile();

    trainsService = module.get<TrainsService>(TrainsService);
  });

  it('1. Station Search Autocomplete: Resolves query "Ahmedabad" to "ADI"', () => {
    const stations = trainsService.searchStations('Ahmedabad');
    expect(stations.length).toBeGreaterThan(0);
    expect(stations[0].stationCode).toBe('ADI');
  });

  it('2. Complete Train E2E Journey: Search ➔ Station Auto ➔ Quota Availability ➔ Revalidate ➔ Price Calculation ➔ Confirmation Request', async () => {
    // 1. Search Trains
    const searchRes = await trainsService.search({
      origin: 'Ahmedabad',
      destination: 'Madgaon',
      departureDate: '2026-10-30',
      cabinClass: '3A',
    });
    expect(searchRes.items.length).toBeGreaterThan(0);
    const selectedTrain = searchRes.items[0];

    // 2. Fetch Quota Availability
    const avail = await trainsService.getAvailability(selectedTrain.id, '3A');
    expect(avail.status).toBeDefined();

    // 3. Revalidate Fare
    const reval = await trainsService.revalidate({
      transportId: selectedTrain.id,
      passengersCount: 1,
    });
    expect(reval.status).toBe('AVAILABLE');

    // 4. Calculate Server-Side Pricing
    const pricing = trainsService.calculateServerPrice(selectedTrain.price, 1);
    expect(pricing.totalAmount).toBe(pricing.baseTotal + pricing.taxes + pricing.serviceFee);

    // 5. Booking Confirmation Request
    const bookingRes = await trainsService.createBooking({
      transportId: selectedTrain.id,
      type: 'TRAIN',
      providerId: 'prov-train-irctc',
      agreedFare: selectedTrain.price,
      currency: 'INR',
      contactEmail: 'passenger.rail@example.com',
      contactPhone: '+91 9876543210',
      passengers: [
        {
          passengerType: 'ADULT',
          title: 'Mr',
          firstName: 'Vikas',
          lastName: 'Trivedi',
        },
      ],
      idempotencyKey: `IDEM-TRN-E2E-${Date.now()}`,
    });

    expect(bookingRes.chaloFarvaBookingId).toBeDefined();
    expect(bookingRes.confirmationMode).toBe('REQUEST_CONFIRMATION');
    expect(bookingRes.totalPrice).toBe(pricing.totalAmount);
  });
});
