// Empty state for a day on which none of the user's habits are due.
// Distinct from NoHabits, which invites a user who has no habits at all to add one.

import { memo } from 'react';
import { ArrowRight, CalendarCheck2 } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { IosHapticTarget } from '@shared/components/ui/ios-haptic-target';
import EmptyState from '@shared/components/feedback/EmptyState';

/** Within this many days, the next due day is named by its weekday alone. */
const WEEKDAY_RANGE_DAYS = 6;
const DAY_MS = 24 * 60 * 60 * 1000;

interface NothingScheduledProps {
  /** The next day any habit is due, as local noon of that day. */
  nextDueDate?: Date | null;
  /** The day shown, which the next due day is counted from. */
  shownDate?: Date;
  onGoToNextDue?: () => void;
}

const NothingScheduled = memo(function NothingScheduled({
  nextDueDate,
  shownDate,
  onGoToNextDue,
}: NothingScheduledProps) {
  const isWithinWeek =
    nextDueDate && shownDate
      ? nextDueDate.getTime() - shownDate.getTime() <=
        WEEKDAY_RANGE_DAYS * DAY_MS + DAY_MS / 2
      : false;
  const weekday = nextDueDate?.toLocaleDateString('en-US', {
    weekday: 'long',
  });
  const monthDay = nextDueDate?.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <EmptyState
      Icon={CalendarCheck2}
      headingLevel={3}
      title="Nothing scheduled"
      className="sm:max-w-none"
      detail={
        <>
          None of your habits are due on this day.
          {/* Phones get the swipe hint under the card instead. */}
          <span className="max-sm:hidden">
            {' '}
            Use the arrows or ← → keys to change days.
          </span>
        </>
      }
    >
      {nextDueDate && onGoToNextDue ? (
        <>
          <p className="text-[13px] font-semibold text-(--color-brand-text) dark:text-(--color-brand-text-light)">
            Next up: {weekday}, {monthDay}
          </p>
          <IosHapticTarget className="inline-flex rounded-full">
            <Button
              variant="outline"
              className="h-11 rounded-full px-6"
              onClick={onGoToNextDue}
            >
              Go to {isWithinWeek ? weekday : monthDay}
              <ArrowRight aria-hidden="true" className="ml-1 h-4 w-4" />
            </Button>
          </IosHapticTarget>
        </>
      ) : null}
    </EmptyState>
  );
});

export default NothingScheduled;
