import { Test, TestingModule } from '@nestjs/testing';
import { CommunicationEventService } from './communication-event.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CommunicationEventService', () => {
  let service: CommunicationEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunicationEventService,
        {
          provide: PrismaService,
          useValue: {
            communicationEvent: {
              findUnique: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'evt_db_1', ...data })),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CommunicationEventService>(CommunicationEventService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should publish a new event without duplicate flag', async () => {
    const result = await service.publishEvent({
      eventId: 'evt_test_101',
      eventType: 'BOOKING_CONFIRMED',
      aggregateId: 'ord_999',
      userId: 'usr_1',
      payload: { bookingRef: 'CF-1234' },
    });

    expect(result.duplicate).toBe(false);
    expect(result.event).toBeDefined();
    expect(result.event.eventId).toBe('evt_test_101');
  });

  it('should suppress duplicate event when published twice', async () => {
    await service.publishEvent({
      eventId: 'evt_test_dup',
      eventType: 'PAYMENT_SUCCESS',
      aggregateId: 'ord_888',
      payload: {},
    });

    const secondTry = await service.publishEvent({
      eventId: 'evt_test_dup',
      eventType: 'PAYMENT_SUCCESS',
      aggregateId: 'ord_888',
      payload: {},
    });

    expect(secondTry.duplicate).toBe(true);
    expect(secondTry.event).toBeNull();
  });
});
