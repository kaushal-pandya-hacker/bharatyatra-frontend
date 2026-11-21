import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { contributionService } from '@/lib/contributions/contribution-service';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const state = searchParams.get('state') || undefined;
    const status = searchParams.get('status') || undefined;
    const sort = (searchParams.get('sort') as any) || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const [result, stats] = await Promise.all([
      contributionService.getAdminContributions({
        search,
        category,
        state,
        status,
        sort,
        page,
        limit,
      }),
      contributionService.getAdminStats(),
    ]);

    return NextResponse.json({
      success: true,
      stats,
      ...result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to fetch admin contributions.' },
      { status: 500 }
    );
  }
}

