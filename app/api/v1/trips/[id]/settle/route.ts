import { NextRequest, NextResponse } from 'next/server';
import { requireServerUser } from '@/lib/auth/server-auth';
import { UserDataStore } from '@/lib/user/user-store';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * POST /api/v1/trips/[id]/settle
 * Records a confirmed settlement transaction between two trip members.
 * Enforces server authorization.
 */
export async function POST(req: NextRequest, { params }: RouteContext) {
  const auth = await requireServerUser(req);
  if (auth.response) return auth.response;

  try {
    const tripId = params.id;
    const body = await req.json();

    const { fromMemberId, toMemberId, amountInr, status, paymentRef, refCode, fromMemberName, toMemberName } = body;

    if (!fromMemberId || !toMemberId) {
      return NextResponse.json(
        { success: false, error: 'Both fromMemberId and toMemberId are required.' },
        { status: 400 }
      );
    }

    const recorded = await UserDataStore.recordSettlement(tripId, auth.user.id, {
      fromMemberId,
      toMemberId,
      amountInr: Number(amountInr || 0),
      status: status || 'SETTLED',
      paymentRef: paymentRef || refCode,
      fromMemberName,
      toMemberName,
    });

    return NextResponse.json({
      success: true,
      message: 'Settlement recorded successfully.',
      data: recorded,
    });
  } catch (err: any) {
    const isDbError = err?.name === 'DatabasePersistenceError' || err?.code === 'DATABASE_PERSISTENCE_ERROR';
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to record settlement.',
        code: isDbError ? 'DATABASE_ERROR' : 'INTERNAL_ERROR',
      },
      { status: isDbError ? 503 : 500 }
    );
  }
}
