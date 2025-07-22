# Project Structure & Architecture

## Feature-Based Organization

The project follows a feature-driven architecture where related functionality is
grouped together:

```
src/
├── features/           # Feature modules (habits, progress, layout)
│   ├── habits/        # Habit management feature
│   │   ├── api/       # API calls and data fetching
│   │   ├── components/ # Feature-specific components
│   │   ├── context/   # Feature state management
│   │   ├── hooks/     # Custom hooks for business logic
│   │   └── types/     # TypeScript interfaces
│   ├── progress/      # Progress tracking and visualization
│   └── layout/        # App layout components
├── components/        # Shared/reusable components
│   └── ui/           # shadcn/ui component library
├── context/          # Global app contexts (Theme, Date)
├── hooks/            # Shared custom hooks
├── lib/              # Utility functions and helpers
├── icons/            # Icon definitions and collections
├── assets/           # Static assets (audio, images)
├── pages/            # Route-level page components
│   ├── DashboardPage.tsx
│   ├── HabitsPage.tsx
│   ├── ProgressPage.tsx
│   └── NotFoundPage.tsx
├── layouts/          # Layout components for routing
│   └── RootLayout.tsx # Authentication-aware root layout
├── routes/           # Routing configuration
│   └── index.tsx     # Centralized route definitions
└── services/         # External service integrations
```

## Architecture Patterns

### Component Organization

- **Feature Components**: Located in `features/{feature}/components/`
- **Shared Components**: Located in `components/` for reusable UI elements
- **UI Components**: Located in `components/ui/` following shadcn/ui conventions

### State Management

- **Global State**: React Context for theme, date, and cross-feature state
- **Server State**: SWR for API data fetching and caching
- **Local State**: useState/useReducer for component-specific state

### API Layer

- **Feature APIs**: Each feature has its own `api/index.ts` with related
  endpoints
- **HTTP Client**: Centralized axios instance in `services/api/`
- **Data Fetching**: SWR hooks for server state management

### Type Definitions

- **Feature Types**: Located in `features/{feature}/types/`
- **Shared Types**: Located in `src/types/` for global interfaces

## File Naming Conventions

- **Components**: PascalCase (e.g., `HabitDialog.tsx`)
- **Hooks**: camelCase starting with "use" (e.g., `useHabits.ts`)
- **Types**: PascalCase (e.g., `Habit.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Constants**: camelCase (e.g., `index.ts`)

## Import Patterns

- Use `@/` path alias for all internal imports
- Group imports: external libraries first, then internal modules
- Feature imports should prefer relative paths within the same feature
