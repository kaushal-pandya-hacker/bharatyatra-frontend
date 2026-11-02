/**
 * BharatYatra — Trip Duration Customization API
 * POST /api/trips/customize-duration
 * GET /api/trips/customize-duration
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  customizeTripDuration,
  CustomizeDurationInput,
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

    const customDays = parseInt(body.customDays || body.days || body.duration || '5', 10);

    const input: CustomizeDurationInput = {
      origin,
      destinations,
      customDays: isNaN(customDays) ? 5 : customDays,
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

    const result = customizeTripDuration(input);

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Error in /api/trips/customize-duration:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'An error occurred during trip duration customization.',
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
    const customDays = parseInt(searchParams.get('days') || searchParams.get('customDays') || '4', 10);
    const travelMode = searchParams.get('mode') || 'car';
    const travelPace = searchParams.get('pace') || 'balanced';

    const destinations = dest.split(',').map((s) => s.trim()).filter(Boolean);

    const result = customizeTripDuration({
      origin,
      destinations,
      customDays: isNaN(customDays) ? 4 : customDays,
      travelMode,
      travelPace,
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
        error: err.message || 'Failed to customize trip duration',
      },
      { status: 500 }
    );
  }
}

