// Integration tests for habit entry tracking and completion scenarios
// Tests end-to-end workflows for habit completion, conflict resolution, and offline functionality

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OfflineStore } from '../store/OfflineStore';
import { IDBManager } from '../database/IDBManager';
import { SyncQueue } from '../sync/SyncQueue';
import { ConnectivityMonitor } from '../connectivity/ConnectivityMonitor';
import { ConflictManager } from '../conflict/ConflictManager';
import { ConflictResolver } from '../conflict/ConflictResolver';
import { OfflineHabit, HabitEntry } from '../types';

// Mock all dependencies
vi.mock('../database/IDBManager');
vi.mock('../sync/SyncQueue');
vi.mock('../connectivity/ConnectivityMonitor');
vi.mock('../conflict/ConflictManager');
vi.mock('../conflict/ConflictResolver');

describe('Habit Entry Integration Tests', () => {
  let offlineStore: OfflineStore;
  let mockDBManager: vi.Mocked<IDBManager>;
  let mockSyncQueue: vi.Mocked<SyncQueue>;
  let mockConnectivityMonitor: vi.Mocked<ConnectivityMonitor>;
  let mockConflictManager: vi.Mocked<ConflictManager>;
  let mockConflictResolver: vi.Mocked<ConflictResolver>;

  const mockHabit: OfflineHabit = {
    id: 'habit-1',
    name: 'Exercise',
    icon: 'dumbbell',
    frequency: [1, 2, 3, 4, 5], // Weekdays
    startDate: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    synced: true,
    version: 1,
  };

  beforeEach(() => {
    // Mock IDBManager
    mockDBManager = {
      initialize: vi.fn().mockResolvedValue(undefined),
      close: vi.fn(),
      get: vi.fn(),
      getAll: vi.fn(),
      put: vi
        .fn()
        .mockImplementation(async (storeName: string, data: any) => data.id),
      delete: vi.fn(),
      clear: vi.fn(),
      putMany: vi.fn(),
      deleteMany: vi.fn(),
      getByIndex: vi.fn(),
      getByDateRange: vi.fn(),
      count: vi.fn(),
      transaction: vi.fn(),
    } as any;

    // Mock SyncQueue
    mockSyncQueue = {
      enqueue: vi.fn().mockResolvedValue('op-1'),
      dequeue: vi.fn(),
      peek: vi.fn(),
      getAll: vi.fn(),
      markCompleted: vi.fn(),
      markFailed: vi.fn(),
      retry: vi.fn(),
      clear: vi.fn(),
      size: vi.fn().mockResolvedValue(0),
    } as any;

    // Mock ConnectivityMonitor
    mockConnectivityMonitor = {
      isOnline: vi.fn().mockReturnValue(true),
      getStatus: vi.fn().mockReturnValue({
        online: true,
        quality: 'good',
        lastOnline: new Date(),
        lastOffline: null,
      }),
      subscribe: vi.fn(),
      checkConnectivity: vi.fn(),
      assessQuality: vi.fn(),
    } as any;

    // Mock ConflictResolver
    mockConflictResolver = {
      detectConflicts: vi.fn(),
      resolveConflict: vi.fn(),
      presentConflict: vi.fn(),
      mergeData: vi.fn(),
    } as any;

    // Mock ConflictManager
    mockConflictManager = {
      detectConflicts: vi.fn(),
      resolveConflict: vi.fn(),
      presentConflict: vi.fn(),
      mergeData: vi.fn(),
    } as any;

    offlineStore = new OfflineStore(
      mockDBManager,
      mockSyncQueue,
      mockConnectivityMonitor,
      mockConflictManager,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Habit completion workflow', () => {
    it('should create habit entry when completing habit for first time', async () => {
      const date = new Date('2024-01-01');
      mockDBManager.get.mockResolvedValue(undefined); // No existing entry

      const entry = await offlineStore.createHabitEntry({
        habitId: 'habit-1',
        date,
        completed: true,
      });

      expect(entry).toMatchObject({
        id: 'habit-1_2024-01-01',
        habitId: 'habit-1',
        date,
        completed: true,
        synced: false,
        version: 1,
      });

      expect(mockDBManager.put).toHaveBeenCalledWith('habitEntries', entry);
      expect(mockSyncQueue.enqueue).toHaveBeenCalledWith({
        type: 'CREATE',
        entity: 'HABIT_ENTRY',
        entityId: 'habit-1_2024-01-01',
        data: entry,
      });
    });

    it('should update existing entry instead of creating duplicate', async () => {
      const date = new Date('2024-01-01');
      const existingEntry: HabitEntry = {
        id: 'habit-1_2024-01-01',
        habitId: 'habit-1',
        date,
        completed: false,
        lastModified: new Date('2024-01-01'),
        synced: true,
        version: 1,
      };

      mockDBManager.get.mockResolvedValue(existingEntry);

      const result = await offlineStore.createHabitEntry({
        habitId: 'habit-1',
        date,
        completed: true,
      });

      expect(result.completed).toBe(true);
      expect(result.version).toBe(2); // Version incremented
      expect(mockDBManager.put).toHaveBeenCalledWith(
        'habitEntries',
        expect.objectContaining({
          completed: true,
          version: 2,
          synced: false,
        }),
      );
    });

    it('should delete habit entry when uncompleting habit', async () => {
      const date = new Date('2024-01-01');
      const existingEntry: HabitEntry = {
        id: 'habit-1_2024-01-01',
        habitId: 'habit-1',
        date,
        completed: true,
        lastModified: new Date('2024-01-01'),
        synced: true,
        version: 1,
      };

      mockDBManager.get.mockResolvedValue(existingEntry);

      await offlineStore.deleteHabitEntry('habit-1_2024-01-01');

      expect(mockDBManager.put).toHaveBeenCalledWith(
        'habitEntries',
        expect.objectContaining({
          deleted: true,
          synced: false,
          version: 2,
        }),
      );
      expect(mockSyncQueue.enqueue).toHaveBeenCalledWith({
        type: 'DELETE',
        entity: 'HABIT_ENTRY',
        entityId: 'habit-1_2024-01-01',
        data: expect.objectContaining({ deleted: true }),
      });
    });
  });

  describe('Habit completion calculation', () => {
    it('should calculate habits with completion status for given date', async () => {
      const date = new Date('2024-01-01'); // Monday
      const habits = [mockHabit];
      const completedEntry: HabitEntry = {
        id: 'habit-1_2024-01-01',
        habitId: 'habit-1',
        date,
        completed: true,
        lastModified: new Date(),
        synced: true,
        version: 1,
      };

      mockDBManager.getAll.mockResolvedValue(habits);
      mockDBManager.getByIndex.mockResolvedValue([completedEntry]);

      const result = await offlineStore.getHabitsWithCompletion(date);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'habit-1',
        completed: true,
        completionDate: date,
      });
    });

    it('should only return habits scheduled for the given day', async () => {
      const weekendHabit: OfflineHabit = {
        ...mockHabit,
        id: 'habit-2',
        name: 'Weekend Reading',
        frequency: [0, 6], // Weekends only
      };

      const mondayDate = new Date('2024-01-01'); // Monday
      mockDBManager.getAll.mockResolvedValue([mockHabit, weekendHabit]);
      mockDBManager.getByIndex.mockResolvedValue([]);

      const result = await offlineStore.getHabitsWithCompletion(mondayDate);

      // Only the weekday habit should be returned for Monday
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('habit-1');
    });

    it('should respect habit start and end dates', async () => {
      const expiredHabit: OfflineHabit = {
        ...mockHabit,
        id: 'habit-2',
        endDate: new Date('2023-12-31'), // Ended before test date
      };

      const date = new Date('2024-01-01');
      mockDBManager.getAll.mockResolvedValue([mockHabit, expiredHabit]);
      mockDBManager.getByIndex.mockResolvedValue([]);

      const result = await offlineStore.getHabitsWithCompletion(date);

      // Only the active habit should be returned
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('habit-1');
    });
  });

  describe('Completion statistics', () => {
    it('should calculate completion stats for date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-07');
      const habits = [mockHabit];
      const completedEntries: HabitEntry[] = [
        {
          id: 'habit-1_2024-01-01',
          habitId: 'habit-1',
          date: new Date('2024-01-01'),
          completed: true,
          lastModified: new Date(),
          synced: true,
          version: 1,
        },
        {
          id: 'habit-1_2024-01-02',
          habitId: 'habit-1',
          date: new Date('2024-01-02'),
          completed: true,
          lastModified: new Date(),
          synced: true,
          version: 1,
        },
      ];

      mockDBManager.getAll.mockResolvedValue(habits);
      mockDBManager.getByDateRange.mockResolvedValue(completedEntries);

      const stats = await offlineStore.getCompletionStats(startDate, endDate);

      expect(stats.totalHabits).toBe(1);
      expect(stats.completedHabits).toBe(2);
      expect(stats.completionRate).toBeGreaterThan(0);
      expect(stats.lastCompletionDate).toEqual(new Date('2024-01-02'));
    });

    it('should provide daily completion summary', async () => {
      const dates = [new Date('2024-01-01'), new Date('2024-01-02')];
      const habits = [mockHabit];

      // Mock the completion service calls
      mockDBManager.getAll.mockResolvedValue(habits);
      mockDBManager.getByIndex
        .mockResolvedValueOnce([
          {
            // Monday - completed
            id: 'habit-1_2024-01-01',
            habitId: 'habit-1',
            date: new Date('2024-01-01'),
            completed: true,
            lastModified: new Date(),
            synced: true,
            version: 1,
          },
        ])
        .mockResolvedValueOnce([]); // Tuesday - not completed

      const summary = await offlineStore.getDailyCompletionSummary(dates);

      expect(summary.size).toBe(2);
      expect(summary.get('2024-01-01')).toEqual({
        completed: 1,
        total: 1,
        rate: 100,
      });
      expect(summary.get('2024-01-02')).toEqual({
        completed: 0,
        total: 1,
        rate: 0,
      });
    });
  });

  describe('Conflict detection and resolution', () => {
    it('should detect conflicting habit entries', async () => {
      const habitId = 'habit-1';
      const date = new Date('2024-01-01');
      const conflictingEntries: HabitEntry[] = [
        {
          id: 'habit-1_2024-01-01',
          habitId,
          date,
          completed: true,
          lastModified: new Date(),
          synced: true,
          version: 1,
        },
        {
          id: 'habit-1_2024-01-01_conflict',
          habitId,
          date,
          completed: false,
          lastModified: new Date(),
          synced: false,
          version: 2,
        },
      ];

      mockDBManager.getByIndex.mockResolvedValue(conflictingEntries);

      const conflicts = await offlineStore.detectHabitEntryConflicts(
        habitId,
        date,
      );

      expect(conflicts).toEqual(conflictingEntries);
    });

    it('should resolve habit entry conflicts', async () => {
      const habitId = 'habit-1';
      const date = new Date('2024-01-01');
      const conflictingEntries: HabitEntry[] = [
        {
          id: 'habit-1_2024-01-01',
          habitId,
          date,
          completed: true,
          lastModified: new Date(),
          synced: true,
          version: 1,
        },
        {
          id: 'habit-1_2024-01-01_conflict',
          habitId,
          date,
          completed: false,
          lastModified: new Date(),
          synced: false,
          version: 2,
        },
      ];

      const preferredEntry = conflictingEntries[0];

      mockDBManager.getByIndex.mockResolvedValue(conflictingEntries);
      mockDBManager.get
        .mockResolvedValueOnce(conflictingEntries[1]) // For updating conflicting entry
        .mockResolvedValueOnce(conflictingEntries[0]); // For updating preferred entry

      await offlineStore.resolveHabitEntryConflicts(
        habitId,
        date,
        preferredEntry,
      );

      // Should mark conflicting entry as deleted
      expect(mockDBManager.put).toHaveBeenCalledWith(
        'habitEntries',
        expect.objectContaining({
          id: 'habit-1_2024-01-01_conflict',
          deleted: true,
        }),
      );

      // Should ensure preferred entry is active
      expect(mockDBManager.put).toHaveBeenCalledWith(
        'habitEntries',
        expect.objectContaining({
          id: 'habit-1_2024-01-01',
          deleted: false,
          completed: true,
        }),
      );
    });

    it('should handle no conflicts gracefully', async () => {
      const habitId = 'habit-1';
      const date = new Date('2024-01-01');
      const singleEntry: HabitEntry = {
        id: 'habit-1_2024-01-01',
        habitId,
        date,
        completed: true,
        lastModified: new Date(),
        synced: true,
        version: 1,
      };

      mockDBManager.getByIndex.mockResolvedValue([singleEntry]);

      await offlineStore.resolveHabitEntryConflicts(habitId, date, singleEntry);

      // Should not make any updates when no conflicts exist
      expect(mockDBManager.put).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle date normalization correctly', async () => {
      const dateWithTime = new Date('2024-01-01T15:30:45.123Z');
      const normalizedDate = new Date('2024-01-01T00:00:00.000Z');

      await offlineStore.createHabitEntry({
        habitId: 'habit-1',
        date: dateWithTime,
        completed: true,
      });

      // Should use normalized date for entry ID
      expect(mockDBManager.put).toHaveBeenCalledWith(
        'habitEntries',
        expect.objectContaining({
          id: 'habit-1_2024-01-01',
          date: normalizedDate,
        }),
      );
    });

    it('should handle missing habit entries gracefully', async () => {
      const habitId = 'non-existent';
      const date = new Date('2024-01-01');

      mockDBManager.get.mockResolvedValue(undefined);

      const result = await offlineStore.getHabitEntry(habitId, date);

      expect(result).toBeUndefined();
    });

    it('should filter deleted entries from queries', async () => {
      const deletedEntry: HabitEntry = {
        id: 'habit-1_2024-01-01',
        habitId: 'habit-1',
        date: new Date('2024-01-01'),
        completed: true,
        deleted: true,
        lastModified: new Date(),
        synced: true,
        version: 1,
      };

      mockDBManager.getByIndex.mockResolvedValue([deletedEntry]);

      const entries = await offlineStore.getHabitEntries(
        'habit-1',
        new Date('2024-01-01'),
      );

      expect(entries).toEqual([]);
    });

    it('should handle concurrent entry operations', async () => {
      const date = new Date('2024-01-01');
      mockDBManager.get.mockResolvedValue(undefined);

      // Simulate concurrent entry creation
      const promise1 = offlineStore.createHabitEntry({
        habitId: 'habit-1',
        date,
        completed: true,
      });

      const promise2 = offlineStore.createHabitEntry({
        habitId: 'habit-1',
        date,
        completed: false,
      });

      const [result1, result2] = await Promise.all([promise1, promise2]);

      // Both operations should succeed
      expect(result1.id).toBe('habit-1_2024-01-01');
      expect(result2.id).toBe('habit-1_2024-01-01');
      expect(mockSyncQueue.enqueue).toHaveBeenCalledTimes(2);
    });
  });
});
