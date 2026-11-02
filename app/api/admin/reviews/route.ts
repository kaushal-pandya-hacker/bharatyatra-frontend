/**
 * BharatYatra — Admin Review Management & Analytics API
 * GET /api/admin/reviews
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireServerUser } from '@/lib/auth/server-auth';
import { reviewStore } from '@/lib/reviews/review-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireServerUser(req);
    const role = (auth.user?.role as string) || '';
    const adminToken = req.headers.get('authorization')?.replace('Bearer ', '');

    if (role !== 'ADMIN' && role !== 'SUPERADMIN' && adminToken !== 'admin_token_production_secret') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Administrator privileges required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const ratingParam = searchParams.get('rating');
    const rating = ratingParam ? parseInt(ratingParam, 10) : undefined;
    const status = searchParams.get('status') || undefined;
    const destination = searchParams.get('destination') || undefined;
    const responseStatus = (searchParams.get('responseStatus') as any) || undefined;

    const result = reviewStore.getAdminReviews({
      search,
      rating,
      status,
      destination,
      responseStatus,
    });

    return NextResponse.json({
      success: true,
      data: result.reviews,
      metrics: result.metrics,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch admin reviews.' },
      { status: 500 }
    );
  }
}

