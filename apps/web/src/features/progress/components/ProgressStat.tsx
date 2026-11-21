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
      className="flex flex-col items-start gap-2 rounded-2xl bg-(--color-surface)/60 p-3 ring-1 ring-(--color-border-primary)/50 ring-inset sm:flex-row sm:items-center sm:gap-4 sm:p-4 dark:bg-(--color-surface-secondary)/60"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-(--color-brand-primary)/12 text-(--color-brand-primary) sm:size-11">
        <Icon aria-hidden={true} className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        {loading ? (
          <span className="block h-7 w-14 animate-pulse rounded-md bg-(--color-brand-primary)/12 motion-reduce:animate-none sm:h-8" />
        ) : value === null ? (
          <p className="flex h-7 items-center text-sm font-medium text-(--color-text-secondary) sm:h-8">
            No data yet
          </p>
        ) : (
          <p className="flex items-baseline gap-1">
            <span className="text-2xl leading-7 font-bold tracking-tight text-(--color-foreground) tabular-nums sm:text-[1.75rem] sm:leading-8">
              {value}
            </span>
            {unitText && (
              <span className="text-sm text-(--color-text-secondary)">
                {unitText}
              </span>
            )}
          </p>
        )}
        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs font-medium text-(--color-text-secondary) sm:text-sm">
          {label}
          {badge && !loading && (
            <span className="rounded-full bg-(--color-brand-primary)/15 px-1.5 py-px text-[10px] font-semibold tracking-wide text-(--color-brand-text) uppercase dark:text-(--color-brand-text-light)">
              {badge}
            </span>
          )}
        </p>
      </div>
    </div>
  );
});

export default ProgressStat;
