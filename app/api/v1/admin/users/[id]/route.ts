import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { adminDataStore } from '@/lib/admin/admin-store';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/admin/users/[id]
 * Retrieves the complete User 360 Dossier covering all 11 operational dimensions:
 * Personal Info, Travel Overview, Active Trips, Upcoming Trips, Trip History,
 * Bookings, Payments, Rewards, Saved Info, Notifications, Account Activity.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminUser(req);
  if (auth.response) return auth.response;

  try {
    const userId = params.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User identifier is required' },
        { status: 400 }
      );
    }

    const dossier = adminDataStore.getUser360(userId);
    if (!dossier) {
      return NextResponse.json(
        { success: false, error: 'User profile not found in platform registry' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dossier,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch User 360 profile' },
      { status: 500 }
    );
  }
}
