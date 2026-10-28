import { NextRequest, NextResponse } from 'next/server';
import { requireServerUser } from '@/lib/auth/server-auth';
import { UserDataStore } from '@/lib/user/user-store';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * GET /api/v1/trips/[id]
 * Retrieves a single trip only if it is owned by the authenticated caller.
 */
export async function GET(req: NextRequest, { params }: RouteContext) {
  const auth = await requireServerUser(req);
  if (auth.response) return auth.response;

  try {
    const trip = await UserDataStore.getTripById(params.id, auth.user.id);
    if (!trip) {
      // 404 prevents enumeration and data leakage of other users' trips
      return NextResponse.json(
        { success: false, error: 'Trip not found or access denied.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: trip });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch trip' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/trips/[id]
 * Updates a trip. Enforces strict ownership.
 */
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const auth = await requireServerUser(req);
  if (auth.response) return auth.response;

  try {
    const existing = await UserDataStore.getTripById(params.id, auth.user.id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Trip not found or unauthorized modification.' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { userId: _d1, user_id: _d2, id: _d3, ...safeUpdates } = body;

    const updated = await UserDataStore.saveTrip(auth.user.id, {
      ...existing,
      ...safeUpdates,
      id: params.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Trip updated successfully.',
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update trip' },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/v1/trips/[id]
 * Deletes a trip. Enforces strict ownership.
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const auth = await requireServerUser(req);
  if (auth.response) return auth.response;

  try {
    const deleted = await UserDataStore.deleteTrip(params.id, auth.user.id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Trip not found or unauthorized to delete.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Trip deleted successfully.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete trip' },
      { status: 500 }
    );
  }
}

