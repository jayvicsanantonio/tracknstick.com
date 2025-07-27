export default function StreakDisplayDays({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div
      className="bg-(--color-brand-light) dark:bg-(--color-brand-light) flex items-center rounded-lg p-4 shadow-md"
      role="status"
      aria-label={`${label}: ${value} days`}
    >
      <span className="text-(--color-brand-tertiary) dark:text-(--color-brand-text-light) mr-2 text-4xl font-bold">
        {value}
      </span>
      <div className="flex flex-col">
        <span className="text-(--color-brand-tertiary) dark:text-(--color-brand-text-light) text-sm">
          {label}
        </span>
        <span className="text-(--color-brand-primary) dark:text-(--color-brand-text-light) text-xs">
          days
        </span>
      </div>
    </div>
  );
}
