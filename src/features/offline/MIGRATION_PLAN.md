# Offline Module Migration Plan

## Overview

This document outlines the migration of the offline module from
`src/core/offline/` to `src/features/offline/` with a flattened structure.

## Current Structure Issues

- Deep nesting (4+ levels)
- Scattered types and interfaces
- Difficult navigation
- Inconsistent test placement

## Target Structure Benefits

- Maximum 3 levels of nesting
- Consolidated types in single file
- Clear service organization
- Consistent test placement

## Migration Phases

### Phase 1: Setup (✅ COMPLETE)

- [x] Create new directory structure
- [x] Consolidate types and interfaces
- [x] Create module documentation

### Phase 2: Service Migration (⏳ TODO)

```bash
# Move core services maintaining functionality
src/core/offline/database/* → src/features/offline/services/database/
src/core/offline/sync/* → src/features/offline/services/sync/
src/core/offline/conflict/* → src/features/offline/services/conflict/
src/core/offline/connectivity/* → src/features/offline/services/connectivity/
```

### Phase 3: Component Migration (⏳ TODO)

```bash
# Move UI components
src/core/offline/components/* → src/features/offline/components/
```

### Phase 4: Store Migration (⏳ TODO)

```bash
# Move state management
src/core/offline/store/* → src/features/offline/store/
```

### Phase 5: Hook Consolidation (⏳ TODO)

```bash
# Move offline hooks from habits
src/features/habits/hooks/useHabitsOffline.ts → src/features/offline/hooks/
src/features/habits/hooks/useAllHabitsOffline.ts → src/features/offline/hooks/
```

### Phase 6: Import Updates (⏳ TODO)

Update all imports throughout the codebase:

```typescript
// Old
import { IDBManager } from '@/core/offline/interfaces';
import { OfflineHabit } from '@/core/offline/types';

// New
import { IDBManager, OfflineHabit } from '@/features/offline/types';
```

### Phase 7: Test Migration (⏳ TODO)

```bash
# Move and reorganize tests
src/core/offline/__tests__/* → src/features/offline/__tests__/
src/core/offline/*/test__/* → src/features/offline/services/*/
```

### Phase 8: Cleanup (⏳ TODO)

- Remove old directory structure
- Update documentation
- Verify all imports
- Run full test suite

## Import Update Script

To help with import updates, use this search and replace pattern:

```bash
# Find all imports from old location
grep -r "@/core/offline" src/

# Common replacements
@/core/offline/interfaces → @/features/offline/types
@/core/offline/types → @/features/offline/types
@/core/offline/database/IDBManager → @/features/offline/services/database/IDBManager
@/core/offline/store/OfflineStore → @/features/offline/store/OfflineStore
```

## Verification Checklist

- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No broken imports
- [ ] Application builds successfully
- [ ] Offline functionality works
- [ ] Sync operations work
- [ ] Conflict resolution works

## Rollback Plan

If issues arise:

1. The old structure remains intact until Phase 8
2. Git history preserves all changes
3. Can revert by restoring old imports

## Notes

- Keep both structures temporarily for gradual migration
- Update imports file by file to avoid breaking changes
- Run tests after each phase
- Document any issues encountered

## Status Log

- **2024-08-22**: Phase 1 completed - Structure created, types consolidated
- **Next**: Begin Phase 2 - Service migration
