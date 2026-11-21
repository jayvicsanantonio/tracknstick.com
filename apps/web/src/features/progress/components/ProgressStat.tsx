// One figure in the progress page's summary row, such as the current streak or the month's average.
// Exposed to assistive technology as a single status with its label, value and unit.

import { memo, type ComponentType } from 'react';
import { plural } from '@shared/utils/plural';

interface ProgressStatProps {
  Icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  label: string;
  /** A count, or text that carries its own unit, such as "72%". */
  value: number | string;
  /** The singular unit of a count, such as "day"; pluralized to match. */
  unit?: string;
}

const ProgressStat = memo(function ProgressStat({
  Icon,
  label,
  value,
  unit,
}: ProgressStatProps) {
  const unitText =
    unit && typeof value === 'number' ? plural(value, unit) : undefined;

  return (
    <div
      role="status"
      aria-label={`${label}: ${value}${unitText ? ` ${unitText}` : ''}`}
      className="flex flex-col gap-3 rounded-2xl bg-(--color-surface)/60 p-4 ring-1 ring-(--color-border-primary)/50 ring-inset sm:p-5 dark:bg-(--color-surface-secondary)/60"
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-(--color-brand-primary)/12 text-(--color-brand-primary)">
        <Icon aria-hidden={true} className="h-5 w-5" />
      </span>
      <div>
        <p className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-(--color-foreground) sm:text-3xl">
            {value}
          </span>
          {unitText && (
            <span className="text-sm text-(--color-text-secondary)">
              {unitText}
            </span>
          )}
        </p>
        <p className="mt-0.5 text-xs font-medium text-(--color-text-secondary) sm:text-sm">
          {label}
        </p>
      </div>
    </div>
  );
});

export default ProgressStat;
