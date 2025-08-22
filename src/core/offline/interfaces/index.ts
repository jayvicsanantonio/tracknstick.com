// Interface definitions for offline data management system
// Defines contracts for database operations, sync management, and connectivity monitoring

import {
  OfflineHabit,
  HabitEntry,
  SyncOperation,
  ConflictData,
  ConnectivityStatus,
  SyncStatus,
} from '../types';

export interface IDBManager {
  initialize(): Promise<void>;
  close(): void;
  get<T>(storeName: string, id: string): Promise<T | undefined>;
  getAll<T>(storeName: string): Promise<T[]>;
  put<T>(storeName: string, data: T): Promise<string>;
  delete(storeName: string, id: string): Promise<void>;
  clear(storeName: string): Promise<void>;
  putMany<T>(storeName: string, items: T[]): Promise<string[]>;
  deleteMany(storeName: string, ids: string[]): Promise<void>;
  getByIndex<T>(
    storeName: string,
    indexName: string,
    value: string | number | Date,
  ): Promise<T[]>;
  getByDateRange<T>(
    storeName: string,
    indexName: string,
    startDate: Date,
    endDate: Date,
  ): Promise<T[]>;
  count(
    storeName: string,
    indexName?: string,
    value?: string | number | Date,
  ): Promise<number>;
  transaction<T>(
    storeNames: string[],
    mode: IDBTransactionMode,
    operation: (transaction: IDBTransaction) => Promise<T>,
  ): Promise<T>;
}

export interface ISyncQueue {
  enqueue(
    operation: Omit<
      SyncOperation,
      'id' | 'timestamp' | 'retryCount' | 'status'
    >,
  ): Promise<string>;
  dequeue(): Promise<SyncOperation | null>;
  peek(): Promise<SyncOperation | null>;
  getAll(): Promise<SyncOperation[]>;
  markCompleted(operationId: string): Promise<void>;
  markFailed(operationId: string, error: string): Promise<void>;
  retry(operationId: string): Promise<void>;
  clear(): Promise<void>;
  size(): Promise<number>;
}

export interface IConnectivityMonitor {
  isOnline(): boolean;
  getStatus(): ConnectivityStatus;
  subscribe(callback: (status: ConnectivityStatus) => void): () => void;
  checkConnectivity(): Promise<boolean>;
  assessQuality(): Promise<'poor' | 'good' | 'excellent'>;
}

export interface IConflictResolver {
  detectConflicts(localData: unknown, serverData: unknown): boolean;
  resolveConflict(
    conflict: ConflictData,
    resolution: 'LOCAL' | 'SERVER' | 'MERGE',
  ): Promise<unknown>;
  presentConflict(
    conflict: ConflictData,
  ): Promise<'LOCAL' | 'SERVER' | 'MERGE'>;
  mergeData(localData: unknown, serverData: unknown): unknown;
}

export interface IOfflineStore {
  // Habit operations
  getHabits(): Promise<OfflineHabit[]>;
  getHabit(id: string): Promise<OfflineHabit | undefined>;
  createHabit(
    habit: Omit<OfflineHabit, 'id' | 'lastModified' | 'synced' | 'version'>,
  ): Promise<OfflineHabit>;
  updateHabit(
    id: string,
    updates: Partial<OfflineHabit>,
  ): Promise<OfflineHabit>;
  deleteHabit(id: string): Promise<void>;

  // Habit entry operations
  getHabitEntries(habitId?: string, date?: Date): Promise<HabitEntry[]>;
  getHabitEntry(habitId: string, date: Date): Promise<HabitEntry | undefined>;
  createHabitEntry(
    entry: Omit<HabitEntry, 'id' | 'lastModified' | 'synced' | 'version'>,
  ): Promise<HabitEntry>;
  updateHabitEntry(
    id: string,
    updates: Partial<HabitEntry>,
  ): Promise<HabitEntry>;
  deleteHabitEntry(id: string): Promise<void>;

  // Sync operations
  sync(): Promise<void>;
  getSyncStatus(): Promise<SyncStatus>;
  resolveConflicts(): Promise<void>;

  // Connectivity
  getConnectivityStatus(): ConnectivityStatus;
  onConnectivityChange(
    callback: (status: ConnectivityStatus) => void,
  ): () => void;
}
