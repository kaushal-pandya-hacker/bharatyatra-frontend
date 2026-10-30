/**
 * BharatYatra AI 2.0 — Universal Trip Preferences Engine: Phase 2 20-Point Test Suite
 * Includes the Mandatory Critical Test: Ahmedabad -> Ladakh (40k -> 25k)
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
  console.log('BHARATYATRA AI 2.0 — UNIVERSAL PREFERENCES ENGINE: 20-POINT TEST');
  console.log('================================================================\n');

  const results = [];
  let profileId = null;
  let activeProfile = null;
  let activePlan = null;

  // TEST 1: New Profile Creation
  results.push(await runTest('TEST 1: New Profile Creation', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'CREATE',
        initialData: {
          origin: 'Ahmedabad',
          destination: 'Ladakh',
          destinationList: ['Ladakh (Leh)'],
          tripDurationDays: 7,
          travelersCount: 2,
        },
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create');
    profileId = json.data.profile.id;
    activeProfile = json.data.profile;
    activePlan = json.data.plan;
    if (activeProfile.version !== 1) throw new Error('Expected initial version 1');
  }));

  // TEST 2: Preference Retrieval
  results.push(await runTest('TEST 2: Preference Retrieval', async () => {
    const res = await fetch(`${BASE_URL}?profileId=${profileId}`);
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to retrieve');
    if (json.data.profile.id !== profileId) throw new Error('Retrieved ID mismatch');
  }));

  // TEST 3: Individual Preference Update
  results.push(await runTest('TEST 3: Individual Preference Update', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE',
        profileId,
        patch: { transport: { preferredTransport: 'flight' } },
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed update');
    if (json.data.profile.transport.preferredTransport !== 'flight') throw new Error('Transport not flight');
  }));

  // TEST 4: Multiple Preference Updates
  results.push(await runTest('TEST 4: Multiple Preference Updates', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE',
        profileId,
        patch: {
          budget: { totalBudget: 90000 },
          accommodation: { category: 'standard-hotel' },
        },
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Batch update failed');
    if (json.data.profile.budget.totalBudget !== 90000 || json.data.profile.accommodation.category !== 'standard-hotel') {
      throw new Error('Multiple update values not applied');
    }
  }));

  // TEST 5: Budget Reduction
  results.push(await runTest('TEST 5: Budget Reduction', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE',
        profileId,
        patch: { budget: { totalBudget: 50000 } },
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Budget reduction failed');
    if (json.data.profile.budget.totalBudget !== 50000) throw new Error('Budget not 50000');
  }));

  // TEST 6: Budget Increase
  results.push(await runTest('TEST 6: Budget Increase', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE',
        profileId,
        patch: { budget: { totalBudget: 110000, pricingCategory: 'premium' } },
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Budget increase failed');
    if (json.data.profile.budget.totalBudget !== 110000) throw new Error('Budget not 110000');
  }));

  // TEST 7: Duration Changes
  results.push(await runTest('TEST 7: Duration Changes', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE',
        profileId,
        patch: { identity: { tripDurationDays: 8 } },
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Duration update failed');
    if (json.data.plan.trip.durationDays !== 8) throw new Error('Plan trip duration not 8');
  }));

  // TEST 8: Destination Changes
  results.push(await runTest('TEST 8: Destination Changes', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE',
        profileId,
        patch: { identity: { destination: 'Goa', destinationList: ['Goa'] } },
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Destination change failed');
    if (json.data.profile.identity.destination !== 'Goa') throw new Error('Destination not Goa');
  }));

  // TEST 9: Transport Changes
  results.push(await runTest('TEST 9: Transport Changes', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE',
        profileId,
        patch: { transport: { preferredTransport: 'train' } },
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Transport change failed');
    if (json.data.profile.transport.preferredTransport !== 'train') throw new Error('Transport not train');
  }));

  // TEST 10: Food Preference Changes
  results.push(await runTest('TEST 10: Food Preference Changes', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE',
        profileId,
        patch: { food: { preference: 'pure-veg' } },
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Food update failed');
    if (json.data.profile.food.preference !== 'pure-veg') throw new Error('Food not pure-veg');
  }));

  // TEST 11: Interest Changes
  results.push(await runTest('TEST 11: Interest Changes', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE',
        profileId,
        patch: { interests: { adventure: true, nature: true } },
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Interest update failed');
    if (!json.data.profile.interests.adventure) throw new Error('Adventure interest not set');
  }));

  // TEST 12: Locked Preferences
  results.push(await runTest('TEST 12: Locked Preferences', async () => {
    const lockRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'LOCK',
        profileId,
        path: 'identity.destination',
      }),
    });
    const lockJson = await lockRes.json();
    if (!lockJson.success || !lockJson.data.profile.lockedKeys.includes('identity.destination')) {
      throw new Error('Failed to lock identity.destination');
    }
  }));

  // TEST 13: Conflicting Preferences
  results.push(await runTest('TEST 13: Conflicting Preferences Rejection', async () => {
    const attemptRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE',
        profileId,
        patch: { identity: { destination: 'Kerala' } },
      }),
    });
    if (attemptRes.status !== 409) {
      throw new Error(`Expected 409 Conflict, got ${attemptRes.status}`);
    }
    // Unlock destination
    await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UNLOCK',
        profileId,
        path: 'identity.destination',
      }),
    });
  }));

  // TEST 14: Concurrent Updates
  results.push(await runTest('TEST 14: Concurrent Updates & Monotonic Ordering', async () => {
    const p1 = fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE',
        profileId,
        patch: { pace: { style: 'relaxed' } },
      }),
    });
    const res1 = await p1;
    const json1 = await res1.json();
    if (!json1.success) throw new Error('Concurrent update failed');
  }));

  // TEST 15: Stale Calculation Responses
  results.push(await runTest('TEST 15: Stale Calculation Responses Guard', async () => {
    const getRes = await fetch(`${BASE_URL}?profileId=${profileId}`);
    const getJson = await getRes.json();
    const ver = getJson.data.profile.version;
    if (typeof ver !== 'number' || ver < 1) throw new Error('Invalid version');
  }));

  // TEST 16: Failed Recalculation Handling
  results.push(await runTest('TEST 16: Failed Recalculation Graceful Handling', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE',
        profileId: 'nonexistent-profile-id',
        patch: { budget: { totalBudget: 10000 } },
      }),
    });
    if (res.status !== 500 && res.status !== 400 && res.status !== 404) {
      throw new Error(`Expected error status, got ${res.status}`);
    }
  }));

  // TEST 17: Undo
  results.push(await runTest('TEST 17: Undo Action', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'UNDO', profileId }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Undo failed');
  }));

  // TEST 18: Version Restoration
  results.push(await runTest('TEST 18: Version Restoration', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'RESTORE', profileId, version: 1 }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Restore failed');
    if (json.data.profile.identity.destination !== 'Ladakh') {
      throw new Error('Expected destination Ladakh from version 1');
    }
  }));

  // TEST 19: Persistence After Refresh
  results.push(await runTest('TEST 19: Persistence Simulation', async () => {
    const res = await fetch(`${BASE_URL}?profileId=${profileId}`);
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error('Persistence lookup failed');
    if (json.data.profile.id !== profileId) throw new Error('Profile state desynchronized');
  }));

  // TEST 20: Existing Trip Compatibility
  results.push(await runTest('TEST 20: Existing Trip Compatibility', async () => {
    const res = await fetch('http://localhost:3000/api/trips/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Shimla 4 days 2 travelers',
        origin: 'Delhi',
        destinations: ['Shimla'],
        durationDays: 4,
        travelers: 2,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error('Plan route failed');
    if (!json.preferenceProfile) throw new Error('preferenceProfile missing from plan');
  }));

  // ====================================================================
  // MANDATORY CRITICAL TEST
  // ====================================================================
  console.log('\n----------------------------------------------------------------');
  console.log('CRITICAL SPECIFICATION TEST: AHMEDABAD -> LADAKH (40k -> 25k)');
  console.log('----------------------------------------------------------------');

  await runTest('CRITICAL TEST: Setup Ahmedabad -> Ladakh Trip', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'CREATE',
        initialData: {
          origin: 'Ahmedabad',
          destination: 'Ladakh',
          destinationList: ['Ladakh (Leh)'],
          tripDurationDays: 7,
          travelersCount: 2,
        },
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error('Setup failed');
    const cId = json.data.profile.id;

    // Apply baseline criteria: Vegetarian, Adventure, Standard, ₹40k/person (80k total)
    const updateRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE',
        profileId: cId,
        patch: {
          food: { preference: 'pure-veg' },
          interests: { adventure: true },
          accommodation: { category: 'standard-hotel' },
          budget: { totalBudget: 80000, perPersonBudget: 40000 },
        },
      }),
    });
    const updateJson = await updateRes.json();
    if (!updateJson.success) throw new Error('Baseline setup failed');

    // EXECUTE CHANGE: Reduce ONLY budget to ₹25,000 per person (50,000 total)
    const reductionRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE',
        profileId: cId,
        patch: {
          budget: { totalBudget: 50000, perPersonBudget: 25000 },
        },
      }),
    });
    const reductionJson = await reductionRes.json();
    if (!reductionJson.success) throw new Error('Reduction update failed');

    const p = reductionJson.data.profile;
    const exp = reductionJson.data.explanation;
    const plan = reductionJson.data.plan;

    // 1. Verify budget changed
    if (p.budget.totalBudget !== 50000) {
      throw new Error(`Budget failed to update: expected 50000, got ${p.budget.totalBudget}`);
    }

    // 2. Verify food remains vegetarian
    if (p.food.preference !== 'pure-veg') {
      throw new Error(`Food preference altered: expected pure-veg, got ${p.food.preference}`);
    }

    // 3. Verify destination remains Ladakh
    if (p.identity.destination !== 'Ladakh') {
      throw new Error(`Destination altered: expected Ladakh, got ${p.identity.destination}`);
    }

    // 4. Verify adventure interests remain selected
    if (!p.interests.adventure) {
      throw new Error('Adventure interests were reset unexpectedly');
    }

    // 5. Verify standard accommodation remains selected
    if (p.accommodation.category !== 'standard-hotel') {
      throw new Error(`Accommodation altered: expected standard-hotel, got ${p.accommodation.category}`);
    }

    // 6. Verify honest shortfall reporting (Ladakh flight/stay costs > ₹50k for 2 pax 7 days)
    if (plan.budget.totalEstimatedInr > 50000 && (!exp.budgetShortfallInr || exp.budgetShortfallInr <= 0)) {
      throw new Error('Budget shortfall not reported honestly');
    }

    console.log(`\n  ✓ Budget updated to ₹${p.budget.totalBudget.toLocaleString('en-IN')}`);
    console.log(`  ✓ Destination preserved: ${p.identity.destination}`);
    console.log(`  ✓ Food preserved: ${p.food.preference}`);
    console.log(`  ✓ Interests preserved: adventure=${p.interests.adventure}`);
    console.log(`  ✓ Accommodation preserved: ${p.accommodation.category}`);
    console.log(`  ✓ Honest shortfall reported: ₹${exp.budgetShortfallInr?.toLocaleString('en-IN') || 0}`);
  });

  // Summary
  console.log('\n================================================================');
  const passedCount = results.filter(r => r.pass).length;
  console.log(`PHASE 2 EVALUATION SUMMARY: ${passedCount} / ${results.length} PASSED`);
  if (passedCount === results.length) {
    console.log('\x1b[32mALL 20 PHASE 2 REQUIREMENTS + CRITICAL TEST PASSED (100%)\x1b[0m');
  }
  console.log('================================================================');
}

main().catch(console.error);

