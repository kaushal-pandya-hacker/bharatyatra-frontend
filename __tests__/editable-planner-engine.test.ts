import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  dynamicItineraryEngine,
  ItineraryMasterPlan,
} from '../lib/ai-planner/dynamic-itinerary-engine';
import { createDefaultPreferenceProfile } from '../lib/ai-planner/universal-preference-profile';

describe('BharatYatra Phase 2: Editable Itinerary Engine & Mutation Suite', () => {
  let samplePlan: ItineraryMasterPlan;

  beforeEach(() => {
    const profile = createDefaultPreferenceProfile({
      origin: 'Ahmedabad',
      destination: 'Dwarka',
      destinationList: ['Dwarka', 'Somnath'],
      durationDays: 3,
      travelersCount: 2,
    });

    samplePlan = dynamicItineraryEngine.generateItinerary({
      preferenceProfile: profile,
      startDate: '2026-12-01',
    });
  });

  test('TC-ENG-01: Generates initial master plan with versioning history', () => {
    assert.ok(samplePlan, 'Plan must exist');
    assert.ok(samplePlan.currentVersion, 'Current version must exist');
    assert.ok(samplePlan.currentVersion.days.length >= 1, 'Days should be generated');
    assert.ok(samplePlan.versionHistory.length >= 1, 'Version history must have initial entry');
    assert.ok(samplePlan.durationDays >= 1, 'Duration must be positive');
  });

  test('TC-ENG-02: Adds a day and reindexes day numbers seamlessly', () => {
    const initialDaysCount = samplePlan.currentVersion.days.length;
    const updated = dynamicItineraryEngine.addDay(samplePlan, 1, 'Porbandar');

    assert.equal(updated.currentVersion.days.length, initialDaysCount + 1);
    assert.equal(updated.durationDays, initialDaysCount + 1);
    assert.equal(updated.currentVersion.days[1].location, 'Porbandar');
    assert.equal(updated.currentVersion.days[1].dayNumber, 2);
    assert.equal(updated.currentVersion.days[2].dayNumber, 3);
    assert.equal(updated.versionHistory.length, samplePlan.versionHistory.length + 1);
  });

  test('TC-ENG-03: Removes a day and reindexes remaining days', () => {
    const withExtraDay = dynamicItineraryEngine.addDay(samplePlan, undefined, 'Gir');
    const initialCount = withExtraDay.currentVersion.days.length;

    const afterRemoval = dynamicItineraryEngine.removeDay(withExtraDay, 2);
    assert.equal(afterRemoval.currentVersion.days.length, initialCount - 1);
    assert.equal(afterRemoval.currentVersion.days[1].dayNumber, 2);
  });

  test('TC-ENG-04: Reorders day sequence', () => {
    const withExtra = dynamicItineraryEngine.addDay(samplePlan, undefined, 'Diu');
    const days = withExtra.currentVersion.days;

    const dayOrder = days.map((_, i) => i + 1).reverse();
    const reordered = dynamicItineraryEngine.reorderDays(withExtra, dayOrder);

    assert.equal(reordered.currentVersion.days[0].dayNumber, 1);
    assert.equal(reordered.currentVersion.days[days.length - 1].dayNumber, days.length);
  });

  test('TC-ENG-05: Adds a custom user activity with user notes and zero-drift duration', () => {
    const updated = dynamicItineraryEngine.addCustomActivity(samplePlan, 1, 'afternoon', {
      title: 'Local Spices & Artisan Handicraft Walk',
      category: 'Shopping & Culture',
      estimatedDurationMinutes: 75,
      costInr: 250,
      userNotes: 'Recommended by local shopkeeper near temple',
    });

    const day1 = updated.currentVersion.days.find((d) => d.dayNumber === 1);
    assert.ok(day1, 'Day 1 must exist');
    const customAct = day1?.afternoonActivities.find((a) => a.name.includes('Local Spices'));
    assert.ok(customAct, 'Custom activity must be found in afternoon slot');
    assert.equal(customAct?.evidenceStatus, 'USER_CUSTOM');
    assert.equal(customAct?.estimatedCostInr, 250);
  });

  test('TC-ENG-06: Duplicates an existing activity on the same day', () => {
    const day1 = samplePlan.currentVersion.days[0];
    const firstAct = day1.morningActivities[0] || day1.afternoonActivities[0];
    assert.ok(firstAct, 'First activity must exist');

    const updated = dynamicItineraryEngine.duplicateActivity(samplePlan, 1, firstAct.id);
    const updatedDay1 = updated.currentVersion.days[0];
    const copies = [...updatedDay1.morningActivities, ...updatedDay1.afternoonActivities].filter(
      (a) => a.name.includes('(Copy)')
    );
    assert.ok(copies.length >= 1, 'At least one copy must be present');
  });

  test('TC-ENG-07: Moves an activity across slots and across days', () => {
    const day1 = samplePlan.currentVersion.days[0];
    const actToMove = day1.morningActivities[0];
    if (!actToMove) return;

    const withExtra = dynamicItineraryEngine.addDay(samplePlan, undefined, 'Somnath');
    const moved = dynamicItineraryEngine.moveActivity(
      withExtra,
      1,
      'morning',
      2,
      'afternoon',
      actToMove.id
    );

    const targetDay = moved.currentVersion.days.find((d) => d.dayNumber === 2);
    assert.ok(targetDay, 'Target Day 2 must exist');
    const foundInTarget = targetDay?.afternoonActivities.find(
      (a) => a.id === actToMove.id || a.activityId === actToMove.activityId
    );
    assert.ok(foundInTarget, 'Activity must be found in target slot');
  });

  test('TC-ENG-08: Adds and removes destinations dynamically', () => {
    const withDest = dynamicItineraryEngine.addDestination(samplePlan, 'Kutch', 2);
    assert.ok(withDest.destinations.includes('Kutch'), 'Kutch must be added');

    const withoutDest = dynamicItineraryEngine.removeDestination(withDest, 'Kutch');
    assert.ok(!withoutDest.destinations.includes('Kutch'), 'Kutch must be removed');
  });

  test('TC-ENG-09: Updates transit mode with custom cost and duration', () => {
    const updated = dynamicItineraryEngine.updateTransportLeg(samplePlan, 1, 0, 'cab', 1800, 120);
    assert.ok(updated, 'Plan must be updated');
    assert.ok(updated.versionHistory.length > samplePlan.versionHistory.length);
  });

  test('TC-ENG-10: Updates budget customization and recalculates per-person costs', () => {
    const updated = dynamicItineraryEngine.updateBudgetCustomization(samplePlan, 30000);
    const recTier = updated.currentVersion.pricing.recommendedTier || 'standard';
    assert.equal(updated.currentVersion.pricing.tiers[recTier].totalGroupCost, 30000);
    assert.equal(updated.currentVersion.pricing.tiers[recTier].perPersonCost, 15000);
  });

  test('TC-ENG-11: Proposes AI diff for budget reduction without directly overwriting', () => {
    const diff = dynamicItineraryEngine.proposeAiDiff(samplePlan, 'Reduce budget by 20%');
    assert.ok(diff, 'Diff must be returned');
    assert.ok(diff.costDelta < 0, 'Cost delta must be negative (savings)');
    assert.ok(diff.proposedTotalCost < diff.previousTotalCost);
    assert.ok(diff.changesSummary.addedActivities.length > 0);
    assert.ok(diff.proposedPlan, 'Proposed plan must exist');
  });

  test('TC-ENG-12: Proposes AI diff for family-friendly pace adjustment', () => {
    const diff = dynamicItineraryEngine.proposeAiDiff(samplePlan, 'Make this family friendly for seniors and kids');
    assert.ok(diff, 'Diff must be returned');
    assert.equal(diff.paceChange?.to, 'relaxed');
    assert.equal(diff.proposedPlan.preferenceProfile.pace.style, 'relaxed');
  });

  test('TC-ENG-13: Proposes AI diff for extending trip by 1 day', () => {
    const diff = dynamicItineraryEngine.proposeAiDiff(samplePlan, 'Add 1 more day for local shopping');
    assert.ok(diff, 'Diff must be returned');
    assert.equal(diff.durationDeltaDays, 1);
    assert.equal(diff.proposedPlan.durationDays, samplePlan.durationDays + 1);
  });

  test('TC-ENG-14: Restores a previous version correctly', () => {
    const v1Id = samplePlan.currentVersion.versionId;
    const modified = dynamicItineraryEngine.addDay(samplePlan, undefined, 'Sasan Gir');
    assert.notEqual(modified.currentVersion.versionId, v1Id);

    const restored = dynamicItineraryEngine.restoreVersion(modified, v1Id);
    assert.equal(restored.currentVersion.author, 'REVERT_ACTION');
    assert.equal(restored.currentVersion.days.length, samplePlan.currentVersion.days.length);
  });
});
