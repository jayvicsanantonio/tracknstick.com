import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Outlet } from 'react-router-dom';
import Body from '@/features/layout/components/Body';
import { featureFlags } from '@/config/featureFlags';

describe('Body Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(featureFlags).isUrlRoutingEnabled = false;
  });

  describe('with URL routing disabled', () => {
    it('renders DailyHabitTracker for signed-in users', () => {
      render(<Body />);

      expect(screen.getByText('Daily Habit Tracker')).toBeInTheDocument();
      expect(screen.queryByText('Router Outlet')).not.toBeInTheDocument();
    });

    it('renders Welcome component for signed-out users', () => {
      // Mock SignedIn to render nothing and SignedOut to render children
      vi.mock('@clerk/clerk-react', () => ({
        SignedIn: () => null,
        SignedOut: ({ children }: { children: React.ReactNode }) => children,
      }));

      render(<Body />);

      expect(screen.getByText('Welcome Component')).toBeInTheDocument();
    });

    it('includes screen reader heading', () => {
      render(<Body />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Daily Habit Tracker');
      expect(heading).toHaveClass('sr-only');
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

    it('does not render legacy components', () => {
      render(<Body />);

      expect(screen.queryByText('Daily Habit Tracker')).not.toBeInTheDocument();
      expect(screen.queryByText('Welcome Component')).not.toBeInTheDocument();
    });

    it('verifies Outlet is called', () => {
      render(<Body />);

      expect(vi.mocked(Outlet)).toHaveBeenCalled();
    });
  });
});
