import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { contributorRewardService } from '@/lib/rewards/contributor-reward-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/admin/rewards
 * Administrative directory of 7% community contributor coupons with usage status and telemetry.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdminUser(req);
  if (auth.response) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;

    const coupons = contributorRewardService.getAllCoupons({ status, search });
    const stats = contributorRewardService.getRewardStats();

    return NextResponse.json({
      success: true,
      stats,
      data: coupons,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to list reward coupons' },
      { status: 500 }
    );
  }
}
