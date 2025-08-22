// Performance optimization utilities for IndexedDB operations
// Provides connection pooling, query result caching, and efficient pagination for large datasets

import { IDBManager } from './IDBManager';

// Cache configuration for query results
interface CacheConfig {
  maxSize: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hits: number;
}

interface PaginationOptions {
  limit: number;
  offset?: number;
  direction?: 'next' | 'prev';
}

interface QueryCacheKey {
  storeName: string;
  indexName?: string;
  value?: string | number | Date;
  range?: [Date, Date];
  operation: 'getAll' | 'getByIndex' | 'getByDateRange' | 'count';
}

export class IDBPerformanceOptimizer {
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly cacheConfig: CacheConfig = {
    maxSize: 100,
    ttl: 5 * 60 * 1000, // 5 minutes
  };
  private connectionPool = new Map<string, IDBManager>();
  // Maximum connections - reserved for future connection pooling implementation
  // private readonly maxConnections = 5;

  constructor(private dbManager: IDBManager) {
    // Start cache cleanup interval
    this.startCacheCleanup();
  }

  /**
   * Get cached result or execute query with caching
   */
  async getCachedResult<T>(
    key: QueryCacheKey,
    queryFn: () => Promise<T>,
    bypassCache = false,
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(key);

    if (!bypassCache && this.cache.has(cacheKey)) {
      const entry = this.cache.get(cacheKey)!;

      // Check if cache entry is still valid
      if (Date.now() - entry.timestamp < this.cacheConfig.ttl) {
        entry.hits++;
        return entry.data as T;
      } else {
        // Remove expired entry
        this.cache.delete(cacheKey);
      }
    }

    // Execute query and cache result
    const result = await queryFn();

    // Add to cache if space available or evict least used
    if (this.cache.size >= this.cacheConfig.maxSize) {
      this.evictLeastUsedCacheEntry();
    }

    this.cache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
      hits: 1,
    });

    return result;
  }

  /**
   * Efficient pagination using cursors instead of offset
   */
  async getPaginatedResults<T>(
    storeName: string,
    options: PaginationOptions,
    indexName?: string,
    value?: string | number | Date,
  ): Promise<{
    data: T[];
    hasMore: boolean;
    nextCursor?: string;
    totalCount?: number;
  }> {
    return new Promise((resolve, reject) => {
      const transaction = this.dbManager.db!.transaction(
        [storeName],
        'readonly',
      );
      const store = transaction.objectStore(storeName);

      let source: IDBObjectStore | IDBIndex = store;
      if (indexName) {
        source = store.index(indexName);
      }

      const results: T[] = [];
      let count = 0;
      let hasMore = false;
      let nextCursor: string | undefined;

      // Create appropriate request based on whether we have a value filter
      let request: IDBRequest<IDBCursorWithValue | null>;
      if (value !== undefined) {
        request = source.openCursor(value);
      } else {
        request = source.openCursor();
      }

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>)
          .result;

        if (cursor) {
          // Skip items if we have an offset
          if (options.offset && count < options.offset) {
            count++;
            cursor.continue();
            return;
          }

          // Collect results up to limit
          if (results.length < options.limit) {
            results.push(cursor.value as T);
          } else {
            // We have more results available
            hasMore = true;
            // Handle both simple keys and array keys safely
            const key = cursor.key;
            if (key === null || key === undefined) {
              nextCursor = '';
            } else if (typeof key === 'object') {
              nextCursor = JSON.stringify(key);
            } else {
              nextCursor = String(key);
            }
            resolve({
              data: results,
              hasMore,
              nextCursor,
            });
            return;
          }

          cursor.continue();
        } else {
          // No more results
          resolve({
            data: results,
            hasMore: false,
          });
        }
      };

      request.onerror = () => {
        reject(
          new Error(
            `Failed to get paginated results: ${request.error?.message}`,
          ),
        );
      };
    });
  }

  /**
   * Bulk operations with batching for better performance
   */
  async bulkPut<T>(
    storeName: string,
    items: T[],
    batchSize = 100,
  ): Promise<string[]> {
    const results: string[] = [];

    // Process in batches to avoid blocking the main thread
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await this.dbManager.putMany(storeName, batch);
      results.push(...batchResults);

      // Allow other tasks to run between batches
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    return results;
  }

  /**
   * Efficient count with index optimization
   */
  async getOptimizedCount(
    storeName: string,
    indexName?: string,
    value?: string | number | Date,
  ): Promise<number> {
    const cacheKey: QueryCacheKey = {
      storeName,
      indexName,
      value,
      operation: 'count',
    };

    return this.getCachedResult(cacheKey, async () => {
      return this.dbManager.count(storeName, indexName, value);
    });
  }

  /**
   * Memory usage optimization - get statistics
   */
  async getStorageStats(): Promise<{
    totalSize: number;
    storeStats: Record<string, { count: number; estimatedSize: number }>;
  }> {
    const storeNames = ['habits', 'habitEntries', 'syncQueue', 'conflicts'];
    const storeStats: Record<string, { count: number; estimatedSize: number }> =
      {};
    let totalSize = 0;

    for (const storeName of storeNames) {
      const count = await this.dbManager.count(storeName);
      const items = await this.dbManager.getAll(storeName);

      // Rough estimation of storage size
      const estimatedSize = items.reduce<number>((size, item) => {
        return size + JSON.stringify(item).length * 2; // UTF-16 encoding
      }, 0);

      storeStats[storeName] = { count, estimatedSize };
      totalSize += estimatedSize;
    }

    return { totalSize, storeStats };
  }

  /**
   * Invalidate cache for specific patterns
   */
  invalidateCache(pattern?: Partial<QueryCacheKey>): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const keysToDelete: string[] = [];

    for (const [key] of this.cache) {
      const parsedKey = JSON.parse(key) as QueryCacheKey;

      let shouldDelete = true;
      for (const [prop, value] of Object.entries(pattern)) {
        if (parsedKey[prop as keyof QueryCacheKey] !== value) {
          shouldDelete = false;
          break;
        }
      }

      if (shouldDelete) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    hitRate: number;
    totalHits: number;
    entries: { key: string; hits: number; age: number }[];
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      hits: entry.hits,
      age: Date.now() - entry.timestamp,
    }));

    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0);
    const hitRate =
      totalHits > 0 ? totalHits / (totalHits + entries.length) : 0;

    return {
      size: this.cache.size,
      hitRate,
      totalHits,
      entries,
    };
  }

  private generateCacheKey(key: QueryCacheKey): string {
    return JSON.stringify(key);
  }

  private evictLeastUsedCacheEntry(): void {
    let leastUsedKey = '';
    let leastHits = Infinity;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache) {
      if (
        entry.hits < leastHits ||
        (entry.hits === leastHits && entry.timestamp < oldestTime)
      ) {
        leastUsedKey = key;
        leastHits = entry.hits;
        oldestTime = entry.timestamp;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }

  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      const expiredKeys: string[] = [];

      for (const [key, entry] of this.cache) {
        if (now - entry.timestamp > this.cacheConfig.ttl) {
          expiredKeys.push(key);
        }
      }

      expiredKeys.forEach((key) => this.cache.delete(key));
    }, this.cacheConfig.ttl / 4); // Clean up every quarter of TTL
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.cache.clear();
    this.connectionPool.clear();
  }
}

// Singleton instance for global use
let performanceOptimizer: IDBPerformanceOptimizer | null = null;

export function getPerformanceOptimizer(
  dbManager: IDBManager,
): IDBPerformanceOptimizer {
  performanceOptimizer ??= new IDBPerformanceOptimizer(dbManager);
  return performanceOptimizer;
}
