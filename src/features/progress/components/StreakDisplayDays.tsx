export default function StreakDisplayDays({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div
      className="flex items-center rounded-lg bg-[var(--color-brand-light)] p-4 shadow-md dark:bg-[var(--color-brand-light)]"
      role="status"
      aria-label={`${label}: ${value} days`}
    >
      <span className="mr-2 text-4xl font-bold text-[var(--color-brand-tertiary)] dark:text-[var(--color-brand-text-light)]">
        {value}
      </span>
      <div className="flex flex-col">
        <span className="text-sm text-[var(--color-brand-tertiary)] dark:text-[var(--color-brand-text-light)]">
          {label}
        </span>
        <span className="text-xs text-[var(--color-brand-primary)] dark:text-[var(--color-brand-text-light)]">
          days
        </span>
      </div>
    </div>
  );
}
