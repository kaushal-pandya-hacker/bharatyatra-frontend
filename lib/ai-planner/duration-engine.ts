/**
 * BharatYatra AI 2.0 — Intelligent Trip Duration Recommendation Engine
 * Re-exports calculation primitives from duration-calculation-engine and
 * provides backward-compatible and multi-destination interfaces.
 */

export * from './duration-calculation-engine';

import {
  calculateIntelligentDuration,
  IntelligentDurationResult,
  DurationTierOption,
  CustomDurationEvaluation,
} from './duration-calculation-engine';
import { findDestinationMaster } from './destination-master-service';

export interface DurationOption {
  tier: 'quick' | 'recommended' | 'extended';
  title: string;
  totalDays: number;
  hotelNights?: number;
  transitDays: number;
  sightseeingDays: number;
  acclimatizationRestDays: number;
  recommendedTransport: 'flight' | 'train' | 'cab' | 'mixed';
  highlightsCovered: string[];
  tradeoffsAndNotes: string;
  feasibilityRating: 'high' | 'moderate' | 'tight' | string;
  costRangeInr?: { min: number; max: number };
}

export interface DurationRecommendationResult {
  origin: string;
  destination: string;
  destinations?: string[];
  totalDistanceKm: number;
  isHighAltitude: boolean;
  altitudeMeters: number;
  acclimatizationRequired: boolean;
  transitSummary: string;
  recommendedTransportMode: 'flight' | 'train' | 'cab' | 'mixed';
  options: {
    quick: DurationOption;
    recommended: DurationOption;
    extended: DurationOption;
  };
  validationAlerts: string[];
  customValidation?: CustomDurationEvaluation;
  rawAnalysis?: IntelligentDurationResult;
}

/**
 * Backward-compatible helper for legacy callers & multi-destination queries
 */
export function calculateIntelligentDurations(
  originInput: string,
  destinationInput: string | string[],
  travelPace: 'relaxed' | 'balanced' | 'fast' = 'balanced',
  userRequestedDays?: number,
  travelDate?: string
): DurationRecommendationResult {
  const destList = Array.isArray(destinationInput)
    ? destinationInput
    : [destinationInput];
  const primaryDest = destList[0] || 'Delhi';

  const newAnalysis = calculateIntelligentDuration({
    originCity: originInput,
    destinations: destList,
    travelPace,
    requestedDays: userRequestedDays,
    travelDate,
  });

  const destMaster = findDestinationMaster(primaryDest);
  const isHighAltitude =
    (destMaster?.altitudeMeters || 0) >= 2800 ||
    newAnalysis.routeFeasibilityReport.destination.isHighAltitude;

  const roadDistKm = Math.round(
    newAnalysis.routeFeasibilityReport.straightLineDistanceKm *
    newAnalysis.routeFeasibilityReport.detourMultiplier
  );

  const convertTier = (tier: DurationTierOption): DurationOption => ({
    tier: tier.tier,
    title: tier.title,
    totalDays: tier.totalDays,
    hotelNights: tier.hotelNights,
    transitDays:
      tier.breakdown.outboundTravelDays +
      tier.breakdown.returnTravelDays +
      tier.breakdown.interDestinationTravelDays,
    sightseeingDays: tier.breakdown.sightseeingDays,
    acclimatizationRestDays: tier.breakdown.acclimatizationRestDays,
    recommendedTransport:
      tier.primaryTransportMode === 'road'
        ? 'cab'
        : tier.primaryTransportMode === 'multi-modal'
        ? 'mixed'
        : tier.primaryTransportMode,
    highlightsCovered: tier.keyHighlights,
    tradeoffsAndNotes: tier.tradeoffsAndCompromises || tier.explanation,
    feasibilityRating:
      tier.feasibilityRating === 'FEASIBLE'
        ? 'high'
        : tier.feasibilityRating === 'FEASIBLE_WITH_COMPROMISES'
        ? 'moderate'
        : 'tight',
    costRangeInr: tier.estimatedCostRangeInr,
  });

  const validationAlerts: string[] = [];
  if (newAnalysis.acclimatizationNotice) {
    validationAlerts.push(newAnalysis.acclimatizationNotice);
  }
  if (newAnalysis.seasonalAlerts && newAnalysis.seasonalAlerts.length > 0) {
    validationAlerts.push(...newAnalysis.seasonalAlerts);
  }
  if (newAnalysis.customEvaluation) {
    validationAlerts.push(...newAnalysis.customEvaluation.feasibilityReasons);
  }

  return {
    origin: newAnalysis.origin,
    destination: newAnalysis.destinations.join(' → '),
    destinations: newAnalysis.destinations,
    totalDistanceKm: roadDistKm,
    isHighAltitude,
    altitudeMeters: destMaster?.altitudeMeters || 0,
    acclimatizationRequired: isHighAltitude,
    transitSummary: newAnalysis.routeFeasibilityReport.recommendationReason,
    recommendedTransportMode:
      newAnalysis.options.recommended.primaryTransportMode === 'road'
        ? 'cab'
        : newAnalysis.options.recommended.primaryTransportMode === 'multi-modal'
        ? 'mixed'
        : newAnalysis.options.recommended.primaryTransportMode,
    options: {
      quick: convertTier(newAnalysis.options.quick),
      recommended: convertTier(newAnalysis.options.recommended),
      extended: convertTier(newAnalysis.options.extended),
    },
    validationAlerts,
    customValidation: newAnalysis.customEvaluation,
    rawAnalysis: newAnalysis,
  };
}
