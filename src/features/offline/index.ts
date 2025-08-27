/**
 * Offline Module - Barrel Exports
 *
 * This module provides offline-first functionality for the application.
 * It handles data persistence, synchronization, and conflict resolution.
 */

// Export all types
export * from './types';

// Note: Service exports will be added as they are migrated
// export * from './services';
// export * from './store';
// export * from './components';
// export * from './hooks';
// export * from './utils';

/**
 * Migration Status:
 * - [ ] Move database services from core/offline/database
 * - [ ] Move sync services from core/offline/sync
 * - [ ] Move conflict services from core/offline/conflict
 * - [ ] Move connectivity services from core/offline/connectivity
 * - [ ] Move store from core/offline/store
 * - [ ] Move components from core/offline/components
 * - [ ] Move hooks from features/habits/hooks/*Offline*
 * - [ ] Update all import paths
 */
