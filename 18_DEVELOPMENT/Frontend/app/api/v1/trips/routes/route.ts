/**
 * BharatYatra AI 2.0 — Multimodal Route Intelligence & Feasibility API (v1)
 * REST endpoints for discovering multimodal routes, 9-dimension feasibility scoring,
 * transfer buffer evaluations, and strategy-based route optimizations.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  multimodalRouteEngine,
  RouteOptimizationStrategy,
} from '@/lib/ai-planner/multimodal-route-engine';
import { TripPreferenceProfile } from '@/lib/ai-planner/universal-preference-profile';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const originCity = searchParams.get('origin') || searchParams.get('originCity') || 'Ahmedabad';
    const destinationQuery = searchParams.get('destination') || searchParams.get('dest') || 'Dwarka';
    const travelMonth = parseInt(searchParams.get('month') || searchParams.get('travelMonth') || String(new Date().getMonth() + 1), 10);
    const strategy = (searchParams.get('strategy') || 'balanced') as RouteOptimizationStrategy;

    const result = multimodalRouteEngine.solveRoute({
      originCity,
      destinationQuery,
      travelMonth: isNaN(travelMonth) ? new Date().getMonth() + 1 : travelMonth,
      strategy,
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
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
        error: error.message || 'Failed to compute multimodal route intelligence.',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const originCity = body.originCity || body.origin || 'Ahmedabad';
    const destinationQuery = body.destinationQuery || body.destination || 'Dwarka';
    const travelMonth = body.travelMonth || new Date().getMonth() + 1;
    const strategy = (body.strategy || 'balanced') as RouteOptimizationStrategy;
    const preferenceProfile = body.preferenceProfile as TripPreferenceProfile | undefined;

    const result = multimodalRouteEngine.solveRoute({
      originCity,
      destinationQuery,
      travelMonth,
      strategy,
      preferenceProfile,
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process multimodal route optimization request.',
      },
      { status: 500 }
    );
  }
}
