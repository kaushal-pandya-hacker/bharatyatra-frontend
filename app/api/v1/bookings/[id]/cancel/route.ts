import { NextRequest, NextResponse } from 'next/server';
import { requireServerUser } from '@/lib/auth/server-auth';
import { UserDataStore } from '@/lib/user/user-store';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * POST /api/v1/bookings/[id]/cancel
 * Cancels a booking reservation with strictly verified caller ownership.
 */
export async function POST(req: NextRequest, { params }: RouteContext) {
  const auth = await requireServerUser(req);
  if (auth.response) return auth.response;

  try {
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || body.cancellationReason || 'Customer requested cancellation via portal';

    const cancelled = await UserDataStore.cancelBooking(params.id, auth.user.id, reason);
    if (!cancelled) {
      return NextResponse.json(
        { success: false, error: 'Booking not found or unauthorized to cancel.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully.',
      data: cancelled,
    });
  } catch (err: any) {
    const isDbError = err?.name === 'DatabasePersistenceError' || err?.code === 'DATABASE_PERSISTENCE_ERROR';
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to cancel booking', code: isDbError ? 'DATABASE_ERROR' : 'BAD_REQUEST' },
      { status: isDbError ? 503 : 400 }
    );
  }
}

