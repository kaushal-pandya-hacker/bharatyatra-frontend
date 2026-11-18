import fs from 'fs';
import path from 'path';
import { DatabaseBackupEngine, BackupManifest } from './db-backup-engine';

export interface RestoreOptions {
  backupId: string;
  targetDir?: string;
  dryRun?: boolean;
  isolatedSandbox?: boolean;
}

export interface RestoreResult {
  success: boolean;
  backupId: string;
  targetLocation: string;
  restoredFiles: string[];
  entityCounts: Record<string, number>;
  dryRun: boolean;
  error?: string;
}

export class DatabaseRestoreEngine {
  private baseBackupDir: string;
  private backupEngine: DatabaseBackupEngine;

  constructor(customBackupDir?: string) {
    this.baseBackupDir = customBackupDir || path.join(process.cwd(), 'backups', 'db');
    this.backupEngine = new DatabaseBackupEngine(this.baseBackupDir);
  }

  /**
   * Executes a restoration from a verified backup snapshot
   */
  public executeRestore(options: RestoreOptions): RestoreResult {
    const { backupId, dryRun = false, isolatedSandbox = true } = options;
    const backupDir = path.join(this.baseBackupDir, backupId);
    const manifestPath = path.join(backupDir, 'manifest.json');

    if (!fs.existsSync(manifestPath)) {
      return {
        success: false,
        backupId,
        targetLocation: '',
        restoredFiles: [],
        entityCounts: {},
        dryRun,
        error: `Manifest for backup ${backupId} not found in ${backupDir}`,
      };
    }

    // 1. Verify backup integrity BEFORE restoring
    const isIntegrityValid = this.backupEngine.verifyBackupIntegrity(backupId);
    if (!isIntegrityValid) {
      return {
        success: false,
        backupId,
        targetLocation: '',
        restoredFiles: [],
        entityCounts: {},
        dryRun,
        error: `Integrity check failed for backup ${backupId}. Checksum mismatch detected!`,
      };
    }

    const manifest: BackupManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    // Determine target location
    let targetDir = options.targetDir;
    if (!targetDir) {
      if (isolatedSandbox) {
        targetDir = path.join(process.cwd(), 'backups', 'sandbox-restore', backupId);
      } else {
        targetDir = path.join(process.cwd(), 'data');
      }
    }

    if (!dryRun && !fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const restoredFiles: string[] = [];
    const entityCounts: Record<string, number> = {};

    for (const filename of manifest.fileList) {
      const srcFile = path.join(backupDir, filename);
      const destFile = path.join(targetDir, filename);

      if (!fs.existsSync(srcFile)) continue;

      const content = fs.readFileSync(srcFile, 'utf8');

      if (!dryRun) {
        fs.writeFileSync(destFile, content, 'utf8');
      }

      restoredFiles.push(filename);

      try {
        const parsed = JSON.parse(content);
        let count = 0;
        if (Array.isArray(parsed)) {
          count = parsed.length;
        } else if (parsed.submissions && Array.isArray(parsed.submissions)) {
          count = parsed.submissions.length;
        } else if (parsed.coupons && Array.isArray(parsed.coupons)) {
          count = parsed.coupons.length;
        } else if (parsed.photos && Array.isArray(parsed.photos)) {
          count = parsed.photos.length;
        } else if (parsed.destinations && Array.isArray(parsed.destinations)) {
          count = parsed.destinations.length;
        } else if (parsed.data && Array.isArray(parsed.data)) {
          count = parsed.data.length;
        } else {
          count = 1;
        }
        entityCounts[filename] = count;
      } catch {
        entityCounts[filename] = 1;
      }
    }

    return {
      success: true,
      backupId,
      targetLocation: targetDir,
      restoredFiles,
      entityCounts,
      dryRun,
    };
  }
}

// CLI runner for isolated sandbox verification
if (require.main === module) {
  const restoreEngine = new DatabaseRestoreEngine();
  const backupEngine = new DatabaseBackupEngine();
  const latestBackup = backupEngine.listBackups()[0];

  if (!latestBackup) {
    console.error('No backup snapshot found to restore.');
    process.exit(1);
  }

  const sandboxTarget = path.join(process.cwd(), 'backups', 'sandbox-cli-restore', latestBackup.backupId);
  console.log('\n' + '='.repeat(80));
  console.log('🔄 BHARATYATRA DATABASE RESTORATION ENGINE (SANDBOX VERIFICATION)');
  console.log('='.repeat(80));
  console.log(`Source Snapshot: ${latestBackup.backupId}`);
  console.log(`Target Sandbox: ${sandboxTarget}`);

  const res = restoreEngine.executeRestore({
    backupId: latestBackup.backupId,
    targetDir: sandboxTarget,
    isolatedSandbox: true,
    dryRun: false,
  });

  console.log(`Restoration Status: ${res.success ? 'PASSED (100% CHECKSUM VERIFIED)' : 'FAILED'}`);
  console.log('Restored Entities:');
  console.table(res.entityCounts);
  console.log('='.repeat(80) + '\n');

  if (!res.success) {
    process.exit(1);
  }
}
