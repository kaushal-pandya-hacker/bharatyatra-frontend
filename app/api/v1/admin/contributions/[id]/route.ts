import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { contributionService } from '@/lib/contributions/contribution-service';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const [submission, reviewHistory] = await Promise.all([
      contributionService.getContributionById(params.id),
      contributionService.getReviewHistory(params.id),
    ]);

    if (!submission) {
      return NextResponse.json(
        { success: false, message: 'Contribution submission not found.' },
        { status: 404 }
      );
    }

    const dossier = {
      submission: {
        id: submission.id,
        name: submission.placeName,
        category: submission.category,
        description: submission.detailedDescription,
        short_description: submission.shortDescription,
        state: submission.state,
        district: submission.district,
        city: submission.city || '',
        address: submission.address,
        latitude: submission.latitude,
        longitude: submission.longitude,
        status: submission.status,
        contributor_id: submission.contributorId,
        contributor_name: submission.contributorName,
        contributor_email: submission.contributorEmail || '',
        best_time_to_visit: submission.bestTimeToVisit || '',
        timings: submission.openingHours || '',
        entry_fee: submission.entryFee || '',
        facilities: submission.facilities || [],
        travel_tips: submission.travelTips || [],
        nearby_attractions: submission.nearbyAttractions || [],
        submitted_at: submission.createdAt,
        approved_at: submission.approvedAt,
        rejection_reason: submission.rejectionReason,
      },
      photos: (submission.photos || []).map((photoUrl, idx) => ({
        id: `photo_${idx}`,
        photo_url: photoUrl,
        caption: idx === 0 ? 'Primary Cover Photo' : `Photograph ${idx + 1}`,
        is_primary: idx === 0,
      })),
      reviews: reviewHistory,
      history: [],
    };

    return NextResponse.json({
      success: true,
      dossier,
      submission,
      reviewHistory,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to fetch contribution details.' },
      { status: 500 }
    );
  }
}

