import React from 'react';
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { HabitsStateProvider } from '@/features/habits/context/HabitsStateContext';
import { routes } from '@app/routes';

// Mock Clerk is now handled in mocks.tsx

interface RenderWithProvidersOptions {
  initialEntries?: string[];
  initialIndex?: number;
}

export function renderWithRouter({
  initialEntries = ['/'],
  initialIndex = 0,
}: RenderWithProvidersOptions = {}) {
  const memoryRouter = createMemoryRouter(routes, {
    initialEntries,
    initialIndex,
  });

  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <ClerkProvider publishableKey="test-key">
        <HabitsStateProvider>{children}</HabitsStateProvider>
      </ClerkProvider>
    );
  };

  return {
    ...render(<RouterProvider router={memoryRouter} />, {
      wrapper: AllTheProviders,
    }),
    router: memoryRouter,
  };
}

// Feature flag mocking utilities are no longer needed since feature flags have been removed
