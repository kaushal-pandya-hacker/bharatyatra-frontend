import { execSync } from 'child_process';
import { DatabaseBackupEngine } from './db-backup-engine';
import { MigrationSafetyAnalyzer } from './migration-safety-analyzer';
import { DataIntegrityMonitor } from './data-integrity-monitor';

export interface PreDeploymentGateResult {
  timestamp: string;
  passed: boolean;
  backupCreated: boolean;
  backupId?: string;
  typeCheckPassed: boolean;
  migrationSafetyPassed: boolean;
  dataIntegrityPassed: boolean;
  testsPassed: boolean;
  checks: Array<{ name: string; passed: boolean; message: string }>;
}

export class PreDeploymentGatekeeper {
  public static async runGatekeeper(): Promise<PreDeploymentGateResult> {
    console.log('\n' + '='.repeat(80));
    console.log('🛡️  BHARATYATRA ZERO DATA LOSS PRE-DEPLOYMENT GATEKEEPER');
    console.log('='.repeat(80) + '\n');

    const checks: Array<{ name: string; passed: boolean; message: string }> = [];

    // Step 1: Pre-flight Automated Database Backup
    console.log('[1/6] Executing pre-deployment automated backup...');
    const backupEngine = new DatabaseBackupEngine();
    let backupCreated = false;
    let backupId: string | undefined;

    try {
      const backupRes = await backupEngine.executeBackup('pre-deployment');
      backupCreated = backupRes.success;
      backupId = backupRes.manifest.backupId;
      checks.push({
        name: 'Automated Backup & Checksum Verification',
        passed: backupRes.success,
        message: backupRes.success
          ? `Verified backup snapshot created: ${backupId}`
          : 'Failed to create verified backup snapshot.',
      });
      console.log(`  ✔ Backup Created: ${backupId} (Integrity: ${backupRes.success ? 'VERIFIED' : 'FAILED'})`);
    } catch (err: any) {
      checks.push({
        name: 'Automated Backup & Checksum Verification',
        passed: false,
        message: `Backup exception: ${err.message}`,
      });
      console.error(`  ✖ Backup Failed: ${err.message}`);
    }

    // Step 2: Migration Safety Analysis
    console.log('[2/6] Inspecting database migrations for destructive SQL...');
    const migrationAnalyzer = new MigrationSafetyAnalyzer();
    const migrationReport = migrationAnalyzer.analyzeMigrations();
    checks.push({
      name: 'Migration Safety & Zero Drops',
      passed: migrationReport.passed,
      message: migrationReport.summary,
    });
    console.log(`  ${migrationReport.passed ? '✔' : '✖'} Migration Safety: ${migrationReport.summary}`);

    // Step 3: Data Integrity Audit
    console.log('[3/6] Auditing data integrity against baseline...');
    const integrityMonitor = new DataIntegrityMonitor();
    const integrityReport = integrityMonitor.runAudit();
    checks.push({
      name: 'Data Integrity & Count Retention',
      passed: integrityReport.passed,
      message: integrityReport.summary,
    });
    console.log(`  ${integrityReport.passed ? '✔' : '✖'} Data Integrity: ${integrityReport.summary}`);

    // Step 4: TypeScript Type Check
    console.log('[4/6] Running TypeScript compilation check (tsc --noEmit)...');
    let typeCheckPassed = false;
    try {
      execSync('npm run type-check', { stdio: 'pipe' });
      typeCheckPassed = true;
      checks.push({
        name: 'TypeScript Compilation',
        passed: true,
        message: 'Type check passed with zero errors.',
      });
      console.log('  ✔ Type Check: PASSED (0 errors)');
    } catch (err: any) {
      checks.push({
        name: 'TypeScript Compilation',
        passed: false,
        message: `Type check failed: ${err.stdout?.toString() || err.message}`,
      });
      console.error('  ✖ Type Check: FAILED');
    }

    // Step 5: Test Suites Execution
    console.log('[5/6] Running critical test suites...');
    let testsPassed = false;
    try {
      execSync('npx tsx --test __tests__/community-contribution-e2e.test.ts __tests__/contribution-storage.test.ts', { stdio: 'pipe' });
      testsPassed = true;
      checks.push({
        name: 'Test Suites Execution',
        passed: true,
        message: 'All unit and regression test suites passed.',
      });
      console.log('  ✔ Regression Tests: PASSED');
    } catch (err: any) {
      checks.push({
        name: 'Test Suites Execution',
        passed: false,
        message: `Test execution failed: ${err.stdout?.toString() || err.message}`,
      });
      console.error('  ✖ Regression Tests: FAILED');
    }

    const allPassed = checks.every(c => c.passed);

    console.log('\n' + '='.repeat(80));
    console.log(`PRE-DEPLOYMENT GATE RESULT: ${allPassed ? '✅ APPROVED FOR RELEASE' : '❌ DEPLOYMENT BLOCKED'}`);
    console.log('='.repeat(80) + '\n');

    return {
      timestamp: new Date().toISOString(),
      passed: allPassed,
      backupCreated,
      backupId,
      typeCheckPassed,
      migrationSafetyPassed: migrationReport.passed,
      dataIntegrityPassed: integrityReport.passed,
      testsPassed,
      checks,
    };
  }
}

// CLI runner
if (require.main === module) {
  PreDeploymentGatekeeper.runGatekeeper().then(res => {
    if (!res.passed) {
      process.exit(1);
    }
  });
}
