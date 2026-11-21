// The progress page's achievements panel: how many are earned, and the few closest to being earned.
// Its button opens the full list, with the category filter, below the page's panels.

import { memo } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@shared/utils/utils';
import { Achievement, AchievementStats } from '../types/Achievement';
import { getAchievementIcon } from '../utils/achievementIcons';

/** How many unearned achievements the panel lists. */
const NEXT_UP_COUNT = 3;

interface AchievementsSummaryProps {
  achievements: Achievement[];
  stats: AchievementStats | null;
  loading: boolean;
  error: string | null;
  isListOpen: boolean;
  onToggleList: () => void;
}

/** The unearned achievements furthest along, furthest first. */
function nextUp(achievements: Achievement[]): Achievement[] {
  return achievements
    .filter((achievement) => !achievement.isEarned)
    .sort(
      (a, b) =>
        (b.progress?.progressPercentage ?? 0) -
        (a.progress?.progressPercentage ?? 0),
    )
    .slice(0, NEXT_UP_COUNT);
}

function ProgressBar({ percent, label }: { percent: number; label?: string }) {
  const clamped = Math.min(100, Math.max(0, Math.round(percent)));
  return (
    <div
      role={label ? 'progressbar' : undefined}
      aria-label={label}
      aria-valuenow={label ? clamped : undefined}
      aria-valuemin={label ? 0 : undefined}
      aria-valuemax={label ? 100 : undefined}
      aria-hidden={label ? undefined : true}
      className="h-1.5 w-full overflow-hidden rounded-full bg-(--color-brand-primary)/12"
    >
      <div
        className="h-full rounded-full bg-(--color-brand-primary) transition-[width] duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

const AchievementsSummary = memo(function AchievementsSummary({
  achievements,
  stats,
  loading,
  error,
  isListOpen,
  onToggleList,
}: AchievementsSummaryProps) {
  const total = stats?.totalAchievements ?? achievements.length;
  const earned =
    stats?.earnedAchievements ??
    achievements.filter((achievement) => achievement.isEarned).length;
  const percent =
    stats?.completionPercentage ?? (total > 0 ? (earned / total) * 100 : 0);
  const upcoming = nextUp(achievements);

  return (
    <section
      aria-labelledby="achievements-heading"
      className="flex flex-col rounded-2xl bg-(--color-surface)/60 p-4 ring-1 ring-(--color-border-primary)/50 ring-inset sm:p-5 dark:bg-(--color-surface-secondary)/60"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2
          id="achievements-heading"
          className="text-base font-semibold text-(--color-foreground) sm:text-lg"
        >
          Achievements
        </h2>
        {!loading && !error && (
          <span className="text-sm text-(--color-text-secondary)">
            {earned} of {total} earned
          </span>
        )}
      </div>

      {loading ? (
        <p className="py-6 text-sm text-(--color-text-secondary)">
          Loading achievements…
        </p>
      ) : error ? (
        <p role="alert" className="py-6 text-sm text-(--color-text-secondary)">
          {error}
        </p>
      ) : (
        <>
          <div className="mt-3">
            <ProgressBar percent={percent} label="Achievements earned" />
          </div>

          {upcoming.length > 0 ? (
            <>
              <h3 className="mt-5 text-xs font-semibold tracking-wide text-(--color-text-secondary) uppercase">
                Next up
              </h3>
              <ul aria-label="Next up" className="mt-2 space-y-2">
                {upcoming.map((achievement) => {
                  const Icon = getAchievementIcon(achievement.icon);
                  const progress = achievement.progress;
                  return (
                    <li
                      key={achievement.id}
                      className="flex items-center gap-3 rounded-xl p-2"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-(--color-brand-primary)/12 text-(--color-brand-primary)">
                        <Icon aria-hidden="true" className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="truncate text-sm font-medium text-(--color-foreground)">
                            {achievement.name}
                          </p>
                          {progress && (
                            <span className="shrink-0 text-xs text-(--color-text-secondary) tabular-nums">
                              {progress.currentValue} / {progress.targetValue}
                            </span>
                          )}
                        </div>
                        <div className="mt-1.5">
                          <ProgressBar
                            percent={progress?.progressPercentage ?? 0}
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            achievements.length > 0 && (
              <p className="mt-5 text-sm text-(--color-text-secondary)">
                Every achievement earned.
              </p>
            )
          )}

          <button
            type="button"
            onClick={onToggleList}
            aria-expanded={isListOpen}
            aria-controls="all-achievements"
            className="mt-auto flex min-h-11 items-center justify-center gap-1.5 rounded-xl pt-4 text-sm font-semibold text-(--color-brand-text) hover:text-(--color-foreground) focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:outline-none dark:text-(--color-brand-text-light)"
          >
            {isListOpen ? 'Hide all achievements' : 'See all achievements'}
            <ChevronDown
              aria-hidden="true"
              className={cn(
                'h-4 w-4 transition-transform',
                isListOpen && 'rotate-180',
              )}
            />
          </button>
        </>
      )}
    </section>
  );
});

export default AchievementsSummary;
