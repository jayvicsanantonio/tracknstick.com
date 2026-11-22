import { useEffect, useMemo, memo } from 'react';
import { Button } from '@shared/components/ui/button';
import { useDate } from '@app/providers/useDate';
import { triggerHaptic } from '@shared/utils/haptics';
import MiscellaneousIcons from '@/icons/miscellaneous';

const { ChevronLeft, ChevronRight } = MiscellaneousIcons;

const DailyHabitDate = memo(function DailyHabitDate() {
  const {
    date,
    currentDate,
    setDate,
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
        month: 'short',
        day: 'numeric',
      }),
      year: yearOf(date),
      isThisYear: yearOf(date) === yearOf(currentDate),
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
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-3">
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
          className="rounded-full text-(--color-brand-primary) hover:bg-(--color-hover-surface) active:scale-92 sm:border sm:border-(--color-border-primary) sm:bg-(--color-card) sm:shadow-sm sm:hover:shadow-md"
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        </Button>

        <div className="relative text-center">
          <div className="flex flex-col items-center justify-center sm:flex-row sm:items-baseline sm:gap-2.5 sm:rounded-full sm:border sm:border-(--color-border-primary) sm:bg-(--color-card) sm:px-5 sm:py-1.5 sm:shadow-sm">
            {/* On phones the Large Title bar directly above displays Today / weekday. */}
            <h2 className="text-xl font-bold tracking-tight text-(--color-foreground) max-sm:sr-only sm:text-2xl">
              {dayLabel}
            </h2>
            <span className="text-[15px] font-semibold whitespace-nowrap text-(--color-brand-primary) tabular-nums sm:text-base sm:font-normal">
              {monthDay}
              <span className={isThisYear ? 'max-sm:hidden' : undefined}>
                , {year}
              </span>
            </span>
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
          className="rounded-full text-(--color-brand-primary) hover:bg-(--color-hover-surface) active:scale-92 sm:border sm:border-(--color-border-primary) sm:bg-(--color-card) sm:shadow-sm sm:hover:shadow-md"
        >
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick jump back to Today whenever browsing another day */}
      {!isToday ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setDate(new Date());
            }}
            className="min-h-8 rounded-full bg-(--color-brand-primary)/12 px-3.5 py-1 text-xs font-semibold text-(--color-brand-text) transition-transform focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:outline-none active:scale-95 dark:text-(--color-brand-text-light)"
          >
            Back to Today
          </button>
        </div>
      ) : null}
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
