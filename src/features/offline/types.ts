/**
 * Consolidated type definitions for the offline module
 * Combines interfaces and types for better organization
 */

import { Habit } from '@/features/habits/types/Habit';

// ============================================================================
// Core Types
// ============================================================================

export interface OfflineEntity {
  localId?: string;
  serverId?: string;
  lastModified: Date;
  synced: boolean;
  version: number;
  deleted?: boolean;
}

export interface OfflineHabit extends Habit, OfflineEntity {
  tempId?: string;
}

export interface HabitEntry extends OfflineEntity {
  id: string;
  habitId: string;
  date: Date;
  completed: boolean;
}

// ============================================================================
// Sync Types
// ============================================================================

export interface SyncOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'HABIT' | 'HABIT_ENTRY';
  entityId: string;
  data?: unknown;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  error?: string;
  dependencies?: string[];
}

export interface ConflictData {
  id: string;
  entityType: 'HABIT' | 'HABIT_ENTRY';
  entityId: string;
  localData: unknown;
  serverData: unknown;
  timestamp: Date;
  resolved: boolean;
  resolution?: 'LOCAL' | 'SERVER' | 'MERGE';
}

export interface SyncStatus {
  inProgress: boolean;
  pendingOperations: number;
  lastSync: Date | null;
  lastSyncSuccess: Date | null;
  conflicts: number;
}

// ============================================================================
// Connectivity Types
// ============================================================================

export interface ConnectivityStatus {
  online: boolean;
  quality: 'poor' | 'good' | 'excellent';
  lastOnline: Date | null;
  lastOffline: Date | null;
}

// ============================================================================
// Service Interfaces
// ============================================================================

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
