import React from 'react';
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { HabitsStateProvider } from '@/features/habits/context/HabitsStateContext';
import { routes } from '@/routes';

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

// Mock feature flags for testing
import { vi } from 'vitest';
import { featureFlags, type FeatureFlags } from '@/config/featureFlags';

export const mockFeatureFlags = (flags: Partial<FeatureFlags>) => {
  // Store original values
  const originalValues = new Map<keyof FeatureFlags, boolean>();

  // Backup current values and set new ones
  Object.entries(flags).forEach(([key, value]) => {
    const typedKey = key as keyof FeatureFlags;
    originalValues.set(typedKey, featureFlags[typedKey]);
    featureFlags[typedKey] = value;
  });

  // Return cleanup function
  return () => {
    originalValues.forEach((value, key) => {
      featureFlags[key] = value;
    });
  };
};

// Alternative approach using vi.mocked for better type safety
export const mockFeatureFlagsWithVi = (flags: Partial<FeatureFlags>) => {
  const originalFlags = { ...featureFlags };

  // Use vi.mocked to ensure proper cleanup
  const mockedFlags = vi.mocked(featureFlags);

  Object.entries(flags).forEach(([key, value]) => {
    const typedKey = key as keyof FeatureFlags;
    mockedFlags[typedKey] = value;
  });

  return () => {
    Object.entries(originalFlags).forEach(([key, value]) => {
      const typedKey = key as keyof FeatureFlags;
      mockedFlags[typedKey] = value;
    });
  };
};
