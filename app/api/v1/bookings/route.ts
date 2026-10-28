import { NextRequest, NextResponse } from 'next/server';
import { requireServerUser } from '@/lib/auth/server-auth';
import { UserDataStore } from '@/lib/user/user-store';

/**
 * GET /api/v1/bookings
 * Retrieves all bookings owned by the authenticated caller.
 * New users receive an empty list ([]) by default.
 */
export async function GET(req: NextRequest) {
  const auth = await requireServerUser(req);
  if (auth.response) return auth.response;

  try {
    const bookings = await UserDataStore.getUserBookings(auth.user.id);
    return NextResponse.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/bookings
 * Creates a new booking reservation for the authenticated caller.
 * Anchors user_id strictly to auth.user.id to eliminate IDOR vulnerabilities.
 */
export async function POST(req: NextRequest) {
  const auth = await requireServerUser(req);
  if (auth.response) return auth.response;

  try {
    const body = await req.json();

    // Prevent IDOR tampering: discard any client-supplied userId
    const { userId: _d1, user_id: _d2, ...safeBookingPayload } = body;

    const created = await UserDataStore.createBooking(auth.user.id, safeBookingPayload);

    return NextResponse.json(
      {
        success: true,
        message: 'Booking created successfully.',
        data: created,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create booking' },
      { status: 400 }
    );
  }
}

