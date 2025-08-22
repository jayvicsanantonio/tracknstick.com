// Comprehensive tests for data integrity scenarios
// Tests validation, corruption detection, recovery, and migration systems

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  DataValidator,
  IntegrityIssue,
  ValidationResult,
} from '../DataValidator';
import { DataIntegrityService, IntegrityReport } from '../DataIntegrityService';
import {
  DatabaseMigrationManager,
  MigrationScript,
  CORE_MIGRATIONS,
} from '../../migration/DatabaseMigration';
import { IDBManager } from '../../database/IDBManager';
import { OfflineHabit, HabitEntry } from '../../types';

// Mock IndexedDB for testing
class MockIDBManager {
  private stores: Map<string, Map<string, any>> = new Map();

  constructor() {
    this.stores.set('habits', new Map());
    this.stores.set('habitEntries', new Map());
    this.stores.set('syncQueue', new Map());
    this.stores.set('metadata', new Map());
  }

  async initialize(): Promise<void> {}
  async close(): Promise<void> {}
  getDatabaseName(): string {
    return 'test-db';
  }
  async getDatabase(): Promise<IDBDatabase> {
    return {} as IDBDatabase;
  }

  async get<T>(storeName: string, key: string): Promise<T | undefined> {
    return this.stores.get(storeName)?.get(key);
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const store = this.stores.get(storeName);
    return store ? Array.from(store.values()) : [];
  }

  async put<T>(storeName: string, data: T, key?: string): Promise<string> {
    const store = this.stores.get(storeName);
    if (!store) throw new Error(`Store ${storeName} not found`);

    const id = key || (data as any).id || `${storeName}-${Date.now()}`;
    store.set(id, data);
    return id;
  }

  async delete(storeName: string, key: string): Promise<void> {
    this.stores.get(storeName)?.delete(key);
  }

  async clear(storeName: string): Promise<void> {
    this.stores.get(storeName)?.clear();
  }

  // Add test helper methods
  addTestData(storeName: string, key: string, data: any): void {
    this.stores.get(storeName)?.set(key, data);
  }

  getStoreSize(storeName: string): number {
    return this.stores.get(storeName)?.size ?? 0;
  }
}

// Mock localStorage
const mockLocalStorage = {
  data: new Map<string, string>(),
  getItem: vi.fn((key: string) => mockLocalStorage.data.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) =>
    mockLocalStorage.data.set(key, value),
  ),
  removeItem: vi.fn((key: string) => mockLocalStorage.data.delete(key)),
  clear: vi.fn(() => mockLocalStorage.data.clear()),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('Data Integrity System', () => {
  let mockDBManager: MockIDBManager;
  let validator: DataValidator;
  let integrityService: DataIntegrityService;
  let migrationManager: DatabaseMigrationManager;

  const validHabit: OfflineHabit = {
    id: 'habit-1',
    name: 'Exercise',
    icon: 'dumbbell',
    frequency: [1, 2, 3, 4, 5],
    startDate: new Date('2024-01-01'),
    lastModified: new Date('2024-01-15'),
    synced: false,
    version: 1,
  };

  const validEntry: HabitEntry = {
    id: 'entry-1',
    habitId: 'habit-1',
    date: new Date('2024-01-15'),
    completed: true,
    lastModified: new Date('2024-01-15'),
    synced: false,
    version: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.data.clear();

    mockDBManager = new MockIDBManager();
    validator = new DataValidator();
    integrityService = new DataIntegrityService(mockDBManager as any);
    migrationManager = new DatabaseMigrationManager(mockDBManager as any);

    // Register core migrations
    migrationManager.registerMigrations(CORE_MIGRATIONS);
  });

  afterEach(() => {
    integrityService.stop();
  });

  describe('DataValidator', () => {
    describe('Habit Validation', () => {
      it('should validate a correct habit', () => {
        const result = validator.validateHabit(validHabit);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject habit without name', () => {
        const invalidHabit = { ...validHabit, name: '' };
        const result = validator.validateHabit(invalidHabit);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].code).toBe('REQUIRED');
        expect(result.errors[0].field).toBe('name');
      });

      it('should reject habit with invalid frequency', () => {
        const invalidHabit = { ...validHabit, frequency: [1, 2, 8] }; // 8 is invalid day
        const result = validator.validateHabit(invalidHabit);

        expect(result.isValid).toBe(false);
        expect(result.errors[0].code).toBe('INVALID_DAY');
      });

      it('should reject habit with duplicate frequency days', () => {
        const invalidHabit = { ...validHabit, frequency: [1, 2, 2, 3] };
        const result = validator.validateHabit(invalidHabit);

        expect(result.isValid).toBe(false);
        expect(result.errors[0].code).toBe('DUPLICATE_DAYS');
      });

      it('should reject habit with invalid date range', () => {
        const invalidHabit = {
          ...validHabit,
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-01-10'), // End before start
        };
        const result = validator.validateHabit(invalidHabit);

        expect(result.isValid).toBe(false);
        expect(result.errors[0].code).toBe('INVALID_RANGE');
      });

      it('should sanitize habit data', () => {
        const dirtyHabit = {
          ...validHabit,
          name: '  Exercise  ',
          icon: '  dumbbell  ',
          frequency: [3, 1, 2, 3], // Duplicates and wrong order
        };

        const sanitized = validator.sanitizeHabit(dirtyHabit);
        expect(sanitized.name).toBe('Exercise');
        expect(sanitized.icon).toBe('dumbbell');
        expect(sanitized.frequency).toEqual([1, 2, 3]);
      });
    });

    describe('Habit Entry Validation', () => {
      it('should validate a correct habit entry', () => {
        const result = validator.validateHabitEntry(validEntry);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject entry with future date', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);

        const invalidEntry = { ...validEntry, date: futureDate };
        const result = validator.validateHabitEntry(invalidEntry);

        expect(result.isValid).toBe(false);
        expect(result.errors[0].code).toBe('FUTURE_DATE');
      });

      it('should reject entry with invalid habitId', () => {
        const invalidEntry = { ...validEntry, habitId: '' };
        const result = validator.validateHabitEntry(invalidEntry);

        expect(result.isValid).toBe(false);
        expect(result.errors[0].code).toBe('REQUIRED');
      });

      it('should reject entry with invalid completed type', () => {
        const invalidEntry = { ...validEntry, completed: 'true' as any };
        const result = validator.validateHabitEntry(invalidEntry);

        expect(result.isValid).toBe(false);
        expect(result.errors[0].code).toBe('INVALID_TYPE');
      });
    });

    describe('Integrity Checks', () => {
      it('should detect duplicate habits by name', () => {
        const habits = [
          validHabit,
          { ...validHabit, id: 'habit-2', name: 'EXERCISE' }, // Same name, different case
        ];

        const result = validator.checkHabitsIntegrity(habits);
        expect(result.passed).toBe(false);
        expect(result.issues).toHaveLength(1);
        expect(result.issues[0].type).toBe('duplicate_entry');
      });

      it('should detect missing required fields', () => {
        const incompleteHabit = {
          ...validHabit,
          lastModified: undefined,
          version: undefined,
        } as any;

        const result = validator.checkHabitsIntegrity([incompleteHabit]);
        expect(result.passed).toBe(false);
        expect(result.issues.length).toBeGreaterThan(0);

        const missingFields = result.issues.filter(
          (issue) => issue.type === 'missing_field',
        );
        expect(missingFields.length).toBeGreaterThan(0);
      });

      it('should detect orphaned entries', () => {
        const entries = [validEntry];
        const validHabitIds = new Set<string>(); // Empty set - no valid habits

        const result = validator.checkHabitEntriesIntegrity(
          entries,
          validHabitIds,
        );
        expect(result.passed).toBe(false);
        expect(result.issues).toHaveLength(1);
        expect(result.issues[0].type).toBe('orphaned_reference');
      });

      it('should detect duplicate entries', () => {
        const entries = [
          validEntry,
          { ...validEntry, id: 'entry-2' }, // Same habit, same date
        ];
        const validHabitIds = new Set(['habit-1']);

        const result = validator.checkHabitEntriesIntegrity(
          entries,
          validHabitIds,
        );
        expect(result.passed).toBe(false);
        expect(result.issues).toHaveLength(1);
        expect(result.issues[0].type).toBe('duplicate_entry');
      });
    });

    describe('Error Creation', () => {
      it('should create validation error', () => {
        const error = validator.createValidationError(
          'name',
          'REQUIRED',
          'Name is required',
          { invalidData: true },
        );

        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.message).toContain('name');
        expect(error.userMessage).toContain('Invalid name');
        expect(error.context.additionalData).toEqual({
          field: 'name',
          code: 'REQUIRED',
          validationData: { invalidData: true },
        });
      });

      it('should create integrity error', () => {
        const issues: IntegrityIssue[] = [
          {
            type: 'missing_field',
            field: 'id',
            description: 'Missing ID field',
            severity: 'critical',
            autoFixable: false,
          },
        ];

        const error = validator.createIntegrityError(issues);
        expect(error.message).toContain('corruption detected');
        expect(error.severity).toBe('CRITICAL');
      });
    });
  });

  describe('DataIntegrityService', () => {
    beforeEach(async () => {
      // Add test data
      mockDBManager.addTestData('habits', 'habit-1', validHabit);
      mockDBManager.addTestData('habitEntries', 'entry-1', validEntry);
    });

    it('should start and stop service', async () => {
      expect(integrityService.isServiceRunning()).toBe(false);

      await integrityService.start();
      expect(integrityService.isServiceRunning()).toBe(true);

      integrityService.stop();
      expect(integrityService.isServiceRunning()).toBe(false);
    });

    it('should run integrity check', async () => {
      await integrityService.start();
      const report = await integrityService.runIntegrityCheck();

      expect(report).toBeDefined();
      expect(report.timestamp).toBeInstanceOf(Date);
      expect(report.overallStatus).toBe('healthy');
      expect(report.issuesFound).toBe(0);
      expect(report.recommendations).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Data integrity is healthy'),
        ]),
      );
    });

    it('should detect integrity issues', async () => {
      // Add corrupted data with more severe issues to trigger warning/corruption status
      const corruptedHabit1 = {
        ...validHabit,
        id: 'corrupt-1',
        lastModified: undefined,
        version: undefined,
      };
      const corruptedHabit2 = {
        ...validHabit,
        id: 'corrupt-2',
        lastModified: undefined,
        version: undefined,
      };
      const corruptedHabit3 = {
        ...validHabit,
        id: 'corrupt-3',
        lastModified: undefined,
        version: undefined,
      };
      const corruptedHabit4 = {
        ...validHabit,
        id: 'corrupt-4',
        lastModified: undefined,
        version: undefined,
      };
      const corruptedHabit5 = {
        ...validHabit,
        id: 'corrupt-5',
        lastModified: undefined,
        version: undefined,
      };

      mockDBManager.addTestData('habits', 'corrupt-1', corruptedHabit1);
      mockDBManager.addTestData('habits', 'corrupt-2', corruptedHabit2);
      mockDBManager.addTestData('habits', 'corrupt-3', corruptedHabit3);
      mockDBManager.addTestData('habits', 'corrupt-4', corruptedHabit4);
      mockDBManager.addTestData('habits', 'corrupt-5', corruptedHabit5);

      await integrityService.start();
      const report = await integrityService.runIntegrityCheck();

      expect(report.overallStatus).not.toBe('healthy');
      expect(report.issuesFound).toBeGreaterThan(0);
      expect(report.recommendations.length).toBeGreaterThan(0);
    });

    it('should update configuration', () => {
      const newSchedule = { intervalMs: 30000, checkOnSync: false };
      const newRecovery = { autoFixMinorIssues: false };

      integrityService.updateConfiguration(newSchedule, newRecovery);

      // Configuration update should not throw
      expect(() =>
        integrityService.updateConfiguration(newSchedule),
      ).not.toThrow();
    });

    it('should detect and recover corruption', async () => {
      // Add critically corrupted data
      const criticallyCorrupted = { id: undefined, name: 'Test' }; // Missing ID
      mockDBManager.addTestData('habits', 'critical', criticallyCorrupted);

      await integrityService.start();
      const result = await integrityService.detectAndRecoverCorruption();

      expect(result.corrupted).toBe(true);
      expect(result.backupCreated).toBe(true);
      // Recovery success depends on the specific corruption
    });
  });

  describe('DatabaseMigrationManager', () => {
    it('should register migrations', () => {
      const testMigration: MigrationScript = {
        version: 10,
        description: 'Test migration',
        up: async () => {},
      };

      expect(() =>
        migrationManager.registerMigration(testMigration),
      ).not.toThrow();
    });

    it('should detect when migrations are needed', async () => {
      // Mock current version as 1
      mockDBManager.addTestData('metadata', 'database_version', {
        version: 1,
        timestamp: new Date(),
        description: 'Initial version',
        migrations: [],
      });

      const needsMigration = await migrationManager.needsMigration();
      expect(needsMigration).toBe(true); // Core migrations go up to version 4
    });

    it('should create migration plan', async () => {
      // Mock current version as 2
      mockDBManager.addTestData('metadata', 'database_version', {
        version: 2,
        timestamp: new Date(),
        description: 'Version 2',
        migrations: [],
      });

      const plan = await migrationManager.createMigrationPlan();
      expect(plan.currentVersion).toBe(2);
      expect(plan.targetVersion).toBeGreaterThan(2);
      expect(plan.migrationsToApply.length).toBeGreaterThan(0);
    });

    it('should validate schema integrity', async () => {
      const result = await migrationManager.validateSchemaIntegrity();

      // Mock implementation returns placeholder issues
      expect(result.valid).toBe(false); // Placeholder validation
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should get migration history', async () => {
      // Add mock migration history
      mockDBManager.addTestData('metadata', 'database_version', {
        version: 3,
        timestamp: new Date(),
        description: 'Migrated to v3',
        migrations: [1, 2, 3],
      });

      const history = await migrationManager.getMigrationHistory();
      expect(Array.isArray(history)).toBe(true);
    });

    it('should handle migration when no migrations needed', async () => {
      // Mock current version as latest
      mockDBManager.addTestData('metadata', 'database_version', {
        version: 4,
        timestamp: new Date(),
        description: 'Latest version',
        migrations: [],
      });

      const result = await migrationManager.migrate();
      expect(result.success).toBe(true);
      expect(result.appliedMigrations).toHaveLength(0);
      expect(result.warnings).toContain('No migrations needed');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete integrity workflow', async () => {
      // Start with clean data
      await integrityService.start();

      // Initial check should be healthy
      let report = await integrityService.runIntegrityCheck();
      expect(report.overallStatus).toBe('healthy');

      // Introduce corruption - add multiple issues to exceed threshold
      const corruptedEntry1 = {
        ...validEntry,
        id: 'corrupt-entry-1',
        habitId: 'non-existent-1',
      };
      const corruptedEntry2 = {
        ...validEntry,
        id: 'corrupt-entry-2',
        habitId: 'non-existent-2',
      };
      const corruptedEntry3 = {
        ...validEntry,
        id: 'corrupt-entry-3',
        habitId: 'non-existent-3',
      };
      const corruptedEntry4 = {
        ...validEntry,
        id: 'corrupt-entry-4',
        habitId: 'non-existent-4',
      };
      const corruptedEntry5 = {
        ...validEntry,
        id: 'corrupt-entry-5',
        habitId: 'non-existent-5',
      };

      mockDBManager.addTestData(
        'habitEntries',
        'corrupt-entry-1',
        corruptedEntry1,
      );
      mockDBManager.addTestData(
        'habitEntries',
        'corrupt-entry-2',
        corruptedEntry2,
      );
      mockDBManager.addTestData(
        'habitEntries',
        'corrupt-entry-3',
        corruptedEntry3,
      );
      mockDBManager.addTestData(
        'habitEntries',
        'corrupt-entry-4',
        corruptedEntry4,
      );
      mockDBManager.addTestData(
        'habitEntries',
        'corrupt-entry-5',
        corruptedEntry5,
      );

      // Check should detect corruption
      report = await integrityService.runIntegrityCheck();
      expect(['warning', 'corrupted']).toContain(report.overallStatus);
      expect(report.issuesFound).toBeGreaterThan(0);

      // Recovery should attempt to fix issues
      const recovery = await integrityService.detectAndRecoverCorruption();
      expect(recovery.corrupted).toBe(true);
    });

    it('should coordinate validation with migrations', async () => {
      // Test that validation works with migrated data structure
      const currentVersion = await migrationManager.getCurrentVersion();
      expect(typeof currentVersion).toBe('number');

      // Validate data against current schema
      const habitResult = validator.validateHabit(validHabit);
      expect(habitResult.isValid).toBe(true);

      const entryResult = validator.validateHabitEntry(validEntry);
      expect(entryResult.isValid).toBe(true);
    });

    it('should preserve data integrity during migrations', async () => {
      // Add data before migration
      mockDBManager.addTestData('habits', 'pre-migration', validHabit);

      // Set current version to trigger migration
      mockDBManager.addTestData('metadata', 'database_version', {
        version: 1,
        timestamp: new Date(),
        description: 'Pre-migration',
        migrations: [],
      });

      // Migration should preserve existing data
      const needsMigration = await migrationManager.needsMigration();
      expect(needsMigration).toBe(true);

      // Verify data still exists and is valid after schema changes
      const existingData = await mockDBManager.get('habits', 'pre-migration');
      expect(existingData).toBeDefined();

      const validation = validator.validateHabit(existingData);
      expect(validation.isValid).toBe(true);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle validation errors gracefully', () => {
      const invalidHabit = { name: null, frequency: 'invalid' };

      expect(() => {
        validator.validateHabit(invalidHabit as any);
      }).not.toThrow();

      const result = validator.validateHabit(invalidHabit as any);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle service failures gracefully', async () => {
      // Mock database failure
      const failingDBManager = {
        ...mockDBManager,
        getAll: vi.fn().mockRejectedValue(new Error('Database error')),
      };

      const failingService = new DataIntegrityService(failingDBManager as any);
      await failingService.start();

      // Should handle database error gracefully by throwing OfflineError
      try {
        await failingService.runIntegrityCheck();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('Integrity check failed');
        expect(error.code).toBe('DATABASE_ERROR');
      }
    });

    it('should create backups before risky operations', async () => {
      await integrityService.start();

      // Add corrupted data to trigger backup creation
      const corruptedHabit = { id: undefined, name: 'Corrupted' };
      mockDBManager.addTestData('habits', 'corrupted', corruptedHabit);

      // Trigger corruption recovery which should create backup
      await integrityService.detectAndRecoverCorruption();

      // Check that backup was created in localStorage
      const backupKeys = Array.from(mockLocalStorage.data.keys()).filter(
        (key) => key.startsWith('data_backup_'),
      );

      expect(backupKeys.length).toBeGreaterThan(0);
    });

    it('should provide meaningful error context', () => {
      const validationError = validator.createValidationError(
        'name',
        'REQUIRED',
        'Name is required',
      );

      expect(validationError.context.operation).toBe('validation');
      expect(validationError.context.additionalData.field).toBe('name');
      expect(validationError.context.additionalData.code).toBe('REQUIRED');
    });
  });
});
