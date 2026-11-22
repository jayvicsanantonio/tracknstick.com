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
    <li className="relative overflow-hidden rounded-[20px]">
      {/* Revealed trailing red Delete action (inset 1px to prevent Retina corner bleed at rest,
          while kept mounted in DOM for screen readers & keyboard access) */}
      <div className="absolute inset-y-[1px] right-[1px] flex w-[84px] items-stretch justify-end rounded-r-[19px] bg-(--color-destructive)">
        <button
          type="button"
          aria-label={`Delete ${habit.name}`}
          onClick={() => {
            triggerHaptic('medium');
            setIsRevealed(false);
            onDelete(habit);
          }}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-r-[19px] text-(--color-destructive-foreground) focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none active:opacity-80"
        >
          <Trash2 aria-hidden="true" className="size-4" />
          <span className="text-[11px] font-semibold">Delete</span>
        </button>
      </div>

      {/* Foreground swipeable tactile card matching the Tracker habit cards */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -REVEAL_WIDTH, right: 0 }}
        dragElastic={{ left: 0.14, right: 0.06 }}
        animate={{ x: isRevealed ? -REVEAL_WIDTH : 0 }}
        transition={IOS_SPRING_CONTROL}
        onDragEnd={handleDragEnd}
        className="ios-tracker-card relative z-10 overflow-hidden rounded-[20px]"
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
          className="flex min-h-[72px] w-full cursor-pointer items-center gap-3.5 px-3.5 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:outline-none focus-visible:ring-inset active:bg-(--color-brand-primary)/8"
        >
          <span
            className={cn(
              'flex size-12 shrink-0 items-center justify-center rounded-[15px] ring-1 ring-inset',
              archived
                ? 'bg-(--color-text-secondary)/12 text-(--color-text-secondary) ring-(--color-border-primary)/45'
                : 'bg-(--color-brand-primary)/14 text-(--color-brand-primary) ring-(--color-brand-primary)/24',
            )}
          >
            <Icon aria-hidden="true" className="size-6" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  'truncate text-[16px] leading-snug font-semibold tracking-[-0.01em]',
                  archived
                    ? 'text-(--color-foreground)/75'
                    : 'text-(--color-foreground)',
                )}
              >
                {habit.name}
              </span>
              <span
                className={cn(
                  'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px]',
                  archived
                    ? 'bg-(--color-text-secondary)/12 font-medium text-(--color-text-secondary)'
                    : 'bg-(--color-brand-primary)/14 font-semibold text-(--color-brand-text) ring-1 ring-(--color-brand-primary)/20 ring-inset dark:text-(--color-brand-text-light)',
                )}
              >
                {!archived ? (
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-(--color-brand-primary)"
                  />
                ) : null}
                {archived ? 'Archived' : 'Active'}
              </span>
            </span>
            <span className="mt-0.5 flex items-center gap-1.5 text-[13px] leading-tight text-(--color-text-secondary)">
              <span className="truncate">{frequencyLabelText}</span>
              <span aria-hidden="true" className="opacity-50">
                ·
              </span>
              <span className="shrink-0 tabular-nums">
                Since {startDateText}
              </span>
            </span>
          </span>

          <ChevronRight
            aria-hidden="true"
            className={cn(
              'size-4 shrink-0',
              archived
                ? 'text-(--color-text-secondary)/50'
                : 'text-(--color-brand-primary)/60',
            )}
          />
        </button>
      </motion.div>
    </li>
  );
});

export default SwipeableHabitRow;
