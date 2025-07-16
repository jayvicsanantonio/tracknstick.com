import { InsightData } from "@/features/progress/types/InsightData";

export default function CalendarDayCircle({
  dayData,
  isPast,
  isToday,
}: {
  dayData?: InsightData;
  isPast: boolean;
  isToday: boolean;
}) {
  const showCircle = isPast || isToday;
  const percent = dayData ? Math.round(dayData.completionRate) : 0;
  let ariaLabel = "Future day";
  if (showCircle) {
    ariaLabel = dayData ? `${percent}% completion` : "0% completion";
  }

  return (
    <div className="relative w-1/2 h-1/2" role="img" aria-label={ariaLabel}>
      <svg className="w-full h-full" viewBox="0 0 36 36" aria-hidden="true">
        <circle
          className="text-purple-200 dark:text-purple-900/60"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r="16"
          cx="18"
          cy="18"
        />
        {showCircle && dayData && (
          <circle
            className="text-purple-600"
            strokeWidth="4"
            strokeDasharray={16 * 2 * Math.PI}
            strokeDashoffset={16 * 2 * Math.PI * (1 - percent / 100)}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="16"
            cx="18"
            cy="18"
          />
        )}
      </svg>
      <div className="absolute inset-0 md:flex items-center justify-center hidden">
        <span className="text-[0.6rem] font-medium text-purple-800 dark:text-purple-300">
          {percent}%
        </span>
      </div>
    </div>
  );
}
