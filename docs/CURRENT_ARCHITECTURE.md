# Current Architecture Overview

## Last Updated: August 2025

## Project Structure

The Track'n'Stick application is built as a Progressive Web App (PWA) using
React, TypeScript, and Vite. It features an offline-first architecture for
reliable habit tracking.

### Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand + IndexedDB for offline persistence
- **Database**: IndexedDB (via Dexie.js)
- **Routing**: React Router v6
- **Testing**: Vitest + React Testing Library
- **PWA**: Vite PWA Plugin

## Directory Structure

```
tracknstick.com/
├── src/
│   ├── app/                    # Application shell and routing
│   │   ├── routes/             # Route definitions
│   │   └── shell/              # App shell components
│   ├── components/             # Reusable UI components
│   │   ├── common/             # Generic components
│   │   └── habits/             # Habit-specific components
│   ├── core/                   # Core business logic
│   │   ├── offline/            # Offline functionality
│   │   │   ├── db/            # IndexedDB management
│   │   │   ├── hooks/        # Offline-enabled hooks
│   │   │   ├── services/     # Background services
│   │   │   └── store/        # Offline state management
│   │   └── habits/            # Habit domain logic
│   ├── features/              # Feature modules
│   │   └── [feature-name]/   # Self-contained features
│   ├── hooks/                 # Global React hooks
│   ├── pages/                 # Page components
│   ├── services/              # External service integrations
│   ├── store/                 # Global state management
│   ├── styles/                # Global styles
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
├── docs/                      # Documentation
│   ├── api/                   # API documentation
│   ├── architecture/          # Architecture decisions
│   ├── guides/                # Developer guides
│   └── archive/               # Archived documentation
├── project-specs/             # Project specifications
│   ├── offline-first-data-management/
│   └── codebase-cleanup-simplification/
└── public/                    # Static assets
```

## Core Architecture Components

### 1. Offline-First Data Layer

The application uses IndexedDB as the primary data store, with the following key
components:

- **Database Schema** (`src/core/offline/db/schema.ts`): Defines the IndexedDB
  structure
- **Repository Pattern** (`src/core/offline/db/repositories/`): Data access
  layer
- **Sync Queue** (`src/core/offline/services/sync/`): Manages offline-to-online
  synchronization
- **Conflict Resolution** (`src/core/offline/services/conflict/`): Handles data
  conflicts

### 2. State Management

- **Zustand Stores** (`src/store/`): Application state management
- **Offline Store** (`src/core/offline/store/`): Offline-specific state
- **React Query**: Server state management (when online)

### 3. Service Layer

Background services handle:

- Data synchronization
- Background sync operations
- Data integrity checks
- Performance monitoring
- Connectivity monitoring

### 4. Component Architecture

Components follow a hierarchical structure:

- **Pages**: Route-level components
- **Features**: Complex, self-contained functionality
- **Components**: Reusable UI elements
- **Common**: Generic, highly reusable components

## Data Flow

1. **User Interaction** → Component
2. **Component** → Hook (offline-enabled)
3. **Hook** → Repository/Service
4. **Repository** → IndexedDB
5. **Background Sync** → Server (when online)

## Offline Capabilities

### Implemented Features

- ✅ IndexedDB persistence
- ✅ Offline data creation and modification
- ✅ Sync queue for pending changes
- ✅ Conflict resolution system
- ✅ Data integrity validation
- ✅ Background synchronization
- ✅ Connectivity monitoring

### Migration Status

Currently migrating from online-only hooks to offline-enabled versions:

- `useHabits` → `useHabitsOffline`
- `useAllHabits` → `useAllHabitsOffline`

## Key Design Decisions

### 1. IndexedDB over LocalStorage

- Larger storage capacity
- Better performance for complex data
- Support for indexing and queries

### 2. Repository Pattern

- Abstraction over database operations
- Easier testing and mocking
- Consistent data access API

### 3. Optimistic Updates

- Better user experience
- Immediate feedback
- Background conflict resolution

### 4. Event-Driven Sync

- Automatic synchronization
- Minimal user intervention
- Resilient to network issues

## Performance Considerations

- **Code Splitting**: Lazy loading of offline module
- **Virtual Lists**: For large datasets
- **Debounced Sync**: Prevents excessive sync operations
- **Indexed Queries**: Fast data retrieval from IndexedDB

## Security Measures

- **Data Validation**: All inputs validated before storage
- **Sanitization**: User inputs sanitized
- **HTTPS Only**: Service workers require secure context
- **CSP Headers**: Content Security Policy implementation

## Testing Strategy

- **Unit Tests**: Component and utility testing
- **Integration Tests**: Database and service testing
- **E2E Tests**: Critical user journeys
- **Performance Tests**: Load and stress testing

## Deployment

- **Environment**: Production deployment to Vercel/Netlify
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Monitoring**: Error tracking with Sentry (planned)
- **Analytics**: Usage tracking (planned)

## Future Enhancements

1. **Push Notifications**: For habit reminders
2. **Data Export/Import**: User data portability
3. **Multi-device Sync**: Cross-device synchronization
4. **Collaborative Features**: Shared habits and accountability
5. **AI Insights**: Habit recommendations and insights

## Known Issues

- TypeScript strict mode not yet enabled
- Some components still using online-only hooks
- Test coverage below target (currently ~60%, target 80%)
- Bundle size optimization needed

## References

- [Offline-First Specification](../project-specs/offline-first-data-management/)
- [Codebase Cleanup Plan](../project-specs/codebase-cleanup-simplification/)
- [API Documentation](./api/)
- [Developer Guide](./guides/getting-started.md)
