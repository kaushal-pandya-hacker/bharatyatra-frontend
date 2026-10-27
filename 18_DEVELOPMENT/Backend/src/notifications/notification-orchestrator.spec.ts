import { Test, TestingModule } from '@nestjs/testing';
import { NotificationOrchestratorService } from './notification-orchestrator.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailProviderRegistry } from './providers/email-provider.registry';
import { WhatsAppProviderRegistry } from './providers/whatsapp-provider.registry';
import { NotificationTemplateEngine } from './notification-template.engine';
import { NotificationPreferenceService } from './notification-preference.service';
import { CommunicationEventService } from './communication-event.service';

describe('NotificationOrchestratorService', () => {
  let service: NotificationOrchestratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationOrchestratorService,
        EmailProviderRegistry,
        WhatsAppProviderRegistry,
        NotificationTemplateEngine,
        NotificationPreferenceService,
        CommunicationEventService,
        {
          provide: PrismaService,
          useValue: {
            communicationEvent: {
              findUnique: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'evt_1', ...data })),
            },
            notification: {
              create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'notif_101', ...data })),
            },
            notificationDelivery: {
              create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'deliv_1', ...data })),
              findMany: jest.fn().mockResolvedValue([]),
              update: jest.fn().mockResolvedValue({ id: 'deliv_1', status: 'DELIVERED' }),
            },
            notificationPreference: {
              findUnique: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'pref_1', ...data })),
              upsert: jest.fn().mockImplementation(({ update, create }) => Promise.resolve({ id: 'pref_1', ...create })),
            },
          },
        },
      ],
    }).compile();

    service = module.get<NotificationOrchestratorService>(NotificationOrchestratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should orchestrate booking notification across IN_APP, EMAIL, and WHATSAPP', async () => {
    const result = await service.orchestrateBookingNotification({
      eventId: 'evt_orch_001',
      aggregateId: 'ord_12345',
      userId: 'usr_demo_1',
      userEmail: 'traveler@example.com',
      userPhone: '+919876543210',
      locale: 'en',
      templateId: 'booking_confirmed',
      channels: ['IN_APP', 'EMAIL', 'WHATSAPP'],
      variables: {
        user_name: 'Kaushal Pandya',
        booking_reference: 'CF-9988',
        service_name: 'Somnath Beach Resort Stay',
      },
      multiItems: [
        { type: 'hotel', title: 'Somnath Beach Resort', reference: 'HOT-101', priceInr: 4500 },
        { type: 'bus', title: 'GSRTC Volvo AC Express', reference: 'BUS-202', priceInr: 850 },
      ],
    });

    expect(result.status).toBe('DISPATCHED');
    expect(result.notificationId).toBeDefined();
    expect(result.deliveries).toHaveLength(3);

    const emailDel = result.deliveries.find((d: any) => d.channel === 'EMAIL');
    expect(emailDel).toBeDefined();
    expect(emailDel.success).toBe(true);

    const waDel = result.deliveries.find((d: any) => d.channel === 'WHATSAPP');
    expect(waDel).toBeDefined();
    expect(waDel.success).toBe(true);
  });

  it('should return health check overview', async () => {
    const health = await service.getAdminHealth();
    expect(health.status).toBe('UP');
    expect(health.emailProvider).toBeDefined();
    expect(health.whatsappProvider).toBeDefined();
  });
});
