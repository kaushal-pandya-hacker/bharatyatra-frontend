import { Test, TestingModule } from '@nestjs/testing';
import { GroupExpensesService } from './group-expenses.service';
import { PrismaService } from '../prisma/prisma.service';

describe('GroupExpensesService', () => {
  let service: GroupExpensesService;

  const mockPrismaService = {
    trip: {
      findUnique: jest.fn(),
    },
    tripMember: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    tripExpense: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupExpensesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<GroupExpensesService>(GroupExpensesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addTripMember', () => {
    it('should create a trip member when trip exists', async () => {
      mockPrismaService.trip.findUnique.mockResolvedValue({ id: 'trip-1' });
      mockPrismaService.tripMember.create.mockResolvedValue({
        id: 'member-1',
        tripId: 'trip-1',
        name: 'Aarav Patel',
        status: 'ACCEPTED',
      });

      const res = await service.addTripMember('trip-1', { name: 'Aarav Patel' });
      expect(res.id).toBe('member-1');
      expect(mockPrismaService.tripMember.create).toHaveBeenCalled();
    });
  });

  describe('getSettlementSummary', () => {
    it('should calculate balances and min-cash-flow settlements deterministically', async () => {
      mockPrismaService.tripExpense.findMany.mockResolvedValue([
        {
          id: 'exp-1',
          payerId: 'usr-1',
          payer: { fullName: 'Aarav' },
          amountInr: 300,
          amountCents: 30000,
          splits: [
            { userId: 'usr-1', user: { fullName: 'Aarav' }, amountCents: 10000 },
            { userId: 'usr-2', user: { fullName: 'Diya' }, amountCents: 10000 },
            { userId: 'usr-3', user: { fullName: 'Kavya' }, amountCents: 10000 },
          ],
        },
      ]);

      const summary = await service.getSettlementSummary('trip-1');
      expect(summary.totalTripCostInr).toBe(300);
      expect(summary.memberBalances).toHaveLength(3);

      const aarav = summary.memberBalances.find((m) => m.userId === 'usr-1');
      expect(aarav?.netBalanceInr).toBe(200);

      expect(summary.settlementSuggestions.length).toBeGreaterThan(0);
    });
  });
});
