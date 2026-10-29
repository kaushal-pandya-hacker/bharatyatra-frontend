import test, { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { GET as getTripRoute } from '../app/api/v1/trips/[id]/route';
import { GET as getExpensesRoute, POST as postExpenseRoute } from '../app/api/v1/trips/[id]/expenses/route';
import { UserDataStore } from '../lib/user/user-store';

describe('BharatYatra Trip Command Center Real Data & Elimination of Mock Defaults Suite', () => {
  const USER_A_ID = 'usr_cmd_alice_101';
  const USER_B_ID = 'usr_cmd_bob_202';
  const TOKEN_USER_A = 'test-jwt-usr_cmd_alice_101-customer';
  const TOKEN_USER_B = 'test-jwt-usr_cmd_bob_202-customer';

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    UserDataStore.clearForTesting();
  });

  // Helper to make mock requests
  function makeReq(url: string, token = TOKEN_USER_A, method = 'GET', body?: any) {
    return new NextRequest(`https://bharatyatra.in${url}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  it('Scenario 1: Non-existent or unauthorized trip ID returns 404 and does not default to demo Kutch trip', async () => {
    const req = makeReq('/api/v1/trips/non-existent-trip-999');
    const res = await getTripRoute(req, { params: { id: 'non-existent-trip-999' } });
    assert.strictEqual(res.status, 404);

    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.match(json.error, /not found|access denied/i);
    // Crucially: no fallback demo object returned
    assert.strictEqual(json.data, undefined);
  });

  it('Scenario 2: Real trip displays accurate persisted destination, travelers count and budget without hardcoded defaults', async () => {
    const realTripId = `trip_cmd_real_${Date.now()}`;

    // Create a real trip record for Jaipur Royal Circuit
    const created = await UserDataStore.saveTrip(USER_A_ID, {
      id: realTripId,
      title: 'Pink City Heritage & Forts Expedition',
      destination: 'Jaipur',
      destinationCity: 'Jaipur',
      originCity: 'Delhi',
      startDate: '2026-12-01',
      endDate: '2026-12-05',
      durationDays: 5,
      travelers: 4,
      budgetInr: 35000,
      status: 'PLANNING',
    });

    assert.strictEqual(created.id, realTripId);
    assert.strictEqual(created.destinationCity, 'Jaipur');
    assert.strictEqual(created.budgetInr, 35000);
    assert.strictEqual(created.travelers, 4);

    // Verify GET /api/v1/trips/[id] returns real data
    const req = makeReq(`/api/v1/trips/${realTripId}`);
    const res = await getTripRoute(req, { params: { id: realTripId } });
    assert.strictEqual(res.status, 200);

    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.title, 'Pink City Heritage & Forts Expedition');
    assert.strictEqual(json.data.destinationCity, 'Jaipur');
    assert.strictEqual(json.data.budgetInr, 35000);
    assert.notStrictEqual(json.data.title, 'Kutch Desert & Saurashtra Royal Circuit');
    assert.notStrictEqual(json.data.budgetInr, 24800);
  });

  it('Scenario 3: Zero expense state computes ₹0 circuit disbursal, 0 contributors and ₹0 fair share', async () => {
    const realTripId = `trip_cmd_zero_exp_${Date.now()}`;
    await UserDataStore.saveTrip(USER_A_ID, {
      id: realTripId,
      title: 'Kerala Backwaters & Spice Trails',
      destination: 'Kochi',
      destinationCity: 'Kochi',
      originCity: 'Bengaluru',
      startDate: '2026-11-10',
      endDate: '2026-11-14',
      durationDays: 4,
      travelers: 3,
      budgetInr: 40000,
      status: 'PLANNING',
    });

    const expReq = makeReq(`/api/v1/trips/${realTripId}/expenses`);
    const expRes = await getExpensesRoute(expReq, { params: { id: realTripId } });
    assert.strictEqual(expRes.status, 200);

    const json = await expRes.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.expenses.length, 0);

    // Financial engine calculations for empty state
    const summary = json.data.summary;
    assert.strictEqual(summary.totalTripCostInr, 0);
    assert.strictEqual(summary.averageCostPerPersonInr, 0);
    assert.strictEqual(summary.settlements.length, 0);
    // Must NOT return hardcoded ₹15,000 or ₹2,500/head
    assert.notStrictEqual(summary.totalTripCostInr, 15000);
    assert.notStrictEqual(summary.averageCostPerPersonInr, 2500);
  });

  it('Scenario 4: Real recorded expenses calculate exact circuit disbursals, active contributors and fair share', async () => {
    const realTripId = `trip_cmd_active_exp_${Date.now()}`;
    await UserDataStore.saveTrip(USER_A_ID, {
      id: realTripId,
      title: 'Goa Coastal Exploration',
      destination: 'Goa',
      destinationCity: 'Goa',
      originCity: 'Mumbai',
      startDate: '2026-12-15',
      endDate: '2026-12-18',
      durationDays: 4,
      travelers: 4,
      budgetInr: 60000,
      status: 'ACTIVE',
    });

    // Initial member (owner) is already present. Add 3 additional companions for a total of 4 members:
    const initialMembers = await UserDataStore.getTripMembers(realTripId, USER_A_ID);
    const ownerMember = initialMembers![0];

    const member2 = await UserDataStore.addTripMember(realTripId, USER_A_ID, { name: 'Rohan Sen', role: 'MEMBER' });
    const member3 = await UserDataStore.addTripMember(realTripId, USER_A_ID, { name: 'Diya Patel', role: 'MEMBER' });
    const member4 = await UserDataStore.addTripMember(realTripId, USER_A_ID, { name: 'Ananya Roy', role: 'MEMBER' });

    // Post real expense of ₹8,000 paid by ownerMember
    const postReq = makeReq(`/api/v1/trips/${realTripId}/expenses`, TOKEN_USER_A, 'POST', {
      title: 'Beachside Villa Stay',
      amountInr: 8000,
      paidByMemberId: ownerMember.id,
      category: 'Stay',
      splitType: 'EQUAL',
      participantMemberIds: [ownerMember.id, member2.id, member3.id, member4.id],
    });
    const postRes = await postExpenseRoute(postReq, { params: { id: realTripId } });
    assert.strictEqual(postRes.status, 201);

    // Fetch expenses
    const getReq = makeReq(`/api/v1/trips/${realTripId}/expenses`);
    const getRes = await getExpensesRoute(getReq, { params: { id: realTripId } });
    const json = await getRes.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.expenses.length, 1);

    const summary = json.data.summary;
    // Total spent must be exactly ₹8,000
    assert.strictEqual(summary.totalTripCostInr, 8000);
    // Fair share: ₹8,000 / 4 members = ₹2,000/head
    assert.strictEqual(summary.averageCostPerPersonInr, 2000);

    // Owner paid ₹8000, their share is ₹2000 -> gets back ₹6000
    const m1Balance = summary.memberBalances.find((b: any) => b.memberId === ownerMember.id);
    assert.strictEqual(m1Balance.totalPaidInr, 8000);
    assert.strictEqual(m1Balance.netBalanceInr, 6000);
    assert.strictEqual(m1Balance.status, 'CREDITOR');

    // Other 3 members owe ₹2000 each -> total outstanding = ₹6000
    const pendingDebts = summary.settlements.filter((s: any) => s.status === 'PENDING');
    const totalOutstanding = pendingDebts.reduce((sum: number, s: any) => sum + s.amountInr, 0);
    assert.strictEqual(totalOutstanding, 6000);
    assert.strictEqual(pendingDebts.length, 3);
  });

  it('Scenario 5: Vehicle & telemetry data reflects honest unassigned state when not configured', async () => {
    const realTripId = `trip_cmd_no_veh_${Date.now()}`;
    const tripRecord = await UserDataStore.saveTrip(USER_A_ID, {
      id: realTripId,
      title: 'Udaipur Lake Palace Circuit',
      destination: 'Udaipur',
      destinationCity: 'Udaipur',
      originCity: 'Jaipur',
      durationDays: 3,
      travelers: 2,
      budgetInr: 25000,
      status: 'SAVED',
    });

    // Verify trip record does not contain any vehicle telemetry
    assert.strictEqual(tripRecord.routeJson?.vehicle, undefined);
    assert.strictEqual(tripRecord.tripContextJson?.vehicle, undefined);
  });

  it('Scenario 6: Cross-user trip access defense - User B cannot access User A trip command center', async () => {
    const userA_tripId = `trip_user_a_${Date.now()}`;
    await UserDataStore.saveTrip(USER_A_ID, {
      id: userA_tripId,
      title: 'Private Expedition',
      destination: 'Shimla',
      durationDays: 3,
      travelers: 2,
      budgetInr: 20000,
      status: 'PLANNING',
    });

    // User B tries to access User A's trip
    const unauthorizedReq = makeReq(`/api/v1/trips/${userA_tripId}`, TOKEN_USER_B);

    const res = await getTripRoute(unauthorizedReq, { params: { id: userA_tripId } });
    assert.strictEqual(res.status, 404); // 404 protects enumeration
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.strictEqual(json.data, undefined);
  });
});
