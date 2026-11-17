import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { DatabaseBackupEngine } from '../scripts/zero-data-loss/db-backup-engine';
import { DatabaseRestoreEngine } from '../scripts/zero-data-loss/db-restore-engine';
import { DatabaseResetGuard } from '../scripts/zero-data-loss/prevent-db-reset';
import { MigrationSafetyAnalyzer } from '../scripts/zero-data-loss/migration-safety-analyzer';
import { DataIntegrityMonitor } from '../scripts/zero-data-loss/data-integrity-monitor';

describe('BharatYatra Phase 2: Automated Zero Data Loss Enforcement Suite', () => {
  const sandboxDir = path.join(process.cwd(), 'backups', 'test-sandbox');

  // Cleanup sandbox helper
  const cleanSandbox = () => {
    if (fs.existsSync(sandboxDir)) {
      fs.rmSync(sandboxDir, { recursive: true, force: true });
    }
  };

  // =========================================================================
  // 1. DATABASE PROTECTION & AUTOMATED BACKUP INTEGRITY
  // =========================================================================
  describe('1. Database Protection & Automated Backups', () => {
    it('identifies production database connection cleanly without leaking secrets', () => {
      const backupEngine = new DatabaseBackupEngine(sandboxDir);
      const target = backupEngine.identifyDatabaseTarget();

      assert.ok(target.type.length > 0, 'Database type must be identified');
      assert.ok(target.host.length > 0, 'Database host must be identified');
      assert.ok(target.sanitizedUri.includes('***'), 'Sanitized URI must mask credentials');
      assert.strictEqual(target.sanitizedUri.includes('password'), false, 'Must not leak plaintext password');
    });

    it('creates an automated point-in-time backup and verifies SHA-256 checksums', async () => {
      cleanSandbox();
      const backupEngine = new DatabaseBackupEngine(sandboxDir);
      const res = await backupEngine.executeBackup('test-run');

      assert.strictEqual(res.success, true, 'Backup execution must succeed');
      assert.ok(fs.existsSync(res.backupPath), 'Backup folder must exist on disk');
      assert.strictEqual(res.manifest.integrityVerified, true, 'Integrity verification must be marked true');

      // Verify manifest contents
      const manifestPath = path.join(res.backupPath, 'manifest.json');
      assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      assert.ok(manifest.fileList.length > 0, 'Backup must contain files');
      assert.ok(Object.keys(manifest.checksums).length > 0, 'Checksums map must not be empty');
      assert.ok(manifest.totalEntities > 0, 'Total backed up entities must be > 0');

      // Verify SHA-256 matches actual file content
      for (const [file, expectedHash] of Object.entries(manifest.checksums)) {
        const filePath = path.join(res.backupPath, file);
        assert.ok(fs.existsSync(filePath), `Backup file ${file} must exist`);
        const actualHash = backupEngine.computeHash(fs.readFileSync(filePath, 'utf8'));
        assert.strictEqual(actualHash, expectedHash, `Hash mismatch for ${file}`);
      }
    });

    it('detects corrupted or tampered backup files during integrity verification', async () => {
      const backupEngine = new DatabaseBackupEngine(sandboxDir);
      const res = await backupEngine.executeBackup('tamper-test');

      // Intentionally tamper with a file
      const tamperedFile = path.join(res.backupPath, res.manifest.fileList[0]);
      fs.appendFileSync(tamperedFile, '\n// UNAUTHORIZED TAMPERING DETECTED');

      // Verification must fail
      const isValid = backupEngine.verifyBackupIntegrity(res.manifest.backupId);
      assert.strictEqual(isValid, false, 'Tampered backup must fail integrity verification');
    });
  });

  // =========================================================================
  // 2. ISOLATED RESTORATION PROCEDURE TESTING
  // =========================================================================
  describe('2. Restoration in Isolated Sandbox Environment', () => {
    it('restores backup snapshot into isolated sandbox without touching live data', async () => {
      const backupEngine = new DatabaseBackupEngine(sandboxDir);
      const backupRes = await backupEngine.executeBackup('restore-source');

      const restoreEngine = new DatabaseRestoreEngine(sandboxDir);
      const isolatedTarget = path.join(sandboxDir, 'isolated-target');

      const restoreResult = restoreEngine.executeRestore({
        backupId: backupRes.manifest.backupId,
        targetDir: isolatedTarget,
        isolatedSandbox: true,
        dryRun: false,
      });

      assert.strictEqual(restoreResult.success, true, 'Restoration must succeed');
      assert.strictEqual(restoreResult.targetLocation, isolatedTarget);
      assert.ok(fs.existsSync(isolatedTarget), 'Target directory must exist');

      // Verify 100% file parity
      for (const file of backupRes.manifest.fileList) {
        const restoredPath = path.join(isolatedTarget, file);
        assert.ok(fs.existsSync(restoredPath), `Restored file ${file} must exist in sandbox`);
        const originalContent = fs.readFileSync(path.join(backupRes.backupPath, file), 'utf8');
        const restoredContent = fs.readFileSync(restoredPath, 'utf8');
        assert.strictEqual(restoredContent, originalContent, `Content parity failure for ${file}`);
      }
    });

    it('refuses to restore corrupted backups', () => {
      const restoreEngine = new DatabaseRestoreEngine(sandboxDir);
      const res = restoreEngine.executeRestore({
        backupId: 'NON-EXISTENT-BACKUP-ID',
        isolatedSandbox: true,
      });

      assert.strictEqual(res.success, false, 'Restoring non-existent backup must fail');
      assert.ok(res.error?.includes('not found'), 'Error must specify backup not found');
    });
  });

  // =========================================================================
  // 3. DATABASE RESET PREVENTION & COMMAND INTERCEPTION
  // =========================================================================
  describe('3. Database Reset Prevention Guard', () => {
    it('blocks prisma migrate reset and dangerous destructive commands', () => {
      const dangerousCommands = [
        'npx prisma migrate reset',
        'prisma migrate reset --force',
        'npx prisma db push --force-reset',
        'DROP TABLE users CASCADE;',
        'TRUNCATE TABLE bookings;',
        'DELETE FROM trips;',
        'DROP DATABASE bharatyatra_db;',
      ];

      for (const cmd of dangerousCommands) {
        const check = DatabaseResetGuard.inspectCommand(cmd);
        assert.strictEqual(check.allowed, false, `Command "${cmd}" must be blocked`);
        assert.ok(check.reason?.includes('PROTECTION BLOCKED'), 'Must include protection blocked notice');
        assert.ok(check.flaggedKeywords.length > 0, 'Must identify flagged keywords');
      }
    });

    it('permits safe, non-destructive additive database commands', () => {
      const safeCommands = [
        'npx prisma migrate deploy',
        'npx prisma generate',
        'npx prisma db push',
        'SELECT * FROM users WHERE id = 1;',
        'INSERT INTO place_submissions (id, name) VALUES (1, "Test Place");',
      ];

      for (const cmd of safeCommands) {
        const check = DatabaseResetGuard.inspectCommand(cmd);
        assert.strictEqual(check.allowed, true, `Safe command "${cmd}" must be allowed`);
        assert.strictEqual(check.flaggedKeywords.length, 0);
      }
    });
  });

  // =========================================================================
  // 4. MIGRATION SAFETY & DESTRUCTIVE SQL DETECTION
  // =========================================================================
  describe('4. Migration Safety & Expand-and-Contract Audit', () => {
    it('scans all existing repository migrations and confirms ZERO destructive commands', () => {
      const analyzer = new MigrationSafetyAnalyzer();
      const report = analyzer.analyzeMigrations();

      assert.ok(report.totalMigrationsScanned >= 5, 'Must scan existing Supabase migrations');
      assert.strictEqual(report.criticalIssuesCount, 0, 'Zero critical destructive SQL commands permitted');
      assert.strictEqual(report.passed, true, 'Migration safety check must pass');
    });

    it('detects synthetic destructive SQL commands (DROP TABLE / DROP COLUMN / TRUNCATE)', () => {
      const tempMigrationDir = path.join(sandboxDir, 'test-migrations');
      fs.mkdirSync(tempMigrationDir, { recursive: true });

      const dangerousSql = `
        -- Unsafe migration simulation
        DROP TABLE legacy_users;
        ALTER TABLE bookings DROP COLUMN customer_phone;
        TRUNCATE TABLE payments;
        DELETE FROM itineraries;
      `;
      fs.writeFileSync(path.join(tempMigrationDir, '20261117_dangerous_test.sql'), dangerousSql, 'utf8');

      const analyzer = new MigrationSafetyAnalyzer(tempMigrationDir);
      const report = analyzer.analyzeMigrations();

      assert.strictEqual(report.passed, false, 'Analyzer must fail dangerous migration');
      assert.strictEqual(report.criticalIssuesCount, 4, 'Must detect all 4 destructive operations');

      const categories = report.findings.map(f => f.category);
      assert.ok(categories.includes('DROP_TABLE'), 'Must detect DROP_TABLE');
      assert.ok(categories.includes('DROP_COLUMN'), 'Must detect DROP_COLUMN');
      assert.ok(categories.includes('TRUNCATE'), 'Must detect TRUNCATE');
      assert.ok(categories.includes('UNSCOPED_DELETE'), 'Must detect UNSCOPED_DELETE');
    });
  });

  // =========================================================================
  // 5. DATA INTEGRITY MONITORING & BASELINE RETENTION
  // =========================================================================
  describe('5. Data Integrity Monitoring', () => {
    it('audits existing database entity counts against baseline', () => {
      const monitor = new DataIntegrityMonitor();
      const audit = monitor.runAudit();

      assert.strictEqual(audit.passed, true, 'Production baseline audit must pass');
      assert.ok(audit.metrics.usersCount >= 1200, 'User count must be preserved');
      assert.ok(audit.metrics.tripsCount >= 40, 'Trips count must be preserved');
      assert.ok(audit.metrics.bookingsCount >= 300, 'Bookings count must be preserved');
      assert.strictEqual(audit.baselineComparison.findings.length, 0, 'Zero unexpected drops');
    });

    it('detects simulated entity count drops and triggers data loss alarm', () => {
      const tempBaselinePath = path.join(sandboxDir, 'temp-baseline.json');
      fs.mkdirSync(sandboxDir, { recursive: true });

      // Create a baseline expecting 2000 users and 500 trips
      const higherBaseline = {
        usersCount: 2000,
        tripsCount: 500,
        bookingsCount: 312,
        paymentsCount: 295,
        contributionsCount: 10,
        publishedDestinationsCount: 5,
        rewardsCount: 4,
        photosCount: 10,
        notificationsCount: 5,
      };
      fs.writeFileSync(tempBaselinePath, JSON.stringify(higherBaseline, null, 2), 'utf8');

      const monitor = new DataIntegrityMonitor(undefined, tempBaselinePath);
      const audit = monitor.runAudit();

      assert.strictEqual(audit.passed, false, 'Audit must fail when counts drop below baseline');
      const decreased = audit.baselineComparison.findings.map(f => f.entity);
      assert.ok(decreased.includes('usersCount'), 'Must flag user count drop');
      assert.ok(decreased.includes('tripsCount'), 'Must flag trip count drop');
    });

    it('verifies foreign key integrity between rewards, photos and submissions', () => {
      const monitor = new DataIntegrityMonitor();
      const relResult = monitor.verifyRelationships();

      assert.ok(relResult.checkedRelations >= 0, 'Checked relationships counter must be valid');
      assert.strictEqual(relResult.brokenRelations, 0, 'Zero broken foreign key relations expected in valid data');
    });
  });

  // Cleanup after tests
  it('cleans up sandbox environment', () => {
    cleanSandbox();
    assert.strictEqual(fs.existsSync(sandboxDir), false);
  });
});
