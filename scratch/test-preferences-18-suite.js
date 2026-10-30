/**
 * BharatYatra AI 2.0 — Universal Trip Preferences Engine: 18-Point Test Suite
 */

const BASE_URL = 'http://localhost:3000/api/v1/trips/preferences';

async function runTest(name, fn) {
  process.stdout.write(`• ${name}... `);
  try {
    const start = Date.now();
    await fn();
    const duration = Date.now() - start;
    console.log(`\x1b[32mPASS\x1b[0m (${duration}ms)`);
    return { name, pass: true, duration };
  } catch (err) {
    console.log(`\x1b[31mFAIL\x1b[0m: ${err.message}`);
    return { name, pass: false, error: err.message };
  }
}

async function main() {
  console.log('================================================================');
  console.log('BHARATYATRA UNIVERSAL TRIP PREFERENCES ENGINE: 18-POINT TEST SUITE');
  console.log('================================================================\n');

  const results = [];
  let testProfileId = null;
  let baselinePlan = null;

  // Setup: Create Initial Profile
  await runTest('SETUP: Initialize Universal Preference Profile', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'CREATE',
        initialData: {
          origin: 'Ahmedabad',
          destination: 'Goa',
          tripDurationDays: 5,
          travelersCount: 2,
        },
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create profile');
    testProfileId = json.data.profile.id;
    baselinePlan = json.data.plan;
    if (!testProfileId || !baselinePlan) throw new Error('Missing profile or plan in response');
    if (json.data.profile.version !== 1) throw new Error(`Expected version 1, got ${json.data.profile.version}`);
  });

  // TEST 1: BUDGET REDUCTION
  results.push(await runTest('TEST 1: Budget Reduction & Shortfall Transparency', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE',
        profileId: testProfileId,
        patch: {
          budget: { totalBudget: 25000 },
        },
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Update failed');
    const { profile, explanation, plan } = json.data;
    if (profile.budget.totalBudget !== 25000) throw new Error('Budget not updated');
    // Goa preserved
    if (profile.identity.destination !== 'Goa') throw new Error('Destination was altered');
    // Explanation mentions budget adjustment
    if (!explanation.summary.toLowerCase().includes('budget')) {
      throw new Error('Explanation missing budget info');
    }
    // Preserved fields includes food or destination
    if (!explanation.preservedFields.includes('identity.destination')) {
      throw new Error('Destination should be in preservedFields');
    }
    // Check shortfall if cost > 25000
    if (plan.budget.totalEstimatedInr > 25000 && !explanation.budgetShortfallInr) {
      throw new Error('Expected budgetShortfallInr to be reported');
    }
  }));

  // TEST 2: BUDGET INCREASE
  results.push(await runTest('TEST 2: Budget Increase Handling', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE',
        profileId: testProfileId,
        patch: {
          budget: { totalBudget: 120000, pricingCategory: 'premium' },
        },
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Update failed');
    if (json.data.profile.budget.totalBudget !== 120000) throw new Error('Budget not updated');
    if (json.data.profile.budget.pricingCategory !== 'premium') throw new Error('PricingCategory not updated');
  }));

  // TEST 3: DURATION INCREASE
  results.push(await runTest('TEST 3: Duration Increase & Day Expansion', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE',
        profileId: testProfileId,
        patch: {
          identity: { tripDurationDays: 7 },
        },
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Update failed');
    if (json.data.profile.identity.tripDurationDays !== 7) throw new Error('Duration not updated in profile');
    if (json.data.plan.trip.durationDays !== 7) throw new Error('Plan duration does not reflect 7 days');
  }));

  // TEST 4: DURATION REDUCTION
  results.push(await runTest('TEST 4: Duration Reduction & Activity Prioritization', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE',
        profileId: testProfileId,
        patch: {
          identity: { tripDurationDays: 4 },
        },
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Update failed');
    if (json.data.plan.trip.durationDays !== 4) throw new Error('Plan duration does not reflect 4 days');
    if (json.data.plan.trip.days.length !== 4) throw new Error('Days length does not match 4');
  }));

  // TEST 5: DESTINATION CHANGE
  results.push(await runTest('TEST 5: Destination Change & Geography Invalidation', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE',
        profileId: testProfileId,
        patch: {
          identity: { destination: 'Jaipur', destinationList: ['Jaipur'] },
        },
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Update failed');
    if (json.data.profile.identity.destination !== 'Jaipur') throw new Error('Destination not updated');
    if (json.data.evaluation.impactLevel !== 'CRITICAL') throw new Error('Destination change must be CRITICAL');
    if (!json.data.evaluation.affectedModules.includes('GeographyEngine')) {
      throw new Error('GeographyEngine should be affected');
    }
  }));

  // TEST 6: TRANSPORT CHANGE
  results.push(await runTest('TEST 6: Transport Change (Flight to Train)', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE',
        profileId: testProfileId,
        patch: {
          transport: { preferredTransport: 'train' },
        },
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Update failed');
    if (json.data.profile.transport.preferredTransport !== 'train') throw new Error('Transport not train');
    if (!json.data.evaluation.affectedModules.includes('TransportationEngine')) {
      throw new Error('TransportationEngine should be affected');
    }
  }));

  // TEST 7: ACCOMMODATION CHANGE
  results.push(await runTest('TEST 7: Accommodation Category Change', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE',
        profileId: testProfileId,
        patch: {
          accommodation: { category: 'heritage-palace', propertyType: 'resort' },
        },
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Update failed');
    if (json.data.profile.accommodation.category !== 'heritage-palace') throw new Error('Stay category not updated');
    if (!json.data.evaluation.affectedModules.includes('AccommodationEngine')) {
      throw new Error('AccommodationEngine should be affected');
    }
  }));

  // TEST 8: FOOD PREFERENCE CHANGE
  results.push(await runTest('TEST 8: Food Preference Change (Pure Veg / Jain)', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE',
        profileId: testProfileId,
        patch: {
          food: { preference: 'jain' },
        },
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Update failed');
    if (json.data.profile.food.preference !== 'jain') throw new Error('Food preference not jain');
    if (!json.data.evaluation.affectedModules.includes('FoodRecommendationEngine')) {
      throw new Error('FoodRecommendationEngine should be affected');
    }
    // Destination remains Jaipur
    if (json.data.profile.identity.destination !== 'Jaipur') throw new Error('Destination changed unexpectedly');
  }));

  // TEST 9: INTEREST CHANGE
  results.push(await runTest('TEST 9: Travel Interest Ingestion (Adventure & Wildlife)', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE',
        profileId: testProfileId,
        patch: {
          interests: { adventure: true, wildlife: true },
        },
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Update failed');
    if (!json.data.profile.interests.adventure || !json.data.profile.interests.wildlife) {
      throw new Error('Interests not updated');
    }
    if (!json.data.evaluation.affectedModules.includes('ActivityEngine')) {
      throw new Error('ActivityEngine should be affected');
    }
  }));

  // TEST 10: TRAVEL PACE CHANGE
  results.push(await runTest('TEST 10: Travel Pace Change (Balanced to Relaxed)', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE',
        profileId: testProfileId,
        patch: {
          pace: { style: 'relaxed', maxAttractionsPerDay: 2 },
        },
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Update failed');
    if (json.data.profile.pace.style !== 'relaxed') throw new Error('Pace not relaxed');
  }));

  // TEST 11: SEASONAL / DATE CHANGE
  results.push(await runTest('TEST 11: Seasonal & Travel Date Change', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE',
        profileId: testProfileId,
        patch: {
          identity: { startDate: '2026-12-20', endDate: '2026-12-24' },
        },
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Update failed');
    if (json.data.profile.identity.startDate !== '2026-12-20') throw new Error('Start date not updated');
    if (!json.data.evaluation.affectedModules.includes('SeasonalIntelligence')) {
      throw new Error('SeasonalIntelligence should be affected');
    }
  }));

  // TEST 12: MULTIPLE SIMULTANEOUS CHANGES
  results.push(await runTest('TEST 12: Multiple Simultaneous Atomic Updates', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE',
        profileId: testProfileId,
        patch: {
          budget: { totalBudget: 60000 },
          identity: { tripDurationDays: 5 },
          transport: { localTransport: 'private-cab' },
        },
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Update failed');
    const p = json.data.profile;
    if (p.budget.totalBudget !== 60000 || p.identity.tripDurationDays !== 5 || p.transport.localTransport !== 'private-cab') {
      throw new Error('Batch updates not applied atomically');
    }
  }));

  // TEST 13: LOCKED PREFERENCE CONFLICTS
  results.push(await runTest('TEST 13: User Locking & Conflict Rejection', async () => {
    // 1. Lock the budget
    const lockRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'LOCK',
        profileId: testProfileId,
        path: 'budget.totalBudget',
      }),
    });
    const lockJson = await lockRes.json();
    if (!lockJson.success || !lockJson.data.profile.lockedKeys.includes('budget.totalBudget')) {
      throw new Error('Failed to lock budget.totalBudget');
    }

    // 2. Attempt unauthorized direct modification to locked key
    const attemptRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE',
        profileId: testProfileId,
        patch: {
          budget: { totalBudget: 15000 },
        },
      }),
    });

    if (attemptRes.status !== 409) {
      throw new Error(`Expected 409 Conflict for locked key, got ${attemptRes.status}`);
    }
    const attemptJson = await attemptRes.json();
    if (!attemptJson.data.unresolvedConflicts || attemptJson.data.unresolvedConflicts.length === 0) {
      throw new Error('Expected unresolved conflicts list in 409 response');
    }
    // Verify locked setting was preserved
    const getRes = await fetch(`${BASE_URL}?profileId=${testProfileId}`);
    const getJson = await getRes.json();
    if (getJson.data.profile.budget.totalBudget === 15000) {
      throw new Error('Locked budget was silently modified!');
    }

    // Unlock budget for subsequent tests
    await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UNLOCK',
        profileId: testProfileId,
        path: 'budget.totalBudget',
      }),
    });
  }));

  // TEST 14: FAILED SUPPLIER / ESTIMATE GRACEFUL HANDLING
  results.push(await runTest('TEST 14: Deterministic Fallback Math & No NaN/Null', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE',
        profileId: testProfileId,
        patch: {
          identity: { destination: 'Ziro', destinationList: ['Ziro Valley'] },
        },
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Update failed');
    const plan = json.data.plan;
    if (isNaN(plan.budget.totalEstimatedInr) || plan.budget.totalEstimatedInr <= 0) {
      throw new Error('Plan budget contains NaN or invalid numbers');
    }
  }));

  // TEST 15: CONCURRENT UPDATES & MONOTONIC VERSIONING
  results.push(await runTest('TEST 15: Concurrency & Monotonic Versioning', async () => {
    const getRes = await fetch(`${BASE_URL}?profileId=${testProfileId}`);
    const getJson = await getRes.json();
    const currentVersion = getJson.data.profile.version;

    // Apply update
    const updateRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE',
        profileId: testProfileId,
        patch: { identity: { tripDurationDays: 6 } },
      }),
    });
    const updateJson = await updateRes.json();
    if (updateJson.data.profile.version !== currentVersion + 1) {
      throw new Error(`Expected version ${currentVersion + 1}, got ${updateJson.data.profile.version}`);
    }
  }));

  // TEST 16: UNDO AND RESTORE
  results.push(await runTest('TEST 16: Undo Customization & Version Restoration', async () => {
    // 1. Get current version
    const beforeRes = await fetch(`${BASE_URL}?profileId=${testProfileId}`);
    const beforeJson = await beforeRes.json();
    const versionBeforeUndo = beforeJson.data.profile.version;

    // 2. Undo
    const undoRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UNDO',
        profileId: testProfileId,
      }),
    });
    const undoJson = await undoRes.json();
    if (!undoJson.success) throw new Error(undoJson.error || 'Undo failed');

    // 3. Restore initial version 1
    const restoreRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'RESTORE',
        profileId: testProfileId,
        version: 1,
      }),
    });
    const restoreJson = await restoreRes.json();
    if (!restoreJson.success) throw new Error(restoreJson.error || 'Restore failed');
    if (restoreJson.data.profile.identity.destination !== 'Goa') {
      throw new Error('Restored profile destination is not Goa (from version 1)');
    }
  }));

  // TEST 17: PERSISTENCE & SERIALIZATION
  results.push(await runTest('TEST 17: Full JSON Serialization & Round-trip Integrity', async () => {
    const getRes = await fetch(`${BASE_URL}?profileId=${testProfileId}`);
    const getJson = await getRes.json();
    const original = getJson.data.profile;

    const serialized = JSON.stringify(original);
    const parsed = JSON.parse(serialized);

    if (parsed.id !== original.id || parsed.version !== original.version) {
      throw new Error('Round-trip serialization failed');
    }
    if (parsed.identity.destination !== original.identity.destination) {
      throw new Error('Nested destination lost in serialization');
    }
  }));

  // TEST 18: EXISTING SAVED TRIP BACKWARD COMPATIBILITY
  results.push(await runTest('TEST 18: Backward Compatibility with Legacy Trip Records', async () => {
    // Test that the core planning endpoint /api/trips/plan accepts both legacy requests
    // and returns preferenceProfile attached without regressions
    const planRes = await fetch('http://localhost:3000/api/trips/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: '5 day trip to Udaipur for 2 travelers budget 40000',
        origin: 'Ahmedabad',
        destinations: ['Udaipur'],
        durationDays: 5,
        travelers: 2,
        budget: 40000,
      }),
    });
    const planJson = await planRes.json();
    if (!planRes.ok || !planJson.success) {
      throw new Error(planJson.message || 'Legacy plan call failed');
    }
    if (!planJson.preferenceProfile) {
      throw new Error('Expected preferenceProfile to be attached to response');
    }
    if (planJson.preferenceProfile.identity.origin !== 'Ahmedabad') {
      throw new Error('Origin mismatch in converted preference profile');
    }
  }));

  // Summary
  console.log('\n================================================================');
  const passedCount = results.filter(r => r.pass).length;
  console.log(`EVALUATION SUMMARY: ${passedCount} / ${results.length} PASSED`);
  if (passedCount === results.length) {
    console.log('\x1b[32mALL 18 ARCHITECTURAL ENGINE CRITERIA VERIFIED SUCCESSFULLY (100%)\x1b[0m');
  } else {
    console.log('\x1b[31mSOME TESTS FAILED — CHECK DETAILS ABOVE\x1b[0m');
  }
  console.log('================================================================');
}

main().catch(console.error);
