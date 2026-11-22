// Mobile (< sm) Progress hero card: Apple Fitness-style monthly completion ring paired
// with a contextual monthly readout, perfect-days pill, and a recessed dual-streak tray.
// Exposes all four metrics as accessible `role="status"` elements with fixed heights
// so switching months never shifts layout.

import { memo, useId } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Flame, Trophy } from 'lucide-react';
import { useTheme } from '@shared/hooks/useTheme';
import { plural } from '@shared/utils/plural';

interface ProgressHeroSummaryProps {
  monthName: string;
  averageRate: number | null;
  perfectDays: number;
  currentStreak: number;
  longestStreak: number;
  isBestStreak: boolean;
  isHistoryLoading: boolean;
  isStreaksLoading: boolean;
}

const RING_RADIUS = 41;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function monthlyHeadline(averageRate: number | null): string {
  if (averageRate === null) return 'No habits logged';
  if (averageRate >= 100) return 'Perfect month!';
  if (averageRate >= 80) return 'Strong momentum';
  if (averageRate >= 50) return 'Steady progress';
  if (averageRate > 0) return 'Building rhythm';
  return 'Fresh start';
}

const ProgressHeroSummary = memo(function ProgressHeroSummary({
  monthName,
  averageRate,
  perfectDays,
  currentStreak,
  longestStreak,
  isBestStreak,
  isHistoryLoading,
  isStreaksLoading,
}: ProgressHeroSummaryProps) {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const arcGradientId = useId();

  const numericRate =
    !isHistoryLoading && averageRate !== null
      ? Math.min(100, Math.max(0, averageRate))
      : 0;
  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - numericRate / 100);
  const streakRatio =
    !isStreaksLoading && longestStreak > 0
      ? Math.min(100, Math.round((currentStreak / longestStreak) * 100))
      : 0;

  const avgSpoken = isHistoryLoading
    ? `${monthName} average: loading`
    : `${monthName} average: ${averageRate === null ? 'no data yet' : `${averageRate}%`}`;

  const perfectDaysUnit = plural(perfectDays, 'day');
  const perfectDaysSpoken = isHistoryLoading
    ? `Perfect days in ${monthName}: loading`
    : `Perfect days in ${monthName}: ${perfectDays} ${perfectDaysUnit}`;

  const currentUnit = plural(currentStreak, 'day');
  const currentSpoken = isStreaksLoading
    ? 'Current streak: loading'
    : `Current streak: ${currentStreak} ${currentUnit}${isBestStreak ? ', best yet' : ''}`;

  const longestUnit = plural(longestStreak, 'day');
  const longestSpoken = isStreaksLoading
    ? 'Longest streak: loading'
    : `Longest streak: ${longestStreak} ${longestUnit}`;

  return (
    <section
      aria-label="Progress summary"
      className="ios-tracker-card relative overflow-hidden rounded-[26px] p-5"
    >
      {/* Layered ambient aura behind the monthly ring (mirrors Tracker Hero Card) */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -top-14 -left-14 size-48 rounded-full bg-(--color-brand-primary) blur-3xl transition-opacity duration-500 ${
          numericRate >= 80 ? 'opacity-24' : 'opacity-14'
        }`}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -bottom-12 size-36 rounded-full bg-(--color-brand-primary)/10 blur-3xl"
      />

      {/* Top Hero Row: precision 104px ring (exact match with Tracker) + narrative + perfect-days pill */}
      <div className="relative z-10 flex items-center gap-5">
        <div
          role="status"
          aria-label={avgSpoken}
          aria-busy={isHistoryLoading}
          className="relative size-26 shrink-0"
        >
          <svg
            className="size-full overflow-visible"
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

            {/* Subtle recessed inner watch dial */}
            <circle
              cx="50"
              cy="50"
              r="34"
              className="fill-(--color-brand-primary)/[0.05] stroke-(--color-brand-primary)/12"
              strokeWidth="0.8"
            />

            {/* Brand-tinted recessed track */}
            <circle
              className="text-(--color-brand-primary)/16 dark:text-(--color-brand-primary)/20"
              strokeWidth={9}
              stroke="currentColor"
              fill="transparent"
              r={RING_RADIUS}
              cx="50"
              cy="50"
            />

            {/* Luminous gradient progress arc */}
            <motion.circle
              stroke={`url(#${arcGradientId})`}
              strokeWidth={9}
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              strokeOpacity={numericRate > 0 ? 1 : 0}
              fill="transparent"
              r={RING_RADIUS}
              cx="50"
              cy="50"
              transform="rotate(-90 50 50)"
              style={{
                filter:
                  numericRate > 0
                    ? 'drop-shadow(0 0 6px color-mix(in oklab, var(--color-brand-primary) 50%, transparent))'
                    : undefined,
              }}
              initial={false}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isHistoryLoading ? (
              <span className="h-6 w-10 animate-pulse rounded-md bg-(--color-brand-primary)/14 motion-reduce:animate-none" />
            ) : averageRate === null ? (
              <>
                <span className="text-[22px] leading-none font-bold text-(--color-text-secondary)">
                  —
                </span>
                <span className="mt-1 text-[9px] leading-none font-semibold tracking-[0.06em] text-(--color-text-secondary)/75 uppercase">
                  No data
                </span>
              </>
            ) : (
              <>
                <span className="text-[25px] leading-none font-bold tracking-[-0.025em] text-(--color-foreground) tabular-nums">
                  {averageRate}%
                </span>
                <span className="mt-1 text-[9px] leading-none font-semibold tracking-[0.08em] text-(--color-text-secondary)/80 uppercase">
                  Avg
                </span>
              </>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex h-4 items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-(--color-brand-primary)"
            />
            <p className="truncate text-[11px] leading-4 font-semibold tracking-[0.08em] text-(--color-brand-primary) uppercase">
              {monthName}
            </p>
          </div>

          {isHistoryLoading ? (
            <span className="mt-1 block h-6 w-32 animate-pulse rounded-full bg-(--color-brand-primary)/14 motion-reduce:animate-none" />
          ) : (
            <p className="mt-0.5 h-6 truncate text-[20px] leading-6 font-bold tracking-[-0.025em] text-(--color-foreground)">
              {monthlyHeadline(averageRate)}
            </p>
          )}

          <div
            role="status"
            aria-label={perfectDaysSpoken}
            aria-busy={isHistoryLoading}
            className="mt-2.5 inline-flex h-7 max-w-full items-center gap-1.5 rounded-full bg-(--color-brand-primary)/12 px-2.5 text-[12px] font-semibold text-(--color-brand-text) shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-(--color-brand-primary)/22 ring-inset dark:text-(--color-brand-text-light)"
          >
            <CalendarCheck
              aria-hidden="true"
              className="size-3.5 shrink-0 text-(--color-brand-primary)"
            />
            {isHistoryLoading ? (
              <span className="h-3 w-20 animate-pulse rounded-full bg-(--color-brand-primary)/16 motion-reduce:animate-none" />
            ) : (
              <span className="truncate tabular-nums">
                {perfectDays} perfect {perfectDaysUnit}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Recessed Dual-Streak Tray with subtle streak-to-record progress rail */}
      <div className="relative z-10 mt-4 overflow-hidden rounded-2xl bg-(--color-brand-primary)/[0.06] ring-1 ring-(--color-brand-primary)/14 ring-inset">
        <div className="grid grid-cols-2 divide-x divide-(--color-brand-primary)/14">
          <div
            role="status"
            aria-label={currentSpoken}
            aria-busy={isStreaksLoading}
            className="flex min-w-0 items-center gap-2.5 px-3 py-2.5"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-(--color-brand-primary)/14 text-(--color-brand-primary) ring-1 ring-(--color-brand-primary)/22 ring-inset">
              <Flame aria-hidden="true" className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex h-5 items-center gap-1.5">
                {isStreaksLoading ? (
                  <span className="h-4 w-12 animate-pulse rounded-md bg-(--color-brand-primary)/14 motion-reduce:animate-none" />
                ) : (
                  <p className="inline-flex min-w-0 items-baseline gap-1">
                    <span className="text-[17px] leading-none font-bold tracking-[-0.02em] text-(--color-foreground) tabular-nums">
                      {currentStreak}
                    </span>
                    <span className="truncate text-[12px] font-medium text-(--color-text-secondary)">
                      {currentUnit}
                    </span>
                  </p>
                )}
                {isBestStreak && !isStreaksLoading ? (
                  <span className="ml-auto shrink-0 rounded-full bg-(--color-brand-primary)/18 px-1.5 py-0.5 text-[8px] leading-none font-bold tracking-wide text-(--color-brand-text) uppercase ring-1 ring-(--color-brand-primary)/25 ring-inset dark:text-(--color-brand-text-light)">
                    Best yet
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 h-3.5 truncate text-[11px] leading-3.5 font-medium text-(--color-text-secondary)">
                Current streak
              </p>
            </div>
          </div>

          <div
            role="status"
            aria-label={longestSpoken}
            aria-busy={isStreaksLoading}
            className="flex min-w-0 items-center gap-2.5 px-3 py-2.5"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-(--color-brand-primary)/14 text-(--color-brand-primary) ring-1 ring-(--color-brand-primary)/22 ring-inset">
              <Trophy aria-hidden="true" className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex h-5 items-center">
                {isStreaksLoading ? (
                  <span className="h-4 w-12 animate-pulse rounded-md bg-(--color-brand-primary)/14 motion-reduce:animate-none" />
                ) : (
                  <p className="inline-flex min-w-0 items-baseline gap-1">
                    <span className="text-[17px] leading-none font-bold tracking-[-0.02em] text-(--color-foreground) tabular-nums">
                      {longestStreak}
                    </span>
                    <span className="truncate text-[12px] font-medium text-(--color-text-secondary)">
                      {longestUnit}
                    </span>
                  </p>
                )}
              </div>
              <p className="mt-0.5 h-3.5 truncate text-[11px] leading-3.5 font-medium text-(--color-text-secondary)">
                Longest streak
              </p>
            </div>
          </div>
        </div>

        {/* Always-mounted 3px streak-to-record progress rail (zero layout shift) */}
        <div
          aria-hidden="true"
          className="h-[3px] w-full bg-(--color-brand-primary)/10"
        >
          <div
            className="h-full rounded-r-full bg-(--color-brand-primary) shadow-[0_0_8px_color-mix(in_oklab,var(--color-brand-primary)_50%,transparent)] transition-[width] duration-500 ease-out"
            style={{ width: `${streakRatio}%` }}
          />
        </div>
      </div>
    </section>
  );
});

export default ProgressHeroSummary;
