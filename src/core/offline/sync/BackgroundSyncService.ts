// Background sync service with automatic triggers
// Handles connectivity restoration, periodic sync, and user-initiated sync operations

import { OfflineStore } from '../store/OfflineStore';
import { ConnectivityMonitor } from '../connectivity/ConnectivityMonitor';
import { ConnectivityStatus } from '../types';
import { BatchSyncResult } from './SyncProcessor';

export interface BackgroundSyncOptions {
  periodicSyncInterval?: number; // milliseconds
  retryDelay?: number; // milliseconds
  maxRetries?: number;
  enablePeriodicSync?: boolean;
  enableConnectivitySync?: boolean;
}

export interface SyncEvent {
  type: 'connectivity_restored' | 'periodic' | 'user_initiated' | 'retry';
  timestamp: Date;
  result?: BatchSyncResult;
  error?: string;
}

export class BackgroundSyncService {
  private offlineStore: OfflineStore;
  private connectivityMonitor: ConnectivityMonitor;
  private options: Required<BackgroundSyncOptions>;
  private periodicSyncTimer: ReturnType<typeof setTimeout> | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private connectivityUnsubscribe: (() => void) | null = null;
  private syncEventListeners: ((event: SyncEvent) => void)[] = [];
  private isRunning = false;
  private lastSyncAttempt: Date | null = null;
  private consecutiveFailures = 0;

  constructor(
    offlineStore: OfflineStore,
    connectivityMonitor: ConnectivityMonitor,
    options: BackgroundSyncOptions = {},
  ) {
    this.offlineStore = offlineStore;
    this.connectivityMonitor = connectivityMonitor;
    this.options = {
      periodicSyncInterval: options.periodicSyncInterval ?? 300000, // 5 minutes
      retryDelay: options.retryDelay ?? 60000, // 1 minute
      maxRetries: options.maxRetries ?? 3,
      enablePeriodicSync: options.enablePeriodicSync ?? true,
      enableConnectivitySync: options.enableConnectivitySync ?? true,
    };
  }

  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    // Set up connectivity monitoring
    if (this.options.enableConnectivitySync) {
      this.connectivityUnsubscribe = this.connectivityMonitor.subscribe(
        this.handleConnectivityChange.bind(this),
      );
    }

    // Set up periodic sync
    if (this.options.enablePeriodicSync) {
      this.schedulePeriodicSync();
    }

    console.log('BackgroundSyncService started');
  }

  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    // Clean up timers
    if (this.periodicSyncTimer) {
      clearTimeout(this.periodicSyncTimer);
      this.periodicSyncTimer = null;
    }

    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }

    // Clean up connectivity monitoring
    if (this.connectivityUnsubscribe) {
      this.connectivityUnsubscribe();
      this.connectivityUnsubscribe = null;
    }

    console.log('BackgroundSyncService stopped');
  }

  async triggerSync(type: SyncEvent['type'] = 'user_initiated'): Promise<void> {
    if (!this.connectivityMonitor.isOnline()) {
      const error = 'Cannot sync while offline';
      this.emitSyncEvent({ type, timestamp: new Date(), error });
      throw new Error(error);
    }

    this.lastSyncAttempt = new Date();

    try {
      await this.offlineStore.sync();

      // Sync completed successfully (no exception thrown)
      this.consecutiveFailures = 0;

      // Get sync status to check for any issues
      const syncStatus = await this.offlineStore.getSyncStatus();

      // Create a result object based on sync status
      const result: BatchSyncResult = {
        totalOperations: syncStatus.pendingOperations,
        successfulOperations: 0,
        failedOperations: syncStatus.pendingOperations,
        networkErrors: 0,
        results: [],
      };

      this.emitSyncEvent({ type, timestamp: new Date(), result });

      // Schedule retry if there are still pending operations
      if (
        syncStatus.pendingOperations > 0 &&
        this.consecutiveFailures < this.options.maxRetries
      ) {
        this.scheduleRetry();
      }
    } catch (error) {
      this.consecutiveFailures++;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown sync error';

      this.emitSyncEvent({ type, timestamp: new Date(), error: errorMessage });

      // Schedule retry if we haven't exceeded max retries
      if (this.consecutiveFailures < this.options.maxRetries) {
        this.scheduleRetry();
      }

      throw error;
    }
  }

  private handleConnectivityChange(status: ConnectivityStatus): void {
    // Trigger sync when coming back online
    if (status.online && this.lastSyncAttempt) {
      const timeSinceLastSync = Date.now() - this.lastSyncAttempt.getTime();

      // Only sync if it's been a while since the last attempt
      if (timeSinceLastSync > this.options.retryDelay) {
        this.triggerSync('connectivity_restored').catch((error) => {
          console.error('Connectivity restoration sync failed:', error);
        });
      }
    }
  }

  private schedulePeriodicSync(): void {
    if (!this.isRunning || !this.options.enablePeriodicSync) {
      return;
    }

    this.periodicSyncTimer = setTimeout(() => {
      if (this.isRunning && this.connectivityMonitor.isOnline()) {
        this.triggerSync('periodic').catch((error) => {
          console.error('Periodic sync failed:', error);
        });
      }

      // Schedule next periodic sync
      this.schedulePeriodicSync();
    }, this.options.periodicSyncInterval);
  }

  private scheduleRetry(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }

    // Use exponential backoff for retries
    const backoffMultiplier = Math.pow(2, this.consecutiveFailures - 1);
    const delay = Math.min(this.options.retryDelay * backoffMultiplier, 300000); // Max 5 minutes

    this.retryTimer = setTimeout(() => {
      if (this.isRunning && this.connectivityMonitor.isOnline()) {
        this.triggerSync('retry').catch((error) => {
          console.error('Retry sync failed:', error);
        });
      }
    }, delay);
  }

  private emitSyncEvent(event: SyncEvent): void {
    for (const listener of this.syncEventListeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('Sync event listener error:', error);
      }
    }
  }

  onSyncEvent(listener: (event: SyncEvent) => void): () => void {
    this.syncEventListeners.push(listener);

    return () => {
      const index = this.syncEventListeners.indexOf(listener);
      if (index > -1) {
        this.syncEventListeners.splice(index, 1);
      }
    };
  }

  getStatus(): {
    isRunning: boolean;
    lastSyncAttempt: Date | null;
    consecutiveFailures: number;
    nextPeriodicSync: Date | null;
    nextRetry: Date | null;
  } {
    return {
      isRunning: this.isRunning,
      lastSyncAttempt: this.lastSyncAttempt,
      consecutiveFailures: this.consecutiveFailures,
      nextPeriodicSync: this.periodicSyncTimer
        ? new Date(Date.now() + this.options.periodicSyncInterval)
        : null,
      nextRetry: this.retryTimer
        ? new Date(Date.now() + this.options.retryDelay)
        : null,
    };
  }

  updateOptions(newOptions: Partial<BackgroundSyncOptions>): void {
    const oldEnablePeriodicSync = this.options.enablePeriodicSync;

    Object.assign(this.options, newOptions);

    // Restart periodic sync if it was enabled
    if (
      !oldEnablePeriodicSync &&
      this.options.enablePeriodicSync &&
      this.isRunning
    ) {
      this.schedulePeriodicSync();
    }

    // Stop periodic sync if it was disabled
    if (
      oldEnablePeriodicSync &&
      !this.options.enablePeriodicSync &&
      this.periodicSyncTimer
    ) {
      clearTimeout(this.periodicSyncTimer);
      this.periodicSyncTimer = null;
    }
  }
}
