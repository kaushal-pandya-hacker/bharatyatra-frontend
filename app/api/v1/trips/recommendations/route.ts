/**
 * BharatYatra AI 2.0 — Intelligent Travel Recommendations API (v1)
 * REST endpoints for generating personalized, multi-category travel recommendations:
 * Destinations, Attractions, Accommodations, Food Experiences, Circuits, and Alternatives.
 */

import { NextRequest, NextResponse } from 'next/server';
import { travelRecommendationEngine } from '@/lib/ai-planner/travel-recommendation-engine';
import {
  createDefaultPreferenceProfile,
  TripPreferenceProfile,
} from '@/lib/ai-planner/universal-preference-profile';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'guest_user';
    const origin = searchParams.get('origin') || searchParams.get('originCity') || 'Ahmedabad';
    const destination = searchParams.get('destination') || searchParams.get('dest') || 'Dwarka';
    const durationDays = parseInt(searchParams.get('days') || searchParams.get('duration') || '4', 10);
    const travelMonth = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1), 10);
    const budgetParam = searchParams.get('budget');
    const userBudget = budgetParam ? parseInt(budgetParam, 10) : undefined;
    const limit = parseInt(searchParams.get('limit') || '6', 10);

    const baseProfile = createDefaultPreferenceProfile({
      origin,
      destination,
      tripDurationDays: isNaN(durationDays) ? 4 : durationDays,
    });
    if (userBudget && !isNaN(userBudget)) {
      baseProfile.budget.totalBudget = userBudget;
    }

    const recommendations = travelRecommendationEngine.generateRecommendations({
      userId,
      preferenceProfile: baseProfile,
      targetDestination: destination,
      travelMonth: isNaN(travelMonth) ? new Date().getMonth() + 1 : travelMonth,
      maxResults: isNaN(limit) ? 6 : limit,
    });

    return NextResponse.json(
      {
        success: true,
        data: recommendations,
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
        error: error.message || 'Failed to generate travel recommendations.',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId || 'guest_user';
    let profile = body.preferenceProfile as TripPreferenceProfile | undefined;

    if (!profile) {
      const origin = body.origin || body.originCity || 'Ahmedabad';
      const destination = body.destination || body.destinationCity || 'Dwarka';
      const durationDays = body.durationDays || body.duration || 4;
      profile = createDefaultPreferenceProfile({
        origin,
        destination,
        tripDurationDays: durationDays,
      });
      if (body.userBudget) profile.budget.totalBudget = body.userBudget;
    }

    const recommendations = travelRecommendationEngine.generateRecommendations({
      userId,
      preferenceProfile: profile,
      targetDestination: body.targetDestination || profile.identity.destination,
      travelMonth: body.travelMonth,
      maxResults: body.maxResults || 6,
    });

    return NextResponse.json(
      {
        success: true,
        data: recommendations,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process recommendation request.',
      },
      { status: 500 }
    );
  }
}

