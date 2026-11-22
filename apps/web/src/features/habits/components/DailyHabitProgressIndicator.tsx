import { memo, useId, useMemo } from 'react';
import { motion } from 'framer-motion';
import MiscellaneousIcons from '@/icons/miscellaneous';
import { useTheme } from '@shared/hooks/useTheme';

const { Check } = MiscellaneousIcons;

interface DailyHabitProgressIndicatorProps {
  completionRate: number;
}

const DailyHabitProgressIndicator = memo(function DailyHabitProgressIndicator({
  completionRate,
}: DailyHabitProgressIndicatorProps) {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const arcGradientId = useId();

  const displayRate = useMemo(
    () => (Number.isNaN(completionRate) ? 0 : completionRate),
    [completionRate],
  );

  const radius = 42;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = useMemo(
    () => circumference * (1 - displayRate / 100),
    [displayRate, circumference],
  );
  const strokeWidth = displayRate === 100 ? 9.5 : 8.5;

  const shimmerBackground = useMemo(() => {
    if (isDark) {
      // Light green shimmer in dark mode (mix brand with white)
      return 'radial-gradient(circle, color-mix(in oklab, var(--color-brand-primary) 30%, white 70%) 0%, color-mix(in oklab, var(--color-brand-primary) 15%, white 85%) 35%, rgba(255,255,255,0) 70%)';
    }
    // Dark pink shimmer in light mode (mix brand tertiary with black)
    return 'radial-gradient(circle, color-mix(in oklab, var(--color-brand-tertiary) 70%, white 80%) 0%, color-mix(in oklab, var(--color-brand-tertiary) 50%, white 80%) 35%, rgba(0,0,0,0) 70%)';
  }, [isDark]);

  return (
    <div
      className="flex shrink-0 flex-col items-center justify-center sm:mt-4 sm:mb-8 lg:mt-6 lg:mb-6"
      aria-label={`Daily habit completion: ${displayRate}%`}
    >
      {/* Compact jewel ring inside the horizontal mobile hero card; spacious glass ring on sm+. */}
      <div className="relative h-26 w-26 sm:h-60 sm:w-60 md:h-64 md:w-64">
        {/* Glass badge backdrop (desktop/tablet) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-(--color-surface)/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-(--color-border-primary)/40 backdrop-blur-xl ring-inset max-sm:hidden dark:bg-(--color-surface-secondary)/40"
        />

        <div className="relative h-full w-full">
          <svg
            className="h-full w-full overflow-visible"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={arcGradientId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--color-brand-primary)" />
                <stop
                  offset="100%"
                  stopColor={
                    isDark
                      ? 'var(--color-brand-text-light)'
                      : 'var(--color-brand-secondary)'
                  }
                />
              </linearGradient>
            </defs>

            {/* Brand-tinted Apple Watch-style recessed track */}
            <circle
              aria-hidden="true"
              className="text-(--color-brand-primary)/16 dark:text-(--color-brand-primary)/20"
              strokeWidth={8.5}
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="50"
              cy="50"
            />

            {/* Main glowing progress arc (hidden at 0% so round caps never leave a 12-o'clock dot in WebKit) */}
            <motion.circle
              aria-hidden="true"
              stroke={`url(#${arcGradientId})`}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              strokeOpacity={displayRate > 0 ? 1 : 0}
              fill="transparent"
              r={radius}
              cx="50"
              cy="50"
              transform="rotate(-90 50 50)"
              style={{
                filter:
                  displayRate > 0
                    ? 'drop-shadow(0 0 5px color-mix(in oklab, var(--color-brand-primary) 48%, transparent))'
                    : undefined,
              }}
              initial={{ strokeDashoffset: radius * 2 * Math.PI }}
              animate={{
                strokeDashoffset,
              }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>

          {/* Central display */}
          <div className="absolute inset-0 flex items-center justify-center">
            {displayRate === 100 ? (
              <motion.div
                className="pointer-events-none absolute inset-0"
                initial={{ opacity: 0.9 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                aria-hidden
              >
                {/* Radial shimmer */}
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: '120%',
                    height: '120%',
                    background: shimmerBackground,
                  }}
                  initial={{ scale: 0.7, opacity: 0.9 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </motion.div>
            ) : null}
            {displayRate === 100 ? (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.2, 1], opacity: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              >
                <div className="rounded-full p-2 sm:p-5" aria-hidden="true">
                  <Check className="h-11 w-11 text-(--color-brand-primary) sm:h-28 sm:w-28" />
                </div>
              </motion.div>
            ) : (
              <motion.div
                className="flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-[26px] leading-none font-bold tracking-tight text-(--color-foreground) tabular-nums sm:text-5xl sm:font-extrabold">
                  {displayRate}%
                </span>
                <span className="mt-1 text-sm text-(--color-text-secondary) max-sm:hidden">
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
