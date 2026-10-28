import { NextRequest, NextResponse } from 'next/server';
import { requireServerUser } from '@/lib/auth/server-auth';
import { UserDataStore } from '@/lib/user/user-store';

interface RouteContext {
  params: {
    id: string;
    memberId: string;
  };
}

/**
 * DELETE /api/v1/trips/[id]/members/[memberId]
 * Removes a member from the trip.
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const auth = await requireServerUser(req);
  if (auth.response) return auth.response;

  try {
    const { id: tripId, memberId } = params;
    const removed = await UserDataStore.removeTripMember(tripId, memberId, auth.user.id);

    if (!removed) {
      return NextResponse.json(
        { success: false, error: 'Member not found or unauthorized to remove.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Member removed from trip successfully.',
    });
  } catch (err: any) {
    const isDbError = err?.name === 'DatabasePersistenceError' || err?.code === 'DATABASE_PERSISTENCE_ERROR';
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to remove member.',
        code: isDbError ? 'DATABASE_ERROR' : 'INTERNAL_ERROR',
      },
      { status: isDbError ? 503 : 500 }
    );
  }
}
