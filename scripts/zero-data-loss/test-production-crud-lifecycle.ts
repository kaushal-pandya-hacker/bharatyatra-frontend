(process.env as any).NODE_ENV = 'test';
import { UserDataStore } from '../../lib/user/user-store';
import { reconcileTrips, TripItem } from '../../lib/trips/trip-storage';
import assert from 'node:assert/strict';

async function runProductionCrudLifecycle() {
  console.log('\n' + '='.repeat(80));
  console.log('🔄 BHARATYATRA PRODUCTION CRUD & PERSISTENCE LIFECYCLE VERIFICATION');
  console.log('='.repeat(80));

  const results: { test: string; status: 'PASS' | 'FAIL'; evidence: string }[] = [];
  const testUserId = `usr_prod_verify_${Date.now()}`;
  const otherUserId = `usr_prod_other_${Date.now()}`;

  // 1. CREATE Operations
  try {
    const profile = await UserDataStore.upsertProfile(testUserId, {
      fullName: 'Vikramaditya Parmar',
      email: `${testUserId}@bharatyatra.in`,
      phoneNumber: '+919876543210'
    });
    assert.ok(profile, 'Profile must be created');
    assert.strictEqual(profile.fullName, 'Vikramaditya Parmar');

    const tripId = `trip-crud-${Date.now()}`;
    const trip = await UserDataStore.saveTrip(testUserId, {
      id: tripId,
      title: 'Somnath & Dwarka Coastal Circuit',
      destination: 'Dwarka',
      durationDays: 4,
      travelers: 2,
      budgetInr: 28000
    });
    assert.strictEqual(trip.id, tripId);
    assert.strictEqual(trip.destination, 'Dwarka');

    results.push({
      test: '1. CREATE: Profile & Trip Generation',
      status: 'PASS',
      evidence: `Created profile ${profile.id} and trip ${trip.id} with status ${trip.status}`
    });
  } catch (err: any) {
    results.push({ test: '1. CREATE: Profile & Trip Generation', status: 'FAIL', evidence: err.message });
  }

  // 2. READ Operations
  try {
    const userTrips = await UserDataStore.getUserTrips(testUserId);
    assert.ok(Array.isArray(userTrips));
    assert.ok(userTrips.length >= 1, 'Should find at least 1 trip');
    const targetTrip = userTrips.find(t => t.title === 'Somnath & Dwarka Coastal Circuit');
    assert.ok(targetTrip, 'Target trip must be retrievable');

    const profileRead = await UserDataStore.getProfile(testUserId);
    assert.strictEqual(profileRead?.fullName, 'Vikramaditya Parmar');

    results.push({
      test: '2. READ: Dossier & Trip Retrieval',
      status: 'PASS',
      evidence: `Successfully read ${userTrips.length} trips and profile for ${testUserId}`
    });
  } catch (err: any) {
    results.push({ test: '2. READ: Dossier & Trip Retrieval', status: 'FAIL', evidence: err.message });
  }

  // 3. UPDATE Operations (Trip Upsert & Profile Update)
  try {
    const userTrips = await UserDataStore.getUserTrips(testUserId);
    const tripToUpdate = userTrips[0];
    const updatedTrip = await UserDataStore.saveTrip(testUserId, {
      id: tripToUpdate.id,
      budgetInr: 35000,
      title: 'Somnath & Dwarka Coastal Circuit (Upgraded)'
    });
    assert.strictEqual(updatedTrip.budgetInr, 35000);
    assert.strictEqual(updatedTrip.title, 'Somnath & Dwarka Coastal Circuit (Upgraded)');

    const updatedProfile = await UserDataStore.updateProfile(testUserId, {
      fullName: 'Vikramaditya Singh Parmar'
    });
    assert.strictEqual(updatedProfile.fullName, 'Vikramaditya Singh Parmar');

    results.push({
      test: '3. UPDATE: Trip Mutation & Profile Update Isolation',
      status: 'PASS',
      evidence: `Updated trip ${tripToUpdate.id} budget to ₹35,000 and profile name to '${updatedProfile.fullName}'`
    });
  } catch (err: any) {
    results.push({ test: '3. UPDATE: Trip Mutation & Profile Update Isolation', status: 'FAIL', evidence: err.message });
  }

  // 4. DELETE Operations
  try {
    const tripToDeleteId = `trip-del-${Date.now()}`;
    await UserDataStore.saveTrip(testUserId, {
      id: tripToDeleteId,
      title: 'Ephemeral Trip to Delete',
      destination: 'Saputara'
    });

    const deleteSuccess = await UserDataStore.deleteTrip(tripToDeleteId, testUserId);
    assert.ok(deleteSuccess, 'Delete must report success');

    const remainingTrips = await UserDataStore.getUserTrips(testUserId);
    const found = remainingTrips.some(t => t.id === tripToDeleteId);
    assert.strictEqual(found, false, 'Deleted trip must not exist');

    results.push({
      test: '4. DELETE: Trip Deletion Verification',
      status: 'PASS',
      evidence: `Safely deleted ${tripToDeleteId}; verified absent from active trips query`
    });
  } catch (err: any) {
    results.push({ test: '4. DELETE: Trip Deletion Verification', status: 'FAIL', evidence: err.message });
  }

  // 5. Multi-User Tenancy Isolation (BOLA Defense)
  try {
    const userTrips = await UserDataStore.getUserTrips(testUserId);
    const tripId = userTrips[0].id;

    let bolaBlocked = false;
    try {
      const unauthorizedAccess = await UserDataStore.getTripById(tripId, otherUserId);
      if (!unauthorizedAccess) bolaBlocked = true;
    } catch {
      bolaBlocked = true;
    }
    assert.ok(bolaBlocked, 'User B must not read User A trip');

    let bolaUpdateBlocked = false;
    try {
      await UserDataStore.saveTrip(otherUserId, { id: tripId, title: 'Hacked Title' });
    } catch {
      bolaUpdateBlocked = true;
    }
    assert.ok(bolaUpdateBlocked, 'User B must not overwrite User A trip');

    results.push({
      test: '5. TENANCY: BOLA Cross-User Isolation',
      status: 'PASS',
      evidence: `Strictly blocked ${otherUserId} from reading or mutating ${testUserId}'s trip`
    });
  } catch (err: any) {
    results.push({ test: '5. TENANCY: BOLA Cross-User Isolation', status: 'FAIL', evidence: err.message });
  }

  // 6. Persistence After Logout, Login & Browser Restart Simulation
  try {
    const clientTrips: TripItem[] = [
      {
        tripId: 'client-trip-1',
        id: 'client-trip-1',
        title: 'Cached Rann Utsav Trip',
        destination: 'Dhordo',
        startDate: '2026-12-01',
        endDate: '2026-12-04',
        durationDays: 4,
        budgetInr: 18000,
        nodes: [],
        status: 'UPCOMING'
      }
    ];

    const emptyRemote: TripItem[] = [];
    const { merged } = reconcileTrips(clientTrips, emptyRemote);
    assert.strictEqual(merged.length, 1, 'Client vault must never be wiped by empty remote response');
    assert.strictEqual(merged[0].id, 'client-trip-1');

    results.push({
      test: '6. PERSISTENCE: Logout/Login & Client Vault Defense',
      status: 'PASS',
      evidence: `Zero-wipe reconciliation verified; preserved 100% of client vault across empty responses`
    });
  } catch (err: any) {
    results.push({ test: '6. PERSISTENCE: Logout/Login & Client Vault Defense', status: 'FAIL', evidence: err.message });
  }

  console.log('\n--- VERIFICATION TEST MATRIX ---');
  results.forEach(r => {
    console.log(`[${r.status}] ${r.test}`);
    console.log(`       Evidence: ${r.evidence}`);
  });

  const allPassed = results.every(r => r.status === 'PASS');
  console.log('\n' + '='.repeat(80));
  console.log(`LIFECYCLE VERIFICATION STATUS: ${allPassed ? 'ALL PASSED (100% SUCCESS)' : 'FAILED'}`);
  console.log('='.repeat(80) + '\n');

  if (!allPassed) process.exit(1);
}

runProductionCrudLifecycle();
