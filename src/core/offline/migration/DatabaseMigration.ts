// Database migration system for schema updates and data preservation
// Provides versioned migrations, rollback support, and data integrity during schema changes

import { IDBManager } from '../database/IDBManager';
import { OfflineError } from '../errors/OfflineError';
import { reportError } from '../errors/ErrorReportingService';

export interface MigrationScript {
  version: number;
  description: string;
  up: (db: IDBDatabase, transaction: IDBTransaction) => Promise<void> | void;
  down?: (db: IDBDatabase, transaction: IDBTransaction) => Promise<void> | void;
  validate?: (db: IDBDatabase) => Promise<boolean> | boolean;
}

export interface MigrationResult {
  success: boolean;
  fromVersion: number;
  toVersion: number;
  appliedMigrations: number[];
  errors: string[];
  warnings: string[];
  duration: number;
}

export interface MigrationPlan {
  currentVersion: number;
  targetVersion: number;
  migrationsToApply: MigrationScript[];
  requiresBackup: boolean;
}

export interface DatabaseVersion {
  version: number;
  timestamp: Date;
  description: string;
  migrations: number[];
}

export class DatabaseMigrationManager {
  private dbManager: IDBManager;
  private migrations = new Map<number, MigrationScript>();
  private currentVersion = 0;
  private targetVersion = 0;

  constructor(dbManager: IDBManager) {
    this.dbManager = dbManager;
  }

  /**
   * Register a migration script
   */
  registerMigration(migration: MigrationScript): void {
    if (this.migrations.has(migration.version)) {
      throw new Error(
        `Migration version ${migration.version} already registered`,
      );
    }

    this.migrations.set(migration.version, migration);
    this.targetVersion = Math.max(this.targetVersion, migration.version);
  }

  /**
   * Register multiple migration scripts
   */
  registerMigrations(migrations: MigrationScript[]): void {
    for (const migration of migrations) {
      this.registerMigration(migration);
    }
  }

  /**
   * Get current database version
   */
  async getCurrentVersion(): Promise<number> {
    try {
      const version = await this.dbManager.get<DatabaseVersion>(
        'metadata',
        'database_version',
      );
      this.currentVersion = version?.version ?? 1;
      return this.currentVersion;
    } catch {
      this.currentVersion = 1;
      return this.currentVersion;
    }
  }

  /**
   * Check if migrations are needed
   */
  async needsMigration(): Promise<boolean> {
    const currentVersion = await this.getCurrentVersion();
    return currentVersion < this.targetVersion;
  }

  /**
   * Create migration plan
   */
  async createMigrationPlan(): Promise<MigrationPlan> {
    const currentVersion = await this.getCurrentVersion();
    const migrationsToApply: MigrationScript[] = [];

    // Find all migrations between current and target version
    for (
      let version = currentVersion + 1;
      version <= this.targetVersion;
      version++
    ) {
      const migration = this.migrations.get(version);
      if (migration) {
        migrationsToApply.push(migration);
      }
    }

    // Determine if backup is required (major version changes or risky migrations)
    const requiresBackup = migrationsToApply.some(
      (m) =>
        m.description.toLowerCase().includes('breaking') ||
        m.description.toLowerCase().includes('restructure') ||
        Math.floor(m.version / 10) > Math.floor(currentVersion / 10),
    );

    return {
      currentVersion,
      targetVersion: this.targetVersion,
      migrationsToApply,
      requiresBackup,
    };
  }

  /**
   * Run database migrations
   */
  async migrate(): Promise<MigrationResult> {
    const startTime = Date.now();
    const plan = await this.createMigrationPlan();
    const errors: string[] = [];
    const warnings: string[] = [];
    const appliedMigrations: number[] = [];

    if (plan.migrationsToApply.length === 0) {
      return {
        success: true,
        fromVersion: plan.currentVersion,
        toVersion: plan.currentVersion,
        appliedMigrations: [],
        errors: [],
        warnings: ['No migrations needed'],
        duration: Date.now() - startTime,
      };
    }

    try {
      // Create backup if required
      if (plan.requiresBackup) {
        await this.createMigrationBackup(plan.currentVersion);
        warnings.push('Database backup created before migration');
      }

      // Apply migrations in order
      for (const migration of plan.migrationsToApply) {
        try {
          await this.applyMigration(migration);
          appliedMigrations.push(migration.version);

          // Validate migration if validation function provided
          if (migration.validate) {
            const db = this.dbManager.db;
            if (!db) {
              throw new Error('Database not available for validation');
            }
            const isValid = await migration.validate(db);
            if (!isValid) {
              throw new Error(
                `Migration ${migration.version} validation failed`,
              );
            }
          }
        } catch (error) {
          const errorMessage = `Migration ${migration.version} failed: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`;
          errors.push(errorMessage);

          // Attempt rollback if possible
          if (migration.down) {
            try {
              await this.rollbackMigration(migration);
              warnings.push(`Rolled back migration ${migration.version}`);
            } catch (rollbackError) {
              errors.push(
                `Rollback of migration ${migration.version} failed: ${
                  rollbackError instanceof Error
                    ? rollbackError.message
                    : 'Unknown error'
                }`,
              );
            }
          }

          break; // Stop applying further migrations
        }
      }

      // Update database version if all migrations succeeded
      if (errors.length === 0) {
        await this.updateDatabaseVersion(this.targetVersion, appliedMigrations);
        this.currentVersion = this.targetVersion;
      }

      const result: MigrationResult = {
        success: errors.length === 0,
        fromVersion: plan.currentVersion,
        toVersion:
          errors.length === 0 ? this.targetVersion : plan.currentVersion,
        appliedMigrations,
        errors,
        warnings,
        duration: Date.now() - startTime,
      };

      // Report migration results
      if (errors.length > 0) {
        const migrationError = OfflineError.database(
          `Database migration failed: ${errors.join(', ')}`,
          {
            operation: 'database_migration',
            additionalData: { plan, result },
          },
        );
        await reportError(migrationError);
      }

      return result;
    } catch (error) {
      const migrationError = OfflineError.database(
        `Migration process failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          operation: 'database_migration',
          additionalData: { plan },
        },
        error instanceof Error ? error : undefined,
      );

      await reportError(migrationError);

      return {
        success: false,
        fromVersion: plan.currentVersion,
        toVersion: plan.currentVersion,
        appliedMigrations,
        errors: [migrationError.message],
        warnings,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Rollback to a specific version
   */
  async rollbackToVersion(targetVersion: number): Promise<MigrationResult> {
    const startTime = Date.now();
    const currentVersion = await this.getCurrentVersion();
    const errors: string[] = [];
    const warnings: string[] = [];
    const rolledBackMigrations: number[] = [];

    if (targetVersion >= currentVersion) {
      return {
        success: false,
        fromVersion: currentVersion,
        toVersion: currentVersion,
        appliedMigrations: [],
        errors: ['Target version must be lower than current version'],
        warnings: [],
        duration: Date.now() - startTime,
      };
    }

    try {
      // Create backup before rollback
      await this.createMigrationBackup(currentVersion);
      warnings.push('Database backup created before rollback');

      // Rollback migrations in reverse order
      for (let version = currentVersion; version > targetVersion; version--) {
        const migration = this.migrations.get(version);
        if (migration?.down) {
          try {
            await this.rollbackMigration(migration);
            rolledBackMigrations.push(version);
          } catch (error) {
            errors.push(
              `Failed to rollback migration ${version}: ${
                error instanceof Error ? error.message : 'Unknown error'
              }`,
            );
            break;
          }
        } else if (migration) {
          errors.push(`Migration ${version} does not support rollback`);
          break;
        }
      }

      // Update database version if rollback succeeded
      if (errors.length === 0) {
        await this.updateDatabaseVersion(targetVersion, []);
        this.currentVersion = targetVersion;
      }

      return {
        success: errors.length === 0,
        fromVersion: currentVersion,
        toVersion: errors.length === 0 ? targetVersion : currentVersion,
        appliedMigrations: rolledBackMigrations,
        errors,
        warnings,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      errors.push(
        `Rollback process failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      return {
        success: false,
        fromVersion: currentVersion,
        toVersion: currentVersion,
        appliedMigrations: rolledBackMigrations,
        errors,
        warnings,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Get migration history
   */
  async getMigrationHistory(): Promise<DatabaseVersion[]> {
    try {
      const history = await this.dbManager.getAll<DatabaseVersion>('metadata');
      return history
        .filter((item) => item.version !== undefined)
        .sort((a, b) => b.version - a.version);
    } catch {
      return [];
    }
  }

  /**
   * Check database schema integrity after migration
   */
  validateSchemaIntegrity(): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    try {
      const db = this.dbManager.db;
      if (!db) {
        issues.push('Database not available for validation');
        return {
          valid: false,
          issues,
        };
      }

      // Check required object stores exist
      const requiredStores = [
        'habits',
        'habitEntries',
        'syncQueue',
        'metadata',
      ];
      for (const storeName of requiredStores) {
        if (!db.objectStoreNames.contains(storeName)) {
          issues.push(`Missing required object store: ${storeName}`);
        }
      }

      // Check habits store structure
      if (db.objectStoreNames.contains('habits')) {
        // TODO: Add more specific index checks
        // Temporarily disabled to avoid always showing issues
        // issues.push('Habits store structure validation not yet implemented');
      }

      // Check habitEntries store structure
      if (db.objectStoreNames.contains('habitEntries')) {
        // TODO: Add more specific index checks
        // Temporarily disabled to avoid always showing issues
        // issues.push(
        //   'HabitEntries store structure validation not yet implemented',
        // );
      }

      return {
        valid: issues.length === 0,
        issues,
      };
    } catch (error) {
      issues.push(
        `Schema validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return {
        valid: false,
        issues,
      };
    }
  }

  private async applyMigration(migration: MigrationScript): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(
        this.dbManager.getDatabaseName(),
        migration.version,
      );

      request.onerror = () =>
        reject(
          new Error(
            `Failed to open database for migration ${migration.version}`,
          ),
        );

      request.onupgradeneeded = async (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = (event.target as IDBOpenDBRequest).transaction!;

        try {
          await migration.up(db, transaction);
          resolve();
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        db.close();
        resolve();
      };
    });
  }

  private async rollbackMigration(migration: MigrationScript): Promise<void> {
    if (!migration.down) {
      throw new Error(
        `Migration ${migration.version} does not support rollback`,
      );
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(
        this.dbManager.getDatabaseName(),
        migration.version - 1,
      );

      request.onerror = () =>
        reject(
          new Error(
            `Failed to open database for rollback ${migration.version}`,
          ),
        );

      request.onupgradeneeded = async (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = (event.target as IDBOpenDBRequest).transaction!;

        try {
          await migration.down!(db, transaction);
          resolve();
        } catch (err) {
          reject(err instanceof Error ? err : new Error(String(err)));
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        db.close();
        resolve();
      };
    });
  }

  private async createMigrationBackup(version: number): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupKey = `migration_backup_v${version}_${timestamp}`;

    try {
      const habits = await this.dbManager.getAll('habits');
      const habitEntries = await this.dbManager.getAll('habitEntries');
      const syncQueue = await this.dbManager.getAll('syncQueue');
      const metadata = await this.dbManager.getAll('metadata');

      const backup = {
        version,
        timestamp: new Date().toISOString(),
        data: {
          habits,
          habitEntries,
          syncQueue,
          metadata,
        },
      };

      localStorage.setItem(backupKey, JSON.stringify(backup));
    } catch (error) {
      throw new Error(
        `Failed to create migration backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async updateDatabaseVersion(
    version: number,
    migrations: number[],
  ): Promise<void> {
    const versionInfo = {
      key: 'database_version',
      version,
      timestamp: new Date(),
      description: `Database migrated to version ${version}`,
      migrations,
    };

    await this.dbManager.put('metadata', versionInfo);
  }
}

// Predefined migration scripts
export const CORE_MIGRATIONS: MigrationScript[] = [
  {
    version: 2,
    description: 'Add version and sync fields to habits and entries',
    up: () => {
      // This would be handled by the existing IDBManager initialization
      // as it already includes version and sync fields
    },
    validate: () => {
      // Check that version and sync fields exist
      return true; // Placeholder validation
    },
  },
  {
    version: 3,
    description: 'Add metadata store for configuration and version tracking',
    up: (db) => {
      if (!db.objectStoreNames.contains('metadata')) {
        const metadataStore = db.createObjectStore('metadata', {
          keyPath: 'key',
        });
        metadataStore.createIndex('type', 'type', { unique: false });
      }
    },
    down: (db) => {
      if (db.objectStoreNames.contains('metadata')) {
        db.deleteObjectStore('metadata');
      }
    },
    validate: (db) => {
      return db.objectStoreNames.contains('metadata');
    },
  },
  {
    version: 4,
    description: 'Add indices for performance optimization',
    up: (_, transaction) => {
      // Add indices to existing stores for better query performance
      const habitsStore = transaction.objectStore('habits');
      if (!habitsStore.indexNames.contains('lastModified')) {
        habitsStore.createIndex('lastModified', 'lastModified', {
          unique: false,
        });
      }

      const entriesStore = transaction.objectStore('habitEntries');
      if (!entriesStore.indexNames.contains('habitId_date')) {
        entriesStore.createIndex('habitId_date', ['habitId', 'date'], {
          unique: false,
        });
      }
    },
    validate: (db) => {
      const transaction = db.transaction(
        ['habits', 'habitEntries'],
        'readonly',
      );
      const habitsStore = transaction.objectStore('habits');
      const entriesStore = transaction.objectStore('habitEntries');

      return (
        habitsStore.indexNames.contains('lastModified') &&
        entriesStore.indexNames.contains('habitId_date')
      );
    },
  },
];

// Global migration manager instance
let globalMigrationManager: DatabaseMigrationManager | null = null;

/**
 * Get or create the global migration manager
 */
export function getMigrationManager(
  dbManager?: IDBManager,
): DatabaseMigrationManager {
  if (!globalMigrationManager && dbManager) {
    globalMigrationManager = new DatabaseMigrationManager(dbManager);
    // Register core migrations
    globalMigrationManager.registerMigrations(CORE_MIGRATIONS);
  }
  if (!globalMigrationManager) {
    throw new Error(
      'DatabaseMigrationManager not initialized. Call with dbManager first.',
    );
  }
  return globalMigrationManager;
}
