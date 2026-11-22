// One figure in the progress page's summary row, such as the current streak or the month's average.
// Exposed to assistive technology as a single status with its label, value, unit and any badge.

import { memo, type ComponentType } from 'react';
import { plural } from '@shared/utils/plural';

interface ProgressStatProps {
  Icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  label: string;
  /** A count, text that carries its own unit such as "72%", or null when there is none. */
  value: number | string | null;
  /** The singular unit of a count, such as "day"; pluralized to match. */
  unit?: string;
  /** Shows a placeholder instead of the value, which is not known yet. */
  loading?: boolean;
  /** A short note beside the label, such as "Best yet". */
  badge?: string;
}

function readValue(
  value: ProgressStatProps['value'],
  unitText: string | undefined,
) {
  if (value === null) return 'no data yet';
  return `${value}${unitText ? ` ${unitText}` : ''}`;
}

const ProgressStat = memo(function ProgressStat({
  Icon,
  label,
  value,
  unit,
  loading = false,
  badge,
}: ProgressStatProps) {
  const unitText =
    unit && typeof value === 'number' ? plural(value, unit) : undefined;

  const spoken = loading
    ? `${label}: loading`
    : `${label}: ${readValue(value, unitText)}${badge ? `, ${badge.toLowerCase()}` : ''}`;

  return (
    <div
      role="status"
      aria-label={spoken}
      aria-busy={loading}
      // Icon above the figure in a phone's two columns, beside it from sm up.
      className="ios-tracker-card relative flex flex-col items-start gap-2.5 overflow-hidden rounded-[22px] p-4 sm:flex-row sm:items-center sm:gap-4 sm:rounded-2xl sm:border-0 sm:bg-(--color-surface)/60 sm:p-4 sm:shadow-none sm:ring-1 sm:ring-(--color-border-primary)/50 sm:ring-inset dark:sm:bg-(--color-surface-secondary)/60"
    >
      {badge && !loading ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-8 -right-8 size-24 rounded-full bg-(--color-brand-primary)/20 blur-2xl sm:hidden"
        />
      ) : null}
      <span className="relative flex size-10 shrink-0 items-center justify-center rounded-[13px] bg-(--color-brand-primary)/14 text-(--color-brand-primary) ring-1 ring-(--color-brand-primary)/24 ring-inset sm:size-11 sm:rounded-xl">
        <Icon aria-hidden={true} className="h-5 w-5" />
      </span>
      <div className="relative min-w-0">
        {loading ? (
          <span className="block h-7 w-14 animate-pulse rounded-md bg-(--color-brand-primary)/14 motion-reduce:animate-none sm:h-8" />
        ) : value === null ? (
          <p className="flex h-7 items-center text-sm font-medium text-(--color-text-secondary) sm:h-8">
            No data yet
          </p>
        ) : (
          // As tall as the placeholder, so the figure does not move when
          // it arrives.
          <p className="flex h-7 items-baseline gap-1 sm:h-8">
            <span className="text-[26px] leading-7 font-bold tracking-[-0.025em] text-(--color-foreground) tabular-nums sm:text-[1.75rem] sm:leading-8">
              {value}
            </span>
            {unitText && (
              <span className="text-[13px] font-medium text-(--color-text-secondary) sm:text-sm">
                {unitText}
              </span>
            )}
          </p>
        )}
        {/* Room for two lines whatever its length, so a month whose name
            wraps the label ("Perfect days in September") keeps the row's
            height. */}
        <p className="mt-1 flex min-h-[2lh] flex-wrap content-start items-center gap-x-1.5 gap-y-0.5 text-xs font-medium text-(--color-text-secondary) sm:mt-0.5 sm:text-sm">
          {label}
          {badge && !loading && (
            <span className="rounded-full bg-(--color-brand-primary)/15 px-1.5 py-px text-[10px] font-semibold tracking-wide text-(--color-brand-text) uppercase ring-1 ring-(--color-brand-primary)/24 ring-inset dark:text-(--color-brand-text-light)">
              {badge}
            </span>
          )}
        </p>
      </div>
    </div>
  );
});

export default ProgressStat;
