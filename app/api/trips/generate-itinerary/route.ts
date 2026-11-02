/**
 * BharatYatra — Generate AI Itinerary API
 * POST /api/trips/generate-itinerary
 * GET /api/trips/generate-itinerary
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  customizeTripDuration,
  calculateTripDurationRecommendation,
} from '@/lib/ai-planner/trip-duration-intelligence-engine';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const origin = body.origin || body.originCity || body.from || 'Ahmedabad';
    let rawDest = body.destinations || body.destination || body.to;

    if (!rawDest) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide at least one destination (e.g. destinations: ["Udaipur"]).',
        },
        { status: 400 }
      );
    }

    const destinations: string[] = Array.isArray(rawDest)
      ? rawDest
      : typeof rawDest === 'string'
      ? rawDest.split(',').map((s: string) => s.trim()).filter(Boolean)
      : ['Jaipur'];

    const durationDays = parseInt(body.durationDays || body.duration || body.days || '0', 10);
    const travelMode = body.travelMode || body.mode || 'car';
    const travelPace = body.travelPace || body.pace || 'balanced';
    const travellers = body.travellers || body.travelers || body.adults || 2;
    const budget = typeof body.budget === 'number' ? body.budget : undefined;
    const preferences = body.preferences || body.interests || [];

    // If durationDays is specified and > 0, generate for that custom duration.
    // Otherwise, generate for the recommended duration.
    let planData;
    if (durationDays > 0) {
      planData = customizeTripDuration({
        origin,
        destinations,
        customDays: durationDays,
        travelMode,
        travelPace,
        travellers,
        budget,
        preferences,
      });
    } else {
      const rec = calculateTripDurationRecommendation({
        origin,
        destinations,
        travelMode,
        travelPace,
        travellers,
        budget,
        preferences,
      });
      planData = {
        isFeasible: true,
        customDays: rec.recommendedDuration.days,
        customNights: rec.recommendedDuration.nights,
        originalRecommendedDays: rec.recommendedDuration.days,
        minimumDays: rec.minimumDuration.days,
        relaxedDays: rec.relaxedDuration.days,
        status: 'OPTIMAL' as const,
        explanation: 'AI-recommended optimal duration',
        updatedItinerary: rec.recommendedItinerary,
        budgetEstimate: rec.budgetEstimate,
        changesSummary: {
          sightseeingDays: rec.recommendedItinerary.filter((d) => d.dayType === 'sightseeing').length,
          transitDays: rec.recommendedItinerary.filter((d) => d.dayType === 'transit_and_explore' || d.dayType === 'return_transit').length,
          freeLeisureDays: rec.recommendedItinerary.filter((d) => d.dayType === 'leisure' || d.dayType === 'acclimatization').length,
          hotelNights: rec.recommendedDuration.nights,
        },
      };
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          origin,
          destinations,
          durationDays: planData.customDays,
          hotelNights: planData.customNights,
          isFeasible: planData.isFeasible,
          status: planData.status,
          explanation: planData.explanation,
          feasibilityWarning: planData.feasibilityWarning,
          itinerary: planData.updatedItinerary,
          budgetEstimate: planData.budgetEstimate,
          changesSummary: planData.changesSummary,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Error in /api/trips/generate-itinerary:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'An error occurred during itinerary generation.',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get('origin') || 'Ahmedabad';
    const dest = searchParams.get('destination') || searchParams.get('destinations') || 'Udaipur';
    const days = parseInt(searchParams.get('days') || searchParams.get('duration') || '0', 10);
    const mode = searchParams.get('mode') || 'car';
    const pace = searchParams.get('pace') || 'balanced';

    const destinations = dest.split(',').map((s) => s.trim()).filter(Boolean);

    let planData;
    if (days > 0) {
      planData = customizeTripDuration({
        origin,
        destinations,
        customDays: days,
        travelMode: mode,
        travelPace: pace,
      });
    } else {
      const rec = calculateTripDurationRecommendation({
        origin,
        destinations,
        travelMode: mode,
        travelPace: pace,
      });
      planData = {
        isFeasible: true,
        customDays: rec.recommendedDuration.days,
        customNights: rec.recommendedDuration.nights,
        originalRecommendedDays: rec.recommendedDuration.days,
        minimumDays: rec.minimumDuration.days,
        relaxedDays: rec.relaxedDuration.days,
        status: 'OPTIMAL' as const,
        explanation: 'AI-recommended optimal duration',
        updatedItinerary: rec.recommendedItinerary,
        budgetEstimate: rec.budgetEstimate,
        changesSummary: {
          sightseeingDays: rec.recommendedItinerary.filter((d) => d.dayType === 'sightseeing').length,
          transitDays: rec.recommendedItinerary.filter((d) => d.dayType === 'transit_and_explore' || d.dayType === 'return_transit').length,
          freeLeisureDays: rec.recommendedItinerary.filter((d) => d.dayType === 'leisure' || d.dayType === 'acclimatization').length,
          hotelNights: rec.recommendedDuration.nights,
        },
      };
    }

    return NextResponse.json(
      {
        success: true,
        data: planData,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to generate itinerary',
      },
      { status: 500 }
    );
  }
}

