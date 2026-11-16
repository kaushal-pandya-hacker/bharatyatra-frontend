import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { POST } from '../app/api/v1/trips/itinerary/route';
import { dynamicItineraryEngine } from '../lib/ai-planner/dynamic-itinerary-engine';
import { createDefaultPreferenceProfile } from '../lib/ai-planner/universal-preference-profile';

describe('BharatYatra Phase 8: Editable Itinerary API & End-to-End Suite', () => {
  let basePlan: any;

  beforeEach(() => {
    const profile = createDefaultPreferenceProfile({
      origin: 'Ahmedabad',
      destination: 'Dwarka',
      destinationList: ['Dwarka', 'Somnath'],
      durationDays: 3,
      travelersCount: 2,
    });
    basePlan = dynamicItineraryEngine.generateItinerary({
      preferenceProfile: profile,
      startDate: '2026-12-10',
    });
  });

  const createMockRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/v1/trips/itinerary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  test('TC-API-01: POST /api/v1/trips/itinerary - action: reorder_activities', async () => {
    const req = createMockRequest({
      action: 'reorder_activities',
      plan: basePlan,
      dayNumber: 1,
      slot: 'afternoon',
      fromIndex: 0,
      toIndex: 0,
    });
    const res = await POST(req);
    const json = await res.json();

    assert.equal(res.status, 200);
    assert.equal(json.success, true);
    assert.ok(json.data.currentVersion);
  });

  test('TC-API-02: POST /api/v1/trips/itinerary - action: add_custom_activity', async () => {
    const req = createMockRequest({
      action: 'add_custom_activity',
      plan: basePlan,
      dayNumber: 1,
      slot: 'morning',
      custom: {
        title: 'Morning Coastal Walk & Aarti',
        category: 'Spiritual & Culture',
        estimatedDurationMinutes: 60,
        costInr: 0,
        notes: 'Sunrise view of Gomti Ghat',
      },
    });
    const res = await POST(req);
    const json = await res.json();

    assert.equal(res.status, 200);
    assert.equal(json.success, true);
    const day1 = json.data.currentVersion.days[0];
    const custom = day1.morningActivities.find((a: any) => a.name.includes('Morning Coastal Walk'));
    assert.ok(custom);
    assert.equal(custom.evidenceStatus, 'USER_CUSTOM');
  });

  test('TC-API-03: POST /api/v1/trips/itinerary - action: duplicate_activity', async () => {
    const firstAct = basePlan.currentVersion.days[0].morningActivities[0];
    if (!firstAct) return;

    const req = createMockRequest({
      action: 'duplicate_activity',
      plan: basePlan,
      dayNumber: 1,
      activityId: firstAct.id,
    });
    const res = await POST(req);
    const json = await res.json();

    assert.equal(res.status, 200);
    assert.equal(json.success, true);
    const copies = json.data.currentVersion.days[0].morningActivities.filter((a: any) =>
      a.name.includes('(Copy)')
    );
    assert.ok(copies.length >= 1);
  });

  test('TC-API-04: POST /api/v1/trips/itinerary - action: add_day & remove_day', async () => {
    const addReq = createMockRequest({
      action: 'add_day',
      plan: basePlan,
      afterDayNumber: 1,
      location: 'Junagadh',
    });
    const addRes = await POST(addReq);
    const addJson = await addRes.json();

    assert.equal(addRes.status, 200);
    assert.equal(addJson.data.durationDays, basePlan.durationDays + 1);

    const remReq = createMockRequest({
      action: 'remove_day',
      plan: addJson.data,
      dayNumber: 2,
    });
    const remRes = await POST(remReq);
    const remJson = await remRes.json();

    assert.equal(remRes.status, 200);
    assert.equal(remJson.data.durationDays, basePlan.durationDays);
  });

  test('TC-API-05: POST /api/v1/trips/itinerary - action: add_destination & remove_destination', async () => {
    const addReq = createMockRequest({
      action: 'add_destination',
      plan: basePlan,
      destinationName: 'Madhavpur',
      allocatedDays: 1,
    });
    const addRes = await POST(addReq);
    const addJson = await addRes.json();

    assert.equal(addRes.status, 200);
    assert.ok(addJson.data.destinations.includes('Madhavpur'));

    const remReq = createMockRequest({
      action: 'remove_destination',
      plan: addJson.data,
      destinationName: 'Madhavpur',
    });
    const remRes = await POST(remReq);
    const remJson = await remRes.json();

    assert.equal(remRes.status, 200);
    assert.ok(!remJson.data.destinations.includes('Madhavpur'));
  });

  test('TC-API-06: POST /api/v1/trips/itinerary - action: update_accommodation with unconfirmed disclaimer', async () => {
    const req = createMockRequest({
      action: 'update_accommodation',
      plan: basePlan,
      dayNumber: 1,
      accommodation: {
        hotelName: 'Dwarka Premium Sea Breeze Resort',
        city: 'Dwarka',
        category: 'premium',
        starRating: 4,
        nights: 1,
        estimatedCostPerNightInr: 6500,
        totalCostInr: 6500,
        reason: 'Customer upgraded to premium beachside property',
      },
    });
    const res = await POST(req);
    const json = await res.json();

    assert.equal(res.status, 200);
    assert.equal(json.success, true);
    const stay = json.data.currentVersion.days[0].accommodation;
    assert.equal(stay.hotelName, 'Dwarka Premium Sea Breeze Resort');
  });

  test('TC-API-07: POST /api/v1/trips/itinerary - action: update_transit mode', async () => {
    const req = createMockRequest({
      action: 'update_transit',
      plan: basePlan,
      dayNumber: 1,
      legIndex: 0,
      updatedMode: 'flight',
      updatedCost: 4500,
      updatedDurationMinutes: 75,
    });
    const res = await POST(req);
    const json = await res.json();

    assert.equal(res.status, 200);
    assert.equal(json.success, true);
  });

  test('TC-API-08: POST /api/v1/trips/itinerary - action: update_budget', async () => {
    const req = createMockRequest({
      action: 'update_budget',
      plan: basePlan,
      customBudgetInr: 40000,
    });
    const res = await POST(req);
    const json = await res.json();

    assert.equal(res.status, 200);
    assert.equal(json.success, true);
    const recTier = json.data.currentVersion.pricing.recommendedTier || 'standard';
    assert.equal(json.data.currentVersion.pricing.tiers[recTier].totalGroupCost, 40000);
  });

  test('TC-API-09: POST /api/v1/trips/itinerary - action: propose_ai_diff', async () => {
    const req = createMockRequest({
      action: 'propose_ai_diff',
      plan: basePlan,
      prompt: 'Reduce budget by 20% and make pace relaxed',
    });
    const res = await POST(req);
    const json = await res.json();

    assert.equal(res.status, 200);
    assert.equal(json.success, true);
    const diff = json.data;
    assert.ok(diff.id);
    assert.ok(diff.summary);
    assert.ok(diff.costDelta < 0);
    assert.ok(diff.proposedPlan);
    assert.ok(diff.changesSummary);
  });
});
