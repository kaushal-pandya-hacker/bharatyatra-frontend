/**
 * BharatYatra AI 2.0 — Itinerary Recalculation API
 * POST /api/ai/itinerary/recalculate
 *
 * Recalculates day-by-day travel plan when duration or pace is altered.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PureItineraryService } from '@/lib/ai-planner/pure-itinerary-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const originCity = body.origin || body.originCity || body.from || 'Ahmedabad';
    const destination = body.destination || body.dest || body.to || 'Ladakh';
    const destinations = Array.isArray(body.destinations)
      ? body.destinations.map((d: any) => typeof d === 'string' ? { state: d } : d)
      : [{ state: destination }];

    const newDurationDays = parseInt(body.newDurationDays || body.durationDays || body.days || '5', 10);
    const pace = body.pace || body.travelPace || 'balanced';

    const updatedPlan = PureItineraryService.generatePureItinerary({
      origin: { city: originCity, country: 'India' },
      destinations,
      durationDays: newDurationDays,
      pace: pace as any,
      travelers: body.travelers || { adults: body.adults || 2 },
      startDate: body.startDate || body.travelDate,
      preferenceProfile: body.preferenceProfile,
    });

    return NextResponse.json({
      success: true,
      action: 'recalculate',
      pricingIncluded: false,
      itinerary: updatedPlan,
      data: updatedPlan,
      ...updatedPlan,
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to recalculate itinerary',
      },
      { status: 500 }
    );
  }
}
