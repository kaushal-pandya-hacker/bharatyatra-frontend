/**
 * BharatYatra — Customer Reviews API
 * GET /api/user/reviews - Get reviews written by authenticated user
 * POST /api/user/reviews - Submit new or update existing review for a completed journey
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireServerUser } from '@/lib/auth/server-auth';
import { reviewStore } from '@/lib/reviews/review-store';
import { UserDataStore } from '@/lib/user/user-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireServerUser(req);
    const userId = auth.user ? auth.user.id : null;

    if (!userId) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const reviews = reviewStore.getUserReviews(userId);

    return NextResponse.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch user reviews.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireServerUser(req);
    const userId = auth.user ? auth.user.id : 'guest_traveler';
    const customerName = auth.user?.fullName || 'BharatYatra Traveler';
    const customerEmail = auth.user?.email || '';

    const body = await req.json();
    const {
      tripId,
      destination,
      tripDates,
      travellerCount,
      overallRating,
      categoryRatings,
      positiveHighlights,
      improvementSuggestions,
      customPositiveNote,
      customImprovementNote,
      writtenReview,
      photos,
      publicConsent,
    } = body;

    if (!tripId) {
      return NextResponse.json(
        { success: false, error: 'tripId is required to submit a review.' },
        { status: 400 }
      );
    }

    if (!overallRating || overallRating < 1 || overallRating > 5) {
      return NextResponse.json(
        { success: false, error: 'Overall rating must be an integer between 1 and 5.' },
        { status: 400 }
      );
    }

    if (!writtenReview || writtenReview.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please provide detailed written feedback about your journey.' },
        { status: 400 }
      );
    }

    // Submit review in persistent reviewStore
    const { review, isNew } = await reviewStore.submitTripReview({
      tripId,
      userId,
      customerName,
      customerEmail,
      destination: destination || 'Indian Journey',
      tripDates: tripDates || {
        startDate: new Date().toISOString().split('T')[0],
        durationDays: 3,
      },
      travellerCount: travellerCount || 2,
      overallRating,
      categoryRatings,
      positiveHighlights,
      improvementSuggestions,
      customPositiveNote,
      customImprovementNote,
      writtenReview,
      photos,
      publicConsent: Boolean(publicConsent),
    });

    // Mark trip status as COMPLETED in user data store
    if (userId && userId !== 'guest_traveler') {
      try {
        await UserDataStore.saveTrip(userId, {
          id: tripId,
          status: 'COMPLETED',
        });
      } catch (e) {
        // Fallback local persistence
      }
    }

    return NextResponse.json({
      success: true,
      message: isNew
        ? 'Thank you for sharing your experience! Your review has been recorded.'
        : 'Your review has been updated successfully.',
      isNew,
      data: review,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to submit review.' },
      { status: 500 }
    );
  }
}

