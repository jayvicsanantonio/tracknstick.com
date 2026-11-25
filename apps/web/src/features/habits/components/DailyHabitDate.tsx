// The tracker's date capsule: arrows to step through days around the date shown.
// Double-tapping the date goes back to today; the arrow keys step days too.

import { useEffect, useMemo, useRef, memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { useDate } from '@app/providers/useDate';
import { triggerHaptic } from '@shared/utils/haptics';
import type { DaySwipeDirection } from '@/features/habits/hooks/useDaySwipe';
import { cn } from '@shared/utils/utils';
import MiscellaneousIcons from '@/icons/miscellaneous';

const { ChevronLeft, ChevronRight } = MiscellaneousIcons;

/** The longest gap between two taps on the date that still counts as a double-tap. */
const DOUBLE_TAP_MS = 300;

interface DailyHabitDateProps {
  /** Direction of the latest day navigation for subtle directional label glide. */
  transitionDirection?: DaySwipeDirection | null;
  /** Renders with a recessed surface on lg+ when seated inside the desktop Progress Hero card. */
  embeddedOnDesktop?: boolean;
}

const DailyHabitDate = memo(function DailyHabitDate({
  transitionDirection = null,
  embeddedOnDesktop = false,
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

  const goToToday = () => {
    triggerHaptic('medium');
    setDate(new Date());
  };

  // Two taps on the date within DOUBLE_TAP_MS of each other.
  const lastDateTapRef = useRef(Number.NEGATIVE_INFINITY);
  const handleDateTap = () => {
    const now = performance.now();
    const isDoubleTap = now - lastDateTapRef.current < DOUBLE_TAP_MS;
    lastDateTapRef.current = isDoubleTap ? Number.NEGATIVE_INFINITY : now;
    if (isDoubleTap && !isToday) {
      goToToday();
    }
  };

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
    <div className="flex flex-col">
      <div
        className={cn(
          'relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-2xl p-1.5 sm:gap-3',
          embeddedOnDesktop
            ? 'ios-tracker-card-until-lg lg:bg-(--color-brand-primary)/[0.055] lg:ring-1 lg:ring-(--color-brand-primary)/14 lg:ring-inset dark:lg:bg-(--color-brand-primary)/[0.07]'
            : 'ios-tracker-card',
        )}
      >
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
          className="size-9 rounded-xl bg-(--color-brand-primary)/10 text-(--color-brand-primary) transition-[transform,background-color] hover:bg-(--color-brand-primary)/18 hover:text-(--color-brand-primary) active:scale-92 sm:size-10"
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        </Button>

        {/* Double-tapping the date goes back to today. */}
        <div
          onClick={handleDateTap}
          className="flex min-w-0 items-center justify-center self-stretch text-center select-none"
        >
          <div className="relative flex w-full items-center justify-center gap-1.5 overflow-hidden">
            <CalendarDays
              aria-hidden="true"
              className="size-3.5 shrink-0 text-(--color-brand-primary) sm:size-4"
            />
            {/* The visible Large Title directly above displays Today / weekday across all screen sizes. */}
            <h2 className="sr-only">{dayLabel}</h2>
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
                className="text-[14px] font-medium whitespace-nowrap text-(--color-text-secondary) sm:text-[15px]"
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
              className="text-[15px] font-semibold whitespace-nowrap text-(--color-foreground) tabular-nums"
            >
              {monthDay}
              <span className={isThisYear ? 'max-sm:hidden' : undefined}>
                , {year}
              </span>
            </motion.span>
          </div>
        </div>

        {/* Screen readers and keyboards cannot double-tap the date, so phones
            give them a button, shown over the date while it has focus; tablets
            and desktops have Back to Today in the page header. */}
        {isToday ? null : (
          <button
            type="button"
            onClick={goToToday}
            className="sr-only focus:not-sr-only focus:absolute focus:top-1/2 focus:left-1/2 focus:z-10 focus:-translate-x-1/2 focus:-translate-y-1/2 focus:rounded-full focus:bg-(--color-brand-primary) focus:px-3 focus:py-1.5 focus:text-[13px] focus:font-semibold focus:whitespace-nowrap focus:text-(--color-primary-foreground) focus:ring-2 focus:ring-(--color-ring) focus:outline-none sm:hidden"
          >
            Go to today
          </button>
        )}

        <Button
          onClick={() => {
            triggerHaptic('selection');
            handleNextDate();
          }}
          variant="ghost"
          size="icon"
          aria-label="Next Date"
          className="size-9 rounded-xl bg-(--color-brand-primary)/10 text-(--color-brand-primary) transition-[transform,background-color] hover:bg-(--color-brand-primary)/18 hover:text-(--color-brand-primary) active:scale-92 sm:size-10"
        >
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </Button>
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
