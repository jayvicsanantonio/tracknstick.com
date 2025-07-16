export default function StreakDisplayDays({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div
      className="flex items-center bg-[var(--color-brand-light)] dark:bg-[var(--color-brand-light)] rounded-lg p-4 shadow-md"
      role="status"
      aria-label={`${label}: ${value} days`}
    >
      <span className="text-4xl font-bold mr-2 text-[var(--color-brand-tertiary)] dark:text-[var(--color-brand-text-light)]">
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
