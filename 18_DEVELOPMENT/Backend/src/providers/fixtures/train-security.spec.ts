import { Test, TestingModule } from '@nestjs/testing';
import { TrainsService } from '../../trains/trains.service';
import { TransportService } from '../../transport/transport.service';
import { UniversalProviderRegistry } from '../registry/universal-provider.registry';
import { HotelbedsProviderAdapter } from '../hotelbeds/hotelbeds-provider.adapter';
import { TboFlightAdapter } from '../flights/tbo-flight.provider.adapter';
import { EtravelsmartBusAdapter } from '../buses/etravelsmart-bus.provider.adapter';
import { TrainProviderAdapter } from '../trains/train-provider.adapter';
import { PrismaService } from '../../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';

describe('Train Security & Vulnerability Defense Tests', () => {
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
                id: 'mock-train-sec-booking-id',
                bookingReference: args.data.bookingReference,
                createdAt: new Date(),
                totalAmountInr: args.data.totalAmountInr,
                currency: 'INR',
              })),
              update: jest.fn().mockResolvedValue({}),
            },
            transportBookingDetail: { create: jest.fn().mockResolvedValue({ id: 'mock-detail-sec-train' }) },
            transportSegment: { create: jest.fn().mockResolvedValue({}) },
            transportPassenger: { create: jest.fn().mockResolvedValue({}) },
          },
        },
      ],
    }).compile();

    trainsService = module.get<TrainsService>(TrainsService);
  });

  it('1. Price Manipulation Defense: Rejects client payload with tampered train fare', async () => {
    const trainId = 'TRN-ADI-MAO-12010';
    const trainItem = await trainsService.getDetails(trainId);

    const tamperedPayload = {
      transportId: trainItem.id,
      type: 'TRAIN' as const,
      providerId: 'prov-train-irctc',
      agreedFare: 10.00, // Price manipulation attack: ₹10 instead of ₹1350
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

    await expect(trainsService.createBooking(tamperedPayload, 'usr-attacker')).rejects.toThrow(ConflictException);
  });

  it('2. Fake PNR Guard: Ensures no fake PNR is generated in Request Confirmation mode', async () => {
    const trainId = 'TRN-ADI-MAO-12010';
    const trainItem = await trainsService.getDetails(trainId);

    const validPayload = {
      transportId: trainItem.id,
      type: 'TRAIN' as const,
      providerId: 'prov-train-irctc',
      agreedFare: trainItem.price,
      currency: 'INR',
      contactEmail: 'train.user@example.com',
      contactPhone: '+91 9876543210',
      passengers: [
        {
          passengerType: 'ADULT' as const,
          title: 'Mr',
          firstName: 'Siddharth',
          lastName: 'Joshi',
        },
      ],
      idempotencyKey: `IDEM-TRN-SEC-${Date.now()}`,
    };

    const res = await trainsService.createBooking(validPayload, 'usr-train-req');
    expect(res.status).toBe('REQUEST_CONFIRMATION');
    expect(res.confirmationMode).toBe('REQUEST_CONFIRMATION');
    expect(res.pnr).toBeUndefined(); // PNR must NOT be fabricated in request mode!
  });
});
