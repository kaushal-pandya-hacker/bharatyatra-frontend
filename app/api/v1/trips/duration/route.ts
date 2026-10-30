/**
 * BharatYatra AI 2.0 — Intelligent Trip Duration Recommendation API
 * REST endpoints for evaluating Quick/Recommended/Extended duration tiers,
 * validating custom requested durations with feasibility classifications,
 * and synchronizing durations with Universal Trip Preferences.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  calculateIntelligentDuration,
  syncDurationWithPreferences,
  DurationEngineInput,
} from '@/lib/ai-planner/duration-calculation-engine';
import { TripPreferenceProfile } from '@/lib/ai-planner/universal-preference-profile';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get('origin') || 'Ahmedabad';
    const destParam = searchParams.get('destination') || searchParams.get('destinations') || 'Ladakh';
    const destinations = destParam.includes(',') 
      ? destParam.split(',').map(s => s.trim()).filter(Boolean)
      : [destParam.trim()];
    
    const travelPace = (searchParams.get('travelPace') as 'relaxed' | 'balanced' | 'fast') || 'balanced';
    const travelDate = searchParams.get('travelDate') || undefined;
    const requestedDaysStr = searchParams.get('requestedDays');
    const requestedDays = requestedDaysStr ? parseInt(requestedDaysStr, 10) : undefined;
    const budgetCategory = (searchParams.get('budgetCategory') as any) || 'standard';

    const adults = parseInt(searchParams.get('adults') || '2', 10);
    const seniors = parseInt(searchParams.get('seniors') || '0', 10);
    const children = parseInt(searchParams.get('children') || '0', 10);

    const input: DurationEngineInput = {
      originCity: origin,
      destinations,
      travelPace,
      travelDate,
      requestedDays: !isNaN(requestedDays as number) ? requestedDays : undefined,
      budgetCategory,
      travelerComposition: {
        adults,
        seniors,
        children,
      },
    };

    const result = calculateIntelligentDuration(input);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error('Error in Duration GET API:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to calculate trip duration recommendations',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, chosenTierOrDays, durationResult } = body;

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'profile is required in request body' },
        { status: 400 }
      );
    }

    if (chosenTierOrDays === undefined) {
      return NextResponse.json(
        { success: false, error: 'chosenTierOrDays is required (e.g. "quick", "recommended", "extended", or number of days)' },
        { status: 400 }
      );
    }

    // If durationResult is not passed, compute it on the fly from profile
    let evaluatedResult = durationResult;
    if (!evaluatedResult) {
      evaluatedResult = calculateIntelligentDuration({
        originCity: profile.identity.origin,
        destinations: profile.identity.destinations && profile.identity.destinations.length > 0
          ? profile.identity.destinations
          : [profile.identity.destination],
        travelPace: profile.style.pace,
        travelDate: profile.identity.startDate,
        budgetCategory: profile.budget.pricingCategory,
        travelerComposition: {
          adults: profile.identity.adultsCount || 2,
          seniors: profile.identity.seniorsCount || 0,
          children: profile.identity.childrenCount || 0,
        },
      });
    }

    const syncOutput = syncDurationWithPreferences(
      profile as TripPreferenceProfile,
      chosenTierOrDays
    );

    return NextResponse.json({
      success: true,
      data: syncOutput,
    });
  } catch (err: any) {
    console.error('Error in Duration POST API:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to sync duration with preferences',
      },
      { status: 500 }
    );
  }
}
