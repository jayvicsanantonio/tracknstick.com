// Entry point for offline data management system
// Exports all core components for offline-first functionality

// Core components
export { IDBManager } from './database/IDBManager';
export {
  IDBPerformanceOptimizer,
  getPerformanceOptimizer,
} from './database/IDBPerformanceOptimizer';
export {
  OPTIMIZED_INDEX_STRATEGIES,
  QUERY_OPTIMIZATION_PATTERNS,
  IndexAnalyzer,
  indexAnalyzer,
  type IndexDefinition,
  type StoreIndexes,
  type IndexPerformanceMetrics,
} from './database/IDBIndexStrategy';
export { ConnectivityMonitor } from './connectivity/ConnectivityMonitor';
export { SyncQueue } from './sync/SyncQueue';
export { SyncProcessor } from './sync/SyncProcessor';
export { BackgroundSyncService } from './sync/BackgroundSyncService';
export { RetryManager } from './sync/RetryManager';
export { OfflineStore } from './store/OfflineStore';

// Services
export {
  HabitCompletionService,
  type HabitWithCompletion,
  type CompletionStats,
} from './services/HabitCompletionService';

// Error handling
export {
  OfflineError,
  ErrorCategory,
  ErrorSeverity,
  RecoveryStrategy,
} from './errors/OfflineError';
export {
  ErrorReportingService,
  getErrorReporting,
  reportError,
} from './errors/ErrorReportingService';
export {
  ErrorNotificationService,
  getErrorNotification,
  notifyError,
  useErrorNotifications,
} from './errors/ErrorNotificationService';

// Conflict resolution UI
export { ConflictResolutionModal } from './components/ConflictResolutionModal';
export {
  ConflictResolutionProvider,
  useConflictResolution,
} from './components/ConflictResolutionProvider';
export { ConflictsIndicator } from './components/ConflictsIndicator';

// Data validation and integrity
export {
  DataValidator,
  getDataValidator,
  validateAndSanitizeHabit,
  validateAndSanitizeHabitEntry,
} from './validation/DataValidator';
export {
  DataIntegrityService,
  getDataIntegrityService,
} from './validation/DataIntegrityService';

// Database migration
export {
  DatabaseMigrationManager,
  getMigrationManager,
  CORE_MIGRATIONS,
} from './migration/DatabaseMigration';

// Conflict resolution
export * from './conflict';

// Types and interfaces
export * from './types';
export * from './interfaces';

// Utilities
export * from './utils';
