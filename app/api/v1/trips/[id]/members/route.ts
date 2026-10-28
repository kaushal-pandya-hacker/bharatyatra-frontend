import { NextRequest, NextResponse } from 'next/server';
import { requireServerUser } from '@/lib/auth/server-auth';
import { UserDataStore } from '@/lib/user/user-store';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * GET /api/v1/trips/[id]/members
 * Retrieves all members belonging to this trip.
 */
export async function GET(req: NextRequest, { params }: RouteContext) {
  const auth = await requireServerUser(req);
  if (auth.response) return auth.response;

  try {
    const tripId = params.id;
    const members = await UserDataStore.getTripMembers(tripId, auth.user.id);

    if (!members) {
      return NextResponse.json(
        { success: false, error: 'Trip not found or access denied.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: members,
    });
  } catch (err: any) {
    const isDbError = err?.name === 'DatabasePersistenceError' || err?.code === 'DATABASE_PERSISTENCE_ERROR';
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to fetch trip members.',
        code: isDbError ? 'DATABASE_ERROR' : 'INTERNAL_ERROR',
      },
      { status: isDbError ? 503 : 500 }
    );
  }
}

/**
 * POST /api/v1/trips/[id]/members
 * Adds a new real member to this trip.
 */
export async function POST(req: NextRequest, { params }: RouteContext) {
  const auth = await requireServerUser(req);
  if (auth.response) return auth.response;

  try {
    const tripId = params.id;
    const body = await req.json();

    const name = (body.name || '').trim();
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Member name is required.' },
        { status: 400 }
      );
    }

    const newMember = await UserDataStore.addTripMember(tripId, auth.user.id, {
      name,
      email: body.email?.trim() || undefined,
      phone: body.phone?.trim() || undefined,
      upiId: body.upiId?.trim() || undefined,
      role: body.role || 'MEMBER',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Member added to trip successfully.',
        data: newMember,
      },
      { status: 201 }
    );
  } catch (err: any) {
    const isDbError = err?.name === 'DatabasePersistenceError' || err?.code === 'DATABASE_PERSISTENCE_ERROR';
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to add trip member.',
        code: isDbError ? 'DATABASE_ERROR' : 'BAD_REQUEST',
      },
      { status: isDbError ? 503 : 400 }
    );
  }
}
