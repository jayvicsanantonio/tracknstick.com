// Tests for OfflineIndicator component
// Validates rendering of combined connectivity and sync status in different layouts

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OfflineIndicator } from '../OfflineIndicator';

// Mock the OfflineContext
const mockUseOffline = vi.fn();
vi.mock('@app/providers/OfflineContext', () => ({
  useOffline: () => mockUseOffline(),
}));

// Mock the toast hook
const mockToast = vi.fn();
vi.mock('@shared/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe('OfflineIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock state
    mockUseOffline.mockReturnValue({
      isOnline: true,
      connectivityStatus: {
        online: true,
        quality: 'good',
        lastOnline: new Date('2024-01-01T10:00:00Z'),
        lastOffline: null,
      },
      syncStatus: {
        inProgress: false,
        pendingOperations: 0,
        conflicts: 0,
        lastSync: new Date('2024-01-01T10:00:00Z'),
        lastSyncSuccess: new Date('2024-01-01T10:00:00Z'),
      },
      sync: vi.fn(),
      resolveConflicts: vi.fn(),
    });
  });

  describe('Variants', () => {
    it('should render minimal variant with icon-only connectivity and compact sync', () => {
      render(<OfflineIndicator variant="minimal" />);

      // Should have connectivity icon (but not text)
      expect(screen.getByTestId('wifi-icon')).toBeInTheDocument();
      expect(screen.queryByText('Good Connection')).not.toBeInTheDocument();

      // Should have sync status text
      expect(screen.getByText('Up to date')).toBeInTheDocument();
    });

    it('should render compact variant in horizontal layout by default', () => {
      render(<OfflineIndicator variant="compact" />);

      expect(screen.getByText('Good Connection')).toBeInTheDocument();
      expect(screen.getByText('Up to date')).toBeInTheDocument();

      // Should render in card
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('should render compact variant in vertical layout', () => {
      render(<OfflineIndicator variant="compact" layout="vertical" />);

      expect(screen.getByText('Good Connection')).toBeInTheDocument();
      expect(screen.getByText('Up to date')).toBeInTheDocument();
    });

    it('should render full variant with both components in full mode', () => {
      render(<OfflineIndicator variant="full" />);

      // Should have detailed connectivity status
      expect(screen.getByText('Good Connection')).toBeInTheDocument();

      // Should have detailed sync status
      expect(screen.getByText('Up to date')).toBeInTheDocument();
    });

    it('should render full variant with horizontal layout on desktop', () => {
      render(<OfflineIndicator variant="full" layout="horizontal" />);

      // Should use grid layout classes
      const container = screen.getByTestId('offline-indicator-container');
      expect(container).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2');
    });
  });

  describe('Action visibility', () => {
    it('should show actions by default in compact variant', () => {
      mockUseOffline.mockReturnValue({
        ...mockUseOffline(),
        syncStatus: {
          inProgress: false,
          pendingOperations: 2,
          conflicts: 0,
          lastSync: null,
          lastSyncSuccess: null,
        },
      });

      render(<OfflineIndicator variant="compact" />);

      expect(screen.getByRole('button', { name: /sync/i })).toBeInTheDocument();
    });

    it('should hide actions when showActions is false', () => {
      mockUseOffline.mockReturnValue({
        ...mockUseOffline(),
        syncStatus: {
          inProgress: false,
          pendingOperations: 2,
          conflicts: 1,
          lastSync: null,
          lastSyncSuccess: null,
        },
      });

      render(<OfflineIndicator variant="compact" showActions={false} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should not show actions in minimal variant', () => {
      mockUseOffline.mockReturnValue({
        ...mockUseOffline(),
        syncStatus: {
          inProgress: false,
          pendingOperations: 2,
          conflicts: 1,
          lastSync: null,
          lastSyncSuccess: null,
        },
      });

      render(<OfflineIndicator variant="minimal" />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Different states', () => {
    it('should display offline state correctly', () => {
      mockUseOffline.mockReturnValue({
        ...mockUseOffline(),
        isOnline: false,
        connectivityStatus: {
          online: false,
          quality: 'poor',
          lastOnline: new Date('2024-01-01T09:00:00Z'),
          lastOffline: new Date('2024-01-01T10:00:00Z'),
        },
      });

      render(<OfflineIndicator variant="compact" />);

      expect(screen.getByText('Offline')).toBeInTheDocument();
      expect(screen.getByTestId('wifi-off-icon')).toBeInTheDocument();
    });

    it('should display sync in progress state', () => {
      mockUseOffline.mockReturnValue({
        ...mockUseOffline(),
        syncStatus: {
          inProgress: true,
          pendingOperations: 2,
          conflicts: 0,
          lastSync: null,
          lastSyncSuccess: null,
        },
      });

      render(<OfflineIndicator variant="compact" />);

      expect(screen.getByText('Syncing...')).toBeInTheDocument();
      expect(screen.getByTestId('refresh-cw-icon')).toHaveClass('animate-spin');
    });

    it('should display conflicts state', () => {
      mockUseOffline.mockReturnValue({
        ...mockUseOffline(),
        syncStatus: {
          inProgress: false,
          pendingOperations: 0,
          conflicts: 3,
          lastSync: null,
          lastSyncSuccess: null,
        },
      });

      render(<OfflineIndicator variant="compact" />);

      expect(screen.getByText('3 conflicts')).toBeInTheDocument();
      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
    });

    it('should display pending operations state', () => {
      mockUseOffline.mockReturnValue({
        ...mockUseOffline(),
        syncStatus: {
          inProgress: false,
          pendingOperations: 5,
          conflicts: 0,
          lastSync: null,
          lastSyncSuccess: null,
        },
      });

      render(<OfflineIndicator variant="compact" />);

      expect(screen.getByText('5 pending')).toBeInTheDocument();
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    });

    it('should display poor connection quality', () => {
      mockUseOffline.mockReturnValue({
        ...mockUseOffline(),
        connectivityStatus: {
          online: true,
          quality: 'poor',
          lastOnline: new Date('2024-01-01T10:00:00Z'),
          lastOffline: null,
        },
      });

      render(<OfflineIndicator variant="compact" />);

      expect(screen.getByText('Poor Connection')).toBeInTheDocument();
      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
    });
  });

  describe('CSS classes', () => {
    it('should apply custom className', () => {
      render(<OfflineIndicator variant="compact" className="custom-class" />);

      const container = screen.getByTestId('card');
      expect(container).toHaveClass('custom-class');
    });

    it('should have proper layout classes for vertical layout', () => {
      render(<OfflineIndicator variant="compact" layout="vertical" />);

      // The CardContent should have flex-col class
      const content = screen.getByTestId('card-content');
      expect(content).toHaveClass('flex-col');
    });

    it('should have proper layout classes for horizontal layout', () => {
      render(<OfflineIndicator variant="compact" layout="horizontal" />);

      // The CardContent should have items-center class
      const content = screen.getByTestId('card-content');
      expect(content).toHaveClass('items-center');
    });
  });
});
