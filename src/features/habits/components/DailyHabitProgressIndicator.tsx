import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import MiscellaneousIcons from '@/icons/miscellaneous';

const { Check } = MiscellaneousIcons;

interface DailyHabitProgressIndicatorProps {
  completionRate: number;
}

const DailyHabitProgressIndicator = memo(function DailyHabitProgressIndicator({
  completionRate,
}: DailyHabitProgressIndicatorProps) {
  const displayRate = useMemo(
    () => (Number.isNaN(completionRate) ? 0 : completionRate),
    [completionRate],
  );

  const circumference = 42 * 2 * Math.PI;
  const strokeDashoffset = useMemo(
    () => circumference * (1 - displayRate / 100),
    [displayRate],
  );

  return (
    <div
      className="mb-12 mt-4 flex flex-col items-center justify-center"
      aria-label={`Daily habit completion: ${displayRate}%`}
    >
      <div className="relative h-52 w-52 sm:h-60 sm:w-60 md:h-64 md:w-64">
        {/* Drop shadow for the progress circle */}
        <div
          aria-hidden="true"
          className="bg-(--color-brand-primary)/30 dark:bg-(--color-brand-primary)/20 absolute inset-0 rounded-full"
        ></div>

        <div className="relative h-full w-full">
          <svg
            className="h-full w-full"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            {/* Background track */}
            <circle
              aria-hidden="true"
              className="text-(--color-border-primary)"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="42"
              cx="50"
              cy="50"
            />

            {/* Glowing effect behind progress */}
            <motion.circle
              aria-hidden="true"
              className="text-(--color-brand-primary)/30"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="42"
              cx="50"
              cy="50"
              transform="rotate(-90 50 50)"
              initial={{ strokeDashoffset: 42 * 2 * Math.PI }}
              animate={{
                strokeDashoffset,
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />

            {/* Main progress indicator */}
            <motion.circle
              aria-hidden="true"
              className="text-(--color-brand-primary)"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="42"
              cx="50"
              cy="50"
              transform="rotate(-90 50 50)"
              initial={{ strokeDashoffset: 42 * 2 * Math.PI }}
              animate={{
                strokeDashoffset,
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>

          {/* Central display */}
          <div className="absolute inset-0 flex items-center justify-center">
            {displayRate === 100 ? (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.2, 1], opacity: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              >
                <div className={`rounded-full p-5`} aria-hidden="true">
                  <Check className="text-(--color-brand-primary) h-28 w-28" />
                </div>
              </motion.div>
            ) : (
              <motion.div
                className="flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-(--color-foreground) text-5xl font-extrabold tracking-tight">
                  {displayRate}%
                </span>
                <span className="text-(--color-text-secondary) mt-1 text-sm">
                  Completed
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default DailyHabitProgressIndicator;
