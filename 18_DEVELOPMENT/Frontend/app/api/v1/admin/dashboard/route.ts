import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { adminDataStore } from '@/lib/admin/admin-store';

/**
 * GET /api/v1/admin/dashboard
 * Returns real-time administrative operational metrics and marketplace health data with date filtering.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) {
      return auth.response;
    }

    const { searchParams } = new URL(req.url);
    const dateRange = searchParams.get('range') || 'all';

    const data = adminDataStore.getDashboardMetrics(dateRange);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err?.message || 'Failed to fetch operational metrics.',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
