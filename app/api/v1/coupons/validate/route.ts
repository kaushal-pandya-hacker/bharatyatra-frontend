import { NextRequest, NextResponse } from 'next/server';
import { contributorRewardService } from '@/lib/rewards/contributor-reward-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, userId, userEmail, bookingAmountInr, category } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Coupon code is required.' },
        { status: 400 }
      );
    }

    if (!bookingAmountInr || typeof bookingAmountInr !== 'number' || bookingAmountInr <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid bookingAmountInr is required.' },
        { status: 400 }
      );
    }

    const result = contributorRewardService.validateCoupon({
      code,
      userId,
      userEmail,
      bookingAmountInr,
      category,
    });

    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        code: result.coupon?.code,
        discountPercent: result.discountPercent,
        discountAmountInr: result.discountAmountInr,
        finalAmountInr: result.finalAmountInr,
        validUntil: result.coupon?.validUntil,
        placeName: result.coupon?.placeName,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to validate coupon.' },
      { status: 500 }
    );
  }
}
