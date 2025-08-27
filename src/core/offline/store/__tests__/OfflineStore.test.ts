// Unit tests for OfflineStore class
// Tests habit operations, sync coordination, and conflict resolution

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OfflineStore } from '../OfflineStore';
import { IDBManager } from '../../database/IDBManager';
import { SyncQueue } from '../../sync/SyncQueue';
import { ConnectivityMonitor } from '../../connectivity/ConnectivityMonitor';
import { ConflictManager } from '../../conflict/ConflictManager';
import { OfflineHabit, HabitEntry, SyncStatus } from '../../types';

// Mock dependencies
vi.mock('../../database/IDBManager');
vi.mock('../../sync/SyncQueue');
vi.mock('../../connectivity/ConnectivityMonitor');
vi.mock('../../conflict/ConflictManager');

describe('OfflineStore', () => {
  let offlineStore: OfflineStore;
  let mockDBManager: vi.Mocked<IDBManager>;
  let mockSyncQueue: vi.Mocked<SyncQueue>;
  let mockConnectivityMonitor: vi.Mocked<ConnectivityMonitor>;
  let mockConflictManager: vi.Mocked<ConflictManager>;

  const mockHabit: OfflineHabit = {
    id: 'habit-1',
    name: 'Exercise',
    icon: 'dumbbell',
    frequency: [1, 2, 3, 4, 5], // weekdays
    completed: false,
    startDate: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    synced: true,
    version: 1,
  };

  const mockHabitEntry: HabitEntry = {
    id: 'habit-1_2024-01-01',
    habitId: 'habit-1',
    date: new Date('2024-01-01'),
    completed: true,
    lastModified: new Date('2024-01-01'),
    synced: true,
    version: 1,
  };

  beforeEach(() => {
    mockDBManager = {
      initialize: vi.fn().mockResolvedValue(undefined),
      close: vi.fn(),
      get: vi.fn(),
      getAll: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
      putMany: vi.fn(),
      deleteMany: vi.fn(),
      getByIndex: vi.fn(),
      getByDateRange: vi.fn(),
      count: vi.fn(),
      transaction: vi.fn(),
    } as any;

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

    mockConnectivityMonitor = {
      isOnline: vi.fn().mockReturnValue(true),
      getStatus: vi.fn().mockReturnValue({
        online: true,
        quality: 'good',
        lastOnline: new Date(),
        lastOffline: null,
      }),
      subscribe: vi.fn().mockReturnValue(() => {}),
      checkConnectivity: vi.fn(),
      assessQuality: vi.fn(),
    } as any;

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

  describe('initialization', () => {
    it('should initialize the database manager', async () => {
      await offlineStore.initialize();
      expect(mockDBManager.initialize).toHaveBeenCalled();
    });
  });

  describe('habit operations', () => {
    describe('getHabits', () => {
      it('should return all non-deleted habits', async () => {
        const habits = [
          mockHabit,
          { ...mockHabit, id: 'habit-2', deleted: true },
        ];
        mockDBManager.getAll.mockResolvedValue(habits);

        const result = await offlineStore.getHabits();

        expect(mockDBManager.getAll).toHaveBeenCalledWith('habits');
        expect(result).toEqual([mockHabit]);
      });
    });

    describe('getHabit', () => {
      it('should return habit by id if not deleted', async () => {
        mockDBManager.get.mockResolvedValue(mockHabit);

        const result = await offlineStore.getHabit('habit-1');

        expect(mockDBManager.get).toHaveBeenCalledWith('habits', 'habit-1');
        expect(result).toEqual(mockHabit);
      });

      it('should return undefined for deleted habit', async () => {
        mockDBManager.get.mockResolvedValue({ ...mockHabit, deleted: true });

        const result = await offlineStore.getHabit('habit-1');

        expect(result).toBeUndefined();
      });

      it('should return undefined if habit not found', async () => {
        mockDBManager.get.mockResolvedValue(undefined);

        const result = await offlineStore.getHabit('habit-1');

        expect(result).toBeUndefined();
      });
    });

    describe('createHabit', () => {
      it('should create a new habit with temporary ID and queue sync operation', async () => {
        const habitData = {
          name: 'New Exercise',
          icon: 'dumbbell' as const,
          frequency: [1, 2, 3],
          completed: false,
          startDate: new Date('2024-01-01'),
        };

        mockDBManager.put.mockResolvedValue('temp_12345_1');

        const result = await offlineStore.createHabit(habitData);

        expect(result.name).toBe(habitData.name);
        expect(result.id).toMatch(/^temp_/);
        expect(result.tempId).toMatch(/^temp_/);
        expect(result.synced).toBe(false);
        expect(result.version).toBe(1);
        expect(mockDBManager.put).toHaveBeenCalledWith(
          'habits',
          expect.objectContaining(habitData),
        );
        expect(mockSyncQueue.enqueue).toHaveBeenCalledWith({
          type: 'CREATE',
          entity: 'HABIT',
          entityId: 'temp_12345_1',
          data: expect.objectContaining(habitData),
        });
      });
    });

    describe('updateHabit', () => {
      it('should update existing habit and queue sync operation', async () => {
        mockDBManager.get.mockResolvedValue(mockHabit);
        const updates = { name: 'Updated Exercise' };

        const result = await offlineStore.updateHabit('habit-1', updates);

        expect(result.name).toBe('Updated Exercise');
        expect(result.version).toBe(mockHabit.version + 1);
        expect(result.synced).toBe(false);
        expect(mockDBManager.put).toHaveBeenCalledWith(
          'habits',
          expect.objectContaining(updates),
        );
        expect(mockSyncQueue.enqueue).toHaveBeenCalledWith({
          type: 'UPDATE',
          entity: 'HABIT',
          entityId: 'habit-1',
          data: expect.objectContaining(updates),
        });
      });

      it('should throw error if habit not found', async () => {
        mockDBManager.get.mockResolvedValue(undefined);

        await expect(
          offlineStore.updateHabit('habit-1', { name: 'Updated' }),
        ).rejects.toThrow('Habit with id habit-1 not found');
      });

      it('should throw error if habit is deleted', async () => {
        mockDBManager.get.mockResolvedValue({ ...mockHabit, deleted: true });

        await expect(
          offlineStore.updateHabit('habit-1', { name: 'Updated' }),
        ).rejects.toThrow('Habit with id habit-1 not found');
      });
    });

    describe('deleteHabit', () => {
      it('should soft delete habit and queue sync operation', async () => {
        mockDBManager.get.mockResolvedValue(mockHabit);

        await offlineStore.deleteHabit('habit-1');

        expect(mockDBManager.put).toHaveBeenCalledWith(
          'habits',
          expect.objectContaining({
            deleted: true,
            synced: false,
            version: mockHabit.version + 1,
          }),
        );
        expect(mockSyncQueue.enqueue).toHaveBeenCalledWith({
          type: 'DELETE',
          entity: 'HABIT',
          entityId: 'habit-1',
          data: expect.objectContaining({ deleted: true }),
        });
      });

      it('should throw error if habit not found', async () => {
        mockDBManager.get.mockResolvedValue(undefined);

        await expect(offlineStore.deleteHabit('habit-1')).rejects.toThrow(
          'Habit with id habit-1 not found',
        );
      });
    });
  });

  describe('habit entry operations', () => {
    describe('getHabitEntries', () => {
      it('should return all non-deleted entries when no filters provided', async () => {
        const entries = [
          mockHabitEntry,
          { ...mockHabitEntry, id: 'entry-2', deleted: true },
        ];
        mockDBManager.getAll.mockResolvedValue(entries);

        const result = await offlineStore.getHabitEntries();

        expect(mockDBManager.getAll).toHaveBeenCalledWith('habitEntries');
        expect(result).toEqual([mockHabitEntry]);
      });

      it('should return specific entry when habitId and date provided', async () => {
        const date = new Date('2024-01-01');
        mockDBManager.get.mockResolvedValue(mockHabitEntry);

        const result = await offlineStore.getHabitEntries('habit-1', date);

        expect(mockDBManager.get).toHaveBeenCalledWith(
          'habitEntries',
          'habit-1_2024-01-01',
        );
        expect(result).toEqual([mockHabitEntry]);
      });

      it('should return entries for specific habit', async () => {
        mockDBManager.getByIndex.mockResolvedValue([mockHabitEntry]);

        const result = await offlineStore.getHabitEntries('habit-1');

        expect(mockDBManager.getByIndex).toHaveBeenCalledWith(
          'habitEntries',
          'habitId',
          'habit-1',
        );
        expect(result).toEqual([mockHabitEntry]);
      });

      it('should return entries for specific date', async () => {
        const date = new Date('2024-01-01');
        mockDBManager.getByDateRange.mockResolvedValue([mockHabitEntry]);

        const result = await offlineStore.getHabitEntries(undefined, date);

        expect(mockDBManager.getByDateRange).toHaveBeenCalledWith(
          'habitEntries',
          'date',
          expect.any(Date),
          expect.any(Date),
        );
        expect(result).toEqual([mockHabitEntry]);
      });
    });

    describe('createHabitEntry', () => {
      it('should create a new habit entry and queue sync operation', async () => {
        const entryData = {
          habitId: 'habit-1',
          date: new Date('2024-01-01'),
          completed: true,
        };

        const result = await offlineStore.createHabitEntry(entryData);

        expect(result.id).toBe('habit-1_2024-01-01');
        expect(result.synced).toBe(false);
        expect(result.version).toBe(1);
        expect(mockDBManager.put).toHaveBeenCalledWith(
          'habitEntries',
          expect.objectContaining(entryData),
        );
        expect(mockSyncQueue.enqueue).toHaveBeenCalledWith({
          type: 'CREATE',
          entity: 'HABIT_ENTRY',
          entityId: 'habit-1_2024-01-01',
          data: expect.objectContaining(entryData),
        });
      });
    });
  });

  describe('sync operations', () => {
    describe('sync', () => {
      it('should throw error when offline', async () => {
        mockConnectivityMonitor.isOnline.mockReturnValue(false);

        await expect(offlineStore.sync()).rejects.toThrow(
          'Cannot sync while offline',
        );
      });

      it('should throw error when sync already in progress', async () => {
        // Start first sync
        mockSyncQueue.dequeue.mockResolvedValueOnce(null); // Empty queue
        const firstSync = offlineStore.sync();

        // Try to start second sync
        await expect(offlineStore.sync()).rejects.toThrow(
          'Sync already in progress',
        );

        await firstSync; // Clean up
      });

      it('should process sync operations until queue is empty', async () => {
        const operation = {
          id: 'op-1',
          type: 'CREATE' as const,
          entity: 'HABIT' as const,
          entityId: 'habit-1',
          data: mockHabit,
          timestamp: new Date(),
          retryCount: 0,
          maxRetries: 3,
          status: 'PENDING' as const,
        };

        mockSyncQueue.dequeue
          .mockResolvedValueOnce(operation)
          .mockResolvedValueOnce(null);

        await offlineStore.sync();

        expect(mockSyncQueue.markCompleted).toHaveBeenCalledWith('op-1');
        expect(mockDBManager.put).toHaveBeenCalledWith(
          'habits',
          expect.objectContaining({
            synced: true,
          }),
        );
      });

      it('should handle sync operation failures', async () => {
        const operation = {
          id: 'op-1',
          type: 'CREATE' as const,
          entity: 'HABIT' as const,
          entityId: 'habit-1',
          data: mockHabit,
          timestamp: new Date(),
          retryCount: 0,
          maxRetries: 3,
          status: 'PENDING' as const,
        };

        mockSyncQueue.dequeue
          .mockResolvedValueOnce(operation)
          .mockResolvedValueOnce(null);
        mockDBManager.put.mockRejectedValueOnce(new Error('Database error'));

        await offlineStore.sync(); // Should not throw

        expect(mockSyncQueue.markFailed).toHaveBeenCalledWith(
          'op-1',
          'Database error',
        );
      });
    });

    describe('getSyncStatus', () => {
      it('should return current sync status', async () => {
        mockSyncQueue.size.mockResolvedValue(5);
        mockDBManager.count.mockResolvedValue(2);
        mockDBManager.get
          .mockResolvedValueOnce({ value: '2024-01-01T10:00:00.000Z' })
          .mockResolvedValueOnce({ value: '2024-01-01T09:00:00.000Z' });

        const status = await offlineStore.getSyncStatus();

        expect(status).toEqual({
          inProgress: false,
          pendingOperations: 5,
          lastSync: new Date('2024-01-01T10:00:00.000Z'),
          lastSyncSuccess: new Date('2024-01-01T09:00:00.000Z'),
          conflicts: 2,
        });
      });
    });

    describe('resolveConflicts', () => {
      it('should resolve all conflicts and queue sync operations', async () => {
        const conflict = {
          id: 'conflict-1',
          entityType: 'HABIT' as const,
          entityId: 'habit-1',
          localData: mockHabit,
          serverData: { ...mockHabit, name: 'Server Habit' },
          timestamp: new Date(),
          resolved: false,
        };

        mockDBManager.getAll.mockResolvedValue([conflict]);
        mockConflictManager.presentConflict.mockResolvedValue('LOCAL');
        mockConflictManager.resolveConflict.mockResolvedValue(mockHabit);

        await offlineStore.resolveConflicts();

        expect(mockConflictManager.resolveConflict).toHaveBeenCalledWith(
          conflict,
          'LOCAL',
        );
        expect(mockDBManager.put).toHaveBeenCalledWith('habits', mockHabit);
        expect(mockDBManager.delete).toHaveBeenCalledWith(
          'conflicts',
          'conflict-1',
        );
        expect(mockSyncQueue.enqueue).toHaveBeenCalledWith({
          type: 'UPDATE',
          entity: 'HABIT',
          entityId: 'habit-1',
          data: mockHabit,
        });
      });
    });
  });

  describe('connectivity', () => {
    it('should return connectivity status', () => {
      const status = {
        online: true,
        quality: 'good' as const,
        lastOnline: new Date(),
        lastOffline: null,
      };
      mockConnectivityMonitor.getStatus.mockReturnValue(status);

      const result = offlineStore.getConnectivityStatus();

      expect(result).toBe(status);
    });

    it('should subscribe to connectivity changes', () => {
      const callback = vi.fn();
      const unsubscribe = vi.fn();
      mockConnectivityMonitor.subscribe.mockReturnValue(unsubscribe);

      const result = offlineStore.onConnectivityChange(callback);

      expect(mockConnectivityMonitor.subscribe).toHaveBeenCalledWith(callback);
      expect(result).toBe(unsubscribe);
    });
  });
});
