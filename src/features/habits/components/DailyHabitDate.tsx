import { useContext, useMemo } from 'react';
import { Button } from '@shared/components/ui/button';
import { DateContext } from '@app/providers/DateContext';
import MiscellaneousIcons from '@/icons/miscellaneous';

const { ChevronLeft, ChevronRight } = MiscellaneousIcons;

export default function DailyHabitDate() {
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
      <Button
        onClick={handlePreviousDate}
        variant="outline"
        size="icon"
        aria-label="Previous Date"
        className="border-(--color-border-brand) hover:bg-(--color-hover-brand) dark:border-(--color-border-brand) dark:bg-(--color-brand-light) dark:text-(--color-brand-text-light) dark:hover:bg-(--color-hover-brand) shadow-sm transition-all duration-300"
      >
        <ChevronLeft aria-hidden="true" className="h-4 w-4" />
      </Button>
      <div className="relative text-center">
        <h2 className="text-(--color-brand-tertiary) dark:text-(--color-brand-text-light) mb-1 text-2xl font-bold transition-colors sm:text-3xl">
          {dayLabel}
        </h2>
        <p className="text-(--color-brand-primary) dark:text-(--color-brand-text-light) text-sm transition-colors sm:text-base">
          {formattedDate}
        </p>
        <div className="bg-linear-to-r from-(--color-brand-light) via-(--color-brand-primary) to-(--color-brand-light) dark:from-(--color-brand-light) dark:via-(--color-brand-primary) dark:to-(--color-brand-light) mx-auto mt-1.5 h-0.5 w-24 rounded-full sm:w-32"></div>
      </div>
      <Button
        onClick={handleNextDate}
        variant="outline"
        size="icon"
        aria-label="Next Date"
        className="border-(--color-border-brand) text-(--color-brand-primary) hover:border-(--color-border-brand) hover:bg-(--color-hover-brand) hover:text-(--color-brand-secondary) dark:border-(--color-border-secondary) dark:bg-(--color-surface-secondary) dark:text-(--color-brand-text-light) dark:hover:border-(--color-border-brand) dark:hover:bg-(--color-hover-surface) dark:hover:text-(--color-brand-text-light) shadow-sm transition-all duration-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 dark:hover:shadow-md dark:disabled:cursor-not-allowed"
      >
        <ChevronRight aria-hidden="true" className="h-4 w-4" />
      </Button>
    </div>
  );
}
