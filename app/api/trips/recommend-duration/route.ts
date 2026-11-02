/**
 * BharatYatra — Intelligent Trip Duration & Route Recommendation API
 * POST /api/trips/recommend-duration
 * GET /api/trips/recommend-duration
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  calculateTripDurationRecommendation,
  TripDurationRecommendationInput,
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

    const input: TripDurationRecommendationInput = {
      origin,
      destinations,
      travelMode: body.travelMode || body.mode || 'car',
      travelPace: body.travelPace || body.pace || 'balanced',
      preferences: body.preferences || body.interests || [],
      budget: typeof body.budget === 'number' ? body.budget : undefined,
      travellers: body.travellers || body.travelers || body.adults || 2,
      travelDate: body.travelDate || body.startDate || null,
      hasSeniors: Boolean(body.hasSeniors || (body.seniors && body.seniors > 0)),
      hasChildren: Boolean(body.hasChildren || (body.children && body.children > 0)),
      accessibilityNeeds: body.accessibilityNeeds || [],
    };

    const result = calculateTripDurationRecommendation(input);

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Error in /api/trips/recommend-duration:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'An error occurred during trip duration recommendation.',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get('origin') || 'Ahmedabad';
    const destStr = searchParams.get('destinations') || searchParams.get('destination') || 'Udaipur';
    const destinations = destStr.split(',').map((s) => s.trim()).filter(Boolean);

    const travelMode = searchParams.get('travelMode') || 'car';
    const travelPace = searchParams.get('travelPace') || 'balanced';
    const budget = searchParams.get('budget') ? parseInt(searchParams.get('budget')!, 10) : undefined;
    const travellers = searchParams.get('travellers') ? parseInt(searchParams.get('travellers')!, 10) : 2;

    const result = calculateTripDurationRecommendation({
      origin,
      destinations,
      travelMode,
      travelPace,
      budget,
      travellers,
    });

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Error processing request',
      },
      { status: 500 }
    );
  }
}

