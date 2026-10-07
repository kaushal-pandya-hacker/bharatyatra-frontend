import { NextRequest, NextResponse } from 'next/server';
import { generateMasterTripPlan } from '@/lib/ai-planner/planner-service';
import { TripPlanningRequest } from '@/lib/ai-planner/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

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
