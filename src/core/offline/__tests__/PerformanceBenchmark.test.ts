// Performance benchmark tests for offline-first data management system
// Tests system performance under various load conditions and datasets

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IDBManager } from '../database/IDBManager';
import { OfflineStore } from '../store/OfflineStore';
import { SyncQueue } from '../sync/SyncQueue';
import { ConnectivityMonitor } from '../connectivity/ConnectivityMonitor';
import { ConflictManager } from '../conflict/ConflictManager';
import { getPerformanceOptimizer } from '../database/IDBPerformanceOptimizer';
import { OfflineHabit, HabitEntry } from '../types';

// Mock IndexedDB for benchmarking
const createBenchmarkMockDB = () => {
  const stores = new Map<string, Map<string, any>>();

  const mockDB = {
    objectStoreNames: { contains: (name: string) => stores.has(name) },
    transaction: (storeNames: string[], mode: IDBTransactionMode) => ({
      objectStore: (name: string) => {
        if (!stores.has(name)) {
          stores.set(name, new Map());
        }
        const store = stores.get(name)!;

        return {
          get: (id: string) => ({ result: store.get(id) }),
          getAll: () => ({ result: Array.from(store.values()) }),
          put: (data: any) => {
            const id = data.id || `generated-${Date.now()}-${Math.random()}`;
            store.set(id, { ...data, id });
            return { result: id };
          },
          delete: (id: string) => {
            store.delete(id);
            return { result: undefined };
          },
          count: () => ({ result: store.size }),
          clear: () => {
            store.clear();
            return { result: undefined };
          },
          index: (name: string) => ({
            getAll: (value?: any) => ({
              result: Array.from(store.values()).filter(
                (item) => value === undefined || item[name] === value,
              ),
            }),
            count: (value?: any) => ({
              result: Array.from(store.values()).filter(
                (item) => value === undefined || item[name] === value,
              ).length,
            }),
          }),
        };
      },
      oncomplete: null,
      onerror: null,
      onabort: null,
    }),
    close: () => {},
  };

  return { mockDB, stores };
};

interface BenchmarkResult {
  operation: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  opsPerSecond: number;
  minTime?: number;
  maxTime?: number;
}

class PerformanceBenchmarker {
  private results: BenchmarkResult[] = [];

  async benchmark(
    operation: string,
    iterations: number,
    fn: () => Promise<any>,
  ): Promise<BenchmarkResult> {
    const times: number[] = [];
    let totalTime = 0;

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      const duration = end - start;

      times.push(duration);
      totalTime += duration;
    }

    const result: BenchmarkResult = {
      operation,
      iterations,
      totalTime,
      averageTime: totalTime / iterations,
      opsPerSecond: (iterations / totalTime) * 1000,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
    };

    this.results.push(result);
    return result;
  }

  getResults(): BenchmarkResult[] {
    return [...this.results];
  }

  clear(): void {
    this.results = [];
  }

  printResults(): void {
    console.table(
      this.results.map((r) => ({
        Operation: r.operation,
        Iterations: r.iterations,
        'Total (ms)': r.totalTime.toFixed(2),
        'Avg (ms)': r.averageTime.toFixed(2),
        'Ops/sec': r.opsPerSecond.toFixed(2),
        'Min (ms)': r.minTime?.toFixed(2),
        'Max (ms)': r.maxTime?.toFixed(2),
      })),
    );
  }
}

describe('Performance Benchmarks', () => {
  let dbManager: IDBManager;
  let offlineStore: OfflineStore;
  let syncQueue: SyncQueue;
  let connectivityMonitor: ConnectivityMonitor;
  let conflictManager: ConflictManager;
  let benchmarker: PerformanceBenchmarker;
  let mockEnvironment: ReturnType<typeof createBenchmarkMockDB>;

  beforeEach(async () => {
    // Mock performance.now for consistent testing
    vi.spyOn(performance, 'now').mockImplementation(() => Date.now());

    mockEnvironment = createBenchmarkMockDB();
    global.indexedDB = {
      open: () => ({ result: mockEnvironment.mockDB }),
    } as any;

    // Initialize components
    benchmarker = new PerformanceBenchmarker();
    dbManager = new IDBManager();
    syncQueue = new SyncQueue(dbManager);
    connectivityMonitor = new ConnectivityMonitor();
    conflictManager = new ConflictManager(dbManager);

    vi.spyOn(dbManager, 'initialize').mockResolvedValue();
    (dbManager as any).db = mockEnvironment.mockDB;

    await dbManager.initialize();

    offlineStore = new OfflineStore(
      dbManager,
      syncQueue,
      connectivityMonitor,
      conflictManager,
    );
    await offlineStore.initialize();
  });

  afterEach(() => {
    benchmarker.clear();
    offlineStore?.close();
    dbManager?.close();
  });

  describe('Basic Operations Performance', () => {
    it('should benchmark habit creation performance', async () => {
      const result = await benchmarker.benchmark(
        'Create Habit',
        100,
        async () => {
          await offlineStore.createHabit({
            name: `Benchmark Habit ${Math.random()}`,
            active: true,
            frequency: 'daily' as const,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        },
      );

      expect(result.iterations).toBe(100);
      expect(result.averageTime).toBeLessThan(50); // Should average less than 50ms per operation
      expect(result.opsPerSecond).toBeGreaterThan(20); // Should handle at least 20 ops/sec

      benchmarker.printResults();
    });

    it('should benchmark habit retrieval performance', async () => {
      // Pre-populate with test data
      const habits: OfflineHabit[] = [];
      for (let i = 0; i < 50; i++) {
        const habit = await offlineStore.createHabit({
          name: `Pre-populated Habit ${i}`,
          active: true,
          frequency: 'daily' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        habits.push(habit);
      }

      const result = await benchmarker.benchmark(
        'Get All Habits',
        50,
        async () => {
          await offlineStore.getHabits();
        },
      );

      expect(result.averageTime).toBeLessThan(30); // Should average less than 30ms
      expect(result.opsPerSecond).toBeGreaterThan(30); // Should handle at least 30 ops/sec

      benchmarker.printResults();
    });

    it('should benchmark habit completion performance', async () => {
      const habit = await offlineStore.createHabit({
        name: 'Completion Benchmark Habit',
        active: true,
        frequency: 'daily' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await benchmarker.benchmark(
        'Toggle Habit Completion',
        100,
        async () => {
          const randomDate = new Date(Date.now() + Math.random() * 86400000);
          await offlineStore.toggleHabitCompletion(habit.id, randomDate);
        },
      );

      expect(result.averageTime).toBeLessThan(40); // Should average less than 40ms
      expect(result.opsPerSecond).toBeGreaterThan(25); // Should handle at least 25 ops/sec

      benchmarker.printResults();
    });
  });

  describe('Bulk Operations Performance', () => {
    it('should benchmark bulk habit creation', async () => {
      const result = await benchmarker.benchmark(
        'Bulk Create 10 Habits',
        10,
        async () => {
          const promises = Array.from({ length: 10 }, (_, i) =>
            offlineStore.createHabit({
              name: `Bulk Habit ${i}-${Math.random()}`,
              active: true,
              frequency: 'daily' as const,
              createdAt: new Date(),
              updatedAt: new Date(),
            }),
          );
          await Promise.all(promises);
        },
      );

      expect(result.averageTime).toBeLessThan(200); // Should average less than 200ms for 10 habits
      benchmarker.printResults();
    });

    it('should benchmark bulk completion operations', async () => {
      // Create test habits
      const habits: OfflineHabit[] = [];
      for (let i = 0; i < 20; i++) {
        const habit = await offlineStore.createHabit({
          name: `Bulk Completion Habit ${i}`,
          active: true,
          frequency: 'daily' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        habits.push(habit);
      }

      const result = await benchmarker.benchmark(
        'Bulk Complete 20 Habits',
        5,
        async () => {
          const today = new Date();
          const promises = habits.map((habit) =>
            offlineStore.toggleHabitCompletion(habit.id, today),
          );
          await Promise.all(promises);
        },
      );

      expect(result.averageTime).toBeLessThan(500); // Should average less than 500ms for 20 completions
      benchmarker.printResults();
    });
  });

  describe('Sync Queue Performance', () => {
    it('should benchmark sync operation queuing', async () => {
      const result = await benchmarker.benchmark(
        'Queue Sync Operation',
        200,
        async () => {
          await syncQueue.enqueue({
            type: 'CREATE',
            entity: 'HABIT',
            entityId: `test-id-${Math.random()}`,
            data: {
              name: 'Test Habit',
              active: true,
            },
          });
        },
      );

      expect(result.averageTime).toBeLessThan(20); // Should average less than 20ms per operation
      expect(result.opsPerSecond).toBeGreaterThan(50); // Should handle at least 50 ops/sec

      benchmarker.printResults();
    });

    it('should benchmark sync operation retrieval', async () => {
      // Pre-populate sync queue
      for (let i = 0; i < 100; i++) {
        await syncQueue.enqueue({
          type: 'UPDATE',
          entity: 'HABIT',
          entityId: `habit-${i}`,
          data: { name: `Habit ${i}` },
        });
      }

      const result = await benchmarker.benchmark(
        'Get Pending Operations',
        50,
        async () => {
          await syncQueue.getPendingOperations();
        },
      );

      expect(result.averageTime).toBeLessThan(25); // Should average less than 25ms
      benchmarker.printResults();
    });
  });

  describe('Database Performance with Large Datasets', () => {
    it('should benchmark performance with 1000+ habits', async () => {
      // Create large dataset
      const batchSize = 50;
      const totalHabits = 1000;
      const batches = Math.ceil(totalHabits / batchSize);

      for (let batch = 0; batch < batches; batch++) {
        const promises = Array.from({ length: batchSize }, (_, i) => {
          const habitIndex = batch * batchSize + i;
          if (habitIndex >= totalHabits) return Promise.resolve();

          return offlineStore.createHabit({
            name: `Large Dataset Habit ${habitIndex}`,
            active: habitIndex % 3 !== 0, // Mix active/inactive
            frequency: 'daily' as const,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }).filter((p) => p);

        await Promise.all(promises);
      }

      // Benchmark retrieval performance
      const retrievalResult = await benchmarker.benchmark(
        'Get All Habits (1000+)',
        10,
        async () => {
          await offlineStore.getHabits();
        },
      );

      expect(retrievalResult.averageTime).toBeLessThan(100); // Should stay under 100ms even with 1000 habits

      // Benchmark filtered queries
      const filteredResult = await benchmarker.benchmark(
        'Get Habits with Completion (1000+)',
        10,
        async () => {
          await offlineStore.getHabitsWithCompletion(new Date());
        },
      );

      expect(filteredResult.averageTime).toBeLessThan(150); // Should stay under 150ms for complex query

      benchmarker.printResults();
    }, 30000); // Extended timeout for large dataset test

    it('should benchmark memory usage with large datasets', async () => {
      const getMemoryUsage = () => {
        if (typeof process !== 'undefined' && process.memoryUsage) {
          return process.memoryUsage().heapUsed / 1024 / 1024; // MB
        }
        return 0;
      };

      const initialMemory = getMemoryUsage();

      // Create 500 habits with entries
      for (let i = 0; i < 500; i++) {
        const habit = await offlineStore.createHabit({
          name: `Memory Test Habit ${i}`,
          active: true,
          frequency: 'daily' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Add 7 days of entries for each habit
        for (let day = 0; day < 7; day++) {
          const date = new Date();
          date.setDate(date.getDate() - day);
          await offlineStore.toggleHabitCompletion(habit.id, date);
        }

        // Check memory every 100 habits
        if (i % 100 === 0 && i > 0) {
          const currentMemory = getMemoryUsage();
          const memoryIncrease = currentMemory - initialMemory;

          // Memory increase should be reasonable (less than 100MB for 500 habits + 3500 entries)
          expect(memoryIncrease).toBeLessThan(100);
        }
      }

      const finalMemory = getMemoryUsage();
      const totalMemoryIncrease = finalMemory - initialMemory;

      console.log(
        `Memory usage: Initial: ${initialMemory.toFixed(2)}MB, Final: ${finalMemory.toFixed(2)}MB, Increase: ${totalMemoryIncrease.toFixed(2)}MB`,
      );

      // Total memory increase should be reasonable
      expect(totalMemoryIncrease).toBeLessThan(200);
    }, 60000); // Extended timeout for memory test
  });

  describe('Performance Optimization Features', () => {
    it('should benchmark query caching performance', async () => {
      const performanceOptimizer = getPerformanceOptimizer(dbManager);

      // Create some test data
      for (let i = 0; i < 50; i++) {
        await offlineStore.createHabit({
          name: `Cache Test Habit ${i}`,
          active: true,
          frequency: 'daily' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Benchmark without cache
      const noCacheResult = await benchmarker.benchmark(
        'Query without Cache',
        20,
        async () => {
          const key = {
            storeName: 'habits',
            operation: 'getAll' as const,
          };
          await performanceOptimizer.getCachedResult(
            key,
            () => dbManager.getAll('habits'),
            true, // Bypass cache
          );
        },
      );

      // Benchmark with cache
      const cachedResult = await benchmarker.benchmark(
        'Query with Cache',
        20,
        async () => {
          const key = {
            storeName: 'habits',
            operation: 'getAll' as const,
          };
          await performanceOptimizer.getCachedResult(key, () =>
            dbManager.getAll('habits'),
          );
        },
      );

      // Cached queries should be significantly faster
      expect(cachedResult.averageTime).toBeLessThan(
        noCacheResult.averageTime * 0.5,
      );

      benchmarker.printResults();
    });

    it('should benchmark pagination performance', async () => {
      // Create test data
      for (let i = 0; i < 200; i++) {
        await offlineStore.createHabit({
          name: `Pagination Test Habit ${i}`,
          active: true,
          frequency: 'daily' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Benchmark paginated queries
      const paginationResult = await benchmarker.benchmark(
        'Paginated Query (20 items)',
        25,
        async () => {
          await dbManager.getPaginated('habits', { limit: 20 });
        },
      );

      expect(paginationResult.averageTime).toBeLessThan(30); // Should be fast even with large dataset
      expect(paginationResult.opsPerSecond).toBeGreaterThan(30);

      benchmarker.printResults();
    });
  });

  describe('Concurrent Operation Performance', () => {
    it('should benchmark concurrent habit operations', async () => {
      const result = await benchmarker.benchmark(
        'Concurrent Operations (10 parallel)',
        10,
        async () => {
          const operations = [
            // Create operations
            ...Array.from({ length: 3 }, (_, i) =>
              offlineStore.createHabit({
                name: `Concurrent Habit ${i}-${Math.random()}`,
                active: true,
                frequency: 'daily' as const,
                createdAt: new Date(),
                updatedAt: new Date(),
              }),
            ),
            // Read operations
            ...Array.from({ length: 4 }, () => offlineStore.getHabits()),
            // Update operations (assuming we have some habits to update)
            ...Array.from({ length: 3 }, async () => {
              const habits = await offlineStore.getHabits();
              if (habits.length > 0) {
                return offlineStore.updateHabit(habits[0].id, {
                  name: `Updated ${Math.random()}`,
                });
              }
            }).filter(Boolean),
          ];

          await Promise.all(operations);
        },
      );

      expect(result.averageTime).toBeLessThan(300); // Should handle concurrent operations efficiently
      benchmarker.printResults();
    });
  });

  afterAll(() => {
    // Print final performance summary
    console.log('\n=== Performance Benchmark Summary ===');
    benchmarker.printResults();
  });
});
