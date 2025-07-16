export default function StreakDisplayDays({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div
      className="flex items-center bg-purple-100 dark:bg-purple-900/50 rounded-lg p-4 shadow-md"
      role="status"
      aria-label={`${label}: ${value} days`}
    >
      <span className="text-4xl font-bold mr-2 text-purple-800 dark:text-purple-300">
        {value}
      </span>
      <div className="flex flex-col">
        <span className="text-sm text-purple-800 dark:text-purple-300">
          {label}
        </span>
        <span className="text-xs text-purple-600 dark:text-purple-400">
          days
        </span>
      </div>
    </div>
  );
}
