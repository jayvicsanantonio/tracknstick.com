import { useEffect, useMemo, memo } from 'react';
import { Button } from '@shared/components/ui/button';
import { useDate } from '@app/providers/useDate';
import MiscellaneousIcons from '@/icons/miscellaneous';

const { ChevronLeft, ChevronRight } = MiscellaneousIcons;

const DailyHabitDate = memo(function DailyHabitDate() {
  const {
    date,
    setDate,
    currentDate,
    handlePreviousDate,
    handleNextDate,
    timeZone,
  } = useDate();

  // The month and day, and the year apart from them: a phone leaves out
  // this year's year, so "Wednesday" and its date fit between the arrows.
  const { monthDay, year, isThisYear } = useMemo(() => {
    const yearOf = (value: Date) =>
      value.toLocaleDateString('en-US', { timeZone, year: 'numeric' });
    return {
      monthDay: date.toLocaleDateString('en-US', {
        timeZone,
        // Short, so "Today" and the date fit one line on a 360px phone and in
        // the tracker's narrow dashboard column.
        month: 'short',
        day: 'numeric',
      }),
      year: yearOf(date),
      // currentDate rolls over at midnight, so a day left on screen into a
      // new year shows its year again.
      isThisYear: yearOf(date) === yearOf(currentDate),
    };
  }, [date, currentDate, timeZone]);

  const isToday = date.toDateString() === new Date().toDateString();

  const dayLabel = useMemo(() => {
    if (isToday) {
      return 'Today';
    } else {
      return date.toLocaleDateString('en-US', {
        timeZone,
        weekday: 'long',
      });
    }
  }, [date, timeZone, isToday]);

  return (
    // The arrows hold the row's ends and the day takes the middle, so a
    // longer day name never moves them. The gap keeps the pill off the arrows.
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-3">
      {/* Keyboard shortcuts for date navigation */}
      <DateHotkeys onPrev={handlePreviousDate} onNext={handleNextDate} />

      <Button
        onClick={handlePreviousDate}
        variant="ghost"
        size="icon"
        aria-label="Previous Date"
        className="rounded-full text-(--color-brand-primary) hover:bg-(--color-hover-surface) sm:border sm:border-(--color-border-primary) sm:bg-(--color-card) sm:shadow-sm sm:hover:shadow-md"
      >
        <ChevronLeft aria-hidden="true" className="h-4 w-4" />
      </Button>

      <div className="relative text-center">
        {/* Spans the room between the arrows, so only its text changes from
            day to day. On phones, plain text, the day's name over its date;
            from sm up, a pill with the two side by side. */}
        <div className="flex flex-col items-center justify-center sm:flex-row sm:items-baseline sm:gap-2.5 sm:rounded-full sm:border sm:border-(--color-border-primary) sm:bg-(--color-card) sm:px-5 sm:py-1.5 sm:shadow-sm">
          <h2 className="text-xl font-bold text-(--color-foreground) sm:text-2xl">
            {/* Another day's name takes the user back to today when tapped,
                as an iOS calendar's title does. */}
            {isToday ? (
              dayLabel
            ) : (
              <button
                type="button"
                onClick={() => setDate(new Date())}
                aria-describedby="back-to-today"
                className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring) active:opacity-60"
              >
                {dayLabel}
                <span id="back-to-today" hidden>
                  Back to Today
                </span>
              </button>
            )}
          </h2>
          <span className="text-sm whitespace-nowrap text-(--color-brand-primary) sm:text-base">
            {monthDay}
            <span className={isThisYear ? 'max-sm:hidden' : undefined}>
              , {year}
            </span>
          </span>
        </div>
      </div>

      <Button
        onClick={handleNextDate}
        variant="ghost"
        size="icon"
        aria-label="Next Date"
        className="rounded-full text-(--color-brand-primary) hover:bg-(--color-hover-surface) sm:border sm:border-(--color-border-primary) sm:bg-(--color-card) sm:shadow-sm sm:hover:shadow-md"
      >
        <ChevronRight aria-hidden="true" className="h-4 w-4" />
      </Button>
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
      // Don't interfere with input fields or other interactive elements
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

      // Only handle arrow keys if no modifiers are pressed
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
