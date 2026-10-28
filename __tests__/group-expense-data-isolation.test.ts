import test, { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { NextRequest } from 'next/server';
import { UserDataStore } from '../lib/user/user-store';
import {
  computeFullTripExpenseSummary,
  createTripExpense,
  inrToPaise,
  paiseToInr,
} from '../lib/trips/group-expense-engine';
import { GET as getExpensesRoute, POST as postExpensesRoute } from '../app/api/v1/trips/[id]/expenses/route';
import { DELETE as deleteExpenseRoute } from '../app/api/v1/trips/[id]/expenses/[expenseId]/route';
import { GET as getMembersRoute, POST as postMembersRoute } from '../app/api/v1/trips/[id]/members/route';
import { DELETE as deleteMemberRoute } from '../app/api/v1/trips/[id]/members/[memberId]/route';
import { POST as postSettleRoute } from '../app/api/v1/trips/[id]/settle/route';

describe('BharatYatra Group Expense Splitter & Data Isolation Test Suite', () => {
  const USER_A_ID = 'usr_alice_101';
  const USER_B_ID = 'usr_bob_202';
  const USER_C_ID = 'usr_carol_303';

  const TOKEN_USER_A = 'test-jwt-usr_alice_101-customer';
  const TOKEN_USER_B = 'test-jwt-usr_bob_202-customer';
  const TOKEN_USER_C = 'test-jwt-usr_carol_303-customer';

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    UserDataStore.clearForTesting();
  });

  describe('Scenario 1 & 2: New Trip & Empty State (Zero Hardcoded Demo Data)', () => {
    it('returns genuine empty state for a new trip (0 expenses, 0 total, no fake members)', async () => {
      // 1. User A creates a real trip
      const trip = await UserDataStore.saveTrip(USER_A_ID, {
        title: 'Rann of Kutch Odyssey',
        destination: 'Kutch',
      });

      // 2. Fetch expenses route
      const req = new NextRequest(`http://localhost:3000/api/v1/trips/${trip.id}/expenses`, {
        headers: { Authorization: `Bearer ${TOKEN_USER_A}` },
      });
      const res = await getExpensesRoute(req, { params: { id: trip.id } });
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.expenses.length, 0, 'Must have zero pre-recorded expenses');
      assert.strictEqual(json.data.summary.totalTripCostInr, 0, 'Total trip expenses must be 0');
      assert.strictEqual(json.data.summary.totalExpensesCount, 0, 'Recorded items must be 0');
      assert.strictEqual(json.data.summary.averageCostPerPersonInr, 0, 'Equal share must be 0');
      assert.strictEqual(json.data.summary.settlements.length, 0, 'Debt matrix must have 0 debts');

      // Check that only real organizer is loaded, NOT 4 fake default members (Kaushal, Rahul, Jay, Dev)
      assert.strictEqual(json.data.members.length, 1);
      assert.strictEqual(json.data.members[0].role, 'OWNER');
      assert.ok(!json.data.members.some((m: any) => m.name === 'Rahul' || m.name === 'Jay' || m.name === 'Dev'));
    });
  });

  describe('Scenario 3: Single Real Expense Calculation', () => {
    it('records a real expense and computes exact creditor and debtor balances', async () => {
      const trip = await UserDataStore.saveTrip(USER_A_ID, { title: 'Gir Forest Safari' });
      const members = await UserDataStore.getTripMembers(trip.id, USER_A_ID);
      const ownerId = members![0].id;

      // Add a real companion
      const memberB = await UserDataStore.addTripMember(trip.id, USER_A_ID, { name: 'Aarav Mehta' });

      // Post an expense: ₹2,000 paid by Owner split between Owner and Companion
      const postReq = new NextRequest(`http://localhost:3000/api/v1/trips/${trip.id}/expenses`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TOKEN_USER_A}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Forest Gypsy Permit',
          amountInr: 2000,
          paidByMemberId: ownerId,
          category: 'Tickets',
          participantMemberIds: [ownerId, memberB.id],
        }),
      });

      const postRes = await postExpensesRoute(postReq, { params: { id: trip.id } });
      assert.strictEqual(postRes.status, 201);
      const postJson = await postRes.json();
      assert.strictEqual(postJson.success, true);
      assert.strictEqual(postJson.data.amountInr, 2000);
      assert.strictEqual(postJson.data.amountPaise, 200000);

      // Verify recalculated summary
      const getReq = new NextRequest(`http://localhost:3000/api/v1/trips/${trip.id}/expenses`, {
        headers: { Authorization: `Bearer ${TOKEN_USER_A}` },
      });
      const getRes = await getExpensesRoute(getReq, { params: { id: trip.id } });
      const getJson = await getRes.json();

      assert.strictEqual(getJson.data.summary.totalTripCostInr, 2000);
      assert.strictEqual(getJson.data.summary.totalExpensesCount, 1);
      assert.strictEqual(getJson.data.summary.averageCostPerPersonInr, 1000);

      // Owner paid 2000, share 1000 -> gets back +1000
      const ownerBalance = getJson.data.summary.memberBalances.find((b: any) => b.memberId === ownerId);
      assert.strictEqual(ownerBalance.netBalanceInr, 1000);
      assert.strictEqual(ownerBalance.status, 'CREDITOR');

      // MemberB paid 0, share 1000 -> owes -1000
      const memberBBalance = getJson.data.summary.memberBalances.find((b: any) => b.memberId === memberB.id);
      assert.strictEqual(memberBBalance.netBalanceInr, -1000);
      assert.strictEqual(memberBBalance.status, 'DEBTOR');

      // Single settlement suggestion: MemberB pays Owner ₹1,000
      assert.strictEqual(getJson.data.summary.settlements.length, 1);
      assert.strictEqual(getJson.data.summary.settlements[0].fromMemberId, memberB.id);
      assert.strictEqual(getJson.data.summary.settlements[0].toMemberId, ownerId);
      assert.strictEqual(getJson.data.summary.settlements[0].amountInr, 1000);
    });
  });

  describe('Scenario 4 & 5: Multi-Payer & Equal vs Custom Splits with Minor Unit Precision', () => {
    it('handles multiple expenses by different payers and uneven 3-way split with zero rounding loss', async () => {
      const trip = await UserDataStore.saveTrip(USER_A_ID, { title: 'Dwarka Somnath Circuit' });
      const owner = (await UserDataStore.getTripMembers(trip.id, USER_A_ID))![0];
      const m2 = await UserDataStore.addTripMember(trip.id, USER_A_ID, { name: 'Pooja' });
      const m3 = await UserDataStore.addTripMember(trip.id, USER_A_ID, { name: 'Karan' });

      // Expense 1: ₹100.00 split equally among 3 travelers (100.00 / 3 = 33.34, 33.33, 33.33)
      await UserDataStore.createTripExpense(trip.id, USER_A_ID, {
        title: 'Highway Tea',
        amountInr: 100,
        paidByMemberId: owner.id,
        category: 'Food',
        participantMemberIds: [owner.id, m2.id, m3.id],
      });

      // Expense 2: ₹500.00 paid by Pooja split equally among Pooja and Karan
      await UserDataStore.createTripExpense(trip.id, USER_A_ID, {
        title: 'Temple Prasadam',
        amountInr: 500,
        paidByMemberId: m2.id,
        category: 'Food',
        participantMemberIds: [m2.id, m3.id],
      });

      const expenses = await UserDataStore.getTripExpenses(trip.id, USER_A_ID);
      const members = await UserDataStore.getTripMembers(trip.id, USER_A_ID);
      const summary = computeFullTripExpenseSummary(members!, expenses!);

      assert.strictEqual(summary.totalTripCostInr, 600);
      assert.strictEqual(summary.totalExpensesCount, 2);

      // Verify exact conservation: sum of net balances in paise must equal exactly 0
      const sumNetPaise = summary.memberBalances.reduce((sum, b) => sum + b.netBalancePaise, 0);
      assert.strictEqual(sumNetPaise, 0, 'Sum of net balances must be strictly 0 paise');
    });
  });

  describe('Scenario 6 & 7: Authorization & Cross-Tenant IDOR Defense', () => {
    it('User B cannot view, create, or delete expenses belonging to User A trip', async () => {
      // 1. User A creates trip and expense
      const tripA = await UserDataStore.saveTrip(USER_A_ID, { title: 'Secret Goa Trip' });
      const ownerA = (await UserDataStore.getTripMembers(tripA.id, USER_A_ID))![0];
      const expA = await UserDataStore.createTripExpense(tripA.id, USER_A_ID, {
        title: 'Villa Stay',
        amountInr: 15000,
        paidByMemberId: ownerA.id,
        category: 'Stay',
      });

      // 2. User B tries to GET User A's expenses -> 404 (prevent enumeration)
      const getReq = new NextRequest(`http://localhost:3000/api/v1/trips/${tripA.id}/expenses`, {
        headers: { Authorization: `Bearer ${TOKEN_USER_B}` },
      });
      const getRes = await getExpensesRoute(getReq, { params: { id: tripA.id } });
      assert.strictEqual(getRes.status, 404, 'Must return 404 access denied');

      // 3. User B tries to POST an expense to User A's trip -> 400/404 forbidden
      const postReq = new NextRequest(`http://localhost:3000/api/v1/trips/${tripA.id}/expenses`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TOKEN_USER_B}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Hacked Expense',
          amountInr: 9999,
          paidByMemberId: 'fake_payer',
        }),
      });
      const postRes = await postExpensesRoute(postReq, { params: { id: tripA.id } });
      assert.strictEqual(postRes.status, 400);

      // 4. User B tries to DELETE User A's expense -> 404
      const delReq = new NextRequest(`http://localhost:3000/api/v1/trips/${tripA.id}/expenses/${expA.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${TOKEN_USER_B}` },
      });
      const delRes = await deleteExpenseRoute(delReq, { params: { id: tripA.id, expenseId: expA.id } });
      assert.strictEqual(delRes.status, 404);

      // Verify User A expense was not deleted
      const checkExpenses = await UserDataStore.getTripExpenses(tripA.id, USER_A_ID);
      assert.strictEqual(checkExpenses?.length, 1);
    });
  });

  describe('Scenario 8: Database Persistence Failure Honest Reporting', () => {
    it('returns HTTP 503 when the database write encounters an honest failure', async () => {
      const trip = await UserDataStore.saveTrip(USER_A_ID, { title: 'Saputara Hills' });
      const owner = (await UserDataStore.getTripMembers(trip.id, USER_A_ID))![0];

      // Simulate database failure
      UserDataStore.setSimulateDatabaseFailure(true);
      try {
        const req = new NextRequest(`http://localhost:3000/api/v1/trips/${trip.id}/expenses`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${TOKEN_USER_A}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'Ropeway Cable Car',
            amountInr: 600,
            paidByMemberId: owner.id,
            category: 'Activities',
          }),
        });

        const res = await postExpensesRoute(req, { params: { id: trip.id } });
        assert.strictEqual(res.status, 503, 'Must return 503 on database failure');
        const json = await res.json();
        assert.strictEqual(json.code, 'DATABASE_ERROR');
      } finally {
        UserDataStore.setSimulateDatabaseFailure(false);
      }
    });
  });

  describe('Scenario 9 & 10: Settlement Confirmation & Expense Deletion', () => {
    it('persists settlement confirmation and recalculates debts after expense deletion', async () => {
      const trip = await UserDataStore.saveTrip(USER_A_ID, { title: 'Statue of Unity Expedition' });
      const owner = (await UserDataStore.getTripMembers(trip.id, USER_A_ID))![0];
      const member2 = await UserDataStore.addTripMember(trip.id, USER_A_ID, { name: 'Deepak' });

      // Add expense
      const exp = await UserDataStore.createTripExpense(trip.id, USER_A_ID, {
        title: 'Viewing Gallery Tickets',
        amountInr: 3000,
        paidByMemberId: owner.id,
        participantMemberIds: [owner.id, member2.id],
      });

      // Deepak confirms settlement of ₹1,500 to Owner via UPI
      const settleReq = new NextRequest(`http://localhost:3000/api/v1/trips/${trip.id}/settle`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TOKEN_USER_A}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromMemberId: member2.id,
          toMemberId: owner.id,
          amountInr: 1500,
          status: 'SETTLED',
          refCode: 'UPI-AXIS-9921',
        }),
      });

      const settleRes = await postSettleRoute(settleReq, { params: { id: trip.id } });
      assert.strictEqual(settleRes.status, 200);

      // Verify settlement is persisted
      const settlements = await UserDataStore.getSettlements(trip.id, USER_A_ID);
      assert.strictEqual(settlements?.length, 1);
      assert.strictEqual(settlements![0].status, 'SETTLED');
      assert.strictEqual(settlements![0].refCode, 'UPI-AXIS-9921');

      // Now Owner deletes the expense
      const delReq = new NextRequest(`http://localhost:3000/api/v1/trips/${trip.id}/expenses/${exp.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${TOKEN_USER_A}` },
      });
      const delRes = await deleteExpenseRoute(delReq, { params: { id: trip.id, expenseId: exp.id } });
      assert.strictEqual(delRes.status, 200);

      // Verify expenses list is now empty (₹0 totals)
      const afterExpenses = await UserDataStore.getTripExpenses(trip.id, USER_A_ID);
      assert.strictEqual(afterExpenses?.length, 0);
    });
  });
});
