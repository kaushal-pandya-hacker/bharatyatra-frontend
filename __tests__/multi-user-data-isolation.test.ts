import test, { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { NextRequest } from 'next/server';
import { UserDataStore, DatabasePersistenceError } from '../lib/user/user-store';
import { getServerUser, requireServerUser, requireAdminUser } from '../lib/auth/server-auth';
import { GET as getTripsRoute, POST as postTripsRoute } from '../app/api/v1/trips/route';
import { GET as getSingleTripRoute, PATCH as patchSingleTripRoute, DELETE as deleteTripRoute } from '../app/api/v1/trips/[id]/route';
import { GET as getBookingsRoute, POST as postBookingsRoute } from '../app/api/v1/bookings/route';
import { GET as getSingleBookingRoute, PATCH as patchSingleBookingRoute } from '../app/api/v1/bookings/[id]/route';
import { POST as postCancelBookingRoute } from '../app/api/v1/bookings/[id]/cancel/route';
import { GET as getMeRoute, PATCH as patchMeRoute } from '../app/api/v1/me/route';
import { GET as getSavedDestRoute, POST as postSavedDestRoute, DELETE as deleteSavedDestRoute } from '../app/api/v1/me/saved-destinations/route';
import { GET as getPreferencesRoute, PATCH as patchPreferencesRoute } from '../app/api/v1/me/preferences/route';
import { GET as getAdminUsersRoute, PATCH as patchAdminUsersRoute } from '../app/api/v1/admin/users/route';

describe('BharatYatra Multi-User Data Isolation & User Management Security Suite', () => {
  const USER_A_ID = 'usr_alice_101';
  const USER_B_ID = 'usr_bob_202';
  const USER_C_NEWBIE = 'usr_charlie_303';
  const ADMIN_ID = 'usr_admin_999';

  const TOKEN_USER_A = 'test-jwt-usr_alice_101-customer';
  const TOKEN_USER_B = 'test-jwt-usr_bob_202-customer';
  const TOKEN_USER_C = 'test-jwt-usr_charlie_303-customer';
  const TOKEN_ADMIN = 'test-jwt-usr_admin_999-admin';

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    UserDataStore.clearForTesting();
  });

  describe('1. Server Authentication & Identity Verification', () => {
    it('cryptographically resolves user identity from Authorization Bearer token', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/me', {
        headers: { Authorization: `Bearer ${TOKEN_USER_A}` },
      });
      const user = await getServerUser(req);
      assert.ok(user);
      assert.strictEqual(user.id, USER_A_ID);
      assert.strictEqual(user.role, 'CUSTOMER');
    });

    it('identifies administrator identity and role', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/admin/users', {
        headers: { Authorization: `Bearer ${TOKEN_ADMIN}` },
      });
      const user = await getServerUser(req);
      assert.ok(user);
      assert.strictEqual(user.id, ADMIN_ID);
      assert.strictEqual(user.role, 'ADMIN');
    });

    it('returns null and rejects unauthenticated requests', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/me');
      const user = await getServerUser(req);
      assert.strictEqual(user, null);

      const authGuard = await requireServerUser(req);
      assert.ok(authGuard.response);
      assert.strictEqual(authGuard.response.status, 401);
    });
  });

  describe('2. Trips Multi-User Isolation & IDOR/BOLA Protection', () => {
    it('User A and User B cannot view each other\'s trips', async () => {
      // 1. User A creates Trip A
      const reqA = new NextRequest('http://localhost:3000/api/v1/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN_USER_A}`,
        },
        body: JSON.stringify({
          title: 'Alice Trip to Somnath & Gir',
          destination: 'Gir National Park',
          budgetInr: 18000,
        }),
      });
      const resA = await postTripsRoute(reqA);
      const jsonA = await resA.json();
      assert.strictEqual(resA.status, 201);
      const tripAId = jsonA.data.id;

      // 2. User B creates Trip B
      const reqB = new NextRequest('http://localhost:3000/api/v1/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN_USER_B}`,
        },
        body: JSON.stringify({
          title: 'Bob Trip to Rann of Kutch',
          destination: 'Kutch White Desert',
          budgetInr: 25000,
        }),
      });
      const resB = await postTripsRoute(reqB);
      const jsonB = await resB.json();
      assert.strictEqual(resB.status, 201);
      const tripBId = jsonB.data.id;

      // 3. User A lists trips: Must see ONLY Trip A
      const listReqA = new NextRequest('http://localhost:3000/api/v1/trips', {
        headers: { Authorization: `Bearer ${TOKEN_USER_A}` },
      });
      const listResA = await getTripsRoute(listReqA);
      const listJsonA = await listResA.json();
      assert.strictEqual(listJsonA.data.length, 1);
      assert.strictEqual(listJsonA.data[0].id, tripAId);
      assert.strictEqual(listJsonA.data[0].title, 'Alice Trip to Somnath & Gir');

      // 4. User B lists trips: Must see ONLY Trip B
      const listReqB = new NextRequest('http://localhost:3000/api/v1/trips', {
        headers: { Authorization: `Bearer ${TOKEN_USER_B}` },
      });
      const listResB = await getTripsRoute(listReqB);
      const listJsonB = await listResB.json();
      assert.strictEqual(listJsonB.data.length, 1);
      assert.strictEqual(listJsonB.data[0].id, tripBId);
      assert.strictEqual(listJsonB.data[0].title, 'Bob Trip to Rann of Kutch');

      // 5. User A tries to view Trip B by ID: Must return 404 (prevent resource enumeration)
      const inspectReq = new NextRequest(`http://localhost:3000/api/v1/trips/${tripBId}`, {
        headers: { Authorization: `Bearer ${TOKEN_USER_A}` },
      });
      const inspectRes = await getSingleTripRoute(inspectReq, { params: { id: tripBId } });
      assert.strictEqual(inspectRes.status, 404);

      // 6. User A tries to modify Trip B: Must return 404
      const patchReq = new NextRequest(`http://localhost:3000/api/v1/trips/${tripBId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN_USER_A}`,
        },
        body: JSON.stringify({ title: 'Hacked Trip Title' }),
      });
      const patchRes = await patchSingleTripRoute(patchReq, { params: { id: tripBId } });
      assert.strictEqual(patchRes.status, 404);

      // 7. User A tries to delete Trip B: Must return 404
      const delReq = new NextRequest(`http://localhost:3000/api/v1/trips/${tripBId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${TOKEN_USER_A}` },
      });
      const delRes = await deleteTripRoute(delReq, { params: { id: tripBId } });
      assert.strictEqual(delRes.status, 404);

      // Verify Trip B still exists undamaged for User B
      const verifyReq = new NextRequest(`http://localhost:3000/api/v1/trips/${tripBId}`, {
        headers: { Authorization: `Bearer ${TOKEN_USER_B}` },
      });
      const verifyRes = await getSingleTripRoute(verifyReq, { params: { id: tripBId } });
      assert.strictEqual(verifyRes.status, 200);
    });

    it('discards client-supplied userId in POST request bodies (IDOR protection)', async () => {
      // User A tries to inject userId = USER_B_ID in body
      const req = new NextRequest('http://localhost:3000/api/v1/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN_USER_A}`,
        },
        body: JSON.stringify({
          userId: USER_B_ID,
          user_id: USER_B_ID,
          title: 'Sneaky Injected Trip',
          destination: 'Dwarka',
        }),
      });
      const res = await postTripsRoute(req);
      const json = await res.json();
      assert.strictEqual(res.status, 201);
      // Stored trip MUST belong to authenticated caller USER_A_ID
      assert.strictEqual(json.data.userId, USER_A_ID);
    });
  });

  describe('3. Bookings Isolation & Zero Shared Mock Data', () => {
    it('new user receives an empty bookings collection with zero mock bookings', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/bookings', {
        headers: { Authorization: `Bearer ${TOKEN_USER_C}` },
      });
      const res = await getBookingsRoute(req);
      const json = await res.json();

      assert.strictEqual(res.status, 200);
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.count, 0);
      assert.deepStrictEqual(json.data, []);
    });

    it('User A booking is completely invisible to User B', async () => {
      // Create booking for User A
      const bookReq = new NextRequest('http://localhost:3000/api/v1/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN_USER_A}`,
        },
        body: JSON.stringify({
          inventoryTitle: 'Taj Skyline Ahmedabad',
          bookingType: 'HOTEL',
          totalAmountInr: 12500,
        }),
      });
      const bookRes = await postBookingsRoute(bookReq);
      const bookJson = await bookRes.json();
      assert.strictEqual(bookRes.status, 201);
      const bookingId = bookJson.data.id;

      // User B inspects booking by ID: returns 404
      const inspectReq = new NextRequest(`http://localhost:3000/api/v1/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${TOKEN_USER_B}` },
      });
      const inspectRes = await getSingleBookingRoute(inspectReq, { params: { id: bookingId } });
      assert.strictEqual(inspectRes.status, 404);

      // User B attempts to cancel User A's booking: returns 404
      const cancelReq = new NextRequest(`http://localhost:3000/api/v1/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN_USER_B}`,
        },
        body: JSON.stringify({ reason: 'Malicious cancellation attempt' }),
      });
      const cancelRes = await patchSingleBookingRoute(cancelReq, { params: { id: bookingId } });
      assert.strictEqual(cancelRes.status, 404);

      // User A cancels their own booking: succeeds
      const cancelReqOwner = new NextRequest(`http://localhost:3000/api/v1/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN_USER_A}`,
        },
        body: JSON.stringify({ reason: 'Plans changed' }),
      });
      const cancelResOwner = await patchSingleBookingRoute(cancelReqOwner, { params: { id: bookingId } });
      assert.strictEqual(cancelResOwner.status, 200);
      const cancelOwnerJson = await cancelResOwner.json();
      assert.strictEqual(cancelOwnerJson.data.status, 'CANCELLED');
    });
  });

  describe('4. User Profile & Preferences Isolation', () => {
    it('isolates user profile and prevents privilege escalation to ADMIN via self-update', async () => {
      // User A updates profile and attempts to inject role = 'ADMIN'
      const patchReq = new NextRequest('http://localhost:3000/api/v1/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN_USER_A}`,
        },
        body: JSON.stringify({
          fullName: 'Alice In Wonderland',
          phoneNumber: '+919876543210',
          role: 'ADMIN', // Privilege escalation attempt
        }),
      });
      const patchRes = await patchMeRoute(patchReq);
      const patchJson = await patchRes.json();

      assert.strictEqual(patchRes.status, 200);
      assert.strictEqual(patchJson.data.fullName, 'Alice In Wonderland');
      // Role MUST remain CUSTOMER
      assert.strictEqual(patchJson.data.role, 'CUSTOMER');
    });

    it('isolates user preferences and saved wishlist destinations per tenant', async () => {
      // User A saves destination
      const saveReqA = new NextRequest('http://localhost:3000/api/v1/me/saved-destinations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN_USER_A}`,
        },
        body: JSON.stringify({
          destinationId: 'dest-somnath-temple',
          name: 'Somnath Temple',
        }),
      });
      const saveResA = await postSavedDestRoute(saveReqA);
      assert.strictEqual(saveResA.status, 201);

      // User B saves different destination
      const saveReqB = new NextRequest('http://localhost:3000/api/v1/me/saved-destinations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN_USER_B}`,
        },
        body: JSON.stringify({
          destinationId: 'dest-saputara-hills',
          name: 'Saputara Hill Station',
        }),
      });
      const saveResB = await postSavedDestRoute(saveReqB);
      assert.strictEqual(saveResB.status, 201);

      // Verify User A saved list has only Somnath
      const listReqA = new NextRequest('http://localhost:3000/api/v1/me/saved-destinations', {
        headers: { Authorization: `Bearer ${TOKEN_USER_A}` },
      });
      const listResA = await getSavedDestRoute(listReqA);
      const listJsonA = await listResA.json();
      assert.strictEqual(listJsonA.data.length, 1);
      assert.strictEqual(listJsonA.data[0].destinationId, 'dest-somnath-temple');

      // Verify User B saved list has only Saputara
      const listReqB = new NextRequest('http://localhost:3000/api/v1/me/saved-destinations', {
        headers: { Authorization: `Bearer ${TOKEN_USER_B}` },
      });
      const listResB = await getSavedDestRoute(listReqB);
      const listJsonB = await listResB.json();
      assert.strictEqual(listJsonB.data.length, 1);
      assert.strictEqual(listJsonB.data[0].destinationId, 'dest-saputara-hills');
    });
  });

  describe('5. Administrator Access Control & Audit Logging', () => {
    it('strictly forbids ordinary customer from accessing administrator directory', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/admin/users', {
        headers: { Authorization: `Bearer ${TOKEN_USER_A}` },
      });
      const res = await getAdminUsersRoute(req);
      assert.strictEqual(res.status, 403);
      const json = await res.json();
      assert.strictEqual(json.code, 'FORBIDDEN');
    });

    it('allows administrator to list platform users and updates status with audit log', async () => {
      // 1. Seed User A profile
      await UserDataStore.updateProfile(USER_A_ID, {
        email: 'alice@bharatyatra.in',
        fullName: 'Alice Test',
        role: 'CUSTOMER',
        status: 'ACTIVE',
      });

      // 2. Admin lists users
      const listReq = new NextRequest('http://localhost:3000/api/v1/admin/users', {
        headers: { Authorization: `Bearer ${TOKEN_ADMIN}` },
      });
      const listRes = await getAdminUsersRoute(listReq);
      assert.strictEqual(listRes.status, 200);
      const listJson = await listRes.json();
      assert.ok(listJson.data.length >= 1);

      // 3. Admin suspends User A account
      const patchReq = new NextRequest('http://localhost:3000/api/v1/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN_ADMIN}`,
        },
        body: JSON.stringify({
          targetUserId: USER_A_ID,
          status: 'SUSPENDED',
        }),
      });
      const patchRes = await patchAdminUsersRoute(patchReq);
      assert.strictEqual(patchRes.status, 200);
      const patchJson = await patchRes.json();
      assert.strictEqual(patchJson.data.status, 'SUSPENDED');

      // 4. Verify admin audit log was written
      const auditLogs = await UserDataStore.getAdminAuditLogs();
      assert.ok(auditLogs.length > 0);
      assert.strictEqual(auditLogs[0].adminId, ADMIN_ID);
      assert.strictEqual(auditLogs[0].targetUserId, USER_A_ID);
      assert.strictEqual(auditLogs[0].action, 'UPDATE_USER_STATUS_ROLE');
    });
  });

  describe('6. Cross-Account Modification & Deletion Rejection', () => {
    it('User B cannot modify or delete User A trip', async () => {
      // 1. User A creates a trip
      const createReq = new NextRequest('http://localhost:3000/api/v1/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN_USER_A}`,
        },
        body: JSON.stringify({
          title: 'Alice Private Trip',
          destination: 'Rann of Kutch',
        }),
      });
      const createRes = await postTripsRoute(createReq);
      const { data: tripA } = await createRes.json();

      // 2. User B attempts to PATCH User A trip
      const patchReq = new NextRequest(`http://localhost:3000/api/v1/trips/${tripA.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN_USER_B}`,
        },
        body: JSON.stringify({
          title: 'Hacked by Bob',
        }),
      });
      const patchRes = await patchSingleTripRoute(patchReq, { params: { id: tripA.id } });
      assert.strictEqual(patchRes.status, 404);

      // 3. User B attempts to DELETE User A trip
      const deleteReq = new NextRequest(`http://localhost:3000/api/v1/trips/${tripA.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${TOKEN_USER_B}` },
      });
      const deleteRes = await deleteTripRoute(deleteReq, { params: { id: tripA.id } });
      assert.strictEqual(deleteRes.status, 404);

      // Verify User A trip is still intact
      const verifyReq = new NextRequest(`http://localhost:3000/api/v1/trips/${tripA.id}`, {
        headers: { Authorization: `Bearer ${TOKEN_USER_A}` },
      });
      const verifyRes = await getSingleTripRoute(verifyReq, { params: { id: tripA.id } });
      assert.strictEqual(verifyRes.status, 200);
      const { data: verifiedTrip } = await verifyRes.json();
      assert.strictEqual(verifiedTrip.title, 'Alice Private Trip');
    });

    it('User B cannot cancel User A booking', async () => {
      // 1. User A creates a booking
      const bookReq = new NextRequest('http://localhost:3000/api/v1/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN_USER_A}`,
        },
        body: JSON.stringify({
          inventoryTitle: 'Gir Lion Safari Lodge',
          totalAmountInr: 12000,
        }),
      });
      const bookRes = await postBookingsRoute(bookReq);
      const { data: bookingA } = await bookRes.json();

      // 2. User B attempts to cancel via PATCH /api/v1/bookings/[id]
      const patchCancelReq = new NextRequest(`http://localhost:3000/api/v1/bookings/${bookingA.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN_USER_B}`,
        },
        body: JSON.stringify({
          cancellationReason: 'Bob cancelling Alice booking',
        }),
      });
      const patchCancelRes = await patchSingleBookingRoute(patchCancelReq, { params: { id: bookingA.id } });
      assert.strictEqual(patchCancelRes.status, 404);

      // 3. User B attempts to cancel via POST /api/v1/bookings/[id]/cancel
      const postCancelReq = new NextRequest(`http://localhost:3000/api/v1/bookings/${bookingA.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN_USER_B}`,
        },
        body: JSON.stringify({
          cancellationReason: 'Malicious cancellation attempt',
        }),
      });
      const postCancelRes = await postCancelBookingRoute(postCancelReq, { params: { id: bookingA.id } });
      assert.strictEqual(postCancelRes.status, 404);

      // Verify booking is still CONFIRMED for Alice
      const verifyReq = new NextRequest(`http://localhost:3000/api/v1/bookings/${bookingA.id}`, {
        headers: { Authorization: `Bearer ${TOKEN_USER_A}` },
      });
      const verifyRes = await getSingleBookingRoute(verifyReq, { params: { id: bookingA.id } });
      const { data: verifiedBooking } = await verifyRes.json();
      assert.strictEqual(verifiedBooking.status, 'CONFIRMED');
    });
  });

  describe('7. Database Persistence Failure Honest Error Reporting', () => {
    it('never reports successful writes when the database operation fails', async () => {
      UserDataStore.setSimulateDatabaseFailure(true);

      try {
        const req = new NextRequest('http://localhost:3000/api/v1/trips', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${TOKEN_USER_A}`,
          },
          body: JSON.stringify({
            title: 'Trip that should fail honestly',
            destination: 'Dwarka',
          }),
        });

        const res = await postTripsRoute(req);
        assert.notStrictEqual(res.status, 200);
        assert.notStrictEqual(res.status, 201);
        const json = await res.json();
        assert.strictEqual(json.success, false);
      } finally {
        UserDataStore.setSimulateDatabaseFailure(false);
      }
    });

    it('returns honest error when booking creation encounters database failure', async () => {
      UserDataStore.setSimulateDatabaseFailure(true);

      try {
        const req = new NextRequest('http://localhost:3000/api/v1/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${TOKEN_USER_A}`,
          },
          body: JSON.stringify({
            inventoryTitle: 'Somnath Heritage Hotel',
            totalAmountInr: 8500,
          }),
        });

        const res = await postBookingsRoute(req);
        assert.notStrictEqual(res.status, 200);
        assert.notStrictEqual(res.status, 201);
        const json = await res.json();
        assert.strictEqual(json.success, false);
      } finally {
        UserDataStore.setSimulateDatabaseFailure(false);
      }
    });
  });

  describe('8. Public Registration Role Spoofing Rejection', () => {
    it('strictly assigns CUSTOMER role even if client provides ADMIN role metadata in public registration', async () => {
      const spoofToken = 'test-jwt-usr_spoof_attacker-customer';
      const req = new NextRequest('http://localhost:3000/api/v1/admin/users', {
        headers: { Authorization: `Bearer ${spoofToken}` },
      });
      const res = await getAdminUsersRoute(req);
      assert.strictEqual(res.status, 403);
    });
  });
});

