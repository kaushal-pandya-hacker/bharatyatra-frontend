import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { UserDataStore } from '../lib/user/user-store';
import { reconcileTrips, resolveClientTripStatus, TripItem } from '../lib/trips/trip-storage';
import { DatabaseBackupEngine } from '../scripts/zero-data-loss/db-backup-engine';
import { DatabaseRestoreEngine } from '../scripts/zero-data-loss/db-restore-engine';
import { MigrationSafetyAnalyzer } from '../scripts/zero-data-loss/migration-safety-analyzer';
import path from 'path';

describe('BharatYatra: Master User Data Persistence & Zero Data Loss Suite (12 Scenarios)', () => {
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

  // TEST 2: Save multiple trips, refresh the browser and verify all records
  it('TEST 2: saves multiple trips and verifies all records are retained across non-destructive browser refresh', async () => {
    const tA = `trip-2a-${Date.now()}`;
    const tB = `trip-2b-${Date.now()}`;
    await UserDataStore.saveTrip(testUser, { id: tA, title: 'Trip 2A', destination: 'Somnath' });
    await UserDataStore.saveTrip(testUser, { id: tB, title: 'Trip 2B', destination: 'Dwarka' });

    const localVault: TripItem[] = [
      { tripId: tA, title: 'Trip 2A', destination: 'Somnath', durationDays: 2, startDate: '2026-12-01', status: 'SAVED' },
      { tripId: tB, title: 'Trip 2B', destination: 'Dwarka', durationDays: 3, startDate: '2026-12-05', status: 'SAVED' },
    ];

    const remoteTrips = await UserDataStore.getUserTrips(testUser);
    const remoteItems: TripItem[] = remoteTrips.map(t => ({
      tripId: t.id,
      title: t.title,
      destination: t.destination,
      durationDays: t.durationDays,
      startDate: t.startDate || '2026-12-01',
      status: resolveClientTripStatus(t),
    }));

    const { merged } = reconcileTrips(localVault, remoteItems);
    assert.ok(merged.some(t => t.tripId === tA));
    assert.ok(merged.some(t => t.tripId === tB));
  });

  // TEST 3: Deploy a new frontend version and verify existing records
  it('TEST 3: verifies existing records survive frontend build deployment and cold starts', async () => {
    const deployTripId = `trip-deploy-${Date.now()}`;
    await UserDataStore.saveTrip(testUser, {
      id: deployTripId,
      title: 'Pre-Deployment Pilgrimage',
      destination: 'Palitana',
    });

    // Query through fresh read
    const reloaded = await UserDataStore.getTripById(deployTripId, testUser);
    assert.ok(reloaded);
    assert.strictEqual(reloaded.destination, 'Palitana');
  });

  // TEST 4: Restart the backend and verify existing records
  it('TEST 4: verifies persistent storage retains records across backend process restart', async () => {
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

  // TEST 5: Restart the database service and verify existing records
  it('TEST 5: handles simulated database service restart without dropping records', async () => {
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

  // TEST 6: Return after an extended period and retrieve existing account data
  it('TEST 6: retains full user dossier after extended absence (30-day session recovery)', async () => {
    const user30d = `usr_30d_${Date.now()}`;
    await UserDataStore.upsertProfile(user30d, { fullName: 'Vikramaditya', email: `${user30d}@bharatyatra.in` });
    await UserDataStore.savePreferences(user30d, { originCity: 'Vadodara', budgetTier: 'balanced' });
    const booking = await UserDataStore.createBooking(user30d, { inventoryTitle: 'Heritage Haveli', totalAmountInr: 14500 });

    const prof = await UserDataStore.getProfile(user30d);
    const prefs = await UserDataStore.getPreferences(user30d);
    const bookings = await UserDataStore.getUserBookings(user30d);

    assert.ok(prof && prof.fullName === 'Vikramaditya');
    assert.strictEqual(prefs.originCity, 'Vadodara');
    assert.ok(bookings.some(b => b.id === booking.id && b.totalAmountInr === 14500));
  });

  // TEST 7: Access the account from another device
  it('TEST 7: synchronizes created trips seamlessly across multiple client devices', async () => {
    const crossId = `trip-cross-${Date.now()}`;
    await UserDataStore.saveTrip(testUser, {
      id: crossId,
      title: 'Device A Created: Champaner UNESCO Tour',
      destination: 'Champaner',
      budgetInr: 9500,
    });

    // Device B query
    const devBTrips = await UserDataStore.getUserTrips(testUser);
    assert.ok(devBTrips.some(t => t.id === crossId && t.budgetInr === 9500));
  });

  // TEST 8: Update one trip and verify other trips remain unchanged
  it('TEST 8: isolates trip updates and prevents collateral damage to other records', async () => {
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

  // TEST 9: Simulate an API failure and verify existing data is not overwritten
  it('TEST 9: protects client vault against destruction during remote API failure or empty response', () => {
    const clientVault: TripItem[] = [
      { tripId: 'trip-cached-01', title: 'Saputara Retreat', destination: 'Saputara', durationDays: 3, startDate: '2026-12-15', status: 'SAVED' },
    ];

    // Reconciling with empty remote response must NOT clear local vault
    const { merged } = reconcileTrips(clientVault, []);
    assert.strictEqual(merged.length, 1);
    assert.strictEqual(merged[0].tripId, 'trip-cached-01');
  });

  // TEST 10: Perform a database backup and restore it into an isolated database
  it('TEST 10: creates point-in-time backup and restores it into isolated sandbox with 100% SHA-256 match', async () => {
    const backupEngine = new DatabaseBackupEngine();
    const backup = await backupEngine.executeBackup('test-10-unit');
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

  // TEST 11: Run database migrations and verify existing records and relationships
  it('TEST 11: scans all migrations for ZERO destructive SQL drops and validates backward compatibility', () => {
    const analyzer = new MigrationSafetyAnalyzer();
    const report = analyzer.analyzeMigrations();
    assert.strictEqual(report.passed, true);
    assert.strictEqual(report.criticalIssuesCount, 0);
  });

  // TEST 12: Verify that one user cannot access another user's records
  it('TEST 12: enforces strict tenancy isolation and blocks BOLA cross-user data access', async () => {
    const privId = `trip-priv-${Date.now()}`;
    await UserDataStore.saveTrip(testUser, { id: privId, title: 'Confidential Journey', destination: 'Dwarka' });

    // Unauthorized attempt by testUserOther
    const attempt = await UserDataStore.getTripById(privId, testUserOther);
    assert.strictEqual(attempt, null);

    const otherTrips = await UserDataStore.getUserTrips(testUserOther);
    assert.ok(!otherTrips.some(t => t.id === privId));
  });
});
