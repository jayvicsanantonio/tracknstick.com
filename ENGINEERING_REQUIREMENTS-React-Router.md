# Engineering Requirements Document: React Router Integration

**Version:** 1.0  
**Status:** Proposed  
**Author:** Jayvic San Antonio  
**Date:** 2025-07-18

---

## 1.0 Overview

This document provides the detailed technical requirements for transitioning the
tracknstick.com frontend application from a state-based navigation model to a
modern, URL-driven routing system using `react-router-dom`. It translates the
user-facing goals from the Product Requirements Document (PRD) into an
actionable engineering plan.

The core objective is to decouple navigation from component state, enabling
features like browser history, bookmarking, and direct linking, which will
improve user experience, developer experience, and future scalability.

## 2.0 Technical Background & Problem Statement

The current navigation system relies on React Context (`HabitsStateContext`) and
boolean flags (`isHabitsOverviewMode`, `isProgressOverviewMode`) to
conditionally render different views within a single layout component
(`Body.tsx`).

This architecture has several technical limitations:

- **No Single Source of Truth for Location:** The application's "location" is
  stored in React state, which is not synchronized with the browser's URL bar or
  history stack.
- **High Coupling:** Navigation logic is tightly coupled with the
  `HabitsStateContext`, making it difficult to manage state and introduce new
  views without increasing complexity.
- **Poor Scalability:** Adding new top-level views requires modifying the
  central context and conditional rendering logic, which is not a scalable
  pattern.
- **Prevents Standard Web Functionality:** It is technically impossible to
  implement deep linking, server-side rendering for specific routes, or
  route-based code splitting with the current model.

## 3.0 Technical Goals & Non-Goals

### 3.1 Goals

1.  **Implement `react-router-dom` v6** as the sole authority for application
    routing.
2.  **Refactor the application** to use a route-centric architecture with
    distinct page components.
3.  **Decouple navigation state** from `HabitsStateContext`, simplifying its
    purpose to managing habit-related state only.
4.  **Establish a scalable routing foundation** that supports future features
    like nested routes and protected routes.
5.  **Implement a non-disruptive rollout** using a feature flag.

### 3.2 Non-Goals

1.  **No changes to the existing data model** or API endpoints.
2.  **No visual or CSS style changes**, other than what is required to style
    active navigation links.
3.  **No refactoring of business logic** within existing components (e.g.,
    `DailyHabitTracker`, `HabitsOverview`).
4.  **No implementation of a new authentication system.** Existing Clerk
    components (`<SignedIn>`, `<SignedOut>`) will be integrated into the new
    routing structure.

## 4.0 Technical Requirements

### 4.1 Dependencies

- The project must add the following dependencies:
  ```bash
  pnpm add react-router-dom
  pnpm add -D @types/react-router-dom
  ```

#### 4.1.1 Rationale for `react-router-dom`

To clarify a common point of confusion, this project explicitly requires the
`react-router-dom` package, not the `react-router` package.

- **`react-router`**: This package contains the core, platform-agnostic
  components and hooks for routing in React. It does not include any components
  that interact with a web browser's DOM or URL history.
- **`react-router-dom`**: This package re-exports everything from `react-router`
  and adds the essential components required for building a web application.
  These include `<BrowserRouter>`, `<Link>`, `<NavLink>`, and other tools that
  interface with the browser's DOM and history API.

For any web-based project, `react-router-dom` is the correct and standard
choice. Using `react-router` alone would not provide the necessary tools to
build a functional routing system in a web browser.

### 4.2 Directory Structure

- A new `src/pages/` directory will be created to house top-level route
  components.
  ```
  src/
  └── pages/
      ├── DashboardPage.tsx
      ├── HabitsPage.tsx
      ├── ProgressPage.tsx
      └── NotFoundPage.tsx
  ```
- A new `src/routes/` directory will contain the centralized routing
  configuration.
  ```
  src/
  └── routes/
      └── index.tsx
  ```

### 4.3 Routing Strategy

- **Router Type:** The application will use `createBrowserRouter` from
  `react-router-dom`. This is the standard for modern web applications and
  enables future data API integration.
- **Configuration:** The router configuration will be defined in
  `src/routes/index.tsx`.
- **Entry Point:** `main.tsx` will be updated to provide the router to the
  application via `<RouterProvider>`.

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import App from './App'; // App will now contain context providers etc.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App>
      <RouterProvider router={router} />
    </App>
  </React.StrictMode>
);
```

### 4.4 Component-Level Implementation

#### 4.4.1 `App.tsx`

- `App.tsx` will no longer contain routing logic. It will be responsible for
  wrapping the application in necessary context providers (Theme, Habits, etc.).
  The `RouterProvider` will be a child of these providers.

#### 4.4.2 `src/features/layout/components/Body.tsx`

- **REMOVE:** All conditional rendering logic based on `isHabitsOverviewMode`
  and `isProgressOverviewMode` must be removed.
- **ADD:** The component will render the `<Outlet />` component from
  `react-router-dom`. This component will render the matched child route
  component.
- The Clerk `<SignedIn>` and `<SignedOut>` logic will wrap the `<Outlet />` to
  protect routes.

```tsx
// src/features/layout/components/Body.tsx (Simplified)
import { Outlet } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { Welcome } from './Welcome';

export function Body() {
  return (
    <main>
      <SignedIn>
        <Outlet />
      </SignedIn>
      <SignedOut>
        <Welcome />
      </SignedOut>
    </main>
  );
}
```

#### 4.4.3 `src/features/layout/components/Header.tsx`

- **REPLACE:** All `<button>` elements used for navigation must be replaced with
  `<NavLink>` from `react-router-dom`.
- **`to` Prop:** Each `<NavLink>` must have its `to` prop set to the
  corresponding route path (e.g., `/`, `/habits`, `/progress`).
- **Active Styling:** The `className` or `style` prop of `<NavLink>` must be a
  function that receives `{ isActive }` and returns the appropriate class for
  active link styling. This replaces the state-based highlighting.

#### 4.4.4 `src/pages/*.tsx` Components

- These will be simple wrapper components that render the feature components.
  This decouples the feature from the route.

```tsx
// src/pages/HabitsPage.tsx
import { HabitsOverview } from '../features/habits/components/HabitsOverview';

export function HabitsPage() {
  return <HabitsOverview />;
}
```

### 4.5 State Management Refactoring (`HabitsStateContext.tsx`)

- The following properties **MUST BE REMOVED** from the `HabitsStateContext`
  interface and implementation:
  - `isHabitsOverviewMode`
  - `isProgressOverviewMode`
  - `toggleisHabitsOverviewMode`
  - `toggleisProgressOverviewMode`
- Any component consuming this context must be refactored to no longer depend on
  these properties.

### 4.6 Feature Flag Implementation

- A feature flag, `isUrlRoutingEnabled`, will be implemented. The source of this
  flag can be a configuration file, environment variable, or a service like
  LaunchDarkly.
- The top-level `App.tsx` or `main.tsx` will use this flag to conditionally
  render the legacy navigation structure or the new `RouterProvider`. This is
  the primary mechanism for a safe, incremental rollout and instant rollback.

### 4.7 SEO & Accessibility

- **Page Titles:** A custom hook, `usePageTitle(title: string)`, will be
  created. Each page component (`DashboardPage.tsx`, etc.) will call this hook
  to dynamically update `document.title`.
- **Meta Tags:** For this phase, static meta tags in `index.html` are
  sufficient. A follow-up task can introduce `react-helmet-async` for
  route-specific meta tags if required by the PRD.

## 5.0 Performance Considerations

- **Code Splitting:** All page components in `src/pages/` **must** be
  implemented using `React.lazy()`.
- **Suspense:** The router configuration in `src/routes/index.tsx` must wrap the
  `element` for each lazy-loaded route in a `<Suspense>` boundary with a
  suitable loading fallback UI.

## 6.0 Error Handling

- **404 Not Found:** The router must include a catch-all route (`path="*"`) that
  renders the `NotFoundPage.tsx` component.
- **Route-level Errors:** The `createBrowserRouter` configuration should specify
  an `errorElement` at the root layout level to catch rendering errors, data
  loading errors, etc., and display a user-friendly error boundary component.

## 7.0 Testing Strategy

### 7.1 Unit & Integration Tests (Vitest / React Testing Library)

- **New Tests:**
  - Test each page component to ensure it renders the correct child feature
    component.
  - Create a test for `usePageTitle` to verify it updates `document.title`.
- **Updated Tests:**
  - `Header.tsx`: Tests must be updated to assert that `<NavLink>` components
    are rendered with correct `href` attributes and that active styles are
    applied based on the current route.
  - `Body.tsx`: Tests must be updated to ensure it renders an `<Outlet />`.
- **Routing Tests:**
  - A new test file will be created to test the router configuration using
    `createMemoryRouter`. It will verify that navigating to a specific path
    renders the correct page component and that the 404 route works as expected.

### 7.2 End-to-End Tests (Cypress / Playwright)

- A new E2E test suite (`routing.spec.ts`) must be created to validate the
  following user flows:
  1.  **Direct URL Access:** `cy.visit('/habits')` loads the habits overview.
  2.  **UI Navigation:** Clicking the "Progress" link in the header navigates to
      `/progress` and updates the view.
  3.  **Browser History:** A test that navigates through several pages and then
      uses `cy.go('back')` and `cy.go('forward')` to assert the URL and view are
      correct.
  4.  **Page Refresh:** `cy.reload()` on a non-root page (e.g., `/habits`)
      should reload the application on that same page.

## 8.0 Rollback Plan

- The primary rollback mechanism is the **feature flag**.
- If a critical issue is discovered post-deployment:
  1.  Disable the `isUrlRoutingEnabled` feature flag.
  2.  This will immediately revert all users to the legacy state-based
      navigation system.
  3.  No code revert or redeployment is necessary for immediate mitigation.

## 9.0 Technical Acceptance Criteria

- [ ] All navigation is handled by `react-router-dom`.
- [ ] The URL in the address bar accurately reflects the content being viewed.
- [ ] Browser back/forward buttons function correctly.
- [ ] Direct access to `/habits` and `/progress` URLs loads the correct view.
- [ ] Refreshing the browser on any route reloads the application on that same
      route.
- [ ] The `HabitsStateContext` no longer contains navigation-related state.
- [ ] All navigation links are accessible and have proper active state styling.
- [ ] Page titles are updated dynamically for each route.
- [ ] All existing unit, integration, and E2E tests pass.
- [ ] New tests covering the routing implementation pass.
- [ ] The entire implementation is controlled by a feature flag.
