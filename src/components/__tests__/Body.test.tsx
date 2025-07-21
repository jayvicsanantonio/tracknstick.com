import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Body from '@/features/layout/components/Body';
import { featureFlags } from '@/config/featureFlags';
import { mockUseAuth } from '@/test/mocks';

vi.mock('react-router-dom', () => ({
  Outlet: vi.fn(() => <div>Router Outlet</div>),
}));

describe('Body Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(featureFlags).isUrlRoutingEnabled = false;
  });

  describe('with URL routing disabled', () => {
    it('renders DailyHabitTracker for signed-in users', () => {
      render(<Body />);

      // Should find the mocked DailyHabitTracker component
      const tracker = screen.getAllByText('Daily Habit Tracker');
      expect(tracker[1]).toBeInTheDocument(); // The component, not the heading
      expect(screen.queryByText('Router Outlet')).not.toBeInTheDocument();
    });

    it('renders Welcome component for signed-out users', () => {
      // Configure useAuth to return signed-out state
      mockUseAuth.mockReturnValue({ isSignedIn: false });

      render(<Body />);

      expect(screen.getByText('Welcome Component')).toBeInTheDocument();
    });

    it('includes screen reader heading', () => {
      render(<Body />);

      const headings = screen.getAllByRole('heading', { level: 1 });
      const trackerHeading = headings.find(
        (h) => h.textContent === 'Daily Habit Tracker',
      );
      expect(trackerHeading).toBeInTheDocument();
      expect(trackerHeading).toHaveClass('sr-only');
    });
  });

  describe('with URL routing enabled', () => {
    beforeEach(() => {
      vi.mocked(featureFlags).isUrlRoutingEnabled = true;
    });

    it('renders Outlet component for routing', () => {
      render(<Body />);

      expect(screen.getByText('Router Outlet')).toBeInTheDocument();
      expect(screen.queryByText('Daily Habit Tracker')).not.toBeInTheDocument();
    });

    it('does not render legacy components when signed in', () => {
      render(<Body />);

      expect(screen.queryByText('Daily Habit Tracker')).not.toBeInTheDocument();
      // Welcome component is still rendered for signed out users even with routing enabled
    });

    it('verifies Outlet is rendered', () => {
      render(<Body />);

      // Verify Outlet was rendered by checking its content
      expect(screen.getByText('Router Outlet')).toBeInTheDocument();
    });
  });
});
