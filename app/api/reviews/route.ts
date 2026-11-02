/**
 * BharatYatra — Public Customer Reviews API
 * GET /api/reviews
 * Returns genuine, verified, moderated customer reviews with public display consent.
 */

import { NextRequest, NextResponse } from 'next/server';
import { reviewStore } from '@/lib/reviews/review-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const destination = searchParams.get('destination') || undefined;
    const ratingParam = searchParams.get('rating');
    const rating = ratingParam ? parseInt(ratingParam, 10) : undefined;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    const reviews = reviewStore.getPublicReviews({
      destination,
      rating,
      limit,
    });

    // Strip private email before public distribution
    const publicData = reviews.map((r) => ({
      id: r.id,
      customerName: r.customerName,
      destination: r.destination,
      tripDates: r.tripDates,
      travellerCount: r.travellerCount,
      overallRating: r.overallRating,
      categoryRatings: r.categoryRatings,
      positiveHighlights: r.positiveHighlights,
      improvementSuggestions: r.improvementSuggestions,
      writtenReview: r.writtenReview,
      photos: r.photos,
      officialReply: r.officialReply,
      createdAt: r.createdAt,
    }));

    return NextResponse.json({
      success: true,
      count: publicData.length,
      data: publicData,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch public reviews.' },
      { status: 500 }
    );
  }
}

