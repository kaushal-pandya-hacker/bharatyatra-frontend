import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_TRAVEL_PROFILE,
  TravelProfile,
  buildUnifiedTripContext,
} from '../lib/profile/travel-profile';
import {
  createDefaultPreferenceProfile,
  convertRequestToPreferenceProfile,
  convertPreferenceProfileToRequest,
} from '../lib/ai-planner/universal-preference-profile';
import {
  dynamicItineraryEngine,
} from '../lib/ai-planner/dynamic-itinerary-engine';
import { UserDataStore } from '../lib/user/user-store';

describe('BharatYatra Phase 1: Universal Preference Architecture & AI Travel Brain', () => {

  before(() => {
    process.env.NODE_ENV = 'test';
    UserDataStore.clearForTesting();
  });

  it('TC-PREF-01: Centralized preferences to TripPreferenceProfile mapping', () => {
    const customProfile: TravelProfile = {
      ...DEFAULT_TRAVEL_PROFILE,
      id: 'usr_gujarat_001',
      fullName: 'Jignesh Shah',
      origin: {
        city: 'Ahmedabad',
        state: 'Gujarat',
        country: 'India',
        latitude: 23.0225,
        longitude: 72.5714,
      },
      travelStyle: 'premium',
      pace: 'relaxed',
      transport: ['train', 'cab'],
      interests: ['heritage', 'spiritual'],
      typicalTravelers: 4,
      dietaryPreference: 'jain',
      lockedKeys: ['food.preference'],
    };

    const unified = buildUnifiedTripContext(customProfile, {
      destination: { city: 'Somnath', state: 'Gujarat' },
      destinationList: ['Somnath', 'Dwarka'],
      durationDays: 4,
      budgetTotal: 60000,
    });

    assert.equal(unified.travelContext.user.name, 'Jignesh');
    assert.equal(unified.tripContext.trip.destination.city, 'Somnath');
    assert.equal(unified.tripContext.trip.durationDays, 4);
    assert.equal(unified.tripContext.trip.travelers, 4);

    // Profile verification
    assert.equal(unified.preferenceProfile.identity.origin, 'Ahmedabad');
    assert.equal(unified.preferenceProfile.identity.destination, 'Somnath');
    assert.equal(unified.preferenceProfile.budget.totalBudget, 60000);
    assert.equal(unified.preferenceProfile.budget.perPersonBudget, 15000);
    assert.equal(unified.preferenceProfile.pace.style, 'relaxed');
    assert.equal(unified.preferenceProfile.food.preference, 'jain');
    assert.ok(unified.preferenceProfile.lockedKeys.includes('food.preference'));
    assert.equal(unified.preferenceProfile.interests.heritage, true);
    assert.equal(unified.preferenceProfile.interests.religious, true);
  });

  it('TC-PREF-02: lockedKeys preservation during AI regeneration and pace alteration', () => {
    const profile = createDefaultPreferenceProfile({
      origin: 'Ahmedabad',
      destination: 'Somnath',
      destinationList: ['Somnath', 'Dwarka'],
      tripDurationDays: 3,
      travelersCount: 2,
    });

    // Lock food and accommodation
    profile.lockedKeys = ['food.preference', 'accommodation.category'];
    profile.food.preference = 'swaminarayan';

    const plan = dynamicItineraryEngine.generateItinerary({
      preferenceProfile: profile,
      startDate: '2026-12-25',
    });

    // Request AI diff to adjust for family / relaxed pace
    const diff = dynamicItineraryEngine.proposeAiDiff(
      plan,
      'Make this family friendly for seniors and kids with relaxed pace'
    );

    // Verify locked preferences remained intact in the proposed diff
    assert.equal(diff.proposedPlan.preferenceProfile.food.preference, 'swaminarayan');
    assert.ok(diff.proposedPlan.preferenceProfile.lockedKeys.includes('food.preference'));
    assert.ok(diff.proposedPlan.preferenceProfile.lockedKeys.includes('accommodation.category'));
    assert.equal(diff.paceChange?.to, 'relaxed');
  });

  it('TC-PREF-03: Strict dietary enforcement (Gujarat / Rajasthan priority: Jain & Swaminarayan)', () => {
    const profile = createDefaultPreferenceProfile({
      origin: 'Rajkot',
      destination: 'Somnath',
      destinationList: ['Somnath'],
      tripDurationDays: 2,
      travelersCount: 2,
    });
    profile.food.preference = 'jain';
    profile.lockedKeys = ['food.preference'];

    const plan = dynamicItineraryEngine.generateItinerary({
      preferenceProfile: profile,
      startDate: '2026-12-20',
    });

    // Check meals in each day
    let jainMealCount = 0;
    for (const day of plan.currentVersion.days) {
      for (const meal of day.meals) {
        if (meal.recommendedCuisine.toLowerCase().includes('jain')) {
          jainMealCount++;
        }
      }
    }
    assert.ok(jainMealCount >= 2, `Must include at least 2 explicit Jain meals, found ${jainMealCount}`);

    // Validation check
    assert.equal(plan.validation.isValid, true);
    assert.equal(plan.validation.checks.lockedPreferencesHonored, true);
  });

  it('TC-PREF-04: Budget-aware recalculation and tradeoff detection', () => {
    const profile = createDefaultPreferenceProfile({
      origin: 'Jaipur',
      destination: 'Jodhpur',
      destinationList: ['Jodhpur', 'Jaisalmer'],
      tripDurationDays: 4,
      travelersCount: 2,
    });
    profile.budget.pricingCategory = 'luxury';

    const plan = dynamicItineraryEngine.generateItinerary({
      preferenceProfile: profile,
      startDate: '2026-11-15',
    });

    const initialTotalCost = plan.currentVersion.pricing.tiers.luxury?.totalGroupCost || 40000;

    // Propose budget reduction
    const diff = dynamicItineraryEngine.proposeAiDiff(plan, 'Reduce budget to save money with budget optimization');

    assert.ok(diff.costDelta < 0, 'Cost delta should be negative');
    assert.ok(diff.proposedTotalCost < initialTotalCost, 'Proposed cost should be less than initial');
    assert.ok(diff.changesSummary.addedActivities.length > 0, 'Should propose free scenic alternatives');
  });

  it('TC-PREF-05: Regional expansion landmark retrieval (Gujarat #1, Rajasthan #2, Maharashtra #3)', () => {
    // 1. Gujarat Hubs: Ahmedabad, Somnath, Kutch, Gir, Statue of Unity
    const gujProfile = createDefaultPreferenceProfile({
      origin: 'Ahmedabad',
      destination: 'Ahmedabad',
      destinationList: ['Ahmedabad', 'Sasan Gir', 'Rann of Kutch', 'Statue of Unity', 'Somnath'],
      tripDurationDays: 5,
      travelersCount: 2,
    });
    const gujaratPlan = dynamicItineraryEngine.generateItinerary({
      preferenceProfile: gujProfile,
      startDate: '2026-12-10',
    });

    const gujTitles = gujaratPlan.currentVersion.days.flatMap(d => [
      ...d.morningActivities,
      ...d.afternoonActivities,
      ...d.eveningActivities,
    ]).map(a => a.name);

    assert.ok(
      gujTitles.some(t => t.includes('Sabarmati') || t.includes('Adalaj')),
      'Should retrieve Ahmedabad landmarks'
    );
    assert.ok(
      gujTitles.some(t => t.includes('Lion') || t.includes('Gir')),
      'Should resolve "Sasan Gir" alias to Gir National Park Safari'
    );
    assert.ok(
      gujTitles.some(t => t.includes('White Desert') || t.includes('Dhordo') || t.includes('Kutch')),
      'Should resolve "Rann of Kutch" alias to White Desert Dhordo'
    );
    assert.ok(
      gujTitles.some(t => t.includes('Statue of Unity') || t.includes('Sardar Sarovar')),
      'Should resolve Statue of Unity'
    );

    // 2. Rajasthan Hubs: Jodhpur, Jaisalmer
    const rajProfile = createDefaultPreferenceProfile({
      origin: 'Jaipur',
      destination: 'Jodhpur',
      destinationList: ['Jodhpur', 'Jaisalmer'],
      tripDurationDays: 3,
      travelersCount: 2,
    });
    const rajasthanPlan = dynamicItineraryEngine.generateItinerary({
      preferenceProfile: rajProfile,
      startDate: '2026-12-01',
    });
    const rajTitles = rajasthanPlan.currentVersion.days.flatMap(d => [
      ...d.morningActivities,
      ...d.afternoonActivities,
      ...d.eveningActivities,
    ]).map(a => a.name);

    assert.ok(
      rajTitles.some(t => t.includes('Mehrangarh') || t.includes('Sonar Qila') || t.includes('Sam Sand Dunes')),
      'Should retrieve Rajasthan landmark registry items'
    );

    // 3. Maharashtra Hubs: Mumbai, Pune, Nashik, Aurangabad, Mahabaleshwar
    const mahaProfile = createDefaultPreferenceProfile({
      origin: 'Mumbai',
      destination: 'Mumbai',
      destinationList: ['Mumbai', 'Nashik', 'Aurangabad'],
      tripDurationDays: 3,
      travelersCount: 2,
    });
    const maharashtraPlan = dynamicItineraryEngine.generateItinerary({
      preferenceProfile: mahaProfile,
      startDate: '2026-11-20',
    });
    const mahaTitles = maharashtraPlan.currentVersion.days.flatMap(d => [
      ...d.morningActivities,
      ...d.afternoonActivities,
      ...d.eveningActivities,
    ]).map(a => a.name);

    assert.ok(
      mahaTitles.some(t => t.includes('Gateway of India') || t.includes('Marine Drive') || t.includes('Trimbakeshwar') || t.includes('Ellora')),
      'Should retrieve Maharashtra landmark registry items'
    );
  });

  it('TC-PREF-06: Route continuity, open hours, and feasibility scoring', () => {
    const profile = createDefaultPreferenceProfile({
      origin: 'Pune',
      destination: 'Mahabaleshwar',
      destinationList: ['Pune', 'Mahabaleshwar'],
      tripDurationDays: 2,
      travelersCount: 2,
    });
    const plan = dynamicItineraryEngine.generateItinerary({
      preferenceProfile: profile,
      startDate: '2026-12-05',
    });

    assert.equal(plan.validation.isValid, true);
    assert.ok(plan.validation.score >= 80, `Validation score should be >= 80, received ${plan.validation.score}`);
    assert.equal(plan.validation.checks.realisticActiveHours, true);
    assert.equal(plan.validation.checks.closedAttractionsAvoided, true);
    assert.equal(plan.validation.checks.noDuplicateAttractions, true);
    assert.equal(plan.validation.checks.routeContinuity, true);
  });

  it('TC-PREF-07: Dual-layer persistence sync with UserDataStore', async () => {
    const userId = 'usr_phase1_test_sync';

    // Save preferences including lockedKeys and dietaryPreference
    const saved = await UserDataStore.savePreferences(userId, {
      originCity: 'Surat',
      originState: 'Gujarat',
      originCountry: 'India',
      budgetTier: 'premium',
      travelPace: 'relaxed',
      travelStyle: 'heritage',
      transport: ['train', 'cab'],
      interests: ['heritage', 'culture', 'food'],
      dietaryPreference: 'swaminarayan',
      typicalTravelers: 3,
      lockedKeys: ['food.preference', 'budget.pricingCategory'],
    });

    assert.equal(saved.userId, userId);
    assert.equal(saved.dietaryPreference, 'swaminarayan');
    assert.deepEqual(saved.lockedKeys, ['food.preference', 'budget.pricingCategory']);

    // Retrieve preferences
    const retrieved = await UserDataStore.getPreferences(userId);
    assert.equal(retrieved.userId, userId);
    assert.equal(retrieved.originCity, 'Surat');
    assert.equal(retrieved.dietaryPreference, 'swaminarayan');
    assert.ok(retrieved.lockedKeys?.includes('food.preference'));
  });

  it('TC-PREF-08: convertPreferenceProfileToRequest and bidirectional consistency', () => {
    const defaultProfile = createDefaultPreferenceProfile({
      origin: 'Vadodara',
      destination: 'Udaipur',
      tripDurationDays: 4,
      travelersCount: 2,
    });
    defaultProfile.food.preference = 'pure-veg';
    defaultProfile.budget.pricingCategory = 'standard';
    defaultProfile.interests.heritage = true;

    // Convert to TripPlanningRequest
    const req = convertPreferenceProfileToRequest(defaultProfile);
    assert.equal(req.origin?.city, 'Vadodara');
    assert.equal(req.destinations?.[0]?.city, 'Udaipur');
    assert.equal(req.durationDays, 4);
    assert.equal(req.foodPreference?.[0], 'pure-veg');
    assert.ok(req.interests?.includes('heritage'));

    // Convert back to Profile
    const roundTripped = convertRequestToPreferenceProfile(req);
    assert.equal(roundTripped.identity.origin, 'Vadodara');
    assert.equal(roundTripped.identity.destination, 'Udaipur');
    assert.equal(roundTripped.identity.tripDurationDays, 4);
    assert.equal(roundTripped.food.preference, 'pure-veg');
  });

});
