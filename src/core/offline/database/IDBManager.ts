// IndexedDB wrapper with transaction management and error handling
// Provides a type-safe interface for IndexedDB operations with proper transaction handling

import { IDBManager as IIDBManager } from '../interfaces';
import { OPTIMIZED_INDEX_STRATEGIES, indexAnalyzer } from './IDBIndexStrategy';

export class IDBManager implements IIDBManager {
  private database: IDBDatabase | null = null;
  private readonly dbName = 'TracknStickDB';
  private readonly version = 3; // Incremented for metadata store

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error(`Failed to open database: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        this.database = request.result;
        this.setupErrorHandling();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createStores(db);
      };
    });
  }

  close(): void {
    if (this.database) {
      this.database.close();
      this.database = null;
    }
  }

  async get<T>(storeName: string, id: string): Promise<T | undefined> {
    const startTime = performance.now();
    this.ensureDatabase();

    try {
      const result = await this.transaction(
        [storeName],
        'readonly',
        async (transaction) => {
          const store = transaction.objectStore(storeName);
          const request = store.get(id);

          return new Promise<T | undefined>((resolve, reject) => {
            request.onsuccess = () => resolve(request.result as T | undefined);
            request.onerror = () =>
              reject(
                new Error(`Failed to get item: ${request.error?.message}`),
              );
          });
        },
      );

      const queryTime = performance.now() - startTime;
      indexAnalyzer.recordQuery(storeName, undefined, queryTime);

      return result;
    } catch (error) {
      const queryTime = performance.now() - startTime;
      indexAnalyzer.recordQuery(storeName, undefined, queryTime);
      throw error;
    }
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    this.ensureDatabase();
    return this.transaction([storeName], 'readonly', async (transaction) => {
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      return new Promise<T[]>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result ?? []);
        request.onerror = () =>
          reject(
            new Error(`Failed to get all items: ${request.error?.message}`),
          );
      });
    });
  }

  async put<T>(storeName: string, data: T): Promise<string> {
    this.ensureDatabase();
    return this.transaction([storeName], 'readwrite', async (transaction) => {
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      return new Promise<string>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result as string);
        request.onerror = () =>
          reject(new Error(`Failed to put item: ${request.error?.message}`));
      });
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    this.ensureDatabase();
    return this.transaction([storeName], 'readwrite', async (transaction) => {
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      return new Promise<void>((resolve, reject) => {
        request.onsuccess = () => resolve();
        request.onerror = () =>
          reject(new Error(`Failed to delete item: ${request.error?.message}`));
      });
    });
  }

  async clear(storeName: string): Promise<void> {
    this.ensureDatabase();
    return this.transaction([storeName], 'readwrite', async (transaction) => {
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      return new Promise<void>((resolve, reject) => {
        request.onsuccess = () => resolve();
        request.onerror = () =>
          reject(new Error(`Failed to clear store: ${request.error?.message}`));
      });
    });
  }

  async putMany<T>(storeName: string, items: T[]): Promise<string[]> {
    this.ensureDatabase();
    return this.transaction([storeName], 'readwrite', async (transaction) => {
      const store = transaction.objectStore(storeName);
      const results: string[] = [];

      return new Promise<string[]>((resolve, reject) => {
        let completed = 0;
        let failed = false;

        if (items.length === 0) {
          resolve([]);
          return;
        }

        for (const item of items) {
          const request = store.put(item);

          request.onsuccess = () => {
            if (!failed) {
              results.push(request.result as string);
              completed++;
              if (completed === items.length) {
                resolve(results);
              }
            }
          };

          request.onerror = () => {
            if (!failed) {
              failed = true;
              reject(
                new Error(`Failed to put item: ${request.error?.message}`),
              );
            }
          };
        }
      });
    });
  }

  async deleteMany(storeName: string, ids: string[]): Promise<void> {
    this.ensureDatabase();
    return this.transaction([storeName], 'readwrite', async (transaction) => {
      const store = transaction.objectStore(storeName);

      return new Promise<void>((resolve, reject) => {
        let completed = 0;
        let failed = false;

        if (ids.length === 0) {
          resolve();
          return;
        }

        for (const id of ids) {
          const request = store.delete(id);

          request.onsuccess = () => {
            if (!failed) {
              completed++;
              if (completed === ids.length) {
                resolve();
              }
            }
          };

          request.onerror = () => {
            if (!failed) {
              failed = true;
              reject(
                new Error(`Failed to delete item: ${request.error?.message}`),
              );
            }
          };
        }
      });
    });
  }

  async getByIndex<T>(
    storeName: string,
    indexName: string,
    value: string | number | Date,
  ): Promise<T[]> {
    const startTime = performance.now();
    this.ensureDatabase();

    try {
      const result = await this.transaction(
        [storeName],
        'readonly',
        async (transaction) => {
          const store = transaction.objectStore(storeName);
          const index = store.index(indexName);
          const request = index.getAll(value);

          return new Promise<T[]>((resolve, reject) => {
            request.onsuccess = () => resolve(request.result ?? []);
            request.onerror = () =>
              reject(
                new Error(
                  `Failed to get items by index: ${request.error?.message}`,
                ),
              );
          });
        },
      );

      const queryTime = performance.now() - startTime;
      indexAnalyzer.recordQuery(storeName, indexName, queryTime);

      return result;
    } catch (error) {
      const queryTime = performance.now() - startTime;
      indexAnalyzer.recordQuery(storeName, indexName, queryTime);
      throw error;
    }
  }

  async getByDateRange<T>(
    storeName: string,
    indexName: string,
    startDate: Date,
    endDate: Date,
  ): Promise<T[]> {
    this.ensureDatabase();
    return this.transaction([storeName], 'readonly', async (transaction) => {
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const range = IDBKeyRange.bound(startDate, endDate);
      const request = index.getAll(range);

      return new Promise<T[]>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result ?? []);
        request.onerror = () =>
          reject(
            new Error(
              `Failed to get items by date range: ${request.error?.message}`,
            ),
          );
      });
    });
  }

  async count(
    storeName: string,
    indexName?: string,
    value?: string | number | Date,
  ): Promise<number> {
    this.ensureDatabase();
    return this.transaction([storeName], 'readonly', async (transaction) => {
      const store = transaction.objectStore(storeName);
      let request: IDBRequest<number>;

      if (indexName && value !== undefined) {
        const index = store.index(indexName);
        request = index.count(value);
      } else {
        request = store.count();
      }

      return new Promise<number>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () =>
          reject(new Error(`Failed to count items: ${request.error?.message}`));
      });
    });
  }

  async transaction<T>(
    storeNames: string[],
    mode: IDBTransactionMode,
    operation: (transaction: IDBTransaction) => Promise<T>,
  ): Promise<T> {
    this.ensureDatabase();

    // Check if all requested stores exist
    for (const storeName of storeNames) {
      if (!this.database!.objectStoreNames.contains(storeName)) {
        throw new Error(
          `Object store '${storeName}' does not exist. Database may need reinitialization.`,
        );
      }
    }

    const transaction = this.database!.transaction(storeNames, mode);

    return new Promise<T>((resolve, reject) => {
      let result: T;

      void (async () => {
        try {
          result = await operation(transaction);
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      })();

      transaction.oncomplete = () => {
        resolve(result);
      };

      transaction.onerror = () => {
        reject(new Error(`Transaction failed: ${transaction.error?.message}`));
      };

      transaction.onabort = () => {
        reject(new Error('Transaction aborted'));
      };
    });
  }

  private createStores(db: IDBDatabase): void {
    // Use optimized index strategies for all stores
    for (const storeConfig of OPTIMIZED_INDEX_STRATEGIES) {
      if (!db.objectStoreNames.contains(storeConfig.storeName)) {
        let store: IDBObjectStore;

        // Create store based on name
        switch (storeConfig.storeName) {
          case 'habits':
            store = db.createObjectStore('habits', {
              keyPath: 'id',
              autoIncrement: false,
            });
            break;
          case 'habitEntries':
            store = db.createObjectStore('habitEntries', {
              keyPath: 'id',
              autoIncrement: false,
            });
            break;
          case 'syncQueue':
            store = db.createObjectStore('syncQueue', {
              keyPath: 'id',
              autoIncrement: false,
            });
            break;
          case 'conflicts':
            store = db.createObjectStore('conflicts', {
              keyPath: 'id',
              autoIncrement: false,
            });
            break;
          case 'metadata':
            store = db.createObjectStore('metadata', {
              keyPath: 'id',
              autoIncrement: false,
            });
            break;
          default:
            continue;
        }

        // Create all optimized indexes for this store
        for (const indexDef of storeConfig.indexes) {
          try {
            store.createIndex(
              indexDef.name,
              indexDef.keyPath,
              indexDef.options,
            );
          } catch (error) {
            console.warn(
              `Failed to create index ${indexDef.name} on ${storeConfig.storeName}:`,
              error,
            );
          }
        }
      } else {
        // Store exists, check for missing indexes (upgrade scenario)
        const transaction = db.transaction(
          [storeConfig.storeName],
          'versionchange',
        );
        const store = transaction.objectStore(storeConfig.storeName);

        for (const indexDef of storeConfig.indexes) {
          if (!store.indexNames.contains(indexDef.name)) {
            try {
              store.createIndex(
                indexDef.name,
                indexDef.keyPath,
                indexDef.options,
              );
            } catch (error) {
              console.warn(
                `Failed to add index ${indexDef.name} to existing store ${storeConfig.storeName}:`,
                error,
              );
            }
          }
        }
      }
    }
  }

  private setupErrorHandling(): void {
    if (this.database) {
      this.database.onerror = (event) => {
        console.error('Database error:', event);
      };

      this.database.onversionchange = () => {
        this.database?.close();
        this.database = null;
        console.warn('Database version changed, connection closed');
      };
    }
  }

  private ensureDatabase(): void {
    if (!this.database) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
  }

  // Performance optimization methods

  /**
   * Get paginated results using cursor-based pagination for better performance
   */
  async getPaginated<T>(
    storeName: string,
    options: { limit: number; offset?: number },
    indexName?: string,
    value?: string | number | Date,
  ): Promise<{ data: T[]; hasMore: boolean; nextCursor?: string }> {
    const startTime = performance.now();
    this.ensureDatabase();

    try {
      const result = await new Promise<{
        data: T[];
        hasMore: boolean;
        nextCursor?: string;
      }>((resolve, reject) => {
        const transaction = this.database!.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);

        let source: IDBObjectStore | IDBIndex = store;
        if (indexName) {
          source = store.index(indexName);
        }

        const results: T[] = [];
        let count = 0;
        let hasMore = false;
        let nextCursor: string | undefined;

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
              resolve({ data: results, hasMore, nextCursor });
              return;
            }

            cursor.continue();
          } else {
            // No more results
            resolve({ data: results, hasMore: false });
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

      const queryTime = performance.now() - startTime;
      indexAnalyzer.recordQuery(storeName, indexName, queryTime);

      return result;
    } catch (error) {
      const queryTime = performance.now() - startTime;
      indexAnalyzer.recordQuery(storeName, indexName, queryTime);
      throw error;
    }
  }

  /**
   * Get performance statistics for this database instance
   */
  getPerformanceReport(): unknown {
    return indexAnalyzer.getPerformanceReport();
  }

  /**
   * Reset performance tracking statistics
   */
  resetPerformanceTracking(): void {
    indexAnalyzer.reset();
  }

  /**
   * Get the database instance (for migration purposes)
   */
  get db(): IDBDatabase | null {
    return this.database;
  }

  /**
   * Get the database name
   */
  getDatabaseName(): string {
    return this.dbName;
  }
}
