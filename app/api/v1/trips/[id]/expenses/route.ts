import { NextRequest, NextResponse } from 'next/server';
import { requireServerUser } from '@/lib/auth/server-auth';
import { UserDataStore } from '@/lib/user/user-store';
import { computeFullTripExpenseSummary } from '@/lib/trips/group-expense-engine';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * GET /api/v1/trips/[id]/expenses
 * Retrieves all real members, real expenses, settlements, and dynamic summary for this trip.
 * Strictly enforces trip ownership/membership authorization.
 */
export async function GET(req: NextRequest, { params }: RouteContext) {
  const auth = await requireServerUser(req);
  if (auth.response) return auth.response;

  try {
    const tripId = params.id;
    const [members, expenses, settlements] = await Promise.all([
      UserDataStore.getTripMembers(tripId, auth.user.id),
      UserDataStore.getTripExpenses(tripId, auth.user.id),
      UserDataStore.getSettlements(tripId, auth.user.id),
    ]);

    if (!members) {
      // 404 prevents enumeration and data leakage of other users' trips
      return NextResponse.json(
        { success: false, error: 'Trip not found or access denied.' },
        { status: 404 }
      );
    }

    const safeExpenses = expenses || [];
    const safeSettlements = settlements || [];
    const summary = computeFullTripExpenseSummary(members, safeExpenses, safeSettlements);

    return NextResponse.json({
      success: true,
      data: {
        tripId,
        members,
        expenses: safeExpenses,
        settlements: safeSettlements,
        summary,
      },
    });
  } catch (err: any) {
    const isDbError = err?.name === 'DatabasePersistenceError' || err?.code === 'DATABASE_PERSISTENCE_ERROR';
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to fetch trip expenses.',
        code: isDbError ? 'DATABASE_ERROR' : 'INTERNAL_ERROR',
      },
      { status: isDbError ? 503 : 500 }
    );
  }
}

/**
 * POST /api/v1/trips/[id]/expenses
 * Creates a real expense for the trip.
 * Validates positive amounts, payer membership, and participant membership.
 * Persists to the database with integer minor unit precision.
 */
export async function POST(req: NextRequest, { params }: RouteContext) {
  const auth = await requireServerUser(req);
  if (auth.response) return auth.response;

  try {
    const tripId = params.id;
    const body = await req.json();

    const title = (body.title || '').trim();
    const amountInr = Number(body.amountInr);
    const paidByMemberId = body.paidByMemberId;
    const category = body.category || 'Food';
    const splitType = body.splitType || 'EQUAL';
    const participantMemberIds = body.participantMemberIds;
    const customSplits = body.customSplits;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Expense title / description is required.' },
        { status: 400 }
      );
    }

    if (isNaN(amountInr) || amountInr <= 0) {
      return NextResponse.json(
        { success: false, error: 'Expense amount must be a positive number greater than zero.' },
        { status: 400 }
      );
    }

    if (!paidByMemberId) {
      return NextResponse.json(
        { success: false, error: 'Payer member ID is required.' },
        { status: 400 }
      );
    }

    const createdExpense = await UserDataStore.createTripExpense(tripId, auth.user.id, {
      title,
      amountInr,
      paidByMemberId,
      category,
      splitType,
      participantMemberIds,
      customSplits,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Expense recorded successfully.',
        data: createdExpense,
      },
      { status: 201 }
    );
  } catch (err: any) {
    const isDbError = err?.name === 'DatabasePersistenceError' || err?.code === 'DATABASE_PERSISTENCE_ERROR';
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to record expense.',
        code: isDbError ? 'DATABASE_ERROR' : 'BAD_REQUEST',
      },
      { status: isDbError ? 503 : 400 }
    );
  }
}
