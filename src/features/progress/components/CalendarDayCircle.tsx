import { InsightData } from '@/features/progress/types/InsightData';

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
  let ariaLabel = 'Future day';
  if (showCircle) {
    ariaLabel = dayData ? `${percent}% completion` : '0% completion';
  }

  return (
    <div className="relative h-1/2 w-1/2" role="img" aria-label={ariaLabel}>
      <svg className="h-full w-full" viewBox="0 0 36 36" aria-hidden="true">
        <circle
          className="text-(--color-border-brand) dark:text-(--color-brand-light)"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r="16"
          cx="18"
          cy="18"
        />
        {showCircle && dayData && (
          <circle
            className="text-(--color-brand-primary)"
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
      <div className="absolute inset-0 hidden items-center justify-center md:flex">
        <span className="text-(--color-brand-tertiary) dark:text-(--color-brand-text-light) text-[0.6rem] font-medium">
          {percent}%
        </span>
      </div>
    </div>
  );
}
