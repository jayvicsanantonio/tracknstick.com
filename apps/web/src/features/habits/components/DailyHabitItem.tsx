// One daily habit circle on the Tracker.
// Tap toggles completion immediately with spring physics and unclipped star burst;
// long-press (~450ms) opens an iOS quick-action menu to Edit or View Stats right from Today.

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Pencil } from 'lucide-react';
import HabitsIcons from '@/icons/habits';
import MiscellaneousIcons from '@/icons/miscellaneous';
import StarAnimation from '@shared/components/ui/animations/StarAnimation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@shared/components/ui/dialog';
import { Habit } from '@/features/habits/types/Habit';
import { frequencyLabel } from '@shared/utils/frequencyLabel';
import { useHabits } from '@/features/habits/hooks/useHabits';
import { useHabitsContext } from '@/features/habits/hooks/useHabitsContext';
import { triggerHaptic } from '@shared/utils/haptics';
import { IOS_SPRING_TAP } from '@shared/utils/motion';

const { Check } = MiscellaneousIcons;

const LONG_PRESS_MS = 450;

interface DailyHabitItemProps {
  habit: Habit;
}

const DailyHabitItem = memo(function DailyHabitItem({
  habit,
}: DailyHabitItemProps) {
  const { toggleHabit, animatingHabitId } = useHabits();
  const { openEditDialog } = useHabitsContext();
  const Icon = HabitsIcons[habit.icon];

  const [menuOpen, setMenuOpen] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);
  const startPoint = useRef<{ x: number; y: number } | null>(null);

  const clearTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      longPressed.current = false;
      startPoint.current = { x: event.clientX, y: event.clientY };
      clearTimer();
      longPressTimer.current = setTimeout(() => {
        longPressed.current = true;
        triggerHaptic('medium');
        setMenuOpen(true);
      }, LONG_PRESS_MS);
    },
    [clearTimer],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!startPoint.current || !longPressTimer.current) return;
      const dx = Math.abs(event.clientX - startPoint.current.x);
      const dy = Math.abs(event.clientY - startPoint.current.y);
      if (dx > 10 || dy > 10) {
        clearTimer();
      }
    },
    [clearTimer],
  );

  const handlePointerEnd = useCallback(() => {
    clearTimer();
    startPoint.current = null;
  }, [clearTimer]);

  const handleToggle = useCallback(() => {
    if (longPressed.current) {
      longPressed.current = false;
      return;
    }
    toggleHabit(habit.id).catch((error) => {
      console.error('Failed to toggle habit:', error);
    });
  }, [habit.id, toggleHabit]);

  return (
    <div
      key={habit.id}
      data-habit-item
      className="group flex flex-col items-center"
    >
      <div className="relative mb-2.5 sm:mb-3">
        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onContextMenu={(event) => {
            // Suppress browser context menu on mobile long-press so the iOS menu takes over cleanly.
            if (window.matchMedia?.('(pointer: coarse)').matches) {
              event.preventDefault();
            }
          }}
          className={`relative flex h-17 w-17 cursor-pointer items-center justify-center overflow-hidden rounded-full p-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_6px_18px_rgba(0,0,0,0.06)] ring-1 outline-none ring-inset focus-visible:ring-[3px] focus-visible:ring-(--color-ring) sm:h-24 sm:w-24 sm:backdrop-blur-xl sm:backdrop-saturate-150 md:h-28 md:w-28 ${
            habit.completed
              ? 'bg-(--color-brand-primary) ring-(--color-brand-primary)'
              : 'bg-(--color-card) ring-(--color-border-primary)/60 sm:bg-(--color-surface)/60 sm:ring-(--color-border-primary)/40 dark:bg-(--color-surface-secondary) dark:sm:bg-(--color-surface-secondary)/40'
          } transition-[transform,background-color] duration-150 hover:-translate-y-1 hover:scale-105 active:scale-92 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100`}
          onClick={handleToggle}
          aria-pressed={habit.completed}
          aria-label={
            habit.completed
              ? `Mark ${habit.name} as incomplete`
              : `Mark ${habit.name} as complete`
          }
        >
          <Icon
            aria-hidden="true"
            className={`relative z-10 h-8 w-8 transition-transform duration-150 sm:h-12 sm:w-12 md:h-14 md:w-14 ${
              habit.completed
                ? 'scale-105 text-(--color-primary-foreground)'
                : 'text-(--color-brand-primary)'
            }`}
          />
        </button>

        {/* Rendered outside the overflow-hidden button so the celebration burst flies freely. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <StarAnimation isVisible={animatingHabitId === habit.id} />
        </div>

        {/* Outside the button, whose clipping would cut the badge off. */}
        {habit.completed ? (
          <motion.span
            aria-hidden="true"
            data-completed-badge
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={IOS_SPRING_TAP}
            className="pointer-events-none absolute -top-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-(--color-card) text-(--color-brand-primary) shadow-md ring-2 ring-(--color-brand-primary) sm:h-7 sm:w-7"
          >
            <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={3} />
          </motion.span>
        ) : null}
      </div>
      <span className="line-clamp-2 max-w-full px-1 text-center text-[13px] leading-snug font-semibold text-(--color-brand-tertiary) sm:text-sm dark:text-(--color-brand-text-light)">
        {habit.name}
      </span>
      <span className="mt-0.5 text-[11px] text-(--color-brand-text) sm:text-xs dark:text-(--color-brand-text-light)">
        {frequencyLabel(habit.frequency)}
      </span>

      {/* Native iOS Quick Action Sheet triggered by long-pressing a habit circle */}
      {menuOpen ? (
        <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
          <DialogContent className="top-auto right-3 bottom-[max(env(safe-area-inset-bottom),0.75rem)] left-3 max-w-md translate-x-0 translate-y-0 gap-2 border-0 bg-transparent p-0 shadow-none sm:top-1/2 sm:right-auto sm:bottom-auto sm:left-1/2 sm:w-80 sm:-translate-x-1/2 sm:-translate-y-1/2 [&>button:last-child]:hidden [&>button[data-slot='dialog-close']]:hidden">
            <div className="ios-liquid-glass overflow-hidden rounded-3xl">
              <div className="flex items-center gap-3 border-b border-(--color-border-primary)/50 px-4 py-3.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-(--color-brand-primary)/15 text-(--color-brand-primary)">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <div className="min-w-0 text-left">
                  <DialogTitle className="truncate text-[16px] font-semibold text-(--color-foreground)">
                    {habit.name}
                  </DialogTitle>
                  <DialogDescription className="text-[13px] text-(--color-text-secondary)">
                    {frequencyLabel(habit.frequency)}
                  </DialogDescription>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setMenuOpen(false);
                  openEditDialog(habit, 'edit');
                }}
                className="flex min-h-13 w-full items-center justify-center gap-2 border-b border-(--color-border-primary)/50 px-4 text-[17px] font-medium text-(--color-brand-primary) transition-colors active:bg-(--color-active-surface)/50"
              >
                <Pencil aria-hidden="true" className="size-4" />
                Edit Habit
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setMenuOpen(false);
                  openEditDialog(habit, 'stats');
                }}
                className="flex min-h-13 w-full items-center justify-center gap-2 px-4 text-[17px] font-medium text-(--color-foreground) transition-colors active:bg-(--color-active-surface)/50"
              >
                <BarChart3 aria-hidden="true" className="size-4" />
                View Stats
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setMenuOpen(false);
              }}
              className="ios-liquid-glass flex min-h-13 w-full items-center justify-center rounded-3xl text-[17px] font-semibold text-(--color-brand-primary) active:scale-[0.98]"
            >
              Cancel
            </button>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
});

export default DailyHabitItem;
