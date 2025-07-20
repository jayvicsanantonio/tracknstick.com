import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Header from '@/features/layout/components/Header';
import { featureFlags } from '@/config/featureFlags';
import { HabitsStateProvider } from '@/features/habits/context/HabitsStateContext';

const renderHeader = () => {
  return render(
    <HabitsStateProvider>
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    </HabitsStateProvider>,
  );
};

describe('Header Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset feature flag
    vi.mocked(featureFlags).isUrlRoutingEnabled = false;
  });

  describe('with URL routing disabled', () => {
    it('renders legacy navigation buttons', () => {
      renderHeader();

      // Should show button elements, not links
      const dailyButton = screen.getByRole('button', {
        name: /daily tracker/i,
      });
      const habitsButton = screen.getByRole('button', { name: /habits/i });
      const progressButton = screen.getByRole('button', { name: /progress/i });

      expect(dailyButton).toBeInTheDocument();
      expect(habitsButton).toBeInTheDocument();
      expect(progressButton).toBeInTheDocument();
    });

    it('shows warning when clicking legacy buttons', async () => {
      const consoleSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => undefined);

      renderHeader();

      const habitsButton = screen.getByRole('button', { name: /habits/i });
      await user.click(habitsButton);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Legacy navigation mode - enable URL routing for navigation',
      );

      consoleSpy.mockRestore();
    });
  });

  describe('with URL routing enabled', () => {
    beforeEach(() => {
      vi.mocked(featureFlags).isUrlRoutingEnabled = true;
    });

    it('renders navigation links instead of buttons', () => {
      renderHeader();

      // Should show link elements
      const dailyLink = screen.getByRole('link', { name: /daily tracker/i });
      const habitsLink = screen.getByRole('link', { name: /habits/i });
      const progressLink = screen.getByRole('link', { name: /progress/i });

      expect(dailyLink).toBeInTheDocument();
      expect(habitsLink).toBeInTheDocument();
      expect(progressLink).toBeInTheDocument();

      // Check href attributes
      expect(dailyLink).toHaveAttribute('href', '/');
      expect(habitsLink).toHaveAttribute('href', '/habits');
      expect(progressLink).toHaveAttribute('href', '/progress');
    });

    it('applies active styles to current route', () => {
      // Render with a specific route
      render(
        <HabitsStateProvider>
          <BrowserRouter>
            <Header />
          </BrowserRouter>
        </HabitsStateProvider>,
      );

      const habitsLink = screen.getByRole('link', { name: /habits/i });
      const dailyLink = screen.getByRole('link', { name: /daily tracker/i });

      // Active link should have blue text
      expect(habitsLink.querySelector('svg')).toHaveClass('text-blue-600');
      expect(dailyLink.querySelector('svg')).not.toHaveClass('text-blue-600');
    });
  });
});
