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
        const count = Array.isArray(parsed) ? parsed.length : (parsed.data && Array.isArray(parsed.data) ? parsed.data.length : 1);
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
