import { useEffect, useMemo, memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { useDate } from '@app/providers/useDate';
import { triggerHaptic } from '@shared/utils/haptics';
import type { DaySwipeDirection } from '@/features/habits/hooks/useDaySwipe';
import MiscellaneousIcons from '@/icons/miscellaneous';

const { ChevronLeft, ChevronRight } = MiscellaneousIcons;

interface DailyHabitDateProps {
  /** Direction of the latest day navigation for subtle directional label glide. */
  transitionDirection?: DaySwipeDirection | null;
}

const DailyHabitDate = memo(function DailyHabitDate({
  transitionDirection = null,
}: DailyHabitDateProps) {
  const prefersReducedMotion = useReducedMotion();
  const {
    date,
    currentDate,
    setDate,
    handlePreviousDate,
    handleNextDate,
    timeZone,
  } = useDate();

  // The month and day, and the year apart from them: a phone leaves out
  // this year's year, so the date sits comfortably between the arrows.
  const { monthDay, year, isThisYear, shortWeekday, dateKey } = useMemo(() => {
    const yearOf = (value: Date) =>
      value.toLocaleDateString('en-US', { timeZone, year: 'numeric' });
    return {
      monthDay: date.toLocaleDateString('en-US', {
        timeZone,
        month: 'short',
        day: 'numeric',
      }),
      year: yearOf(date),
      isThisYear: yearOf(date) === yearOf(currentDate),
      shortWeekday: date.toLocaleDateString('en-US', {
        timeZone,
        weekday: 'short',
      }),
      dateKey: date.toLocaleDateString('en-CA', { timeZone }),
    };
  }, [date, currentDate, timeZone]);

  const isToday = useMemo(
    () => date.toDateString() === currentDate.toDateString(),
    [date, currentDate],
  );

  const dayLabel = useMemo(() => {
    if (isToday) {
      return 'Today';
    }
    return date.toLocaleDateString('en-US', {
      timeZone,
      weekday: 'long',
    });
  }, [date, isToday, timeZone]);

  return (
    <div className="flex flex-col sm:gap-1.5">
      <div className="ios-tracker-card grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-2xl p-1.5 sm:gap-3 sm:rounded-none sm:p-0">
        {/* Keyboard shortcuts for date navigation */}
        <DateHotkeys onPrev={handlePreviousDate} onNext={handleNextDate} />

        <Button
          onClick={() => {
            triggerHaptic('selection');
            handlePreviousDate();
          }}
          variant="ghost"
          size="icon"
          aria-label="Previous Date"
          className="size-9 rounded-xl bg-(--color-brand-primary)/10 text-(--color-brand-primary) hover:bg-(--color-brand-primary)/18 active:scale-92 sm:size-10 sm:rounded-full sm:border sm:border-(--color-border-primary) sm:bg-(--color-card) sm:shadow-sm sm:hover:bg-(--color-hover-surface) sm:hover:shadow-md"
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        </Button>

        <div className="min-w-0 text-center">
          <div className="relative flex items-center justify-center gap-1.5 overflow-hidden sm:flex-row sm:items-baseline sm:gap-2.5 sm:rounded-full sm:border sm:border-(--color-border-primary) sm:bg-(--color-card) sm:px-5 sm:py-1.5 sm:shadow-sm">
            <CalendarDays
              aria-hidden="true"
              className="size-3.5 shrink-0 text-(--color-brand-primary) sm:hidden"
            />
            {/* On phones the Large Title bar directly above displays Today / weekday. */}
            <h2 className="text-xl font-bold tracking-tight text-(--color-foreground) max-sm:sr-only sm:text-2xl">
              {dayLabel}
            </h2>
            {isToday ? (
              <motion.span
                key={`weekday-${dateKey}`}
                aria-hidden="true"
                initial={
                  prefersReducedMotion || !transitionDirection
                    ? false
                    : {
                        opacity: 0.25,
                        x: transitionDirection === 'next' ? 10 : -10,
                      }
                }
                animate={{ opacity: 1, x: 0 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
                }
                className="text-[14px] font-medium whitespace-nowrap text-(--color-text-secondary) sm:hidden"
              >
                {shortWeekday} ·
              </motion.span>
            ) : null}
            <motion.span
              key={dateKey}
              initial={
                prefersReducedMotion || !transitionDirection
                  ? false
                  : {
                      opacity: 0.25,
                      x: transitionDirection === 'next' ? 10 : -10,
                    }
              }
              animate={{ opacity: 1, x: 0 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
              }
              className="text-[15px] font-semibold whitespace-nowrap text-(--color-foreground) tabular-nums sm:text-base sm:font-normal sm:text-(--color-brand-primary)"
            >
              {monthDay}
              <span className={isThisYear ? 'max-sm:hidden' : undefined}>
                , {year}
              </span>
            </motion.span>
          </div>
        </div>

        <Button
          onClick={() => {
            triggerHaptic('selection');
            handleNextDate();
          }}
          variant="ghost"
          size="icon"
          aria-label="Next Date"
          className="size-9 rounded-xl bg-(--color-brand-primary)/10 text-(--color-brand-primary) hover:bg-(--color-brand-primary)/18 active:scale-92 sm:size-10 sm:rounded-full sm:border sm:border-(--color-border-primary) sm:bg-(--color-card) sm:shadow-sm sm:hover:bg-(--color-hover-surface) sm:hover:shadow-md"
        >
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>

      {/* Desktop quick jump back to Today inside a fixed-height slot so changing
          days never shifts layout (phones use the top-left "Today" nav pill). */}
      <div className="hidden h-7 items-center justify-center sm:flex">
        {!isToday ? (
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setDate(new Date());
            }}
            className="rounded-full bg-(--color-brand-primary)/12 px-3.5 py-1 text-xs font-semibold text-(--color-brand-text) transition-transform focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:outline-none active:scale-95 dark:text-(--color-brand-text-light)"
          >
            Back to Today
          </button>
        ) : null}
      </div>
    </div>
  );
});

export default DailyHabitDate;

function DateHotkeys({
  onPrev,
  onNext,
}: {
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInteractiveElement =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.contentEditable === 'true' ||
        target.closest('[contenteditable="true"]') !== null ||
        target.closest('input, textarea, select') !== null ||
        target.getAttribute('role') === 'textbox';

      if (isInteractiveElement) {
        return;
      }

      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrev();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onPrev, onNext]);
  return null;
}
