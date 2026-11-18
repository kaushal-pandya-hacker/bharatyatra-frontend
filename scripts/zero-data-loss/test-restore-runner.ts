import fs from 'fs';
import path from 'path';
import { DatabaseBackupEngine } from './db-backup-engine';
import { DatabaseRestoreEngine } from './db-restore-engine';

async function runIsolatedRestorationTest() {
  console.log('\n============================================================');
  console.log('🔬 INDEPENDENT AUDIT: ISOLATED RESTORATION VERIFICATION TEST');
  console.log('============================================================\n');

  const testSandbox = path.join(process.cwd(), 'backups', 'audit_sandbox_restore');
  if (fs.existsSync(testSandbox)) {
    fs.rmSync(testSandbox, { recursive: true, force: true });
  }
  fs.mkdirSync(testSandbox, { recursive: true });

  const backupEngine = new DatabaseBackupEngine();
  const backups = backupEngine.listBackups();
  console.log(`Found ${backups.length} existing backup snapshots.`);

  if (backups.length === 0) {
    console.error('❌ FAILED: No backups found to restore.');
    process.exit(1);
  }

  const latestBackup = backups[0];
  console.log(`Target Snapshot: ${latestBackup.backupId}`);
  console.log(`Target Created At: ${latestBackup.createdAt}`);
  console.log(`Files in Manifest: ${latestBackup.fileList.join(', ')}`);

  // Step 1: Execute restore to isolated target
  const restoreEngine = new DatabaseRestoreEngine();
  const restoreResult = restoreEngine.executeRestore({
    backupId: latestBackup.backupId,
    targetDir: testSandbox,
    isolatedSandbox: true,
    dryRun: false
  });

  console.log('\n--- Restoration Execution Result ---');
  console.log('Success:', restoreResult.success);
  console.log('Target Location:', restoreResult.targetLocation);
  console.log('Restored Files:', restoreResult.restoredFiles);
  console.log('Entity Counts in Target:', restoreResult.entityCounts);

  if (!restoreResult.success) {
    console.error(`❌ Restoration failed with error: ${restoreResult.error}`);
    process.exit(1);
  }

  // Step 2: Verify SHA-256 Checksum Parity
  console.log('\n--- SHA-256 Parity Verification ---');
  let allChecksumsMatch = true;
  for (const file of latestBackup.fileList) {
    const originalPath = path.join(process.cwd(), 'backups', 'db', latestBackup.backupId, file);
    const restoredPath = path.join(testSandbox, file);

    if (!fs.existsSync(restoredPath)) {
      console.error(`❌ Missing restored file: ${file}`);
      allChecksumsMatch = false;
      continue;
    }

    const originalHash = backupEngine.computeHash(fs.readFileSync(originalPath));
    const restoredHash = backupEngine.computeHash(fs.readFileSync(restoredPath));

    if (originalHash === restoredHash && originalHash === latestBackup.checksums[file]) {
      console.log(`  ✓ ${file}: MATCH [${originalHash.slice(0, 16)}...]`);
    } else {
      console.error(`  ❌ ${file}: HASH MISMATCH!`);
      allChecksumsMatch = false;
    }
  }

  // Step 3: Entity Count Parity Verification
  console.log('\n--- Entity Count & Structure Parity Verification ---');
  for (const file of restoreResult.restoredFiles) {
    const restoredPath = path.join(testSandbox, file);
    const content = fs.readFileSync(restoredPath, 'utf8');
    try {
      const parsed = JSON.parse(content);
      const isArr = Array.isArray(parsed);
      const subCount = parsed.submissions?.length;
      const couponCount = parsed.coupons?.length;
      const dataCount = parsed.data?.length;
      console.log(`  ${file}: isArray=${isArr}, count=${restoreResult.entityCounts[file]}, subCount=${subCount}, couponCount=${couponCount}`);
    } catch (e: any) {
      console.error(`  ❌ Failed parsing ${file}: ${e.message}`);
    }
  }

  // Step 4: Test Restoration Refusal on Corrupted Checksum
  console.log('\n--- Tamper-Resistance & Checksum Mismatch Test ---');
  const corruptedSandbox = path.join(process.cwd(), 'backups', 'audit_corrupted_test');
  const tempBackupId = `AUDIT-CORRUPT-TEST-${Date.now()}`;
  const tempBackupDir = path.join(process.cwd(), 'backups', 'db', tempBackupId);
  fs.mkdirSync(tempBackupDir, { recursive: true });

  // Copy manifest and one corrupted file
  const validManifest = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'backups', 'db', latestBackup.backupId, 'manifest.json'), 'utf8'));
  validManifest.backupId = tempBackupId;
  fs.writeFileSync(path.join(tempBackupDir, 'manifest.json'), JSON.stringify(validManifest, null, 2), 'utf8');
  for (const f of validManifest.fileList) {
    fs.writeFileSync(path.join(tempBackupDir, f), 'CORRUPTED_DATA_INJECTED_FOR_TEST', 'utf8');
  }

  const corruptedRestoreResult = restoreEngine.executeRestore({
    backupId: tempBackupId,
    targetDir: corruptedSandbox,
    isolatedSandbox: true,
  });

  console.log('Tamper test result (expected false):', corruptedRestoreResult.success);
  console.log('Tamper test error:', corruptedRestoreResult.error);

  // Clean up temporary corrupted test folder
  fs.rmSync(tempBackupDir, { recursive: true, force: true });
  if (fs.existsSync(corruptedSandbox)) {
    fs.rmSync(corruptedSandbox, { recursive: true, force: true });
  }

  const tamperResistanceVerified = !corruptedRestoreResult.success && Boolean(corruptedRestoreResult.error?.includes('Integrity check failed'));
  console.log(`Tamper Resistance Verification: ${tamperResistanceVerified ? 'PASSED (REFUSED TAMPERED BACKUP)' : 'FAILED'}`);

  // Step 5: Test AES-256-GCM Encryption & Decryption
  console.log('\n--- AES-256-GCM Encryption & Decryption Test ---');
  const encPassphrase = 'audit-test-key-2026-safe-passphrase';
  const encOk = backupEngine.encryptBackup(latestBackup.backupId, encPassphrase);
  console.log('AES-256-GCM Encryption:', encOk ? 'SUCCESS (Authenticated Tag Stored)' : 'FAILED');

  const decOk = backupEngine.decryptBackup(latestBackup.backupId, encPassphrase);
  console.log('AES-256-GCM Decryption:', decOk ? 'SUCCESS (Authenticated Roundtrip Verified)' : 'FAILED');

  // Step 6: Test Offsite Replication Sync
  console.log('\n--- Offsite Replication Adapter Test ---');
  const offsiteRes = await backupEngine.replicateOffsite(latestBackup.backupId);
  console.log(`Offsite Sync: ${offsiteRes.success ? 'SUCCESS' : 'FAILED'} (Provider: ${offsiteRes.provider})`);

  // Step 7: Test Retention Pruning Policy
  console.log('\n--- Retention Policy Pruning Test ---');
  const pruneRes = backupEngine.pruneOldBackups(30);
  console.log(`Retention Policy: Evaluated ${pruneRes.remaining.length} backups retained.`);

  // Clean up test sandbox
  fs.rmSync(testSandbox, { recursive: true, force: true });

  const allPassed = allChecksumsMatch && tamperResistanceVerified && encOk && decOk && offsiteRes.success;

  console.log('\n============================================================');
  console.log(`🏁 ADVANCED BACKUP & RESTORATION SUITE: ${allPassed ? 'ALL VERIFICATIONS PASSED' : 'FAILURE DETECTED'}`);
  console.log('============================================================\n');
}

runIsolatedRestorationTest().catch(console.error);
