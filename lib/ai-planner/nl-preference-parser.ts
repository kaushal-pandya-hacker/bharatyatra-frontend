/**
 * BharatYatra AI 2.0 — Natural Language Preference Command Parser
 * Connects conversational user commands directly to the Centralized Universal Preferences Engine.
 */

import { TripPreferenceProfile } from './universal-preference-profile';

export interface NLCommandParseResult {
  understood: boolean;
  actionSummary: string;
  patch: Record<string, any>;
  clarificationNeeded?: string;
}

export function parseNaturalLanguagePreferenceCommand(
  command: string,
  currentProfile: TripPreferenceProfile
): NLCommandParseResult {
  const text = command.trim().toLowerCase();
  const patch: Record<string, any> = {};
  let actionSummary = '';

  // 1. Budget Modifications
  if (text.includes('cheaper') || text.includes('reduce budget') || text.includes('lower budget') || text.includes('budget low')) {
    const newBudget = Math.round(currentProfile.budget.totalBudget * 0.8);
    patch.budget = {
      totalBudget: newBudget,
      pricingCategory: currentProfile.budget.pricingCategory === 'luxury' ? 'premium' : 'budget',
    };
    actionSummary = `Reduced budget by 20% to ₹${newBudget.toLocaleString('en-IN')}`;
    return { understood: true, actionSummary, patch };
  }

  if (text.includes('increase budget') || text.includes('more budget') || text.includes('upgrade budget')) {
    const newBudget = Math.round(currentProfile.budget.totalBudget * 1.3);
    patch.budget = {
      totalBudget: newBudget,
      pricingCategory: 'premium',
    };
    actionSummary = `Increased budget by 30% to ₹${newBudget.toLocaleString('en-IN')}`;
    return { understood: true, actionSummary, patch };
  }

  // 2. Duration Modifications
  const addDaysMatch = text.match(/add\s+(\d+|two|three|four|one)\s+days?/);
  if (addDaysMatch) {
    const wordMap: Record<string, number> = { one: 1, two: 2, three: 3, four: 4 };
    const daysToAdd = wordMap[addDaysMatch[1]] || parseInt(addDaysMatch[1], 10) || 1;
    const newDays = currentProfile.identity.tripDurationDays + daysToAdd;
    patch.identity = { tripDurationDays: newDays };
    actionSummary = `Added ${daysToAdd} day(s), expanding trip duration to ${newDays} days`;
    return { understood: true, actionSummary, patch };
  }

  const reduceDaysMatch = text.match(/(reduce|cut|remove)\s+(\d+|two|three|one)\s+days?/);
  if (reduceDaysMatch) {
    const wordMap: Record<string, number> = { one: 1, two: 2, three: 3 };
    const daysToSub = wordMap[reduceDaysMatch[2]] || parseInt(reduceDaysMatch[2], 10) || 1;
    const newDays = Math.max(2, currentProfile.identity.tripDurationDays - daysToSub);
    patch.identity = { tripDurationDays: newDays };
    actionSummary = `Reduced trip duration by ${daysToSub} day(s) to ${newDays} days`;
    return { understood: true, actionSummary, patch };
  }

  // 3. Hotel Category Modifications
  if (text.includes('premium hotel') || text.includes('hotel to premium') || text.includes('luxury stay') || text.includes('5 star')) {
    patch.accommodation = { category: 'heritage-palace', propertyType: 'resort' };
    patch.budget = { pricingCategory: 'premium' };
    actionSummary = 'Upgraded accommodation preference to Premium Heritage / Resort';
    return { understood: true, actionSummary, patch };
  }

  if (text.includes('budget hotel') || text.includes('cheaper hotel') || text.includes('homestay') || text.includes('hostel')) {
    patch.accommodation = { category: 'homestay', propertyType: 'homestay' };
    patch.budget = { pricingCategory: 'budget' };
    actionSummary = 'Adjusted accommodation preference to Budget Homestay / Guesthouse';
    return { understood: true, actionSummary, patch };
  }

  // 4. Transportation Mode Modifications
  if (text.includes('train') && (text.includes('instead of') || text.includes('use') || text.includes('switch'))) {
    patch.transport = { preferredTransport: 'train' };
    actionSummary = 'Switched primary intercity transportation to Train';
    return { understood: true, actionSummary, patch };
  }

  if (text.includes('flight') && (text.includes('instead of') || text.includes('use') || text.includes('switch'))) {
    patch.transport = { preferredTransport: 'flight' };
    actionSummary = 'Switched primary intercity transportation to Flight';
    return { understood: true, actionSummary, patch };
  }

  // 5. Travel Pace Modifications
  if (text.includes('relaxed') || text.includes('slow down') || text.includes('take it easy') || text.includes('less rushed')) {
    patch.pace = { style: 'relaxed', maxAttractionsPerDay: 2 };
    actionSummary = 'Switched travel pace to Relaxed (2 attractions per day with afternoon rest)';
    return { understood: true, actionSummary, patch };
  }

  if (text.includes('fast-paced') || text.includes('pack more') || text.includes('see everything') || text.includes('active')) {
    patch.pace = { style: 'fast-paced', maxAttractionsPerDay: 5 };
    actionSummary = 'Switched travel pace to Fast-Paced (covers up to 5 attractions per day)';
    return { understood: true, actionSummary, patch };
  }

  // 6. Food Preferences
  if (text.includes('jain')) {
    patch.food = { preference: 'jain' };
    actionSummary = 'Updated food preferences to strict Jain-friendly cuisine';
    return { understood: true, actionSummary, patch };
  }

  if (text.includes('pure veg') || text.includes('vegetarian')) {
    patch.food = { preference: 'pure-veg' };
    actionSummary = 'Updated food preferences to 100% Pure Vegetarian';
    return { understood: true, actionSummary, patch };
  }

  // 7. Attraction Exclusion
  const removeAttractionMatch = text.match(/(remove|exclude|skip|avoid)\s+([a-zA-Z\s]+)/);
  if (removeAttractionMatch) {
    const rawAttraction = removeAttractionMatch[2].trim();
    if (rawAttraction.length > 2) {
      const currentExcluded = currentProfile.customization.excludedAttractions || [];
      patch.customization = {
        excludedAttractions: Array.from(new Set([...currentExcluded, rawAttraction])),
      };
      actionSummary = `Added '${rawAttraction}' to excluded attractions list`;
      return { understood: true, actionSummary, patch };
    }
  }

  // If ambiguous
  return {
    understood: false,
    actionSummary: 'Could not clearly identify which preference to modify.',
    patch: {},
    clarificationNeeded: 'Would you like to adjust your budget, trip duration, transport mode, accommodation, or travel pace?',
  };
}

