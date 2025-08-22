// Central coordinator for offline data operations
// Manages habit and entry operations with optimistic updates, temporary ID mapping, and sync coordination

import { IOfflineStore } from '../interfaces';
import {
  OfflineHabit,
  HabitEntry,
  SyncStatus,
  ConnectivityStatus,
  ConflictData,
} from '../types';
import { IDBManager } from '../database/IDBManager';
import { SyncQueue } from '../sync/SyncQueue';
import { SyncProcessor, BatchSyncResult } from '../sync/SyncProcessor';
import { ConnectivityMonitor } from '../connectivity/ConnectivityMonitor';
import { ConflictManager } from '../conflict/ConflictManager';
import {
  HabitCompletionService,
  HabitWithCompletion,
} from '../services/HabitCompletionService';
import { OfflineError } from '../errors/OfflineError';
import { reportError } from '../errors/ErrorReportingService';

export class OfflineStore implements IOfflineStore {
  private dbManager: IDBManager;
  private syncQueue: SyncQueue;
  private syncProcessor: SyncProcessor;
  private connectivityMonitor: ConnectivityMonitor;
  private conflictManager: ConflictManager;
  private completionService: HabitCompletionService;
  private tempIdCounter = 0;
  private syncInProgress = false;
  private currentSyncPromise: Promise<BatchSyncResult> | null = null;

  constructor(
    dbManager: IDBManager,
    syncQueue: SyncQueue,
    connectivityMonitor: ConnectivityMonitor,
    conflictManager: ConflictManager,
  ) {
    this.dbManager = dbManager;
    this.syncQueue = syncQueue;
    this.syncProcessor = new SyncProcessor(dbManager, syncQueue, {
      batchSize: 10,
      maxConcurrentRequests: 3,
    });
    this.connectivityMonitor = connectivityMonitor;
    this.conflictManager = conflictManager;
    this.completionService = new HabitCompletionService(dbManager);
  }

  async initialize(): Promise<void> {
    await this.dbManager.initialize();
  }

  async reinitialize(): Promise<void> {
    // Close the current database connection
    this.dbManager.close();

    // Reinitialize the database (this will trigger onupgradeneeded if version changed)
    await this.dbManager.initialize();
  }

  // Habit operations
  async getHabits(): Promise<OfflineHabit[]> {
    const habits = await this.dbManager.getAll<OfflineHabit>('habits');
    return habits.filter((habit) => !habit.deleted);
  }

  async getHabitsWithCompletion(
    date: Date = new Date(),
  ): Promise<HabitWithCompletion[]> {
    const habits = await this.getHabits();
    return this.completionService.getHabitsWithCompletion(habits, date);
  }

  async getHabit(id: string): Promise<OfflineHabit | undefined> {
    const habit = await this.dbManager.get<OfflineHabit>('habits', id);
    return habit && !habit.deleted ? habit : undefined;
  }

  async createHabit(
    habitData: Omit<OfflineHabit, 'id' | 'lastModified' | 'synced' | 'version'>,
  ): Promise<OfflineHabit> {
    const tempId = this.generateTempId();
    const now = new Date();

    const habit: OfflineHabit = {
      ...habitData,
      id: tempId,
      tempId,
      lastModified: now,
      synced: false,
      version: 1,
      deleted: false,
    };

    const storedId = await this.dbManager.put('habits', habit);

    // Queue sync operation
    await this.syncQueue.enqueue({
      type: 'CREATE',
      entity: 'HABIT',
      entityId: storedId,
      data: habit,
      maxRetries: 3,
    });

    return { ...habit, id: storedId };
  }

  async updateHabit(
    id: string,
    updates: Partial<OfflineHabit>,
  ): Promise<OfflineHabit> {
    const existingHabit = await this.dbManager.get<OfflineHabit>('habits', id);
    if (!existingHabit || existingHabit.deleted) {
      const error = OfflineError.validation(
        `Habit with id ${id} not found`,
        'The habit you are trying to update no longer exists. Please refresh and try again.',
        {
          operation: 'updateHabit',
          entity: 'habit',
          entityId: id,
        },
      );
      await reportError(error);
      throw error;
    }

    const updatedHabit: OfflineHabit = {
      ...existingHabit,
      ...updates,
      lastModified: new Date(),
      synced: false,
      version: existingHabit.version + 1,
    };

    await this.dbManager.put('habits', updatedHabit);

    // Queue sync operation
    await this.syncQueue.enqueue({
      type: 'UPDATE',
      entity: 'HABIT',
      entityId: id,
      data: updatedHabit,
      maxRetries: 3,
    });

    return updatedHabit;
  }

  async deleteHabit(id: string): Promise<void> {
    const existingHabit = await this.dbManager.get<OfflineHabit>('habits', id);
    if (!existingHabit) {
      const error = OfflineError.validation(
        `Habit with id ${id} not found`,
        'The habit you are trying to delete no longer exists.',
        {
          operation: 'deleteHabit',
          entity: 'habit',
          entityId: id,
        },
      );
      await reportError(error);
      throw error;
    }

    // Soft delete
    const deletedHabit: OfflineHabit = {
      ...existingHabit,
      deleted: true,
      lastModified: new Date(),
      synced: false,
      version: existingHabit.version + 1,
    };

    await this.dbManager.put('habits', deletedHabit);

    // Queue sync operation
    await this.syncQueue.enqueue({
      type: 'DELETE',
      entity: 'HABIT',
      entityId: id,
      data: deletedHabit,
      maxRetries: 3,
    });
  }

  // Habit entry operations
  async getHabitEntries(habitId?: string, date?: Date): Promise<HabitEntry[]> {
    let entries: HabitEntry[];

    if (habitId && date) {
      // Get specific entry for habit and date
      const entryId = this.generateEntryId(habitId, date);
      const entry = await this.dbManager.get<HabitEntry>(
        'habitEntries',
        entryId,
      );
      entries = entry && !entry.deleted ? [entry] : [];
    } else if (habitId) {
      // Get all entries for a specific habit
      entries = await this.dbManager.getByIndex<HabitEntry>(
        'habitEntries',
        'habitId',
        habitId,
      );
    } else if (date) {
      // Get all entries for a specific date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      entries = await this.dbManager.getByDateRange<HabitEntry>(
        'habitEntries',
        'date',
        startOfDay,
        endOfDay,
      );
    } else {
      // Get all entries
      entries = await this.dbManager.getAll<HabitEntry>('habitEntries');
    }

    return entries.filter((entry) => !entry.deleted);
  }

  async getHabitEntry(
    habitId: string,
    date: Date,
  ): Promise<HabitEntry | undefined> {
    const entryId = this.generateEntryId(habitId, date);
    const entry = await this.dbManager.get<HabitEntry>('habitEntries', entryId);
    return entry && !entry.deleted ? entry : undefined;
  }

  async createHabitEntry(
    entryData: Omit<HabitEntry, 'id' | 'lastModified' | 'synced' | 'version'>,
  ): Promise<HabitEntry> {
    const entryId = this.generateEntryId(entryData.habitId, entryData.date);

    // Check for existing entry to prevent conflicts
    const existingEntry = await this.dbManager.get<HabitEntry>(
      'habitEntries',
      entryId,
    );
    if (existingEntry && !existingEntry.deleted) {
      // Update existing entry instead of creating duplicate
      return this.updateHabitEntry(entryId, entryData);
    }

    const now = new Date();

    const entry: HabitEntry = {
      ...entryData,
      id: entryId,
      lastModified: now,
      synced: false,
      version: 1,
      deleted: false,
    };

    await this.dbManager.put('habitEntries', entry);

    // Queue sync operation
    await this.syncQueue.enqueue({
      type: 'CREATE',
      entity: 'HABIT_ENTRY',
      entityId: entryId,
      data: entry,
      maxRetries: 3,
    });

    return entry;
  }

  async updateHabitEntry(
    id: string,
    updates: Partial<HabitEntry>,
  ): Promise<HabitEntry> {
    const existingEntry = await this.dbManager.get<HabitEntry>(
      'habitEntries',
      id,
    );
    if (!existingEntry || existingEntry.deleted) {
      const error = OfflineError.validation(
        `Habit entry with id ${id} not found`,
        'The habit entry you are trying to update no longer exists.',
        {
          operation: 'updateHabitEntry',
          entity: 'habitEntry',
          entityId: id,
        },
      );
      await reportError(error);
      throw error;
    }

    const updatedEntry: HabitEntry = {
      ...existingEntry,
      ...updates,
      lastModified: new Date(),
      synced: false,
      version: existingEntry.version + 1,
    };

    await this.dbManager.put('habitEntries', updatedEntry);

    // Queue sync operation
    await this.syncQueue.enqueue({
      type: 'UPDATE',
      entity: 'HABIT_ENTRY',
      entityId: id,
      data: updatedEntry,
      maxRetries: 3,
    });

    return updatedEntry;
  }

  async deleteHabitEntry(id: string): Promise<void> {
    const existingEntry = await this.dbManager.get<HabitEntry>(
      'habitEntries',
      id,
    );
    if (!existingEntry) {
      const error = OfflineError.validation(
        `Habit entry with id ${id} not found`,
        'The habit entry you are trying to delete no longer exists.',
        {
          operation: 'deleteHabitEntry',
          entity: 'habitEntry',
          entityId: id,
        },
      );
      await reportError(error);
      throw error;
    }

    // Soft delete
    const deletedEntry: HabitEntry = {
      ...existingEntry,
      deleted: true,
      lastModified: new Date(),
      synced: false,
      version: existingEntry.version + 1,
    };

    await this.dbManager.put('habitEntries', deletedEntry);

    // Queue sync operation
    await this.syncQueue.enqueue({
      type: 'DELETE',
      entity: 'HABIT_ENTRY',
      entityId: id,
      data: deletedEntry,
      maxRetries: 3,
    });
  }

  async sync(): Promise<void> {
    // If sync is already in progress, return the existing promise
    if (this.syncInProgress && this.currentSyncPromise) {
      console.log('Sync already in progress, waiting for completion...');
      await this.currentSyncPromise;
      return;
    }

    // Check if we're online before attempting sync
    if (!this.connectivityMonitor.isOnline()) {
      const error = OfflineError.network('Cannot sync while offline', {
        operation: 'sync',
        additionalData: {
          connectivityStatus: this.connectivityMonitor.getStatus(),
        },
      });
      await reportError(error);
      throw error;
    }

    // Create and store the sync promise
    this.syncInProgress = true;
    this.currentSyncPromise = this.performSync();

    try {
      await this.currentSyncPromise;
    } finally {
      this.syncInProgress = false;
      this.currentSyncPromise = null;
    }
  }

  private async performSync(): Promise<BatchSyncResult> {
    await this.setMetadata('lastSync', new Date().toISOString());

    try {
      // Use the new sync processor for batch processing
      const result = await this.syncProcessor.processAllPendingOperations();

      // Update sync metadata based on results
      if (result.failedOperations === 0) {
        await this.setMetadata('lastSyncSuccess', new Date().toISOString());
      }

      // Store sync statistics for monitoring
      await this.setMetadata(
        'lastSyncStats',
        JSON.stringify({
          timestamp: new Date().toISOString(),
          totalOperations: result.totalOperations,
          successfulOperations: result.successfulOperations,
          failedOperations: result.failedOperations,
          networkErrors: result.networkErrors,
        }),
      );

      return result;
    } catch (error) {
      const syncError =
        error instanceof OfflineError
          ? error
          : OfflineError.sync(
              error instanceof Error ? error.message : 'Sync failed',
              {
                operation: 'sync',
                additionalData: { originalError: error },
              },
              error instanceof Error ? error : undefined,
            );

      // Log sync failure
      await this.setMetadata(
        'lastSyncError',
        JSON.stringify({
          timestamp: new Date().toISOString(),
          error: syncError.toJSON(),
        }),
      );

      await reportError(syncError);
      throw syncError;
    }
  }

  async getSyncStatus(): Promise<SyncStatus> {
    const pendingOperations = await this.syncQueue.size();
    const conflicts = await this.dbManager.count('conflicts');

    // Get last sync timestamps from metadata store
    const lastSync = await this.getMetadata('lastSync');
    const lastSyncSuccess = await this.getMetadata('lastSyncSuccess');

    return {
      inProgress: this.syncInProgress,
      pendingOperations,
      lastSync: lastSync ? new Date(lastSync) : null,
      lastSyncSuccess: lastSyncSuccess ? new Date(lastSyncSuccess) : null,
      conflicts,
    };
  }

  async resolveConflicts(): Promise<void> {
    const conflicts = await this.dbManager.getAll<ConflictData>('conflicts');

    for (const conflict of conflicts) {
      try {
        // Use conflict manager to resolve each conflict
        const resolution = await this.conflictManager.autoResolveConflict(
          conflict.id,
        );

        // Update local data with resolved version
        const storeName =
          conflict.entityType === 'HABIT' ? 'habits' : 'habitEntries';
        await this.dbManager.put(storeName, resolution);

        // Mark conflict as resolved and remove from conflicts store
        await this.dbManager.delete('conflicts', conflict.id);

        // Queue sync operation for the resolved data
        await this.syncQueue.enqueue({
          type: 'UPDATE',
          entity: conflict.entityType,
          entityId: conflict.entityId,
          data: resolution as OfflineHabit | HabitEntry,
          maxRetries: 3,
        });
      } catch (error) {
        console.error(`Failed to resolve conflict ${conflict.id}:`, error);
        // Continue with next conflict rather than failing entirely
      }
    }
  }

  // Connectivity
  getConnectivityStatus(): ConnectivityStatus {
    return this.connectivityMonitor.getStatus();
  }

  onConnectivityChange(
    callback: (status: ConnectivityStatus) => void,
  ): () => void {
    return this.connectivityMonitor.subscribe(callback);
  }

  // Private helper methods
  private generateTempId(): string {
    return `temp_${Date.now()}_${++this.tempIdCounter}`;
  }

  private generateEntryId(habitId: string, date: Date): string {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    return `${habitId}_${dateStr}`;
  }

  private async getMetadata(key: string): Promise<string | undefined> {
    const metadata = await this.dbManager.get<{ value: string }>(
      'metadata',
      key,
    );
    return metadata?.value;
  }

  private async setMetadata(key: string, value: string): Promise<void> {
    await this.dbManager.put('metadata', { id: key, value });
  }

  // Enhanced habit completion methods
  async getCompletionStats(
    startDate: Date = new Date(),
    endDate: Date = new Date(),
  ) {
    const habits = await this.getHabits();
    return this.completionService.getCompletionStats(
      habits,
      startDate,
      endDate,
    );
  }

  async getDailyCompletionSummary(dates: Date[]) {
    const habits = await this.getHabits();
    return this.completionService.getDailyCompletionSummary(habits, dates);
  }

  async detectHabitEntryConflicts(
    habitId: string,
    date: Date,
  ): Promise<HabitEntry[]> {
    return this.completionService.detectEntryConflicts(habitId, date);
  }

  async resolveHabitEntryConflicts(
    habitId: string,
    date: Date,
    preferredEntry: HabitEntry,
  ): Promise<void> {
    const conflicts = await this.detectHabitEntryConflicts(habitId, date);

    if (conflicts.length <= 1) {
      return; // No conflicts to resolve
    }

    // Keep the preferred entry and mark others as deleted
    for (const conflict of conflicts) {
      if (conflict.id !== preferredEntry.id) {
        await this.updateHabitEntry(conflict.id, { deleted: true });
      }
    }

    // Ensure the preferred entry is active
    await this.updateHabitEntry(preferredEntry.id, {
      deleted: false,
      completed: preferredEntry.completed,
    });
  }
}
