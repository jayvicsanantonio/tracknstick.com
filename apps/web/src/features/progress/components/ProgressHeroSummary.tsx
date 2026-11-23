// All-Time Progress hero card shared across phone, tablet, and desktop:
// lifetime check-ins scoreboard, all-time consistency meter, "Since" journey pill,
// and a recessed metrics tray (2x2 on phones, 4-across strip on md+ tablet/desktop).
// Every metric is fetched from the database across the user's entire history
// with fixed heights so loading and month navigation below never shift layout.

import { memo, type ComponentType } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CalendarDays, Flame, Sparkles, Trophy } from 'lucide-react';
import { plural } from '@shared/utils/plural';
import { cn } from '@shared/utils/utils';

interface ProgressHeroSummaryProps {
  totalCompletions: number;
  overallCompletionRate: number | null;
  activeDays: number;
  perfectDays: number;
  currentStreak: number;
  longestStreak: number;
  activeHabitsCount: number;
  memberSince: string | null;
  isBestStreak: boolean;
  isLoading: boolean;
}

interface MetricTileProps {
  Icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  label: string;
  spokenLabel?: string;
  value: number;
  badge?: string;
  isLoading: boolean;
  className?: string;
}

const MONTH_YEAR_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

function formatMemberSince(dateKey: string | null): string {
  if (!dateKey) return 'Day 1';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) return 'All-time';
  const utcMidday = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12),
  );
  if (Number.isNaN(utcMidday.getTime())) return 'All-time';
  return `Since ${MONTH_YEAR_FORMATTER.format(utcMidday)}`;
}

const MetricTile = memo(function MetricTile({
  Icon,
  label,
  spokenLabel,
  value,
  badge,
  isLoading,
  className,
}: MetricTileProps) {
  const unit = plural(value, 'day');
  const accessibleName = spokenLabel ?? label;
  const spoken = isLoading
    ? `${accessibleName}: loading`
    : `${accessibleName}: ${value} ${unit}${badge ? `, ${badge.toLowerCase()}` : ''}`;

  return (
    <div
      role="status"
      aria-label={spoken}
      aria-busy={isLoading}
      className={cn(
        'flex min-w-0 items-center gap-2.5 px-2.5 py-2.5 sm:gap-3 sm:px-4 sm:py-3.5',
        className,
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-(--color-brand-primary)/14 text-(--color-brand-primary) ring-1 ring-(--color-brand-primary)/22 ring-inset sm:size-9 sm:rounded-[11px]">
        <Icon aria-hidden={true} className="size-4 sm:size-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex h-5 items-center sm:h-6">
          {isLoading ? (
            <span className="h-4 w-12 animate-pulse rounded-md bg-(--color-brand-primary)/14 motion-reduce:animate-none" />
          ) : (
            <p className="inline-flex min-w-0 items-baseline gap-1">
              <span className="text-[17px] leading-none font-bold tracking-[-0.02em] text-(--color-foreground) tabular-nums sm:text-[20px]">
                {value.toLocaleString()}
              </span>
              <span className="truncate text-[12px] font-medium text-(--color-text-secondary) sm:text-[13px]">
                {unit}
              </span>
            </p>
          )}
        </div>
        <p className="mt-0.5 h-3.5 truncate text-[11px] leading-3.5 font-medium text-(--color-text-secondary) sm:h-4 sm:text-[12px] sm:leading-4">
          {badge && !isLoading ? (
            <>
              <span>Streak</span>
              <span aria-hidden="true" className="mx-1 opacity-50">
                ·
              </span>
              <span className="font-semibold text-(--color-brand-primary)">
                {badge}
              </span>
            </>
          ) : (
            label
          )}
        </p>
      </div>
    </div>
  );
});

const ProgressHeroSummary = memo(function ProgressHeroSummary({
  totalCompletions,
  overallCompletionRate,
  activeDays,
  perfectDays,
  currentStreak,
  longestStreak,
  activeHabitsCount,
  memberSince,
  isBestStreak,
  isLoading,
}: ProgressHeroSummaryProps) {
  const prefersReducedMotion = useReducedMotion();

  const numericRate =
    !isLoading && overallCompletionRate !== null
      ? Math.min(100, Math.max(0, overallCompletionRate))
      : 0;

  const checkInUnit = plural(totalCompletions, 'check-in');
  const completionsSpoken = isLoading
    ? 'Total check-ins: loading'
    : `Total check-ins: ${totalCompletions} ${checkInUnit}`;

  const consistencySpoken = isLoading
    ? 'All-time consistency: loading'
    : `All-time consistency: ${overallCompletionRate === null ? 'no data yet' : `${overallCompletionRate}%`}`;

  const activeHabitsSubtitle =
    activeHabitsCount > 0
      ? `Tracking ${activeHabitsCount} active ${plural(activeHabitsCount, 'habit')}`
      : 'No active habits yet';

  return (
    <section
      aria-label="All-time progress summary"
      className="ios-tracker-card relative overflow-hidden rounded-[26px] p-5 sm:p-6"
    >
      {/* Row 1: All-Time eyebrow + Since journey pill */}
      <div className="relative z-10 flex h-6 items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-(--color-brand-primary) shadow-[0_0_6px_var(--color-brand-primary)]"
          />
          <p className="text-[11px] leading-none font-semibold tracking-[0.09em] text-(--color-brand-primary) uppercase">
            All-time
          </p>
        </div>

        <span className="inline-flex h-6 items-center rounded-full bg-(--color-brand-primary)/10 px-2.5 text-[11px] font-medium text-(--color-brand-text) ring-1 ring-(--color-brand-primary)/18 ring-inset dark:text-(--color-brand-text-light)">
          {isLoading ? (
            <span className="h-2.5 w-16 animate-pulse rounded-full bg-(--color-brand-primary)/18 motion-reduce:animate-none" />
          ) : (
            formatMemberSince(memberSince)
          )}
        </span>
      </div>

      {/* Row 2: Lifetime check-ins hero numeral + all-time consistency score */}
      <div className="relative z-10 mt-3.5 flex items-end justify-between gap-4 sm:mt-4">
        <div
          role="status"
          aria-label={completionsSpoken}
          aria-busy={isLoading}
          className="min-w-0 flex-1"
        >
          <div className="flex h-9 items-baseline gap-1.5 sm:h-11 sm:gap-2">
            {isLoading ? (
              <span className="h-8 w-24 animate-pulse rounded-lg bg-(--color-brand-primary)/14 motion-reduce:animate-none sm:h-10 sm:w-28" />
            ) : (
              <>
                <span className="text-[36px] leading-none font-extrabold tracking-[-0.035em] text-(--color-foreground) tabular-nums sm:text-[42px]">
                  {totalCompletions.toLocaleString()}
                </span>
                <span className="truncate text-[13px] font-semibold text-(--color-text-secondary) sm:text-[15px]">
                  {checkInUnit}
                </span>
              </>
            )}
          </div>
          <div className="mt-1.5 flex h-4 items-center sm:h-5">
            {isLoading ? (
              <span className="h-3 w-32 animate-pulse rounded-full bg-(--color-brand-primary)/12 motion-reduce:animate-none" />
            ) : (
              <p className="truncate text-[12px] leading-4 font-medium text-(--color-text-secondary) sm:text-[13px]">
                {activeHabitsSubtitle}
              </p>
            )}
          </div>
        </div>

        <div
          role="status"
          aria-label={consistencySpoken}
          aria-busy={isLoading}
          className="flex shrink-0 flex-col items-end"
        >
          <div className="flex h-9 items-end sm:h-11">
            {isLoading ? (
              <span className="h-7 w-14 animate-pulse rounded-lg bg-(--color-brand-primary)/14 motion-reduce:animate-none sm:h-9 sm:w-16" />
            ) : overallCompletionRate === null ? (
              <span className="text-[24px] leading-none font-bold text-(--color-text-secondary) sm:text-[28px]">
                —
              </span>
            ) : (
              <span className="text-[28px] leading-none font-bold tracking-[-0.03em] text-(--color-brand-primary) tabular-nums sm:text-[34px]">
                {overallCompletionRate}%
              </span>
            )}
          </div>
          <p className="mt-1.5 h-4 text-[11px] leading-4 font-medium text-(--color-text-secondary) sm:h-5 sm:text-xs">
            consistency
          </p>
        </div>
      </div>

      {/* Row 3: Precision lifetime consistency meter with subtle quartile ticks */}
      <div
        aria-hidden="true"
        className="relative z-10 mt-3.5 h-2.5 w-full overflow-hidden rounded-full bg-(--color-brand-primary)/12 ring-1 ring-(--color-brand-primary)/16 ring-inset sm:mt-4 dark:bg-(--color-brand-primary)/16"
      >
        <motion.div
          className="h-full rounded-full bg-(--color-brand-primary) shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
          style={{
            boxShadow:
              numericRate > 0
                ? 'inset 0 1px 0 rgba(255,255,255,0.35), 0 0 10px color-mix(in oklab, var(--color-brand-primary) 45%, transparent)'
                : undefined,
          }}
          initial={false}
          animate={{ width: `${numericRate}%` }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
          }
        />
        <span className="pointer-events-none absolute inset-y-0 left-1/4 w-px bg-(--color-background)/35" />
        <span className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-(--color-background)/35" />
        <span className="pointer-events-none absolute inset-y-0 left-3/4 w-px bg-(--color-background)/35" />
      </div>

      {/* Row 4: Unified recessed lifetime metrics tray (2x2 on phone/tablet, 4-across on lg+ desktop) */}
      <div className="relative z-10 mt-4 grid grid-cols-2 overflow-hidden rounded-2xl bg-(--color-brand-primary)/[0.055] ring-1 ring-(--color-brand-primary)/14 ring-inset sm:mt-5 lg:grid-cols-4">
        <MetricTile
          Icon={Flame}
          label="Current streak"
          value={currentStreak}
          badge={isBestStreak ? 'Best yet' : undefined}
          isLoading={isLoading}
        />
        <MetricTile
          Icon={Trophy}
          label="Longest streak"
          value={longestStreak}
          isLoading={isLoading}
          className="border-l border-(--color-brand-primary)/14"
        />
        <MetricTile
          Icon={CalendarDays}
          label="Active days"
          value={activeDays}
          isLoading={isLoading}
          className="border-t border-(--color-brand-primary)/14 lg:border-t-0 lg:border-l"
        />
        <MetricTile
          Icon={Sparkles}
          label="Perfect days"
          value={perfectDays}
          isLoading={isLoading}
          className="border-t border-l border-(--color-brand-primary)/14 lg:border-t-0"
        />
      </div>
    </section>
  );
});

export default ProgressHeroSummary;
