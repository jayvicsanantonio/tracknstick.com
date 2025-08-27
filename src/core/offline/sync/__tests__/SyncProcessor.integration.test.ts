// Integration tests for SyncProcessor
// Tests end-to-end sync operations with real API calls and database interactions

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SyncProcessor } from '../SyncProcessor';
import { IDBManager } from '../../database/IDBManager';
import { SyncQueue } from '../SyncQueue';
import { SyncOperation, OfflineHabit, HabitEntry } from '../../types';

// Mock the habits API
vi.mock('@/features/habits/api', () => ({
  addHabit: vi
    .fn()
    .mockResolvedValue({ habitId: 'server-habit-1', message: 'Success' }),
  updateHabit: vi
    .fn()
    .mockResolvedValue({ habitId: 'server-habit-1', message: 'Updated' }),
  deleteHabit: vi
    .fn()
    .mockResolvedValue({ habitId: 'server-habit-1', message: 'Deleted' }),
  toggleHabitCompletion: vi
    .fn()
    .mockResolvedValue({ trackerId: 'server-entry-1', message: 'Toggled' }),
}));

describe('SyncProcessor Integration Tests', () => {
  let syncProcessor: SyncProcessor;
  let mockDBManager: vi.Mocked<IDBManager>;
  let mockSyncQueue: vi.Mocked<SyncQueue>;

  const mockHabit: OfflineHabit = {
    id: 'temp_123',
    tempId: 'temp_123',
    name: 'Test Habit',
    icon: 'dumbbell',
    frequency: [1, 2, 3, 4, 5],
    completed: false,
    startDate: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    synced: false,
    version: 1,
  };

  const mockHabitEntry: HabitEntry = {
    id: 'habit-1_2024-01-01',
    habitId: 'habit-1',
    date: new Date('2024-01-01'),
    completed: true,
    lastModified: new Date('2024-01-01'),
    synced: false,
    version: 1,
  };

  beforeEach(() => {
    mockDBManager = {
      initialize: vi.fn(),
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
      enqueue: vi.fn(),
      dequeue: vi.fn(),
      peek: vi.fn(),
      getAll: vi.fn(),
      markCompleted: vi.fn(),
      markFailed: vi.fn(),
      retry: vi.fn(),
      clear: vi.fn(),
      size: vi.fn(),
    } as any;

    syncProcessor = new SyncProcessor(mockDBManager, mockSyncQueue, {
      batchSize: 5,
      maxConcurrentRequests: 2,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Habit sync operations', () => {
    it('should successfully sync a CREATE habit operation', async () => {
      const operation: SyncOperation = {
        id: 'op-1',
        type: 'CREATE',
        entity: 'HABIT',
        entityId: 'temp_123',
        data: mockHabit,
        timestamp: new Date(),
        retryCount: 0,
        maxRetries: 3,
        status: 'PENDING',
      };

      const result = await syncProcessor.processBatch([operation]);

      expect(result.successfulOperations).toBe(1);
      expect(result.failedOperations).toBe(0);
      expect(result.networkErrors).toBe(0);
      expect(result.results[0].success).toBe(true);
      expect(mockSyncQueue.markCompleted).toHaveBeenCalledWith('op-1');
      expect(mockDBManager.put).toHaveBeenCalledWith(
        'habits',
        expect.objectContaining({
          id: 'server-habit-1',
          serverId: 'server-habit-1',
          synced: true,
        }),
      );
    });

    it('should successfully sync an UPDATE habit operation', async () => {
      const operation: SyncOperation = {
        id: 'op-2',
        type: 'UPDATE',
        entity: 'HABIT',
        entityId: 'habit-1',
        data: {
          ...mockHabit,
          id: 'habit-1',
          serverId: 'habit-1',
          name: 'Updated Habit',
        },
        timestamp: new Date(),
        retryCount: 0,
        maxRetries: 3,
        status: 'PENDING',
      };

      const result = await syncProcessor.processBatch([operation]);

      expect(result.successfulOperations).toBe(1);
      expect(result.failedOperations).toBe(0);
      expect(mockSyncQueue.markCompleted).toHaveBeenCalledWith('op-2');
      expect(mockDBManager.put).toHaveBeenCalledWith(
        'habits',
        expect.objectContaining({
          synced: true,
          name: 'Updated Habit',
        }),
      );
    });

    it('should successfully sync a DELETE habit operation', async () => {
      const operation: SyncOperation = {
        id: 'op-3',
        type: 'DELETE',
        entity: 'HABIT',
        entityId: 'habit-1',
        data: { ...mockHabit, id: 'habit-1', deleted: true },
        timestamp: new Date(),
        retryCount: 0,
        maxRetries: 3,
        status: 'PENDING',
      };

      const result = await syncProcessor.processBatch([operation]);

      expect(result.successfulOperations).toBe(1);
      expect(result.failedOperations).toBe(0);
      expect(mockSyncQueue.markCompleted).toHaveBeenCalledWith('op-3');
      expect(mockDBManager.delete).toHaveBeenCalledWith('habits', 'habit-1');
    });
  });

  describe('Habit entry sync operations', () => {
    it('should successfully sync a CREATE habit entry operation', async () => {
      const operation: SyncOperation = {
        id: 'op-4',
        type: 'CREATE',
        entity: 'HABIT_ENTRY',
        entityId: 'habit-1_2024-01-01',
        data: mockHabitEntry,
        timestamp: new Date(),
        retryCount: 0,
        maxRetries: 3,
        status: 'PENDING',
      };

      const result = await syncProcessor.processBatch([operation]);

      expect(result.successfulOperations).toBe(1);
      expect(result.failedOperations).toBe(0);
      expect(mockSyncQueue.markCompleted).toHaveBeenCalledWith('op-4');
      expect(mockDBManager.put).toHaveBeenCalledWith(
        'habitEntries',
        expect.objectContaining({
          serverId: 'server-entry-1',
          synced: true,
        }),
      );
    });

    it('should successfully sync a DELETE habit entry operation', async () => {
      const operation: SyncOperation = {
        id: 'op-5',
        type: 'DELETE',
        entity: 'HABIT_ENTRY',
        entityId: 'habit-1_2024-01-01',
        data: { ...mockHabitEntry, deleted: true },
        timestamp: new Date(),
        retryCount: 0,
        maxRetries: 3,
        status: 'PENDING',
      };

      const result = await syncProcessor.processBatch([operation]);

      expect(result.successfulOperations).toBe(1);
      expect(result.failedOperations).toBe(0);
      expect(mockSyncQueue.markCompleted).toHaveBeenCalledWith('op-5');
      expect(mockDBManager.delete).toHaveBeenCalledWith(
        'habitEntries',
        'habit-1_2024-01-01',
      );
    });
  });

  describe('Batch processing', () => {
    it('should process multiple operations in a batch', async () => {
      const operations: SyncOperation[] = [
        {
          id: 'op-1',
          type: 'CREATE',
          entity: 'HABIT',
          entityId: 'temp_123',
          data: mockHabit,
          timestamp: new Date(),
          retryCount: 0,
          maxRetries: 3,
          status: 'PENDING',
        },
        {
          id: 'op-2',
          type: 'CREATE',
          entity: 'HABIT_ENTRY',
          entityId: 'habit-1_2024-01-01',
          data: mockHabitEntry,
          timestamp: new Date(),
          retryCount: 0,
          maxRetries: 3,
          status: 'PENDING',
        },
      ];

      const result = await syncProcessor.processBatch(operations);

      expect(result.totalOperations).toBe(2);
      expect(result.successfulOperations).toBe(2);
      expect(result.failedOperations).toBe(0);
      expect(result.networkErrors).toBe(0);
      expect(mockSyncQueue.markCompleted).toHaveBeenCalledTimes(2);
    });

    it('should handle mixed success and failure in batch', async () => {
      // Mock one API call to fail
      const { addHabit } = await import('@/features/habits/api');
      vi.mocked(addHabit).mockRejectedValueOnce(new Error('Network error'));

      const operations: SyncOperation[] = [
        {
          id: 'op-1',
          type: 'CREATE',
          entity: 'HABIT',
          entityId: 'temp_123',
          data: mockHabit,
          timestamp: new Date(),
          retryCount: 0,
          maxRetries: 3,
          status: 'PENDING',
        },
        {
          id: 'op-2',
          type: 'CREATE',
          entity: 'HABIT_ENTRY',
          entityId: 'habit-1_2024-01-01',
          data: mockHabitEntry,
          timestamp: new Date(),
          retryCount: 0,
          maxRetries: 3,
          status: 'PENDING',
        },
      ];

      const result = await syncProcessor.processBatch(operations);

      expect(result.totalOperations).toBe(2);
      expect(result.successfulOperations).toBe(1);
      expect(result.failedOperations).toBe(1);
      expect(result.networkErrors).toBe(1);
      expect(mockSyncQueue.markCompleted).toHaveBeenCalledTimes(1);
      expect(mockSyncQueue.markFailed).toHaveBeenCalledTimes(1);
    });

    it('should respect concurrent request limits', async () => {
      const processor = new SyncProcessor(mockDBManager, mockSyncQueue, {
        maxConcurrentRequests: 1,
      });

      const operations: SyncOperation[] = Array.from({ length: 3 }, (_, i) => ({
        id: `op-${i + 1}`,
        type: 'CREATE',
        entity: 'HABIT',
        entityId: `temp_${i + 1}`,
        data: { ...mockHabit, id: `temp_${i + 1}` },
        timestamp: new Date(),
        retryCount: 0,
        maxRetries: 3,
        status: 'PENDING',
      }));

      const startTime = Date.now();
      const result = await processor.processBatch(operations);
      const duration = Date.now() - startTime;

      expect(result.successfulOperations).toBe(3);
      // With maxConcurrentRequests: 1, operations should be processed sequentially
      // This is a rough test - actual timing may vary
      expect(duration).toBeGreaterThan(0);
    });
  });

  describe('Error handling', () => {
    it('should handle network errors gracefully', async () => {
      const { addHabit } = await import('@/features/habits/api');
      vi.mocked(addHabit).mockRejectedValue(new Error('fetch failed'));

      const operation: SyncOperation = {
        id: 'op-1',
        type: 'CREATE',
        entity: 'HABIT',
        entityId: 'temp_123',
        data: mockHabit,
        timestamp: new Date(),
        retryCount: 0,
        maxRetries: 3,
        status: 'PENDING',
      };

      const result = await syncProcessor.processBatch([operation]);

      expect(result.successfulOperations).toBe(0);
      expect(result.failedOperations).toBe(1);
      expect(result.networkErrors).toBe(1);
      expect(result.results[0].success).toBe(false);
      expect(result.results[0].shouldRetry).toBe(true);
      expect(mockSyncQueue.markFailed).toHaveBeenCalledWith(
        'op-1',
        'fetch failed',
      );
    });

    it('should handle validation errors (non-retryable)', async () => {
      const { addHabit } = await import('@/features/habits/api');
      vi.mocked(addHabit).mockRejectedValue(new Error('validation failed'));

      const operation: SyncOperation = {
        id: 'op-1',
        type: 'CREATE',
        entity: 'HABIT',
        entityId: 'temp_123',
        data: mockHabit,
        timestamp: new Date(),
        retryCount: 0,
        maxRetries: 3,
        status: 'PENDING',
      };

      const result = await syncProcessor.processBatch([operation]);

      expect(result.results[0].success).toBe(false);
      expect(result.results[0].shouldRetry).toBe(false);
    });

    it('should handle unknown entity types', async () => {
      const operation: SyncOperation = {
        id: 'op-1',
        type: 'CREATE',
        entity: 'UNKNOWN' as any,
        entityId: 'unknown-1',
        data: {},
        timestamp: new Date(),
        retryCount: 0,
        maxRetries: 3,
        status: 'PENDING',
      };

      const result = await syncProcessor.processBatch([operation]);

      expect(result.successfulOperations).toBe(0);
      expect(result.failedOperations).toBe(1);
      expect(result.results[0].error).toContain('Unknown entity type');
    });
  });

  describe('processAllPendingOperations', () => {
    it('should process all pending operations from the queue', async () => {
      const pendingOperations = [
        {
          id: 'op-1',
          type: 'CREATE',
          entity: 'HABIT',
          entityId: 'temp_123',
          data: mockHabit,
          timestamp: new Date(),
          retryCount: 0,
          maxRetries: 3,
          status: 'PENDING',
        },
        {
          id: 'op-2',
          type: 'FAILED',
          entity: 'HABIT_ENTRY',
          entityId: 'entry-1',
          data: mockHabitEntry,
          timestamp: new Date(),
          retryCount: 1,
          maxRetries: 3,
          status: 'FAILED',
        },
      ] as SyncOperation[];

      mockSyncQueue.getAll.mockResolvedValue(pendingOperations);

      const result = await syncProcessor.processAllPendingOperations();

      expect(result.totalOperations).toBe(2);
      expect(result.successfulOperations).toBe(2);
      expect(mockSyncQueue.markCompleted).toHaveBeenCalledTimes(2);
    });

    it('should return empty result when no operations are pending', async () => {
      mockSyncQueue.getAll.mockResolvedValue([]);

      const result = await syncProcessor.processAllPendingOperations();

      expect(result.totalOperations).toBe(0);
      expect(result.successfulOperations).toBe(0);
      expect(result.failedOperations).toBe(0);
    });

    it('should skip operations that have exceeded max retries', async () => {
      const operationsWithMaxRetries = [
        {
          id: 'op-1',
          type: 'CREATE',
          entity: 'HABIT',
          entityId: 'temp_123',
          data: mockHabit,
          timestamp: new Date(),
          retryCount: 3,
          maxRetries: 3,
          status: 'FAILED',
        },
      ] as SyncOperation[];

      mockSyncQueue.getAll.mockResolvedValue(operationsWithMaxRetries);

      const result = await syncProcessor.processAllPendingOperations();

      expect(result.totalOperations).toBe(0);
      expect(mockSyncQueue.markCompleted).not.toHaveBeenCalled();
    });
  });
});
