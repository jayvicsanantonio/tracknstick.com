# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Development Commands

### Essential Commands

- `pnpm dev` - Start development server with hot reload (Vite)
- `pnpm build` - Production build (TypeScript check + Vite build)
- `pnpm test` - Run tests in watch mode (Vitest)
- `pnpm test:run` - Run tests once with coverage
- `pnpm lint` - Check code with ESLint
- `pnpm lint:fix` - Auto-fix ESLint issues
- `pnpm format` - Format code with Prettier

### Testing

- `pnpm test:ui` - Run tests with Vitest UI
- `pnpm test:coverage` - Generate test coverage reports
- Test setup file: `src/testing/setup.ts`
- Tests use jsdom environment with React Testing Library

### Quality Checks

Always run these before committing:

1. `pnpm lint:fix` - Fix linting issues
2. `pnpm test:run` - Ensure all tests pass
3. `pnpm build` - Verify production build works

## Architecture

### Project Structure

- **Feature-driven architecture** with clear separation of concerns
- **Modern React 19** with TypeScript strict mode
- **Progressive Web App** with offline capabilities via Vite PWA plugin

### Key Directories

```
src/
├── app/                    # Application core (providers, routing)
├── features/               # Feature modules (habits, progress, layout)
│   ├── habits/            # Habit CRUD, tracking, state management
│   ├── progress/          # Analytics, charts, achievements, calendar
│   └── layout/            # App layout components
├── shared/                # Reusable utilities and components
│   ├── components/ui/     # Design system (Radix UI + shadcn/ui)
│   ├── services/          # API client with Clerk auth
│   ├── hooks/             # Custom React hooks
│   └── utils/             # Utility functions
├── pages/                 # Route-level components
└── testing/               # Test utilities and setup
```

### Path Aliases

- `@/` → `src/`
- `@app/` → `src/app/`
- `@features/` → `src/features/`
- `@shared/` → `src/shared/`
- `@testing/` → `src/testing/`

### Technology Stack

- **Framework**: React 19 with TypeScript 5.8+
- **Build**: Vite 6.3+ with fast HMR
- **Styling**: Tailwind CSS v4 with Radix UI primitives
- **State**: React Context + SWR for server state
- **Authentication**: Clerk with JWT tokens
- **Testing**: Vitest + React Testing Library
- **PWA**: Service worker with Workbox caching strategies

### Authentication

- Uses Clerk for auth with automatic token attachment
- Axios interceptor adds Bearer tokens to API requests
- API base URL configured via `VITE_API_HOST` environment variable

### Key Features

- **Habit Management**: CRUD operations with frequency patterns
- **Progress Tracking**: Calendar view, streaks, completion analytics
- **Achievement System**: Gamified progress with unlockable achievements
- **PWA Support**: Installable, offline-capable, background sync
- **Real-time Updates**: Optimistic UI with SWR data fetching

### API Integration

- REST API with endpoints for habits, progress, achievements
- Axios instance with Clerk auth integration
- SWR for efficient data fetching and caching
- Optimistic updates for better UX

### Code Conventions

- Feature modules export through index.ts files
- Components use default exports, utilities use named exports
- Strict TypeScript with comprehensive type coverage
- ESLint + Prettier for code quality and formatting
- Conventional commits with Husky pre-commit hooks
