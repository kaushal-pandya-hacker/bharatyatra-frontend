/**
 * BharatYatra — Customer Review Management & Two-Way Thread API
 * PUT /api/user/reviews/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireServerUser } from '@/lib/auth/server-auth';
import { reviewStore } from '@/lib/reviews/review-store';

export const dynamic = 'force-dynamic';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireServerUser(req);
    const userId = auth.user ? auth.user.id : null;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to manage review.' },
        { status: 401 }
      );
    }

    const reviewId = params.id;
    const body = await req.json();

    // Check if this is a message thread reply
    if (body.action === 'REPLY' && body.message) {
      const updated = await reviewStore.addCustomerReply(reviewId, userId, body.message);
      return NextResponse.json({
        success: true,
        message: 'Your reply has been sent to the BharatYatra operations desk.',
        data: updated,
      });
    }

    // Otherwise, edit the review
    const existing = reviewStore.getReviewById(reviewId);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Review not found.' },
        { status: 404 }
      );
    }

    if (existing.userId !== userId && (auth.user?.role as string) !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'You are not authorized to edit this review.' },
        { status: 403 }
      );
    }

    const { review } = await reviewStore.submitTripReview({
      tripId: existing.tripId,
      userId,
      customerName: auth.user?.fullName || existing.customerName,
      customerEmail: auth.user?.email || existing.customerEmail,
      destination: existing.destination,
      tripDates: existing.tripDates,
      travellerCount: existing.travellerCount,
      overallRating: body.overallRating || existing.overallRating,
      categoryRatings: body.categoryRatings || existing.categoryRatings,
      positiveHighlights: body.positiveHighlights || existing.positiveHighlights,
      improvementSuggestions: body.improvementSuggestions || existing.improvementSuggestions,
      customPositiveNote: body.customPositiveNote ?? existing.customPositiveNote,
      customImprovementNote: body.customImprovementNote ?? existing.customImprovementNote,
      writtenReview: body.writtenReview || existing.writtenReview,
      photos: body.photos || existing.photos,
      publicConsent: body.publicConsent !== undefined ? body.publicConsent : existing.publicConsent,
    });

    return NextResponse.json({
      success: true,
      message: 'Review successfully updated.',
      data: review,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update review.' },
      { status: 500 }
    );
  }
}

