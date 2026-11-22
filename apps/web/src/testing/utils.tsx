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

/**
 * Whether the element, or anything around it, is drawn faded or shifted: the
 * first frame of an entrance animation. A screen that shows at once has
 * neither.
 */
export function isEnteringOnScreen(element: HTMLElement): boolean {
  for (
    let node: HTMLElement | null = element;
    node;
    node = node.parentElement
  ) {
    const { opacity, transform } = node.style;
    if (
      (opacity !== '' && opacity !== '1') ||
      transform.includes('translate')
    ) {
      return true;
    }
  }
  return false;
}
