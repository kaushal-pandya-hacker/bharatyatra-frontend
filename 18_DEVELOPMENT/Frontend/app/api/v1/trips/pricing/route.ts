/**
 * BharatYatra AI 2.0 — Hybrid Travel Pricing & Cost Optimization API
 * REST endpoints for evaluating multi-source pricing, four-tier cost breakdowns,
 * transparent itemized cost provenance, independent deterministic pricing calculation,
 * and fast budget-change recalculations without touching itineraries.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  computeHybridTripPricing,
  syncPricingWithPreferences,
  HybridPricingInput,
} from '@/lib/ai-planner/hybrid-pricing-engine';
import { TripPreferenceProfile } from '@/lib/ai-planner/universal-preference-profile';
import { PricingEngine, ItineraryPricingInput, PricingEngineResult } from '@/lib/ai-planner/pricing-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const originCity = searchParams.get('origin') || searchParams.get('originCity') || 'Ahmedabad';
    const destParam = searchParams.get('destination') || searchParams.get('destinations') || 'Leh';
    const destinations = destParam.includes(',')
      ? destParam.split(',').map((s) => s.trim()).filter(Boolean)
      : [destParam.trim()];
    const destinationCity = destinations[0] || 'Leh';

    const adults = parseInt(searchParams.get('adults') || searchParams.get('travelers') || '2', 10);
    const seniors = parseInt(searchParams.get('seniors') || '0', 10);
    const children = parseInt(searchParams.get('children') || '0', 10);
    const infants = parseInt(searchParams.get('infants') || '0', 10);

    const durationDays = parseInt(searchParams.get('durationDays') || searchParams.get('days') || '5', 10);
    const travelMonth = parseInt(searchParams.get('travelMonth') || String(new Date().getMonth() + 1), 10);
    const preferredTransport = (searchParams.get('transport') || searchParams.get('preferredTransport') || undefined) as any;
    const preferredTier = (searchParams.get('tier') || searchParams.get('preferredTier') || 'standard') as any;
    const dietaryPreference = (searchParams.get('diet') || searchParams.get('dietaryPreference') || 'vegetarian') as any;

    const budgetStr = searchParams.get('budget') || searchParams.get('userBudgetInr');
    const userBudgetInr = budgetStr ? parseInt(budgetStr, 10) : undefined;

    const input: HybridPricingInput = {
      originCity,
      destinationCity,
      destinations,
      travelers: {
        adults: isNaN(adults) ? 2 : adults,
        seniors: isNaN(seniors) ? 0 : seniors,
        children: isNaN(children) ? 0 : children,
        infants: isNaN(infants) ? 0 : infants,
      },
      durationDays: isNaN(durationDays) ? 5 : durationDays,
      travelMonth: isNaN(travelMonth) ? new Date().getMonth() + 1 : travelMonth,
      preferredTransport,
      preferredTier,
      dietaryPreference,
      userBudgetInr: userBudgetInr && !isNaN(userBudgetInr) ? userBudgetInr : undefined,
    };

    const evaluation = computeHybridTripPricing(input);

    return NextResponse.json({
      success: true,
      data: evaluation,
    });
  } catch (err: any) {
    console.error('Error in Hybrid Pricing GET API:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to compute hybrid pricing evaluation',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action;

    // Fast budget change recalculation without touching itinerary
    if (action === 'recalculate_budget') {
      const { existingPricing, newBudgetInr, newTier } = body as {
        existingPricing: PricingEngineResult;
        newBudgetInr: number;
        newTier?: any;
      };

      if (!existingPricing) {
        return NextResponse.json(
          { success: false, error: 'existingPricing is required for recalculate_budget action.' },
          { status: 400 }
        );
      }

      const updatedPricing = PricingEngine.recalculateOnBudgetChange(
        existingPricing,
        newBudgetInr,
        newTier
      );

      return NextResponse.json({
        success: true,
        action: 'recalculate_budget',
        data: updatedPricing,
      });
    }

    // Direct independent deterministic pricing engine calculation
    if (action === 'calculate_deterministic' || body.itinerary) {
      const input: ItineraryPricingInput = {
        originCity: body.originCity || body.origin || 'Ahmedabad',
        destinationCity: body.destinationCity || body.destination || 'Dwarka',
        destinations: body.destinations,
        travelersCount: body.travelersCount || 2,
        durationDays: body.durationDays || 4,
        preferredTransport: body.preferredTransport,
        preferredTier: body.preferredTier || 'standard',
        userBudgetInr: body.userBudgetInr,
        pureItinerary: body.itinerary,
        liveSupplierData: body.liveSupplierData,
      };

      const result = PricingEngine.calculateItineraryPricing(input, body.profile);
      return NextResponse.json({
        success: true,
        action: 'calculate_deterministic',
        data: result,
      });
    }

    // Standard profile-synchronized hybrid pricing
    const { profile, selectedTier, liveSupplierData } = body;
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'profile or valid action is required in request body' },
        { status: 400 }
      );
    }

    const evaluation = computeHybridTripPricing({
      originCity: profile.identity.origin,
      destinationCity: profile.identity.destination,
      destinations:
        profile.identity.destinationList && profile.identity.destinationList.length > 0
          ? profile.identity.destinationList
          : [profile.identity.destination],
      travelers: profile.identity.travelerComposition,
      durationDays: profile.identity.tripDurationDays,
      preferredTransport: profile.transport.preferredTransport as any,
      preferredTier: selectedTier || profile.budget.pricingCategory,
      dietaryPreference: profile.food.dietaryType as any,
      userBudgetInr: profile.budget.totalBudget,
      liveSupplierData,
    });

    const syncOutput = syncPricingWithPreferences(
      profile as TripPreferenceProfile,
      evaluation,
      selectedTier
    );

    return NextResponse.json({
      success: true,
      data: syncOutput,
    });
  } catch (err: any) {
    console.error('Error in Hybrid Pricing POST API:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to synchronize pricing with profile',
      },
      { status: 500 }
    );
  }
}
