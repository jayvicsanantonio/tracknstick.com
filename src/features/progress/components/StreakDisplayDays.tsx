export default function StreakDisplayDays({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div
      className="flex items-center bg-purple-100 dark:bg-purple-800 rounded-lg p-4 shadow-md"
      role="status"
      aria-label={`${label}: ${value} days`}
    >
      <span className="text-4xl font-bold mr-2">{value}</span>
      <div className="flex flex-col">
        <span className="text-sm">{label}</span>
        <span className="text-xs text-purple-600 dark:text-purple-300">
          days
        </span>
      </div>
    </div>
  );
}
