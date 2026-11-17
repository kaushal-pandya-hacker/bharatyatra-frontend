# BHARATYATRA — DATABASE BACKUP & RESTORATION RUNBOOK

**Classification:** Critical Disaster Recovery & Zero Data Loss Protocol  
**Authority:** Principal Software Architect, Database Administrator & DevOps Team  
**System Target:** Production Datastore (`https://www.bharatyatra.in`) & Supabase PostgreSQL  

---

## 1. Overview & Restoration Principles
This runbook governs the disaster recovery, point-in-time restoration, and recovery operations for BharatYatra.

### Non-Negotiable Rules:
1. **Never perform destructive restorations:** Restorations must restore missing data additively without truncating uncorrupted tables.
2. **Never restore without integrity verification:** A backup snapshot must pass SHA-256 checksum validation before restoration begins.
3. **Mandatory Sandbox Test:** Restorations must first be dry-run and tested in an isolated sandbox environment before applying to live systems.

---

## 2. Automated Backup Architecture
Backups are automatically taken:
- Before every production deployment via `npm run verify:deployment`.
- Nightly via scheduled maintenance cron.
- On-demand via `npm run db:backup`.

Snapshots are stored in:
`backups/db/BKP-YYYYMMDD-HHMMSS-<label>/`

Each snapshot contains:
- `manifest.json`: Snapshot metadata, entity record counts, and SHA-256 hashes of every file.
- Individual JSON entity exports and PostgreSQL table dumps.

---

## 3. Step-by-Step Recovery Procedure

### Step 1: List and Inspect Available Snapshots
```bash
npx tsx -e "
import { DatabaseBackupEngine } from './scripts/zero-data-loss/db-backup-engine';
const engine = new DatabaseBackupEngine();
console.table(engine.listBackups().map(b => ({
  ID: b.backupId,
  Created: b.createdAt,
  Verified: b.integrityVerified,
  TotalEntities: b.totalEntities
})));
"
```

### Step 2: Verify Checksum Integrity of the Selected Snapshot
```bash
npx tsx -e "
import { DatabaseBackupEngine } from './scripts/zero-data-loss/db-backup-engine';
const engine = new DatabaseBackupEngine();
const isValid = engine.verifyBackupIntegrity('<BACKUP_ID>');
console.log('Integrity Check:', isValid ? 'PASS (SHA-256 VERIFIED)' : 'FAIL (CHECKSUM CORRUPTED)');
if (!isValid) process.exit(1);
"
```

### Step 3: Test Restoration in an Isolated Sandbox
Perform a simulated sandbox restoration to ensure all entity counts match without affecting live data:
```bash
npx tsx -e "
import { DatabaseRestoreEngine } from './scripts/zero-data-loss/db-restore-engine';
const engine = new DatabaseRestoreEngine();
const result = engine.executeRestore({
  backupId: '<BACKUP_ID>',
  isolatedSandbox: true,
  dryRun: false
});
console.log('Sandbox Restore Result:', result);
"
```

### Step 4: Validate Restored Sandboxpar Entity Parity
Check that user counts, trip counts, bookings, contributions, and rewards are 100% accounted for:
```bash
npx tsx -e "
import { DataIntegrityMonitor } from './scripts/zero-data-loss/data-integrity-monitor';
const monitor = new DataIntegrityMonitor('backups/sandbox-restore/<BACKUP_ID>');
const audit = monitor.runAudit();
console.log('Sandbox Audit Result:', audit.summary);
"
```

### Step 5: Execute Controlled Live Restoration
Once the sandbox restoration is verified, apply the restored snapshot to the active data layer:
```bash
npx tsx -e "
import { DatabaseRestoreEngine } from './scripts/zero-data-loss/db-restore-engine';
const engine = new DatabaseRestoreEngine();
const result = engine.executeRestore({
  backupId: '<BACKUP_ID>',
  isolatedSandbox: false,
  dryRun: false
});
console.log('Production Restore Result:', result.success ? 'RESTORED SUCCESSFULLY' : 'FAILED');
"
```

### Step 6: Post-Restoration System Verification
1. Run `npm run db:integrity-check` to verify live record counts.
2. Verify customer login and booking history in `/dashboard`.
3. Verify admin panel accessibility in `/admin`.
4. Document the restoration incident in the security audit log.
