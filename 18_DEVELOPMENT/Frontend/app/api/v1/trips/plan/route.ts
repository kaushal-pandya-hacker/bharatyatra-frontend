import { NextRequest, NextResponse } from 'next/server';
import { generateMasterTripPlan } from '@/lib/ai-planner/planner-service';
import { PureItineraryService } from '@/lib/ai-planner/pure-itinerary-service';
import { TripPlanningRequest } from '@/lib/ai-planner/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const originCity = searchParams.get('origin') || searchParams.get('originCity') || 'Ahmedabad';
    const destParam = searchParams.get('destination') || searchParams.get('dest') || 'Dwarka';
    const destinations = destParam.includes(',')
      ? destParam.split(',').map((s) => s.trim()).filter(Boolean)
      : [destParam.trim()];
    const daysStr = searchParams.get('days') || searchParams.get('duration');
    const durationDays = daysStr ? parseInt(daysStr, 10) : undefined;
    const paceParam = (searchParams.get('pace') || 'balanced').toLowerCase();
    const pace = paceParam === 'relaxed' ? 'relaxed' : paceParam === 'fast' || paceParam === 'active' ? 'fast' : 'balanced';
    const startDate = searchParams.get('startDate') || undefined;

    // By default GET on /trips/plan provides Pure Travel Intelligence (12-section response format)
    const pureItinerary = PureItineraryService.generatePureItinerary({
      origin: { city: originCity, country: 'India' },
      destinations: destinations.map((d) => ({ state: d })),
      durationDays,
      pace: pace as any,
      startDate,
    });

    return NextResponse.json(
      {
        success: true,
        data: pureItinerary,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to process AI trip planning request.',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { searchParams } = new URL(req.url);

    let planningRequest: TripPlanningRequest = {};

    // Support both natural language string prompt and structured JSON body
    if (typeof body.prompt === 'string') {
      planningRequest.naturalPrompt = body.prompt;
    } else if (typeof body.naturalPrompt === 'string') {
      planningRequest.naturalPrompt = body.naturalPrompt;
    }

    if (body.origin) {
      planningRequest.origin = typeof body.origin === 'string' ? { city: body.origin, country: 'India' } : body.origin;
    }
    if (body.destinations) {
      planningRequest.destinations = Array.isArray(body.destinations) 
        ? body.destinations.map((d: any) => typeof d === 'string' ? { state: d } : d) 
        : body.destinations;
    }
    if (body.durationDays) planningRequest.durationDays = Number(body.durationDays);
    if (body.travelers) {
      planningRequest.travelers = typeof body.travelers === 'number' ? { adults: body.travelers } : body.travelers;
    }
    if (body.budget) {
      planningRequest.budget = typeof body.budget === 'number' ? { total: body.budget, currency: 'INR' } : body.budget;
    }
    if (body.travelStyle) planningRequest.travelStyle = body.travelStyle;
    if (body.interests) planningRequest.interests = body.interests;
    if (body.pace) planningRequest.pace = body.pace;
    if (body.startDate) planningRequest.startDate = body.startDate;

    // Check planOnly flag from body or query params
    if (body.planOnly !== undefined) {
      planningRequest.planOnly = Boolean(body.planOnly);
    } else if (searchParams.get('planOnly') === 'true') {
      planningRequest.planOnly = true;
    }

    const result = await generateMasterTripPlan(planningRequest);

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to process AI trip planning request.',
        isEstimateOnly: true,
      },
      { status: 500 }
    );
  }
}
