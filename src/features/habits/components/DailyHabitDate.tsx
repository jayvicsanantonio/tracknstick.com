import { useContext, useEffect, useMemo, memo } from 'react';
import { Button } from '@shared/components/ui/button';
import { DateContext } from '@app/providers/DateContext';
import MiscellaneousIcons from '@/icons/miscellaneous';

const { ChevronLeft, ChevronRight } = MiscellaneousIcons;

const DailyHabitDate = memo(function DailyHabitDate() {
  const { date, handlePreviousDate, handleNextDate, timeZone } =
    useContext(DateContext);

  const formattedDate = useMemo(() => {
    return date.toLocaleDateString('en-US', {
      timeZone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [date, timeZone]);

  const dayLabel = useMemo(() => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    if (isToday) {
      return 'Today';
    } else {
      return date.toLocaleDateString('en-US', {
        timeZone,
        weekday: 'long',
      });
    }
  }, [date, timeZone]);

  return (
    <div className="flex items-center justify-between">
      {/* Keyboard shortcuts for date navigation */}
      <DateHotkeys onPrev={handlePreviousDate} onNext={handleNextDate} />

      <Button
        onClick={handlePreviousDate}
        variant="ghost"
        size="icon"
        aria-label="Previous Date"
        className="border-(--color-border-primary) bg-(--color-card) text-(--color-brand-primary) hover:bg-(--color-hover-surface) rounded-full border shadow-sm transition-all duration-300 hover:shadow-md"
      >
        <ChevronLeft aria-hidden="true" className="h-4 w-4" />
      </Button>

      <div className="relative text-center">
        <div className="border-(--color-border-primary) bg-(--color-card) mx-auto inline-flex items-center gap-3 rounded-full border px-4 py-2 shadow-sm">
          <h2 className="text-(--color-foreground) text-xl font-bold sm:text-2xl">
            {dayLabel}
          </h2>
          <span className="text-(--color-brand-primary) text-sm sm:text-base">
            {formattedDate}
          </span>
        </div>
        <div className="bg-linear-to-r from-(--color-brand-light) via-(--color-brand-primary) to-(--color-brand-light) mx-auto mt-2 h-0.5 w-28 rounded-full sm:w-36"></div>
      </div>

      <Button
        onClick={handleNextDate}
        variant="ghost"
        size="icon"
        aria-label="Next Date"
        className="border-(--color-border-primary) bg-(--color-card) text-(--color-brand-primary) hover:bg-(--color-hover-surface) rounded-full border shadow-sm transition-all duration-300 hover:shadow-md"
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
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onPrev, onNext]);
  return null;
}
