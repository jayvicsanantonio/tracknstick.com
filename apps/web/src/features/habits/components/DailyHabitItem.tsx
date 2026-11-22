// One daily habit circle on the Tracker.
// Tap toggles completion immediately with spring physics and unclipped star burst;
// long-press (~450ms) opens an iOS quick-action menu to Edit or View Stats right from Today.

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { motion, type PanInfo } from 'framer-motion';
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
        {/* Circular medallion orb (sculpted watch-dial medallion on mobile; classic glass orb on sm+) */}
        <span className="relative mb-2.5 shrink-0 sm:mb-3">
          <span
            className={cn(
              'relative flex size-20 items-center justify-center overflow-hidden rounded-full transition-[transform,background-color,box-shadow,border-color] duration-200 motion-reduce:transition-none max-sm:group-focus-visible/habit-btn:ring-[3px] max-sm:group-focus-visible/habit-btn:ring-(--color-ring) max-sm:group-focus-visible/habit-btn:ring-offset-2 max-sm:group-focus-visible/habit-btn:ring-offset-(--color-background) max-sm:group-active/habit-btn:scale-92 sm:h-24 sm:w-24 sm:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_6px_18px_rgba(0,0,0,0.06)] sm:ring-1 sm:backdrop-blur-xl sm:backdrop-saturate-150 sm:ring-inset sm:group-hover/habit-btn:-translate-y-1 sm:group-hover/habit-btn:scale-105 sm:group-focus-visible/habit-btn:ring-[3px] sm:group-focus-visible/habit-btn:ring-(--color-ring) sm:group-active/habit-btn:scale-92 sm:motion-reduce:group-hover/habit-btn:translate-y-0 sm:motion-reduce:group-hover/habit-btn:scale-100 md:h-28 md:w-28',
              habit.completed
                ? 'ios-habit-orb-done sm:bg-(--color-brand-primary) sm:ring-(--color-brand-primary)'
                : 'ios-habit-orb sm:bg-(--color-surface)/60 sm:ring-(--color-border-primary)/40 dark:sm:bg-(--color-surface-secondary)/40',
            )}
          >
            {/* Inner concentric horological bezel ring on mobile */}
            <span
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute inset-[5px] rounded-full border transition-colors duration-200 sm:hidden',
                habit.completed
                  ? 'border-white/30'
                  : 'border-dashed border-(--color-brand-primary)/25 dark:border-(--color-brand-primary)/28',
              )}
            />

            <Icon
              aria-hidden="true"
              className={cn(
                'relative z-10 size-8 transition-transform duration-200 sm:h-12 sm:w-12 md:h-14 md:w-14',
                habit.completed
                  ? 'scale-105 text-(--color-primary-foreground)'
                  : 'text-(--color-brand-primary)',
              )}
            />
          </span>

          {/* Floating spring checkmark seal (outside overflow-hidden orb on mobile & desktop) */}
          {habit.completed ? (
            <motion.span
              aria-hidden="true"
              data-completed-badge
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={IOS_SPRING_TAP}
              className="pointer-events-none absolute -top-0.5 -right-0.5 flex size-6 items-center justify-center rounded-full bg-(--color-card) text-(--color-brand-primary) shadow-md ring-2 ring-(--color-brand-primary) sm:h-7 sm:w-7"
            >
              <Check className="size-3.5 sm:h-4 sm:w-4" strokeWidth={3.2} />
            </motion.span>
          ) : null}
        </span>

        {/* Centered habit title & schedule beneath the orb */}
        <span className="flex w-full min-w-0 flex-col items-center">
          <span
            className={cn(
              'line-clamp-2 max-w-full px-0.5 text-center text-[13px] leading-[1.25] font-semibold tracking-[-0.01em] transition-colors duration-150 sm:px-1 sm:text-sm sm:text-(--color-brand-tertiary) dark:sm:text-(--color-brand-text-light)',
              habit.completed
                ? 'text-(--color-foreground)'
                : 'text-(--color-foreground)/92',
            )}
          >
            {habit.name}
          </span>
          <span className="mt-0.5 truncate text-[11px] leading-tight font-medium text-(--color-text-secondary)/80 sm:text-xs sm:font-normal sm:text-(--color-brand-text) dark:sm:text-(--color-brand-text-light)">
            {frequencyLabel(habit.frequency)}
          </span>
        </span>
      </button>

      {/* Unclipped celebration star burst centered right over the circular orb */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 flex h-20 items-center justify-center sm:h-24 md:h-28"
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
