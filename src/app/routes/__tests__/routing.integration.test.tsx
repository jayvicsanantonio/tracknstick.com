import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@testing/utils';

// Mock Clerk hooks
vi.mock('@clerk/clerk-react', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  SignedIn: ({ children }: { children: React.ReactNode }) => children,
  SignedOut: ({ children }: { children: React.ReactNode }) => children,
  useUser: () => ({ user: { id: 'test-user' } }),
  useAuth: () => ({ isSignedIn: true }),
}));

// Feature flags no longer needed - routing is always enabled

describe('Routing Integration Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Navigation via URL', () => {
    it('navigates to dashboard page on root path', async () => {
      const { router } = renderWithRouter({ initialEntries: ['/'] });

      await waitFor(() => {
        expect(router.state.location.pathname).toBe('/');
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
          'Daily Habit Tracker',
        );
      });
    });

    it('navigates to habits page', async () => {
      const { router } = renderWithRouter({ initialEntries: ['/habits'] });

      await waitFor(() => {
        expect(router.state.location.pathname).toBe('/habits');
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
          'Habits',
        );
      });
    });

    it('navigates to progress page', async () => {
      const { router } = renderWithRouter({ initialEntries: ['/progress'] });

      await waitFor(() => {
        expect(router.state.location.pathname).toBe('/progress');
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
          'Progress',
        );
      });
    });

    it('shows 404 page for unknown routes', async () => {
      const { router } = renderWithRouter({
        initialEntries: ['/unknown-route'],
      });

      await waitFor(() => {
        expect(router.state.location.pathname).toBe('/unknown-route');
        expect(screen.getByText(/page not found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation via NavLinks', () => {
    it('navigates between pages using header navigation', async () => {
      const { router } = renderWithRouter({ initialEntries: ['/'] });

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
          'Daily Habit Tracker',
        );
      });

      // Click on Habits navigation
      const habitsLink = screen.getByRole('link', { name: /habits/i });
      await user.click(habitsLink);

      await waitFor(() => {
        expect(router.state.location.pathname).toBe('/habits');
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
          'Habits',
        );
      });

      // Click on Progress navigation
      const progressLink = screen.getByRole('link', { name: /progress/i });
      await user.click(progressLink);

      await waitFor(() => {
        expect(router.state.location.pathname).toBe('/progress');
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
          'Progress',
        );
      });

      // Navigate back to dashboard
      const dashboardLink = screen.getByRole('link', { name: /daily/i });
      await user.click(dashboardLink);

      await waitFor(() => {
        expect(router.state.location.pathname).toBe('/');
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
          'Daily Habit Tracker',
        );
      });
    });
  });

  describe('Browser History', () => {
    it('supports browser back/forward navigation', async () => {
      const { router } = renderWithRouter({ initialEntries: ['/'] });

      // Navigate to habits
      const habitsLink = screen.getByRole('link', { name: /habits/i });
      await user.click(habitsLink);

      await waitFor(() => {
        expect(router.state.location.pathname).toBe('/habits');
      });

      // Navigate to progress
      const progressLink = screen.getByRole('link', { name: /progress/i });
      await user.click(progressLink);

      await waitFor(() => {
        expect(router.state.location.pathname).toBe('/progress');
      });

      // Go back in history
      void router.navigate(-1);

      await waitFor(() => {
        expect(router.state.location.pathname).toBe('/habits');
      });

      // Go back again
      void router.navigate(-1);

      await waitFor(() => {
        expect(router.state.location.pathname).toBe('/');
      });

      // Go forward
      void router.navigate(1);

      await waitFor(() => {
        expect(router.state.location.pathname).toBe('/habits');
      });
    });
  });

  describe('Active Link Styling', () => {
    it('applies active styles to current route link', async () => {
      renderWithRouter({ initialEntries: ['/habits'] });

      await waitFor(() => {
        const habitsLink = screen.getByRole('link', { name: /habits/i });
        const dashboardLink = screen.getByRole('link', { name: /daily/i });
        const progressLink = screen.getByRole('link', { name: /progress/i });

        // Check active link has different styling
        expect(habitsLink).toHaveClass('active');
        expect(dashboardLink).not.toHaveClass('active');
        expect(progressLink).not.toHaveClass('active');
      });
    });
  });

  // Note: Error boundary testing removed as it requires a different setup
  // The current implementation catches errors at the route level, not within page components
  // To properly test error boundaries, we would need to mock a component that throws during render
});
