/**
 * BharatYatra AI 2.0 — Custom Trip Duration Validation API
 * POST /api/ai/trip-duration/validate
 *
 * Validates a user-requested duration against the minimum realistic required days,
 * returning feasibility classification (FEASIBLE, FEASIBLE_WITH_COMPROMISES, INFEASIBLE)
 * and required compromises / suggestions.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  calculateIntelligentDuration,
  DurationEngineInput,
} from '@/lib/ai-planner/duration-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const origin = body.origin || body.originCity || body.from || 'Ahmedabad';
    const destination = body.destination || body.dest || body.to || 'Ladakh';
    const destinations = Array.isArray(body.destinations)
      ? body.destinations
      : destination.includes(',')
      ? destination.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [destination];

    const requestedDays = parseInt(body.proposedDurationDays || body.requestedDays || body.days || '5', 10);
    const pace = body.travelPace || body.pace || 'balanced';

    const input: DurationEngineInput = {
      originCity: origin,
      destinations,
      travelPace: pace,
      requestedDays,
      travelDate: body.travelDate || body.startDate,
      travelerComposition: body.travelers,
    };

    const result = calculateIntelligentDuration(input);

    const minRequired = result.options.quick.totalDays;
    const isUnderMinFloor = requestedDays < minRequired;
    const isValid = !isUnderMinFloor && (result.customEvaluation ? result.customEvaluation.isFeasible : true);

    const safetyWarning = result.acclimatizationNotice || (isUnderMinFloor ? `Requested duration of ${requestedDays} days is below the minimum safe floor of ${minRequired} days.` : undefined);

    const validationPayload = {
      isValid,
      isFeasible: isValid,
      origin,
      destinations,
      requestedDays,
      minimumRequiredDays: minRequired,
      recommendedDays: result.options.recommended.totalDays,
      classification: isUnderMinFloor ? 'INFEASIBLE' : (result.customEvaluation?.classification || result.overallFeasibility),
      safetyWarning,
      discrepancyDays: requestedDays - minRequired,
      feasibilityReasons: isUnderMinFloor
        ? [`Trip duration (${requestedDays} days) is shorter than minimum travel & acclimatization time (${minRequired} days).`]
        : (result.customEvaluation?.feasibilityReasons || []),
      compromisesRequired: result.customEvaluation?.compromisesRequired || [],
      suggestedDestinationsToDrop: result.customEvaluation?.suggestedDestinationsToDrop,
      adjustedBreakdown: result.customEvaluation?.adjustedBreakdown,
      acclimatizationNotice: result.acclimatizationNotice,
      seasonalAlerts: result.seasonalAlerts,
    };

    return NextResponse.json({
      success: true,
      validation: validationPayload,
      data: validationPayload,
    });
  } catch (err: any) {
    console.error('Error validating trip duration:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Validation calculation failed',
      },
      { status: 500 }
    );
  }
}
