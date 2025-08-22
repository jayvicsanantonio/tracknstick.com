// Component to display sync status and progress
// Shows pending operations, sync progress, and conflict counts with action buttons

import React from 'react';
import { RefreshCw, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { cn } from '@shared/utils/utils';
import { useOffline } from '@app/providers/OfflineContext';
import { useToast } from '@shared/hooks/use-toast';

interface SyncStatusProps {
  className?: string;
  variant?: 'full' | 'compact';
  showActions?: boolean;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({
  className,
  variant = 'compact',
  showActions = true,
}) => {
  const { syncStatus, isOnline, sync, resolveConflicts } = useOffline();
  const { toast } = useToast();

  const handleSync = async () => {
    if (!isOnline) {
      toast({
        variant: 'destructive',
        description: 'Cannot sync while offline. Please check your connection.',
      });
      return;
    }

    try {
      await sync();
      toast({
        description: 'Sync completed successfully.',
      });
    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        variant: 'destructive',
        description: 'Sync failed. Please try again.',
      });
    }
  };

  const handleResolveConflicts = async () => {
    try {
      await resolveConflicts();
      toast({
        description: 'Conflicts resolved successfully.',
      });
    } catch (error) {
      console.error('Conflict resolution failed:', error);
      toast({
        variant: 'destructive',
        description: 'Failed to resolve conflicts. Please try again.',
      });
    }
  };

  const getSyncIcon = () => {
    if (syncStatus.inProgress) {
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    }

    if (syncStatus.conflicts > 0) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }

    if (syncStatus.pendingOperations > 0) {
      return <Clock className="h-4 w-4 text-orange-500" />;
    }

    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  };

  const getSyncStatusText = () => {
    if (syncStatus.inProgress) {
      return 'Syncing...';
    }

    if (syncStatus.conflicts > 0) {
      return `${syncStatus.conflicts} conflict${syncStatus.conflicts > 1 ? 's' : ''}`;
    }

    if (syncStatus.pendingOperations > 0) {
      return `${syncStatus.pendingOperations} pending`;
    }

    return 'Up to date';
  };

  const getStatusColor = () => {
    if (syncStatus.inProgress) return 'text-blue-600 dark:text-blue-400';
    if (syncStatus.conflicts > 0) return 'text-yellow-600 dark:text-yellow-400';
    if (syncStatus.pendingOperations > 0)
      return 'text-orange-600 dark:text-orange-400';
    return 'text-green-600 dark:text-green-400';
  };

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2 text-sm', className)}>
        {getSyncIcon()}
        <span className={getStatusColor()}>{getSyncStatusText()}</span>
        {showActions &&
          (syncStatus.pendingOperations > 0 || syncStatus.conflicts > 0) && (
            <div className="ml-2 flex gap-1">
              {syncStatus.conflicts > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void handleResolveConflicts()}
                  className="h-6 px-2 text-xs"
                >
                  Resolve
                </Button>
              )}
              {syncStatus.pendingOperations > 0 &&
                isOnline &&
                !syncStatus.inProgress && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void handleSync()}
                    className="h-6 px-2 text-xs"
                  >
                    Sync
                  </Button>
                )}
            </div>
          )}
      </div>
    );
  }

  return (
    <Card className={cn('w-full', className)} variant="subtle">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {getSyncIcon()}
          <span className={getStatusColor()}>Sync Status</span>
        </CardTitle>
        {showActions && (
          <CardAction>
            <div className="flex gap-2">
              {syncStatus.conflicts > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void handleResolveConflicts()}
                  disabled={syncStatus.inProgress}
                >
                  Resolve Conflicts
                </Button>
              )}
              {isOnline && !syncStatus.inProgress && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void handleSync()}
                  disabled={syncStatus.pendingOperations === 0}
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Sync Now
                </Button>
              )}
            </div>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-(--color-text-secondary)">Status:</span>
          <span className={getStatusColor()}>{getSyncStatusText()}</span>
        </div>

        {syncStatus.pendingOperations > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-(--color-text-secondary)">Pending:</span>
            <span>
              {syncStatus.pendingOperations} operation
              {syncStatus.pendingOperations > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {syncStatus.conflicts > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-(--color-text-secondary)">Conflicts:</span>
            <span className="text-yellow-600 dark:text-yellow-400">
              {syncStatus.conflicts} require resolution
            </span>
          </div>
        )}

        {syncStatus.lastSync && (
          <div className="flex justify-between text-sm">
            <span className="text-(--color-text-secondary)">Last sync:</span>
            <span>{syncStatus.lastSync.toLocaleString()}</span>
          </div>
        )}

        {syncStatus.lastSyncSuccess && (
          <div className="flex justify-between text-sm">
            <span className="text-(--color-text-secondary)">
              Last successful:
            </span>
            <span className="text-green-600 dark:text-green-400">
              {syncStatus.lastSyncSuccess.toLocaleString()}
            </span>
          </div>
        )}

        {!isOnline && (
          <div className="mt-2 text-sm text-red-600 dark:text-red-400">
            Sync disabled while offline
          </div>
        )}
      </CardContent>
    </Card>
  );
};
