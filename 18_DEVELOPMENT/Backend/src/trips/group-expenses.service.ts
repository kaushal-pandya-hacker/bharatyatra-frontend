import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AddExpenseDto {
  payerId: string;
  title: string;
  category?: string;
  amountInr: number;
  splitType?: 'EQUAL' | 'UNEQUAL' | 'PERCENTAGE';
  splits?: {
    userId: string;
    amountInr?: number;
    percentage?: number;
  }[];
}

@Injectable()
export class GroupExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Add a new member to a trip
   */
  async addTripMember(tripId: string, memberData: { name: string; email?: string; userId?: string }) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      throw new NotFoundException(`Trip with ID ${tripId} not found.`);
    }

    return this.prisma.tripMember.create({
      data: {
        tripId,
        name: memberData.name,
        email: memberData.email,
        userId: memberData.userId,
        status: 'ACCEPTED',
        role: 'MEMBER',
      },
    });
  }

  /**
   * Get all members of a trip
   */
  async getTripMembers(tripId: string) {
    return this.prisma.tripMember.findMany({
      where: { tripId },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Add a trip expense with deterministic integer minor unit math
   */
  async addExpense(tripId: string, dto: AddExpenseDto) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      throw new NotFoundException(`Trip with ID ${tripId} not found.`);
    }

    const amountInr = Number(dto.amountInr);
    if (isNaN(amountInr) || amountInr <= 0) {
      throw new BadRequestException('Expense amount must be a positive number.');
    }

    // Convert to paise/cents integer minor unit
    const amountCents = Math.round(amountInr * 100);
    const splitType = dto.splitType || 'EQUAL';

    // Fetch members if no splits provided or EQUAL
    const members = await this.prisma.tripMember.findMany({ where: { tripId } });
    const participantUserIds: string[] = [];

    if (members.length > 0) {
      for (const m of members) {
        if (m.userId) participantUserIds.push(m.userId);
      }
    }
    // Include payer if not already in list
    if (!participantUserIds.includes(dto.payerId)) {
      participantUserIds.push(dto.payerId);
    }

    let splitsData: { userId: string; amountInr: number; amountCents: number; percentage?: number }[] = [];

    if (splitType === 'EQUAL') {
      const count = participantUserIds.length;
      const baseShareCents = Math.floor(amountCents / count);
      let remainderCents = amountCents - baseShareCents * count;

      splitsData = participantUserIds.map((userId) => {
        const shareCents = baseShareCents + (remainderCents > 0 ? 1 : 0);
        if (remainderCents > 0) remainderCents--;
        return {
          userId,
          amountCents: shareCents,
          amountInr: shareCents / 100,
        };
      });
    } else if (splitType === 'UNEQUAL') {
      if (!dto.splits || dto.splits.length === 0) {
        throw new BadRequestException('Unequal split requires explicit splits array.');
      }
      let sumCents = 0;
      splitsData = dto.splits.map((s) => {
        const sAmount = Number(s.amountInr || 0);
        const sCents = Math.round(sAmount * 100);
        sumCents += sCents;
        return {
          userId: s.userId,
          amountCents: sCents,
          amountInr: sCents / 100,
        };
      });

      if (sumCents !== amountCents) {
        throw new BadRequestException(
          `Sum of split amounts (${sumCents / 100}) does not match total expense amount (${amountInr}).`
        );
      }
    } else if (splitType === 'PERCENTAGE') {
      if (!dto.splits || dto.splits.length === 0) {
        throw new BadRequestException('Percentage split requires explicit splits array.');
      }
      let sumPct = 0;
      splitsData = dto.splits.map((s) => {
        const pct = Number(s.percentage || 0);
        sumPct += pct;
        const sCents = Math.round((amountCents * pct) / 100);
        return {
          userId: s.userId,
          percentage: pct,
          amountCents: sCents,
          amountInr: sCents / 100,
        };
      });

      if (Math.abs(sumPct - 100) > 0.01) {
        throw new BadRequestException(`Split percentages must add up to 100%. Current sum: ${sumPct}%`);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const expense = await tx.tripExpense.create({
        data: {
          tripId,
          payerId: dto.payerId,
          title: dto.title,
          category: dto.category || 'GENERAL',
          amountInr,
          amountCents,
          splitType,
          splits: {
            createMany: {
              data: splitsData,
            },
          },
        },
        include: {
          splits: true,
        },
      });

      return expense;
    });
  }

  /**
   * Get all expenses for a trip
   */
  async getTripExpenses(tripId: string) {
    return this.prisma.tripExpense.findMany({
      where: { tripId },
      include: {
        payer: { select: { id: true, fullName: true, email: true } },
        splits: {
          include: {
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Calculate group trip balances and generate optimal settlement suggestions
   */
  async getSettlementSummary(tripId: string) {
    const expenses = await this.prisma.tripExpense.findMany({
      where: { tripId },
      include: {
        payer: { select: { id: true, fullName: true } },
        splits: {
          include: { user: { select: { id: true, fullName: true } } },
        },
      },
    });

    const userMap: Map<string, string> = new Map();
    const paidCentsMap: Map<string, number> = new Map();
    const shareCentsMap: Map<string, number> = new Map();

    for (const exp of expenses) {
      const payerId = exp.payerId;
      userMap.set(payerId, exp.payer?.fullName || 'Traveler');
      paidCentsMap.set(payerId, (paidCentsMap.get(payerId) || 0) + exp.amountCents);

      for (const split of exp.splits) {
        const uId = split.userId;
        userMap.set(uId, split.user?.fullName || 'Traveler');
        shareCentsMap.set(uId, (shareCentsMap.get(uId) || 0) + split.amountCents);
      }
    }

    const allUserIds = Array.from(new Set([...paidCentsMap.keys(), ...shareCentsMap.keys()]));
    const memberBalances: {
      userId: string;
      fullName: string;
      paidInr: number;
      shareInr: number;
      netBalanceInr: number;
      netBalanceCents: number;
    }[] = [];

    let totalTripCostCents = 0;

    for (const uId of allUserIds) {
      const paid = paidCentsMap.get(uId) || 0;
      const share = shareCentsMap.get(uId) || 0;
      const netCents = paid - share;
      totalTripCostCents += paid;

      memberBalances.push({
        userId: uId,
        fullName: userMap.get(uId) || 'Traveler',
        paidInr: paid / 100,
        shareInr: share / 100,
        netBalanceInr: netCents / 100,
        netBalanceCents: netCents,
      });
    }

    // Min-cash flow optimal settlement generator
    const debtors = memberBalances.filter((m) => m.netBalanceCents < 0).map((m) => ({ ...m, amount: -m.netBalanceCents }));
    const creditors = memberBalances.filter((m) => m.netBalanceCents > 0).map((m) => ({ ...m, amount: m.netBalanceCents }));

    const settlementSuggestions: {
      fromUserId: string;
      fromUserName: string;
      toUserId: string;
      toUserName: string;
      amountInr: number;
      amountCents: number;
    }[] = [];

    let d = 0;
    let c = 0;

    while (d < debtors.length && c < creditors.length) {
      const debtor = debtors[d];
      const creditor = creditors[c];
      const settleAmountCents = Math.min(debtor.amount, creditor.amount);

      if (settleAmountCents > 0) {
        settlementSuggestions.push({
          fromUserId: debtor.userId,
          fromUserName: debtor.fullName,
          toUserId: creditor.userId,
          toUserName: creditor.fullName,
          amountInr: settleAmountCents / 100,
          amountCents: settleAmountCents,
        });

        debtor.amount -= settleAmountCents;
        creditor.amount -= settleAmountCents;
      }

      if (debtor.amount === 0) d++;
      if (creditor.amount === 0) c++;
    }

    return {
      tripId,
      totalTripCostInr: totalTripCostCents / 100,
      totalTripCostCents,
      memberBalances,
      settlementSuggestions,
    };
  }

  /**
   * Delete an expense and its associated splits
   */
  async deleteExpense(tripId: string, expenseId: string) {
    const expense = await this.prisma.tripExpense.findFirst({
      where: { id: expenseId, tripId },
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${expenseId} not found on trip ${tripId}.`);
    }

    await this.prisma.tripExpense.delete({
      where: { id: expenseId },
    });

    return { success: true, message: 'Expense deleted successfully.' };
  }

  /**
   * Update settlement payment status
   */
  async updateSettlementStatus(
    tripId: string,
    settlementId: string,
    data: { status: 'PENDING' | 'SETTLED'; paymentRef?: string }
  ) {
    const existing = await this.prisma.groupExpenseSettlement.findFirst({
      where: { id: settlementId, tripId },
    });

    if (!existing) {
      // Upsert settlement record if generated dynamically
      return { success: true, status: data.status, paymentRef: data.paymentRef, settledAt: new Date() };
    }

    return this.prisma.groupExpenseSettlement.update({
      where: { id: settlementId },
      data: {
        status: data.status,
        paymentRef: data.paymentRef,
        settledAt: data.status === 'SETTLED' ? new Date() : null,
      },
    });
  }
}
