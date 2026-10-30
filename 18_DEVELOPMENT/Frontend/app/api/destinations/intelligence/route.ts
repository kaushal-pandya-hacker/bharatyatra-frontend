/**
 * BharatYatra AI 2.0 — Destination Intelligence API
 * GET /api/destinations/intelligence?destination=...
 *
 * Provides comprehensive 5-factor destination intelligence:
 * 1. Geographic (Coordinates, elevation, terrain)
 * 2. Transportation (Nearest airport, railhead, road speeds)
 * 3. Destination (Tourist landmarks & categories)
 * 4. Seasonal (Monsoon impact, pass closures, best months)
 * 5. Experience (Stay durations, permits, acclimatization)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getComprehensiveDestinationIntelligence } from '@/lib/ai-planner/destination-intelligence';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const destinationQuery = searchParams.get('destination') || searchParams.get('query') || searchParams.get('dest') || 'Ladakh';

    const intelligence = getComprehensiveDestinationIntelligence(destinationQuery);

    if (!intelligence) {
      return NextResponse.json(
        { success: false, error: 'Destination not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        intelligence,
        data: intelligence,
        ...intelligence,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve destination intelligence' },
      { status: 500 }
    );
  }
}
