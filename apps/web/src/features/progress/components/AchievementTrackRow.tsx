// One track in the full achievement list: its medal, the level reached, and the next target with what is left.
// Tapping the row opens the list of every level, each earned on a date or still to reach.

import { memo, useId, useState } from 'react';
import {
  Calendar,
  CheckCircle,
  ChevronDown,
  Flame,
  Sparkles,
  Target,
  type LucideIcon,
} from 'lucide-react';
import type { AchievementTrack } from '@tracknstick/contracts';
import { IosHapticTarget } from '@shared/components/ui/ios-haptic-target';
import { triggerHaptic } from '@shared/utils/haptics';
import { cn } from '@shared/utils/utils';
import AchievementMedal from './AchievementMedal';
import NewMark from './NewMark';
import { getAchievementIcon } from '../utils/achievementIcons';
import {
  describeRemaining,
  formatProgress,
} from '../utils/achievementRemaining';
import {
  medalFor,
  type AchievementTrackGroup,
} from '../utils/achievementTracks';
import { formatEarnedDate } from '../utils/formatEarnedDate';

const TRACK_ICONS: Record<AchievementTrack, LucideIcon> = {
  check_ins: CheckCircle,
  streak: Flame,
  active_days: Calendar,
  perfect_days: Sparkles,
  habits: Target,
};

interface AchievementTrackRowProps {
  group: AchievementTrackGroup;
  /** The streak running now, which the streak track counts from. */
  currentStreak: number;
  /** Ids of achievements earned since the last visit, marked new. */
  newIds: ReadonlySet<string>;
}

const AchievementTrackRow = memo(function AchievementTrackRow({
  group,
  currentStreak,
  newIds,
}: AchievementTrackRowProps) {
  const [open, setOpen] = useState(false);
  const levelsId = useId();
  const { track, label, levels, earnedCount, next } = group;
  const medal = earnedCount > 0 ? medalFor(earnedCount, levels.length) : null;
  const remaining = next ? describeRemaining(next, currentStreak) : null;
  const hasNew = levels.some((level) => newIds.has(level.id));
  const percent = Math.min(
    100,
    Math.max(0, Math.round(next?.progress?.progressPercentage ?? 0)),
  );

  return (
    <div className="ios-tracker-card rounded-[20px]">
      <IosHapticTarget className="block w-full rounded-[20px]">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={levelsId}
          onClick={() => {
            triggerHaptic('selection');
            setOpen((isOpen) => !isOpen);
          }}
          className="flex w-full cursor-pointer items-start gap-3 rounded-[20px] p-4 text-left transition-transform focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:outline-none active:scale-[0.99]"
        >
          <AchievementMedal medal={medal} Icon={TRACK_ICONS[track]} />

          <span className="block min-w-0 flex-1">
            <span className="flex items-baseline justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <span className="text-[15px] font-semibold text-(--color-foreground)">
                  {label}
                </span>
                {hasNew && <NewMark />}
              </span>
              <span className="shrink-0 text-xs font-medium text-(--color-text-secondary) tabular-nums">
                Level {earnedCount} of {levels.length}
              </span>
            </span>

            {next ? (
              <>
                <span className="mt-1 flex items-baseline justify-between gap-2 text-xs">
                  <span className="truncate text-(--color-text-secondary)">
                    Next: {next.name}
                  </span>
                  {next.progress && (
                    <span className="shrink-0 font-semibold text-(--color-brand-text) tabular-nums dark:text-(--color-brand-text-light)">
                      {formatProgress(next)}
                    </span>
                  )}
                </span>
                <span
                  aria-hidden="true"
                  className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-(--color-brand-primary)/16"
                >
                  <span
                    className="block h-full rounded-full bg-(--color-brand-primary) transition-[width] duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </span>
                {remaining && (
                  <span className="mt-1.5 block text-xs font-medium text-(--color-foreground)">
                    {remaining}
                  </span>
                )}
              </>
            ) : (
              <span className="mt-1 block text-xs font-medium text-(--color-brand-text) dark:text-(--color-brand-text-light)">
                Every level earned
              </span>
            )}

            <span aria-hidden="true" className="mt-2 flex flex-wrap gap-1">
              {levels.map((level) => (
                <span
                  key={level.id}
                  className={cn(
                    'size-1.5 rounded-full',
                    level.isEarned
                      ? 'bg-(--color-brand-primary)'
                      : 'bg-(--color-brand-primary)/20',
                  )}
                />
              ))}
            </span>
          </span>

          <ChevronDown
            aria-hidden="true"
            className={cn(
              'mt-1 size-4 shrink-0 text-(--color-text-secondary) transition-transform',
              open && 'rotate-180',
            )}
          />
        </button>
      </IosHapticTarget>

      {open && (
        <ol
          id={levelsId}
          aria-label={`${label} levels`}
          className="space-y-2.5 border-t border-(--color-brand-primary)/12 px-4 pt-3 pb-4"
        >
          {levels.map((level, index) => (
            <li key={level.id} className="flex items-center gap-3">
              <AchievementMedal
                medal={
                  level.isEarned ? medalFor(index + 1, levels.length) : null
                }
                Icon={getAchievementIcon(level.icon)}
                size="sm"
                decorative
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      level.isEarned
                        ? 'text-(--color-foreground)'
                        : 'text-(--color-text-secondary)',
                    )}
                  >
                    {level.name}
                  </p>
                  {newIds.has(level.id) && <NewMark />}
                </div>
                <span className="block text-xs text-(--color-text-secondary)">
                  {level.description}
                </span>
              </div>
              <span className="shrink-0 text-right text-xs font-medium text-(--color-brand-text) tabular-nums dark:text-(--color-brand-text-light)">
                {level.isEarned && level.earnedAt
                  ? formatEarnedDate(level.earnedAt)
                  : formatProgress(level)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
});

export default AchievementTrackRow;
