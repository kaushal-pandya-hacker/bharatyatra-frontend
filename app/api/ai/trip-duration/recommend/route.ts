/**
 * BharatYatra AI 2.0 — Dual Trip Duration Recommendation API
 * POST /api/ai/trip-duration/recommend
 * GET /api/ai/trip-duration/recommend
 *
 * Evaluates origin and destination to return:
 * - Minimum Possible Duration (shortest realistic duration covering essential highlights)
 * - AI-Recommended Comfortable Duration (balanced pace, adequate sightseeing, acclimatization)
 * - Transparent measurable confidence scoring & data freshness
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  calculateDualTripDuration,
  DurationEngineInput,
} from '@/lib/ai-planner/duration-engine';
import { calculateTripDurationRecommendation } from '@/lib/ai-planner/trip-duration-intelligence-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const origin = body.origin || body.originCity || body.from || 'Ahmedabad';
    const destination = body.destination || body.dest || body.to || 'Ladakh';
    const destinations = Array.isArray(body.destinations)
      ? body.destinations
      : destination.includes(',')
      ? destination.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [destination];

    const input: DurationEngineInput = {
      originCity: origin,
      destinations,
      travelPace: body.travelPace || body.pace || 'balanced',
      travelDate: body.travelDate || body.startDate,
      travelerComposition: body.travelers || {
        adults: body.adults || 2,
        seniors: body.seniors || 0,
        children: body.children || 0,
      },
    };

    const recommendation = calculateDualTripDuration(input);
    const fullIntelligence = calculateTripDurationRecommendation({
      origin,
      destinations,
      travelMode: body.travelMode || body.mode || 'car',
      travelPace: body.travelPace || body.pace || 'balanced',
      preferences: body.preferences || body.interests || [],
      budget: body.budget,
      travellers: body.travellers || body.adults || 2,
      travelDate: body.travelDate || body.startDate,
    });

    return NextResponse.json(
      {
        success: true,
        ...recommendation,
        ...fullIntelligence,
        recommendedDuration: fullIntelligence.recommendedDuration,
        minimumDuration: fullIntelligence.minimumDuration,
        relaxedDuration: fullIntelligence.relaxedDuration,
        recommendation: {
          ...recommendation,
          ...fullIntelligence,
          recommendedDuration: fullIntelligence.recommendedDuration,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Error in trip duration recommendation API:', err);
    return NextResponse.json(
      {
        success: false,
        origin: 'Unknown',
        destination: 'Unknown',
        minimumDuration: { days: null, explanation: err.message || 'Failed to calculate duration', constraints: [] },
        comfortableDuration: { days: null, explanation: err.message || 'Failed to calculate duration', constraints: [] },
        recommendedDuration: { days: null, explanation: err.message || 'Failed to calculate duration', constraints: [] },
        confidence: { score: null, dataFreshness: 'N/A', dataCompleteness: 0, missingData: [err.message] },
        sources: [],
        warnings: [err.message || 'An error occurred during calculation'],
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get('origin') || searchParams.get('from') || 'Ahmedabad';
    const destination = searchParams.get('destination') || searchParams.get('to') || 'Ladakh';
    const pace = (searchParams.get('pace') || 'balanced') as any;

    const recommendation = calculateDualTripDuration({
      originCity: origin,
      destinations: [destination],
      travelPace: pace,
    });

    return NextResponse.json(
      {
        success: true,
        ...recommendation,
        recommendedDuration: recommendation.recommendedDuration || recommendation.comfortableDuration,
        recommendation: {
          ...recommendation,
          recommendedDuration: recommendation.recommendedDuration || recommendation.comfortableDuration,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
