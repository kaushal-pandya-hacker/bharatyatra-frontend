/**
 * BharatYatra AI 2.0 — Pure AI Itinerary Generation API
 * POST /api/ai/itinerary/generate
 *
 * Generates an intelligent, altitude-safe, geographically sequenced day-wise travel plan
 * adhering strictly to pure travel intelligence (zero pricing calculations).
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

    const durationDays = body.durationDays || body.days ? parseInt(body.durationDays || body.days, 10) : undefined;
    const pace = body.pace || body.travelPace || 'balanced';

    const plan = PureItineraryService.generatePureItinerary({
      origin: { city: originCity, country: 'India' },
      destinations,
      durationDays,
      pace: pace as any,
      travelers: body.travelers || { adults: body.adults || 2 },
      startDate: body.startDate || body.travelDate,
      preferenceProfile: body.preferenceProfile,
    });

    return NextResponse.json({
      success: true,
      pricingIncluded: false,
      itinerary: plan,
      data: plan,
      ...plan,
    }, { status: 200 });
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
