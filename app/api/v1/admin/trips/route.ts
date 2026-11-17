import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { adminDataStore } from '@/lib/admin/admin-store';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/admin/trips
 * Lists all platform trips with search, destination, and status filters.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdminUser(req);
  if (auth.response) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || undefined;
    const status = searchParams.get('status') || undefined;
    const destination = searchParams.get('destination') || undefined;

    const trips = adminDataStore.getTrips({ search, status, destination });

    return NextResponse.json({
      success: true,
      total: trips.length,
      data: trips,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to list platform trips' },
      { status: 500 }
    );
  }
}
