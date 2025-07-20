import React from 'react';
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { HabitsStateProvider } from '@/features/habits/context/HabitsStateContext';
import { router } from '@/routes';

// Mock Clerk is now handled in mocks.tsx

interface RenderWithProvidersOptions {
  initialEntries?: string[];
  initialIndex?: number;
}

export function renderWithProviders(
  ui: React.ReactElement,
  renderOptions: RenderWithProvidersOptions = {},
) {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <ClerkProvider publishableKey="test-key">
        <HabitsStateProvider>{children}</HabitsStateProvider>
      </ClerkProvider>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...renderOptions });
}

export function renderWithRouter({
  initialEntries = ['/'],
  initialIndex = 0,
}: RenderWithProvidersOptions = {}) {
  const memoryRouter = createMemoryRouter(router.routes, {
    initialEntries,
    initialIndex,
  });

  const AllTheProviders = () => {
    return (
      <ClerkProvider publishableKey="test-key">
        <HabitsStateProvider>
          <RouterProvider router={memoryRouter} />
        </HabitsStateProvider>
      </ClerkProvider>
    );
  };

  return {
    ...render(<AllTheProviders />),
    router: memoryRouter,
  };
}

// Mock feature flags for testing
import { featureFlags } from '@/config/featureFlags';

export const mockFeatureFlags = (flags: Partial<typeof featureFlags>) => {
  const originalFlags = { ...featureFlags };
  Object.assign(featureFlags, flags);

  return () => {
    Object.assign(featureFlags, originalFlags);
  };
};
