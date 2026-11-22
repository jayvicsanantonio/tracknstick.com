// One row inside the mobile Habits Inset Grouped List.
// Tap the row to open Edit/Stats; swipe left to reveal the destructive Delete action
// with spring snap physics and tactile haptic feedback.

import { memo, useState } from 'react';
import { motion, type PanInfo } from 'framer-motion';
import { ChevronRight, Trash2 } from 'lucide-react';
import HabitsIcons from '@/icons/habits';
import { Habit } from '@/features/habits/types/Habit';
import { isArchived } from '@/features/habits/components/habitFilters';
import { triggerHaptic } from '@shared/utils/haptics';
import { IOS_SPRING_CONTROL } from '@shared/utils/motion';
import { cn } from '@shared/utils/utils';

const REVEAL_WIDTH = 84;

interface SwipeableHabitRowProps {
  habit: Habit;
  frequencyLabelText: string;
  startDateText: string;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
}

const SwipeableHabitRow = memo(function SwipeableHabitRow({
  habit,
  frequencyLabelText,
  startDateText,
  onEdit,
  onDelete,
}: SwipeableHabitRowProps) {
  const Icon = HabitsIcons[habit.icon];
  const archived = isArchived(habit);
  const [isRevealed, setIsRevealed] = useState(false);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const shouldReveal = info.offset.x < -36 || info.velocity.x < -300;
    if (shouldReveal !== isRevealed) {
      triggerHaptic('selection');
    }
    setIsRevealed(shouldReveal);
  };

  return (
    <li className="relative overflow-hidden">
      {/* Revealed trailing red Delete action (kept in DOM for screen readers & keyboard) */}
      <div className="absolute inset-y-0 right-0 flex w-[84px] items-stretch justify-end bg-(--color-destructive)">
        <button
          type="button"
          aria-label={`Delete ${habit.name}`}
          onClick={() => {
            triggerHaptic('medium');
            setIsRevealed(false);
            onDelete(habit);
          }}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 text-(--color-destructive-foreground) focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none active:opacity-80"
        >
          <Trash2 aria-hidden="true" className="size-4" />
          <span className="text-[11px] font-semibold">Delete</span>
        </button>
      </div>

      {/* Foreground swipeable grouped row */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -REVEAL_WIDTH, right: 0 }}
        dragElastic={{ left: 0.14, right: 0.06 }}
        animate={{ x: isRevealed ? -REVEAL_WIDTH : 0 }}
        transition={IOS_SPRING_CONTROL}
        onDragEnd={handleDragEnd}
        className="relative z-10 bg-(--color-card) dark:bg-(--color-surface-secondary)"
      >
        <button
          type="button"
          aria-label={`Edit ${habit.name}`}
          onClick={() => {
            if (isRevealed) {
              setIsRevealed(false);
              return;
            }
            triggerHaptic('light');
            onEdit(habit);
          }}
          className="flex min-h-[68px] w-full items-center gap-3 px-4 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:outline-none focus-visible:ring-inset active:bg-(--color-active-surface)/45"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-(--color-brand-primary)/12 text-(--color-brand-primary)">
            <Icon aria-hidden="true" className="size-5" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="truncate text-[16px] leading-snug font-semibold text-(--color-foreground)">
                {habit.name}
              </span>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium',
                  archived
                    ? 'bg-(--color-muted) text-(--color-text-secondary)'
                    : 'bg-(--color-brand-primary)/12 text-(--color-brand-text) dark:text-(--color-brand-text-light)',
                )}
              >
                {archived ? 'Archived' : 'Active'}
              </span>
            </span>
            <span className="mt-0.5 flex items-center gap-1.5 text-[13px] text-(--color-text-secondary)">
              <span className="truncate">{frequencyLabelText}</span>
              <span aria-hidden="true">·</span>
              <span className="shrink-0 tabular-nums">
                Since {startDateText}
              </span>
            </span>
          </span>

          <ChevronRight
            aria-hidden="true"
            className="size-4 shrink-0 text-(--color-text-secondary)/60"
          />
        </button>
      </motion.div>
    </li>
  );
});

export default SwipeableHabitRow;
