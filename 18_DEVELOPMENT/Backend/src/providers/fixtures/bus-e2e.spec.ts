import { Test, TestingModule } from '@nestjs/testing';
import { BusesService } from '../../buses/buses.service';
import { TransportService } from '../../transport/transport.service';
import { UniversalProviderRegistry } from '../registry/universal-provider.registry';
import { HotelbedsProviderAdapter } from '../hotelbeds/hotelbeds-provider.adapter';
import { TboFlightAdapter } from '../flights/tbo-flight.provider.adapter';
import { EtravelsmartBusAdapter } from '../buses/etravelsmart-bus.provider.adapter';
import { TrainProviderAdapter } from '../trains/train-provider.adapter';
import { PrismaService } from '../../prisma/prisma.service';

describe('Bus Booking End-to-End (E2E) Flow Tests', () => {
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
                id: 'mock-bus-e2e-booking-id',
                bookingReference: args.data.bookingReference,
                createdAt: new Date(),
                totalAmountInr: args.data.totalAmountInr,
                currency: 'INR',
              })),
              update: jest.fn().mockResolvedValue({}),
            },
            transportBookingDetail: { create: jest.fn().mockResolvedValue({ id: 'mock-detail-bus-e2e' }) },
            transportSegment: { create: jest.fn().mockResolvedValue({}) },
            transportPassenger: { create: jest.fn().mockResolvedValue({}) },
          },
        },
      ],
    }).compile();

    busesService = module.get<BusesService>(BusesService);
  });

  it('1. Complete Bus E2E Journey: Search ➔ Seat Map ➔ Revalidate ➔ Calculate Price ➔ Checkout ➔ Ticket', async () => {
    // 1. Search Buses
    const searchRes = await busesService.search({
      origin: 'Ahmedabad',
      destination: 'Surat',
      departureDate: '2026-10-25',
      passengers: 2,
    });
    expect(searchRes.items.length).toBeGreaterThan(0);
    const selectedBus = searchRes.items[0];

    // 2. Fetch Interactive Seat Map
    const seatMap = await busesService.getSeatMap(selectedBus.id);
    expect(seatMap.seats.length).toBeGreaterThan(0);
    const availableSeat = seatMap.seats.find(s => s.status === 'AVAILABLE');
    expect(availableSeat).toBeDefined();

    // 3. Revalidate Fare & Seats
    const reval = await busesService.revalidate({
      transportId: selectedBus.id,
      passengersCount: 1,
    });
    expect(reval.status).toBe('AVAILABLE');

    // 4. Calculate Server-Side Pricing
    const pricing = busesService.calculateServerPrice(selectedBus.price, 1);
    expect(pricing.totalAmount).toBe(pricing.baseTotal + pricing.taxes + pricing.serviceFee);

    // 5. Checkout & Booking
    const checkoutRes = await busesService.createBooking({
      transportId: selectedBus.id,
      type: 'BUS',
      providerId: 'prov-etravelsmart-bus',
      agreedFare: selectedBus.price,
      currency: 'INR',
      contactEmail: 'traveler@example.com',
      contactPhone: '+91 9876543210',
      boardingPoint: 'Geeta Mandir (07:00 AM)',
      passengers: [
        {
          passengerType: 'ADULT',
          title: 'Mr',
          firstName: 'Anand',
          lastName: 'Mehta',
          seatNumber: availableSeat?.seatNumber,
        },
      ],
      idempotencyKey: `IDEM-BUS-E2E-${Date.now()}`,
    });

    expect(checkoutRes.chaloFarvaBookingId).toBeDefined();
    expect(checkoutRes.status).toBe('CONFIRMED');
    expect(checkoutRes.pnr).toBeDefined();
    expect(checkoutRes.totalPrice).toBe(pricing.totalAmount);
  });

  it('2. Failure Mode Test: Seat unavailable intercepts checkout cleanly', async () => {
    const busId = 'BUS-Ahmedabad-Surat-GSRTC01';
    await expect(
      busesService.createBooking({
        transportId: busId,
        type: 'BUS',
        providerId: 'prov-etravelsmart-bus',
        agreedFare: 450,
        currency: 'INR',
        contactEmail: 'fail@example.com',
        contactPhone: '+91 9876543210',
        passengers: [
          {
            passengerType: 'ADULT',
            title: 'Mr',
            firstName: 'Fail',
            lastName: 'User',
            seatNumber: 'L1', // Booked seat
          },
        ],
      }),
    ).rejects.toThrow();
  });
});
