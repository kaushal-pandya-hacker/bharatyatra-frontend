/**
 * BharatYatra AI 2.0 — Independent Deterministic Pricing Engine
 * Separates financial calculations completely from AI itinerary generation.
 *
 * Responsibilities:
 * - Hotel pricing (room-based: Math.ceil(pax/2) * nights * roomRate)
 * - Intercity transit fares (Flight, Train, Bus, Outstation Cab)
 * - Local transport (Chauffeur, local taxi, auto)
 * - Attraction tickets & permits (ASI monuments, wildlife permits, free entry)
 * - Regional meals & culinary estimates
 * - Statutory taxes & surcharges (GST 18%, 5%)
 * - Four-tier cost modeling (Budget, Standard, Premium, Luxury)
 * - Provenance tracking (LIVE, VERIFIED_REFERENCE, ESTIMATED, UNAVAILABLE)
 * - Never invents live prices.
 */

import {
  computeHybridTripPricing,
  HybridPricingEvaluation,
  DetailedCostItem,
  TierCostBreakdown,
  CategoryPricingSummary,
  PricingSource,
  VERIFIED_FLIGHT_BENCHMARKS,
  VERIFIED_TRAIN_BENCHMARKS,
  VERIFIED_HOTEL_BENCHMARKS,
  VERIFIED_FOOD_BENCHMARKS,
  VERIFIED_CAB_BENCHMARKS,
} from './hybrid-pricing-engine';
import { TripPreferenceProfile, PricingCategory } from './universal-preference-profile';
import { findDestinationInfo } from './india-geo-registry';
import { TripDay, TravelSegment, Activity, AccommodationSuggestion } from './types';

// ============================================================================
// 1. Interfaces
// ============================================================================

export interface ItineraryPricingInput {
  originCity: string;
  destinationCity: string;
  destinations?: string[];
  travelersCount: number;
  durationDays: number;
  startDate?: string;
  endDate?: string;
  preferredTransport?: 'flight' | 'train' | 'bus' | 'cab' | 'mixed';
  preferredTier?: 'budget' | 'standard' | 'premium' | 'luxury';
  dietaryPreference?: 'vegetarian' | 'jain' | 'vegan' | 'non-vegetarian';
  userBudgetInr?: number;
  // Optional itinerary items to price specifically
  pureItinerary?: any;
  travelSegments?: TravelSegment[];
  days?: TripDay[];
  liveSupplierData?: Record<string, any>;
}

export interface PricingEngineResult {
  isEstimateOnly: boolean;
  currency: 'INR';
  origin: string;
  destination: string;
  destinations: string[];
  durationDays: number;
  hotelNights: number;
  travelersCount: number;
  roomsCount: number;
  selectedTransportMode: 'flight' | 'train' | 'cab' | 'bus' | 'mixed';
  recommendedTier: 'budget' | 'standard' | 'premium' | 'luxury';
  selectedTier: 'budget' | 'standard' | 'premium' | 'luxury';
  activeTierPricing: TierCostBreakdown;
  activeTier: TierCostBreakdown;
  tiers: {
    budget: TierCostBreakdown;
    standard: TierCostBreakdown;
    premium: TierCostBreakdown;
    luxury: TierCostBreakdown;
  };
  budgetAnalysis: {
    userBudgetInr?: number;
    fitsBudget: boolean;
    deficitAmount: number;
    surplusAmount: number;
    tradeoffSuggestions: string[];
    spendingLimitAdvisory?: string;
  };
  provenanceSummary: {
    liveSuppliersConsulted: number;
    verifiedReferencesUsed: number;
    estimatedItemsCount: number;
    unavailableItemsCount: number;
  };
  auditTrail: {
    engine: string;
    version: string;
    timestamp: string;
  };
}

// ============================================================================
// 2. Pricing Engine Implementation
// ============================================================================

export class PricingEngine {
  private static readonly ENGINE_VERSION = '2.0-deterministic-separated';

  /**
   * Calculates comprehensive, itemized pricing for a given itinerary and preference profile.
   * Pure deterministic calculation — does not mutate the itinerary or prompt.
   */
  public static calculateItineraryPricing(
    input: ItineraryPricingInput,
    profile?: TripPreferenceProfile
  ): PricingEngineResult {
    const origin = (input.originCity || profile?.identity?.origin || 'Ahmedabad').trim();
    const primaryDest = (input.destinationCity || profile?.identity?.destination || 'Leh').trim();
    const destinations = input.destinations || profile?.identity?.destinationList || [primaryDest];
    const travelersCount = Math.max(1, input.travelersCount || profile?.identity?.travelerComposition?.adults || 2);
    const durationDays = Math.max(1, input.durationDays || profile?.identity?.tripDurationDays || 4);
    const hotelNights = Math.max(1, durationDays - 1);
    const roomsCount = Math.ceil(travelersCount / 2);

    const transportPref =
      input.preferredTransport ||
      (profile?.transport?.preferredTransport as any) ||
      'mixed';

    const rawTier =
      input.preferredTier ||
      profile?.budget?.pricingCategory ||
      'standard';
    const preferredTier: 'budget' | 'standard' | 'premium' | 'luxury' =
      rawTier === 'luxury'
        ? 'luxury'
        : rawTier === 'premium'
        ? 'premium'
        : rawTier === 'budget'
        ? 'budget'
        : 'standard';

    const userBudget = input.userBudgetInr || profile?.budget?.totalBudget;

    // Delegate to verified benchmark & supplier engine
    const destInfo = findDestinationInfo(primaryDest);
    const hybridEval = computeHybridTripPricing({
      originCity: origin,
      destinationCity: primaryDest,
      destInfo,
      destinations,
      travelersCount,
      durationDays,
      preferredTransport: transportPref,
      preferredTier,
      userBudgetInr: userBudget,
      liveSupplierData: input.liveSupplierData,
    });

    const activeTier = hybridEval.tiers[preferredTier] || hybridEval.tiers.standard;

    // Tally provenance
    let liveCount = 0;
    let verifiedCount = 0;
    let estimatedCount = 0;
    let unavailableCount = 0;

    Object.values(activeTier.categories).forEach((cat) => {
      cat.items.forEach((item) => {
        if (item.provenance.source === 'LIVE') liveCount++;
        else if (item.provenance.source === 'VERIFIED_REFERENCE') verifiedCount++;
        else if (item.provenance.source === 'ESTIMATED') estimatedCount++;
        else if (item.provenance.source === 'UNAVAILABLE') unavailableCount++;
      });
    });

    const totalCost = activeTier.totalGroupCost;
    const fitsBudget = userBudget ? totalCost <= userBudget : true;
    const deficitAmount = userBudget && totalCost > userBudget ? totalCost - userBudget : 0;
    const surplusAmount = userBudget && totalCost < userBudget ? userBudget - totalCost : 0;

    return {
      isEstimateOnly: true,
      currency: 'INR',
      origin,
      destination: primaryDest,
      destinations,
      durationDays,
      hotelNights,
      travelersCount,
      roomsCount,
      selectedTransportMode: hybridEval.selectedTransportMode,
      recommendedTier: hybridEval.recommendedTier,
      selectedTier: preferredTier,
      activeTierPricing: activeTier,
      activeTier: activeTier,
      tiers: hybridEval.tiers,
      budgetAnalysis: {
        userBudgetInr: userBudget,
        fitsBudget,
        deficitAmount,
        surplusAmount,
        tradeoffSuggestions: hybridEval.budgetAnalysis.tradeoffSuggestions,
        spendingLimitAdvisory: hybridEval.budgetAnalysis.spendingLimitAdvisory,
      },
      provenanceSummary: {
        liveSuppliersConsulted: liveCount,
        verifiedReferencesUsed: verifiedCount,
        estimatedItemsCount: estimatedCount,
        unavailableItemsCount: unavailableCount,
      },
      auditTrail: {
        engine: 'BharatYatra Pricing Engine',
        version: this.ENGINE_VERSION,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Fast recalculation of pricing when ONLY the user's budget or tier changes.
   * Completely bypasses itinerary generation, preserving 100% of days and activities.
   */
  public static recalculateOnBudgetChange(
    existingPricing: PricingEngineResult,
    newBudgetInr?: number,
    newTier?: 'budget' | 'standard' | 'premium' | 'luxury'
  ): PricingEngineResult {
    const activeTierKey = newTier || existingPricing.selectedTier;
    const activeTier = existingPricing.tiers[activeTierKey] || existingPricing.tiers.standard;

    const totalCost = activeTier.totalGroupCost;
    const fitsBudget = newBudgetInr ? totalCost <= newBudgetInr : true;
    const deficitAmount = newBudgetInr && totalCost > newBudgetInr ? totalCost - newBudgetInr : 0;
    const surplusAmount = newBudgetInr && totalCost < newBudgetInr ? newBudgetInr - totalCost : 0;

    // Recommend best tier that fits new budget
    let recommendedTier: 'budget' | 'standard' | 'premium' | 'luxury' = 'standard';
    if (newBudgetInr) {
      if (newBudgetInr >= existingPricing.tiers.luxury.totalGroupCost) {
        recommendedTier = 'luxury';
      } else if (newBudgetInr >= existingPricing.tiers.premium.totalGroupCost) {
        recommendedTier = 'premium';
      } else if (newBudgetInr >= existingPricing.tiers.standard.totalGroupCost) {
        recommendedTier = 'standard';
      } else {
        recommendedTier = 'budget';
      }
    }

    return {
      ...existingPricing,
      selectedTier: activeTierKey,
      recommendedTier,
      activeTierPricing: activeTier,
      budgetAnalysis: {
        ...existingPricing.budgetAnalysis,
        userBudgetInr: newBudgetInr,
        fitsBudget,
        deficitAmount,
        surplusAmount,
      },
      auditTrail: {
        engine: 'BharatYatra Pricing Engine',
        version: this.ENGINE_VERSION,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
