import { NextRequest, NextResponse } from 'next/server';
import { requireServerUser } from '@/lib/auth/server-auth';
import { UserDataStore } from '@/lib/user/user-store';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * GET /api/v1/bookings/[id]
 * Retrieves booking details if and only if it belongs to the authenticated user.
 */
export async function GET(req: NextRequest, { params }: RouteContext) {
  const auth = await requireServerUser(req);
  if (auth.response) return auth.response;

  try {
    const booking = await UserDataStore.getBookingById(params.id, auth.user.id);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found or access denied.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/bookings/[id]
 * Cancels a booking reservation with verified ownership check.
 */
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const auth = await requireServerUser(req);
  if (auth.response) return auth.response;

  try {
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || body.cancellationReason || 'User requested cancellation';

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

