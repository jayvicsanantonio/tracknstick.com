import { InsightData } from "@/features/progress/types/InsightData";

export default function CalendarDayCircle({
  dayData,
  isPast,
  isToday,
  isDarkMode,
}: {
  dayData?: InsightData;
  isPast: boolean;
  isToday: boolean;
  isDarkMode: boolean;
}) {
  const showCircle = isPast || isToday;
  const percent = dayData ? Math.round(dayData.completionRate) : 0;

  return (
    <div className="relative w-1/2 h-1/2">
      <svg className="w-full h-full" viewBox="0 0 36 36">
        <circle
          className={isDarkMode ? "text-purple-900/60" : "text-purple-200"}
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r="16"
          cx="18"
          cy="18"
        />
        {showCircle && dayData && (
          <circle
            className={isDarkMode ? "text-purple-600" : "text-purple-600"}
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
        <span
          className={`text-[0.6rem] font-medium ${
            isDarkMode ? "text-purple-300" : "text-purple-800"
          }`}
        >
          {percent}%
        </span>
      </div>
    </div>
  );
}
