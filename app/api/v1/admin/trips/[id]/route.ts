import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { adminDataStore } from '@/lib/admin/admin-store';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/admin/trips/[id]
 * Inspects a specific trip's complete operational dossier (itinerary, bookings, telemetry).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminUser(req);
  if (auth.response) return auth.response;

  try {
    const tripId = params.id;
    const trip = adminDataStore.getTripById(tripId);

    if (!trip) {
      return NextResponse.json(
        { success: false, error: 'Trip record not found' },
        { status: 404 }
      );
    }

    const user = adminDataStore.getUserById(trip.userId);
    const relatedBookings = adminDataStore
      .getBookings()
      .filter((b) => b.customerEmail.toLowerCase() === trip.customerEmail.toLowerCase());

    return NextResponse.json({
      success: true,
      data: {
        trip,
        user,
        relatedBookings,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch trip details' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/admin/trips/[id]
 * Authorized administrative support actions: Add internal notes, flag emergencies, update status.
 * Never silently modifies user itineraries without audited logs.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminUser(req);
  if (auth.response) return auth.response;

  try {
    const tripId = params.id;
    const body = await req.json();
    const { status, emergencyFlag, emergencyNote, internalNotes } = body;

    const updated = adminDataStore.updateTripSupportStatus(
      tripId,
      { status, emergencyFlag, emergencyNote, internalNotes },
      auth.user.email
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Trip not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Trip support parameters updated successfully.',
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update trip support' },
      { status: 500 }
    );
  }
}
