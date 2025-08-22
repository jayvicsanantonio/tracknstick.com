// Comprehensive tests for conflict resolution UI components
// Tests modal functionality, user interactions, and integration with conflict resolution system

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ConflictResolutionModal } from '../ConflictResolutionModal';
import {
  ConflictResolutionProvider,
  useConflictResolution,
} from '../ConflictResolutionProvider';
import { ConflictsIndicator } from '../ConflictsIndicator';
import { ConflictData } from '../../types';

// Define resolution type locally since it's not in the main types
interface ConflictResolution {
  strategy: 'USE_LOCAL' | 'USE_SERVER' | 'MERGE';
  resolvedData?: any;
}
import { OfflineHabit, HabitEntry } from '../../types';

// Mock dependencies
vi.mock('@shared/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('../../errors/ErrorNotificationService', () => ({
  getErrorNotification: () => ({
    notifyError: vi.fn(),
  }),
}));

// Mock UI components
vi.mock('@shared/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="dialog-description">{children}</p>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-footer">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="dialog-title">{children}</h2>
  ),
}));

vi.mock('@shared/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={props['data-testid'] || 'button'}
    >
      {children}
    </button>
  ),
}));

vi.mock('@shared/components/ui/card', () => ({
  Card: ({ children, className, onClick }: any) => (
    <div className={className} onClick={onClick} data-testid="card">
      {children}
    </div>
  ),
  CardContent: ({ children }: any) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardDescription: ({ children }: any) => (
    <p data-testid="card-description">{children}</p>
  ),
  CardHeader: ({ children, onClick }: any) => (
    <div data-testid="card-header" onClick={onClick}>
      {children}
    </div>
  ),
  CardTitle: ({ children }: any) => (
    <h3 data-testid="card-title">{children}</h3>
  ),
}));

vi.mock('@shared/components/ui/badge', () => ({
  Badge: ({ children, variant }: any) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

vi.mock('@shared/components/ui/separator', () => ({
  Separator: () => <hr data-testid="separator" />,
}));

vi.mock('@shared/components/ui/popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover">{children}</div>
  ),
  PopoverContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-content">{children}</div>
  ),
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-trigger">{children}</div>
  ),
}));

vi.mock('@shared/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Tooltip: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-trigger">{children}</div>
  ),
}));

describe('Conflict Resolution UI Components', () => {
  const mockHabit: OfflineHabit = {
    id: 'habit-1',
    name: 'Exercise',
    icon: 'dumbbell',
    frequency: [1, 2, 3, 4, 5], // Weekdays
    startDate: new Date('2024-01-01'),
    lastModified: new Date('2024-01-15T10:00:00Z'),
    synced: false,
    version: 2,
  };

  const mockHabitEntry: HabitEntry = {
    id: 'entry-1',
    habitId: 'habit-1',
    date: new Date('2024-01-15'),
    completed: true,
    lastModified: new Date('2024-01-15T12:00:00Z'),
    synced: false,
    version: 1,
  };

  const mockHabitConflict: ConflictData = {
    id: 'conflict-1',
    entityType: 'HABIT',
    entityId: 'habit-1',
    localData: mockHabit,
    serverData: {
      ...mockHabit,
      name: 'Daily Exercise',
      version: 3,
      lastModified: new Date('2024-01-15T11:00:00Z'),
    },
    timestamp: new Date('2024-01-15T12:30:00Z'),
    resolved: false,
  };

  const mockEntryConflict: ConflictData = {
    id: 'conflict-2',
    entityType: 'HABIT_ENTRY',
    entityId: 'entry-1',
    localData: mockHabitEntry,
    serverData: {
      ...mockHabitEntry,
      completed: false,
      version: 2,
      lastModified: new Date('2024-01-15T13:00:00Z'),
    },
    timestamp: new Date('2024-01-15T14:00:00Z'),
    resolved: false,
  };

  describe('ConflictResolutionModal', () => {
    const mockOnResolve = vi.fn();
    const mockOnClose = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should render habit conflict modal with correct information', () => {
      render(
        <ConflictResolutionModal
          isOpen={true}
          onClose={mockOnClose}
          conflict={mockHabitConflict}
          onResolve={mockOnResolve}
        />,
      );

      expect(screen.getByText('Habit Update Conflict')).toBeInTheDocument();
      expect(
        screen.getByText(/Changes were made to "Exercise"/),
      ).toBeInTheDocument();
      expect(screen.getByText('Local Version')).toBeInTheDocument();
      expect(screen.getByText('Server Version')).toBeInTheDocument();
      expect(screen.getByText('Exercise')).toBeInTheDocument();
      expect(screen.getByText('Daily Exercise')).toBeInTheDocument();
    });

    it('should render habit entry conflict modal with correct information', () => {
      render(
        <ConflictResolutionModal
          isOpen={true}
          onClose={mockOnClose}
          conflict={mockEntryConflict}
          onResolve={mockOnResolve}
        />,
      );

      expect(screen.getByText('Habit Entry Conflict')).toBeInTheDocument();
      expect(screen.getByText(/Entry for/)).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Not Completed')).toBeInTheDocument();
    });

    it('should allow selecting local version', async () => {
      render(
        <ConflictResolutionModal
          isOpen={true}
          onClose={mockOnClose}
          conflict={mockHabitConflict}
          onResolve={mockOnResolve}
        />,
      );

      const localCard = screen.getAllByTestId('card')[0];
      fireEvent.click(localCard);

      const resolveButton = screen.getByText('Resolve Conflict');
      expect(resolveButton).not.toBeDisabled();

      fireEvent.click(resolveButton);

      await waitFor(() => {
        expect(mockOnResolve).toHaveBeenCalledWith({
          conflictId: 'conflict-1',
          strategy: 'keep_local',
          resolvedData: mockHabit,
          timestamp: expect.any(Date),
        });
      });
    });

    it('should allow selecting server version', async () => {
      render(
        <ConflictResolutionModal
          isOpen={true}
          onClose={mockOnClose}
          conflict={mockHabitConflict}
          onResolve={mockOnResolve}
        />,
      );

      const serverCard = screen.getAllByTestId('card')[1];
      fireEvent.click(serverCard);

      const resolveButton = screen.getByText('Resolve Conflict');
      fireEvent.click(resolveButton);

      await waitFor(() => {
        expect(mockOnResolve).toHaveBeenCalledWith({
          conflictId: 'conflict-1',
          strategy: 'keep_server',
          resolvedData: mockHabitConflict.serverData,
          timestamp: expect.any(Date),
        });
      });
    });

    it('should disable resolve button when no version is selected', () => {
      render(
        <ConflictResolutionModal
          isOpen={true}
          onClose={mockOnClose}
          conflict={mockHabitConflict}
          onResolve={mockOnResolve}
        />,
      );

      const resolveButton = screen.getByText('Resolve Conflict');
      expect(resolveButton).toBeDisabled();
    });

    it('should show loading state during resolution', async () => {
      const slowResolve = vi.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      render(
        <ConflictResolutionModal
          isOpen={true}
          onClose={mockOnClose}
          conflict={mockHabitConflict}
          onResolve={slowResolve}
        />,
      );

      const localCard = screen.getAllByTestId('card')[0];
      fireEvent.click(localCard);

      const resolveButton = screen.getByText('Resolve Conflict');
      fireEvent.click(resolveButton);

      expect(screen.getByText('Resolving...')).toBeInTheDocument();

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should handle resolution errors gracefully', async () => {
      const failingResolve = vi
        .fn()
        .mockRejectedValue(new Error('Resolution failed'));

      render(
        <ConflictResolutionModal
          isOpen={true}
          onClose={mockOnClose}
          conflict={mockHabitConflict}
          onResolve={failingResolve}
        />,
      );

      const localCard = screen.getAllByTestId('card')[0];
      fireEvent.click(localCard);

      const resolveButton = screen.getByText('Resolve Conflict');
      fireEvent.click(resolveButton);

      await waitFor(() => {
        expect(failingResolve).toHaveBeenCalled();
        // Modal should not close on error
        expect(mockOnClose).not.toHaveBeenCalled();
      });
    });
  });

  describe('ConflictResolutionProvider', () => {
    function TestComponent() {
      const {
        activeConflicts,
        presentConflict,
        resolveConflict,
        dismissConflict,
      } = useConflictResolution();

      return (
        <div>
          <div data-testid="conflict-count">{activeConflicts.length}</div>
          <button
            data-testid="present-conflict"
            onClick={() => presentConflict(mockHabitConflict)}
          >
            Present Conflict
          </button>
          <button
            data-testid="resolve-conflict"
            onClick={() =>
              resolveConflict({
                conflictId: 'conflict-1',
                strategy: 'keep_local',
                resolvedData: mockHabit,
                timestamp: new Date(),
              })
            }
          >
            Resolve
          </button>
          <button
            data-testid="dismiss-conflict"
            onClick={() => dismissConflict('conflict-1')}
          >
            Dismiss
          </button>
        </div>
      );
    }

    it('should manage conflict state correctly', async () => {
      const mockResolve = vi.fn().mockResolvedValue(undefined);

      render(
        <ConflictResolutionProvider onResolveConflict={mockResolve}>
          <TestComponent />
        </ConflictResolutionProvider>,
      );

      expect(screen.getByTestId('conflict-count')).toHaveTextContent('0');

      // Present a conflict
      fireEvent.click(screen.getByTestId('present-conflict'));
      expect(screen.getByTestId('conflict-count')).toHaveTextContent('1');

      // Resolve the conflict
      fireEvent.click(screen.getByTestId('resolve-conflict'));

      await waitFor(() => {
        expect(mockResolve).toHaveBeenCalled();
        expect(screen.getByTestId('conflict-count')).toHaveTextContent('0');
      });
    });

    it('should handle conflict dismissal', () => {
      render(
        <ConflictResolutionProvider>
          <TestComponent />
        </ConflictResolutionProvider>,
      );

      // Present a conflict
      fireEvent.click(screen.getByTestId('present-conflict'));
      expect(screen.getByTestId('conflict-count')).toHaveTextContent('1');

      // Dismiss the conflict
      fireEvent.click(screen.getByTestId('dismiss-conflict'));
      expect(screen.getByTestId('conflict-count')).toHaveTextContent('0');
    });

    it('should show modal when conflict is presented', () => {
      render(
        <ConflictResolutionProvider>
          <TestComponent />
        </ConflictResolutionProvider>,
      );

      // Present a conflict
      fireEvent.click(screen.getByTestId('present-conflict'));

      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByText('Habit Update Conflict')).toBeInTheDocument();
    });
  });

  describe('ConflictsIndicator', () => {
    function TestWrapper({ children }: { children: React.ReactNode }) {
      return (
        <ConflictResolutionProvider>{children}</ConflictResolutionProvider>
      );
    }

    function ConflictTestHelper() {
      const { presentConflict } = useConflictResolution();

      return (
        <>
          <ConflictsIndicator />
          <button
            data-testid="add-conflict"
            onClick={() => presentConflict(mockHabitConflict)}
          >
            Add Conflict
          </button>
        </>
      );
    }

    it('should not render when there are no conflicts', () => {
      render(
        <TestWrapper>
          <ConflictsIndicator />
        </TestWrapper>,
      );

      expect(screen.queryByText('Conflicts')).not.toBeInTheDocument();
    });

    it('should render conflict indicator when conflicts exist', () => {
      render(
        <TestWrapper>
          <ConflictTestHelper />
        </TestWrapper>,
      );

      fireEvent.click(screen.getByTestId('add-conflict'));

      expect(screen.getByText('Conflicts')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should show correct conflict count', () => {
      render(
        <TestWrapper>
          <ConflictTestHelper />
        </TestWrapper>,
      );

      // Add first conflict
      fireEvent.click(screen.getByTestId('add-conflict'));
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should display conflict details in popover', () => {
      render(
        <TestWrapper>
          <ConflictTestHelper />
        </TestWrapper>,
      );

      fireEvent.click(screen.getByTestId('add-conflict'));

      expect(screen.getByText('Data Conflicts')).toBeInTheDocument();
      expect(screen.getByText('Exercise')).toBeInTheDocument();
      expect(screen.getByText('Habit Update')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should integrate all components correctly', async () => {
      function IntegratedTest() {
        const { presentConflict } = useConflictResolution();

        return (
          <div>
            <ConflictsIndicator />
            <button
              data-testid="add-conflicts"
              onClick={() => {
                presentConflict(mockHabitConflict);
                presentConflict(mockEntryConflict);
              }}
            >
              Add Conflicts
            </button>
          </div>
        );
      }

      const mockResolve = vi.fn().mockResolvedValue(undefined);

      render(
        <ConflictResolutionProvider onResolveConflict={mockResolve}>
          <IntegratedTest />
        </ConflictResolutionProvider>,
      );

      // Add conflicts
      fireEvent.click(screen.getByTestId('add-conflicts'));

      // Check indicator shows conflicts
      expect(screen.getByText('2')).toBeInTheDocument();

      // Modal should be open for the first conflict
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByText('Habit Update Conflict')).toBeInTheDocument();

      // Resolve the current conflict
      const localCard = screen.getAllByTestId('card')[0];
      fireEvent.click(localCard);

      const resolveButton = screen.getByText('Resolve Conflict');
      fireEvent.click(resolveButton);

      await waitFor(() => {
        expect(mockResolve).toHaveBeenCalled();
        // Should show next conflict
        expect(screen.getByText('1')).toBeInTheDocument();
      });
    });
  });
});
