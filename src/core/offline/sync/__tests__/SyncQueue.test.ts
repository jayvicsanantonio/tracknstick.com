// Unit tests for SyncQueue class
// Tests operation queuing, deduplication, dependency tracking, and retry logic

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SyncQueue } from '../SyncQueue';
import { SyncOperation } from '../../types';
import { IDBManager } from '../../interfaces';

// Mock IDBManager for testing
const createMockIDBManager = (): IDBManager => {
  const storage = new Map<string, any>();

  return {
    initialize: vi.fn().mockResolvedValue(undefined),
    close: vi.fn(),
    get: vi.fn().mockImplementation(async (storeName: string, id: string) => {
      return storage.get(`${storeName}:${id}`);
    }),
    getAll: vi.fn().mockImplementation(async (storeName: string) => {
      const results: any[] = [];
      for (const [key, value] of storage.entries()) {
        if (key.startsWith(`${storeName}:`)) {
          results.push(value);
        }
      }
      return results;
    }),
    put: vi.fn().mockImplementation(async (storeName: string, data: any) => {
      const key = `${storeName}:${data.id}`;
      storage.set(key, { ...data });
      return data.id;
    }),
    delete: vi
      .fn()
      .mockImplementation(async (storeName: string, id: string) => {
        storage.delete(`${storeName}:${id}`);
      }),
    clear: vi.fn().mockImplementation(async (storeName: string) => {
      for (const key of storage.keys()) {
        if (key.startsWith(`${storeName}:`)) {
          storage.delete(key);
        }
      }
    }),
    putMany: vi.fn(),
    deleteMany: vi.fn(),
    getByIndex: vi.fn(),
    getByDateRange: vi.fn(),
    count: vi
      .fn()
      .mockImplementation(
        async (storeName: string, indexName?: string, value?: any) => {
          if (!indexName) {
            let count = 0;
            for (const key of storage.keys()) {
              if (key.startsWith(`${storeName}:`)) {
                count++;
              }
            }
            return count;
          }

          // Count by index value
          let count = 0;
          for (const [key, item] of storage.entries()) {
            if (key.startsWith(`${storeName}:`) && item[indexName] === value) {
              count++;
            }
          }
          return count;
        },
      ),
    transaction: vi.fn(),
  };
};

describe('SyncQueue', () => {
  let syncQueue: SyncQueue;
  let mockIDBManager: IDBManager;

  beforeEach(() => {
    mockIDBManager = createMockIDBManager();
    syncQueue = new SyncQueue(mockIDBManager);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('basic queue operations', () => {
    it('should enqueue operation and generate ID', async () => {
      const operation = {
        type: 'CREATE' as const,
        entity: 'HABIT' as const,
        entityId: 'habit1',
        data: { name: 'Test Habit' },
        maxRetries: 3,
      };

      const operationId = await syncQueue.enqueue(operation);

      expect(operationId).toBeDefined();
      expect(typeof operationId).toBe('string');
      expect(mockIDBManager.put).toHaveBeenCalledWith(
        'syncQueue',
        expect.objectContaining({
          id: operationId,
          type: 'CREATE',
          entity: 'HABIT',
          entityId: 'habit1',
          status: 'PENDING',
          retryCount: 0,
        }),
      );
    });

    it('should dequeue operation and mark as in progress', async () => {
      const operation = {
        type: 'UPDATE' as const,
        entity: 'HABIT' as const,
        entityId: 'habit1',
        data: { name: 'Updated Habit' },
        maxRetries: 3,
      };

      const operationId = await syncQueue.enqueue(operation);
      const dequeuedOp = await syncQueue.dequeue();

      expect(dequeuedOp).toBeDefined();
      expect(dequeuedOp?.id).toBe(operationId);
      expect(dequeuedOp?.status).toBe('IN_PROGRESS');
    });

    it('should return null when dequeuing from empty queue', async () => {
      const result = await syncQueue.dequeue();
      expect(result).toBeNull();
    });

    it('should peek at next operation without removing it', async () => {
      const operation = {
        type: 'DELETE' as const,
        entity: 'HABIT_ENTRY' as const,
        entityId: 'entry1',
        maxRetries: 2,
      };

      const operationId = await syncQueue.enqueue(operation);
      const peekedOp = await syncQueue.peek();
      const allOps = await syncQueue.getAll();

      expect(peekedOp?.id).toBe(operationId);
      expect(peekedOp?.status).toBe('PENDING');
      expect(allOps).toHaveLength(1);
      expect(allOps[0].status).toBe('PENDING');
    });

    it('should get all operations', async () => {
      const ops = [
        {
          type: 'CREATE' as const,
          entity: 'HABIT' as const,
          entityId: 'habit1',
          maxRetries: 3,
        },
        {
          type: 'UPDATE' as const,
          entity: 'HABIT' as const,
          entityId: 'habit2',
          maxRetries: 3,
        },
      ];

      await syncQueue.enqueue(ops[0]);
      await syncQueue.enqueue(ops[1]);

      const allOperations = await syncQueue.getAll();
      expect(allOperations).toHaveLength(2);
    });

    it('should return correct queue size', async () => {
      expect(await syncQueue.size()).toBe(0);

      await syncQueue.enqueue({
        type: 'CREATE' as const,
        entity: 'HABIT' as const,
        entityId: 'habit1',
        maxRetries: 3,
      });

      expect(await syncQueue.size()).toBe(1);
    });

    it('should clear all operations', async () => {
      await syncQueue.enqueue({
        type: 'CREATE' as const,
        entity: 'HABIT' as const,
        entityId: 'habit1',
        maxRetries: 3,
      });

      expect(await syncQueue.size()).toBe(1);
      await syncQueue.clear();
      expect(await syncQueue.size()).toBe(0);
    });
  });

  describe('operation status management', () => {
    it('should mark operation as completed', async () => {
      const operationId = await syncQueue.enqueue({
        type: 'CREATE' as const,
        entity: 'HABIT' as const,
        entityId: 'habit1',
        maxRetries: 3,
      });

      await syncQueue.markCompleted(operationId);

      expect(mockIDBManager.put).toHaveBeenCalledWith(
        'syncQueue',
        expect.objectContaining({
          id: operationId,
          status: 'COMPLETED',
        }),
      );
    });

    it('should mark operation as failed and increment retry count', async () => {
      const operationId = await syncQueue.enqueue({
        type: 'UPDATE' as const,
        entity: 'HABIT' as const,
        entityId: 'habit1',
        maxRetries: 3,
      });

      await syncQueue.markFailed(operationId, 'Network error');

      expect(mockIDBManager.put).toHaveBeenCalledWith(
        'syncQueue',
        expect.objectContaining({
          id: operationId,
          status: 'PENDING',
          retryCount: 1,
          error: 'Network error',
        }),
      );
    });

    it('should mark operation as failed permanently after max retries', async () => {
      const operationId = await syncQueue.enqueue({
        type: 'DELETE' as const,
        entity: 'HABIT' as const,
        entityId: 'habit1',
        maxRetries: 1,
      });

      // First failure
      await syncQueue.markFailed(operationId, 'First error');

      // Get the operation to check current state
      const op1 = await mockIDBManager.get('syncQueue', operationId);
      expect(op1.status).toBe('FAILED');
      expect(op1.retryCount).toBe(1);
    });

    it('should retry failed operation within retry limit', async () => {
      const operationId = await syncQueue.enqueue({
        type: 'CREATE' as const,
        entity: 'HABIT' as const,
        entityId: 'habit1',
        maxRetries: 3,
      });

      // Mark as failed twice to make it actually FAILED status
      await syncQueue.markFailed(operationId, 'Temporary error');
      await syncQueue.markFailed(operationId, 'Temporary error');
      await syncQueue.markFailed(operationId, 'Temporary error');

      // Now mark as failed and retry within limit by using maxRetries 5
      const op = await mockIDBManager.get('syncQueue', operationId);
      op.maxRetries = 5; // Increase limit
      await mockIDBManager.put('syncQueue', op);

      // Retry
      await syncQueue.retry(operationId);

      expect(mockIDBManager.put).toHaveBeenLastCalledWith(
        'syncQueue',
        expect.objectContaining({
          id: operationId,
          status: 'PENDING',
          error: undefined,
        }),
      );
    });

    it('should throw error when marking non-existent operation', async () => {
      await expect(syncQueue.markCompleted('non-existent')).rejects.toThrow(
        'Operation not found: non-existent',
      );

      await expect(
        syncQueue.markFailed('non-existent', 'error'),
      ).rejects.toThrow('Operation not found: non-existent');

      await expect(syncQueue.retry('non-existent')).rejects.toThrow(
        'Operation not found: non-existent',
      );
    });
  });

  describe('operation deduplication and merging', () => {
    it('should merge duplicate UPDATE operations', async () => {
      const baseOperation = {
        type: 'UPDATE' as const,
        entity: 'HABIT' as const,
        entityId: 'habit1',
        data: { name: 'Original Name' },
        maxRetries: 3,
      };

      const duplicateOperation = {
        type: 'UPDATE' as const,
        entity: 'HABIT' as const,
        entityId: 'habit1',
        data: { description: 'New Description' },
        maxRetries: 3,
      };

      const firstId = await syncQueue.enqueue(baseOperation);
      const secondId = await syncQueue.enqueue(duplicateOperation);

      // Should return the same ID (merged)
      expect(secondId).toBe(firstId);

      const operations = await syncQueue.getAll();
      expect(operations).toHaveLength(1);
      expect(operations[0].data).toEqual({
        name: 'Original Name',
        description: 'New Description',
      });
    });

    it('should replace operation when types differ', async () => {
      const createOp = {
        type: 'CREATE' as const,
        entity: 'HABIT' as const,
        entityId: 'habit1',
        data: { name: 'Test Habit' },
        maxRetries: 3,
      };

      const deleteOp = {
        type: 'DELETE' as const,
        entity: 'HABIT' as const,
        entityId: 'habit1',
        maxRetries: 3,
      };

      const firstId = await syncQueue.enqueue(createOp);
      const secondId = await syncQueue.enqueue(deleteOp);

      expect(secondId).toBe(firstId);

      const operations = await syncQueue.getAll();
      expect(operations).toHaveLength(1);
      expect(operations[0].type).toBe('DELETE');
    });
  });

  describe('dependency tracking', () => {
    it('should not dequeue operation with unsatisfied dependencies', async () => {
      // Create operation with dependency
      const operation = {
        type: 'UPDATE' as const,
        entity: 'HABIT' as const,
        entityId: 'habit1',
        dependencies: ['dependency-id'],
        maxRetries: 3,
      };

      await syncQueue.enqueue(operation);
      const dequeuedOp = await syncQueue.dequeue();

      expect(dequeuedOp).toBeNull();
    });

    it('should dequeue operation when dependencies are satisfied', async () => {
      // Create dependency operation and mark as completed
      const dependencyOp: SyncOperation = {
        id: 'dependency-id',
        type: 'CREATE',
        entity: 'HABIT',
        entityId: 'habit0',
        timestamp: new Date(),
        retryCount: 0,
        maxRetries: 3,
        status: 'COMPLETED',
      };

      await mockIDBManager.put('syncQueue', dependencyOp);

      // Create operation that depends on the above
      const operation = {
        type: 'UPDATE' as const,
        entity: 'HABIT' as const,
        entityId: 'habit1',
        dependencies: ['dependency-id'],
        maxRetries: 3,
      };

      await syncQueue.enqueue(operation);
      const dequeuedOp = await syncQueue.dequeue();

      expect(dequeuedOp).toBeDefined();
      expect(dequeuedOp?.dependencies).toContain('dependency-id');
    });
  });

  describe('retry logic and exponential backoff', () => {
    it('should return correct retry delays', () => {
      expect(syncQueue.getRetryDelay(0)).toBe(1000);
      expect(syncQueue.getRetryDelay(1)).toBe(2000);
      expect(syncQueue.getRetryDelay(2)).toBe(5000);
      expect(syncQueue.getRetryDelay(10)).toBe(5000); // Max delay
    });

    it('should get failed operations', async () => {
      const operationId = await syncQueue.enqueue({
        type: 'CREATE' as const,
        entity: 'HABIT' as const,
        entityId: 'habit1',
        maxRetries: 1,
      });

      // Mark as failed permanently
      await syncQueue.markFailed(operationId, 'Permanent error');
      await syncQueue.markFailed(operationId, 'Permanent error again');

      const failedOps = await syncQueue.getFailedOperations();
      expect(failedOps).toHaveLength(1);
      expect(failedOps[0].status).toBe('FAILED');
    });

    it('should count pending and in-progress operations', async () => {
      expect(await syncQueue.getPendingCount()).toBe(0);
      expect(await syncQueue.getInProgressCount()).toBe(0);

      // Add pending operation
      await syncQueue.enqueue({
        type: 'CREATE' as const,
        entity: 'HABIT' as const,
        entityId: 'habit1',
        maxRetries: 3,
      });

      expect(await syncQueue.getPendingCount()).toBe(1);

      // Dequeue to mark as in progress
      await syncQueue.dequeue();
      expect(await syncQueue.getInProgressCount()).toBe(1);
      expect(await syncQueue.getPendingCount()).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle operations without data', async () => {
      const operation = {
        type: 'DELETE' as const,
        entity: 'HABIT' as const,
        entityId: 'habit1',
        maxRetries: 3,
      };

      const operationId = await syncQueue.enqueue(operation);
      const dequeuedOp = await syncQueue.dequeue();

      expect(dequeuedOp?.id).toBe(operationId);
      expect(dequeuedOp?.data).toBeUndefined();
    });

    it('should handle operations without dependencies', async () => {
      const operation = {
        type: 'CREATE' as const,
        entity: 'HABIT' as const,
        entityId: 'habit1',
        maxRetries: 3,
      };

      await syncQueue.enqueue(operation);
      const dequeuedOp = await syncQueue.dequeue();

      expect(dequeuedOp).toBeDefined();
      expect(dequeuedOp?.dependencies).toBeUndefined();
    });

    it('should handle empty dependencies array', async () => {
      const operation = {
        type: 'UPDATE' as const,
        entity: 'HABIT' as const,
        entityId: 'habit1',
        dependencies: [],
        maxRetries: 3,
      };

      await syncQueue.enqueue(operation);
      const dequeuedOp = await syncQueue.dequeue();

      expect(dequeuedOp).toBeDefined();
      expect(dequeuedOp?.dependencies).toEqual([]);
    });
  });
});
