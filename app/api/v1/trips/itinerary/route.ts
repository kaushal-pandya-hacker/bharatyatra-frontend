/**
 * BharatYatra AI 2.0 — Dynamic & Pure AI Itinerary Planning API (v1)
 * REST endpoints for generating intelligent day-by-day itineraries:
 * - Pure AI travel intelligence (zero financial calculations)
 * - Dynamic slot customization (add, remove, replace activities)
 * - Pace alterations & altitude-safe day regenerations
 * - Audit-logged version restorations
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  dynamicItineraryEngine,
  ItineraryMasterPlan,
  ItineraryActivity,
} from '@/lib/ai-planner/dynamic-itinerary-engine';
import {
  createDefaultPreferenceProfile,
  TripPreferenceProfile,
} from '@/lib/ai-planner/universal-preference-profile';
import { PureItineraryService } from '@/lib/ai-planner/pure-itinerary-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const originCity = searchParams.get('origin') || searchParams.get('originCity') || 'Ahmedabad';
    const destinationQuery = searchParams.get('destination') || searchParams.get('dest') || 'Dwarka';
    const durationDays = parseInt(searchParams.get('days') || searchParams.get('duration') || '4', 10);
    const paceParam = (searchParams.get('pace') || 'balanced').toLowerCase();
    const pace = paceParam === 'relaxed' ? 'relaxed' : paceParam === 'active' || paceParam === 'fast-paced' ? 'fast-paced' : 'balanced';
    const startDate = searchParams.get('startDate') || undefined;
    const isPure = searchParams.get('includePricing') !== 'true';

    const profile = createDefaultPreferenceProfile({
      origin: originCity,
      destination: destinationQuery,
      destinationList: [destinationQuery],
      tripDurationDays: isNaN(durationDays) ? 4 : durationDays,
    });
    profile.pace.style = pace;

    if (isPure) {
      const purePlan = PureItineraryService.generatePureItinerary({
        origin: { city: originCity, country: 'India' },
        destinations: [{ state: destinationQuery }],
        durationDays: isNaN(durationDays) ? 4 : durationDays,
        travelers: { adults: 2 },
        travelStyle: 'balanced',
        pace: pace as any,
        startDate,
        preferenceProfile: profile,
      });

      return NextResponse.json(
        {
          success: true,
          isPureItinerary: true,
          data: purePlan,
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
          },
        }
      );
    }

    const plan = dynamicItineraryEngine.generateItinerary({
      preferenceProfile: profile,
      startDate,
    });

    return NextResponse.json(
      {
        success: true,
        data: plan,
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
        error: error.message || 'Failed to generate itinerary plan.',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || 'generate';

    switch (action) {
      case 'generate_pure': {
        let profile = body.preferenceProfile as TripPreferenceProfile | undefined;
        const origin = body.origin || body.originCity || profile?.identity?.origin || 'Ahmedabad';
        const destination = body.destination || body.destinationCity || profile?.identity?.destination || 'Dwarka';
        const durationDays = body.durationDays || body.duration || profile?.identity?.tripDurationDays || 4;
        const pace = body.pace || profile?.pace?.style || 'balanced';

        if (!profile) {
          profile = createDefaultPreferenceProfile({
            origin,
            destination,
            destinationList: [destination],
            tripDurationDays: durationDays,
          });
          profile.pace.style = pace;
        }

        const purePlan = PureItineraryService.generatePureItinerary({
          origin: { city: origin, country: 'India' },
          destinations: [{ state: destination }],
          durationDays,
          travelers: { adults: profile.identity.travelerComposition.adults || 2 },
          travelStyle: (profile.budget.pricingCategory === 'standard' ? 'balanced' : profile.budget.pricingCategory) as any,
          pace: pace as any,
          startDate: body.startDate,
          preferenceProfile: profile,
        });

        return NextResponse.json({ success: true, isPureItinerary: true, data: purePlan }, { status: 200 });
      }

      case 'generate': {
        let profile = body.preferenceProfile as TripPreferenceProfile | undefined;
        if (!profile) {
          const origin = body.origin || body.originCity || 'Ahmedabad';
          const destination = body.destination || body.destinationCity || 'Dwarka';
          const durationDays = body.durationDays || body.duration || 4;
          profile = createDefaultPreferenceProfile({
            origin,
            destination,
            destinationList: [destination],
            tripDurationDays: durationDays,
          });
          if (body.pace) profile.pace.style = body.pace;
        }

        if (body.includePricing !== true) {
          const purePlan = PureItineraryService.generatePureItinerary({
            origin: { city: profile.identity.origin, country: 'India' },
            destinations: [{ state: profile.identity.destination }],
            durationDays: profile.identity.tripDurationDays,
            travelers: { adults: profile.identity.travelerComposition.adults || 2 },
            travelStyle: profile.budget.pricingCategory as any,
            pace: profile.pace.style as any,
            startDate: body.startDate,
            preferenceProfile: profile,
          });

          return NextResponse.json({ success: true, isPureItinerary: true, data: purePlan }, { status: 200 });
        }

        const plan = dynamicItineraryEngine.generateItinerary({
          preferenceProfile: profile,
          startDate: body.startDate,
          naturalPrompt: body.naturalPrompt,
        });

        return NextResponse.json({ success: true, data: plan }, { status: 200 });
      }

      case 'add_activity': {
        const { plan, dayNumber, activity, slot } = body as {
          plan: ItineraryMasterPlan;
          dayNumber: number;
          activity: ItineraryActivity;
          slot?: 'morning' | 'afternoon' | 'evening';
        };
        if (!plan || !dayNumber || !activity) {
          return NextResponse.json({ success: false, error: 'Missing required parameters for add_activity.' }, { status: 400 });
        }
        const updated = dynamicItineraryEngine.addActivityToDay(plan, dayNumber, activity, slot || 'afternoon');
        return NextResponse.json({ success: true, data: updated }, { status: 200 });
      }

      case 'remove_activity': {
        const { plan, dayNumber, activityId } = body as {
          plan: ItineraryMasterPlan;
          dayNumber: number;
          activityId: string;
        };
        if (!plan || !dayNumber || !activityId) {
          return NextResponse.json({ success: false, error: 'Missing required parameters for remove_activity.' }, { status: 400 });
        }
        const updated = dynamicItineraryEngine.removeActivityFromDay(plan, dayNumber, activityId);
        return NextResponse.json({ success: true, data: updated }, { status: 200 });
      }

      case 'replace_activity': {
        const { plan, dayNumber, oldActivityId, newActivity } = body as {
          plan: ItineraryMasterPlan;
          dayNumber: number;
          oldActivityId: string;
          newActivity: ItineraryActivity;
        };
        if (!plan || !dayNumber || !oldActivityId || !newActivity) {
          return NextResponse.json({ success: false, error: 'Missing required parameters for replace_activity.' }, { status: 400 });
        }
        const updated = dynamicItineraryEngine.replaceActivity(plan, dayNumber, oldActivityId, newActivity);
        return NextResponse.json({ success: true, data: updated }, { status: 200 });
      }

      case 'regenerate_day': {
        const { plan, dayNumber } = body as {
          plan: ItineraryMasterPlan;
          dayNumber: number;
        };
        if (!plan || !dayNumber) {
          return NextResponse.json({ success: false, error: 'Missing required parameters for regenerate_day.' }, { status: 400 });
        }
        const updated = dynamicItineraryEngine.regenerateDay(plan, dayNumber);
        return NextResponse.json({ success: true, data: updated }, { status: 200 });
      }

      case 'change_pace': {
        const { plan, newPace } = body as {
          plan: ItineraryMasterPlan;
          newPace: string;
        };
        if (!plan || !newPace) {
          return NextResponse.json({ success: false, error: 'Missing required parameters for change_pace.' }, { status: 400 });
        }
        const paceVal = newPace === 'relaxed' ? 'relaxed' : newPace === 'active' || newPace === 'fast-paced' ? 'active' : 'balanced';
        const updated = dynamicItineraryEngine.changeTravelPace(plan, paceVal);
        return NextResponse.json({ success: true, data: updated }, { status: 200 });
      }

      case 'restore_version': {
        const { plan, targetVersionId } = body as {
          plan: ItineraryMasterPlan;
          targetVersionId: string;
        };
        if (!plan || !targetVersionId) {
          return NextResponse.json({ success: false, error: 'Missing required parameters for restore_version.' }, { status: 400 });
        }
        const updated = dynamicItineraryEngine.restoreVersion(plan, targetVersionId);
        return NextResponse.json({ success: true, data: updated }, { status: 200 });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unsupported itinerary action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process itinerary request.',
      },
      { status: 500 }
    );
  }
}
