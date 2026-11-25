// Interactive 7-day (Sun–Sat) completion ring strip for the tablet & desktop Daily Tracker.
// Shows the week containing the selected date, overlays live optimistic progress for the
// active day, and lets users jump to any day of the week in a single click.

import { memo, useContext, useMemo } from 'react';
import { Link, useInRouterContext } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { DateContext } from '@app/providers/DateContext';
import {
  useWeekProgressHistory,
  type WeekDayInfo,
} from '@/features/habits/hooks/useWeekProgressHistory';
import { useIsMobile } from '@shared/hooks/useIsMobile';
import { triggerHaptic } from '@shared/utils/haptics';
import { cn } from '@shared/utils/utils';

const RADIUS = 15;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const RING_BOX = 'relative size-9';

interface TrackerWeekStripProps {
  /** Live completion rate (0–100) for the currently selected day, or null when no habits are scheduled. */
  selectedDayRate: number | null;
  /** True while the selected day's habits are still loading after a day switch. */
  isSelectedDayLoading: boolean;
}

function formatWeekRange(days: WeekDayInfo[], timeZone: string): string {
  if (days.length !== 7) return '';
  const first = days[0].date;
  const last = days[6].date;
  const firstMonth = first.toLocaleDateString('en-US', {
    timeZone,
    month: 'short',
  });
  const lastMonth = last.toLocaleDateString('en-US', {
    timeZone,
    month: 'short',
  });
  if (firstMonth === lastMonth) {
    return `${firstMonth} ${first.getDate()} – ${last.getDate()}`;
  }
  return `${firstMonth} ${first.getDate()} – ${lastMonth} ${last.getDate()}`;
}

function WeekDayRing({
  rate,
  loading,
  isFuture,
}: {
  rate: number | null;
  loading: boolean;
  isFuture: boolean;
}) {
  if (isFuture && rate === null) {
    return (
      <div
        aria-hidden="true"
        className={cn(RING_BOX, 'flex items-center justify-center')}
      >
        <span className="size-1.5 rounded-full bg-(--color-brand-primary)/25" />
      </div>
    );
  }

  if (loading) {
    return (
      <div aria-hidden="true" className={RING_BOX}>
        <svg viewBox="0 0 36 36" className="size-full">
          <circle
            cx="18"
            cy="18"
            r={RADIUS}
            strokeWidth="3"
            className="fill-none stroke-(--color-brand-primary)/18"
          />
        </svg>
      </div>
    );
  }

  const isPerfect = rate !== null && rate >= 100;

  return (
    <div aria-hidden="true" className={RING_BOX}>
      <svg
        viewBox="0 0 36 36"
        className="size-full -rotate-90 overflow-visible"
      >
        <circle
          cx="18"
          cy="18"
          r={RADIUS}
          strokeWidth="3"
          strokeDasharray={rate === null ? '2 3.5' : undefined}
          className={cn(
            rate === null
              ? 'fill-none stroke-(--color-text-secondary)/30'
              : 'stroke-(--color-brand-primary)/18',
            isPerfect ? 'fill-(--color-brand-primary)/16' : 'fill-none',
          )}
        />
        {rate !== null && rate > 0 ? (
          <circle
            cx="18"
            cy="18"
            r={RADIUS}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - Math.min(rate, 100) / 100)}
            className="fill-none stroke-(--color-brand-primary) transition-[stroke-dashoffset] duration-300 ease-out motion-reduce:transition-none"
          />
        ) : null}
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">
        {isPerfect ? (
          <Check
            aria-hidden="true"
            strokeWidth={3}
            className="size-4 text-(--color-brand-primary)"
          />
        ) : rate !== null ? (
          <span className="text-[10px] font-semibold text-(--color-text-secondary) tabular-nums">
            {rate}%
          </span>
        ) : null}
      </span>
    </div>
  );
}

const TrackerWeekStrip = memo(function TrackerWeekStrip({
  selectedDayRate,
  isSelectedDayLoading,
}: TrackerWeekStripProps) {
  const dateContext = useContext(DateContext);
  const isMobile = useIsMobile();
  const inRouter = useInRouterContext();

  const { days, rateByDate, isLoading } = useWeekProgressHistory(
    !isMobile && Boolean(dateContext),
  );

  const isCurrentWeek = useMemo(() => days.some((d) => d.isToday), [days]);

  const weekRange = useMemo(
    () => (dateContext ? formatWeekRange(days, dateContext.timeZone) : ''),
    [days, dateContext],
  );

  const resolvedDays = useMemo(() => {
    return days.map((day) => {
      const isFuture = !day.isPast && !day.isToday;
      const historyRate = rateByDate.has(day.dateKey)
        ? (rateByDate.get(day.dateKey) ?? null)
        : null;

      // Overlay the live optimistic completion rate for the active day on Tracker
      // so checking off a habit reflects immediately in the weekly ring too.
      const rate =
        day.isSelected && !isSelectedDayLoading
          ? selectedDayRate
          : isFuture
            ? null
            : historyRate;

      const loading =
        day.isSelected && isSelectedDayLoading
          ? true
          : !isFuture && isLoading && !day.isSelected;

      return { ...day, isFuture, rate, loading };
    });
  }, [days, rateByDate, selectedDayRate, isSelectedDayLoading, isLoading]);

  if (!dateContext || days.length !== 7) {
    return null;
  }

  return (
    <section
      aria-label="Weekly overview"
      className="ios-tracker-card hidden rounded-[26px] px-5 py-3.5 sm:block sm:px-6 sm:py-4"
    >
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-(--color-brand-primary)"
            />
            <span className="text-[11px] leading-none font-semibold tracking-[0.09em] text-(--color-brand-primary) uppercase">
              {isCurrentWeek ? 'This Week' : 'Selected Week'}
            </span>
          </div>
          {weekRange ? (
            <>
              <span
                aria-hidden="true"
                className="text-xs text-(--color-text-secondary)/45"
              >
                ·
              </span>
              <span className="text-xs font-medium text-(--color-text-secondary) tabular-nums">
                {weekRange}
              </span>
            </>
          ) : null}
        </div>

        {inRouter ? (
          <Link
            to="/progress"
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-(--color-brand-primary) transition-colors hover:bg-(--color-brand-primary)/10 focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:outline-none"
          >
            <span>View full calendar</span>
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {resolvedDays.map((day) => {
          const dayAriaLabel = day.loading
            ? `${day.weekdayShort} ${day.dayOfMonth}: loading`
            : day.isFuture && day.rate === null
              ? `${day.weekdayShort} ${day.dayOfMonth}`
              : day.rate === null
                ? `${day.weekdayShort} ${day.dayOfMonth}: nothing scheduled`
                : `${day.weekdayShort} ${day.dayOfMonth}: ${day.rate}% completed`;

          return (
            <button
              key={day.dateKey}
              type="button"
              aria-label={dayAriaLabel}
              aria-pressed={day.isSelected}
              aria-current={day.isToday ? 'date' : undefined}
              onClick={() => {
                if (!day.isSelected) {
                  triggerHaptic('selection');
                }
                dateContext.setDate(day.date);
              }}
              className={cn(
                'flex cursor-pointer flex-col items-center gap-1 rounded-2xl px-1 py-1.5 transition-[background-color,box-shadow,transform] outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring) active:scale-95',
                day.isSelected
                  ? 'bg-(--color-brand-primary)/10 ring-1 ring-(--color-brand-primary)/32 ring-inset'
                  : 'hover:bg-(--color-brand-primary)/[0.06]',
                day.isFuture && !day.isSelected && 'opacity-70',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'text-[11px] leading-none font-semibold tracking-wide uppercase',
                  day.isSelected || day.isToday
                    ? 'text-(--color-brand-primary)'
                    : 'text-(--color-text-secondary)/80',
                )}
              >
                {day.weekdayShort}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs tabular-nums',
                  day.isToday
                    ? 'bg-(--color-brand-primary) font-bold text-(--color-primary-foreground) shadow-[0_2px_8px_color-mix(in_oklab,var(--color-brand-primary)_38%,transparent)]'
                    : day.isSelected
                      ? 'font-bold text-(--color-foreground)'
                      : day.isFuture
                        ? 'font-medium text-(--color-text-secondary)/60'
                        : 'font-medium text-(--color-foreground)',
                )}
              >
                {day.dayOfMonth}
              </span>
              <WeekDayRing
                rate={day.rate}
                loading={day.loading}
                isFuture={day.isFuture}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
});

export default TrackerWeekStrip;
