// One daily habit circle on the Tracker.
// Tap toggles completion immediately with spring physics and unclipped star burst;
// long-press (~450ms) opens an iOS quick-action menu to Edit or View Stats right from Today.

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
} from 'framer-motion';
import { BarChart3, ChevronRight, Pencil } from 'lucide-react';
import HabitsIcons from '@/icons/habits';
import MiscellaneousIcons from '@/icons/miscellaneous';
import StarAnimation from '@shared/components/ui/animations/StarAnimation';
import { Habit } from '@/features/habits/types/Habit';
import { frequencyLabel } from '@shared/utils/frequencyLabel';
import { useHabits } from '@/features/habits/hooks/useHabits';
import { useHabitsContext } from '@/features/habits/hooks/useHabitsContext';
import { triggerHaptic } from '@shared/utils/haptics';
import { IOS_SPRING_SHEET, IOS_SPRING_TAP } from '@shared/utils/motion';
import { cn } from '@shared/utils/utils';

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
  const prefersReducedMotion = useReducedMotion();
  const Icon = HabitsIcons[habit.icon];

  const [menuOpen, setMenuOpen] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
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
      setIsPressing(true);
      startPoint.current = { x: event.clientX, y: event.clientY };
      clearTimer();
      longPressTimer.current = setTimeout(() => {
        longPressed.current = true;
        setIsPressing(false);
        triggerHaptic('medium');
        setMenuOpen(true);
      }, LONG_PRESS_MS);
    },
    [clearTimer],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!startPoint.current) return;
      const dx = Math.abs(event.clientX - startPoint.current.x);
      const dy = Math.abs(event.clientY - startPoint.current.y);
      if (dx > 10 || dy > 10) {
        clearTimer();
        setIsPressing(false);
      }
    },
    [clearTimer],
  );

  const handlePointerEnd = useCallback(() => {
    clearTimer();
    setIsPressing(false);
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
      className="group relative flex w-full flex-col items-center"
    >
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
        className="group/habit-btn relative flex w-full cursor-pointer flex-col items-center text-center outline-none"
        onClick={handleToggle}
        aria-pressed={habit.completed}
        aria-label={
          habit.completed
            ? `Mark ${habit.name} as incomplete`
            : `Mark ${habit.name} as complete`
        }
      >
        {/* Flat double-ring circular habit medallion across phone, tablet, and desktop */}
        <motion.span
          animate={
            prefersReducedMotion ? undefined : { scale: isPressing ? 0.92 : 1 }
          }
          transition={IOS_SPRING_TAP}
          className="relative mb-2.5 shrink-0 sm:mb-3"
        >
          <span
            className={cn(
              'relative flex size-20 items-center justify-center overflow-hidden rounded-full transition-[transform,background-color,box-shadow,border-color] duration-200 group-focus-visible/habit-btn:ring-[3px] group-focus-visible/habit-btn:ring-(--color-ring) group-focus-visible/habit-btn:ring-offset-2 group-focus-visible/habit-btn:ring-offset-(--color-background) motion-reduce:transition-none sm:size-[88px] sm:group-hover/habit-btn:-translate-y-0.5 sm:group-hover/habit-btn:scale-[1.04] sm:motion-reduce:group-hover/habit-btn:translate-y-0 sm:motion-reduce:group-hover/habit-btn:scale-100 md:size-24',
              habit.completed ? 'ios-habit-orb-done' : 'ios-habit-orb',
            )}
          >
            {/* Inner concentric bezel ring */}
            <span
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute inset-[5px] rounded-full border transition-colors duration-200 sm:inset-[6px]',
                habit.completed
                  ? 'border-white/35'
                  : 'border-dashed border-(--color-brand-primary)/28 dark:border-(--color-brand-primary)/30',
              )}
            />

            <Icon
              aria-hidden="true"
              strokeWidth={2}
              className={cn(
                'relative z-10 size-8 transition-[color,transform] duration-200 sm:size-9 md:size-10',
                habit.completed
                  ? 'scale-105 text-(--color-primary-foreground)'
                  : 'text-(--color-brand-primary)',
              )}
            />
          </span>

          {/* Floating spring checkmark seal */}
          <AnimatePresence initial={false}>
            {habit.completed ? (
              <motion.span
                key="completed-badge"
                aria-hidden="true"
                data-completed-badge
                initial={
                  prefersReducedMotion ? false : { scale: 0.4, opacity: 0 }
                }
                animate={{ scale: 1, opacity: 1 }}
                exit={
                  prefersReducedMotion
                    ? undefined
                    : {
                        scale: 0.5,
                        opacity: 0,
                        transition: { duration: 0.14 },
                      }
                }
                transition={IOS_SPRING_TAP}
                className="pointer-events-none absolute -top-0.5 -right-0.5 flex size-6 items-center justify-center rounded-full bg-(--color-card) text-(--color-brand-primary) shadow-md ring-2 ring-(--color-brand-primary) sm:size-7"
              >
                <Check className="size-3.5 sm:size-4" strokeWidth={3.2} />
              </motion.span>
            ) : null}
          </AnimatePresence>
        </motion.span>

        {/* Centered habit title & schedule beneath the circle */}
        <span className="flex w-full min-w-0 flex-col items-center">
          <span className="line-clamp-2 max-w-full px-0.5 text-center text-[13.5px] leading-[1.25] font-semibold tracking-[-0.01em] text-(--color-foreground) sm:px-1 sm:text-[14px]">
            {habit.name}
          </span>
          <span className="mt-0.5 max-w-full truncate text-[11.5px] leading-tight font-medium text-(--color-text-secondary)/80 sm:text-xs">
            {frequencyLabel(habit.frequency)}
          </span>
        </span>
      </button>

      {/* Unclipped celebration star burst centered right over the circular orb */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 flex h-20 items-center justify-center sm:h-[88px] md:h-24"
      >
        <StarAnimation isVisible={animatingHabitId === habit.id} />
      </div>

      {/* Native iOS Quick Action Sheet triggered by long-pressing a habit card */}
      {menuOpen ? (
        <DialogPrimitive.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
            <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center px-3.5 pb-[max(env(safe-area-inset-bottom),0.875rem)] sm:items-center sm:p-4">
              <DialogPrimitive.Content
                asChild
                onOpenAutoFocus={(event) => {
                  // Prevent Safari/WebKit from drawing a focus ring around the first row on touch long-press.
                  if (window.matchMedia?.('(pointer: coarse)').matches) {
                    event.preventDefault();
                  }
                }}
              >
                <motion.div
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0.04, bottom: 0.45 }}
                  onDragEnd={(
                    _event: MouseEvent | TouchEvent | PointerEvent,
                    info: PanInfo,
                  ) => {
                    if (info.offset.y > 80 || info.velocity.y > 420) {
                      triggerHaptic('light');
                      setMenuOpen(false);
                    }
                  }}
                  initial={{ y: 36, opacity: 0, scale: 0.98 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={IOS_SPRING_SHEET}
                  className="pointer-events-auto flex w-full max-w-[400px] flex-col gap-2.5 outline-none sm:w-96"
                >
                  <div className="ios-action-sheet-surface overflow-hidden rounded-[26px]">
                    {/* Drag grabber pill */}
                    <div
                      aria-hidden="true"
                      className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-(--color-brand-primary)/25 sm:hidden"
                    />

                    {/* Habit summary header */}
                    <div className="flex items-center gap-3.5 border-b border-(--color-brand-primary)/12 px-4 pt-3 pb-3.5 sm:pt-4">
                      <span
                        className={cn(
                          'flex size-12 shrink-0 items-center justify-center rounded-full ring-1 ring-inset',
                          habit.completed
                            ? 'bg-(--color-brand-primary) text-(--color-primary-foreground) ring-(--color-brand-primary)'
                            : 'bg-(--color-brand-primary)/14 text-(--color-brand-primary) ring-(--color-brand-primary)/24',
                        )}
                      >
                        <Icon aria-hidden="true" className="size-6" />
                      </span>
                      <div className="min-w-0 flex-1 text-left">
                        <DialogPrimitive.Title className="truncate text-[17px] leading-snug font-bold tracking-[-0.015em] text-(--color-foreground)">
                          {habit.name}
                        </DialogPrimitive.Title>
                        <DialogPrimitive.Description className="mt-0.5 text-[13px] text-(--color-text-secondary)">
                          {frequencyLabel(habit.frequency)}
                        </DialogPrimitive.Description>
                      </div>
                      <span
                        className={cn(
                          'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold',
                          habit.completed
                            ? 'bg-(--color-brand-primary)/16 text-(--color-brand-text) ring-1 ring-(--color-brand-primary)/26 ring-inset dark:text-(--color-brand-text-light)'
                            : 'bg-(--color-text-secondary)/12 text-(--color-text-secondary)',
                        )}
                      >
                        {habit.completed ? (
                          <>
                            <Check
                              aria-hidden="true"
                              className="size-3 text-(--color-brand-primary)"
                              strokeWidth={3}
                            />
                            Done
                          </>
                        ) : (
                          'To do'
                        )}
                      </span>
                    </div>

                    {/* Tactile left-aligned iOS action rows */}
                    <div className="space-y-1 p-2">
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setMenuOpen(false);
                          openEditDialog(habit, 'edit');
                        }}
                        className="flex w-full cursor-pointer items-center gap-3.5 rounded-[16px] px-3 py-2.5 text-left transition-[background-color,transform] outline-none hover:bg-(--color-brand-primary)/10 focus-visible:ring-2 focus-visible:ring-(--color-ring) active:scale-[0.985] active:bg-(--color-brand-primary)/14"
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-(--color-brand-primary)/14 text-(--color-brand-primary) ring-1 ring-(--color-brand-primary)/22 ring-inset">
                          <Pencil aria-hidden="true" className="size-[18px]" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[16px] leading-snug font-semibold text-(--color-foreground)">
                            Edit Habit
                          </span>
                          <span className="block text-[12px] leading-tight text-(--color-text-secondary)">
                            Name, icon, schedule &amp; dates
                          </span>
                        </span>
                        <ChevronRight
                          aria-hidden="true"
                          className="size-4 shrink-0 text-(--color-brand-primary)/60"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setMenuOpen(false);
                          openEditDialog(habit, 'stats');
                        }}
                        className="flex w-full cursor-pointer items-center gap-3.5 rounded-[16px] px-3 py-2.5 text-left transition-[background-color,transform] outline-none hover:bg-(--color-brand-primary)/10 focus-visible:ring-2 focus-visible:ring-(--color-ring) active:scale-[0.985] active:bg-(--color-brand-primary)/14"
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-(--color-brand-primary)/14 text-(--color-brand-primary) ring-1 ring-(--color-brand-primary)/22 ring-inset">
                          <BarChart3
                            aria-hidden="true"
                            className="size-[18px]"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[16px] leading-snug font-semibold text-(--color-foreground)">
                            View Stats
                          </span>
                          <span className="block text-[12px] leading-tight text-(--color-text-secondary)">
                            Streaks, completion rate &amp; history
                          </span>
                        </span>
                        <ChevronRight
                          aria-hidden="true"
                          className="size-4 shrink-0 text-(--color-brand-primary)/60"
                        />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setMenuOpen(false);
                    }}
                    className="ios-action-sheet-surface flex h-13 w-full cursor-pointer items-center justify-center rounded-[22px] text-[16px] font-semibold text-(--color-brand-primary) transition-transform outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring) active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                </motion.div>
              </DialogPrimitive.Content>
            </div>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      ) : null}
    </div>
  );
});

export default DailyHabitItem;
