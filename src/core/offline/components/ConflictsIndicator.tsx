// Visual indicator for pending data conflicts
// Shows conflict count and allows users to manage conflict resolution
import { Button } from '@shared/components/ui/button';
import { Badge } from '@shared/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@shared/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shared/components/ui/tooltip';
import { AlertTriangle, X, Eye, Clock } from 'lucide-react';
import { useConflictResolution } from './ConflictResolutionProvider';
import { ConflictData, OfflineHabit, HabitEntry } from '../types';

export function ConflictsIndicator() {
  const {
    activeConflicts,
    presentConflict,
    dismissConflict,
    clearAllConflicts,
  } = useConflictResolution();

  if (activeConflicts.length === 0) {
    return null;
  }

  const formatConflictType = (type: ConflictData['entityType']) => {
    switch (type) {
      case 'HABIT':
        return 'Habit Update';
      case 'HABIT_ENTRY':
        return 'Entry Update';
      default:
        return 'Data';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(timestamp);
  };

  return (
    <TooltipProvider>
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="relative flex items-center gap-2 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
              >
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline">Conflicts</span>
                <Badge
                  variant="secondary"
                  className="bg-amber-200 text-amber-800"
                >
                  {activeConflicts.length}
                </Badge>
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {activeConflicts.length} data conflict
              {activeConflicts.length !== 1 ? 's' : ''} need
              {activeConflicts.length === 1 ? 's' : ''} attention
            </p>
          </TooltipContent>
        </Tooltip>

        <PopoverContent className="w-80 p-0" align="end">
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Data Conflicts</h3>
              {activeConflicts.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllConflicts}
                  className="text-muted-foreground hover:text-destructive text-xs"
                >
                  Clear All
                </Button>
              )}
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              {activeConflicts.length} conflict
              {activeConflicts.length !== 1 ? 's' : ''} require
              {activeConflicts.length === 1 ? 's' : ''} your attention
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {activeConflicts.map((conflict) => {
              const entityName =
                conflict.entityType === 'HABIT'
                  ? ((conflict.localData as OfflineHabit)?.name ??
                    'Unknown Habit')
                  : `Entry ${formatTimestamp(new Date((conflict.localData as HabitEntry)?.date ?? Date.now()))}`;

              return (
                <div
                  key={conflict.id}
                  className="hover:bg-muted/50 border-b p-3 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {formatConflictType(conflict.entityType)}
                        </Badge>
                        <span className="text-muted-foreground flex items-center gap-1 text-xs">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(conflict.timestamp)}
                        </span>
                      </div>

                      <h4
                        className="truncate text-sm font-medium"
                        title={entityName}
                      >
                        {entityName}
                      </h4>

                      <p className="text-muted-foreground mt-1 text-xs">
                        Detected: {formatTimestamp(conflict.timestamp)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => presentConflict(conflict)}
                        className="h-7 w-7 p-0"
                        title="Resolve conflict"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissConflict(conflict.id)}
                        className="text-muted-foreground hover:text-destructive h-7 w-7 p-0"
                        title="Dismiss conflict"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-muted/30 border-t p-3">
            <p className="text-muted-foreground text-xs">
              💡 Tip: Conflicts occur when data is modified both locally and on
              the server. Choose which version to keep.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
