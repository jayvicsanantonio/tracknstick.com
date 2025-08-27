// Context provider for managing conflict resolution UI state
// Coordinates between conflict detection, user interaction, and resolution processing

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ConflictData } from '../types';
import { ConflictResolutionModal } from './ConflictResolutionModal';
import { useToast } from '@shared/hooks/use-toast';
import { getErrorNotification } from '../errors/ErrorNotificationService';
import { OfflineError } from '../errors/OfflineError';

// Define resolution type for conflict handling
interface ConflictResolution {
  conflictId: string;
  strategy: 'keep_local' | 'keep_server' | 'manual';
  resolvedData?: unknown;
  timestamp: Date;
}

export interface ConflictResolutionContextType {
  activeConflicts: ConflictData[];
  currentConflict: ConflictData | null;
  isModalOpen: boolean;
  presentConflict: (conflict: ConflictData) => void;
  resolveConflict: (resolution: ConflictResolution) => Promise<void>;
  dismissConflict: (conflictId: string) => void;
  clearAllConflicts: () => void;
}

const ConflictResolutionContext =
  createContext<ConflictResolutionContextType | null>(null);

export function useConflictResolution() {
  const context = useContext(ConflictResolutionContext);
  if (!context) {
    throw new Error(
      'useConflictResolution must be used within ConflictResolutionProvider',
    );
  }
  return context;
}

interface ConflictResolutionProviderProps {
  children: React.ReactNode;
  onResolveConflict?: (resolution: ConflictResolution) => Promise<void>;
}

export function ConflictResolutionProvider({
  children,
  onResolveConflict,
}: ConflictResolutionProviderProps) {
  const [activeConflicts, setActiveConflicts] = useState<ConflictData[]>([]);
  const [currentConflict, setCurrentConflict] = useState<ConflictData | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  // Present a conflict to the user
  const presentConflict = useCallback(
    (conflict: ConflictData) => {
      setActiveConflicts((prev) => {
        // Check if conflict already exists
        const existingIndex = prev.findIndex((c) => c.id === conflict.id);
        if (existingIndex >= 0) {
          // Update existing conflict
          const updated = [...prev];
          updated[existingIndex] = conflict;
          return updated;
        } else {
          // Add new conflict
          return [...prev, conflict];
        }
      });

      // If no modal is currently open, show this conflict
      if (!isModalOpen && !currentConflict) {
        setCurrentConflict(conflict);
        setIsModalOpen(true);
      }
    },
    [isModalOpen, currentConflict],
  );

  // Resolve a conflict
  const resolveConflict = useCallback(
    async (resolution: ConflictResolution) => {
      try {
        // Call the provided resolution handler
        if (onResolveConflict) {
          await onResolveConflict(resolution);
        }

        // Remove the resolved conflict from active list
        setActiveConflicts((prev) =>
          prev.filter((c) => c.id !== resolution.conflictId),
        );

        // Close modal and show next conflict if any
        setIsModalOpen(false);
        setCurrentConflict(null);

        // Show next conflict if available
        setActiveConflicts((prev) => {
          if (prev.length > 0) {
            const nextConflict = prev[0];
            setTimeout(() => {
              setCurrentConflict(nextConflict);
              setIsModalOpen(true);
            }, 100); // Small delay for better UX
          }
          return prev;
        });

        toast({
          title: '✅ Conflict Resolved',
          description: 'The data conflict has been resolved successfully.',
        });
      } catch (error) {
        console.error('Failed to resolve conflict:', error);

        // Show error notification
        const conflictError = OfflineError.conflict(
          `Failed to resolve conflict: ${error instanceof Error ? error.message : 'Unknown error'}`,
          {
            operation: 'resolveConflict',
            entityId: resolution.conflictId,
            additionalData: { resolution },
          },
          error instanceof Error ? error : undefined,
        );

        const notificationService = getErrorNotification();
        await notificationService.notifyError(conflictError);
      }
    },
    [onResolveConflict, toast],
  );

  // Dismiss a specific conflict without resolving
  const dismissConflict = useCallback(
    (conflictId: string) => {
      setActiveConflicts((prev) => prev.filter((c) => c.id !== conflictId));

      if (currentConflict?.id === conflictId) {
        setIsModalOpen(false);
        setCurrentConflict(null);

        // Show next conflict if available
        setActiveConflicts((prev) => {
          if (prev.length > 0) {
            const nextConflict = prev[0];
            setTimeout(() => {
              setCurrentConflict(nextConflict);
              setIsModalOpen(true);
            }, 100);
          }
          return prev;
        });
      }
    },
    [currentConflict],
  );

  // Clear all conflicts
  const clearAllConflicts = useCallback(() => {
    setActiveConflicts([]);
    setCurrentConflict(null);
    setIsModalOpen(false);
  }, []);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);

    // Show next conflict after a delay if available
    setTimeout(() => {
      const nextConflict = activeConflicts.find(
        (c) => c.id !== currentConflict?.id,
      );
      if (nextConflict) {
        setCurrentConflict(nextConflict);
        setIsModalOpen(true);
      } else {
        setCurrentConflict(null);
      }
    }, 100);
  }, [activeConflicts, currentConflict]);

  const contextValue: ConflictResolutionContextType = {
    activeConflicts,
    currentConflict,
    isModalOpen,
    presentConflict,
    resolveConflict,
    dismissConflict,
    clearAllConflicts,
  };

  return (
    <ConflictResolutionContext.Provider value={contextValue}>
      {children}

      {/* Conflict Resolution Modal */}
      {currentConflict && (
        <ConflictResolutionModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          conflict={currentConflict}
          onResolve={resolveConflict}
        />
      )}
    </ConflictResolutionContext.Provider>
  );
}
