// Edit and Delete buttons for one habit, in a row of the habits table.
// The "touch" size gives each button a 44px target for fingers; "compact" fits a table row.

import { memo } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { cn } from '@shared/utils/utils';
import { Habit } from '@/features/habits/types/Habit';

interface HabitActionsProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
  size?: 'compact' | 'touch';
}

const HabitActions = memo(function HabitActions({
  habit,
  onEdit,
  onDelete,
  size = 'compact',
}: HabitActionsProps) {
  const buttonSize = size === 'touch' ? 'size-11' : 'size-7 sm:size-8';
  const iconSize = size === 'touch' ? 'size-5' : 'size-3.5 sm:size-4';

  return (
    <div className="flex items-center justify-end gap-1 sm:gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit(habit)}
        aria-label={`Edit ${habit.name}`}
        className={cn(
          buttonSize,
          'text-(--color-brand-primary) hover:bg-(--color-hover-surface)',
        )}
      >
        <Pencil aria-hidden="true" className={iconSize} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(habit)}
        aria-label={`Delete ${habit.name}`}
        className={cn(
          buttonSize,
          'text-(--color-destructive) hover:bg-(--color-destructive)/10',
        )}
      >
        <Trash2 aria-hidden="true" className={iconSize} />
      </Button>
    </div>
  );
});

export default HabitActions;
