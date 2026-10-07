/**
 * Group Expense Split & Final Settlement Calculation Engine
 * --------------------------------------------------------
 * Deterministic calculation engine operating with integer minor units (paise/cents).
 * Ensures zero floating-point drift and exact monetary conservation:
 * sum(member_shares) === total_expense_amount
 */

export interface GroupMember {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  isCurrentUser?: boolean;
}

export type ExpenseCategory =
  | 'Stay'
  | 'Food'
  | 'Transport'
  | 'Fuel'
  | 'Tickets'
  | 'Activities'
  | 'Shopping'
  | 'Parking'
  | 'Miscellaneous';

export type SplitType = 'EQUAL' | 'UNEQUAL' | 'PERCENTAGE';

export interface ExpenseSplitParticipant {
  memberId: string;
  shareAmountInr: number;
  shareAmountPaise: number;
  percentage?: number;
}

export interface TripExpenseItem {
  id: string;
  tripId: string;
  title: string;
  amountInr: number;
  amountPaise: number;
  paidByMemberId: string;
  category: ExpenseCategory;
  splitType: SplitType;
  participants: ExpenseSplitParticipant[];
  sharedByAll: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface MemberBalanceSummary {
  memberId: string;
  memberName: string;
  totalPaidInr: number;
  totalPaidPaise: number;
  totalShareInr: number;
  totalSharePaise: number;
  netBalanceInr: number;
  netBalancePaise: number;
  status: 'CREDITOR' | 'DEBTOR' | 'SETTLED';
}

export interface SettlementSuggestion {
  id: string;
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  amountInr: number;
  amountPaise: number;
  status: 'PENDING' | 'SETTLED';
  paidAt?: string;
  refCode?: string;
}

export interface CategoryBreakdown {
  category: ExpenseCategory;
  totalAmountInr: number;
  totalAmountPaise: number;
  percentageOfTotal: number;
  expenseCount: number;
}

export interface TripExpenseSummary {
  totalTripCostInr: number;
  totalTripCostPaise: number;
  totalExpensesCount: number;
  totalMembersCount: number;
  averageCostPerPersonInr: number;
  memberBalances: MemberBalanceSummary[];
  settlements: SettlementSuggestion[];
  categoryBreakdown: CategoryBreakdown[];
}

/**
 * Converts INR decimal amount to integer Paise (Minor Unit).
 * e.g. 100.50 -> 10050, 100 -> 10000
 */
export function inrToPaise(amountInr: number): number {
  if (isNaN(amountInr) || amountInr <= 0) return 0;
  return Math.round(amountInr * 100);
}

/**
 * Converts integer Paise (Minor Unit) to INR decimal amount.
 * e.g. 10050 -> 100.50
 */
export function paiseToInr(paise: number): number {
  return Number((paise / 100).toFixed(2));
}

/**
 * Deterministically splits total Paise among participant IDs equally.
 * Remainder paise are allocated 1 paise at a time to leading participants
 * to guarantee sum(shares) === totalPaise.
 */
export function calculateEqualSplits(
  totalPaise: number,
  participantMemberIds: string[]
): ExpenseSplitParticipant[] {
  if (participantMemberIds.length === 0 || totalPaise <= 0) return [];

  const count = participantMemberIds.length;
  const baseSharePaise = Math.floor(totalPaise / count);
  let remainderPaise = totalPaise - baseSharePaise * count;

  return participantMemberIds.map((memberId) => {
    const sharePaise = baseSharePaise + (remainderPaise > 0 ? 1 : 0);
    if (remainderPaise > 0) remainderPaise--;

    return {
      memberId,
      shareAmountPaise: sharePaise,
      shareAmountInr: paiseToInr(sharePaise),
    };
  });
}

/**
 * Builds expense object with deterministic participant splits.
 */
export function createTripExpense(data: {
  id?: string;
  tripId: string;
  title: string;
  amountInr: number;
  paidByMemberId: string;
  category: ExpenseCategory;
  splitType?: SplitType;
  participantMemberIds?: string[];
  customSplits?: { memberId: string; amountInr?: number; percentage?: number }[];
}): TripExpenseItem {
  const amountPaise = inrToPaise(data.amountInr);
  if (amountPaise <= 0) {
    throw new Error('Expense amount must be greater than zero.');
  }

  const splitType = data.splitType || 'EQUAL';
  let participants: ExpenseSplitParticipant[] = [];

  if (splitType === 'EQUAL') {
    const pIds = data.participantMemberIds || [];
    if (pIds.length === 0) {
      throw new Error('Expense must have at least one participant.');
    }
    participants = calculateEqualSplits(amountPaise, pIds);
  } else if (splitType === 'UNEQUAL') {
    if (!data.customSplits || data.customSplits.length === 0) {
      throw new Error('Custom splits require specific participant allocations.');
    }

    let sumPaise = 0;
    participants = data.customSplits.map((cs) => {
      const pPaise = inrToPaise(cs.amountInr || 0);
      sumPaise += pPaise;
      return {
        memberId: cs.memberId,
        shareAmountPaise: pPaise,
        shareAmountInr: paiseToInr(pPaise),
      };
    });

    if (sumPaise !== amountPaise) {
      throw new Error(
        `Sum of participant shares (₹${paiseToInr(sumPaise)}) does not equal expense total (₹${paiseToInr(amountPaise)}).`
      );
    }
  } else if (splitType === 'PERCENTAGE') {
    if (!data.customSplits || data.customSplits.length === 0) {
      throw new Error('Percentage splits require specific percentage allocations.');
    }

    let sumPct = 0;
    participants = data.customSplits.map((cs) => {
      const pct = cs.percentage || 0;
      sumPct += pct;
      const pPaise = Math.round((amountPaise * pct) / 100);
      return {
        memberId: cs.memberId,
        percentage: pct,
        shareAmountPaise: pPaise,
        shareAmountInr: paiseToInr(pPaise),
      };
    });

    if (Math.abs(sumPct - 100) > 0.01) {
      throw new Error(`Split percentages must total exactly 100%. Current sum: ${sumPct}%.`);
    }
  }

  return {
    id: data.id || `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    tripId: data.tripId,
    title: data.title.trim(),
    amountInr: paiseToInr(amountPaise),
    amountPaise,
    paidByMemberId: data.paidByMemberId,
    category: data.category,
    splitType,
    participants,
    sharedByAll: false,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Calculates per-member total paid, total share, and net balance.
 */
export function calculateMemberBalances(
  members: GroupMember[],
  expenses: TripExpenseItem[]
): MemberBalanceSummary[] {
  const memberMap = new Map<string, GroupMember>();
  const paidMap = new Map<string, number>();
  const shareMap = new Map<string, number>();

  members.forEach((m) => {
    memberMap.set(m.id, m);
    paidMap.set(m.id, 0);
    shareMap.set(m.id, 0);
  });

  expenses.forEach((exp) => {
    // Add paid amount
    if (paidMap.has(exp.paidByMemberId)) {
      paidMap.set(exp.paidByMemberId, (paidMap.get(exp.paidByMemberId) || 0) + exp.amountPaise);
    } else {
      paidMap.set(exp.paidByMemberId, exp.amountPaise);
      if (!memberMap.has(exp.paidByMemberId)) {
        memberMap.set(exp.paidByMemberId, { id: exp.paidByMemberId, name: 'Traveler' });
      }
    }

    // Add shares
    exp.participants.forEach((part) => {
      if (shareMap.has(part.memberId)) {
        shareMap.set(part.memberId, (shareMap.get(part.memberId) || 0) + part.shareAmountPaise);
      } else {
        shareMap.set(part.memberId, part.shareAmountPaise);
        if (!memberMap.has(part.memberId)) {
          memberMap.set(part.memberId, { id: part.memberId, name: 'Traveler' });
        }
      }
    });
  });

  const allMemberIds = Array.from(memberMap.keys());

  return allMemberIds.map((mId) => {
    const member = memberMap.get(mId)!;
    const paidPaise = paidMap.get(mId) || 0;
    const sharePaise = shareMap.get(mId) || 0;
    const netBalancePaise = paidPaise - sharePaise;

    let status: 'CREDITOR' | 'DEBTOR' | 'SETTLED' = 'SETTLED';
    if (netBalancePaise > 0) status = 'CREDITOR';
    else if (netBalancePaise < 0) status = 'DEBTOR';

    return {
      memberId: mId,
      memberName: member.name,
      totalPaidInr: paiseToInr(paidPaise),
      totalPaidPaise: paidPaise,
      totalShareInr: paiseToInr(sharePaise),
      totalSharePaise: sharePaise,
      netBalanceInr: paiseToInr(netBalancePaise),
      netBalancePaise,
      status,
    };
  });
}

/**
 * Greedy Min-Cash-Flow algorithm to generate minimal settlement transactions.
 */
export function generateSettlementPlan(
  balances: MemberBalanceSummary[],
  existingSettlements: SettlementSuggestion[] = []
): SettlementSuggestion[] {
  const settledMap = new Map<string, SettlementSuggestion>();
  existingSettlements.forEach((s) => {
    settledMap.set(`${s.fromMemberId}->${s.toMemberId}`, s);
  });

  const debtors = balances
    .filter((b) => b.netBalancePaise < 0)
    .map((b) => ({ ...b, amount: -b.netBalancePaise }));

  const creditors = balances
    .filter((b) => b.netBalancePaise > 0)
    .map((b) => ({ ...b, amount: b.netBalancePaise }));

  const suggestions: SettlementSuggestion[] = [];
  let d = 0;
  let c = 0;
  let idx = 1;

  while (d < debtors.length && c < creditors.length) {
    const debtor = debtors[d];
    const creditor = creditors[c];
    const settleAmountPaise = Math.min(debtor.amount, creditor.amount);

    if (settleAmountPaise > 0) {
      const key = `${debtor.memberId}->${creditor.memberId}`;
      const existing = settledMap.get(key);

      suggestions.push({
        id: existing?.id || `settle-${idx++}`,
        fromMemberId: debtor.memberId,
        fromMemberName: debtor.memberName,
        toMemberId: creditor.memberId,
        toMemberName: creditor.memberName,
        amountPaise: settleAmountPaise,
        amountInr: paiseToInr(settleAmountPaise),
        status: existing?.status || 'PENDING',
        paidAt: existing?.paidAt,
        refCode: existing?.refCode,
      });

      debtor.amount -= settleAmountPaise;
      creditor.amount -= settleAmountPaise;
    }

    if (debtor.amount === 0) d++;
    if (creditor.amount === 0) c++;
  }

  return suggestions;
}

/**
 * Calculates category-wise breakdown of total expenses.
 */
export function calculateCategoryBreakdown(expenses: TripExpenseItem[]): CategoryBreakdown[] {
  const catMap = new Map<ExpenseCategory, { paise: number; count: number }>();
  let grandTotalPaise = 0;

  expenses.forEach((exp) => {
    grandTotalPaise += exp.amountPaise;
    const current = catMap.get(exp.category) || { paise: 0, count: 0 };
    catMap.set(exp.category, {
      paise: current.paise + exp.amountPaise,
      count: current.count + 1,
    });
  });

  const categories: ExpenseCategory[] = [
    'Stay',
    'Food',
    'Transport',
    'Fuel',
    'Tickets',
    'Activities',
    'Shopping',
    'Parking',
    'Miscellaneous',
  ];

  return categories.map((cat) => {
    const data = catMap.get(cat) || { paise: 0, count: 0 };
    const pct = grandTotalPaise > 0 ? (data.paise / grandTotalPaise) * 100 : 0;
    return {
      category: cat,
      totalAmountPaise: data.paise,
      totalAmountInr: paiseToInr(data.paise),
      percentageOfTotal: Number(pct.toFixed(1)),
      expenseCount: data.count,
    };
  });
}

/**
 * Full trip summary engine output.
 */
export function computeFullTripExpenseSummary(
  members: GroupMember[],
  expenses: TripExpenseItem[],
  existingSettlements: SettlementSuggestion[] = []
): TripExpenseSummary {
  const memberBalances = calculateMemberBalances(members, expenses);
  const totalTripCostPaise = memberBalances.reduce((sum, b) => sum + b.totalPaidPaise, 0);
  const settlements = generateSettlementPlan(memberBalances, existingSettlements);
  const categoryBreakdown = calculateCategoryBreakdown(expenses);
  const averageCostPerPersonInr =
    members.length > 0 ? paiseToInr(Math.round(totalTripCostPaise / members.length)) : 0;

  return {
    totalTripCostInr: paiseToInr(totalTripCostPaise),
    totalTripCostPaise,
    totalExpensesCount: expenses.length,
    totalMembersCount: members.length,
    averageCostPerPersonInr,
    memberBalances,
    settlements,
    categoryBreakdown,
  };
}
