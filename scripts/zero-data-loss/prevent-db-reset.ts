/**
 * BHARATYATRA ZERO DATA LOSS CLI GUARD
 * Intercepts destructive database reset and schema purge commands
 */

export interface CommandInspectionResult {
  allowed: boolean;
  reason?: string;
  command: string;
  flaggedKeywords: string[];
}

export class DatabaseResetGuard {
  private static readonly DESTRUCTIVE_KEYWORDS = [
    'migrate reset',
    'db push --force-reset',
    '--force-reset',
    'drop table',
    'truncate table',
    'delete from',
    'drop database',
    'schema drop',
  ];

  /**
   * Inspects a command line string for destructive database actions
   */
  public static inspectCommand(commandLine: string, environment = process.env.NODE_ENV || 'production'): CommandInspectionResult {
    const lower = commandLine.toLowerCase();
    const flaggedKeywords: string[] = [];

    for (const kw of this.DESTRUCTIVE_KEYWORDS) {
      if (lower.includes(kw)) {
        flaggedKeywords.push(kw);
      }
    }

    if (flaggedKeywords.length > 0) {
      return {
        allowed: false,
        reason: `[PROTECTION BLOCKED]: Destructive database command detected: "${flaggedKeywords.join(', ')}". In accordance with the BharatYatra Zero Data Loss Policy, database resets and table drops are permanently prohibited on production.`,
        command: commandLine,
        flaggedKeywords,
      };
    }

    return {
      allowed: true,
      command: commandLine,
      flaggedKeywords: [],
    };
  }

  /**
   * CLI Runner Guard
   */
  public static enforce(commandLine: string): void {
    const result = this.inspectCommand(commandLine);
    if (!result.allowed) {
      console.error('\n' + '='.repeat(80));
      console.error('⛔ BHARATYATRA ZERO DATA LOSS ENFORCEMENT ENGINE — COMMAND REJECTED');
      console.error('='.repeat(80));
      console.error(result.reason);
      console.error('='.repeat(80) + '\n');
      process.exit(1);
    }
  }
}

// If executed directly from CLI: node prevent-db-reset.js <command>
if (require.main === module) {
  const args = process.argv.slice(2).join(' ');
  if (args) {
    DatabaseResetGuard.enforce(args);
  }
}
