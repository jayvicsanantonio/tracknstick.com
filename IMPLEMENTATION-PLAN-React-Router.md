# React Router Implementation Plan

## Overview

This document outlines the detailed task list and implementation strategy for
integrating React Router into the tracknstick.com application, transforming it
from a state-based navigation system to a URL-driven one, following the
Engineering Requirements Document.

## Phase 1: Setup and Feature Flag

### Task 1.1: Feature Flag Implementation

- [ ] Set up `isUrlRoutingEnabled` feature flag to control rollout
- [ ] Implement conditional rendering in `App.tsx` or `main.tsx` to switch
      between state-based and URL-based routing

### Task 1.2: Install Required Dependencies

- [ ] Use pnpm to install necessary packages
  ```bash
  pnpm add react-router-dom
  pnpm add -D @types/react-router-dom
  ```
- [ ] Verify installation in `package.json`

## Phase 2: Route Structure and Configuration

### Task 2.1: Create Page Components

- [ ] Create `src/pages/` directory
- [ ] Implement `DashboardPage.tsx`, `HabitsPage.tsx`, `ProgressPage.tsx`, and
      `NotFoundPage.tsx`

### Task 2.2: Define Centralized Routing

- [ ] Set up `src/routes/index.tsx` for route configuration
- [ ] Use `createBrowserRouter` for router initialization

## Phase 3: Core Application Integration

### Task 3.1: Update Application Entry

- [ ] Integrate `RouterProvider` in `main.tsx`
- [ ] Ensure `App.tsx` wraps context providers around `RouterProvider`

### Task 3.2: Refactor Components

- [ ] Update `Body.tsx` to use `Outlet`
- [ ] Modify `Header.tsx` to replace buttons with `NavLink`

## Phase 4: State and Context Refactoring

### Task 4.1: Update HabitsStateContext

- [ ] Remove routing-related state variables
  - `isHabitsOverviewMode`, `isProgressOverviewMode`
  - Associated toggle functions

### Task 4.2: Ensure Independence from Removed States

- [ ] Refactor components to operate independently of removed state flags

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

---

This implementation strategy ensures a smooth transition to URL-based
navigation, while keeping the option of easy rollback with feature flags. It
aligns with the engineering requirements and focuses on enhancing both user
experience and development scalability.
