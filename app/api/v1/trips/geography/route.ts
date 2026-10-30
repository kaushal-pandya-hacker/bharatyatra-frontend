/**
 * BharatYatra AI 2.0 — India Geography & Destination Intelligence API
 * Endpoints for Destination Search, Route Feasibility, Seasonal Checks,
 * Tourism Circuit Assembly, and Universal Preference Sync.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  findDestinationMaster,
  searchDestinations,
  getDestinationsByState,
  getNearbyDestinations,
  getAllStatesCoverageSummary,
  evaluateRouteFeasibility,
  evaluateCoVisitFeasibility,
  NATIONAL_BENCHMARK_CORRIDORS,
  evaluateSeasonalSuitability,
  CANONICAL_CIRCUITS,
  generateDynamicCircuit,
  discoverDestinations,
  syncPreferencesWithGeography,
} from '@/lib/ai-planner/destination-intelligence';
import { TripPreferenceProfile } from '@/lib/ai-planner/universal-preference-profile';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'search';

    switch (action) {
      case 'search': {
        const query = searchParams.get('q') || searchParams.get('query') || undefined;
        const state = searchParams.get('state') || searchParams.get('stateOrUt') || undefined;
        const category = searchParams.get('category') || undefined;
        const region = searchParams.get('region') || undefined;
        const limit = Number(searchParams.get('limit')) || 25;

        const results = searchDestinations({ query, stateOrUt: state, category, region, limit });
        return NextResponse.json({ success: true, count: results.length, data: results });
      }

      case 'resolve': {
        const query = searchParams.get('q') || searchParams.get('query');
        if (!query) {
          return NextResponse.json({ success: false, error: 'Query parameter q is required' }, { status: 400 });
        }
        const destination = findDestinationMaster(query);
        if (!destination) {
          return NextResponse.json({ success: false, error: `Destination '${query}' not found` }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: destination });
      }

      case 'route': {
        const origin = searchParams.get('origin') || 'Ahmedabad';
        const destination = searchParams.get('destination') || 'Leh';
        const report = evaluateRouteFeasibility(origin, destination);
        return NextResponse.json({ success: true, data: report });
      }

      case 'co-visit': {
        const destA = searchParams.get('destA');
        const destB = searchParams.get('destB');
        if (!destA || !destB) {
          return NextResponse.json({ success: false, error: 'destA and destB are required' }, { status: 400 });
        }
        const result = evaluateCoVisitFeasibility(destA, destB);
        return NextResponse.json({ success: true, data: result });
      }

      case 'seasonal': {
        const destsParam = searchParams.get('destinations') || searchParams.get('d') || '';
        const destinations = destsParam ? destsParam.split(',').map(s => s.trim()) : ['Leh'];
        const date = searchParams.get('date') || undefined;
        const result = evaluateSeasonalSuitability(destinations, date);
        return NextResponse.json({ success: true, data: result });
      }

      case 'corridor': {
        const corridor = searchParams.get('id') || 'ahmedabad-ladakh';
        const solver = NATIONAL_BENCHMARK_CORRIDORS[corridor as keyof typeof NATIONAL_BENCHMARK_CORRIDORS];
        if (!solver) {
          return NextResponse.json({
            success: false,
            error: `Unknown corridor '${corridor}'. Available: ${Object.keys(NATIONAL_BENCHMARK_CORRIDORS).join(', ')}`,
          }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: solver() });
      }

      case 'canonical-circuits': {
        return NextResponse.json({
          success: true,
          count: Object.keys(CANONICAL_CIRCUITS).length,
          data: Object.values(CANONICAL_CIRCUITS),
        });
      }

      case 'dynamic-circuit': {
        const origin = searchParams.get('origin') || 'Ahmedabad';
        const state = searchParams.get('state') || 'Gujarat';
        const duration = Number(searchParams.get('duration')) || 6;
        const month = Number(searchParams.get('month')) || undefined;
        const pace = (searchParams.get('pace') as any) || 'balanced';

        const circuit = generateDynamicCircuit({
          originCity: origin,
          targetStateOrRegion: state,
          durationDays: duration,
          travelMonth: month,
          pace,
        });
        return NextResponse.json({ success: true, data: circuit });
      }

      case 'discovery': {
        const origin = searchParams.get('origin') || 'Ahmedabad';
        const duration = Number(searchParams.get('duration')) || 5;
        const budget = searchParams.get('budget') ? Number(searchParams.get('budget')) : undefined;
        const month = Number(searchParams.get('month')) || undefined;
        const result = discoverDestinations({
          originCity: origin,
          durationDays: duration,
          totalBudgetInr: budget,
          travelMonth: month,
        });
        return NextResponse.json({ success: true, data: result });
      }

      case 'nearby': {
        const lat = Number(searchParams.get('lat'));
        const lng = Number(searchParams.get('lng'));
        const radius = Number(searchParams.get('radius')) || 80;
        const limit = Number(searchParams.get('limit')) || 10;
        if (isNaN(lat) || isNaN(lng)) {
          return NextResponse.json({ success: false, error: 'Valid lat and lng required' }, { status: 400 });
        }
        const nearby = getNearbyDestinations(lat, lng, radius, limit);
        return NextResponse.json({ success: true, count: nearby.length, data: nearby });
      }

      case 'coverage-summary': {
        const summaries = getAllStatesCoverageSummary();
        return NextResponse.json({
          success: true,
          totalStatesAndUTs: summaries.length,
          data: summaries,
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action '${action}'`,
          availableActions: [
            'search',
            'resolve',
            'route',
            'co-visit',
            'seasonal',
            'corridor',
            'canonical-circuits',
            'dynamic-circuit',
            'discovery',
            'nearby',
            'coverage-summary',
          ],
        }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'sync-preferences';
    const body = await req.json();

    if (action === 'sync-preferences') {
      const profile = body as TripPreferenceProfile;
      if (!profile || !profile.identity) {
        return NextResponse.json({ success: false, error: 'Invalid preference profile in request body' }, { status: 400 });
      }
      const syncResult = syncPreferencesWithGeography(profile);
      return NextResponse.json({ success: true, data: syncResult });
    }

    return NextResponse.json({ success: false, error: `Unsupported POST action '${action}'` }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
