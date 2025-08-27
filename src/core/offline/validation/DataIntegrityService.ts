// Data integrity service for continuous monitoring and corruption detection
// Provides scheduled integrity checks, corruption detection, and automated recovery

import { IDBManager } from '../database/IDBManager';
import {
  DataValidator,
  IntegrityCheckResult,
  IntegrityIssue,
} from './DataValidator';
import { OfflineHabit, HabitEntry } from '../types';
import { OfflineError } from '../errors/OfflineError';
import { reportError } from '../errors/ErrorReportingService';

export interface IntegrityCheckSchedule {
  enabled: boolean;
  intervalMs: number;
  checkOnSync: boolean;
  checkOnStartup: boolean;
  maxIssuesBeforeAlert: number;
}

export interface IntegrityReport {
  timestamp: Date;
  habitsResult: IntegrityCheckResult;
  entriesResult: IntegrityCheckResult;
  overallStatus: 'healthy' | 'warning' | 'corrupted';
  issuesFound: number;
  issuesFixed: number;
  recommendations: string[];
}

export interface CorruptionRecoveryOptions {
  autoFixMinorIssues: boolean;
  backupBeforeRecovery: boolean;
  maxRecoveryAttempts: number;
  deleteCorruptedEntries: boolean;
}

export class DataIntegrityService {
  private dbManager: IDBManager;
  private validator: DataValidator;
  private schedule: IntegrityCheckSchedule;
  private recoveryOptions: CorruptionRecoveryOptions;
  private intervalId: NodeJS.Timeout | null = null;
  private lastCheck: Date | null = null;
  private isRunning = false;

  constructor(
    dbManager: IDBManager,
    schedule: Partial<IntegrityCheckSchedule> = {},
    recoveryOptions: Partial<CorruptionRecoveryOptions> = {},
  ) {
    this.dbManager = dbManager;
    this.validator = new DataValidator();

    this.schedule = {
      enabled: true,
      intervalMs: 60000 * 15, // 15 minutes
      checkOnSync: true,
      checkOnStartup: true,
      maxIssuesBeforeAlert: 5,
      ...schedule,
    };

    this.recoveryOptions = {
      autoFixMinorIssues: true,
      backupBeforeRecovery: true,
      maxRecoveryAttempts: 3,
      deleteCorruptedEntries: false,
      ...recoveryOptions,
    };
  }

  /**
   * Start the integrity monitoring service
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    // Run initial check on startup
    if (this.schedule.checkOnStartup) {
      await this.runIntegrityCheck();
    }

    // Schedule periodic checks
    if (this.schedule.enabled && this.schedule.intervalMs > 0) {
      this.intervalId = setInterval(() => {
        void (async () => {
          try {
            await this.runIntegrityCheck();
          } catch (error) {
            console.error('Scheduled integrity check failed:', error);
            await reportError(
              OfflineError.fromUnknown(error, {
                operation: 'scheduled_integrity_check',
              }),
            );
          }
        })();
      }, this.schedule.intervalMs);
    }
  }

  /**
   * Stop the integrity monitoring service
   */
  stop(): void {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Run a comprehensive integrity check
   */
  async runIntegrityCheck(): Promise<IntegrityReport> {
    if (!this.isRunning) {
      throw new Error('Integrity service is not running');
    }

    try {
      // Load all data
      const habits = await this.dbManager.getAll<OfflineHabit>('habits');
      const entries = await this.dbManager.getAll<HabitEntry>('habitEntries');

      // Filter out deleted items
      const activeHabits = habits.filter((h) => !h.deleted);
      const activeEntries = entries.filter((e) => !e.deleted);

      // Run integrity checks
      const habitsResult = this.validator.checkHabitsIntegrity(activeHabits);
      const validHabitIds = new Set(
        activeHabits
          .map((h) => h.id)
          .filter((id): id is string => id !== undefined),
      );
      const entriesResult = this.validator.checkHabitEntriesIntegrity(
        activeEntries,
        validHabitIds,
      );

      // Determine overall status
      const totalIssues =
        habitsResult.issues.length + entriesResult.issues.length;
      let overallStatus: 'healthy' | 'warning' | 'corrupted' = 'healthy';

      if (habitsResult.corrupted || entriesResult.corrupted) {
        overallStatus = 'corrupted';
      } else if (totalIssues >= this.schedule.maxIssuesBeforeAlert) {
        overallStatus = 'warning';
      }

      // Attempt auto-fix if enabled
      let issuesFixed = 0;
      if (this.recoveryOptions.autoFixMinorIssues && totalIssues > 0) {
        const allIssues = [...habitsResult.issues, ...entriesResult.issues];
        const fixResult = await this.attemptAutoRecovery(allIssues);
        issuesFixed = fixResult.fixed.length;
      }

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        habitsResult,
        entriesResult,
      );

      const report: IntegrityReport = {
        timestamp: new Date(),
        habitsResult,
        entriesResult,
        overallStatus,
        issuesFound: totalIssues,
        issuesFixed,
        recommendations,
      };

      this.lastCheck = report.timestamp;

      // Report critical issues
      if (overallStatus === 'corrupted') {
        const error = this.validator.createIntegrityError([
          ...habitsResult.issues,
          ...entriesResult.issues,
        ]);
        await reportError(error);
      }

      return report;
    } catch (error) {
      const integrityError = OfflineError.database(
        `Integrity check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          operation: 'integrity_check',
          timestamp: new Date(),
        },
        error instanceof Error ? error : undefined,
      );

      await reportError(integrityError);
      throw integrityError;
    }
  }

  /**
   * Run integrity check after sync operations
   */
  async checkAfterSync(): Promise<IntegrityReport | null> {
    if (!this.schedule.checkOnSync || !this.isRunning) {
      return null;
    }

    return await this.runIntegrityCheck();
  }

  /**
   * Detect and recover from data corruption
   */
  async detectAndRecoverCorruption(): Promise<{
    corrupted: boolean;
    recovered: boolean;
    backupCreated: boolean;
    report: IntegrityReport;
  }> {
    const report = await this.runIntegrityCheck();
    const corrupted = report.overallStatus === 'corrupted';

    if (!corrupted) {
      return {
        corrupted: false,
        recovered: false,
        backupCreated: false,
        report,
      };
    }

    let backupCreated = false;
    let recovered = false;

    try {
      // Create backup before recovery
      if (this.recoveryOptions.backupBeforeRecovery) {
        await this.createDataBackup();
        backupCreated = true;
      }

      // Attempt recovery
      const allIssues = [
        ...report.habitsResult.issues,
        ...report.entriesResult.issues,
      ];
      await this.attemptFullRecovery(allIssues);

      // Verify recovery
      const postRecoveryReport = await this.runIntegrityCheck();
      recovered = postRecoveryReport.overallStatus !== 'corrupted';

      return {
        corrupted: true,
        recovered,
        backupCreated,
        report: postRecoveryReport,
      };
    } catch (error) {
      await reportError(
        OfflineError.database(
          `Data corruption recovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          {
            operation: 'corruption_recovery',
            additionalData: { backupCreated },
          },
          error instanceof Error ? error : undefined,
        ),
      );

      return {
        corrupted: true,
        recovered: false,
        backupCreated,
        report,
      };
    }
  }

  /**
   * Get the last integrity check report
   */
  getLastCheckTime(): Date | null {
    return this.lastCheck;
  }

  /**
   * Check if service is running
   */
  isServiceRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Update service configuration
   */
  updateConfiguration(
    schedule?: Partial<IntegrityCheckSchedule>,
    recoveryOptions?: Partial<CorruptionRecoveryOptions>,
  ): void {
    if (schedule) {
      this.schedule = { ...this.schedule, ...schedule };

      // Restart with new schedule if running
      if (this.isRunning && this.intervalId) {
        this.stop();
        void this.start();
      }
    }

    if (recoveryOptions) {
      this.recoveryOptions = { ...this.recoveryOptions, ...recoveryOptions };
    }
  }

  private async attemptAutoRecovery(issues: IntegrityIssue[]): Promise<{
    fixed: IntegrityIssue[];
    unfixable: IntegrityIssue[];
  }> {
    const fixed: IntegrityIssue[] = [];
    const unfixable: IntegrityIssue[] = [];

    for (const issue of issues) {
      if (!issue.autoFixable) {
        unfixable.push(issue);
        continue;
      }

      try {
        switch (issue.type) {
          case 'missing_field':
            await this.fixMissingField(issue);
            fixed.push(issue);
            break;

          case 'orphaned_reference':
            if (this.recoveryOptions.deleteCorruptedEntries) {
              await this.removeOrphanedEntry(issue);
              fixed.push(issue);
            } else {
              unfixable.push(issue);
            }
            break;

          case 'duplicate_entry':
            await this.mergeDuplicateEntries(issue);
            fixed.push(issue);
            break;

          default:
            unfixable.push(issue);
        }
      } catch (error) {
        console.error(`Failed to auto-fix issue ${issue.type}:`, error);
        unfixable.push(issue);
      }
    }

    return { fixed, unfixable };
  }

  private async attemptFullRecovery(issues: IntegrityIssue[]): Promise<void> {
    let attempts = 0;
    const maxAttempts = this.recoveryOptions.maxRecoveryAttempts;

    while (attempts < maxAttempts) {
      attempts++;

      try {
        const recoveryResult = await this.attemptAutoRecovery(issues);
        if (recoveryResult.unfixable.length === 0) {
          // All issues fixed
          break;
        }

        // Try more aggressive recovery on remaining issues
        if (attempts === maxAttempts && recoveryResult.unfixable.length > 0) {
          // Last resort: reset corrupted data
          await this.resetCorruptedData(recoveryResult.unfixable);
        }
      } catch (error) {
        if (attempts === maxAttempts) {
          throw error;
        }
        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
      }
    }
  }

  private async fixMissingField(issue: IntegrityIssue): Promise<void> {
    if (!issue.entityId || !issue.field) return;

    const now = new Date();

    switch (issue.field) {
      case 'lastModified':
        // Set lastModified to current time
        if (issue.entityId.startsWith('habit')) {
          const habit = await this.dbManager.get<OfflineHabit>(
            'habits',
            issue.entityId,
          );
          if (habit) {
            habit.lastModified = now;
            await this.dbManager.put('habits', habit);
          }
        } else {
          const entry = await this.dbManager.get<HabitEntry>(
            'habitEntries',
            issue.entityId,
          );
          if (entry) {
            entry.lastModified = now;
            await this.dbManager.put('habitEntries', entry);
          }
        }
        break;

      case 'version':
        // Set version to 1
        if (issue.entityId.startsWith('habit')) {
          const habit = await this.dbManager.get<OfflineHabit>(
            'habits',
            issue.entityId,
          );
          if (habit) {
            habit.version = 1;
            await this.dbManager.put('habits', habit);
          }
        } else {
          const entry = await this.dbManager.get<HabitEntry>(
            'habitEntries',
            issue.entityId,
          );
          if (entry) {
            entry.version = 1;
            await this.dbManager.put('habitEntries', entry);
          }
        }
        break;
    }
  }

  private async removeOrphanedEntry(issue: IntegrityIssue): Promise<void> {
    if (!issue.entityId) return;

    // Mark entry as deleted instead of hard delete
    const entry = await this.dbManager.get<HabitEntry>(
      'habitEntries',
      issue.entityId,
    );
    if (entry) {
      entry.deleted = true;
      entry.lastModified = new Date();
      entry.version = (entry.version || 1) + 1;
      await this.dbManager.put('habitEntries', entry);
    }
  }

  private async mergeDuplicateEntries(issue: IntegrityIssue): Promise<void> {
    // Extract IDs from issue description
    const matches = /: (.+)$/.exec(issue.description);
    if (!matches) return;

    const ids = matches[1].split(', ');
    if (ids.length < 2) return;

    // Keep the most recent entry, mark others as deleted
    const entries = await Promise.all(
      ids.map((id) => this.dbManager.get<HabitEntry>('habitEntries', id)),
    );

    const validEntries = entries.filter((e) => e !== undefined);
    if (validEntries.length < 2) return;

    // Sort by lastModified (most recent first)
    validEntries.sort(
      (a, b) => b.lastModified.getTime() - a.lastModified.getTime(),
    );

    // Keep the first (most recent), delete the rest
    for (let i = 1; i < validEntries.length; i++) {
      const entry = validEntries[i];
      entry.deleted = true;
      entry.lastModified = new Date();
      entry.version = (entry.version || 1) + 1;
      await this.dbManager.put('habitEntries', entry);
    }
  }

  private async resetCorruptedData(issues: IntegrityIssue[]): Promise<void> {
    // Last resort: remove critically corrupted data
    for (const issue of issues) {
      if (issue.severity === 'critical' && issue.entityId) {
        if (issue.entityId.startsWith('habit')) {
          await this.dbManager.delete('habits', issue.entityId);
        } else {
          await this.dbManager.delete('habitEntries', issue.entityId);
        }
      }
    }
  }

  private async createDataBackup(): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupKey = `data_backup_${timestamp}`;

    try {
      const habits = await this.dbManager.getAll<OfflineHabit>('habits');
      const entries = await this.dbManager.getAll<HabitEntry>('habitEntries');

      const backup = {
        timestamp: new Date().toISOString(),
        habits,
        entries,
      };

      localStorage.setItem(backupKey, JSON.stringify(backup));
    } catch (error) {
      throw new Error(
        `Failed to create backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private generateRecommendations(
    habitsResult: IntegrityCheckResult,
    entriesResult: IntegrityCheckResult,
  ): string[] {
    const recommendations: string[] = [];

    const totalIssues =
      habitsResult.issues.length + entriesResult.issues.length;
    const criticalIssues = [
      ...habitsResult.issues,
      ...entriesResult.issues,
    ].filter((issue) => issue.severity === 'critical').length;

    if (criticalIssues > 0) {
      recommendations.push(
        'Critical data corruption detected. Consider restoring from backup.',
      );
      recommendations.push('Run full data corruption recovery immediately.');
    }

    if (totalIssues > this.schedule.maxIssuesBeforeAlert) {
      recommendations.push(
        'High number of data integrity issues. Consider running full integrity check.',
      );
    }

    const orphanedEntries = entriesResult.issues.filter(
      (issue) => issue.type === 'orphaned_reference',
    ).length;
    if (orphanedEntries > 0) {
      recommendations.push(
        `${orphanedEntries} orphaned habit entries found. Enable automatic cleanup.`,
      );
    }

    const duplicates = [...habitsResult.issues, ...entriesResult.issues].filter(
      (issue) => issue.type === 'duplicate_entry',
    ).length;
    if (duplicates > 0) {
      recommendations.push(
        `${duplicates} duplicate entries found. Run deduplication process.`,
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('Data integrity is healthy. No actions needed.');
    }

    return recommendations;
  }
}

// Global service instance
let globalIntegrityService: DataIntegrityService | null = null;

/**
 * Get or create the global data integrity service
 */
export function getDataIntegrityService(
  dbManager?: IDBManager,
): DataIntegrityService {
  if (!globalIntegrityService && dbManager) {
    globalIntegrityService = new DataIntegrityService(dbManager);
  }
  if (!globalIntegrityService) {
    throw new Error(
      'DataIntegrityService not initialized. Call with dbManager first.',
    );
  }
  return globalIntegrityService;
}
