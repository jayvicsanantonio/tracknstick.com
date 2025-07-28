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

// Mock useToggle hook
vi.mock('@shared/hooks/use-toggle', () => ({
  useToggle: (initialValue = false) => {
    let value = initialValue;
    const toggle = vi.fn(() => {
      value = !value;
    });
    return [value, toggle];
  },
}));

// Mock HabitsStateProvider
vi.mock('@/features/habits/context/HabitsStateContext', () => {
  const mockContextValue = {
    isEditMode: false,
    toggleIsEditMode: vi.fn(),
    editingHabit: null,
    setEditingHabit: vi.fn(),
    showAddHabitDialog: false,
    toggleShowAddHabitDialog: vi.fn(),
    showEditHabitDialog: false,
    toggleShowEditHabitDialog: vi.fn(),
    openEditDialog: vi.fn(),
  };

  return {
    HabitsStateContext: React.createContext(mockContextValue),
    HabitsStateProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

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
vi.mock('@shared/components/layouts/RootLayout', async () => {
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
vi.mock('@shared/components/feedback/LoadingFallback', () => ({
  default: () => <div>Loading...</div>,
}));

vi.mock('@shared/components/feedback/ErrorBoundary', () => {
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

// Mock HabitsOverview
vi.mock('@/features/habits/components/HabitsOverview', () => ({
  default: () => <div>Habits Overview</div>,
}));

// Mock ProgressOverview
vi.mock('@/features/progress/components/ProgressOverview', () => ({
  default: () => <div>Progress Overview</div>,
}));

// Mock Footer component
vi.mock('@/features/layout/components/Footer', () => ({
  default: () => <footer>Footer Mock</footer>,
}));

// Mock habit dialog components
vi.mock('@/features/habits/components/AddHabitDialog', () => ({
  default: () => <div>Add Habit Dialog Mock</div>,
}));

vi.mock('@/features/habits/components/EditHabitDialog', () => ({
  default: () => <div>Edit Habit Dialog Mock</div>,
}));

// Mock PWAInstallPrompt
vi.mock('@shared/components/feedback/PWAInstallPrompt', () => ({
  PWAInstallPrompt: () => <div>PWA Install Prompt Mock</div>,
}));

// Mock ThemeProvider to avoid localStorage issues in tests
vi.mock('@app/providers/ThemeProvider', async () => {
  const { ThemeContext } = await vi.importActual<{
    ThemeContext: React.Context<{ toggleDarkMode: () => void }>;
  }>('@app/providers/ThemeContext');
  return {
    default: ({ children }: { children: React.ReactNode }) => {
      const mockValue = { toggleDarkMode: vi.fn() };
      return (
        <ThemeContext.Provider value={mockValue}>
          {children}
        </ThemeContext.Provider>
      );
    },
  };
});

// Mock DateProvider
vi.mock('@app/providers/DateProvider', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock UI components
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

vi.mock('@shared/components/ui/button', () => ({
  Button: ({ children, onClick, className, ...props }: ButtonProps) => (
    <button className={className} onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

// Mock icons
type IconProps = React.SVGProps<SVGSVGElement>;

vi.mock('@/icons/miscellaneous', () => ({
  default: {
    CheckCircle2: ({ className }: IconProps) => (
      <div className={className} data-testid="icon-checkcircle2">
        CheckCircle2
      </div>
    ),
    Edit: ({ className }: IconProps) => (
      <div className={className} data-testid="icon-edit">
        Edit
      </div>
    ),
    Moon: ({ className }: IconProps) => (
      <div className={className} data-testid="icon-moon">
        Moon
      </div>
    ),
    Plus: ({ className }: IconProps) => (
      <div className={className} data-testid="icon-plus">
        Plus
      </div>
    ),
    Sun: ({ className }: IconProps) => (
      <div className={className} data-testid="icon-sun">
        Sun
      </div>
    ),
    BarChart2: ({ className }: IconProps) => (
      <div className={className} data-testid="icon-barchart2">
        BarChart2
      </div>
    ),
    Calendar: ({ className }: IconProps) => (
      <div className={className} data-testid="icon-calendar">
        Calendar
      </div>
    ),
  },
}));

// Export mock functions for use in tests
export { mockUseAuth, mockUseUser };
