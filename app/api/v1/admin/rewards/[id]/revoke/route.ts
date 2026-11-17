import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { contributorRewardService } from '@/lib/rewards/contributor-reward-service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/admin/rewards/[id]/revoke
 * Revokes a fraudulent or misused coupon code.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminUser(req);
  if (auth.response) return auth.response;

  try {
    const couponCode = params.id;
    const body = await req.json();
    const { reason } = body;

    if (!reason || reason.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: 'A specific reason (minimum 5 characters) is required to revoke a coupon.' },
        { status: 400 }
      );
    }

    const revoked = contributorRewardService.revokeCoupon(couponCode, auth.user.email, reason);
    if (!revoked) {
      return NextResponse.json(
        { success: false, error: 'Coupon code not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Coupon ${couponCode} has been revoked.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to revoke coupon' },
      { status: 500 }
    );
  }
}
