// Conflict resolution modal for handling data conflicts during sync
// Provides side-by-side comparison and user choice interface for resolving conflicts

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/components/ui/dialog';
import { Button } from '@shared/components/ui/button';
import { Badge } from '@shared/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/components/ui/card';
import { Separator } from '@shared/components/ui/separator';
import {
  Clock,
  Server,
  Smartphone,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react';
import { OfflineHabit, HabitEntry, ConflictData } from '../types';

// Define resolution type locally since it's not in the main types
interface ConflictResolution {
  conflictId: string;
  strategy: 'keep_local' | 'keep_server' | 'manual';
  resolvedData?: OfflineHabit | HabitEntry;
  timestamp: Date;
}

export interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflict: ConflictData;
  onResolve: (resolution: ConflictResolution) => Promise<void>;
}

export function ConflictResolutionModal({
  isOpen,
  onClose,
  conflict,
  onResolve,
}: ConflictResolutionModalProps) {
  const [selectedVersion, setSelectedVersion] = useState<
    'local' | 'server' | 'custom' | null
  >(null);
  const [isResolving, setIsResolving] = useState(false);

  const handleResolve = async () => {
    if (!selectedVersion) return;

    setIsResolving(true);
    try {
      const resolution: ConflictResolution = {
        conflictId: conflict.id,
        strategy:
          selectedVersion === 'custom'
            ? 'manual'
            : selectedVersion === 'local'
              ? 'keep_local'
              : 'keep_server',
        resolvedData:
          selectedVersion === 'local'
            ? (conflict.localData as OfflineHabit | HabitEntry)
            : (conflict.serverData as OfflineHabit | HabitEntry),
        timestamp: new Date(),
      };

      await onResolve(resolution);
      onClose();
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    } finally {
      setIsResolving(false);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(timestamp);
  };

  const renderConflictTitle = () => {
    switch (conflict.entityType) {
      case 'HABIT':
        return 'Habit Update Conflict';
      case 'HABIT_ENTRY':
        return 'Habit Entry Conflict';
      default:
        return 'Data Conflict';
    }
  };

  const renderConflictDescription = () => {
    const entityName =
      conflict.entityType === 'HABIT'
        ? (conflict.localData as OfflineHabit)?.name || 'Unknown Habit'
        : `Entry for ${formatTimestamp(new Date((conflict.localData as HabitEntry)?.date || Date.now()))}`;

    return `Changes were made to "${entityName}" both locally and on the server. Please choose which version to keep.`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <DialogTitle>{renderConflictTitle()}</DialogTitle>
          </div>
          <DialogDescription>{renderConflictDescription()}</DialogDescription>
        </DialogHeader>

        <div className="my-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Local Version */}
          <Card
            className={`cursor-pointer transition-all ${
              selectedVersion === 'local'
                ? 'ring-primary bg-primary/5 ring-2'
                : 'hover:shadow-md'
            }`}
          >
            <CardHeader onClick={() => setSelectedVersion('local')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-blue-500" />
                  <CardTitle className="text-sm">Local Version</CardTitle>
                </div>
                {selectedVersion === 'local' && (
                  <Check className="text-primary h-4 w-4" />
                )}
              </div>
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Modified: {formatTimestamp(conflict.timestamp)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConflictDataComparison
                data={conflict.localData as OfflineHabit | HabitEntry}
                entityType={
                  conflict.entityType === 'HABIT' ? 'habit' : 'habitEntry'
                }
                isSelected={selectedVersion === 'local'}
              />
            </CardContent>
          </Card>

          {/* Server Version */}
          <Card
            className={`cursor-pointer transition-all ${
              selectedVersion === 'server'
                ? 'ring-primary bg-primary/5 ring-2'
                : 'hover:shadow-md'
            }`}
          >
            <CardHeader onClick={() => setSelectedVersion('server')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-green-500" />
                  <CardTitle className="text-sm">Server Version</CardTitle>
                </div>
                {selectedVersion === 'server' && (
                  <Check className="text-primary h-4 w-4" />
                )}
              </div>
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Modified: {formatTimestamp(conflict.timestamp)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConflictDataComparison
                data={conflict.serverData as OfflineHabit | HabitEntry}
                entityType={
                  conflict.entityType === 'HABIT' ? 'habit' : 'habitEntry'
                }
                isSelected={selectedVersion === 'server'}
              />
            </CardContent>
          </Card>
        </div>

        <Separator />

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isResolving}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleResolve()}
            disabled={!selectedVersion || isResolving}
            className="flex items-center gap-2"
          >
            {isResolving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Resolving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Resolve Conflict
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ConflictDataComparisonProps {
  data: OfflineHabit | HabitEntry;
  entityType: 'habit' | 'habitEntry';
  isSelected: boolean;
}

function ConflictDataComparison({
  data,
  entityType,
}: ConflictDataComparisonProps) {
  if (entityType === 'habit') {
    const habit = data as OfflineHabit;
    return (
      <div className="space-y-3">
        <div>
          <label className="text-muted-foreground text-xs font-medium">
            Name
          </label>
          <p className="text-sm font-medium">{habit.name}</p>
        </div>

        <div>
          <label className="text-muted-foreground text-xs font-medium">
            Icon
          </label>
          <p className="text-sm">{habit.icon}</p>
        </div>

        <div>
          <label className="text-muted-foreground text-xs font-medium">
            Frequency
          </label>
          <div className="mt-1 flex flex-wrap gap-1">
            {habit.frequency?.map((day, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][Number(day)]}
              </Badge>
            )) || (
              <span className="text-muted-foreground text-xs">
                No frequency set
              </span>
            )}
          </div>
        </div>

        {habit.startDate && (
          <div>
            <label className="text-muted-foreground text-xs font-medium">
              Start Date
            </label>
            <p className="text-sm">
              {formatTimestamp(new Date(habit.startDate))}
            </p>
          </div>
        )}

        {habit.endDate && (
          <div>
            <label className="text-muted-foreground text-xs font-medium">
              End Date
            </label>
            <p className="text-sm">
              {formatTimestamp(new Date(habit.endDate))}
            </p>
          </div>
        )}

        <div className="border-t pt-2">
          <div className="text-muted-foreground flex justify-between text-xs">
            <span>Version: {habit.version}</span>
            <span>Synced: {habit.synced ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>
    );
  } else {
    const entry = data as HabitEntry;
    return (
      <div className="space-y-3">
        <div>
          <label className="text-muted-foreground text-xs font-medium">
            Date
          </label>
          <p className="text-sm font-medium">
            {formatTimestamp(new Date(entry.date))}
          </p>
        </div>

        <div>
          <label className="text-muted-foreground text-xs font-medium">
            Status
          </label>
          <div className="mt-1 flex items-center gap-2">
            {entry.completed ? (
              <Badge variant="default" className="text-xs">
                <Check className="mr-1 h-3 w-3" />
                Completed
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                <X className="mr-1 h-3 w-3" />
                Not Completed
              </Badge>
            )}
          </div>
        </div>

        <div className="border-t pt-2">
          <div className="text-muted-foreground flex justify-between text-xs">
            <span>Version: {entry.version}</span>
            <span>Synced: {entry.synced ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>
    );
  }
}

function formatTimestamp(timestamp: Date) {
  // Handle invalid dates gracefully
  if (
    !timestamp ||
    !(timestamp instanceof Date) ||
    isNaN(timestamp.getTime())
  ) {
    return 'Invalid date';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(timestamp);
}
