// The progress page's achievements panel: how many are earned, and the few closest to being earned.
// Its button opens the full list, with the category filter, below the page's panels.

import { memo } from 'react';
import { ChevronDown } from 'lucide-react';
import { IosHapticTarget } from '@shared/components/ui/ios-haptic-target';
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

/** How much is left to do: the target, or the requirement when there is no progress yet. */
function target(achievement: Achievement): number {
  return achievement.progress?.targetValue ?? achievement.requirementValue;
}

/**
 * The unearned achievements furthest along, furthest first. Among those
 * equally far along, as when nothing is started, the Getting Started ones
 * and then the smallest targets come first, so a new user sees wins within
 * reach rather than a perfect month.
 */
function nextUp(achievements: Achievement[]): Achievement[] {
  return achievements
    .filter((achievement) => !achievement.isEarned)
    .sort(
      (a, b) =>
        (b.progress?.progressPercentage ?? 0) -
          (a.progress?.progressPercentage ?? 0) ||
        Number(b.category === 'getting_started') -
          Number(a.category === 'getting_started') ||
        target(a) - target(b),
    )
    .slice(0, NEXT_UP_COUNT);
}

function ProgressBar({
  percent,
  label,
  prominent = false,
}: {
  percent: number;
  label?: string;
  prominent?: boolean;
}) {
  const clamped = Math.min(100, Math.max(0, Math.round(percent)));
  return (
    <div
      role={label ? 'progressbar' : undefined}
      aria-label={label}
      aria-valuenow={label ? clamped : undefined}
      aria-valuemin={label ? 0 : undefined}
      aria-valuemax={label ? 100 : undefined}
      aria-hidden={label ? undefined : true}
      className={cn(
        'w-full overflow-hidden rounded-full bg-(--color-brand-primary)/16',
        prominent ? 'h-2' : 'h-1.5',
      )}
    >
      <div
        className="h-full rounded-full bg-(--color-brand-primary) shadow-[0_0_8px_color-mix(in_oklab,var(--color-brand-primary)_40%,transparent)] transition-[width] duration-500"
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
      className="ios-tracker-card flex flex-col rounded-[26px] p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-2">
        <h2
          id="achievements-heading"
          className="text-[18px] font-bold tracking-[-0.02em] text-(--color-foreground)"
        >
          Achievements
        </h2>
        {!loading && !error && (
          <span className="rounded-full bg-(--color-brand-primary)/12 px-2.5 py-0.5 text-xs font-semibold text-(--color-brand-text) tabular-nums dark:text-(--color-brand-text-light)">
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
          <div className="mt-3.5">
            <ProgressBar
              percent={percent}
              label="Achievements earned"
              prominent
            />
          </div>

          {upcoming.length > 0 ? (
            <>
              <h3 className="mt-5 text-[11px] font-semibold tracking-[0.06em] text-(--color-text-secondary)/85 uppercase">
                Next up
              </h3>
              <ul aria-label="Next up" className="mt-2.5 space-y-2">
                {upcoming.map((achievement) => {
                  const Icon = getAchievementIcon(achievement.icon);
                  const progress = achievement.progress;
                  return (
                    <li
                      key={achievement.id}
                      className="flex items-center gap-3 rounded-2xl bg-(--color-brand-primary)/6 p-2.5 ring-1 ring-(--color-brand-primary)/12 ring-inset"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-[13px] bg-(--color-brand-primary)/14 text-(--color-brand-primary) ring-1 ring-(--color-brand-primary)/24 ring-inset">
                        <Icon aria-hidden="true" className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[14px] font-semibold text-(--color-foreground)">
                            {achievement.name}
                          </p>
                          {progress && (
                            <span className="shrink-0 rounded-full bg-(--color-brand-primary)/12 px-2 py-0.5 text-[11px] font-semibold text-(--color-brand-text) tabular-nums dark:text-(--color-brand-text-light)">
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

          <IosHapticTarget className="mt-4 block w-full rounded-2xl">
            <button
              type="button"
              onClick={onToggleList}
              aria-expanded={isListOpen}
              aria-controls="all-achievements"
              className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-2xl bg-(--color-brand-primary)/12 px-4 text-sm font-semibold text-(--color-brand-text) ring-1 ring-(--color-brand-primary)/20 transition-[background-color,transform] ring-inset hover:bg-(--color-brand-primary)/18 focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:outline-none active:scale-[0.985] dark:text-(--color-brand-text-light)"
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
          </IosHapticTarget>
        </>
      )}
    </section>
  );
});

export default AchievementsSummary;
