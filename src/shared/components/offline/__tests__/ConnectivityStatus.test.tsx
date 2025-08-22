// Tests for ConnectivityStatus component
// Validates rendering of connectivity status with different states and variants

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConnectivityStatus } from '../ConnectivityStatus';

// Mock the OfflineContext
const mockUseOffline = vi.fn();
vi.mock('@app/providers/OfflineContext', () => ({
  useOffline: () => mockUseOffline(),
}));

describe('ConnectivityStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Online states', () => {
    it('should display excellent connection status', () => {
      mockUseOffline.mockReturnValue({
        isOnline: true,
        connectivityStatus: {
          online: true,
          quality: 'excellent',
          lastOnline: new Date('2024-01-01T10:00:00Z'),
          lastOffline: null,
        },
      });

      render(<ConnectivityStatus variant="compact" />);

      expect(screen.getByText('Excellent Connection')).toBeInTheDocument();
      expect(screen.getByTestId('wifi-icon')).toBeInTheDocument();
    });

    it('should display good connection status', () => {
      mockUseOffline.mockReturnValue({
        isOnline: true,
        connectivityStatus: {
          online: true,
          quality: 'good',
          lastOnline: new Date('2024-01-01T10:00:00Z'),
          lastOffline: null,
        },
      });

      render(<ConnectivityStatus variant="compact" />);

      expect(screen.getByText('Good Connection')).toBeInTheDocument();
    });

    it('should display poor connection status with warning icon', () => {
      mockUseOffline.mockReturnValue({
        isOnline: true,
        connectivityStatus: {
          online: true,
          quality: 'poor',
          lastOnline: new Date('2024-01-01T10:00:00Z'),
          lastOffline: null,
        },
      });

      render(<ConnectivityStatus variant="compact" />);

      expect(screen.getByText('Poor Connection')).toBeInTheDocument();
      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
    });
  });

  describe('Offline state', () => {
    it('should display offline status', () => {
      mockUseOffline.mockReturnValue({
        isOnline: false,
        connectivityStatus: {
          online: false,
          quality: 'poor',
          lastOnline: new Date('2024-01-01T09:00:00Z'),
          lastOffline: new Date('2024-01-01T10:00:00Z'),
        },
      });

      render(<ConnectivityStatus variant="compact" />);

      expect(screen.getByText('Offline')).toBeInTheDocument();
      expect(screen.getByTestId('wifi-off-icon')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    beforeEach(() => {
      mockUseOffline.mockReturnValue({
        isOnline: true,
        connectivityStatus: {
          online: true,
          quality: 'good',
          lastOnline: new Date('2024-01-01T10:00:00Z'),
          lastOffline: new Date('2024-01-01T09:00:00Z'),
        },
      });
    });

    it('should render icon-only variant', () => {
      render(<ConnectivityStatus variant="icon-only" />);

      expect(screen.getByTestId('wifi-icon')).toBeInTheDocument();
      expect(screen.queryByText('Good Connection')).not.toBeInTheDocument();
    });

    it('should render compact variant with text', () => {
      render(<ConnectivityStatus variant="compact" />);

      expect(screen.getByTestId('wifi-icon')).toBeInTheDocument();
      expect(screen.getByText('Good Connection')).toBeInTheDocument();
    });

    it('should render full variant with last offline time', () => {
      render(<ConnectivityStatus variant="full" />);

      expect(screen.getByText('Good Connection')).toBeInTheDocument();
      expect(screen.getByText(/Last offline:/)).toBeInTheDocument();
    });

    it('should not show last offline time when never been offline', () => {
      mockUseOffline.mockReturnValue({
        isOnline: true,
        connectivityStatus: {
          online: true,
          quality: 'good',
          lastOnline: new Date('2024-01-01T10:00:00Z'),
          lastOffline: null,
        },
      });

      render(<ConnectivityStatus variant="full" />);

      expect(screen.getByText('Good Connection')).toBeInTheDocument();
      expect(screen.queryByText(/Last offline:/)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper title attribute for icon-only variant', () => {
      mockUseOffline.mockReturnValue({
        isOnline: true,
        connectivityStatus: {
          online: true,
          quality: 'excellent',
          lastOnline: new Date(),
          lastOffline: null,
        },
      });

      const { container } = render(<ConnectivityStatus variant="icon-only" />);
      const wrapper = container.firstChild as Element;

      expect(wrapper).toHaveAttribute('title', 'Excellent Connection');
    });
  });
});
