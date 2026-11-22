// One day in the progress calendar: its number above a ring that fills with the day's completion.
// Past & today cells are tappable to jump straight to that day in the Tracker.

import { memo } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@shared/utils/utils';
import { InsightData } from '@/features/progress/types/InsightData';
import { triggerHaptic } from '@shared/utils/haptics';

interface CalendarDayCellProps {
  dayOfMonth: number;
  isPast: boolean;
  isToday: boolean;
  dayData?: InsightData;
  /** The month's history is still on its way: a past day shows a plain ring. */
  loading?: boolean;
  /** Invoked when a past or today cell is tapped. */
  onSelect?: (dayOfMonth: number) => void;
}

const RADIUS = 15;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// The ring and its centre share one size, so the percentage sits inside it.
const RING_BOX = 'relative size-9 sm:size-11';

/** A past day's ring while its completion is unknown: a plain, faint track. */
function PendingRing() {
  return (
    <div aria-hidden="true" className={RING_BOX}>
      <svg viewBox="0 0 36 36" className="size-full">
        <circle
          cx="18"
          cy="18"
          r={RADIUS}
          strokeWidth="3"
          className="fill-none stroke-(--color-border-primary)/50"
        />
      </svg>
    </div>
  );
}

function DayRing({ rate }: { rate: number | null }) {
  const isPerfect = rate !== null && rate >= 100;

  return (
    <div aria-hidden="true" className={RING_BOX}>
      <svg viewBox="0 0 36 36" className="size-full -rotate-90">
        <circle
          cx="18"
          cy="18"
          r={RADIUS}
          strokeWidth="3"
          strokeDasharray={rate === null ? '2 3.5' : undefined}
          className={cn(
            rate === null
              ? 'fill-none stroke-(--color-border-primary)'
              : 'stroke-(--color-brand-primary)/15',
            isPerfect ? 'fill-(--color-brand-primary)/15' : 'fill-none',
          )}
        />
        {rate !== null && rate > 0 && (
          <circle
            cx="18"
            cy="18"
            r={RADIUS}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - Math.min(rate, 100) / 100)}
            className="fill-none stroke-(--color-brand-primary) transition-[stroke-dashoffset] duration-500 ease-out motion-reduce:transition-none"
          />
        )}
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">
        {isPerfect ? (
          <Check
            aria-hidden="true"
            strokeWidth={3}
            className="size-3.5 text-(--color-brand-primary) sm:size-4"
          />
        ) : (
          rate !== null && (
            <span className="hidden text-[10px] font-semibold text-(--color-text-secondary) tabular-nums sm:block">
              {rate}%
            </span>
          )
        )}
      </span>
    </div>
  );
}

const CalendarDayCell = memo(function CalendarDayCell({
  dayOfMonth,
  isPast,
  isToday,
  dayData,
  loading = false,
  onSelect,
}: CalendarDayCellProps) {
  const hasHappened = isPast || isToday;
  const rate = dayData ? Math.round(dayData.completionRate) : null;

  const label = !hasHappened
    ? `Day ${dayOfMonth}`
    : loading
      ? `Day ${dayOfMonth}: loading`
      : rate === null
        ? `Day ${dayOfMonth}: nothing scheduled`
        : `Day ${dayOfMonth}: ${rate}% completed`;

  const interactive = hasHappened && Boolean(onSelect);

  const handleActivate = () => {
    if (!interactive || !onSelect) return;
    triggerHaptic('selection');
    onSelect(dayOfMonth);
  };

  return (
    <div
      role="gridcell"
      aria-label={label}
      aria-current={isToday ? 'date' : undefined}
      title={hasHappened ? label.replace(/^Day \d+: /, '') : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? handleActivate : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleActivate();
              }
            }
          : undefined
      }
      className={cn(
        'flex flex-col items-center gap-1 rounded-xl py-1 outline-none',
        interactive &&
          'cursor-pointer transition-transform focus-visible:ring-2 focus-visible:ring-(--color-ring) active:scale-92',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-medium tabular-nums',
          isToday
            ? 'bg-(--color-brand-primary) font-bold text-(--color-primary-foreground)'
            : hasHappened
              ? 'text-(--color-foreground)'
              : 'text-(--color-text-secondary)/60',
        )}
      >
        {dayOfMonth}
      </span>
      {hasHappened && loading ? (
        <PendingRing />
      ) : hasHappened ? (
        <DayRing rate={rate} />
      ) : (
        <div
          aria-hidden="true"
          className={cn(RING_BOX, 'flex items-center justify-center')}
        >
          <span className="size-1 rounded-full bg-(--color-border-primary)" />
        </div>
      )}
    </div>
  );
});

export default CalendarDayCell;
