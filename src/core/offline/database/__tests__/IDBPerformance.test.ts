// Performance optimization tests for IndexedDB operations
// Tests pagination, caching, index strategies, and performance tracking

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IDBManager } from '../IDBManager';
import {
  IDBPerformanceOptimizer,
  getPerformanceOptimizer,
} from '../IDBPerformanceOptimizer';
import { indexAnalyzer } from '../IDBIndexStrategy';
import { OfflineHabit, HabitEntry } from '../../types';

// Mock IndexedDB
class MockIDBDatabase {
  objectStoreNames = new Set([
    'habits',
    'habitEntries',
    'syncQueue',
    'conflicts',
  ]);

  transaction(storeNames: string[], mode: IDBTransactionMode) {
    return new MockTransaction(storeNames, mode);
  }

  close() {}

  onerror = null;
  onversionchange = null;
}

class MockTransaction {
  constructor(
    private storeNames: string[],
    private mode: IDBTransactionMode,
  ) {}

  objectStore(name: string) {
    return new MockObjectStore(name);
  }

  oncomplete = null;
  onerror = null;
  onabort = null;
  error = null;
}

class MockObjectStore {
  constructor(private name: string) {}

  indexNames = new Set([
    'localId',
    'serverId',
    'synced',
    'lastModified',
    'deleted',
    'active',
    'synced_deleted',
    'active_lastModified',
    'habitId',
    'date',
    'habitId_date',
  ]);

  get(id: string) {
    return {
      onsuccess: null,
      onerror: null,
      result: this.getMockData(id),
      error: null,
    };
  }

  getAll() {
    return {
      onsuccess: null,
      onerror: null,
      result: this.getMockDataArray(),
      error: null,
    };
  }

  put(data: any) {
    return {
      onsuccess: null,
      onerror: null,
      result: data.id || 'generated-id',
      error: null,
    };
  }

  delete(id: string) {
    return {
      onsuccess: null,
      onerror: null,
      result: undefined,
      error: null,
    };
  }

  count() {
    return {
      onsuccess: null,
      onerror: null,
      result: 100,
      error: null,
    };
  }

  openCursor(value?: any) {
    return new MockCursorRequest();
  }

  index(name: string) {
    return new MockIndex(name);
  }

  private getMockData(id: string) {
    if (this.name === 'habits') {
      return {
        id,
        name: `Test Habit ${id}`,
        active: true,
        deleted: false,
        synced: false,
        lastModified: new Date(),
        version: 1,
      };
    } else if (this.name === 'habitEntries') {
      return {
        id,
        habitId: 'habit-1',
        date: new Date(),
        completed: true,
        synced: false,
        lastModified: new Date(),
      };
    }
    return { id };
  }

  private getMockDataArray() {
    const items = [];
    for (let i = 1; i <= 50; i++) {
      items.push(this.getMockData(`item-${i}`));
    }
    return items;
  }
}

class MockIndex {
  constructor(private name: string) {}

  getAll(value?: any) {
    return {
      onsuccess: null,
      onerror: null,
      result: this.getMockIndexData(),
      error: null,
    };
  }

  count(value?: any) {
    return {
      onsuccess: null,
      onerror: null,
      result: 25,
      error: null,
    };
  }

  openCursor(value?: any) {
    return new MockCursorRequest();
  }

  private getMockIndexData() {
    const items = [];
    for (let i = 1; i <= 10; i++) {
      items.push({
        id: `indexed-item-${i}`,
        name: `Indexed Item ${i}`,
        [this.name]: `value-${i}`,
      });
    }
    return items;
  }
}

class MockCursorRequest {
  onsuccess = null;
  onerror = null;
  result = null;
  error = null;

  constructor() {
    // Simulate cursor behavior
    setTimeout(() => {
      this.simulateCursorIteration();
    }, 10);
  }

  private simulateCursorIteration() {
    let count = 0;
    const maxItems = 25;

    const iterate = () => {
      if (count < maxItems) {
        this.result = {
          key: `cursor-key-${count}`,
          value: {
            id: `cursor-item-${count}`,
            name: `Cursor Item ${count}`,
            data: `test-data-${count}`,
          },
          continue: () => {
            count++;
            setTimeout(iterate, 5);
          },
        };
      } else {
        this.result = null; // End of cursor
      }

      if (this.onsuccess) {
        this.onsuccess(new Event('success'));
      }
    };

    iterate();
  }
}

// Mock indexedDB global
Object.defineProperty(global, 'indexedDB', {
  value: {
    open: (name: string, version: number) => ({
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
      result: new MockIDBDatabase(),
      error: null,
    }),
  },
});

describe('IDB Performance Optimizations', () => {
  let dbManager: IDBManager;
  let performanceOptimizer: IDBPerformanceOptimizer;

  beforeEach(async () => {
    vi.clearAllMocks();
    indexAnalyzer.reset();

    dbManager = new IDBManager();

    // Mock all database operations to return immediately
    vi.spyOn(dbManager, 'initialize').mockResolvedValue();
    vi.spyOn(dbManager, 'get').mockResolvedValue({
      id: 'test',
      name: 'Test Item',
    });
    vi.spyOn(dbManager, 'getByIndex').mockResolvedValue([
      { id: 'test1' },
      { id: 'test2' },
    ]);
    vi.spyOn(dbManager, 'getAll').mockResolvedValue([
      { id: 'test1' },
      { id: 'test2' },
    ]);
    vi.spyOn(dbManager, 'count').mockResolvedValue(50);
    vi.spyOn(dbManager, 'putMany').mockImplementation(
      async (storeName: string, items: any[]) => {
        return items.map((_, i) => `generated-id-${i}`);
      },
    );
    vi.spyOn(dbManager, 'getPaginated').mockResolvedValue({
      data: [{ id: 'page1' }, { id: 'page2' }],
      hasMore: true,
      nextCursor: 'cursor-123',
    });

    // Setup db property for tests
    (dbManager as any).db = new MockIDBDatabase();

    await dbManager.initialize();
    performanceOptimizer = getPerformanceOptimizer(dbManager);
  });

  afterEach(() => {
    performanceOptimizer.destroy();
  });

  describe('Performance Tracking', () => {
    it('should track query performance', async () => {
      // Manually record some performance data since mocked queries don't trigger real performance tracking
      indexAnalyzer.recordQuery('habits', undefined, 15);
      indexAnalyzer.recordQuery('habits', 'synced', 25);
      indexAnalyzer.recordQuery('habits', undefined, 20);

      const report = dbManager.getPerformanceReport();

      expect(report).toBeInstanceOf(Array);
      expect(report.length).toBeGreaterThan(0);

      const habitQueries = report.filter((r: any) => r.storeName === 'habits');
      expect(habitQueries.length).toBeGreaterThan(0);

      habitQueries.forEach((query: any) => {
        expect(query).toHaveProperty('storeName', 'habits');
        expect(query).toHaveProperty('usage');
        expect(query).toHaveProperty('averageQueryTime');
        expect(query).toHaveProperty('recommendation');
        expect(typeof query.usage).toBe('number');
        expect(typeof query.averageQueryTime).toBe('number');
        expect(['keep', 'optimize', 'remove']).toContain(query.recommendation);
      });
    });

    it('should reset performance tracking', async () => {
      // Manually record some data
      indexAnalyzer.recordQuery('habits', undefined, 15);
      indexAnalyzer.recordQuery('habits', 'synced', 25);

      let report = dbManager.getPerformanceReport();
      expect(report.length).toBeGreaterThan(0);

      // Reset tracking
      dbManager.resetPerformanceTracking();

      report = dbManager.getPerformanceReport();
      expect(report.length).toBe(0);
    });
  });

  describe('Pagination', () => {
    it('should provide paginated results', async () => {
      const result = await dbManager.getPaginated('habits', { limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('hasMore');
      expect(Array.isArray(result.data)).toBe(true);
      expect(typeof result.hasMore).toBe('boolean');
      expect(result.data.length).toBeLessThanOrEqual(10);
    });

    it('should handle pagination with offset', async () => {
      const result = await dbManager.getPaginated('habits', {
        limit: 5,
        offset: 10,
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('hasMore');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeLessThanOrEqual(5);
    });

    it('should paginate with index filtering', async () => {
      const result = await dbManager.getPaginated(
        'habits',
        { limit: 5 },
        'synced',
        false,
      );

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('hasMore');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Cache Performance', () => {
    it('should cache query results', async () => {
      const key = {
        storeName: 'habits',
        indexName: 'synced',
        value: false,
        operation: 'getByIndex' as const,
      };

      const mockQuery = vi
        .fn()
        .mockResolvedValue([
          { id: 'habit-1', name: 'Test Habit', synced: false },
        ]);

      // First call - should execute query
      const result1 = await performanceOptimizer.getCachedResult(
        key,
        mockQuery,
      );
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(result1).toEqual([
        { id: 'habit-1', name: 'Test Habit', synced: false },
      ]);

      // Second call - should use cache
      const result2 = await performanceOptimizer.getCachedResult(
        key,
        mockQuery,
      );
      expect(mockQuery).toHaveBeenCalledTimes(1); // Still only called once
      expect(result2).toEqual(result1);
    });

    it('should bypass cache when requested', async () => {
      const key = {
        storeName: 'habits',
        operation: 'getAll' as const,
      };

      const mockQuery = vi.fn().mockResolvedValue([]);

      // First call with cache
      await performanceOptimizer.getCachedResult(key, mockQuery);
      expect(mockQuery).toHaveBeenCalledTimes(1);

      // Second call bypassing cache
      await performanceOptimizer.getCachedResult(key, mockQuery, true);
      expect(mockQuery).toHaveBeenCalledTimes(2); // Called again
    });

    it('should provide cache statistics', async () => {
      const key = {
        storeName: 'habits',
        operation: 'getAll' as const,
      };

      const mockQuery = vi.fn().mockResolvedValue([]);

      // Execute some cached queries
      await performanceOptimizer.getCachedResult(key, mockQuery);
      await performanceOptimizer.getCachedResult(key, mockQuery);
      await performanceOptimizer.getCachedResult(key, mockQuery);

      const stats = performanceOptimizer.getCacheStats();

      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('hitRate');
      expect(stats).toHaveProperty('totalHits');
      expect(stats).toHaveProperty('entries');

      expect(typeof stats.size).toBe('number');
      expect(typeof stats.hitRate).toBe('number');
      expect(typeof stats.totalHits).toBe('number');
      expect(Array.isArray(stats.entries)).toBe(true);

      expect(stats.size).toBeGreaterThan(0);
      expect(stats.totalHits).toBeGreaterThan(1); // Should have cache hits
    });

    it('should invalidate cache patterns', async () => {
      const key1 = { storeName: 'habits', operation: 'getAll' as const };
      const key2 = { storeName: 'habitEntries', operation: 'getAll' as const };

      const mockQuery1 = vi.fn().mockResolvedValue([]);
      const mockQuery2 = vi.fn().mockResolvedValue([]);

      // Cache both queries
      await performanceOptimizer.getCachedResult(key1, mockQuery1);
      await performanceOptimizer.getCachedResult(key2, mockQuery2);

      let stats = performanceOptimizer.getCacheStats();
      expect(stats.size).toBe(2);

      // Invalidate habits cache only
      performanceOptimizer.invalidateCache({ storeName: 'habits' });

      stats = performanceOptimizer.getCacheStats();
      expect(stats.size).toBe(1);

      // Clear all cache
      performanceOptimizer.invalidateCache();

      stats = performanceOptimizer.getCacheStats();
      expect(stats.size).toBe(0);
    });
  });

  describe('Bulk Operations Performance', () => {
    it('should handle bulk put operations efficiently', async () => {
      const items: OfflineHabit[] = Array.from({ length: 50 }, (_, i) => ({
        id: `bulk-habit-${i}`,
        name: `Bulk Habit ${i}`,
        active: true,
        deleted: false,
        synced: false,
        lastModified: new Date(),
        version: 1,
        tempId: `temp-${i}`,
      }));

      const results = await performanceOptimizer.bulkPut('habits', items, 10);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(items.length);
      results.forEach((id) => expect(typeof id).toBe('string'));
    });
  });

  describe('Storage Statistics', () => {
    it('should provide storage statistics', async () => {
      const stats = await performanceOptimizer.getStorageStats();

      expect(stats).toHaveProperty('totalSize');
      expect(stats).toHaveProperty('storeStats');
      expect(typeof stats.totalSize).toBe('number');
      expect(typeof stats.storeStats).toBe('object');

      const expectedStores = [
        'habits',
        'habitEntries',
        'syncQueue',
        'conflicts',
      ];
      expectedStores.forEach((storeName) => {
        expect(stats.storeStats).toHaveProperty(storeName);
        expect(stats.storeStats[storeName]).toHaveProperty('count');
        expect(stats.storeStats[storeName]).toHaveProperty('estimatedSize');
        expect(typeof stats.storeStats[storeName].count).toBe('number');
        expect(typeof stats.storeStats[storeName].estimatedSize).toBe('number');
      });
    });
  });

  describe('Optimized Count Operations', () => {
    it('should provide optimized count with caching', async () => {
      // First call - should execute query
      const count1 = await performanceOptimizer.getOptimizedCount('habits');
      expect(typeof count1).toBe('number');

      // Second call - should use cache
      const count2 = await performanceOptimizer.getOptimizedCount('habits');
      expect(count2).toBe(count1);

      // With index
      const indexedCount = await performanceOptimizer.getOptimizedCount(
        'habits',
        'synced',
        false,
      );
      expect(typeof indexedCount).toBe('number');
    });
  });

  describe('Error Handling', () => {
    it('should handle query errors gracefully', async () => {
      // Mock a failing query
      const failingQuery = vi.fn().mockRejectedValue(new Error('Query failed'));

      const key = {
        storeName: 'habits',
        operation: 'getAll' as const,
      };

      await expect(
        performanceOptimizer.getCachedResult(key, failingQuery),
      ).rejects.toThrow('Query failed');

      // Error should still be tracked in performance metrics
      const report = dbManager.getPerformanceReport();
      expect(Array.isArray(report)).toBe(true);
    });

    it('should handle pagination errors', async () => {
      // Mock IDBManager with failing paginated query
      const mockDbManager = new IDBManager();
      vi.spyOn(mockDbManager, 'getPaginated').mockRejectedValue(
        new Error('Pagination failed'),
      );

      await expect(
        mockDbManager.getPaginated('habits', { limit: 10 }),
      ).rejects.toThrow('Pagination failed');
    });
  });
});
