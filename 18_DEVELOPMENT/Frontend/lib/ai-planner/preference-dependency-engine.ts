/**
 * BharatYatra AI 2.0 — Preference Dependency Engine & Change Impact Classifier
 * Determines module recalculation invalidation sets, dependency graphs,
 * change classifications, and locked preference conflict detection.
 */

import {
  TripPreferenceProfile,
  PlanningModuleId,
  ChangeImpactType,
} from './universal-preference-profile';

export interface PreferenceChangeEvaluation {
  changedPaths: string[];
  impactLevel: ChangeImpactType;
  affectedModules: PlanningModuleId[];
  isCritical: boolean;
  requiresFullRecomputation: boolean;
  conflicts: Array<{
    lockedKey: string;
    requestedChange: string;
    explanation: string;
    remedyOptions: string[];
  }>;
}

/**
 * Authoritative mapping of preference paths to dependent AI planning subsystems
 */
const DEPENDENCY_MAP: Record<string, PlanningModuleId[]> = {
  // 1. Budget Changes
  'budget.totalBudget': [
    'HybridPricingEngine',
    'BudgetEngine',
    'TransportationEngine',
    'AccommodationEngine',
    'ActivityEngine',
    'TravelFeasibilityEngine',
    'ItineraryGenerator',
    'QualityScorer',
  ],
  'budget.pricingCategory': [
    'HybridPricingEngine',
    'BudgetEngine',
    'AccommodationEngine',
    'TransportationEngine',
    'ActivityEngine',
  ],
  'budget.maxSpendingLimit': [
    'HybridPricingEngine',
    'BudgetEngine',
    'TravelFeasibilityEngine',
  ],

  // 2. Duration & Dates Changes
  'identity.tripDurationDays': [
    'DurationRecommendationEngine',
    'AccommodationEngine',
    'TransportationEngine',
    'ActivityEngine',
    'ItineraryGenerator',
    'HybridPricingEngine',
    'BudgetEngine',
    'TravelFeasibilityEngine',
    'QualityScorer',
  ],
  'identity.durationMode': [
    'DurationRecommendationEngine',
    'ItineraryGenerator',
  ],
  'identity.startDate': [
    'SeasonalIntelligence',
    'TransportationEngine',
    'AccommodationEngine',
    'HybridPricingEngine',
    'ItineraryGenerator',
  ],
  'identity.endDate': [
    'SeasonalIntelligence',
    'TransportationEngine',
    'AccommodationEngine',
    'HybridPricingEngine',
  ],

  // 3. Transport Changes
  'transport.preferredTransport': [
    'RouteOptimizer',
    'TransportationEngine',
    'HybridPricingEngine',
    'BudgetEngine',
    'ItineraryGenerator',
    'TravelFeasibilityEngine',
  ],
  'transport.localTransport': [
    'TransportationEngine',
    'HybridPricingEngine',
    'BudgetEngine',
    'ItineraryGenerator',
  ],
  'transport.outboundTransport': [
    'TransportationEngine',
    'HybridPricingEngine',
    'ItineraryGenerator',
  ],
  'transport.returnTransport': [
    'TransportationEngine',
    'HybridPricingEngine',
    'ItineraryGenerator',
  ],

  // 4. Destination & Geography Changes
  'identity.destination': [
    'GeographyEngine',
    'RouteOptimizer',
    'DestinationIntelligence',
    'DurationRecommendationEngine',
    'HybridPricingEngine',
    'BudgetEngine',
    'AccommodationEngine',
    'ActivityEngine',
    'ItineraryGenerator',
    'SeasonalIntelligence',
    'TravelFeasibilityEngine',
    'QualityScorer',
  ],
  'identity.destinationList': [
    'GeographyEngine',
    'RouteOptimizer',
    'DestinationIntelligence',
    'DurationRecommendationEngine',
    'HybridPricingEngine',
    'BudgetEngine',
    'AccommodationEngine',
    'ActivityEngine',
    'ItineraryGenerator',
    'SeasonalIntelligence',
    'TravelFeasibilityEngine',
    'QualityScorer',
  ],
  'identity.origin': [
    'GeographyEngine',
    'RouteOptimizer',
    'TransportationEngine',
    'DurationRecommendationEngine',
    'HybridPricingEngine',
    'BudgetEngine',
  ],

  // 5. Travelers Count & Composition
  'identity.travelersCount': [
    'AccommodationEngine',
    'TransportationEngine',
    'HybridPricingEngine',
    'BudgetEngine',
    'ItineraryGenerator',
    'QualityScorer',
  ],
  'identity.travelerComposition': [
    'AccommodationEngine',
    'TransportationEngine',
    'ActivityEngine',
    'TravelFeasibilityEngine',
    'QualityScorer',
  ],

  // 6. Accommodation Changes
  'accommodation.category': [
    'AccommodationEngine',
    'HybridPricingEngine',
    'BudgetEngine',
  ],
  'accommodation.propertyType': [
    'AccommodationEngine',
    'HybridPricingEngine',
  ],
  'accommodation.numberOfRooms': [
    'AccommodationEngine',
    'HybridPricingEngine',
    'BudgetEngine',
  ],

  // 7. Food & Dining Changes
  'food.preference': [
    'FoodRecommendationEngine',
    'BudgetEngine',
    'HybridPricingEngine',
  ],
  'food.mealBudgetPerDay': [
    'FoodRecommendationEngine',
    'BudgetEngine',
    'HybridPricingEngine',
  ],
  'food.dietaryRequirements': [
    'FoodRecommendationEngine',
  ],

  // 8. Interests & Activities
  interests: [
    'ActivityEngine',
    'ItineraryGenerator',
    'BudgetEngine',
    'QualityScorer',
  ],

  // 9. Travel Pace
  'pace.style': [
    'ActivityEngine',
    'ItineraryGenerator',
    'TravelFeasibilityEngine',
    'QualityScorer',
  ],
  'pace.maxAttractionsPerDay': [
    'ActivityEngine',
    'ItineraryGenerator',
  ],

  // 10. Accessibility & Safety
  'accessibility.mobility': [
    'ActivityEngine',
    'TransportationEngine',
    'TravelFeasibilityEngine',
    'ItineraryGenerator',
  ],
  'accessibility.altitudeSensitive': [
    'TravelFeasibilityEngine',
    'DurationRecommendationEngine',
    'ItineraryGenerator',
  ],

  // 11. Customization & Overrides
  'customization.includedDestinations': [
    'DestinationIntelligence',
    'RouteOptimizer',
    'ItineraryGenerator',
  ],
  'customization.excludedDestinations': [
    'DestinationIntelligence',
    'RouteOptimizer',
    'ItineraryGenerator',
  ],
  'customization.preferredAttractions': [
    'ActivityEngine',
    'ItineraryGenerator',
  ],
  'customization.excludedAttractions': [
    'ActivityEngine',
    'ItineraryGenerator',
  ],
};

/**
 * Classifies the impact level of modified preference paths
 */
export function classifyChangeImpact(
  changedPaths: string[],
  currentProfile: TripPreferenceProfile,
  proposedPatch: Record<string, any>
): ChangeImpactType {
  // Check if any changed path is locked
  for (const path of changedPaths) {
    if (currentProfile.lockedKeys.includes(path)) {
      return 'USER_LOCKED';
    }
  }

  // Critical changes affect trip feasibility, geography, or severe budget compression
  const criticalPrefixes = [
    'identity.destination',
    'identity.destinationList',
    'identity.origin',
    'identity.tripDurationDays',
    'accessibility.mobility',
    'accessibility.altitudeSensitive',
  ];

  const hasCritical = changedPaths.some(path =>
    criticalPrefixes.some(cp => path.startsWith(cp))
  );

  if (hasCritical) return 'CRITICAL';

  // Check for severe budget change (>25% reduction is CRITICAL)
  if (changedPaths.includes('budget.totalBudget') && proposedPatch.budget?.totalBudget) {
    const prev = currentProfile.budget.totalBudget;
    const next = proposedPatch.budget.totalBudget;
    if (next < prev * 0.75) {
      return 'CRITICAL';
    }
  }

  // Dependent changes alter specific subsystems
  const dependentPrefixes = [
    'budget.',
    'transport.',
    'accommodation.',
    'food.',
    'pace.',
    'interests',
    'identity.travelersCount',
  ];

  const hasDependent = changedPaths.some(path =>
    dependentPrefixes.some(dp => path.startsWith(dp))
  );

  if (hasDependent) return 'DEPENDENT';

  return 'INDEPENDENT';
}

/**
 * Evaluates proposed changes against dependencies and user locks
 */
export function evaluatePreferenceChanges(
  currentProfile: TripPreferenceProfile,
  patch: Partial<TripPreferenceProfile> | Record<string, any>
): PreferenceChangeEvaluation {
  const changedPaths = extractChangedPaths(currentProfile, patch);
  const conflicts: PreferenceChangeEvaluation['conflicts'] = [];

  // 1. Detect User Lock Violations
  for (const path of changedPaths) {
    if (currentProfile.lockedKeys.includes(path)) {
      conflicts.push({
        lockedKey: path,
        requestedChange: `Modify ${path}`,
        explanation: `Field '${path}' is locked by you to prevent automated AI modification.`,
        remedyOptions: [
          `Unlock '${path}' to allow automatic optimization.`,
          `Keep '${path}' locked and adjust flexible parameters instead.`,
        ],
      });
    }
  }

  // 2. Detect Cross-Field Feasibility Conflicts with Locked Keys
  // Case A: Locked Budget vs Expensive Transport/Accommodation
  if (
    currentProfile.lockedKeys.includes('budget.totalBudget') &&
    (patch.accommodation?.category === 'luxury-villa' ||
      patch.accommodation?.category === 'heritage-palace' ||
      patch.transport?.preferredTransport === 'flight')
  ) {
    const minEstimated = (patch.identity?.tripDurationDays || currentProfile.identity.tripDurationDays) * 12000;
    if (currentProfile.budget.totalBudget < minEstimated) {
      conflicts.push({
        lockedKey: 'budget.totalBudget',
        requestedChange: `Upgrade to ${patch.accommodation?.category || patch.transport?.preferredTransport}`,
        explanation: `Your locked budget of ₹${currentProfile.budget.totalBudget.toLocaleString('en-IN')} cannot support luxury tiers (estimated minimum ₹${minEstimated.toLocaleString('en-IN')}).`,
        remedyOptions: [
          'Increase your budget limit.',
          'Select standard or budget tier accommodations/transport.',
          'Reduce trip duration.',
        ],
      });
    }
  }

  // Case B: High Altitude Medical Safety vs Locked Short Duration
  const targetDest = patch.identity?.destination || currentProfile.identity.destination;
  const isHighAltitude =
    targetDest.toLowerCase().includes('ladakh') ||
    targetDest.toLowerCase().includes('leh') ||
    targetDest.toLowerCase().includes('spiti') ||
    targetDest.toLowerCase().includes('kedarnath');

  const duration = patch.identity?.tripDurationDays || currentProfile.identity.tripDurationDays;

  if (isHighAltitude && duration < 5 && currentProfile.lockedKeys.includes('identity.tripDurationDays')) {
    conflicts.push({
      lockedKey: 'identity.tripDurationDays',
      requestedChange: `Keep duration at ${duration} days for high-altitude destination`,
      explanation: `Medical safety protocol: Destinations at ≥2800m altitude (like ${targetDest}) mandate 48 hours acclimatization. A ${duration}-day trip presents acute altitude sickness (AMS) health risks.`,
      remedyOptions: [
        'Allow duration extension to recommended 6–8 days for safe acclimatization.',
        'Choose a lower-altitude destination (e.g. Manali, Dharamshala, Shimla, or Kashmir Valley).',
      ],
    });
  }

  // 3. Aggregate Dependent Modules
  const affectedModulesSet = new Set<PlanningModuleId>();
  for (const path of changedPaths) {
    // Exact match
    if (DEPENDENCY_MAP[path]) {
      DEPENDENCY_MAP[path].forEach(m => affectedModulesSet.add(m));
    }
    // Prefix / Interests match
    if (path.startsWith('interests.')) {
      DEPENDENCY_MAP['interests'].forEach(m => affectedModulesSet.add(m));
    }
    for (const [key, modules] of Object.entries(DEPENDENCY_MAP)) {
      if (path.startsWith(key)) {
        modules.forEach(m => affectedModulesSet.add(m));
      }
    }
  }

  const impactLevel = classifyChangeImpact(changedPaths, currentProfile, patch);
  const isCritical = impactLevel === 'CRITICAL';
  const requiresFullRecomputation = isCritical || affectedModulesSet.has('ItineraryGenerator');

  return {
    changedPaths,
    impactLevel,
    affectedModules: Array.from(affectedModulesSet),
    isCritical,
    requiresFullRecomputation,
    conflicts,
  };
}

/**
 * Flattens an object to identify dot-notated paths of modified values
 */
function extractChangedPaths(current: any, patch: any, prefix = ''): string[] {
  const paths: string[] = [];
  if (!patch || typeof patch !== 'object') return paths;

  for (const key of Object.keys(patch)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    const patchVal = patch[key];
    const currentVal = current ? current[key] : undefined;

    if (
      patchVal !== null &&
      typeof patchVal === 'object' &&
      !Array.isArray(patchVal)
    ) {
      paths.push(...extractChangedPaths(currentVal, patchVal, fullPath));
    } else if (JSON.stringify(patchVal) !== JSON.stringify(currentVal)) {
      paths.push(fullPath);
    }
  }

  return paths;
}
