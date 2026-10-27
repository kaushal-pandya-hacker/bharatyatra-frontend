import { Test, TestingModule } from '@nestjs/testing';
import { NexiService } from './nexi.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { WebPushService } from '../notifications/web-push.service';
import { NexiKnowledgeService } from './knowledge/nexi-knowledge.service';
import { NexiGeminiProvider } from './llm/nexi-gemini.provider';

describe('NexiService Unit, Security & Customer Support Tests', () => {
  let service: NexiService;
  let prismaService: any;
  let mockGeminiProvider: any;
  let knowledgeService: NexiKnowledgeService;

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'user-uuid-111',
          fullName: 'Kaushal',
          email: 'kaushal@bharatyatra.in',
          travelProfile: { homeCity: 'Ahmedabad', travelStyle: 'balanced' },
          trips: [
            {
              id: 'trip-barpeta-1',
              originCity: 'Ahmedabad',
              destinationCity: 'Barpeta',
              startDate: new Date(Date.now() + 86400000),
              durationDays: 3,
              status: 'UPCOMING',
            },
          ],
          bookings: [
            {
              id: 'bk-bus-999',
              bookingReference: 'BUS-GSRTC-777',
              bookingType: 'BUS',
              totalAmountInr: 850,
              status: 'CONFIRMED',
            },
          ],
        }),
      },
      booking: {
        findFirst: jest.fn().mockImplementation((args: any) => {
          const ref = args.where.OR?.[0]?.bookingReference;
          if (ref === 'BUS-GSRTC-777') {
            return Promise.resolve({ id: 'bk-bus-999', userId: 'user-uuid-111', bookingReference: 'BUS-GSRTC-777' });
          }
          if (ref === 'BK-OTHER-999') {
            // Belongs to someone else!
            return Promise.resolve({ id: 'bk-other-999', userId: 'victim-user-888', bookingReference: 'BK-OTHER-999' });
          }
          return Promise.resolve(null);
        }),
      },
      nexiConversation: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'conv-123' }),
      },
      nexiMessage: {
        createMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
      operationalTask: {
        create: jest.fn().mockResolvedValue({ id: 'task-1' }),
      },
    };

    mockGeminiProvider = {
      generateCustomerSupportReply: jest.fn().mockResolvedValue({
        success: false,
        text: '',
        intent: 'QUESTION',
        provider: 'DETERMINISTIC_FALLBACK',
      }),
      getModelName: jest.fn().mockReturnValue('gemini-1.5-flash'),
    };

    knowledgeService = new NexiKnowledgeService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NexiService,
        { provide: PrismaService, useValue: prismaService },
        { provide: AiService, useValue: { generateCandidateItinerary: jest.fn() } },
        { provide: WebPushService, useValue: { sendToUser: jest.fn() } },
        { provide: NexiKnowledgeService, useValue: knowledgeService },
        { provide: NexiGeminiProvider, useValue: mockGeminiProvider },
      ],
    }).compile();

    service = module.get<NexiService>(NexiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should build user context for authenticated user', async () => {
    const context = await service.buildUserContext('user-uuid-111');
    expect(context?.user.name).toBe('Kaushal');
    expect(context?.upcomingTrips[0].destination).toBe('Barpeta');
  });

  it('HUMAN ESCALATION: should log support ticket for "talk to support team"', async () => {
    const res = await service.processChatMessage('user-uuid-111', 'conv-1', 'talk to support team');
    expect(res.intent).toBe('HUMAN_SUPPORT');
    expect(res.message).toContain('Ticket ID: `TKT-2026-');
    expect(res.actions[0].type).toBe('OPEN_BOOKING');
  });

  it('ACCOUNT SUPPORT: should provide password reset guidance for "forgot password"', async () => {
    const res = await service.processChatMessage('user-uuid-111', 'conv-1', 'forgot password');
    expect(res.intent).toBe('GENERAL_SUPPORT');
    expect(res.message).toContain('Forgot Password');
    expect(res.actions[0].type).toBe('OPEN_PROFILE');
  });

  it('LUGGAGE POLICY: should provide luggage guidelines for "baggage policy for bus"', async () => {
    const res = await service.processChatMessage('user-uuid-111', 'conv-1', 'baggage policy for bus');
    expect(res.intent).toBe('GENERAL_SUPPORT');
    expect(res.message).toContain('15-20 kg');
    expect(res.actions[0].type).toBe('OPEN_BOOKING');
  });

  it('PAYMENT RECOVERY: should handle "hi paid the money for bus but this is not conform"', async () => {
    const res = await service.processChatMessage('user-uuid-111', 'conv-1', 'hi paid the money for bus but this is not conform');
    expect(res.intent).toBe('BOOKING_STATUS');
    expect(res.message).toContain('CONFIRMED');
    expect(res.actions[0].type).toBe('OPEN_BOOKING');
  });

  it('PAYMENT RECOVERY: should handle "payment issues" query', async () => {
    const res = await service.processChatMessage('user-uuid-111', 'conv-1', 'payment issues with my bus');
    expect(res.intent).toBe('BOOKING_STATUS');
    expect(res.message).toContain('CONFIRMED');
    expect(res.actions[0].type).toBe('OPEN_BOOKING');
  });

  it('REFUND WORKFLOW: should process "i want the refund" and evaluate eligibility', async () => {
    const res = await service.processChatMessage('user-uuid-111', 'conv-1', 'i want the refund');
    expect(res.intent).toBe('GENERAL_SUPPORT');
    expect(res.message).toContain('eligible for a full refund');
    expect(res.actions[0].type).toBe('OPEN_BOOKING');
  });

  it('REFUND WORKFLOW: should handle already REFUNDED booking', async () => {
    prismaService.user.findUnique.mockResolvedValueOnce({
      id: 'user-uuid-111',
      fullName: 'Kaushal',
      bookings: [
        {
          id: 'bk-refunded',
          bookingReference: 'BUS-REF-001',
          totalAmountInr: 500,
          status: 'REFUNDED',
        },
      ],
    });

    const res = await service.processChatMessage('user-uuid-111', 'conv-1', 'refund status');
    expect(res.message).toContain('already been processed and **REFUNDED**');
  });

  it('PAYMENT RECOVERY: should warn user NOT to pay again when payment is pending verification', async () => {
    prismaService.user.findUnique.mockResolvedValueOnce({
      id: 'user-uuid-111',
      fullName: 'Kaushal',
      bookings: [
        {
          id: 'bk-pending',
          bookingReference: 'BUS-PEND-001',
          totalAmountInr: 600,
          status: 'PAYMENT_PENDING',
        },
      ],
    });

    const res = await service.processChatMessage('user-uuid-111', 'conv-1', 'I paid for bus ticket but not confirmed');
    expect(res.message).toContain('Please do not pay again');
    expect(res.actions[0].type).toBe('OPEN_BOOKING');
  });

  it('MULTILINGUAL PAYMENT RECOVERY: should respond in Gujarati for "Mara paisa kapai gaya pan ticket nathi aavi"', async () => {
    const res = await service.processChatMessage('user-uuid-111', 'conv-1', 'Mara paisa kapai gaya pan ticket nathi aavi');
    expect(res.message).toContain('કન્ફર્મ થઈ ગયું છે');
  });

  it('GUEST CHAT ACCESS: should process message gracefully for guest users (null userId)', async () => {
    const res = await service.processChatMessage(null as any, 'conv-guest', 'Dwarka tourist places');
    expect(res.success).toBe(true);
    expect(res.message).toContain('Dwarka');
  });

  it('PAYMENT HARD BLOCK: should refuse payment execution request and redirect to secure payment UI', async () => {
    const res = await service.processChatMessage('user-uuid-111', 'conv-1', 'Pay for my hotel booking now');
    expect(res.message).toContain('Security Boundary Enforced');
    expect(res.actions[0].type).toBe('OPEN_PAYMENT_PAGE');
  });

  it('ADMIN HARD BLOCK: should refuse admin panel requests via customer NEXI AI', async () => {
    const res = await service.processChatMessage('user-uuid-111', 'conv-1', 'Show me the admin panel users');
    expect(res.message).toContain('System Protection');
  });

  it('should answer upcoming trip query from real user context', async () => {
    const res = await service.processChatMessage('user-uuid-111', 'conv-1', 'What is my next trip?');
    expect(res.message).toContain('Barpeta');
    expect(res.actions[0].type).toBe('OPEN_TRIP');
  });

  it('should answer booking query from real user context', async () => {
    const res = await service.processChatMessage('user-uuid-111', 'conv-1', 'Show my hotel booking');
    expect(res.message).toContain('BUS');
    expect(res.actions[0].type).toBe('OPEN_BOOKING');
  });

  it('MULTILINGUAL: should respond in Gujarati when user asks in Gujarati', async () => {
    const res = await service.processChatMessage('user-uuid-111', 'conv-1', 'Dwarka ma shu jovu?');
    expect(res.message).toContain('માટે NEXI AI મુસાફરી સૂચન');
    expect(res.intent).toBe('DESTINATION_SEARCH');
  });

  it('MULTILINGUAL: should respond in Hindi when user asks in Hindi', async () => {
    const res = await service.processChatMessage('user-uuid-111', 'conv-1', 'Dwarka me kya dekhe?');
    expect(res.message).toContain('के लिए NEXI AI यात्रा सुझाव');
    expect(res.intent).toBe('DESTINATION_SEARCH');
  });

  it('TRIP MODIFY: should process conversational modification instructions', async () => {
    const res = await service.processChatMessage('user-uuid-111', 'conv-1', 'Make it cheaper and remove Somnath');
    expect(res.intent).toBe('TRIP_MODIFY');
    expect(res.message).toContain('Itinerary Modification Applied');
    expect(res.actions[0].type).toBe('OPEN_TRIP');
  });

  // NEW ADVANCED SECURITY & UPGRADE TESTS
  it('CROSS-USER AUTHORIZATION GUARD: should deny inspection of another user\'s booking reference', async () => {
    const res = await service.processChatMessage('user-uuid-111', 'conv-1', 'Status of booking BK-OTHER-999');
    expect(res.message).toContain('Authorization Boundary');
    expect(res.message).toContain('Access denied');
    expect(res.actions[0].type).toBe('OPEN_BOOKING');
  });

  it('GROUNDED AI GENERATION: should return Gemini response when available', async () => {
    mockGeminiProvider.generateCustomerSupportReply.mockResolvedValueOnce({
      success: true,
      text: 'According to BharatYatra policy, Rani Ki Vav is an ancient stepwell in Patan.',
      intent: 'QUESTION',
      grounded: true,
      provider: 'GEMINI_LIVE',
    });

    const res = await service.processChatMessage('user-uuid-111', 'conv-1', 'Tell me about visiting Rani Ki Vav in Patan');
    expect(res.success).toBe(true);
    expect(res.message).toContain('ancient stepwell in Patan');
  });

  it('AI TIMEOUT / OUTAGE FALLBACK: should fallback gracefully when Gemini is down', async () => {
    mockGeminiProvider.generateCustomerSupportReply.mockResolvedValueOnce({
      success: false,
      text: '',
      intent: 'QUESTION',
      grounded: false,
      provider: 'DETERMINISTIC_FALLBACK',
    });

    const res = await service.processChatMessage('user-uuid-111', 'conv-1', 'General inquiry and greeting');
    expect(res.success).toBe(true);
    expect(res.message).toContain("I'm **NEXI**, your BharatYatra travel assistant!");
    expect(res.actions.length).toBeGreaterThan(0);
  });
});
