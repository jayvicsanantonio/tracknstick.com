# Offline Module

The offline module provides comprehensive offline-first functionality for the
Track'n'Stick application.

## Structure (Target - Migration in Progress)

```
offline/
├── __tests__/           # Module-level tests
├── components/          # Offline-related UI components
│   ├── ConflictResolutionModal.tsx
│   ├── ConflictResolutionProvider.tsx
│   ├── ConflictResolutionUI.tsx
│   └── SyncStatus.tsx
├── hooks/              # Offline-enabled hooks
│   ├── useHabitsOffline.ts
│   ├── useAllHabitsOffline.ts
│   └── useOfflineSync.ts
├── services/           # Core offline services
│   ├── database/       # IndexedDB management
│   ├── sync/          # Synchronization logic
│   ├── conflict/      # Conflict resolution
│   └── connectivity/  # Network monitoring
├── store/             # Offline state management
│   └── OfflineStore.ts
├── utils/             # Utility functions
├── types.ts           # Consolidated type definitions
├── index.ts           # Barrel exports
└── README.md          # This file
```

## Migration Status

⚠️ **This module is being migrated from `src/core/offline/`**

The migration is being done in phases to ensure stability:

1. ✅ Create new structure
2. ✅ Consolidate types and interfaces
3. 🔄 Move services (in progress)
4. ⏳ Update import paths
5. ⏳ Remove old structure

## Core Concepts

### 1. Offline-First Architecture

- All data operations work offline by default
- Changes are queued and synced when connectivity is restored
- Optimistic updates provide immediate feedback

### 2. Data Persistence

- Uses IndexedDB for client-side storage
- Supports complex queries and indexing
- Handles large datasets efficiently

### 3. Synchronization

- Automatic sync when online
- Retry logic for failed operations
- Batch processing for efficiency

### 4. Conflict Resolution

- Three-way merge for concurrent edits
- User-driven resolution for complex conflicts
- Automatic resolution for simple cases

### 5. Connectivity Monitoring

- Real-time network status detection
- Quality assessment (poor/good/excellent)
- Adaptive sync strategies based on connection quality

## Usage

### Basic Usage

```typescript
import { useHabitsOffline } from '@/features/offline/hooks';

function MyComponent() {
  const { habits, createHabit, updateHabit } = useHabitsOffline();

  // Works offline automatically
  await createHabit({ name: 'New Habit' });
}
```

### Monitoring Sync Status

```typescript
import { useSyncStatus } from '@/features/offline/hooks';

function SyncIndicator() {
  const { syncing, pendingChanges } = useSyncStatus();

  if (syncing) return <div>Syncing...</div>;
  if (pendingChanges > 0) return <div>{pendingChanges} changes pending</div>;
  return <div>All synced</div>;
}
```

### Handling Conflicts

```typescript
import { ConflictResolutionProvider } from '@/features/offline/components';

function App() {
  return (
    <ConflictResolutionProvider>
      {/* App content */}
    </ConflictResolutionProvider>
  );
}
```

## Testing

Tests are organized by functionality:

- Database operations
- Sync queue management
- Conflict resolution
- Connectivity monitoring
- Integration tests

Run tests:

```bash
pnpm test src/features/offline
```

## Performance Considerations

- Lazy load the offline module for better initial load time
- Use indexed queries for large datasets
- Batch sync operations to reduce network overhead
- Implement debouncing for frequent updates

## Future Enhancements

- [ ] Selective sync (sync only specific data types)
- [ ] Compression for sync payloads
- [ ] Background sync using Service Workers
- [ ] Offline analytics
- [ ] Data export/import functionality

## Dependencies

- **Dexie.js**: IndexedDB wrapper (not currently used, raw IndexedDB instead)
- **React**: For hooks and components
- **TypeScript**: For type safety

## Related Documentation

- [Current Architecture](../../../docs/CURRENT_ARCHITECTURE.md)
- [Offline-First Specification](../../../project-specs/offline-first-data-management/)
- [Testing Guide](../../../docs/guides/testing.md)
