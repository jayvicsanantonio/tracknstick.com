import React from 'react';
import { vi } from 'vitest';

// Mock Clerk components and hooks
vi.mock('@clerk/clerk-react', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SignedIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignedOut: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  UserButton: () => <div>User Button</div>,
  useUser: () => ({ user: { id: 'test-user' } }),
  useAuth: () => ({ isSignedIn: true }),
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
vi.mock('@/layouts/RootLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>
      <div>Header Mock</div>
      {children}
      <div>Footer Mock</div>
    </div>
  ),
}));

// Mock page components
vi.mock('@/pages/DashboardPage', () => ({
  default: () => <div>Daily Habit Tracker</div>,
}));

vi.mock('@/pages/HabitsPage', () => ({
  default: () => <div>Habits Page</div>,
}));

vi.mock('@/pages/ProgressPage', () => ({
  default: () => <div>Progress Page</div>,
}));

vi.mock('@/pages/NotFoundPage', () => ({
  default: () => <div>Page Not Found</div>,
}));

// Mock other components
vi.mock('@/components/LoadingFallback', () => ({
  default: () => <div>Loading...</div>,
}));

vi.mock('@/components/ErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock Welcome component
vi.mock('@/features/Welcome', () => ({
  Welcome: () => <div>Welcome Component</div>,
}));

// Mock DailyHabitTracker
vi.mock('@/features/habits/components/DailyHabitTracker', () => ({
  DailyHabitTracker: () => <div>Daily Habit Tracker</div>,
}));
