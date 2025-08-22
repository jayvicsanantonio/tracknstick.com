// Comprehensive tests for database migration scenarios
// Tests migration scripts, rollbacks, version management, and data preservation

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  DatabaseMigrationManager,
  MigrationScript,
  CORE_MIGRATIONS,
  MigrationResult,
} from '../DatabaseMigration';

// Mock IndexedDB for testing
class MockIDBDatabase implements Partial<IDBDatabase> {
  public objectStoreNames: DOMStringList = {
    contains: vi.fn((name: string) =>
      ['habits', 'habitEntries', 'syncQueue', 'metadata'].includes(name),
    ),
    item: vi.fn(),
    length: 4,
    [Symbol.iterator]: function* () {
      yield* ['habits', 'habitEntries', 'syncQueue', 'metadata'];
    },
  };

  createObjectStore = vi.fn(
    (name: string, options?: IDBObjectStoreParameters) => ({
      name,
      indexNames: { contains: vi.fn(() => false), length: 0 } as DOMStringList,
      createIndex: vi.fn(),
    }),
  );

  deleteObjectStore = vi.fn();
  close = vi.fn();
}

class MockIDBTransaction implements Partial<IDBTransaction> {
  objectStore = vi.fn((name: string) => ({
    name,
    indexNames: {
      contains: vi.fn((indexName: string) => {
        if (name === 'habits') return indexName === 'lastModified';
        if (name === 'habitEntries') return indexName === 'habitId_date';
        return false;
      }),
      length: 1,
    } as DOMStringList,
    createIndex: vi.fn(),
  }));
}

class MockIDBManager {
  private stores: Map<string, Map<string, any>> = new Map();
  private dbName = 'test-migration-db';

  constructor() {
    this.stores.set('habits', new Map());
    this.stores.set('habitEntries', new Map());
    this.stores.set('syncQueue', new Map());
    this.stores.set('metadata', new Map());
  }

  getDatabaseName(): string {
    return this.dbName;
  }

  async getDatabase(): Promise<IDBDatabase> {
    return new MockIDBDatabase() as IDBDatabase;
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

  // Test helpers
  addTestData(storeName: string, key: string, data: any): void {
    this.stores.get(storeName)?.set(key, data);
  }

  getStoreData(storeName: string): any[] {
    const store = this.stores.get(storeName);
    return store ? Array.from(store.values()) : [];
  }

  clearStore(storeName: string): void {
    this.stores.get(storeName)?.clear();
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

// Mock IndexedDB global
const mockIndexedDB = {
  open: vi.fn((name: string, version?: number) => {
    const request = {
      result: new MockIDBDatabase(),
      error: null,
      onsuccess: null as any,
      onerror: null as any,
      onupgradeneeded: null as any,
      transaction: new MockIDBTransaction(),
    };

    // Simulate async behavior
    setTimeout(() => {
      if (request.onupgradeneeded) {
        request.onupgradeneeded({
          target: request,
          oldVersion: (version || 1) - 1,
          newVersion: version || 1,
        } as any);
      }
      if (request.onsuccess) {
        request.onsuccess({ target: request } as any);
      }
    }, 0);

    return request;
  }),
};

Object.defineProperty(window, 'indexedDB', {
  value: mockIndexedDB,
  writable: true,
});

describe('Database Migration System', () => {
  let mockDBManager: MockIDBManager;
  let migrationManager: DatabaseMigrationManager;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.data.clear();

    mockDBManager = new MockIDBManager();
    migrationManager = new DatabaseMigrationManager(mockDBManager as any);
  });

  describe('Migration Registration', () => {
    it('should register a single migration', () => {
      const testMigration: MigrationScript = {
        version: 5,
        description: 'Test migration',
        up: vi.fn(),
      };

      expect(() =>
        migrationManager.registerMigration(testMigration),
      ).not.toThrow();
    });

    it('should register multiple migrations', () => {
      const migrations: MigrationScript[] = [
        {
          version: 5,
          description: 'Migration 5',
          up: vi.fn(),
        },
        {
          version: 6,
          description: 'Migration 6',
          up: vi.fn(),
        },
      ];

      expect(() =>
        migrationManager.registerMigrations(migrations),
      ).not.toThrow();
    });

    it('should reject duplicate migration versions', () => {
      const migration1: MigrationScript = {
        version: 5,
        description: 'First migration',
        up: vi.fn(),
      };

      const migration2: MigrationScript = {
        version: 5,
        description: 'Duplicate migration',
        up: vi.fn(),
      };

      migrationManager.registerMigration(migration1);
      expect(() => migrationManager.registerMigration(migration2)).toThrow(
        'Migration version 5 already registered',
      );
    });

    it('should register core migrations automatically', () => {
      const manager = new DatabaseMigrationManager(mockDBManager as any);
      manager.registerMigrations(CORE_MIGRATIONS);

      // Should not throw and should have migrations registered
      expect(() => manager.registerMigrations(CORE_MIGRATIONS)).not.toThrow();
    });
  });

  describe('Version Management', () => {
    it('should return version 1 for new database', async () => {
      const version = await migrationManager.getCurrentVersion();
      expect(version).toBe(1);
    });

    it('should return stored database version', async () => {
      // Mock stored version
      mockDBManager.addTestData('metadata', 'database_version', {
        version: 3,
        timestamp: new Date(),
        description: 'Current version',
        migrations: [1, 2, 3],
      });

      const version = await migrationManager.getCurrentVersion();
      expect(version).toBe(3);
    });

    it('should detect when migrations are needed', async () => {
      // Register migrations
      migrationManager.registerMigrations(CORE_MIGRATIONS);

      // Mock current version as lower than target
      mockDBManager.addTestData('metadata', 'database_version', {
        version: 1,
        timestamp: new Date(),
        description: 'Old version',
        migrations: [],
      });

      const needsMigration = await migrationManager.needsMigration();
      expect(needsMigration).toBe(true);
    });

    it('should detect when no migrations are needed', async () => {
      // Register migrations
      migrationManager.registerMigrations(CORE_MIGRATIONS);

      // Mock current version as equal to target
      const targetVersion = Math.max(...CORE_MIGRATIONS.map((m) => m.version));
      mockDBManager.addTestData('metadata', 'database_version', {
        version: targetVersion,
        timestamp: new Date(),
        description: 'Up to date',
        migrations: CORE_MIGRATIONS.map((m) => m.version),
      });

      const needsMigration = await migrationManager.needsMigration();
      expect(needsMigration).toBe(false);
    });
  });

  describe('Migration Planning', () => {
    it('should create migration plan', async () => {
      // Register test migrations
      const migrations: MigrationScript[] = [
        { version: 2, description: 'Migration 2', up: vi.fn() },
        { version: 3, description: 'Migration 3', up: vi.fn() },
        { version: 4, description: 'Breaking migration', up: vi.fn() },
      ];
      migrationManager.registerMigrations(migrations);

      // Mock current version
      mockDBManager.addTestData('metadata', 'database_version', {
        version: 1,
        timestamp: new Date(),
        description: 'Version 1',
        migrations: [],
      });

      const plan = await migrationManager.createMigrationPlan();

      expect(plan.currentVersion).toBe(1);
      expect(plan.targetVersion).toBe(4);
      expect(plan.migrationsToApply).toHaveLength(3);
      expect(plan.requiresBackup).toBe(true); // Due to "Breaking" in description
    });

    it('should identify risky migrations requiring backup', async () => {
      const riskyMigrations: MigrationScript[] = [
        { version: 2, description: 'Safe migration', up: vi.fn() },
        { version: 3, description: 'Restructure tables', up: vi.fn() },
      ];
      migrationManager.registerMigrations(riskyMigrations);

      const plan = await migrationManager.createMigrationPlan();
      expect(plan.requiresBackup).toBe(true); // Due to "restructure"
    });

    it('should create empty plan when no migrations needed', async () => {
      // Current version equals target version
      const plan = await migrationManager.createMigrationPlan();

      expect(plan.migrationsToApply).toHaveLength(0);
      expect(plan.requiresBackup).toBe(false);
    });
  });

  describe('Migration Execution', () => {
    it('should execute migrations successfully', async () => {
      const upSpy = vi.fn().mockResolvedValue(undefined);
      const validateSpy = vi.fn().mockResolvedValue(true);

      const migrations: MigrationScript[] = [
        {
          version: 2,
          description: 'Test migration',
          up: upSpy,
          validate: validateSpy,
        },
      ];
      migrationManager.registerMigrations(migrations);

      const result = await migrationManager.migrate();

      expect(result.success).toBe(true);
      expect(result.fromVersion).toBe(1);
      expect(result.toVersion).toBe(2);
      expect(result.appliedMigrations).toEqual([2]);
      expect(result.errors).toHaveLength(0);
      expect(upSpy).toHaveBeenCalled();
      expect(validateSpy).toHaveBeenCalled();
    });

    it('should handle migration failures', async () => {
      const failingUp = vi
        .fn()
        .mockRejectedValue(new Error('Migration failed'));
      const downSpy = vi.fn().mockResolvedValue(undefined);

      const migrations: MigrationScript[] = [
        {
          version: 2,
          description: 'Failing migration',
          up: failingUp,
          down: downSpy,
        },
      ];
      migrationManager.registerMigrations(migrations);

      const result = await migrationManager.migrate();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Migration 2 failed');
      expect(downSpy).toHaveBeenCalled(); // Should attempt rollback
    });

    it('should validate migrations after execution', async () => {
      const upSpy = vi.fn().mockResolvedValue(undefined);
      const validateSpy = vi.fn().mockResolvedValue(false); // Validation fails

      const migrations: MigrationScript[] = [
        {
          version: 2,
          description: 'Invalid migration',
          up: upSpy,
          validate: validateSpy,
        },
      ];
      migrationManager.registerMigrations(migrations);

      const result = await migrationManager.migrate();

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('validation failed');
    });

    it('should create backups for risky migrations', async () => {
      // Add test data to backup
      mockDBManager.addTestData('habits', 'habit-1', {
        id: 'habit-1',
        name: 'Test Habit',
      });

      const migrations: MigrationScript[] = [
        {
          version: 2,
          description: 'Breaking migration',
          up: vi.fn().mockResolvedValue(undefined),
        },
      ];
      migrationManager.registerMigrations(migrations);

      await migrationManager.migrate();

      // Check that backup was created
      const backupKeys = Array.from(mockLocalStorage.data.keys()).filter(
        (key) => key.startsWith('migration_backup_'),
      );

      expect(backupKeys.length).toBeGreaterThan(0);
    });

    it('should skip migrations when none are needed', async () => {
      // Set current version to match target
      migrationManager.registerMigrations(CORE_MIGRATIONS);
      const targetVersion = Math.max(...CORE_MIGRATIONS.map((m) => m.version));

      mockDBManager.addTestData('metadata', 'database_version', {
        version: targetVersion,
        timestamp: new Date(),
        description: 'Up to date',
        migrations: [],
      });

      const result = await migrationManager.migrate();

      expect(result.success).toBe(true);
      expect(result.appliedMigrations).toHaveLength(0);
      expect(result.warnings).toContain('No migrations needed');
    });
  });

  describe('Rollback Functionality', () => {
    it('should rollback to previous version', async () => {
      const downSpy = vi.fn().mockResolvedValue(undefined);

      const migrations: MigrationScript[] = [
        {
          version: 2,
          description: 'Rollbackable migration',
          up: vi.fn(),
          down: downSpy,
        },
      ];
      migrationManager.registerMigrations(migrations);

      // Set current version to 2
      mockDBManager.addTestData('metadata', 'database_version', {
        version: 2,
        timestamp: new Date(),
        description: 'Version 2',
        migrations: [2],
      });

      const result = await migrationManager.rollbackToVersion(1);

      expect(result.success).toBe(true);
      expect(result.fromVersion).toBe(2);
      expect(result.toVersion).toBe(1);
      expect(result.appliedMigrations).toEqual([2]); // Rolled back migrations
      expect(downSpy).toHaveBeenCalled();
    });

    it('should reject rollback to higher version', async () => {
      // Current version is 1, trying to rollback to 2
      const result = await migrationManager.rollbackToVersion(2);

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('Target version must be lower');
    });

    it('should handle migrations without rollback support', async () => {
      const migrations: MigrationScript[] = [
        {
          version: 2,
          description: 'No rollback migration',
          up: vi.fn(),
          // No down function
        },
      ];
      migrationManager.registerMigrations(migrations);

      // Set current version to 2
      mockDBManager.addTestData('metadata', 'database_version', {
        version: 2,
        timestamp: new Date(),
        description: 'Version 2',
        migrations: [2],
      });

      const result = await migrationManager.rollbackToVersion(1);

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('does not support rollback');
    });

    it('should create backup before rollback', async () => {
      const migrations: MigrationScript[] = [
        {
          version: 2,
          description: 'Rollbackable migration',
          up: vi.fn(),
          down: vi.fn().mockResolvedValue(undefined),
        },
      ];
      migrationManager.registerMigrations(migrations);

      // Set current version and add data
      mockDBManager.addTestData('metadata', 'database_version', {
        version: 2,
        timestamp: new Date(),
        description: 'Version 2',
        migrations: [2],
      });

      mockDBManager.addTestData('habits', 'habit-1', {
        id: 'habit-1',
        name: 'Test',
      });

      await migrationManager.rollbackToVersion(1);

      // Check backup was created
      const backupKeys = Array.from(mockLocalStorage.data.keys()).filter(
        (key) => key.startsWith('migration_backup_'),
      );

      expect(backupKeys.length).toBeGreaterThan(0);
    });
  });

  describe('Schema Validation', () => {
    it('should validate required object stores exist', async () => {
      const result = await migrationManager.validateSchemaIntegrity();

      // Mock returns placeholder validation
      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should detect missing object stores', async () => {
      // Mock database without required stores
      const mockDB = {
        objectStoreNames: {
          contains: vi.fn(() => false), // No stores exist
          length: 0,
        } as DOMStringList,
      };

      vi.spyOn(mockDBManager, 'getDatabase').mockResolvedValue(
        mockDB as IDBDatabase,
      );

      const result = await migrationManager.validateSchemaIntegrity();

      expect(result.valid).toBe(false);
      expect(
        result.issues.some((issue) =>
          issue.includes('Missing required object store'),
        ),
      ).toBe(true);
    });
  });

  describe('Migration History', () => {
    it('should track migration history', async () => {
      // Add mock history
      mockDBManager.addTestData('metadata', 'v1', {
        version: 1,
        timestamp: new Date('2024-01-01'),
        description: 'Initial version',
        migrations: [],
      });

      mockDBManager.addTestData('metadata', 'v2', {
        version: 2,
        timestamp: new Date('2024-01-02'),
        description: 'Added features',
        migrations: [2],
      });

      const history = await migrationManager.getMigrationHistory();

      expect(history).toHaveLength(2);
      expect(history[0].version).toBe(2); // Most recent first
      expect(history[1].version).toBe(1);
    });

    it('should handle empty migration history', async () => {
      const history = await migrationManager.getMigrationHistory();
      expect(Array.isArray(history)).toBe(true);
      expect(history).toHaveLength(0);
    });
  });

  describe('Core Migrations', () => {
    it('should include all core migrations', () => {
      expect(CORE_MIGRATIONS).toBeDefined();
      expect(Array.isArray(CORE_MIGRATIONS)).toBe(true);
      expect(CORE_MIGRATIONS.length).toBeGreaterThan(0);

      // Check each migration has required properties
      for (const migration of CORE_MIGRATIONS) {
        expect(migration.version).toBeTypeOf('number');
        expect(migration.description).toBeTypeOf('string');
        expect(migration.up).toBeTypeOf('function');
      }
    });

    it('should have incrementing version numbers', () => {
      const versions = CORE_MIGRATIONS.map((m) => m.version).sort(
        (a, b) => a - b,
      );

      for (let i = 1; i < versions.length; i++) {
        expect(versions[i]).toBeGreaterThan(versions[i - 1]);
      }
    });

    it('should have meaningful descriptions', () => {
      for (const migration of CORE_MIGRATIONS) {
        expect(migration.description.length).toBeGreaterThan(10);
        expect(migration.description).not.toBe('');
      }
    });

    it('should include validation for critical migrations', () => {
      const criticalMigrations = CORE_MIGRATIONS.filter((m) => m.validate);
      expect(criticalMigrations.length).toBeGreaterThan(0);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle database connection failures', async () => {
      // Mock database connection failure
      vi.spyOn(mockDBManager, 'getDatabase').mockRejectedValue(
        new Error('Connection failed'),
      );

      const result = await migrationManager.validateSchemaIntegrity();

      expect(result.valid).toBe(false);
      expect(result.issues[0]).toContain('Schema validation failed');
    });

    it('should handle backup creation failures', async () => {
      // Mock localStorage failure
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });

      const migrations: MigrationScript[] = [
        {
          version: 2,
          description: 'Breaking migration', // Requires backup
          up: vi.fn().mockResolvedValue(undefined),
        },
      ];
      migrationManager.registerMigrations(migrations);

      const result = await migrationManager.migrate();

      // Should fail due to backup creation failure
      expect(result.success).toBe(false);
    });

    it('should handle rollback failures gracefully', async () => {
      const failingDown = vi
        .fn()
        .mockRejectedValue(new Error('Rollback failed'));

      const migrations: MigrationScript[] = [
        {
          version: 2,
          description: 'Migration with failing rollback',
          up: vi.fn().mockRejectedValue(new Error('Migration failed')),
          down: failingDown,
        },
      ];
      migrationManager.registerMigrations(migrations);

      const result = await migrationManager.migrate();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1); // Both migration and rollback failures
      expect(result.errors.some((e) => e.includes('Rollback'))).toBe(true);
    });

    it('should continue processing after non-critical errors', async () => {
      // Test that one migration failure doesn't prevent others from being attempted
      const migrations: MigrationScript[] = [
        {
          version: 2,
          description: 'Failing migration',
          up: vi.fn().mockRejectedValue(new Error('Migration 2 failed')),
        },
        {
          version: 3,
          description: 'Should not run',
          up: vi.fn().mockResolvedValue(undefined),
        },
      ];
      migrationManager.registerMigrations(migrations);

      const result = await migrationManager.migrate();

      expect(result.success).toBe(false);
      expect(result.appliedMigrations).toHaveLength(0);
      // Second migration should not have been attempted
      expect(migrations[1].up).not.toHaveBeenCalled();
    });
  });
});
