// Context for offline data management system
// Provides OfflineStore instance and related services throughout the application

import { createContext, useContext } from 'react';
import { OfflineStore } from '@/core/offline';
import { ConnectivityStatus, SyncStatus } from '@/core/offline';

interface OfflineContextType {
  offlineStore: OfflineStore;
  isOnline: boolean;
  connectivityStatus: ConnectivityStatus;
  syncStatus: SyncStatus;
  sync: () => Promise<void>;
  resolveConflicts: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | null>(null);

export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

export { OfflineContext };
