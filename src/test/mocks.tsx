import React from 'react';
import { vi } from 'vitest';

// Create configurable mock functions
const mockUseAuth = vi.fn(() => ({ isSignedIn: true }));
const mockUseUser = vi.fn(() => ({ user: { id: 'test-user' } }));

// Mock Clerk components and hooks
vi.mock('@clerk/clerk-react', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SignedIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignedOut: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  UserButton: () => <div>User Button</div>,
  SignIn: () => <div>Sign In Component</div>,
  useUser: mockUseUser,
  useAuth: mockUseAuth,
}));

// Mock feature flags
vi.mock('@/config/featureFlags', () => ({
  featureFlags: {
    isUrlRoutingEnabled: true,
  },
}));

// Mock habits context
vi.mock('@/features/habits/hooks/useHabitsContext', () => ({
  useHabitsContext: () => ({
    isEditMode: false,
    toggleIsEditMode: vi.fn(),
    editingHabit: null,
    setEditingHabit: vi.fn(),
    showAddHabitDialog: false,
    toggleShowAddHabitDialog: vi.fn(),
    showEditHabitDialog: false,
    toggleShowEditHabitDialog: vi.fn(),
    openEditDialog: vi.fn(),
  }),
}));

// Mock layout components
vi.mock('@/layouts/RootLayout', async () => {
  const { Outlet, NavLink } =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );

  return {
    default: () => (
      <div>
        <header>
          <NavLink to="/" aria-label="Daily Tracker">
            Daily Tracker
          </NavLink>
          <NavLink to="/habits" aria-label="Habits Overview">
            Habits
          </NavLink>
          <NavLink to="/progress" aria-label="Progress Overview">
            Progress
          </NavLink>
        </header>
        <Outlet />
        <div>Footer Mock</div>
      </div>
    ),
  };
});

// Mock page components
vi.mock('@/pages/DashboardPage', () => ({
  default: () => (
    <div>
      <h1>Daily Habit Tracker</h1>
    </div>
  ),
}));

vi.mock('@/pages/HabitsPage', () => ({
  default: () => (
    <div>
      <h1>Habits</h1>
    </div>
  ),
}));

vi.mock('@/pages/ProgressPage', () => ({
  default: () => (
    <div>
      <h1>Progress</h1>
    </div>
  ),
}));

vi.mock('@/pages/NotFoundPage', () => ({
  default: () => {
    // Check if this is the error test route
    if (window.location.pathname === '/error') {
      throw new Error('Test error for error boundary');
    }
    return (
      <div>
        <h1>Page Not Found</h1>
      </div>
    );
  },
}));

// Mock other components
vi.mock('@/components/LoadingFallback', () => ({
  default: () => <div>Loading...</div>,
}));

vi.mock('@/components/ErrorBoundary', () => {
  interface ErrorBoundaryProps {
    children: React.ReactNode;
  }

  interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
  }

  class MockErrorBoundary extends React.Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
  > {
    constructor(props: ErrorBoundaryProps) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
      return { hasError: true, error };
    }

    render() {
      if (this.state.hasError) {
        return (
          <div>
            Error Boundary Fallback:{' '}
            {this.state.error?.message ?? 'Unknown error'}
          </div>
        );
      }
      return this.props.children;
    }
  }

  return {
    default: MockErrorBoundary,
  };
});

// Mock error page component for testing error boundaries
vi.mock('@/pages/ErrorPage', () => ({
  default: () => {
    throw new Error('Test error for error boundary');
  },
}));

// Mock Welcome component
vi.mock('@/features/layout/components/Welcome', () => ({
  default: () => <div>Welcome Component</div>,
}));

// Mock DailyHabitTracker
vi.mock('@/features/habits/components/DailyHabitTracker', () => ({
  default: () => <div>Daily Habit Tracker</div>,
}));

// Export mock functions for use in tests
export { mockUseAuth, mockUseUser };
