# React Router Implementation Plan

## Overview

This document outlines the detailed task list and implementation strategy for
integrating React Router into the tracknstick.com application, transforming it
from a state-based navigation system to a URL-driven one, following the
Engineering Requirements Document.

## Phase 1: Setup and Feature Flag ✅ **COMPLETED**

### Task 1.1: Feature Flag Implementation ✅

- [x] Set up `isUrlRoutingEnabled` feature flag to control rollout
  - Created `src/config/featureFlags.ts` with strongly typed interface
  - Environment variable control via `VITE_URL_ROUTING_ENABLED`
- [x] Implement conditional rendering in `App.tsx` to switch between state-based
      and URL-based routing
  - Added feature flag-based conditional rendering
  - Preserves legacy system when flag is disabled (default)
  - Seamless rollback capability without redeployment

### Task 1.2: Install Required Dependencies ✅

- [x] Use pnpm to install necessary packages
  ```bash
  pnpm add react-router-dom    # Installed v7.7.0
  pnpm add -D @types/react-router-dom  # Installed v5.3.3
  ```
- [x] Verify installation in `package.json`
  - Dependencies verified and working
  - Application builds successfully
- [x] Created comprehensive router configuration (`src/routes/index.tsx`)
  - Type-safe route definitions using `RouteObject[]`
  - Error boundaries for each route
  - Suspense integration for future lazy loading
  - Centralized route constants with type safety
- [x] Implemented page title management (`src/hooks/usePageTitle.ts`)
  - Dynamic page title updates for SEO
  - Clean hook-based API with proper cleanup
- [x] Built navigation utilities (`src/utils/navigation.ts`)
  - Type-safe route constants (`ROUTES`)
  - Enhanced navigation hook (`useAppNavigation`)
  - Convenience methods for routing operations
  - Route checking functions
- [x] Added comprehensive error handling
  - Route-level error boundaries
  - Loading fallback components
  - Graceful error recovery
- [x] Enhanced TypeScript integration
  - Strong typing throughout routing system
  - Type-safe navigation functions
  - Compile-time route validation
- [x] Updated Engineering Requirements Document
  - Specified React Router v7.7 instead of v6
  - Added v7.7-specific features and benefits
- [x] Created comprehensive documentation (`PHASE-1-IMPLEMENTATION.md`)
  - Complete implementation details
  - Code examples and explanations
  - Benefits and improvements analysis

## Phase 2: Route Structure and Configuration ✅ **COMPLETED**

### Task 2.1: Create Page Components ✅

- [x] Create `src/pages/` directory
- [x] Implement `DashboardPage.tsx`, `HabitsPage.tsx`, `ProgressPage.tsx`, and
      `NotFoundPage.tsx`
  - Each page uses the `usePageTitle` hook for dynamic title management
  - Page components properly wrap their respective feature components
  - Created barrel export file for cleaner imports

### Task 2.2: Define Centralized Routing ✅

- [x] Set up `src/routes/index.tsx` for route configuration
  - **Completed in Phase 1**: Router configuration with React Router v7.7
    patterns
  - Type-safe route definitions and error boundaries included
- [x] Use `createBrowserRouter` for router initialization
  - **Completed in Phase 1**: Modern router creation with enhanced features
  - Suspense boundaries and error handling integrated
- [x] Implement layout-based routing with `RootLayout`
  - Authentication-aware layout component
  - Nested routes for better structure
- [x] Update router to use new page components
  - Removed inline components in favor of imported pages
  - Maintained all error and suspense boundaries
- [x] Created comprehensive documentation (`PHASE-2-IMPLEMENTATION.md`)
  - Complete implementation details
  - Code examples and architecture decisions
  - Benefits and validation results

## Phase 3: Core Application Integration ✅ **COMPLETED**

### Task 3.1: Update Application Entry ✅

- [x] Integrate `RouterProvider` in `main.tsx`
- [x] Ensure `App.tsx` wraps context providers around `RouterProvider`

### Task 3.2: Refactor Components ✅

- [x] Update `Body.tsx` to use `Outlet`
- [x] Modify `Header.tsx` to replace buttons with `NavLink`

## Phase 4: State and Context Refactoring ✅ **COMPLETED**

### Task 4.1: Update HabitsStateContext ✅

- [x] Remove routing-related state variables
  - `isHabitsOverviewMode`, `isProgressOverviewMode`
  - Associated toggle functions

### Task 4.2: Ensure Independence from Removed States ✅

- [x] Refactor components to operate independently of removed state flags
  - Updated `Header.tsx` to work without navigation state
  - Updated `Body.tsx` to default to Daily Habit Tracker in legacy mode
  - Updated `HabitsOverview.tsx` to use React Router navigation
  - Updated `ProgressOverview.tsx` to use React Router navigation

## Phase 5: Testing and Validation

### Task 5.1: Unit and Integration Testing

- [ ] Develop tests for new page and component routing
- [ ] Use `createMemoryRouter` to test routing logic

### Task 5.2: End-to-End Testing

- [ ] Implement E2E tests using Cypress or Playwright
- [ ] Validate navigation via direct URLs, navigation links, and browser history

## Phase 6: Rollout and Monitoring

### Task 6.1: Gradual Rollout Strategy

- [ ] Deploy with the feature flag disabled initially
- [ ] Begin rollout to internal users, expanding to 10% of users over time
- [ ] Monitor performance and user feedback

## Success Criteria

- [ ] URL-driven routing is controlled entirely by `react-router-dom`
- [ ] Navigation reflects in browser history and URL
- [ ] All routes operate correctly upon browser refresh
- [ ] Tests are comprehensive and pass consistently
- [ ] Feature flag allows for seamless rollback if needed

## Rollback Plan

- [ ] Disable the `isUrlRoutingEnabled` feature flag to revert to the old
      navigation
- [ ] No redeployment needed for an immediate switch back

## Timeline Estimate

- **Phase 1-2**: 1 day
- **Phase 3-4**: 2 days
- **Phase 5-6**: 3 days

**Total Estimated Time**: 6 days

## Risk Assessment

- **High Risk**: Transition state management to routing may cause regressions
- **Medium Risk**: User authentication flow could be disrupted
- **Low Risk**: Performance impacts from bundle size are minor, with mitigations

## Notes

- Prioritize backward compatibility
- Conduct thorough testing across various browsers and devices
- Plan extensions for nested and protected routes in future expansions

## Architectural Best Practices Applied

### Component Organization

- Separate fallback components (`LoadingFallback`, `ErrorBoundary`) into
  dedicated files to avoid React Refresh warnings
- Move hooks like `useHabitsContext` to a dedicated `hooks` folder for better
  code organization
- Keep route definitions clean by importing components rather than declaring
  them inline

### TypeScript and Linting Compliance

- Handle promise-returning functions in event handlers properly:
  ```tsx
  // Avoid: onClick={() => navigate('/')}
  // Use: onClick={() => { void navigate('/'); }}
  ```
- This prevents TypeScript linting errors about misused promises
- Maintains full type safety without suppressing linting rules

### Import Path Management

- Use consistent import paths with aliases (e.g., `@/hooks/useHabitsContext`)
- Update all component imports when refactoring file locations
- Maintain clear separation between context definitions and their usage hooks

---

This implementation strategy ensures a smooth transition to URL-based
navigation, while keeping the option of easy rollback with feature flags. It
aligns with the engineering requirements and focuses on enhancing both user
experience and development scalability.
