/**
 * BharatYatra AI 2.0 — Universal Trip Preferences Manager Service
 * Orchestrates Single Source of Truth, Atomic Recalculations, Dependency Invalidation,
 * Change Explanations, Undo / Version Restoration, and User Locking.
 */

import {
  TripPreferenceProfile,
  PreferenceVersionSnapshot,
  ChangeExplanation,
  createDefaultPreferenceProfile,
  convertPreferenceProfileToRequest,
} from './universal-preference-profile';
import {
  evaluatePreferenceChanges,
  PreferenceChangeEvaluation,
} from './preference-dependency-engine';
import { generateMasterTripPlan } from './planner-service';
import { TripPlanningResponse } from './types';

export interface PreferenceUpdateResult {
  success: boolean;
  profile: TripPreferenceProfile;
  plan: TripPlanningResponse;
  explanation: ChangeExplanation;
  evaluation: PreferenceChangeEvaluation;
  unresolvedConflicts?: PreferenceChangeEvaluation['conflicts'];
}

export interface VersionComparisonResult {
  versionA: number;
  versionB: number;
  changedPreferences: Array<{ path: string; valA: any; valB: any }>;
  priceDelta: { totalA: number; totalB: number; difference: number };
  durationDelta: { daysA: number; daysB: number; difference: number };
}

// In-Memory Global Store (can be backed by Redis / PostgreSQL in cluster)
class UniversalPreferenceStore {
  private profiles = new Map<string, TripPreferenceProfile>();
  private histories = new Map<string, PreferenceVersionSnapshot[]>();
  private activePlans = new Map<string, TripPlanningResponse>();

  /**
   * Initializes or registers a new profile
   */
  async createProfile(initialData?: Partial<TripPreferenceProfile['identity']>): Promise<{
    profile: TripPreferenceProfile;
    plan: TripPlanningResponse;
  }> {
    const profile = createDefaultPreferenceProfile(initialData);
    const request = convertPreferenceProfileToRequest(profile);
    const plan = await generateMasterTripPlan(request);

    this.profiles.set(profile.id, profile);
    this.activePlans.set(profile.id, plan);

    const initialSnapshot: PreferenceVersionSnapshot = {
      version: 1,
      timestamp: profile.lastUpdated,
      profile: JSON.parse(JSON.stringify(profile)),
      planSnapshot: JSON.parse(JSON.stringify(plan)),
      explanation: {
        summary: `Initial travel preference profile established for ${profile.identity.origin} to ${profile.identity.destination}.`,
        triggeredBy: ['initialization'],
        impactLevel: 'CRITICAL',
        affectedModules: [
          'GeographyEngine',
          'RouteOptimizer',
          'DurationRecommendationEngine',
          'HybridPricingEngine',
          'ItineraryGenerator',
        ],
        changedFields: [],
        preservedFields: Object.keys(profile),
        priceDelta: {
          previousTotalInr: 0,
          newTotalInr: plan.budget.totalEstimatedInr,
          differenceInr: plan.budget.totalEstimatedInr,
          reason: 'Initial calibrated estimate',
        },
        tradeoffSuggestions: plan.budget.tradeoffSuggestions || [],
        conflictsDetected: [],
      },
    };

    this.histories.set(profile.id, [initialSnapshot]);
    return { profile, plan };
  }

  /**
   * Retrieves an active profile
   */
  getProfile(profileId: string): TripPreferenceProfile | undefined {
    return this.profiles.get(profileId);
  }

  /**
   * Retrieves the current validated plan for a profile
   */
  getActivePlan(profileId: string): TripPlanningResponse | undefined {
    return this.activePlans.get(profileId);
  }

  /**
   * Retrieves full version history
   */
  getHistory(profileId: string): PreferenceVersionSnapshot[] {
    return this.histories.get(profileId) || [];
  }

  /**
   * Locks a specific preference path to prevent automated AI modification
   */
  lockPreference(profileId: string, path: string): TripPreferenceProfile {
    const profile = this.profiles.get(profileId);
    if (!profile) throw new Error(`Profile ${profileId} not found.`);
    if (!profile.lockedKeys.includes(path)) {
      profile.lockedKeys.push(path);
      profile.lastUpdated = new Date().toISOString();
    }
    return profile;
  }

  /**
   * Unlocks a preference path
   */
  unlockPreference(profileId: string, path: string): TripPreferenceProfile {
    const profile = this.profiles.get(profileId);
    if (!profile) throw new Error(`Profile ${profileId} not found.`);
    profile.lockedKeys = profile.lockedKeys.filter(k => k !== path);
    profile.lastUpdated = new Date().toISOString();
    return profile;
  }

  /**
   * Controlled Atomic Recalculation Transaction
   */
  async updatePreferences(
    profileId: string,
    patch: Record<string, any>,
    options?: { forceOverrideLocks?: boolean; customReason?: string }
  ): Promise<PreferenceUpdateResult> {
    const currentProfile = this.profiles.get(profileId);
    const previousPlan = this.activePlans.get(profileId);

    if (!currentProfile) {
      throw new Error(`TripPreferenceProfile '${profileId}' not found.`);
    }

    // 1. Dependency Engine Evaluation
    const evaluation = evaluatePreferenceChanges(currentProfile, patch);

    // 2. Conflict Handling for Locked Preferences
    if (evaluation.conflicts.length > 0 && !options?.forceOverrideLocks) {
      return {
        success: false,
        profile: currentProfile,
        plan: previousPlan || (await generateMasterTripPlan(convertPreferenceProfileToRequest(currentProfile))),
        explanation: {
          summary: `Update blocked: Proposed changes conflict with your locked preferences.`,
          triggeredBy: evaluation.changedPaths,
          impactLevel: 'USER_LOCKED',
          affectedModules: evaluation.affectedModules,
          changedFields: [],
          preservedFields: Object.keys(currentProfile),
          priceDelta: {
            previousTotalInr: previousPlan?.budget.totalEstimatedInr || 0,
            newTotalInr: previousPlan?.budget.totalEstimatedInr || 0,
            differenceInr: 0,
            reason: 'No recalculation applied due to locked conflicts',
          },
          tradeoffSuggestions: evaluation.conflicts.flatMap(c => c.remedyOptions),
          conflictsDetected: evaluation.conflicts,
        },
        evaluation,
        unresolvedConflicts: evaluation.conflicts,
      };
    }

    // 3. Immutably merge patch into new profile version
    const updatedProfile: TripPreferenceProfile = JSON.parse(JSON.stringify(currentProfile));
    deepMerge(updatedProfile, patch);
    updatedProfile.version = currentProfile.version + 1;
    updatedProfile.lastUpdated = new Date().toISOString();

    // 4. Execute AI Planning Subsystem Recalculation
    const planningRequest = convertPreferenceProfileToRequest(updatedProfile);
    const newPlan = await generateMasterTripPlan(planningRequest);

    // 5. Generate Change Explanation & Itemized Diff
    const prevCost = previousPlan?.budget.totalEstimatedInr || updatedProfile.budget.totalBudget;
    const newCost = newPlan.budget.totalEstimatedInr;
    const diff = newCost - prevCost;

    // Check if budget is insufficient (no fabricated supplier rates)
    const userMaxBudget = updatedProfile.budget.totalBudget;
    const budgetShortfall = newCost > userMaxBudget ? newCost - userMaxBudget : 0;

    const explanationSummary = generateExplanationSummary(
      evaluation,
      currentProfile,
      updatedProfile,
      prevCost,
      newCost,
      budgetShortfall
    );

    const explanation: ChangeExplanation = {
      summary: explanationSummary,
      triggeredBy: evaluation.changedPaths,
      impactLevel: evaluation.impactLevel,
      affectedModules: evaluation.affectedModules,
      changedFields: evaluation.changedPaths.map(p => ({
        path: p,
        previousValue: getNestedValue(currentProfile, p),
        newValue: getNestedValue(updatedProfile, p),
        reason: options?.customReason || 'User requested preference adjustment',
      })),
      preservedFields: findPreservedFields(currentProfile, evaluation.changedPaths),
      priceDelta: {
        previousTotalInr: prevCost,
        newTotalInr: newCost,
        differenceInr: diff,
        reason:
          diff > 0
            ? `Cost increased by ₹${diff.toLocaleString('en-IN')} due to modified travel components.`
            : diff < 0
            ? `Cost reduced by ₹${Math.abs(diff).toLocaleString('en-IN')} via optimized selections.`
            : 'Pricing remained balanced.',
      },
      durationDelta: {
        previousDays: currentProfile.identity.tripDurationDays,
        newDays: updatedProfile.identity.tripDurationDays,
      },
      budgetShortfallInr: budgetShortfall > 0 ? budgetShortfall : undefined,
      tradeoffSuggestions: [
        ...(newPlan.budget.tradeoffSuggestions || []),
        ...(budgetShortfall > 0
          ? [
              `Plan exceeds budget by ₹${budgetShortfall.toLocaleString('en-IN')}. Consider switching to sleeper train or standard stays to bridge the gap.`,
            ]
          : []),
      ],
      conflictsDetected: evaluation.conflicts,
    };

    // 6. Commit to Store & Snapshot History
    this.profiles.set(profileId, updatedProfile);
    this.activePlans.set(profileId, newPlan);

    const history = this.histories.get(profileId) || [];
    history.push({
      version: updatedProfile.version,
      timestamp: updatedProfile.lastUpdated,
      profile: JSON.parse(JSON.stringify(updatedProfile)),
      planSnapshot: JSON.parse(JSON.stringify(newPlan)),
      explanation,
    });
    this.histories.set(profileId, history);

    return {
      success: true,
      profile: updatedProfile,
      plan: newPlan,
      explanation,
      evaluation,
    };
  }

  /**
   * Undo recent customization — reverts to version N-1
   */
  async undoRecentChange(profileId: string): Promise<PreferenceUpdateResult> {
    const history = this.histories.get(profileId);
    if (!history || history.length <= 1) {
      throw new Error(`No previous version available to undo for profile ${profileId}.`);
    }

    // Pop the current top version
    history.pop();
    const targetSnapshot = history[history.length - 1];

    const restoredProfile = JSON.parse(JSON.stringify(targetSnapshot.profile));
    restoredProfile.version = (this.profiles.get(profileId)?.version || targetSnapshot.version) + 1;
    restoredProfile.lastUpdated = new Date().toISOString();

    const plan = targetSnapshot.planSnapshot || (await generateMasterTripPlan(convertPreferenceProfileToRequest(restoredProfile)));

    this.profiles.set(profileId, restoredProfile);
    this.activePlans.set(profileId, plan);

    const explanation: ChangeExplanation = {
      summary: `Reverted to previous trip plan version ${targetSnapshot.version}.`,
      triggeredBy: ['undo'],
      impactLevel: 'CRITICAL',
      affectedModules: ['ItineraryGenerator', 'HybridPricingEngine', 'BudgetEngine'],
      changedFields: [],
      preservedFields: Object.keys(restoredProfile),
      priceDelta: {
        previousTotalInr: this.activePlans.get(profileId)?.budget.totalEstimatedInr || plan.budget.totalEstimatedInr,
        newTotalInr: plan.budget.totalEstimatedInr,
        differenceInr: 0,
        reason: 'Restored from history snapshot',
      },
      tradeoffSuggestions: plan.budget.tradeoffSuggestions || [],
      conflictsDetected: [],
    };

    history.push({
      version: restoredProfile.version,
      timestamp: restoredProfile.lastUpdated,
      profile: JSON.parse(JSON.stringify(restoredProfile)),
      planSnapshot: JSON.parse(JSON.stringify(plan)),
      explanation,
    });

    return {
      success: true,
      profile: restoredProfile,
      plan,
      explanation,
      evaluation: {
        changedPaths: ['undo'],
        impactLevel: 'CRITICAL',
        affectedModules: ['ItineraryGenerator', 'HybridPricingEngine'],
        isCritical: true,
        requiresFullRecomputation: false,
        conflicts: [],
      },
    };
  }

  /**
   * Restores a specific version from history
   */
  async restoreVersion(profileId: string, targetVersion: number): Promise<PreferenceUpdateResult> {
    const history = this.histories.get(profileId);
    if (!history) throw new Error(`History not found for profile ${profileId}.`);

    const snapshot = history.find(s => s.version === targetVersion);
    if (!snapshot) throw new Error(`Version ${targetVersion} not found in profile history.`);

    const current = this.profiles.get(profileId);
    const restoredProfile = JSON.parse(JSON.stringify(snapshot.profile));
    restoredProfile.version = (current?.version || targetVersion) + 1;
    restoredProfile.lastUpdated = new Date().toISOString();

    const plan = snapshot.planSnapshot || (await generateMasterTripPlan(convertPreferenceProfileToRequest(restoredProfile)));

    this.profiles.set(profileId, restoredProfile);
    this.activePlans.set(profileId, plan);

    const explanation: ChangeExplanation = {
      summary: `Restored exact plan from version ${targetVersion}.`,
      triggeredBy: [`restore-v${targetVersion}`],
      impactLevel: 'CRITICAL',
      affectedModules: ['ItineraryGenerator', 'HybridPricingEngine'],
      changedFields: [],
      preservedFields: Object.keys(restoredProfile),
      priceDelta: {
        previousTotalInr: current?.budget.totalBudget || plan.budget.totalEstimatedInr,
        newTotalInr: plan.budget.totalEstimatedInr,
        differenceInr: plan.budget.totalEstimatedInr - (current?.budget.totalBudget || 0),
        reason: `Restored version ${targetVersion}`,
      },
      tradeoffSuggestions: plan.budget.tradeoffSuggestions || [],
      conflictsDetected: [],
    };

    history.push({
      version: restoredProfile.version,
      timestamp: restoredProfile.lastUpdated,
      profile: JSON.parse(JSON.stringify(restoredProfile)),
      planSnapshot: JSON.parse(JSON.stringify(plan)),
      explanation,
    });

    return {
      success: true,
      profile: restoredProfile,
      plan,
      explanation,
      evaluation: {
        changedPaths: [`restore-v${targetVersion}`],
        impactLevel: 'CRITICAL',
        affectedModules: ['ItineraryGenerator', 'HybridPricingEngine'],
        isCritical: true,
        requiresFullRecomputation: false,
        conflicts: [],
      },
    };
  }

  /**
   * Compares two versions of a profile
   */
  compareVersions(profileId: string, versionA: number, versionB: number): VersionComparisonResult {
    const history = this.histories.get(profileId);
    if (!history) throw new Error(`History not found for profile ${profileId}.`);

    const snapA = history.find(s => s.version === versionA);
    const snapB = history.find(s => s.version === versionB);

    if (!snapA || !snapB) {
      throw new Error(`One or both versions (${versionA}, ${versionB}) not found in history.`);
    }

    const changedPreferences: VersionComparisonResult['changedPreferences'] = [];
    findDeepDiff(snapA.profile, snapB.profile, '', changedPreferences);

    const costA = snapA.planSnapshot?.budget.totalEstimatedInr || snapA.profile.budget.totalBudget;
    const costB = snapB.planSnapshot?.budget.totalEstimatedInr || snapB.profile.budget.totalBudget;

    return {
      versionA,
      versionB,
      changedPreferences,
      priceDelta: {
        totalA: costA,
        totalB: costB,
        difference: costB - costA,
      },
      durationDelta: {
        daysA: snapA.profile.identity.tripDurationDays,
        daysB: snapB.profile.identity.tripDurationDays,
        difference: snapB.profile.identity.tripDurationDays - snapA.profile.identity.tripDurationDays,
      },
    };
  }
}

// Singleton Engine Instance
export const universalPreferenceManager = new UniversalPreferenceStore();

// Deep Helpers
function deepMerge(target: any, source: any) {
  if (!source || typeof source !== 'object') return;
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      if (!target[key] || typeof target[key] !== 'object') target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function findPreservedFields(profile: TripPreferenceProfile, changedPaths: string[]): string[] {
  const allCoreFields = [
    'identity.destination',
    'identity.origin',
    'identity.tripDurationDays',
    'food.preference',
    'transport.preferredTransport',
    'accommodation.category',
    'pace.style',
    'accessibility.mobility',
  ];
  return allCoreFields.filter(f => !changedPaths.includes(f));
}

function findDeepDiff(
  a: any,
  b: any,
  prefix: string,
  out: VersionComparisonResult['changedPreferences']
) {
  if (!a || !b) return;
  const keys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)]));
  for (const k of keys) {
    if (k === 'version' || k === 'lastUpdated') continue;
    const path = prefix ? `${prefix}.${k}` : k;
    const valA = a[k];
    const valB = b[k];

    if (
      valA !== null &&
      valB !== null &&
      typeof valA === 'object' &&
      typeof valB === 'object' &&
      !Array.isArray(valA) &&
      !Array.isArray(valB)
    ) {
      findDeepDiff(valA, valB, path, out);
    } else if (JSON.stringify(valA) !== JSON.stringify(valB)) {
      out.push({ path, valA, valB });
    }
  }
}

function generateExplanationSummary(
  evaluation: PreferenceChangeEvaluation,
  before: TripPreferenceProfile,
  after: TripPreferenceProfile,
  prevCost: number,
  newCost: number,
  shortfall: number
): string {
  const parts: string[] = [];

  // Budget change explanation
  if (evaluation.changedPaths.includes('budget.totalBudget')) {
    parts.push(
      `Your budget was adjusted from ₹${before.budget.totalBudget.toLocaleString('en-IN')} to ₹${after.budget.totalBudget.toLocaleString('en-IN')}.`
    );
  }

  // Duration change explanation
  if (evaluation.changedPaths.includes('identity.tripDurationDays')) {
    parts.push(
      `Trip duration changed from ${before.identity.tripDurationDays} to ${after.identity.tripDurationDays} days.`
    );
  }

  // Transport change explanation
  if (evaluation.changedPaths.includes('transport.preferredTransport')) {
    parts.push(`Primary transport mode updated to ${after.transport.preferredTransport}.`);
  }

  // Accommodation change explanation
  if (evaluation.changedPaths.includes('accommodation.category')) {
    parts.push(`Accommodation category updated to ${after.accommodation.category}.`);
  }

  // Preserve statement
  const preservedNames: string[] = [];
  if (!evaluation.changedPaths.includes('identity.destination')) preservedNames.push('destination');
  if (!evaluation.changedPaths.includes('food.preference')) preservedNames.push('food preferences');
  if (!evaluation.changedPaths.some(p => p.startsWith('interests'))) preservedNames.push('selected interests');
  if (!evaluation.changedPaths.includes('accessibility.mobility')) preservedNames.push('accessibility needs');

  if (preservedNames.length > 0) {
    parts.push(`Your ${preservedNames.join(', ')} remain completely unchanged.`);
  }

  // Cost delta
  const diff = newCost - prevCost;
  if (diff > 0) {
    parts.push(`Revised plan cost is ₹${newCost.toLocaleString('en-IN')} (+₹${diff.toLocaleString('en-IN')}).`);
  } else if (diff < 0) {
    parts.push(
      `Revised plan cost reduced to ₹${newCost.toLocaleString('en-IN')} (-₹${Math.abs(diff).toLocaleString('en-IN')}).`
    );
  }

  // Shortfall warning
  if (shortfall > 0) {
    parts.push(
      `The plan exceeds your budget by ₹${shortfall.toLocaleString('en-IN')} based on verified live rates. Review alternative transport or stays.`
    );
  }

  return parts.join(' ');
}
