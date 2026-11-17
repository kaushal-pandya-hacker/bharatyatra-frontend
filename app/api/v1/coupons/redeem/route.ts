import { NextRequest, NextResponse } from 'next/server';
import { contributorRewardService } from '@/lib/rewards/contributor-reward-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, userId, userEmail, bookingId, bookingAmountInr } = body;

    if (!code || !bookingId || !bookingAmountInr) {
      return NextResponse.json(
        { success: false, error: 'code, bookingId, and bookingAmountInr are required.' },
        { status: 400 }
      );
    }

    const result = contributorRewardService.redeemCoupon({
      code,
      userId,
      userEmail,
      bookingId,
      bookingAmountInr,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        code: result.coupon?.code,
        status: result.coupon?.status,
        discountAppliedInr: result.discountSavedInr,
        redeemedBookingId: result.coupon?.redeemedBookingId,
        redeemedAt: result.coupon?.redeemedAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to redeem coupon.' },
      { status: 500 }
    );
  }
}
