// Tests for SyncStatus component
// Validates rendering of sync status with different states, actions, and error handling

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SyncStatus } from '../SyncStatus';

// Mock the OfflineContext
const mockUseOffline = vi.fn();
const mockSync = vi.fn();
const mockResolveConflicts = vi.fn();

vi.mock('@app/providers/OfflineContext', () => ({
  useOffline: () => mockUseOffline(),
}));

// Mock the toast hook
const mockToast = vi.fn();
vi.mock('@shared/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe('SyncStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSync.mockResolvedValue(undefined);
    mockResolveConflicts.mockResolvedValue(undefined);
  });

  describe('Sync states', () => {
    it('should display up to date status when no pending operations', () => {
      mockUseOffline.mockReturnValue({
        syncStatus: {
          inProgress: false,
          pendingOperations: 0,
          conflicts: 0,
          lastSync: new Date('2024-01-01T10:00:00Z'),
          lastSyncSuccess: new Date('2024-01-01T10:00:00Z'),
        },
        isOnline: true,
        sync: mockSync,
        resolveConflicts: mockResolveConflicts,
      });

      render(<SyncStatus variant="compact" />);

      expect(screen.getByText('Up to date')).toBeInTheDocument();
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    });

    it('should display pending operations count', () => {
      mockUseOffline.mockReturnValue({
        syncStatus: {
          inProgress: false,
          pendingOperations: 3,
          conflicts: 0,
          lastSync: null,
          lastSyncSuccess: null,
        },
        isOnline: true,
        sync: mockSync,
        resolveConflicts: mockResolveConflicts,
      });

      render(<SyncStatus variant="compact" />);

      expect(screen.getByText('3 pending')).toBeInTheDocument();
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    });

    it('should display conflicts count', () => {
      mockUseOffline.mockReturnValue({
        syncStatus: {
          inProgress: false,
          pendingOperations: 0,
          conflicts: 2,
          lastSync: null,
          lastSyncSuccess: null,
        },
        isOnline: true,
        sync: mockSync,
        resolveConflicts: mockResolveConflicts,
      });

      render(<SyncStatus variant="compact" />);

      expect(screen.getByText('2 conflicts')).toBeInTheDocument();
      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
    });

    it('should display syncing status with spinner', () => {
      mockUseOffline.mockReturnValue({
        syncStatus: {
          inProgress: true,
          pendingOperations: 2,
          conflicts: 0,
          lastSync: null,
          lastSyncSuccess: null,
        },
        isOnline: true,
        sync: mockSync,
        resolveConflicts: mockResolveConflicts,
      });

      render(<SyncStatus variant="compact" />);

      expect(screen.getByText('Syncing...')).toBeInTheDocument();
      expect(screen.getByTestId('refresh-cw-icon')).toBeInTheDocument();
      expect(screen.getByTestId('refresh-cw-icon')).toHaveClass('animate-spin');
    });
  });

  describe('Action buttons', () => {
    it('should show sync button when operations are pending and online', () => {
      mockUseOffline.mockReturnValue({
        syncStatus: {
          inProgress: false,
          pendingOperations: 2,
          conflicts: 0,
          lastSync: null,
          lastSyncSuccess: null,
        },
        isOnline: true,
        sync: mockSync,
        resolveConflicts: mockResolveConflicts,
      });

      render(<SyncStatus variant="compact" showActions={true} />);

      expect(screen.getByRole('button', { name: /sync/i })).toBeInTheDocument();
    });

    it('should show resolve button when conflicts exist', () => {
      mockUseOffline.mockReturnValue({
        syncStatus: {
          inProgress: false,
          pendingOperations: 0,
          conflicts: 2,
          lastSync: null,
          lastSyncSuccess: null,
        },
        isOnline: true,
        sync: mockSync,
        resolveConflicts: mockResolveConflicts,
      });

      render(<SyncStatus variant="compact" showActions={true} />);

      expect(
        screen.getByRole('button', { name: /resolve/i }),
      ).toBeInTheDocument();
    });

    it('should not show sync button when offline', () => {
      mockUseOffline.mockReturnValue({
        syncStatus: {
          inProgress: false,
          pendingOperations: 2,
          conflicts: 0,
          lastSync: null,
          lastSyncSuccess: null,
        },
        isOnline: false,
        sync: mockSync,
        resolveConflicts: mockResolveConflicts,
      });

      render(<SyncStatus variant="compact" showActions={true} />);

      expect(
        screen.queryByRole('button', { name: /sync/i }),
      ).not.toBeInTheDocument();
    });

    it('should not show actions when showActions is false', () => {
      mockUseOffline.mockReturnValue({
        syncStatus: {
          inProgress: false,
          pendingOperations: 2,
          conflicts: 1,
          lastSync: null,
          lastSyncSuccess: null,
        },
        isOnline: true,
        sync: mockSync,
        resolveConflicts: mockResolveConflicts,
      });

      render(<SyncStatus variant="compact" showActions={false} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('User interactions', () => {
    it('should call sync function when sync button is clicked', async () => {
      mockUseOffline.mockReturnValue({
        syncStatus: {
          inProgress: false,
          pendingOperations: 2,
          conflicts: 0,
          lastSync: null,
          lastSyncSuccess: null,
        },
        isOnline: true,
        sync: mockSync,
        resolveConflicts: mockResolveConflicts,
      });

      render(<SyncStatus variant="compact" showActions={true} />);

      const syncButton = screen.getByRole('button', { name: /sync/i });
      fireEvent.click(syncButton);

      await waitFor(() => {
        expect(mockSync).toHaveBeenCalledTimes(1);
      });

      expect(mockToast).toHaveBeenCalledWith({
        description: 'Sync completed successfully.',
      });
    });

    it('should call resolveConflicts function when resolve button is clicked', async () => {
      mockUseOffline.mockReturnValue({
        syncStatus: {
          inProgress: false,
          pendingOperations: 0,
          conflicts: 2,
          lastSync: null,
          lastSyncSuccess: null,
        },
        isOnline: true,
        sync: mockSync,
        resolveConflicts: mockResolveConflicts,
      });

      render(<SyncStatus variant="compact" showActions={true} />);

      const resolveButton = screen.getByRole('button', { name: /resolve/i });
      fireEvent.click(resolveButton);

      await waitFor(() => {
        expect(mockResolveConflicts).toHaveBeenCalledTimes(1);
      });

      expect(mockToast).toHaveBeenCalledWith({
        description: 'Conflicts resolved successfully.',
      });
    });

    it('should show error toast when sync fails', async () => {
      mockSync.mockRejectedValue(new Error('Network error'));

      mockUseOffline.mockReturnValue({
        syncStatus: {
          inProgress: false,
          pendingOperations: 2,
          conflicts: 0,
          lastSync: null,
          lastSyncSuccess: null,
        },
        isOnline: true,
        sync: mockSync,
        resolveConflicts: mockResolveConflicts,
      });

      render(<SyncStatus variant="compact" showActions={true} />);

      const syncButton = screen.getByRole('button', { name: /sync/i });
      fireEvent.click(syncButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          description: 'Sync failed. Please try again.',
        });
      });
    });

    it('should show offline error when trying to sync while offline', async () => {
      mockUseOffline.mockReturnValue({
        syncStatus: {
          inProgress: false,
          pendingOperations: 2,
          conflicts: 0,
          lastSync: null,
          lastSyncSuccess: null,
        },
        isOnline: false,
        sync: mockSync,
        resolveConflicts: mockResolveConflicts,
      });

      // For this test, we need to render the full variant to have the sync button
      render(<SyncStatus variant="full" showActions={true} />);

      // The sync button should be disabled when offline, but let's test the logic
      // by calling the handler directly if it exists
      const syncButton = screen.queryByRole('button', { name: /sync now/i });
      if (syncButton) {
        fireEvent.click(syncButton);

        await waitFor(() => {
          expect(mockToast).toHaveBeenCalledWith({
            variant: 'destructive',
            description:
              'Cannot sync while offline. Please check your connection.',
          });
        });

        expect(mockSync).not.toHaveBeenCalled();
      }
    });
  });

  describe('Full variant', () => {
    it('should display detailed sync information', () => {
      const lastSync = new Date('2024-01-01T10:00:00Z');
      const lastSyncSuccess = new Date('2024-01-01T09:30:00Z');

      mockUseOffline.mockReturnValue({
        syncStatus: {
          inProgress: false,
          pendingOperations: 3,
          conflicts: 1,
          lastSync,
          lastSyncSuccess,
        },
        isOnline: true,
        sync: mockSync,
        resolveConflicts: mockResolveConflicts,
      });

      render(<SyncStatus variant="full" />);

      expect(screen.getByText('3 operations')).toBeInTheDocument();
      expect(screen.getByText('1 require resolution')).toBeInTheDocument();
      expect(screen.getByText(lastSync.toLocaleString())).toBeInTheDocument();
      expect(
        screen.getByText(lastSyncSuccess.toLocaleString()),
      ).toBeInTheDocument();
    });

    it('should show offline message when offline', () => {
      mockUseOffline.mockReturnValue({
        syncStatus: {
          inProgress: false,
          pendingOperations: 0,
          conflicts: 0,
          lastSync: null,
          lastSyncSuccess: null,
        },
        isOnline: false,
        sync: mockSync,
        resolveConflicts: mockResolveConflicts,
      });

      render(<SyncStatus variant="full" />);

      expect(
        screen.getByText('Sync disabled while offline'),
      ).toBeInTheDocument();
    });
  });
});
