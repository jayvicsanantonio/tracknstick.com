// One streak figure on the progress page, such as the current or longest streak in days.
// Exposed to assistive technology as a single status with its label and value.

import { memo } from 'react';
import { plural } from '@shared/utils/plural';

interface StreakDisplayDaysProps {
  value: number;
  label: string;
}

const StreakDisplayDays = memo(function StreakDisplayDays({
  value,
  label,
}: StreakDisplayDaysProps) {
  return (
    <div
      className="flex items-center rounded-lg bg-(--color-brand-light) p-3 shadow-md sm:p-4 dark:bg-(--color-brand-light)"
      role="status"
      aria-label={`${label}: ${value} ${plural(value, 'day')}`}
    >
      <span className="mr-2 text-3xl font-bold text-(--color-brand-tertiary) sm:text-4xl dark:text-(--color-brand-text-light)">
        {value}
      </span>
      <div className="flex flex-col">
        <span className="text-xs leading-tight text-(--color-brand-tertiary) sm:text-sm dark:text-(--color-brand-text-light)">
          {label}
        </span>
        <span className="text-xs text-(--color-brand-primary) dark:text-(--color-brand-text-light)">
          {plural(value, 'day')}
        </span>
      </div>
    </div>
  );
});

export default StreakDisplayDays;
