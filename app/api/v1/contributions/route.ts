import { NextRequest, NextResponse } from 'next/server';
import { requireServerUser } from '@/lib/auth/server-auth';
import { contributionService } from '@/lib/contributions/contribution-service';
import { PlaceSubmissionInput, ContributionStatus } from '@/lib/contributions/types';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireServerUser(req);
    if (auth.response) return auth.response;
    const user = auth.user;

    const body: PlaceSubmissionInput = await req.json();

    const submission = await contributionService.submitPlace(body, {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    });

    return NextResponse.json({
      success: true,
      message: 'Place submitted successfully for administrative review.',
      submission,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to submit place.' },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireServerUser(req);
    if (auth.response) return auth.response;
    const user = auth.user;

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status') as ContributionStatus | null;

    const rawSubmissions = await contributionService.getUserContributions(
      user.id,
      statusParam || undefined
    );

    const submissions = rawSubmissions.map((s) => ({
      ...s,
      id: s.id,
      name: s.placeName,
      category: s.category,
      state: s.state,
      district: s.district,
      city: s.city,
      contributor_name: s.contributorName,
      contributor_email: s.contributorEmail,
      submitted_at: s.createdAt,
      status: s.status,
      primary_photo_url: s.photos?.[0] || '',
      photo_count: s.photos?.length || 0,
      rejection_reason: s.rejectionReason,
      approved_place_id: s.approvedPlaceId,
      reward_coupon_code: s.rewardCouponCode,
      approved_at: s.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to fetch contributions.' },
      { status: 500 }
    );
  }
}

