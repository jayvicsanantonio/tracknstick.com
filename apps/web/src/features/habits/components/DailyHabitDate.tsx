import { useEffect, useMemo, memo } from 'react';
import { Button } from '@shared/components/ui/button';
import { useDate } from '@app/providers/useDate';
import MiscellaneousIcons from '@/icons/miscellaneous';

const { ChevronLeft, ChevronRight } = MiscellaneousIcons;

const DailyHabitDate = memo(function DailyHabitDate() {
  const { date, handlePreviousDate, handleNextDate, timeZone } = useDate();

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
        className="rounded-full border border-(--color-border-primary) bg-(--color-card) text-(--color-brand-primary) shadow-sm hover:bg-(--color-hover-surface) hover:shadow-md"
      >
        <ChevronLeft aria-hidden="true" className="h-4 w-4" />
      </Button>

      <div className="relative text-center">
        <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-(--color-border-primary) bg-(--color-card) px-4 py-2 shadow-sm">
          <h2 className="text-xl font-bold text-(--color-foreground) sm:text-2xl">
            {dayLabel}
          </h2>
          <span className="text-sm text-(--color-brand-primary) sm:text-base">
            {formattedDate}
          </span>
        </div>
        <div className="mx-auto mt-2 h-0.5 w-28 rounded-full bg-linear-to-r from-(--color-brand-light) via-(--color-brand-primary) to-(--color-brand-light) sm:w-36"></div>
      </div>

      <Button
        onClick={handleNextDate}
        variant="ghost"
        size="icon"
        aria-label="Next Date"
        className="rounded-full border border-(--color-border-primary) bg-(--color-card) text-(--color-brand-primary) shadow-sm hover:bg-(--color-hover-surface) hover:shadow-md"
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
