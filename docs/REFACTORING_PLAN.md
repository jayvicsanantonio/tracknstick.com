# Refactoring Status: tracknstick.com

**Version:** 2.0 **Date:** 2025-07-16 **Status:** ✅ Major refactoring completed

## 1. Overview

This document tracks the refactoring progress for the `tracknstick.com`
Progressive Web Application. The primary goals of the refactoring effort were
to:

1. ✅ **Significantly improve long-term maintainability**
2. ✅ **Increase the ease and speed of adding new features**
3. ✅ **Optimize application performance** (bundle size, runtime speed, load
   times)
4. ✅ **Implement Progressive Web App capabilities**

## 2. Completed Refactoring

## 2. Current State Summary

The application utilizes a modern tech stack:

- **Framework/Library:** React 19, Vite 6
- **Language:** TypeScript 5.5 (`strict: true` enabled)
- **Styling:** TailwindCSS 3.4, Radix UI primitives, `class-variance-authority`,
  `tailwind-merge`
- **State Management:** React Context (`ThemeProvider`, `DateProvider`),
  `useState`/`useReducer`, SWR for server state, Clerk for auth state.
- **Data Fetching:** `axios`, `swr`
- **Linting/Formatting:** ESLint 9 (Flat config, type-aware), likely Prettier
  (implied)
- **UI Components:** Custom components built upon Radix UI, organized into
  `common` and `ui` directories.

## 3. Refactoring Recommendations by Area

### 3.1. Code Organization & Project Structure

- **Assessment:** The current structure is component-type-centric
  (`src/{components,hooks,context,lib,types}`). While functional, it can hinder
  scalability and feature isolation.
- **Recommendation 1: Adopt Feature-Based Structure (High Priority)**
  - **Strategy:** Reorganize the `src` directory by application feature instead
    of type. Create top-level directories for major features (e.g., `habits`,
    `auth`, `settings`, `profile`). Each feature directory will contain its own
    components, hooks, types, API logic, tests, etc.
  - **Example Layout:**
    ```
    src/
    ├── assets/
    ├── components/
    │   └── ui/         # Shared, generic UI components (Button, Dialog, etc.)
    ├── constants/      # Shared constants
    ├── context/        # Truly global context (Theme, Auth?)
    ├── features/
    │   ├── habits/
    │   │   ├── api/      # Habit-specific API calls (e.g., getHabits.ts)
    │   │   ├── components/ # Habit-specific components (HabitList, HabitItem, HabitForm)
    │   │   ├── hooks/    # Habit-specific hooks (useHabits.ts)
    │   │   ├── types/    # Habit-specific types (index.ts)
    │   │   └── index.ts  # Barrel file for the feature
    │   └── settings/
    │       └── ... (similar structure)
    ├── hooks/          # Shared, common hooks (useToggle, useToast)
    ├── lib/            # Shared, generic utility functions (utils.ts, formatDate.ts)
    ├── services/       # Shared services (e.g., api client setup)
    ├── types/          # Shared, global types (index.ts)
    ├── App.tsx         # Root component (mainly routing and layout)
    ├── main.tsx        # App entry point
    └── index.css       # Global styles
    ```
  - **Justification:** Improves code locality, reduces merge conflicts, makes
    navigation easier, enhances modularity and scalability.
- **Recommendation 2: Clearly Define Shared Modules (Medium Priority)**
  - **Strategy:** Maintain distinct directories for genuinely shared code:
    - `src/components/ui`: Generic, unstyled/lightly styled primitives.
    - `src/lib`: Framework-agnostic utility functions.
    - `src/hooks`: Common, reusable hooks not tied to a specific feature.
    - `src/types`: Global or widely shared type definitions.
    - `src/services`: Shared service configurations (e.g., base Axios instance).
  - **Justification:** Prevents features from becoming tightly coupled through
    shared abstractions.
- **Recommendation 3: Establish Clear Module Boundaries (High Priority)**
  - **Strategy:** Enforce separation between UI, state management, and API
    interactions, primarily through the feature-based structure, dedicated
    API/service layers, and custom hooks. Avoid components directly calling
    `axios` or managing complex cross-feature state.
  - **Justification:** Improves testability, maintainability, and allows
    different parts of the application to evolve independently.

### 3.2. Component Design & React Best Practices

- **Assessment:** `App.tsx` currently centralizes too much state (dialogs, edit
  modes) and data fetching logic. Significant prop drilling observed (`App` ->
  `Body` -> `DailyHabitList` -> `DailyHabitItem`).
- **Recommendation 1: Simplify Root Component (`App.tsx`) (High Priority)**
  - **Strategy:** Move feature-specific state and data fetching out of
    `App.tsx`. `App.tsx` should primarily handle global layout, routing (if
    applicable), and global context providers.
  - **Justification:** Reduces complexity, improves separation of concerns.
- **Recommendation 2: Mitigate Prop Drilling (High Priority)**

  - **Strategy:**
    - **Custom Hooks:** Encapsulate related state and logic (see 3.7).
    - **Context API:** Use feature-specific Context providers closer to the
      components that need the state (e.g., a `HabitsProvider` within the
      `habits` feature).
    - **Composition:** Pass components as props where appropriate, potentially
      simplifying data flow.
  - **Example (Context):**

    ```typescript
    // src/features/habits/context/HabitsContext.tsx
    import { createContext, useState, useContext } from 'react';
    // ... other imports

    interface HabitsContextValue {
      isEditMode: boolean;
      toggleIsEditMode: () => void;
      // ... other habit-related state/functions
    }

    const HabitsContext = createContext<HabitsContextValue | null>(
      null
    );

    export const HabitsProvider = ({ children }) => {
      const [isEditMode, toggleIsEditMode] = useToggle(false);
      // ... other state

      return (
        <HabitsContext.Provider
          value={{ isEditMode, toggleIsEditMode /* ... */ }}
        >
          {children}
        </HabitsContext.Provider>
      );
    };

    export const useHabitsContext = () => {
      const context = useContext(HabitsContext);
      if (!context) {
        throw new Error(
          'useHabitsContext must be used within a HabitsProvider'
        );
      }
      return context;
    };

    // Usage in a component within the feature:
    // const { isEditMode, toggleIsEditMode } = useHabitsContext();
    ```

  - **Justification:** Improves component decoupling and maintainability.

- **Recommendation 3: Leverage Custom Hooks for Logic (High Priority)**
  - **Strategy:** Extract data fetching, mutations, and related UI logic into
    custom hooks (e.g., `useHabits`).
  - **Example:** See section 3.7.
  - **Justification:** Promotes reusability, testability, and separation of
    concerns.
- **Recommendation 4: Apply Rendering Optimizations (Medium Priority)**

  - **Strategy:** Use `React.memo`, `useCallback`, and `useMemo` judiciously
    where performance bottlenecks are identified or likely (e.g., list items,
    expensive computations).
  - **Example (`DailyHabitItem`):**

    ```typescript
    // In parent component (e.g., useHabits hook or HabitsProvider)
    const toggleHabitCallback = useCallback(
      async (id: string) => {
        // ... mutation logic using SWR mutate or API call
      },
      [
        /* dependencies */
      ]
    );

    // src/features/habits/components/DailyHabitItem.tsx
    import React, { memo } from 'react';
    // ... other imports

    interface DailyHabitItemProps {
      habit: Habit;
      // ... other props
      toggleHabit: (id: string) => Promise<void>; // Prop type remains the same
    }

    const DailyHabitItem = memo(
      ({
        habit,
        toggleHabit /* ... other props */,
      }: DailyHabitItemProps) => {
        // ... component logic
        return (
          // ... JSX using toggleHabit directly
          <button
            onClick={() => toggleHabit(habit.id).catch(/* ... */)}
          >
            {/* ... */}
          </button>
          // ...
        );
      }
    );

    export default DailyHabitItem;
    ```

  - **Justification:** Prevents unnecessary re-renders, improving UI
    responsiveness, especially in lists. Profile before and after applying.

- **Recommendation 5: Improve Loading State Handling (Medium Priority)**
  - **Assessment:** The top-level `isLoading` check in `App.tsx` causes the
    entire page content to be replaced by a "Loading..." message when the date
    changes and `useSWR` refetches data.
  - **Strategy:**
    - Remove the top-level `if (isLoading)` check from `App.tsx`.
    - Pass the `isLoading` state down through props (`App` -> `Body` ->
      `DailyHabitTracker`).
    - Handle the loading state within the component directly responsible for
      displaying the data (`DailyHabitTracker`). Conditionally render a
      localized loading indicator (e.g., skeleton screen, spinner) within that
      component's content area instead of rendering the actual list/content.
  - **Justification:** Prevents the jarring full-page flash during data
    refetches triggered by date changes, improving the user experience by
    showing loading state only where the data is changing.
- **Recommendation 6: Refine Specific `common/` Components (Ongoing with
  Phases)**
  - **Assessment Summary (`src/components/common/`):**
    - **Prop Drilling:** Widespread issue affecting `Header`, `Body`,
      `DailyHabitTracker`, `DailyHabitList`, `DailyHabitItem`, `NoHabits`,
      `AddHabitDialog`, `EditHabitDialog`, `HabitDialogHeader`,
      `EditHabitDialogHeaderTitle`, `HabitStats`. State and functions originate
      from `App.tsx` and are passed down multiple levels.
    - **Logic Placement:** Core API interaction and mutation logic is located
      within UI components (`DailyHabitTracker`, `AddHabitDialog`,
      `EditHabitDialog`). Date formatting logic is within `DailyHabitDate`.
    - **Styling:** Repetitive conditional dark mode classes
      (`isDarkMode ? '...' : '...'`) are common across most components. Complex
      conditional styling exists in `DailyHabitItem`. Clerk component styling is
      customized inline in `Welcome`.
    - **Accessibility:** `DailyHabitProgressIndicator` lacks ARIA attributes.
      `VisuallyHidden` uses inline styles instead of the `sr-only` class.
    - **Component Structure:** `HabitDialogHeader` and its title components
      (`Add/Edit...Title`) are potential candidates for consolidation into their
      parent dialogs.
  - **Strategy & Justification (Referencing Plan Sections):**
    - **Address Prop Drilling & Logic Placement (Phase 1 & 2):** Implement
      feature-based state management (`useHabits` hook/context) and the API
      service layer (Plan 3.7.1, 3.7.2). Refactor components to consume the
      hook/context directly, removing passthrough props and internal API logic
      (Plan 3.2.2, 3.3.1). This is the highest priority for improving
      maintainability and testability.
    - **Refactor Styling (Phase 3):** Define semantic theme colors (Plan 3.5.1)
      and update all components to use them. Leverage CVA in base UI components
      (`src/components/ui/`) or specific common components (`DailyHabitItem`) to
      handle variants like dark mode or completion state more cleanly (Plan
      3.5.2). Standardize Clerk component styling in `Welcome`.
    - **Improve Accessibility (Phase 3 or Ongoing):** Add ARIA attributes to
      `DailyHabitProgressIndicator`. Update `VisuallyHidden` to use the
      `sr-only` class.
    - **Refine Component Structure (Low Priority):** Consider consolidating
      `HabitDialogHeader` and its children into `Add/EditHabitDialog` if it
      simplifies the structure.
    - **Extract Utilities (Low Priority):** Move date formatting logic from
      `DailyHabitDate` to `src/lib/formatDate.ts` (Plan 3.7 - Minor).

### 3.3. State Management

- **Assessment:** Good use of SWR for server state. Context for global concerns.
  `useState`/`useToggle` used heavily in `App.tsx` for UI state, leading to
  centralization and prop drilling.
- **Recommendation 1: Colocate UI State (High Priority)**
  - **Strategy:** Move UI state (like dialog visibility, edit modes) closer to
    the components or features that use it. Use local `useState`, feature
    context, or custom hooks. Avoid managing transient UI state for specific
    features in the root `App.tsx`.
  - **Example:** The state for `AddHabitDialog` (`showAddHabitDialog`,
    `toggleShowAddHabitDialog`) could be managed within the `Header` component
    or a parent component within the `habits` feature.
  - **Justification:** Reduces complexity of `App.tsx`, improves modularity.
- **Recommendation 2: Utilize SWR Mutations (Medium Priority)**

  - **Strategy:** Leverage SWR's `mutate` function for optimistic UI updates and
    cache invalidation after API calls (add, update, delete, toggle habits).
    This can simplify manual state management after mutations.
  - **Example (Conceptual `toggleHabit` within `useHabits` hook):**

    ```typescript
    import useSWR, { useSWRConfig } from 'swr';
    import { toggleHabit as apiToggleHabit } from '@/features/habits/api'; // Assumes API function exists

    function useHabits(date, timeZone) {
      const habitsEndpointKey = /* ... */;
      const { data: habits, isLoading } = useSWR<Habit[]>(habitsEndpointKey, fetcher);
      const { mutate } = useSWRConfig();

      const toggleHabit = async (id: string) => {
        // Optimistic update (optional but improves UX)
        mutate(habitsEndpointKey, (currentData: Habit[] | undefined = []) =>
          currentData.map(h => h.id === id ? { ...h, completed: !h.completed } : h),
          false // Don't revalidate immediately
        );

        try {
          // Call the actual API
          await apiToggleHabit(id, /* token? */);
          // Revalidate the data from the server to ensure consistency
          mutate(habitsEndpointKey);
        } catch (error) {
          // Revert optimistic update on error
          mutate(habitsEndpointKey, (currentData: Habit[] | undefined = []) =>
            currentData.map(h => h.id === id ? { ...h, completed: !h.completed } : h),
            false
          );
          console.error("Failed to toggle habit:", error);
          // Show toast notification
        }
      };

      return { habits, isLoading, toggleHabit };
    }
    ```

  - **Justification:** Simplifies state synchronization with the server, enables
    optimistic updates for better UX.

- **Recommendation 3: Consider Lightweight Client State Library (Low Priority)**
  - **Strategy:** If managing shared client state with Context and hooks becomes
    overly complex or leads to performance issues due to context re-renders,
    evaluate libraries like Zustand or Jotai.
  - **Justification:** Offers more optimized solutions for complex global client
    state, but adds another dependency. Assess need based on complexity growth.
- **Recommendation 4: Refine `ThemeProvider` (Medium Priority)**
  - **Assessment:** Manages `isDarkMode` state but lacks persistence, system
    preference integration, and doesn't apply the theme class to the document.
  - **Strategy:**
    - **Persistence:** Use `localStorage` to store and retrieve the user's theme
      preference. Initialize state from `localStorage`.
    - **System Preference:** Optionally, check
      `window.matchMedia('(prefers-color-scheme: dark)')` for initial state
      fallback.
    - **Apply Class:** Use a `useEffect` hook within `ThemeProvider` to
      add/remove the `dark` class on `document.documentElement` based on
      `isDarkMode` state.
  - **Justification:** Improves user experience by remembering theme choice and
    correctly integrating with Tailwind's `darkMode: "class"` strategy.
- **Recommendation 5: Refine `DateProvider` (Medium Priority)**
  - **Assessment:** Manages date state and navigation. Uses
    `useMemo`/`useCallback` internally but creates a new context `value` object
    on every render and exposes raw `setDate`.
  - **Strategy:**
    - **Memoize Context Value:** Wrap the `value` object passed to
      `DateContext.Provider` in `useMemo` to stabilize its reference.
    - **Encapsulate Updates:** Consider removing direct `setDate` exposure from
      the context value. If arbitrary date setting is needed, provide a specific
      `goToDate(newDate)` function instead.
  - **Justification:** Prevents unnecessary re-renders of context consumers and
    improves state encapsulation.

### 3.4. TypeScript Implementation

- **Assessment:** Strong foundation with `strict: true`. Use of inline object
  types for props observed.
- **Recommendation 1: Consistent `interface` vs `type` Usage (Low Priority)**
  - **Strategy:** Establish and follow a convention. Suggestion: Use `interface`
    for defining object shapes (component props, API responses) and `type` for
    unions, intersections, mapped types, or aliasing primitives.
  - **Justification:** Improves code consistency and readability.
- **Recommendation 2: Use Named Prop Types (Medium Priority)**

  - **Strategy:** Define explicit, named interfaces or types for component props
    instead of using inline object types.
  - **Example:**

    ```typescript
    // src/features/habits/components/DailyHabitItem.tsx
    import { Habit } from '@/features/habits/types'; // Assuming type moved

    interface DailyHabitItemProps {
      habit: Habit;
      isEditMode: boolean;
      animatingHabitId: string | null;
      toggleHabit: (id: string) => Promise<void>;
      toggleIsEditingHabit: () => void;
      setEditingHabit: (habit: Habit | null) => void;
    }

    export default function DailyHabitItem({}: /* ...props */ DailyHabitItemProps) {
      // ...
    }
    ```

  - **Justification:** Improves readability, reusability, and maintainability of
    prop definitions.
  - **Note (`HabitForm.tsx`):** The form uses an inline object type for its
    props; refactor this to a named `HabitFormProps` interface.

- **Recommendation 3: Review Type Assertions (Low Priority)**

  - **Strategy:** Review usage of type assertions (`as ...`), such as those
    found in `HabitForm.tsx`'s event handlers and state setters. Explore if
    stricter typing from libraries or helper functions can minimize their
    necessity.
  - **Justification:** Reduces potential runtime errors hidden by assertions and
    improves type safety.

- **Recommendation 4: Explore Advanced Types (Low Priority)**
  - **Strategy:** As the codebase evolves, look for opportunities to use
    TypeScript Utility Types (e.g., `Pick`, `Omit`, `Partial`) and Generics to
    create more robust and reusable types, especially within utility functions
    (`lib/`) or complex hooks.
  - **Justification:** Can reduce type duplication and improve type safety in
    complex scenarios.

### 3.5. TailwindCSS Usage & Maintainability

- **Assessment:** Configuration is basic. Uses CSS variables for border-radius.
  Relies on default Tailwind color palette. Class strings in `DailyHabitItem`
  have some conditional complexity.
- **Recommendation 1: Define Theme Colors (High Priority)**
  - **Strategy:** Define the application's core color palette (primary,
    secondary, accent, neutrals, state colors) in `tailwind.config.js` under
    `theme.extend.colors`. Use semantic names.
  - **Example (`tailwind.config.js`):**
    ```javascript
    /** @type {import('tailwindcss').Config} */
    export default {
      // ... other config
      theme: {
        extend: {
          colors: {
            border: 'hsl(var(--border))', // Example using CSS vars
            input: 'hsl(var(--input))',
            ring: 'hsl(var(--ring))',
            background: 'hsl(var(--background))',
            foreground: 'hsl(var(--foreground))',
            primary: {
              DEFAULT: 'hsl(var(--primary))',
              foreground: 'hsl(var(--primary-foreground))',
              // Add shades if needed: e.g., 100, 200, ..., 900
            },
            secondary: {
              DEFAULT: 'hsl(var(--secondary))',
              foreground: 'hsl(var(--secondary-foreground))',
            },
            // ... other colors: destructive, muted, accent, etc.
          },
          borderRadius: {
            lg: 'var(--radius)',
            md: 'calc(var(--radius) - 2px)',
            sm: 'calc(var(--radius) - 4px)',
          },
          // ... other extensions
        },
      },
      plugins: [require('tailwindcss-animate')],
    };
    // Ensure corresponding CSS variables are defined in index.css
    ```
  - **Justification:** Centralizes design tokens, enforces consistency, makes
    theming easier, improves maintainability. Reference these semantic colors
    (e.g., `bg-primary`, `text-foreground`) in components.
- **Recommendation 2: Improve Class String Readability (Medium Priority)**
  - **Strategy:**
    - Use `clsx` (already installed) for conditional classes.
    - Prefer component composition to break down elements with many conditional
      styles.
    - Use CSS variables defined in `index.css` or the theme for dynamic styles
      where appropriate (e.g., completed state background).
    - Use `@apply` _sparingly_ only for highly reused style combinations not
      achievable via composition, preferably in `index.css` or dedicated CSS
      modules.
  - **Justification:** Makes Tailwind classes easier to read, manage, and
    update.
- **Recommendation 3: Ensure Consistent Token Usage (Medium Priority)**
  - **Strategy:** Consistently use the defined theme tokens (colors, spacing,
    border-radius, fonts) throughout the application. Avoid hardcoding pixel
    values or arbitrary color shades where theme tokens exist.
  - **Justification:** Maintains visual consistency and simplifies design
    updates.
  - **Note (`HabitForm.tsx`):** The form contains repetitive conditional dark
    mode classes (e.g., `isDarkMode ? '...' : '...'`). Refactoring theme colors
    (Rec. 3.5.1) and potentially using CVA in base UI components will simplify
    styling here.

### 3.6. Performance Optimization

- **Assessment:** Basic Vite setup. No explicit performance optimizations
  observed yet (memoization, code splitting).
- **Recommendation 1: Implement Code Splitting (Medium Priority)**

  - **Strategy:** Use `React.lazy` and dynamic `import()` for large features,
    routes, or components that are not needed immediately (e.g., complex modals,
    separate sections of the app).
  - **Example:**

    ```typescript
    import React, { Suspense, lazy } from 'react';

    const ProgressOverview = lazy(
      () => import('@/components/common/ProgressOverview')
    ); // Adjust path

    function App() {
      // ... state for showing overview
      return (
        <div>
          {/* ... other components */}
          {isHabitsOverviewMode && (
            <Suspense fallback={<div>Loading Overview...</div>}>
              <ProgressOverview /* props */ />
            </Suspense>
          )}
        </div>
      );
    }
    ```

  - **Justification:** Reduces initial bundle size, improving load times.

- **Recommendation 2: Analyze Bundle Size (Low Priority - As Needed)**
  - **Strategy:** Use tools like `vite-plugin-visualizer` or
    `rollup-plugin-visualizer` (configured in `vite.config.ts`) to inspect the
    production bundle and identify large dependencies or code chunks.
  - **Justification:** Helps pinpoint specific areas for optimization if bundle
    size becomes a concern.
- **Recommendation 3: Apply Memoization (Medium Priority)**
  - **Strategy:** Implement `React.memo`, `useCallback`, `useMemo` as discussed
    in section 3.2.
  - **Justification:** Improves runtime performance by reducing unnecessary
    re-renders.
- **Recommendation 4: Optimize Assets (Low Priority)**
  - **Strategy:** Ensure images are appropriately sized and consider modern
    formats like WebP. Use Vite plugins for image optimization if needed.
  - **Justification:** Reduces bandwidth usage and improves load times.
- **Recommendation 5: Review Vite Configuration (Low Priority)**
  - **Strategy:** Periodically review `vite.config.ts` for potential build
    optimizations or useful plugins as the application grows or performance
    requirements change.
  - **Justification:** Vite offers various configuration options that can impact
    build size and speed.

### 3.7. Separation of Concerns

- **Assessment:** API logic (`fetcher`) is currently defined within `App.tsx`.
  UI state logic is also centralized there.
- **Recommendation 1: Create Dedicated API Service Layer (High Priority)**

  - **Strategy:** Move all `axios` calls and API interaction logic into
    dedicated functions within a `src/services/api/` or feature-specific `api/`
    directory.
  - **Example (`src/features/habits/api/index.ts`):**

    ```typescript
    import axiosInstance from '@/services/api/axiosInstance'; // Assuming a configured instance
    import { Habit } from '@/features/habits/types';

    export const fetchHabits = async (
      date: Date,
      timeZone: string,
    ): Promise<Habit[]> => {
      // No need for getToken here if axiosInstance handles auth via interceptors
      const response = await axiosInstance.get<Habit[]>(`/api/v1/habits`, {
        params: { date: date.toISOString(), timeZone },
      });
      return response.data;
    };

    export const toggleHabit = async (id: string): Promise<void> => {
      await axiosInstance.patch(`/api/v1/habits/${id}/toggle`);
      // Consider returning updated habit if needed
    };

    // Add functions for addHabit, updateHabit, deleteHabit etc.
    ```

  - **Justification:** Decouples components from data fetching implementation,
    improves testability, makes API calls reusable. Configure `axiosInstance`
    with base URL and potentially interceptors for auth tokens.

- **Recommendation 2: Encapsulate Business Logic in Hooks (High Priority)**

  - **Strategy:** Create custom hooks (like `useHabits`) that encapsulate
    feature-specific logic, including data fetching (using the API service),
    state management (using `useState`, `useReducer`, or SWR), and mutation
    handling.
  - **Example (`src/features/habits/hooks/useHabits.ts`):**

    ```typescript
    import useSWR from 'swr';
    import {
      fetchHabits,
      toggleHabit as apiToggleHabit,
    } from '@/features/habits/api';
    import { Habit } from '@/features/habits/types';
    import { useCallback } from 'react';
    import { useSWRConfig } from 'swr';
    import { useToast } from '@/hooks/use-toast'; // Assuming shared hook

    export function useHabits(date: Date, timeZone: string) {
      const { toast } = useToast();
      const habitsEndpointKey = `/api/v1/habits?date=${date.toISOString()}&timeZone=${timeZone}`; // Key for SWR

      // SWR fetcher now uses the API service function
      const {
        data: habits = [],
        error,
        isLoading,
      } = useSWR<Habit[]>(
        habitsEndpointKey,
        () => fetchHabits(date, timeZone), // Pass the API call function
      );

      const { mutate } = useSWRConfig();

      const toggleHabit = useCallback(
        async (id: string) => {
          // Optimistic update
          mutate(
            habitsEndpointKey,
            (currentData: Habit[] | undefined = []) =>
              currentData.map((h) =>
                h.id === id ? { ...h, completed: !h.completed } : h,
              ),
            false,
          );
          try {
            await apiToggleHabit(id);
            // Revalidate after successful API call
            mutate(habitsEndpointKey);
          } catch (err) {
            // Revert optimistic update
            mutate(
              habitsEndpointKey,
              (currentData: Habit[] | undefined = []) =>
                currentData.map((h) =>
                  h.id === id ? { ...h, completed: !h.completed } : h,
                ),
              false,
            );
            console.error('Failed to toggle habit:', err);
            toast({
              variant: 'destructive',
              description: 'Failed to update habit.',
            });
          }
        },
        [habitsEndpointKey, mutate, toast],
      );

      // Add similar functions for add, update, delete

      return {
        habits,
        isLoading,
        error,
        toggleHabit,
        // addHabit, updateHabit, deleteHabit ...
      };
    }
    ```

  - **Justification:** Creates reusable, testable units of logic, cleans up
    components significantly.

### 3.8. Code Quality & Consistency

- **Assessment:** Strong ESLint setup with type-aware rules. Prettier likely
  used.
- **Recommendation 1: Integrate Linting/Formatting into Workflow (Medium
  Priority)**
  - **Strategy:** Use `husky` and `lint-staged` to automatically run ESLint and
    Prettier on staged files before commits.
  - **Example (`package.json` additions):**
    ```json
    {
      "scripts": {
        // ... other scripts
        "prepare": "husky install",
        "lint-staged": "lint-staged"
      },
      "lint-staged": {
        "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
        "*.{json,md,css}": ["prettier --write"]
      },
      "devDependencies": {
        // ... other devDependencies
        "husky": "^8.0.0", // Or latest
        "lint-staged": "^13.0.0" // Or latest
      }
    }
    ```
    _Run `npm run prepare` once after installing._
  - **Justification:** Enforces code style and quality automatically, preventing
    inconsistent code from entering the repository.
- **Recommendation 2: Refactor Duplication (As Identified)**
  - **Strategy:** Identify and refactor duplicated code blocks into reusable
    functions, components, or hooks (e.g., the `fetcher` logic is addressed by
    the API layer).
  - **Justification:** Improves maintainability by adhering to the DRY (Don't
    Repeat Yourself) principle.

### 3.9. Error Handling

- **Assessment:** Basic `try...catch` and toast notifications for fetch errors
  in `App.tsx`.
- **Recommendation 1: Consistent API Error Handling (Medium Priority)**
  - **Strategy:** Implement consistent error handling within the API service
    layer or custom hooks that use it. This should include:
    - Logging errors appropriately (e.g., to console or an error tracking
      service).
    - Providing user feedback (e.g., using `useToast`).
    - Potentially defining custom error types or checking error statuses/codes
      for more specific handling.
    - Handling errors for mutations (add, update, delete) as well as fetches.
  - **Justification:** Ensures errors are handled robustly and consistently
    across the application.
  - **Note (`HabitForm.tsx`):** The form delegates submission/deletion logic via
    the `handleSubmit` prop. Ensure the parent component implementing this prop
    provides clear user feedback (e.g., toasts) on API success or failure.
    Consider if specific error handling for deletion within the form itself is
    needed.

### 3.10. Testing Strategy

- **Assessment:** Current structure (centralized logic, prop drilling) makes
  unit/integration testing more difficult.
- **Recommendation 1: Improve Testability via Refactoring (High Priority)**
  - **Strategy:** The refactoring steps outlined above (feature structure, API
    layer, custom hooks) will inherently improve testability.
  - **Justification:** Decoupled modules (hooks, services, UI components) are
    much easier to test in isolation.
- **Recommendation 2: Prioritize Testing Logic (Medium Priority)**
  - **Strategy:** Focus testing efforts on:
    - **Unit Tests:** For utility functions (`lib/`), API service functions
      (`services/api/`), and custom hooks (`hooks/`, `features/*/hooks/`). Mock
      dependencies (like `axios`) where necessary.
    - **Integration Tests (React Testing Library):** For components, focusing on
      user interactions and rendered output. Mock hooks and API calls at the
      boundaries.
  - **Justification:** Ensures core logic is reliable and components behave as
    expected from a user perspective.

## 4. Prioritization & Phased Approach

It's recommended to tackle these changes in phases:

1.  **Phase 1: Foundational Structure & Logic Separation**
    - Implement Feature-Based Structure (3.1).
    - Create API Service Layer (3.7).
    - Create initial Custom Hooks for core features (e.g., `useHabits`) (3.7,
      3.2).
    - Refactor `App.tsx` to delegate logic to hooks (3.2).
    - Setup Pre-commit Hooks (3.8).
2.  **Phase 2: State Management & Prop Drilling**
    - Address prop drilling using Context or refined hooks (3.2, 3.3).
    - Colocate UI state (3.3).
    - Implement SWR mutations for cache updates (3.3).
3.  **Phase 3: Component & Styling Refinements**
    - Define Theme Colors in Tailwind config (3.5).
    - Refactor component class strings for readability (3.5).
    - Apply rendering optimizations (`React.memo`, etc.) where needed (3.2,
      3.6).
    - Improve TypeScript prop types (3.4).
4.  **Phase 4: Performance & Advanced Topics**
    - Implement Code Splitting (3.6).
    - Analyze bundle size (3.6).
    - Enhance Error Handling consistency (3.9).
    - Expand Test Coverage (3.10).

## 5. Conclusion

This refactoring plan provides a roadmap for significantly improving the
maintainability, scalability, and performance of the `tracknstick.com`
application. By implementing these changes, particularly focusing on structure,
separation of concerns, and state management, the codebase will be easier to
work with, faster to extend, and more robust.

**Next Steps:** Review this plan, discuss any adjustments, and then proceed with
implementation, likely starting with Phase 1.
