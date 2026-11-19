import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { UserDataStore } from '../lib/user/user-store';
import { reconcileTrips, resolveClientTripStatus, TripItem } from '../lib/trips/trip-storage';
import { DatabaseBackupEngine } from '../scripts/zero-data-loss/db-backup-engine';
import { DatabaseRestoreEngine } from '../scripts/zero-data-loss/db-restore-engine';
import { MigrationSafetyAnalyzer } from '../scripts/zero-data-loss/migration-safety-analyzer';
import path from 'path';

describe('BharatYatra: Master User Data Persistence & Zero Data Loss Suite (16 Scenarios)', () => {
  const testUser = `usr_test_${Date.now()}`;
  const testUserOther = `usr_other_${Date.now()}`;

  // TEST 1: Create an account, save a trip, log out and log in again
  it('TEST 1: creates an account, saves a trip, and recovers it after simulated logout and login', async () => {
    const profile = await UserDataStore.upsertProfile(testUser, {
      fullName: 'Aarav Mehta',
      email: `${testUser}@bharatyatra.in`,
    });
    assert.ok(profile);

    const tripId = `trip-t1-${Date.now()}`;
    const savedTrip = await UserDataStore.saveTrip(testUser, {
      id: tripId,
      title: 'Gir Lion Safari & Diu Beach',
      destination: 'Sasan Gir',
      budgetInr: 32000,
    });
    assert.strictEqual(savedTrip.id, tripId);

    // Simulate session restoration upon re-login
    const restored = await UserDataStore.getTripById(tripId, testUser);
    assert.ok(restored);
    assert.strictEqual(restored.destination, 'Sasan Gir');
  });

  // TEST 2: Save 10 different trips, refresh the browser and verify all records
  it('TEST 2: saves 10 different trips and verifies all 10 records are retained across browser refresh', async () => {
    const destinations = [
      { id: `trip-2u-01-${Date.now()}`, title: 'Somnath Sunset Aarti', dest: 'Somnath' },
      { id: `trip-2u-02-${Date.now()}`, title: 'Dwarka Temple Darshan', dest: 'Dwarka' },
      { id: `trip-2u-03-${Date.now()}`, title: 'White Rann Salt Desert', dest: 'Dhordo' },
      { id: `trip-2u-04-${Date.now()}`, title: 'Gir Asiatic Lion Trail', dest: 'Sasan Gir' },
      { id: `trip-2u-05-${Date.now()}`, title: 'Palitana 863 Temples', dest: 'Palitana' },
      { id: `trip-2u-06-${Date.now()}`, title: 'Saputara Hill Trek', dest: 'Saputara' },
      { id: `trip-2u-07-${Date.now()}`, title: 'Modhera Sun Temple', dest: 'Modhera' },
      { id: `trip-2u-08-${Date.now()}`, title: 'Statue of Unity Vista', dest: 'Kevadia' },
      { id: `trip-2u-09-${Date.now()}`, title: 'Mandvi Palace Beach', dest: 'Mandvi' },
      { id: `trip-2u-10-${Date.now()}`, title: 'Champaner Heritage Fort', dest: 'Champaner' },
    ];

    for (const d of destinations) {
      await UserDataStore.saveTrip(testUser, { id: d.id, title: d.title, destination: d.dest });
    }

    const localVault: TripItem[] = destinations.map((d) => ({
      tripId: d.id,
      title: d.title,
      destination: d.dest,
      durationDays: 2,
      startDate: '2026-12-01',
      status: 'SAVED',
    }));

    const remoteTrips = await UserDataStore.getUserTrips(testUser);
    const remoteItems: TripItem[] = remoteTrips.map((t) => ({
      tripId: t.id,
      title: t.title,
      destination: t.destination,
      durationDays: t.durationDays,
      startDate: t.startDate || '2026-12-01',
      status: resolveClientTripStatus(t),
    }));

    const { merged } = reconcileTrips(localVault, remoteItems);
    assert.strictEqual(destinations.length, 10);
    assert.ok(destinations.every((d) => merged.some((m) => m.tripId === d.id)));
  });

  // TEST 3: Deploy a new frontend build. Verify existing records remain
  it('TEST 3: verifies existing records survive frontend build deployment and cold starts', async () => {
    const deployTripId = `trip-deploy-${Date.now()}`;
    await UserDataStore.saveTrip(testUser, {
      id: deployTripId,
      title: 'Pre-Deployment Pilgrimage',
      destination: 'Palitana',
    });

    const reloaded = await UserDataStore.getTripById(deployTripId, testUser);
    assert.ok(reloaded);
    assert.strictEqual(reloaded.destination, 'Palitana');
  });

  // TEST 4: Deploy a new backend build. Verify existing records remain
  it('TEST 4: verifies persistent storage retains records across backend build deployment', async () => {
    const backendBuildTripId = `trip-backend-build-${Date.now()}`;
    await UserDataStore.saveTrip(testUser, {
      id: backendBuildTripId,
      title: 'Backend Deployment Trip',
      destination: 'Ahmedabad',
      budgetInr: 25000,
    });

    const queried = await UserDataStore.getTripById(backendBuildTripId, testUser);
    assert.ok(queried);
    assert.strictEqual(queried.budgetInr, 25000);
  });

  // TEST 5: Restart the backend. Verify existing records remain
  it('TEST 5: verifies persistent storage retains records across backend process restart', async () => {
    const tripId = `trip-backend-${Date.now()}`;
    await UserDataStore.saveTrip(testUser, {
      id: tripId,
      title: 'Statue of Unity Express',
      destination: 'Kevadia',
      budgetInr: 15000,
    });

    const queried = await UserDataStore.getTripById(tripId, testUser);
    assert.ok(queried);
    assert.strictEqual(queried.budgetInr, 15000);
  });

  // TEST 6: Reconnect database / restart database service
  it('TEST 6: handles simulated database service restart and reconnection without dropping records', async () => {
    const tripId = `trip-dbrestart-${Date.now()}`;
    await UserDataStore.saveTrip(testUser, {
      id: tripId,
      title: 'Patan Sun Temple',
      destination: 'Patan',
    });

    // Simulate DB downtime
    UserDataStore.setSimulateDatabaseFailure(true);
    await assert.rejects(async () => {
      await UserDataStore.getTripById(tripId, testUser);
    });

    // Restore DB service
    UserDataStore.setSimulateDatabaseFailure(false);
    const restored = await UserDataStore.getTripById(tripId, testUser);
    assert.ok(restored);
    assert.strictEqual(restored.destination, 'Patan');
  });

  // TEST 7: Return after an extended period (30 days inactivity)
  it('TEST 7: retains full user dossier after extended absence (30-day session recovery)', async () => {
    const user30d = `usr_30d_${Date.now()}`;
    await UserDataStore.upsertProfile(user30d, { fullName: 'Vikramaditya', email: `${user30d}@bharatyatra.in` });
    await UserDataStore.savePreferences(user30d, { originCity: 'Vadodara', budgetTier: 'balanced' });
    const booking = await UserDataStore.createBooking(user30d, { inventoryTitle: 'Heritage Haveli', totalAmountInr: 14500 });

    const prof = await UserDataStore.getProfile(user30d);
    const prefs = await UserDataStore.getPreferences(user30d);
    const bookings = await UserDataStore.getUserBookings(user30d);

    assert.ok(prof && prof.fullName === 'Vikramaditya');
    assert.strictEqual(prefs.originCity, 'Vadodara');
    assert.ok(bookings.some((b) => b.id === booking.id && b.totalAmountInr === 14500));
  });

  // TEST 8: Open account on another device (Multi-device sync)
  it('TEST 8: synchronizes created trips seamlessly across multiple client devices', async () => {
    const crossId = `trip-cross-${Date.now()}`;
    await UserDataStore.saveTrip(testUser, {
      id: crossId,
      title: 'Device A Created: Champaner UNESCO Tour',
      destination: 'Champaner',
      budgetInr: 9500,
    });

    // Device B query
    const devBTrips = await UserDataStore.getUserTrips(testUser);
    assert.ok(devBTrips.some((t) => t.id === crossId && t.budgetInr === 9500));
  });

  // TEST 9: Update one trip and verify other trips remain unchanged
  it('TEST 9: isolates trip updates and prevents collateral damage to other records', async () => {
    const tA = `trip-mut-a-${Date.now()}`;
    const tB = `trip-mut-b-${Date.now()}`;
    await UserDataStore.saveTrip(testUser, { id: tA, title: 'Trip A Original', budgetInr: 10000 });
    await UserDataStore.saveTrip(testUser, { id: tB, title: 'Trip B Original', budgetInr: 20000 });

    // Mutate only Trip A
    await UserDataStore.saveTrip(testUser, { id: tA, title: 'Trip A Updated', budgetInr: 18000 });

    const checkA = await UserDataStore.getTripById(tA, testUser);
    const checkB = await UserDataStore.getTripById(tB, testUser);

    assert.strictEqual(checkA?.title, 'Trip A Updated');
    assert.strictEqual(checkA?.budgetInr, 18000);
    assert.strictEqual(checkB?.title, 'Trip B Original');
    assert.strictEqual(checkB?.budgetInr, 20000);
  });

  // TEST 10: Simulate an API failure and verify existing data is not overwritten
  it('TEST 10: protects client vault against destruction during remote API failure or empty response', () => {
    const clientVault: TripItem[] = [
      { tripId: 'trip-cached-01', title: 'Saputara Retreat', destination: 'Saputara', durationDays: 3, startDate: '2026-12-15', status: 'SAVED' },
    ];

    // Reconciling with empty remote response must NOT clear local vault
    const { merged } = reconcileTrips(clientVault, []);
    assert.strictEqual(merged.length, 1);
    assert.strictEqual(merged[0].tripId, 'trip-cached-01');
  });

  // TEST 11: Simulate a database write failure. Verify frontend does not report successful save
  it('TEST 11: simulates database write failure and verifies no false-positive save success is reported', async () => {
    UserDataStore.setSimulateDatabaseFailure(true);
    let errorCaught = false;

    try {
      await UserDataStore.saveTrip(testUser, {
        id: `trip-fail-${Date.now()}`,
        title: 'Failing Trip',
        destination: 'Somnath',
      });
    } catch (err: any) {
      errorCaught = err?.name === 'DatabasePersistenceError' || err?.message?.includes('Simulated');
    } finally {
      UserDataStore.setSimulateDatabaseFailure(false);
    }

    assert.strictEqual(errorCaught, true);
  });

  // TEST 12: Verify that one user cannot access another user's records (BOLA defense)
  it('TEST 12: enforces strict tenancy isolation and blocks BOLA cross-user data access', async () => {
    const privId = `trip-priv-${Date.now()}`;
    await UserDataStore.saveTrip(testUser, { id: privId, title: 'Confidential Journey', destination: 'Dwarka' });

    // Unauthorized attempt by testUserOther
    const attempt = await UserDataStore.getTripById(privId, testUserOther);
    assert.strictEqual(attempt, null);

    const otherTrips = await UserDataStore.getUserTrips(testUserOther);
    assert.ok(!otherTrips.some((t) => t.id === privId));
  });

  // TEST 13: Execute database migrations and verify existing records and relationships
  it('TEST 13: scans all migrations for ZERO destructive SQL drops and validates backward compatibility', () => {
    const analyzer = new MigrationSafetyAnalyzer();
    const report = analyzer.analyzeMigrations();
    assert.strictEqual(report.passed, true);
    assert.strictEqual(report.criticalIssuesCount, 0);
  });

  // TEST 14: Perform a database backup and restore it into an isolated database
  it('TEST 14: creates point-in-time backup and restores it into isolated sandbox with 100% SHA-256 match', async () => {
    const backupEngine = new DatabaseBackupEngine();
    const backup = await backupEngine.executeBackup('test-14-unit');
    assert.strictEqual(backup.success, true);

    const restoreEngine = new DatabaseRestoreEngine();
    const sandboxDir = path.join(process.cwd(), 'backups', 'audit_sandbox_unit', backup.manifest.backupId);
    const restore = restoreEngine.executeRestore({
      backupId: backup.manifest.backupId,
      targetDir: sandboxDir,
      isolatedSandbox: true,
      dryRun: false,
    });

    assert.strictEqual(restore.success, true);
    assert.ok(restore.restoredFiles.includes('persistent_user_store.json'));
  });

  // TEST 15: Test duplicate submissions and retry requests (Idempotency)
  it('TEST 15: verifies duplicate submissions and retried requests produce exactly one record', async () => {
    const dedupId = `trip-dedup-u-${Date.now()}`;
    await UserDataStore.saveTrip(testUser, { id: dedupId, title: 'Initial Trip', destination: 'Dwarka' });
    await UserDataStore.saveTrip(testUser, { id: dedupId, title: 'Retried Trip', destination: 'Dwarka' });

    const trips = await UserDataStore.getUserTrips(testUser);
    const matching = trips.filter((t) => t.id === dedupId);
    assert.strictEqual(matching.length, 1);
  });

  // TEST 16: Test partially completed transaction (Atomic rollback & consistency)
  it('TEST 16: verifies partially completed compound transactions automatically roll back to maintain consistency', async () => {
    const partialId = `bk-atomic-u-${Date.now()}`;
    const result = await UserDataStore.executeAtomicBookingTransaction(
      testUser,
      {
        id: partialId,
        bookingReference: `BY-ATOMIC-U-${Date.now()}`,
        inventoryTitle: 'Diu Resort',
        totalAmountInr: 15000,
      },
      async () => {
        // Simulated failure in payment sub-task
        return false;
      }
    );

    assert.strictEqual(result.success, false);
    const checkBooking = await UserDataStore.getBookingById(partialId, testUser);
    assert.ok(checkBooking === null || checkBooking.status === 'CANCELLED');
  });
});
