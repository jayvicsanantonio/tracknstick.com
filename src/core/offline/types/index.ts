// Core types for offline data management system
// Defines interfaces for offline operations, sync queue, and connectivity monitoring

import { Habit } from '@/features/habits/types/Habit';

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

export interface ConnectivityStatus {
  online: boolean;
  quality: 'poor' | 'good' | 'excellent';
  lastOnline: Date | null;
  lastOffline: Date | null;
}

export interface SyncStatus {
  inProgress: boolean;
  pendingOperations: number;
  lastSync: Date | null;
  lastSyncSuccess: Date | null;
  conflicts: number;
}
