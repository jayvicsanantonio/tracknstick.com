import { useContext, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DateContext } from "@/context/DateContext";
import MiscellaneousIcons from "@/icons/miscellaneous";

const { ChevronLeft, ChevronRight } = MiscellaneousIcons;

export default function DailyHabitDate() {
  const { date, handlePreviousDate, handleNextDate, timeZone } =
    useContext(DateContext);

  const formattedDate = useMemo(() => {
    return date.toLocaleDateString("en-US", {
      timeZone,
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [date, timeZone]);

  const dayLabel = useMemo(() => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    if (isToday) {
      return "Today";
    } else {
      return date.toLocaleDateString("en-US", {
        timeZone,
        weekday: "long",
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
        className="shadow-sm transition-all duration-300 border-[var(--color-border-brand)] hover:bg-[var(--color-hover-brand)] dark:border-[var(--color-border-brand)] dark:bg-[var(--color-brand-light)] dark:hover:bg-[var(--color-hover-brand)] dark:text-[var(--color-brand-text-light)]"
      >
        <ChevronLeft aria-hidden="true" className="h-4 w-4" />
      </Button>
      <div className="text-center relative">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-brand-tertiary)] dark:text-[var(--color-brand-text-light)] mb-1 transition-colors">
          {dayLabel}
        </h2>
        <p className="text-sm sm:text-base text-[var(--color-brand-primary)] dark:text-[var(--color-brand-text-light)] transition-colors">
          {formattedDate}
        </p>
        <div className="h-0.5 w-24 sm:w-32 mx-auto mt-1.5 rounded-full bg-gradient-to-r from-[var(--color-brand-light)] via-[var(--color-brand-primary)] to-[var(--color-brand-light)] dark:from-[var(--color-brand-light)] dark:via-[var(--color-brand-primary)] dark:to-[var(--color-brand-light)]"></div>
      </div>
      <Button
        onClick={handleNextDate}
        variant="outline"
        size="icon"
        aria-label="Next Date"
        className="shadow-sm transition-all duration-300 border-[var(--color-border-brand)] text-[var(--color-brand-primary)] hover:bg-[var(--color-hover-brand)] hover:text-[var(--color-brand-secondary)] hover:border-[var(--color-border-brand)] hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed dark:border-[var(--color-border-secondary)] dark:text-[var(--color-brand-text-light)] dark:bg-[var(--color-surface-secondary)] dark:hover:bg-[var(--color-hover-surface)] dark:hover:shadow-md dark:hover:text-[var(--color-brand-text-light)] dark:hover:border-[var(--color-border-brand)] dark:disabled:cursor-not-allowed"
      >
        <ChevronRight aria-hidden="true" className="h-4 w-4" />
      </Button>
    </div>
  );
}
