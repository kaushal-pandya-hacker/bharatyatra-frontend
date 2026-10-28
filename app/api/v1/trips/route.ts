import { NextRequest, NextResponse } from 'next/server';
import { requireServerUser } from '@/lib/auth/server-auth';
import { UserDataStore } from '@/lib/user/user-store';

/**
 * GET /api/v1/trips
 * Retrieves all trips owned by the authenticated user.
 * Unauthenticated requests return 401.
 */
export async function GET(req: NextRequest) {
  const auth = await requireServerUser(req);
  if (auth.response) return auth.response;

  try {
    const trips = await UserDataStore.getUserTrips(auth.user.id);
    return NextResponse.json({
      success: true,
      count: trips.length,
      data: trips,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch user trips' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/trips
 * Creates or updates a trip for the authenticated user.
 * BOLA/IDOR Defense: Any userId supplied in the request body is strictly discarded;
 * ownership is anchored strictly to auth.user.id.
 */
export async function POST(req: NextRequest) {
  const auth = await requireServerUser(req);
  if (auth.response) return auth.response;

  try {
    const body = await req.json();

    // Defense in Depth: Discard any client-supplied userId
    const { userId: _discarded1, user_id: _discarded2, ...safeTripPayload } = body;

    const savedTrip = await UserDataStore.saveTrip(auth.user.id, safeTripPayload);

    return NextResponse.json(
      {
        success: true,
        message: 'Trip saved successfully.',
        data: savedTrip,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to save trip' },
      { status: 400 }
    );
  }
}

