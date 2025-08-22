// Background sync processor with server API integration
// Handles batch processing, server communication, and sync result management

import { IDBManager } from '../database/IDBManager';
import { ISyncQueue } from '../interfaces';
import { SyncOperation, OfflineHabit, HabitEntry } from '../types';
import {
  addHabit as apiAddHabit,
  updateHabit as apiUpdateHabit,
  deleteHabit as apiDeleteHabit,
  toggleHabitCompletion as apiToggleHabitCompletion,
} from '@/features/habits/api';

export interface SyncResult {
  success: boolean;
  operationId: string;
  serverData?: unknown;
  error?: string;
  shouldRetry?: boolean;
}

export interface BatchSyncResult {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  networkErrors: number;
  results: SyncResult[];
}

export class SyncProcessor {
  private dbManager: IDBManager;
  private syncQueue: ISyncQueue;
  private batchSize: number;
  private maxConcurrentRequests: number;

  constructor(
    dbManager: IDBManager,
    syncQueue: ISyncQueue,
    options: {
      batchSize?: number;
      maxConcurrentRequests?: number;
    } = {},
  ) {
    this.dbManager = dbManager;
    this.syncQueue = syncQueue;
    this.batchSize = options.batchSize ?? 10;
    this.maxConcurrentRequests = options.maxConcurrentRequests ?? 3;
  }

  async processBatch(operations: SyncOperation[]): Promise<BatchSyncResult> {
    const results: SyncResult[] = [];
    let successfulOperations = 0;
    let failedOperations = 0;
    let networkErrors = 0;

    // Process operations in chunks to limit concurrent requests
    for (let i = 0; i < operations.length; i += this.maxConcurrentRequests) {
      const chunk = operations.slice(i, i + this.maxConcurrentRequests);
      const chunkPromises = chunk.map((operation) =>
        this.processSingleOperation(operation),
      );

      try {
        const chunkResults = await Promise.allSettled(chunkPromises);

        for (let j = 0; j < chunkResults.length; j++) {
          const result = chunkResults[j];
          const operation = chunk[j];

          if (result.status === 'fulfilled') {
            const syncResult = result.value;
            results.push(syncResult);

            if (syncResult.success) {
              successfulOperations++;
              await this.syncQueue.markCompleted(operation.id);

              // Update local data with server response
              if (syncResult.serverData) {
                await this.updateLocalDataWithServerResponse(
                  operation,
                  syncResult.serverData,
                );
              }
            } else {
              failedOperations++;

              if (
                syncResult.error?.includes('network') ||
                syncResult.error?.includes('fetch')
              ) {
                networkErrors++;
              }

              await this.syncQueue.markFailed(
                operation.id,
                syncResult.error ?? 'Unknown error',
              );
            }
          } else {
            // Promise was rejected
            const error =
              result.reason instanceof Error
                ? result.reason.message
                : 'Unknown error';
            failedOperations++;

            if (error.includes('network') || error.includes('fetch')) {
              networkErrors++;
            }

            results.push({
              success: false,
              operationId: operation.id,
              error,
              shouldRetry:
                !error.includes('validation') && !error.includes('not found'),
            });

            await this.syncQueue.markFailed(operation.id, error);
          }
        }
      } catch (error) {
        // Handle unexpected errors in chunk processing
        const errorMessage =
          error instanceof Error ? error.message : 'Batch processing failed';

        for (const operation of chunk) {
          failedOperations++;
          results.push({
            success: false,
            operationId: operation.id,
            error: errorMessage,
            shouldRetry: true,
          });

          await this.syncQueue.markFailed(operation.id, errorMessage);
        }
      }
    }

    return {
      totalOperations: operations.length,
      successfulOperations,
      failedOperations,
      networkErrors,
      results,
    };
  }

  private async processSingleOperation(
    operation: SyncOperation,
  ): Promise<SyncResult> {
    try {
      const { type, entity, data } = operation;

      switch (entity) {
        case 'HABIT':
          return await this.processHabitOperation(
            operation,
            type,
            data as OfflineHabit,
          );
        case 'HABIT_ENTRY':
          return await this.processHabitEntryOperation(
            operation,
            type,
            data as HabitEntry,
          );
        default:
          throw new Error(`Unknown entity type: ${String(entity)}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      return {
        success: false,
        operationId: operation.id,
        error: errorMessage,
        shouldRetry:
          !errorMessage.includes('validation') &&
          !errorMessage.includes('not found'),
      };
    }
  }

  private async processHabitOperation(
    operation: SyncOperation,
    type: SyncOperation['type'],
    habitData: OfflineHabit,
  ): Promise<SyncResult> {
    try {
      switch (type) {
        case 'CREATE': {
          const response = await apiAddHabit({
            name: habitData.name,
            icon: habitData.icon,
            frequency: habitData.frequency,
            startDate: habitData.startDate,
            endDate: habitData.endDate,
          });

          // Create server habit object with ID mapping
          const serverHabit: OfflineHabit = {
            ...habitData,
            id: response.habitId,
            serverId: response.habitId,
            synced: true,
            lastModified: new Date(),
            version: habitData.version + 1,
          };

          return {
            success: true,
            operationId: operation.id,
            serverData: serverHabit,
          };
        }

        case 'UPDATE': {
          const habitId = habitData.serverId ?? habitData.id!;
          await apiUpdateHabit(habitId, {
            name: habitData.name,
            icon: habitData.icon,
            frequency: habitData.frequency,
            startDate: habitData.startDate,
            endDate: habitData.endDate,
          });

          const updatedHabit: OfflineHabit = {
            ...habitData,
            synced: true,
            lastModified: new Date(),
            version: habitData.version + 1,
          };

          return {
            success: true,
            operationId: operation.id,
            serverData: updatedHabit,
          };
        }

        case 'DELETE': {
          const habitId = habitData.serverId ?? habitData.id!;
          await apiDeleteHabit(habitId);

          return {
            success: true,
            operationId: operation.id,
            serverData: null, // Indicates deletion
          };
        }

        default:
          throw new Error(`Unknown habit operation type: ${String(type)}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      return {
        success: false,
        operationId: operation.id,
        error: errorMessage,
        shouldRetry:
          !errorMessage.includes('404') && !errorMessage.includes('400'),
      };
    }
  }

  private async processHabitEntryOperation(
    operation: SyncOperation,
    type: SyncOperation['type'],
    entryData: HabitEntry,
  ): Promise<SyncResult> {
    try {
      switch (type) {
        case 'CREATE': {
          // For habit entries, we use the toggle API
          const response = await apiToggleHabitCompletion(
            entryData.habitId,
            entryData.date,
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          );

          const serverEntry: HabitEntry = {
            ...entryData,
            serverId: response.trackerId ?? entryData.id,
            synced: true,
            lastModified: new Date(),
            version: entryData.version + 1,
          };

          return {
            success: true,
            operationId: operation.id,
            serverData: serverEntry,
          };
        }

        case 'UPDATE': {
          // For habit entries, update typically means toggling completion
          const response = await apiToggleHabitCompletion(
            entryData.habitId,
            entryData.date,
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          );

          const updatedEntry: HabitEntry = {
            ...entryData,
            serverId: response.trackerId ?? entryData.serverId,
            synced: true,
            lastModified: new Date(),
            version: entryData.version + 1,
          };

          return {
            success: true,
            operationId: operation.id,
            serverData: updatedEntry,
          };
        }

        case 'DELETE': {
          // For habit entries, delete means toggling off completion
          await apiToggleHabitCompletion(
            entryData.habitId,
            entryData.date,
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          );

          return {
            success: true,
            operationId: operation.id,
            serverData: null, // Indicates deletion
          };
        }

        default:
          throw new Error(
            `Unknown habit entry operation type: ${String(type)}`,
          );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      return {
        success: false,
        operationId: operation.id,
        error: errorMessage,
        shouldRetry:
          !errorMessage.includes('404') && !errorMessage.includes('400'),
      };
    }
  }

  private async updateLocalDataWithServerResponse(
    operation: SyncOperation,
    serverData: unknown,
  ): Promise<void> {
    if (serverData === null) {
      // Handle deletion
      const storeName =
        operation.entity === 'HABIT' ? 'habits' : 'habitEntries';
      await this.dbManager.delete(storeName, operation.entityId);
      return;
    }

    // Update local data with server response
    const storeName = operation.entity === 'HABIT' ? 'habits' : 'habitEntries';
    await this.dbManager.put(storeName, serverData);

    // If this was a CREATE operation with temp ID, we might need to clean up
    if (operation.type === 'CREATE' && operation.entityId.startsWith('temp_')) {
      try {
        await this.dbManager.delete(storeName, operation.entityId);
      } catch {
        // Temp record might already be cleaned up, ignore error
      }
    }
  }

  async processAllPendingOperations(): Promise<BatchSyncResult> {
    const pendingOperations = await this.syncQueue.getAll();
    const readyOperations = pendingOperations.filter(
      (op) =>
        op.status === 'PENDING' ||
        (op.status === 'FAILED' && op.retryCount < op.maxRetries),
    );

    if (readyOperations.length === 0) {
      return {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        networkErrors: 0,
        results: [],
      };
    }

    // Process operations in batches
    const allResults: SyncResult[] = [];
    let totalSuccessful = 0;
    let totalFailed = 0;
    let totalNetworkErrors = 0;

    for (let i = 0; i < readyOperations.length; i += this.batchSize) {
      const batch = readyOperations.slice(i, i + this.batchSize);
      const batchResult = await this.processBatch(batch);

      allResults.push(...batchResult.results);
      totalSuccessful += batchResult.successfulOperations;
      totalFailed += batchResult.failedOperations;
      totalNetworkErrors += batchResult.networkErrors;

      // If we hit network errors, stop processing to avoid wasting attempts
      if (batchResult.networkErrors > 0) {
        break;
      }
    }

    return {
      totalOperations: readyOperations.length,
      successfulOperations: totalSuccessful,
      failedOperations: totalFailed,
      networkErrors: totalNetworkErrors,
      results: allResults,
    };
  }
}
