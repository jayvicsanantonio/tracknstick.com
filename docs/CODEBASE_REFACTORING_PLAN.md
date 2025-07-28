# Codebase Refactoring Plan - tracknstick.com

## Executive Summary

This document outlines a comprehensive refactoring plan to improve the file
organization, maintainability, and overall structure of the tracknstick.com
codebase. The refactoring focuses on enhancing the existing feature-based
architecture, establishing clear module boundaries, and implementing best
practices for scalability.

## Current State Analysis

### Strengths

- Already using a partial feature-based structure (`src/features/`)
- Modern tech stack (React 19, TypeScript, Vite 6)
- PWA capabilities implemented
- Good separation of UI components with Radix UI
- Type-safe routing with React Router

### Areas for Improvement

- Mixed organizational patterns (feature-based and type-based)
- Some global state management in App.tsx
- Inconsistent module boundaries
- Testing structure could be improved
- Build artifacts mixed with source code

## Proposed Directory Structure

```
tracknstick.com/
├── .github/                    # GitHub specific configurations
│   ├── workflows/             # CI/CD workflows
│   └── ISSUE_TEMPLATE/        # Issue templates
├── .husky/                    # Git hooks
├── .vscode/                   # VS Code workspace settings
├── dist/                      # Build output (gitignored)
├── coverage/                  # Test coverage reports (gitignored)
├── playwright-report/         # E2E test reports (gitignored)
├── test-results/              # Test results (gitignored)
├── docs/                      # Documentation
│   ├── architecture/          # Architecture decisions and diagrams
│   ├── api/                   # API documentation
│   ├── guides/                # Development guides
│   └── kiro/                  # Product documentation
├── public/                    # Static assets
│   ├── icons/                 # PWA and favicon icons
│   ├── fonts/                 # Custom fonts (if any)
│   └── images/                # Static images
├── scripts/                   # Build and utility scripts
├── src/
│   ├── app/                   # Application shell
│   │   ├── providers/         # Global providers setup
│   │   ├── routes/            # Route configuration
│   │   └── App.tsx           # Root component
│   ├── features/              # Feature modules
│   │   ├── auth/             # Authentication feature
│   │   │   ├── api/          # Auth API calls
│   │   │   ├── components/   # Auth-specific components
│   │   │   ├── hooks/        # Auth hooks
│   │   │   ├── stores/       # Auth state management
│   │   │   ├── types/        # Auth types
│   │   │   └── index.ts      # Public API
│   │   ├── habits/           # Habits feature (existing)
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── stores/       # Habit state management
│   │   │   ├── types/
│   │   │   ├── utils/        # Habit-specific utilities
│   │   │   └── index.ts
│   │   ├── progress/         # Progress feature (existing)
│   │   │   └── ...
│   │   └── settings/         # Settings feature
│   │       └── ...
│   ├── shared/               # Shared modules
│   │   ├── components/       # Shared components
│   │   │   ├── ui/          # Base UI components (existing)
│   │   │   ├── layouts/     # Layout components
│   │   │   └── feedback/    # Toasts, alerts, etc.
│   │   ├── hooks/           # Shared hooks
│   │   ├── services/        # Shared services
│   │   │   ├── api/         # API client configuration
│   │   │   ├── storage/     # Local storage utilities
│   │   │   └── monitoring/  # Error tracking, analytics
│   │   ├── utils/           # Shared utilities
│   │   │   ├── date/        # Date formatting utilities
│   │   │   ├── validation/  # Form validation utilities
│   │   │   └── formatting/  # Text formatting utilities
│   │   ├── types/           # Shared types
│   │   └── constants/       # Shared constants
│   ├── styles/              # Global styles
│   │   ├── index.css       # Main stylesheet
│   │   └── themes/         # Theme configurations
│   ├── testing/            # Testing utilities
│   │   ├── mocks/          # Mock data and handlers
│   │   ├── fixtures/       # Test fixtures
│   │   └── utils/          # Testing utilities
│   └── main.tsx            # Application entry point
├── tests/                  # Integration and E2E tests
│   ├── e2e/               # Playwright tests
│   └── integration/       # Integration tests
└── [configuration files]   # Various config files
```

## Refactoring Steps

### Phase 1: Foundation (Week 1)

1. **Create new directory structure**

   ```bash
   mkdir -p src/{app/{providers,routes},shared/{services/{api,storage,monitoring},utils/{date,validation,formatting}},styles/themes,testing/{mocks,fixtures,utils}}
   mkdir -p tests/{e2e,integration}
   mkdir -p docs/{architecture,api,guides}
   ```

2. **Move and reorganize shared modules**

   - Move `src/components/ui/` → `src/shared/components/ui/`
   - Move `src/hooks/` → `src/shared/hooks/`
   - Move `src/lib/` → `src/shared/utils/`
   - Move `src/services/` → `src/shared/services/`
   - Move `src/types/` → `src/shared/types/`
   - Move `src/constants/` → `src/shared/constants/`

3. **Reorganize app-level code**
   - Move routing logic from `src/routes/` → `src/app/routes/`
   - Move providers from `src/context/` → `src/app/providers/`
   - Move `src/layouts/` → `src/shared/components/layouts/`

### Phase 2: Feature Module Enhancement (Week 2)

1. **Standardize feature structure**

   - Add `stores/` subdirectory to each feature for state management
   - Add `utils/` subdirectory for feature-specific utilities
   - Create barrel exports (`index.ts`) for each feature

2. **Extract feature-specific code from App.tsx**

   - Move habit-related state to `features/habits/stores/`
   - Move dialog management to respective features
   - Simplify App.tsx to only handle routing and global providers

3. **Implement feature facades**
   ```typescript
   // src/features/habits/index.ts
   export * from './components';
   export * from './hooks';
   export * from './types';
   export { habitsApi } from './api';
   ```

### Phase 3: State Management Refactoring (Week 3)

1. **Implement feature-specific contexts**

   ```typescript
   // src/features/habits/stores/HabitsProvider.tsx
   export const HabitsProvider: FC<PropsWithChildren> = ({ children }) => {
     // Consolidated habits state management
   };
   ```

2. **Create state management utilities**

   ```typescript
   // src/shared/utils/state/createFeatureContext.ts
   export function createFeatureContext<T>(name: string) {
     // Generic context creation utility
   }
   ```

3. **Migrate from prop drilling to context/hooks**
   - Identify prop drilling patterns
   - Create appropriate contexts
   - Update components to use hooks

### Phase 4: Testing Structure (Week 4)

1. **Reorganize tests**

   - Move component tests next to components
   - Move integration tests to `tests/integration/`
   - Move E2E tests to `tests/e2e/`

2. **Create testing utilities**

   ```typescript
   // src/testing/utils/renderWithProviders.tsx
   export function renderWithProviders(
     ui: ReactElement,
     options?: RenderOptions,
   ) {
     // Custom render function with all providers
   }
   ```

3. **Establish testing patterns**
   - Unit tests for utilities and hooks
   - Integration tests for features
   - E2E tests for critical user paths

### Phase 5: Build and Configuration (Week 5)

1. **Clean up build artifacts**

   - Update .gitignore to exclude all build outputs
   - Move test reports to appropriate directories
   - Configure output paths consistently

2. **Update import aliases**

   ```typescript
   // tsconfig.json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"],
         "@features/*": ["./src/features/*"],
         "@shared/*": ["./src/shared/*"],
         "@app/*": ["./src/app/*"]
       }
     }
   }
   ```

3. **Create build scripts**
   ```json
   // package.json
   {
     "scripts": {
       "build:analyze": "vite build --mode analyze",
       "test:unit": "vitest run --dir src",
       "test:integration": "vitest run --dir tests/integration",
       "test:e2e": "playwright test"
     }
   }
   ```

## Implementation Guidelines

### Naming Conventions

1. **Files and Directories**

   - Features: kebab-case (`user-profile/`)
   - Components: PascalCase (`Button.tsx`)
   - Hooks: camelCase with `use` prefix (`useHabits.ts`)
   - Utilities: camelCase (`formatDate.ts`)
   - Types: PascalCase (`HabitType.ts`)

2. **Exports**
   - Named exports for all modules
   - Default exports only for pages/routes
   - Barrel exports for feature APIs

### Module Boundaries

1. **Feature Independence**

   - Features should not import from other features directly
   - Shared functionality goes in `src/shared/`
   - Cross-feature communication through events or shared state

2. **Dependency Direction**
   - Features → Shared → External
   - No circular dependencies
   - Clear public APIs for each module

### Code Organization Principles

1. **Single Responsibility**

   - Each file has one clear purpose
   - Components handle presentation
   - Hooks handle logic
   - Services handle external communication

2. **Colocation**

   - Keep related code together
   - Tests next to implementation
   - Types with their consumers
   - Styles with components (when using CSS modules)

3. **Progressive Disclosure**
   - Public API at feature root
   - Implementation details in subdirectories
   - Clear separation of concerns

## Migration Strategy

### Phase-by-Phase Approach

1. **Prepare** (1 day)

   - Create new directory structure
   - Set up build configurations
   - Update documentation

2. **Migrate Shared Modules** (2-3 days)

   - Move with git to preserve history
   - Update all imports
   - Run tests after each move

3. **Refactor Features** (1 week)

   - One feature at a time
   - Update imports incrementally
   - Maintain backward compatibility

4. **Clean Up** (2-3 days)
   - Remove old directories
   - Update documentation
   - Final testing

### Rollback Plan

1. Keep feature branches for each phase
2. Tag releases before major changes
3. Maintain compatibility layer during migration
4. Document all breaking changes

## Success Metrics

1. **Code Organization**

   - Clear feature boundaries
   - Reduced coupling between modules
   - Easier navigation and discovery

2. **Developer Experience**

   - Faster feature development
   - Easier onboarding
   - Better IDE support

3. **Maintainability**

   - Reduced merge conflicts
   - Easier testing
   - Clear upgrade paths

4. **Performance**
   - Better code splitting
   - Reduced bundle sizes
   - Faster build times

## Next Steps

1. Review and approve plan with team
2. Create implementation tickets
3. Set up feature branches
4. Begin Phase 1 implementation
5. Schedule regular check-ins

## Appendix

### Example Feature Structure

```typescript
// src/features/habits/index.ts
export { HabitsProvider, useHabits, useHabitStats } from './hooks';
export { HabitList, HabitForm, HabitCard } from './components';
export type { Habit, HabitFrequency, HabitStats } from './types';
export { habitsApi } from './api';
```

### Example Shared Component

```typescript
// src/shared/components/ui/Button/Button.tsx
import { forwardRef } from 'react';
import { cn } from '@shared/utils';
import { buttonVariants } from './Button.variants';
import type { ButtonProps } from './Button.types';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
```

### Example Testing Setup

```typescript
// src/testing/utils/test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { AllProviders } from './AllProviders';

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
export { renderWithProviders as render };
```
