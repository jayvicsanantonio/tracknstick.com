// One habit as a row of the phone's grouped list, as iOS lists work: tap to edit, swipe left to reveal Delete.
// The Delete button sits behind the row, so VoiceOver and keyboards reach it too; focusing it slides the row open.

import { memo, useEffect, useRef } from 'react';
import { animate, motion, useMotionValue, type PanInfo } from 'framer-motion';
import { ChevronRight, Trash2 } from 'lucide-react';
import HabitsIcons from '@/icons/habits';
import { SPRINGS } from '@shared/utils/springs';
import { Habit } from '@/features/habits/types/Habit';

/** How far the row slides to show Delete: the button's width. */
const DELETE_WIDTH = 88;

interface HabitListRowProps {
  habit: Habit;
  /** The second line: how often the habit is due, and since when. */
  detail: string;
  status: string;
  isOpen: boolean;
  onOpenChange: (habit: Habit, open: boolean) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
}

const HabitListRow = memo(function HabitListRow({
  habit,
  detail,
  status,
  isOpen,
  onOpenChange,
  onEdit,
  onDelete,
}: HabitListRowProps) {
  const Icon = HabitsIcons[habit.icon];
  const x = useMotionValue(0);
  // A drag ends with the finger lifting on the row, which the browser also
  // reports as a tap. This tells that tap apart from a real one.
  const justDragged = useRef(false);

  useEffect(() => {
    void animate(x, isOpen ? -DELETE_WIDTH : 0, SPRINGS.snap);
  }, [isOpen, x]);

  const handleDragEnd = (_: unknown, { offset, velocity }: PanInfo) => {
    // Open past half the button's width or on a flick left; shut otherwise.
    const open =
      velocity.x < -400 || (velocity.x <= 400 && offset.x < -DELETE_WIDTH / 2);
    void animate(x, open ? -DELETE_WIDTH : 0, SPRINGS.snap);
    onOpenChange(habit, open);
    setTimeout(() => {
      justDragged.current = false;
    });
  };

  const handleTap = () => {
    if (justDragged.current) return;
    // A tap on an open row shuts it, as in iOS, rather than opening the habit.
    if (isOpen) {
      onOpenChange(habit, false);
      return;
    }
    onEdit(habit);
  };

  return (
    <li className="relative overflow-hidden">
      <button
        type="button"
        onClick={() => onDelete(habit)}
        onFocus={() => onOpenChange(habit, true)}
        aria-label={`Delete ${habit.name}`}
        className="absolute inset-y-0 right-0 flex flex-col items-center justify-center gap-1 bg-(--color-destructive) text-xs font-medium text-(--color-destructive-foreground) outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:ring-inset"
        style={{ width: DELETE_WIDTH }}
      >
        <Trash2 aria-hidden="true" className="size-5" />
        Delete
      </button>
      <motion.div
        drag="x"
        style={{ x }}
        dragConstraints={{ left: -DELETE_WIDTH, right: 0 }}
        dragElastic={{ left: 0.15, right: 0 }}
        dragMomentum={false}
        onDragStart={() => {
          justDragged.current = true;
        }}
        onDragEnd={handleDragEnd}
        className="relative bg-(--color-card)"
      >
        <button
          type="button"
          onClick={handleTap}
          aria-label={`Edit ${habit.name}`}
          className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:ring-inset active:bg-(--color-hover-surface)"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-(--color-brand-primary)/10">
            <Icon
              aria-hidden="true"
              className="size-5 text-(--color-brand-primary)"
            />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-(--color-foreground)">
              {habit.name}
            </span>
            <span className="block truncate text-sm text-(--color-text-secondary)">
              {detail}
            </span>
          </span>
          <span className="shrink-0 text-sm text-(--color-text-secondary)">
            {status}
          </span>
          <ChevronRight
            aria-hidden="true"
            className="size-4 shrink-0 text-(--color-text-secondary)/70"
          />
        </button>
      </motion.div>
    </li>
  );
});

export default HabitListRow;
