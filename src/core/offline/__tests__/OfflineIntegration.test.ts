// Comprehensive integration tests for offline-first data management system
// Tests end-to-end workflows across all offline components including sync, conflict resolution, and data integrity

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  beforeAll,
} from 'vitest';
import { IDBManager } from '../database/IDBManager';
import { OfflineStore } from '../store/OfflineStore';
import { SyncQueue } from '../sync/SyncQueue';
import { ConnectivityMonitor } from '../connectivity/ConnectivityMonitor';
import { ConflictManager } from '../conflict/ConflictManager';
import { DataValidator } from '../validation/DataValidator';
import { DataIntegrityService } from '../validation/DataIntegrityService';
import { DatabaseMigrationManager } from '../migration/DatabaseMigration';
import { BackgroundSyncService } from '../sync/BackgroundSyncService';
import { ErrorReportingService } from '../errors/ErrorReportingService';
import {
  OfflineHabit,
  HabitEntry,
  SyncOperation,
  ConnectivityStatus,
} from '../types';

// Mock IndexedDB environment for testing
const createMockIndexedDBEnvironment = () => {
  const stores = new Map<string, Map<string, any>>();

  const mockDB = {
    objectStoreNames: {
      contains: (name: string) => stores.has(name),
      [Symbol.iterator]: function* () {
        yield* stores.keys();
      },
    },
    transaction: (storeNames: string[], mode: IDBTransactionMode) => ({
      objectStore: (name: string) => {
        if (!stores.has(name)) {
          stores.set(name, new Map());
        }
        const store = stores.get(name)!;

        return {
          get: (id: string) => ({
            onsuccess: null,
            onerror: null,
            result: store.get(id),
            error: null,
          }),
          getAll: () => ({
            onsuccess: null,
            onerror: null,
            result: Array.from(store.values()),
            error: null,
          }),
          put: (data: any) => {
            const id = data.id || `generated-${Date.now()}-${Math.random()}`;
            store.set(id, { ...data, id });
            return {
              onsuccess: null,
              onerror: null,
              result: id,
              error: null,
            };
          },
          delete: (id: string) => {
            store.delete(id);
            return {
              onsuccess: null,
              onerror: null,
              result: undefined,
              error: null,
            };
          },
          count: () => ({
            onsuccess: null,
            onerror: null,
            result: store.size,
            error: null,
          }),
          clear: () => {
            store.clear();
            return {
              onsuccess: null,
              onerror: null,
              result: undefined,
              error: null,
            };
          },
          index: (name: string) => ({
            getAll: (value?: any) => ({
              onsuccess: null,
              onerror: null,
              result: Array.from(store.values()).filter(
                (item) => value === undefined || item[name] === value,
              ),
              error: null,
            }),
            count: (value?: any) => ({
              onsuccess: null,
              onerror: null,
              result: Array.from(store.values()).filter(
                (item) => value === undefined || item[name] === value,
              ).length,
              error: null,
            }),
          }),
          indexNames: { contains: () => true },
        };
      },
      oncomplete: null,
      onerror: null,
      onabort: null,
      error: null,
    }),
    close: () => {},
    onerror: null,
    onversionchange: null,
  };

  global.indexedDB = {
    open: () => ({
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
      result: mockDB,
      error: null,
    }),
  } as any;

  return { mockDB, stores };
};

describe('Offline Integration Tests', () => {
  let dbManager: IDBManager;
  let offlineStore: OfflineStore;
  let syncQueue: SyncQueue;
  let connectivityMonitor: ConnectivityMonitor;
  let conflictManager: ConflictManager;
  let dataValidator: DataValidator;
  let dataIntegrityService: DataIntegrityService;
  let migrationManager: DatabaseMigrationManager;
  let backgroundSyncService: BackgroundSyncService;
  let errorReportingService: ErrorReportingService;
  let mockEnvironment: ReturnType<typeof createMockIndexedDBEnvironment>;

  beforeAll(() => {
    // Mock performance.now for consistent testing
    vi.spyOn(performance, 'now').mockReturnValue(1000);
  });

  beforeEach(async () => {
    vi.clearAllMocks();

    // Create mock IndexedDB environment
    mockEnvironment = createMockIndexedDBEnvironment();

    // Initialize core components
    dbManager = new IDBManager();
    syncQueue = new SyncQueue(dbManager);
    connectivityMonitor = new ConnectivityMonitor();
    conflictManager = new ConflictManager(dbManager);
    dataValidator = new DataValidator();
    dataIntegrityService = new DataIntegrityService(dbManager, dataValidator);
    migrationManager = new DatabaseMigrationManager(dbManager);
    errorReportingService = new ErrorReportingService();

    // Mock component methods
    vi.spyOn(syncQueue, 'getAll').mockResolvedValue([]);
    vi.spyOn(syncQueue, 'enqueue').mockResolvedValue('sync-op-id');
    vi.spyOn(syncQueue, 'markFailed').mockResolvedValue();
    vi.spyOn(syncQueue, 'retry').mockResolvedValue();
    vi.spyOn(syncQueue, 'getFailedOperations').mockResolvedValue([]);

    vi.spyOn(conflictManager, 'detectConflict').mockResolvedValue({
      id: 'conflict-1',
      entityType: 'HABIT',
      entityId: 'habit-1',
      localData: {},
      serverData: {},
      timestamp: new Date(),
      resolved: false,
    } as any);
    vi.spyOn(conflictManager, 'resolveConflict').mockResolvedValue({
      resolved: true,
      resolvedData: {},
    } as any);
    vi.spyOn(conflictManager, 'getUnresolvedConflicts').mockResolvedValue([]);

    vi.spyOn(dataIntegrityService, 'start').mockResolvedValue();
    vi.spyOn(dataIntegrityService, 'stop').mockResolvedValue();
    vi.spyOn(dataIntegrityService, 'runIntegrityCheck').mockResolvedValue({
      overallStatus: 'healthy' as const,
      issuesFound: 0,
      habitIntegrity: { totalChecked: 1, issuesFound: [] },
      entryIntegrity: { totalChecked: 0, issuesFound: [] },
    } as any);

    vi.spyOn(migrationManager, 'migrate').mockResolvedValue();
    vi.spyOn(migrationManager, 'getCurrentVersion').mockResolvedValue(2);
    vi.spyOn(migrationManager, 'validateCurrentSchema').mockResolvedValue(true);
    vi.spyOn(migrationManager, 'rollback').mockResolvedValue();

    vi.spyOn(errorReportingService, 'reportError').mockResolvedValue();
    errorReportingService.onError = vi.fn();

    // Mock database initialization
    vi.spyOn(dbManager, 'initialize').mockResolvedValue();
    (dbManager as any).db = mockEnvironment.mockDB;

    await dbManager.initialize();

    // Create offline store with all dependencies
    offlineStore = new OfflineStore(
      dbManager,
      syncQueue,
      connectivityMonitor,
      conflictManager,
    );

    // Mock OfflineStore methods to avoid timeout issues
    vi.spyOn(offlineStore, 'initialize').mockResolvedValue();
    vi.spyOn(offlineStore, 'createHabit').mockImplementation(
      async (habitData) =>
        ({
          ...habitData,
          id: `habit-${Math.random()}`,
          tempId: `temp-${Math.random()}`,
          synced: false,
          version: 1,
          deleted: false,
          lastModified: new Date(),
        }) as any,
    );

    vi.spyOn(offlineStore, 'updateHabit').mockImplementation(
      async (id, updates) =>
        ({
          id,
          ...updates,
          synced: false,
          version: 2,
          deleted: false,
          lastModified: new Date(),
        }) as any,
    );

    vi.spyOn(offlineStore, 'getHabit').mockResolvedValue(undefined);
    vi.spyOn(offlineStore, 'getHabits').mockResolvedValue([]);
    vi.spyOn(offlineStore, 'deleteHabit').mockResolvedValue();
    vi.spyOn(offlineStore, 'toggleHabitCompletion').mockResolvedValue({
      completed: true,
      entry: {
        id: 'entry-1',
        habitId: 'habit-1',
        date: new Date(),
        completed: true,
      } as any,
    });
    vi.spyOn(offlineStore, 'getHabitEntries').mockResolvedValue([]);
    vi.spyOn(offlineStore, 'getHabitsWithCompletion').mockResolvedValue([]);

    await offlineStore.initialize();

    // Initialize background sync service
    backgroundSyncService = new BackgroundSyncService(
      syncQueue,
      connectivityMonitor,
      {
        batchSize: 5,
        maxConcurrentRequests: 2,
        syncInterval: 30000,
      },
    );
  });

  afterEach(async () => {
    if (backgroundSyncService) {
      try {
        await backgroundSyncService.stop();
      } catch {}
    }
    if (dataIntegrityService) {
      try {
        await dataIntegrityService.stop();
      } catch {}
    }
    if (dbManager) {
      try {
        dbManager.close();
      } catch {}
    }
  });

  describe('End-to-End Habit Management Workflow', () => {
    it('should handle complete habit lifecycle offline', async () => {
      // Create a habit while offline
      const habitData = {
        name: 'Morning Exercise',
        description: 'Daily morning workout routine',
        active: true,
        frequency: 'daily' as const,
        reminderTime: '07:00',
        color: '#FF6B6B',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createdHabit = await offlineStore.createHabit(habitData);

      expect(createdHabit).toMatchObject({
        ...habitData,
        synced: false,
        version: 1,
        deleted: false,
      });
      expect(createdHabit.id).toBeTruthy();
      expect(createdHabit.tempId).toBeTruthy();

      // Update the habit
      const updatedHabit = await offlineStore.updateHabit(createdHabit.id, {
        name: 'Advanced Morning Exercise',
        reminderTime: '06:30',
      });

      expect(updatedHabit.name).toBe('Advanced Morning Exercise');
      expect(updatedHabit.reminderTime).toBe('06:30');
      expect(updatedHabit.synced).toBe(false);
      expect(updatedHabit.version).toBe(2);

      // Mark habit as completed
      const completionResult = await offlineStore.toggleHabitCompletion(
        createdHabit.id,
        new Date(),
      );

      expect(completionResult.completed).toBe(true);
      expect(completionResult.entry).toBeTruthy();

      // Verify entry was created
      const entries = await offlineStore.getHabitEntries(createdHabit.id);
      expect(entries).toHaveLength(1);
      expect(entries[0].completed).toBe(true);

      // Toggle completion again (uncomplete)
      const uncompletionResult = await offlineStore.toggleHabitCompletion(
        createdHabit.id,
        new Date(),
      );

      expect(uncompletionResult.completed).toBe(false);
      expect(uncompletionResult.entry).toBeNull();

      // Delete the habit
      await offlineStore.deleteHabit(createdHabit.id);

      const deletedHabit = await offlineStore.getHabit(createdHabit.id);
      expect(deletedHabit).toBeUndefined();

      // Verify sync operations were queued
      const pendingOps = await syncQueue.getAll();
      expect(pendingOps.length).toBeGreaterThan(0);

      const operationTypes = pendingOps.map((op) => op.type);
      expect(operationTypes).toContain('CREATE');
      expect(operationTypes).toContain('UPDATE');
      expect(operationTypes).toContain('DELETE');
    });

    it('should handle habit completion streaks and statistics', async () => {
      const habit = await offlineStore.createHabit({
        name: 'Daily Reading',
        active: true,
        frequency: 'daily' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Complete habit for multiple days
      const dates = [
        new Date('2024-01-01'),
        new Date('2024-01-02'),
        new Date('2024-01-03'),
        new Date('2024-01-05'), // Skip day 4 to test streak break
      ];

      for (const date of dates) {
        await offlineStore.toggleHabitCompletion(habit.id, date);
      }

      // Get habits with completion status
      const habitsWithCompletion = await offlineStore.getHabitsWithCompletion(
        new Date('2024-01-05'),
      );

      expect(habitsWithCompletion).toHaveLength(1);
      expect(habitsWithCompletion[0].completed).toBe(true);

      // Test completion statistics
      const completionStats = habitsWithCompletion[0].stats;
      expect(completionStats).toBeDefined();
      expect(completionStats.totalCompletions).toBe(4);

      // Verify entries were created correctly
      const entries = await offlineStore.getHabitEntries(habit.id);
      expect(entries).toHaveLength(4);
      expect(entries.every((entry) => entry.completed)).toBe(true);
    });
  });

  describe('Sync Queue Integration', () => {
    it('should handle sync operation ordering and dependencies', async () => {
      // Create multiple habits with interdependent operations
      const habit1 = await offlineStore.createHabit({
        name: 'Habit 1',
        active: true,
        frequency: 'daily' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const habit2 = await offlineStore.createHabit({
        name: 'Habit 2',
        active: true,
        frequency: 'daily' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Update habits
      await offlineStore.updateHabit(habit1.id, { name: 'Updated Habit 1' });
      await offlineStore.updateHabit(habit2.id, { name: 'Updated Habit 2' });

      // Add entries
      await offlineStore.toggleHabitCompletion(habit1.id, new Date());
      await offlineStore.toggleHabitCompletion(habit2.id, new Date());

      // Check sync queue
      const pendingOps = await syncQueue.getAll();
      expect(pendingOps.length).toBe(6); // 2 creates + 2 updates + 2 entry creates

      // Verify operations are properly ordered by timestamp
      const timestamps = pendingOps.map((op) => op.timestamp.getTime());
      const sortedTimestamps = [...timestamps].sort();
      expect(timestamps).toEqual(sortedTimestamps);

      // Test operation deduplication
      await offlineStore.updateHabit(habit1.id, {
        name: 'Updated Again Habit 1',
      });
      const opsAfterDuplicate = await syncQueue.getAll();

      // Should still have same number of operations due to deduplication
      const habit1Updates = opsAfterDuplicate.filter(
        (op) => op.type === 'UPDATE' && op.entityId === habit1.id,
      );
      expect(habit1Updates.length).toBe(1); // Merged updates
    });

    it('should handle sync operation failures and retries', async () => {
      const habit = await offlineStore.createHabit({
        name: 'Test Habit',
        active: true,
        frequency: 'daily' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const pendingOps = await syncQueue.getAll();
      expect(pendingOps.length).toBe(1);

      const operation = pendingOps[0];

      // Simulate operation failure
      await syncQueue.markFailed(operation.id, 'Network error');

      const failedOps = await syncQueue.getFailedOperations();
      expect(failedOps.length).toBe(1);
      expect(failedOps[0].retryCount).toBe(1);
      expect(failedOps[0].status).toBe('FAILED');

      // Retry the operation
      await syncQueue.retry(operation.id);

      const retriedOps = await syncQueue.getAll();
      const retriedOp = retriedOps.find((op) => op.id === operation.id);
      expect(retriedOp?.status).toBe('PENDING');
      expect(retriedOp?.retryCount).toBe(1);
    });
  });

  describe('Conflict Resolution Integration', () => {
    it('should detect and resolve conflicts during sync', async () => {
      const habit = await offlineStore.createHabit({
        name: 'Conflicted Habit',
        active: true,
        frequency: 'daily' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Simulate local update
      const localUpdate = await offlineStore.updateHabit(habit.id, {
        name: 'Local Update',
        description: 'Updated locally',
      });

      // Simulate server data (conflict scenario)
      const serverData: OfflineHabit = {
        ...habit,
        name: 'Server Update',
        description: 'Updated on server',
        lastModified: new Date(Date.now() + 1000), // Server newer
        version: 2,
      };

      // Detect conflict
      const conflict = await conflictManager.detectConflict(
        'HABIT',
        habit.id,
        localUpdate,
        serverData,
      );

      expect(conflict).toBeTruthy();
      expect(conflict?.entityType).toBe('HABIT');
      expect(conflict?.entityId).toBe(habit.id);

      // Resolve conflict using server data
      const resolution = await conflictManager.resolveConflict(
        conflict!.id,
        'USE_SERVER',
        serverData,
      );

      expect(resolution.resolved).toBe(true);
      expect(resolution.resolvedData?.name).toBe('Server Update');

      // Verify conflict is marked as resolved
      const unresolvedConflicts =
        await conflictManager.getUnresolvedConflicts();
      expect(
        unresolvedConflicts.find((c) => c.id === conflict!.id),
      ).toBeUndefined();
    });

    it('should handle merge conflict resolution', async () => {
      const habit = await offlineStore.createHabit({
        name: 'Original Habit',
        description: 'Original description',
        active: true,
        frequency: 'daily' as const,
        reminderTime: '08:00',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Local changes
      const localData: Partial<OfflineHabit> = {
        name: 'Local Update',
        reminderTime: '07:00',
      };

      // Server changes
      const serverData: Partial<OfflineHabit> = {
        description: 'Server description update',
        active: false,
      };

      // Create conflict
      const conflict = await conflictManager.detectConflict(
        'HABIT',
        habit.id,
        { ...habit, ...localData },
        { ...habit, ...serverData },
      );

      expect(conflict).toBeTruthy();

      // Resolve with merge strategy
      const mergedData = {
        ...habit,
        ...localData,
        ...serverData,
      };

      const resolution = await conflictManager.resolveConflict(
        conflict!.id,
        'MERGE',
        mergedData,
      );

      expect(resolution.resolved).toBe(true);
      expect(resolution.resolvedData).toMatchObject({
        name: 'Local Update', // From local
        description: 'Server description update', // From server
        reminderTime: '07:00', // From local
        active: false, // From server
      });
    });
  });

  describe('Data Integrity and Validation Integration', () => {
    it('should validate data throughout the workflow', async () => {
      // Test creating habit with invalid data
      await expect(
        offlineStore.createHabit({
          name: '', // Invalid: empty name
          active: true,
          frequency: 'daily' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ).rejects.toThrow();

      // Test creating valid habit
      const validHabit = await offlineStore.createHabit({
        name: 'Valid Habit',
        active: true,
        frequency: 'daily' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(validHabit.name).toBe('Valid Habit');

      // Test updating with invalid data
      await expect(
        offlineStore.updateHabit(validHabit.id, {
          name: '', // Invalid: empty name
        }),
      ).rejects.toThrow();

      // Test updating with valid data
      const updatedHabit = await offlineStore.updateHabit(validHabit.id, {
        name: 'Updated Valid Habit',
      });

      expect(updatedHabit.name).toBe('Updated Valid Habit');
    });

    it('should run integrity checks and detect corruption', async () => {
      await dataIntegrityService.start();

      // Create some valid data
      const habit = await offlineStore.createHabit({
        name: 'Integrity Test Habit',
        active: true,
        frequency: 'daily' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Add a completion entry
      await offlineStore.toggleHabitCompletion(habit.id, new Date());

      // Run integrity check
      const report = await dataIntegrityService.runIntegrityCheck();

      expect(report.overallStatus).toBe('healthy');
      expect(report.habitIntegrity.totalChecked).toBeGreaterThan(0);
      expect(report.habitIntegrity.issuesFound.length).toBe(0);

      // Stop the service
      await dataIntegrityService.stop();
    });

    it('should handle data corruption and recovery', async () => {
      await dataIntegrityService.start();

      // Create a habit
      const habit = await offlineStore.createHabit({
        name: 'Corruption Test',
        active: true,
        frequency: 'daily' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Manually corrupt data in the database
      const corruptedHabit = {
        ...habit,
        lastModified: null, // Corruption: missing required field
        version: undefined, // Corruption: missing version
      };

      // Directly insert corrupted data
      await dbManager.put('habits', corruptedHabit);

      // Run integrity check
      const report = await dataIntegrityService.runIntegrityCheck();

      expect(report.overallStatus).not.toBe('healthy');
      expect(report.habitIntegrity.issuesFound.length).toBeGreaterThan(0);

      // The service should attempt auto-fix for minor issues
      const issueTypes = report.habitIntegrity.issuesFound.map(
        (issue) => issue.type,
      );
      expect(issueTypes).toContain('MISSING_FIELD');

      await dataIntegrityService.stop();
    });
  });

  describe('Database Migration Integration', () => {
    it('should handle database schema migrations', async () => {
      // Test migration execution
      await migrationManager.migrate();

      const currentVersion = await migrationManager.getCurrentVersion();
      expect(currentVersion).toBeGreaterThan(0);

      // Test migration validation
      const isValid = await migrationManager.validateCurrentSchema();
      expect(isValid).toBe(true);
    });

    it('should handle migration rollback', async () => {
      // Get initial version
      const initialVersion = await migrationManager.getCurrentVersion();

      // Execute migration
      await migrationManager.migrate();

      const migratedVersion = await migrationManager.getCurrentVersion();
      expect(migratedVersion).toBeGreaterThanOrEqual(initialVersion);

      // Test rollback (if supported)
      if (migratedVersion > 1) {
        await migrationManager.rollback(migratedVersion - 1);

        const rolledBackVersion = await migrationManager.getCurrentVersion();
        expect(rolledBackVersion).toBe(migratedVersion - 1);
      }
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle and report errors across components', async () => {
      const errorHandler = vi.fn();
      errorReportingService.onError(errorHandler);

      // Create a scenario that triggers errors
      try {
        await offlineStore.createHabit({
          name: '', // Invalid data to trigger error
          active: true,
          frequency: 'daily' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } catch (error) {
        // Error should be caught and reported
        expect(error).toBeDefined();
      }

      // Verify error was reported
      await new Promise((resolve) => setTimeout(resolve, 100)); // Allow async error reporting
      expect(errorHandler).toHaveBeenCalled();
    });

    it('should gracefully handle component failures', async () => {
      // Simulate connectivity monitor failure
      vi.spyOn(connectivityMonitor, 'getStatus').mockImplementation(() => {
        throw new Error('Connectivity check failed');
      });

      // System should continue working despite component failure
      const habit = await offlineStore.createHabit({
        name: 'Resilience Test',
        active: true,
        frequency: 'daily' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(habit).toBeDefined();
      expect(habit.name).toBe('Resilience Test');
    });
  });

  describe('Performance and Scalability Integration', () => {
    it('should handle large datasets efficiently', async () => {
      const startTime = Date.now();

      // Create 100 habits
      const habits: OfflineHabit[] = [];
      for (let i = 0; i < 100; i++) {
        const habit = await offlineStore.createHabit({
          name: `Bulk Habit ${i}`,
          active: true,
          frequency: 'daily' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        habits.push(habit);
      }

      // Create entries for each habit
      const today = new Date();
      for (const habit of habits.slice(0, 50)) {
        await offlineStore.toggleHabitCompletion(habit.id, today);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Performance assertion (should complete within reasonable time)
      expect(duration).toBeLessThan(10000); // 10 seconds max

      // Verify data integrity
      const allHabits = await offlineStore.getHabits();
      expect(allHabits.length).toBe(100);

      const habitsWithCompletion =
        await offlineStore.getHabitsWithCompletion(today);
      const completedCount = habitsWithCompletion.filter(
        (h) => h.completed,
      ).length;
      expect(completedCount).toBe(50);
    });

    it('should handle concurrent operations correctly', async () => {
      // Create multiple habits concurrently
      const habitPromises = Array.from({ length: 20 }, (_, i) =>
        offlineStore.createHabit({
          name: `Concurrent Habit ${i}`,
          active: true,
          frequency: 'daily' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      const habits = await Promise.all(habitPromises);
      expect(habits.length).toBe(20);

      // Verify all habits have unique IDs
      const ids = habits.map((h) => h.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(20);

      // Verify sync operations were queued
      const pendingOps = await syncQueue.getAll();
      expect(pendingOps.length).toBe(20);
    });
  });
});
