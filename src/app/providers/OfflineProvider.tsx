// Provider for offline data management system
// Initializes and provides OfflineStore instance with all dependencies to the React application

import React, { useEffect, useState, ReactNode, useCallback } from 'react';
import { mutate } from 'swr';
import {
  OfflineStore,
  IDBManager,
  SyncQueue,
  ConnectivityMonitor,
  ConflictManager,
  ConflictResolver,
  ConnectivityStatus,
  SyncStatus,
} from '@/core/offline';
import { DatabaseCleanup } from '@/core/offline/database/DatabaseCleanup';
import { BackgroundSyncService } from '@/core/offline/sync/BackgroundSyncService';
import { OfflineContext } from './OfflineContext';

interface OfflineProviderProps {
  children: ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({
  children,
}) => {
  const [offlineStore, setOfflineStore] = useState<OfflineStore | null>(null);
  const [backgroundSyncService, setBackgroundSyncService] =
    useState<BackgroundSyncService | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [initializationError, setInitializationError] = useState<string | null>(
    null,
  );
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [connectivityStatus, setConnectivityStatus] =
    useState<ConnectivityStatus>({
      online: true,
      quality: 'good',
      lastOnline: new Date(),
      lastOffline: null,
    });
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    inProgress: false,
    pendingOperations: 0,
    lastSync: null,
    lastSyncSuccess: null,
    conflicts: 0,
  });

  useEffect(() => {
    const initializeOfflineStore = async () => {
      try {
        // Initialize all dependencies
        const dbManager = new IDBManager();
        const syncQueue = new SyncQueue(dbManager);
        const connectivityMonitor = new ConnectivityMonitor();
        const conflictResolver = new ConflictResolver();
        const conflictManager = new ConflictManager(
          dbManager,
          conflictResolver,
        );

        // Create and initialize the offline store
        const store = new OfflineStore(
          dbManager,
          syncQueue,
          connectivityMonitor,
          conflictManager,
        );

        await store.initialize();

        // Set up connectivity monitoring
        const updateConnectivityStatus = (status: ConnectivityStatus) => {
          setConnectivityStatus(status);
          setIsOnline(status.online);
        };

        const unsubscribeConnectivity = connectivityMonitor.subscribe(
          updateConnectivityStatus,
        );

        // Set initial connectivity status
        updateConnectivityStatus(connectivityMonitor.getStatus());

        // Set up periodic sync status updates
        const updateSyncStatus = async () => {
          const status = await store.getSyncStatus();
          setSyncStatus(status);
        };

        const syncStatusInterval = setInterval(() => {
          void updateSyncStatus();
        }, 5000); // Update every 5 seconds
        await updateSyncStatus(); // Initial update

        // Initialize background sync service
        const bgSyncService = new BackgroundSyncService(
          store,
          connectivityMonitor,
          {
            periodicSyncInterval: 300000, // 5 minutes
            enablePeriodicSync: true,
            enableConnectivitySync: true,
          },
        );

        // Set up sync event monitoring
        const unsubscribeSyncEvents = bgSyncService.onSyncEvent((event) => {
          console.log('Sync event:', event);
          // Update sync status when sync events occur
          void updateSyncStatus();
        });

        bgSyncService.start();

        setOfflineStore(store);
        setBackgroundSyncService(bgSyncService);
        setIsInitializing(false);
        console.log('Offline store initialized successfully');

        // Cleanup function
        return () => {
          unsubscribeConnectivity();
          unsubscribeSyncEvents();
          clearInterval(syncStatusInterval);
          bgSyncService.stop();
        };
      } catch (error) {
        console.error('Failed to initialize offline store:', error);

        // If it's a missing object store error, try to reset the database
        if (
          error instanceof Error &&
          error.message.includes('Object store') &&
          error.message.includes('does not exist')
        ) {
          console.log(
            'Attempting to reset database due to missing object stores...',
          );
          try {
            // First try to reinitialize without deleting
            if (offlineStore) {
              await offlineStore.reinitialize();
            }
            console.log('Database reinitialization successful');
          } catch {
            console.log(
              'Reinitialization failed, attempting full database reset...',
            );
            try {
              // Delete the entire database and start fresh
              await DatabaseCleanup.deleteDatabase();

              // Recreate the offline store with fresh database
              const newDbManager = new IDBManager();
              const newSyncQueue = new SyncQueue(newDbManager);
              const newConnectivityMonitor = new ConnectivityMonitor();
              const newConflictResolver = new ConflictResolver();
              const newConflictManager = new ConflictManager(
                newDbManager,
                newConflictResolver,
              );
              const newOfflineStore = new OfflineStore(
                newDbManager,
                newSyncQueue,
                newConnectivityMonitor,
                newConflictManager,
              );

              await newOfflineStore.initialize();
              setOfflineStore(newOfflineStore);

              console.log('Database reset and reinitialization successful');
            } catch (resetError) {
              console.error('Failed to reset database:', resetError);
              setInitializationError(
                'Database corruption detected. Please refresh the page to reset.',
              );
              setIsInitializing(false);
              return;
            }
          }
        } else {
          setInitializationError(
            error instanceof Error
              ? error.message
              : 'Failed to initialize offline storage',
          );
          setIsInitializing(false);
          return;
        }
      } finally {
        setIsInitializing(false);
      }
    };

    const cleanup = initializeOfflineStore();

    return () => {
      void cleanup.then((cleanupFn) => cleanupFn?.());
    };
  }, [offlineStore]);

  const invalidateAllCaches = useCallback(async () => {
    // Invalidate all SWR caches related to habits
    // Use revalidate: false to prevent immediate refetch
    await mutate(
      (key) => typeof key === 'string' && key.includes('/api/v1/habits'),
      undefined,
      { revalidate: false },
    );
  }, []);

  const sync = useCallback(async (): Promise<void> => {
    if (!backgroundSyncService) {
      throw new Error('BackgroundSyncService not initialized');
    }

    try {
      await backgroundSyncService.triggerSync('user_initiated');

      // Invalidate caches after sync attempt
      await invalidateAllCaches();

      // Update sync status after sync
      if (offlineStore) {
        const status = await offlineStore.getSyncStatus();
        setSyncStatus(status);
      }

      console.log('Sync completed');
    } catch (error) {
      // Don't log sync-in-progress errors as they're not actual failures
      if (
        error instanceof Error &&
        error.message.includes('Sync already in progress')
      ) {
        console.log('Sync request queued (sync already in progress)');
      } else {
        console.error('Sync failed:', error);
      }

      // Still update sync status even on failure
      if (offlineStore) {
        const status = await offlineStore.getSyncStatus();
        setSyncStatus(status);
      }
      throw error;
    }
  }, [backgroundSyncService, offlineStore, invalidateAllCaches]);

  const resolveConflicts = useCallback(async (): Promise<void> => {
    if (!offlineStore) {
      throw new Error('OfflineStore not initialized');
    }

    try {
      await offlineStore.resolveConflicts();

      // Invalidate SWR caches after conflict resolution
      await invalidateAllCaches();

      // Update sync status after conflict resolution
      const status = await offlineStore.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Conflict resolution failed:', error);
      // Still update sync status even on failure
      const status = await offlineStore.getSyncStatus();
      setSyncStatus(status);
      throw error;
    }
  }, [offlineStore, invalidateAllCaches]);

  // Handle different initialization states
  if (isInitializing) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          flexDirection: 'column',
        }}
      >
        <div>Initializing offline storage...</div>
        <div style={{ fontSize: '0.8em', color: '#666', marginTop: '8px' }}>
          Setting up local database and sync services
        </div>
      </div>
    );
  }

  // TODO(human): Create a user-friendly error recovery interface
  if (initializationError || !offlineStore) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          flexDirection: 'column',
          padding: '20px',
        }}
      >
        <div style={{ color: '#ef4444', marginBottom: '16px' }}>
          ⚠️ Offline storage initialization failed
        </div>
        <div
          style={{
            fontSize: '0.9em',
            color: '#666',
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          {initializationError ?? 'Unable to initialize offline capabilities'}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Retry Initialization
        </button>
        <div style={{ fontSize: '0.8em', color: '#666', marginTop: '8px' }}>
          The app may work with limited functionality
        </div>
      </div>
    );
  }

  const contextValue = {
    offlineStore,
    isOnline,
    connectivityStatus,
    syncStatus,
    sync,
    resolveConflicts,
  };

  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
    </OfflineContext.Provider>
  );
};
