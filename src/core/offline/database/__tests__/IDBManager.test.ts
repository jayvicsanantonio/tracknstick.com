// Unit tests for IDBManager class
// Tests database initialization, CRUD operations, bulk operations, and index-based queries

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IDBManager } from '../IDBManager';

// Mock IndexedDB for testing
const mockIDBDatabase = {
  transaction: vi.fn(),
  createObjectStore: vi.fn(),
  objectStoreNames: {
    contains: vi.fn(),
  },
  close: vi.fn(),
  onerror: null,
  onversionchange: null,
};

const mockIDBTransaction = {
  objectStore: vi.fn(),
  oncomplete: null,
  onerror: null,
  onabort: null,
  error: null,
};

const mockIDBObjectStore = {
  get: vi.fn(),
  getAll: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
  count: vi.fn(),
  index: vi.fn(),
  createIndex: vi.fn(),
};

const mockIDBIndex = {
  getAll: vi.fn(),
  count: vi.fn(),
};

const mockIDBRequest = {
  onsuccess: null,
  onerror: null,
  result: null,
  error: null,
};

// Mock the global indexedDB
const mockIndexedDB = {
  open: vi.fn(),
};

// Mock IDBKeyRange
const mockIDBKeyRange = {
  bound: vi.fn(),
};

// Setup global mocks
beforeEach(() => {
  global.indexedDB = mockIndexedDB as unknown as IDBFactory;
  global.IDBKeyRange = mockIDBKeyRange as unknown as typeof IDBKeyRange;
});

describe('IDBManager', () => {
  let manager: IDBManager;

  beforeEach(() => {
    manager = new IDBManager();
    vi.clearAllMocks();
  });

  afterEach(() => {
    manager.close();
  });

  describe('initialization', () => {
    it('should open database with correct name and version', async () => {
      const mockOpenRequest = {
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
        result: mockIDBDatabase,
        error: null,
      };

      mockIndexedDB.open.mockReturnValue(mockOpenRequest);

      const initPromise = manager.initialize();

      // Simulate successful database opening
      mockOpenRequest.onsuccess?.();

      await expect(initPromise).resolves.toBeUndefined();
      expect(mockIndexedDB.open).toHaveBeenCalledWith('TracknStickDB', 1);
    });

    it('should handle database opening errors', async () => {
      const mockOpenRequest = {
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
        result: null,
        error: { message: 'Database error' },
      };

      mockIndexedDB.open.mockReturnValue(mockOpenRequest);

      const initPromise = manager.initialize();

      // Simulate database error
      mockOpenRequest.onerror?.();

      await expect(initPromise).rejects.toThrow(
        'Failed to open database: Database error',
      );
    });

    it('should create object stores on upgrade', async () => {
      const mockOpenRequest = {
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
        result: mockIDBDatabase,
        error: null,
      };

      mockIndexedDB.open.mockReturnValue(mockOpenRequest);
      mockIDBDatabase.objectStoreNames.contains.mockReturnValue(false);
      mockIDBDatabase.createObjectStore.mockReturnValue(mockIDBObjectStore);

      const initPromise = manager.initialize();

      // Simulate upgrade needed
      const upgradeEvent = { target: { result: mockIDBDatabase } };
      mockOpenRequest.onupgradeneeded?.(upgradeEvent as IDBVersionChangeEvent);

      // Then simulate success
      mockOpenRequest.onsuccess?.();

      await expect(initPromise).resolves.toBeUndefined();

      // Verify stores were created
      expect(mockIDBDatabase.createObjectStore).toHaveBeenCalledWith('habits', {
        keyPath: 'id',
        autoIncrement: false,
      });
      expect(mockIDBDatabase.createObjectStore).toHaveBeenCalledWith(
        'habitEntries',
        {
          keyPath: 'id',
          autoIncrement: false,
        },
      );
      expect(mockIDBDatabase.createObjectStore).toHaveBeenCalledWith(
        'syncQueue',
        {
          keyPath: 'id',
          autoIncrement: false,
        },
      );
      expect(mockIDBDatabase.createObjectStore).toHaveBeenCalledWith(
        'conflicts',
        {
          keyPath: 'id',
          autoIncrement: false,
        },
      );
    });
  });

  describe('CRUD operations', () => {
    beforeEach(async () => {
      // Setup initialized database
      const mockOpenRequest = {
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
        result: mockIDBDatabase,
        error: null,
      };

      mockIndexedDB.open.mockReturnValue(mockOpenRequest);
      mockIDBDatabase.transaction.mockReturnValue(mockIDBTransaction);
      mockIDBTransaction.objectStore.mockReturnValue(mockIDBObjectStore);

      const initPromise = manager.initialize();
      mockOpenRequest.onsuccess?.();
      await initPromise;
    });

    it('should get item by id', async () => {
      const testData = { id: '1', name: 'Test Habit' };
      const mockGetRequest = { ...mockIDBRequest, result: testData };
      mockIDBObjectStore.get.mockReturnValue(mockGetRequest);

      const getPromise = manager.get('habits', '1');

      // Simulate successful get first
      mockGetRequest.onsuccess?.();

      // Then simulate successful transaction
      mockIDBTransaction.oncomplete?.();

      const result = await getPromise;
      expect(result).toEqual(testData);
      expect(mockIDBObjectStore.get).toHaveBeenCalledWith('1');
    });

    it('should handle get errors', async () => {
      const mockGetRequest = {
        ...mockIDBRequest,
        error: { message: 'Get failed' },
        result: null,
      };
      mockIDBObjectStore.get.mockReturnValue(mockGetRequest);

      const getPromise = manager.get('habits', '1');

      // Simulate get error
      mockGetRequest.onerror?.();

      await expect(getPromise).rejects.toThrow(
        'Failed to get item: Get failed',
      );
    });

    it('should get all items', async () => {
      const testData = [
        { id: '1', name: 'Habit 1' },
        { id: '2', name: 'Habit 2' },
      ];
      const mockGetAllRequest = { ...mockIDBRequest, result: testData };
      mockIDBObjectStore.getAll.mockReturnValue(mockGetAllRequest);

      const getAllPromise = manager.getAll('habits');

      // Simulate successful transaction
      mockIDBTransaction.oncomplete?.();

      // Simulate successful getAll
      mockGetAllRequest.onsuccess?.();

      const result = await getAllPromise;
      expect(result).toEqual(testData);
    });

    it('should put item', async () => {
      const testData = { id: '1', name: 'Test Habit' };
      const mockPutRequest = { ...mockIDBRequest, result: '1' };
      mockIDBObjectStore.put.mockReturnValue(mockPutRequest);

      const putPromise = manager.put('habits', testData);

      // Simulate successful transaction
      mockIDBTransaction.oncomplete?.();

      // Simulate successful put
      mockPutRequest.onsuccess?.();

      const result = await putPromise;
      expect(result).toBe('1');
      expect(mockIDBObjectStore.put).toHaveBeenCalledWith(testData);
    });

    it('should delete item', async () => {
      const mockDeleteRequest = { ...mockIDBRequest };
      mockIDBObjectStore.delete.mockReturnValue(mockDeleteRequest);

      const deletePromise = manager.delete('habits', '1');

      // Simulate successful transaction
      mockIDBTransaction.oncomplete?.();

      // Simulate successful delete
      mockDeleteRequest.onsuccess?.();

      await expect(deletePromise).resolves.toBeUndefined();
      expect(mockIDBObjectStore.delete).toHaveBeenCalledWith('1');
    });

    it('should clear store', async () => {
      const mockClearRequest = { ...mockIDBRequest };
      mockIDBObjectStore.clear.mockReturnValue(mockClearRequest);

      const clearPromise = manager.clear('habits');

      // Simulate successful transaction
      mockIDBTransaction.oncomplete?.();

      // Simulate successful clear
      mockClearRequest.onsuccess?.();

      await expect(clearPromise).resolves.toBeUndefined();
      expect(mockIDBObjectStore.clear).toHaveBeenCalled();
    });
  });

  describe('bulk operations', () => {
    beforeEach(async () => {
      // Setup initialized database
      const mockOpenRequest = {
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
        result: mockIDBDatabase,
        error: null,
      };

      mockIndexedDB.open.mockReturnValue(mockOpenRequest);
      mockIDBDatabase.transaction.mockReturnValue(mockIDBTransaction);
      mockIDBTransaction.objectStore.mockReturnValue(mockIDBObjectStore);

      const initPromise = manager.initialize();
      mockOpenRequest.onsuccess?.();
      await initPromise;
    });

    it('should put many items', async () => {
      const testData = [
        { id: '1', name: 'Habit 1' },
        { id: '2', name: 'Habit 2' },
      ];

      // Mock multiple put requests
      const mockPutRequest1 = { ...mockIDBRequest, result: '1' };
      const mockPutRequest2 = { ...mockIDBRequest, result: '2' };
      mockIDBObjectStore.put
        .mockReturnValueOnce(mockPutRequest1)
        .mockReturnValueOnce(mockPutRequest2);

      const putManyPromise = manager.putMany('habits', testData);

      // Simulate successful transaction
      mockIDBTransaction.oncomplete?.();

      // Simulate successful puts
      mockPutRequest1.onsuccess?.();
      mockPutRequest2.onsuccess?.();

      const result = await putManyPromise;
      expect(result).toEqual(['1', '2']);
      expect(mockIDBObjectStore.put).toHaveBeenCalledTimes(2);
    });

    it('should handle empty array in putMany', async () => {
      const putManyPromise = manager.putMany('habits', []);

      // Simulate successful transaction
      mockIDBTransaction.oncomplete?.();

      const result = await putManyPromise;
      expect(result).toEqual([]);
      expect(mockIDBObjectStore.put).not.toHaveBeenCalled();
    });

    it('should delete many items', async () => {
      const ids = ['1', '2'];

      // Mock multiple delete requests
      const mockDeleteRequest1 = { ...mockIDBRequest };
      const mockDeleteRequest2 = { ...mockIDBRequest };
      mockIDBObjectStore.delete
        .mockReturnValueOnce(mockDeleteRequest1)
        .mockReturnValueOnce(mockDeleteRequest2);

      const deleteManyPromise = manager.deleteMany('habits', ids);

      // Simulate successful transaction
      mockIDBTransaction.oncomplete?.();

      // Simulate successful deletes
      mockDeleteRequest1.onsuccess?.();
      mockDeleteRequest2.onsuccess?.();

      await expect(deleteManyPromise).resolves.toBeUndefined();
      expect(mockIDBObjectStore.delete).toHaveBeenCalledTimes(2);
    });
  });

  describe('index-based queries', () => {
    beforeEach(async () => {
      // Setup initialized database
      const mockOpenRequest = {
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
        result: mockIDBDatabase,
        error: null,
      };

      mockIndexedDB.open.mockReturnValue(mockOpenRequest);
      mockIDBDatabase.transaction.mockReturnValue(mockIDBTransaction);
      mockIDBTransaction.objectStore.mockReturnValue(mockIDBObjectStore);
      mockIDBObjectStore.index.mockReturnValue(mockIDBIndex);

      const initPromise = manager.initialize();
      mockOpenRequest.onsuccess?.();
      await initPromise;
    });

    it('should get items by index', async () => {
      const testData = [{ id: '1', habitId: 'habit1' }];
      const mockGetAllRequest = { ...mockIDBRequest, result: testData };
      mockIDBIndex.getAll.mockReturnValue(mockGetAllRequest);

      const getByIndexPromise = manager.getByIndex(
        'habitEntries',
        'habitId',
        'habit1',
      );

      // Simulate successful transaction
      mockIDBTransaction.oncomplete?.();

      // Simulate successful getAll on index
      mockGetAllRequest.onsuccess?.();

      const result = await getByIndexPromise;
      expect(result).toEqual(testData);
      expect(mockIDBObjectStore.index).toHaveBeenCalledWith('habitId');
      expect(mockIDBIndex.getAll).toHaveBeenCalledWith('habit1');
    });

    it('should get items by date range', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');
      const testData = [{ id: '1', date: new Date('2023-01-15') }];
      const mockRange = { bound: true };
      const mockGetAllRequest = { ...mockIDBRequest, result: testData };

      mockIDBKeyRange.bound.mockReturnValue(mockRange);
      mockIDBIndex.getAll.mockReturnValue(mockGetAllRequest);

      const getByDateRangePromise = manager.getByDateRange(
        'habitEntries',
        'date',
        startDate,
        endDate,
      );

      // Simulate successful transaction
      mockIDBTransaction.oncomplete?.();

      // Simulate successful getAll on index
      mockGetAllRequest.onsuccess?.();

      const result = await getByDateRangePromise;
      expect(result).toEqual(testData);
      expect(mockIDBKeyRange.bound).toHaveBeenCalledWith(startDate, endDate);
      expect(mockIDBIndex.getAll).toHaveBeenCalledWith(mockRange);
    });

    it('should count items', async () => {
      const mockCountRequest = { ...mockIDBRequest, result: 5 };
      mockIDBObjectStore.count.mockReturnValue(mockCountRequest);

      const countPromise = manager.count('habits');

      // Simulate successful transaction
      mockIDBTransaction.oncomplete?.();

      // Simulate successful count
      mockCountRequest.onsuccess?.();

      const result = await countPromise;
      expect(result).toBe(5);
      expect(mockIDBObjectStore.count).toHaveBeenCalled();
    });

    it('should count items by index', async () => {
      const mockCountRequest = { ...mockIDBRequest, result: 3 };
      mockIDBIndex.count.mockReturnValue(mockCountRequest);

      const countPromise = manager.count('habits', 'synced', false);

      // Simulate successful transaction
      mockIDBTransaction.oncomplete?.();

      // Simulate successful count
      mockCountRequest.onsuccess?.();

      const result = await countPromise;
      expect(result).toBe(3);
      expect(mockIDBObjectStore.index).toHaveBeenCalledWith('synced');
      expect(mockIDBIndex.count).toHaveBeenCalledWith(false);
    });
  });

  describe('error handling', () => {
    it('should throw error when database not initialized', async () => {
      await expect(manager.get('habits', '1')).rejects.toThrow(
        'Database not initialized. Call initialize() first.',
      );
    });

    it('should handle transaction errors', async () => {
      // Setup initialized database
      const mockOpenRequest = {
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
        result: mockIDBDatabase,
        error: null,
      };

      mockIndexedDB.open.mockReturnValue(mockOpenRequest);
      mockIDBDatabase.transaction.mockReturnValue(mockIDBTransaction);

      const initPromise = manager.initialize();
      mockOpenRequest.onsuccess?.();
      await initPromise;

      // Mock transaction error
      mockIDBTransaction.error = { message: 'Transaction failed' };

      const getPromise = manager.get('habits', '1');

      // Simulate transaction error
      mockIDBTransaction.onerror?.();

      await expect(getPromise).rejects.toThrow(
        'Transaction failed: Transaction failed',
      );
    });
  });

  describe('database lifecycle', () => {
    it('should close database connection', () => {
      // Setup database reference
      (manager as any).db = mockIDBDatabase;

      manager.close();

      expect(mockIDBDatabase.close).toHaveBeenCalled();
      expect((manager as any).db).toBeNull();
    });

    it('should handle close when database is null', () => {
      manager.close();
      // Should not throw any errors
    });
  });
});
