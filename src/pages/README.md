# Pages Directory

This directory contains all page components and routing configuration for the
application.

## Structure

```
pages/
├── __tests__/           # Page-level tests
│   └── routing.integration.test.tsx
├── DashboardPage.tsx    # Main dashboard/home page
├── HabitsPage.tsx       # Habits management page
├── ProgressPage.tsx     # Progress tracking page
├── NotFoundPage.tsx     # 404 error page
├── routes.tsx           # Router configuration
├── index.ts             # Barrel exports
└── README.md            # This file
```

## Page Components

Each page component represents a distinct route in the application:

- **DashboardPage**: The main landing page showing an overview of habits and
  progress
- **HabitsPage**: Displays and manages user habits
- **ProgressPage**: Shows detailed progress tracking and statistics
- **NotFoundPage**: 404 error page for invalid routes

## Routing

The `routes.tsx` file contains the React Router configuration, defining:

- Route paths and their corresponding components
- Layout structure with `RootLayout`
- Error boundaries for each route
- Suspense boundaries for lazy loading

## Usage

### Importing Pages

```typescript
// Import individual pages
import { DashboardPage, HabitsPage } from '@/pages';

// Import router configuration
import { router, routes } from '@/pages';
```

### Adding a New Page

1. Create a new page component file (e.g., `SettingsPage.tsx`)
2. Export it from `index.ts`
3. Add the route to `routes.tsx`
4. Create tests in `__tests__/`

## Testing

Page-level integration tests are located in `__tests__/`. These tests verify:

- Page routing and navigation
- Component rendering
- User interactions
- Error states

## Best Practices

1. **Keep pages lightweight**: Pages should primarily compose other components
2. **Use proper loading states**: Implement Suspense boundaries for async
   content
3. **Handle errors gracefully**: Each page should have error boundaries
4. **Maintain consistent structure**: Follow the existing page component
   patterns
5. **Test thoroughly**: Include integration tests for critical user flows
