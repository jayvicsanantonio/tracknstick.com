// A round medal for an achievement level: bronze, silver, gold or platinum once earned, a faint brand ring before.
// It names its medal for screen readers unless it only repeats what the text beside it says.

import { memo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@shared/utils/utils';
import type { Medal } from '../utils/achievementTracks';

const MEDAL_FILL: Record<Medal, string> = {
  bronze: 'bg-(--color-medal-bronze)',
  silver: 'bg-(--color-medal-silver)',
  gold: 'bg-(--color-medal-gold)',
  platinum: 'bg-(--color-medal-platinum)',
};

const MEDAL_NAME: Record<Medal, string> = {
  bronze: 'Bronze medal',
  silver: 'Silver medal',
  gold: 'Gold medal',
  platinum: 'Platinum medal',
};

interface AchievementMedalProps {
  /** The medal earned, or null before any is. */
  medal: Medal | null;
  Icon: LucideIcon;
  size?: 'sm' | 'md';
  /** Hidden from screen readers when the text beside it says the same. */
  decorative?: boolean;
}

const AchievementMedal = memo(function AchievementMedal({
  medal,
  Icon,
  size = 'md',
  decorative = false,
}: AchievementMedalProps) {
  return (
    <span
      role={decorative ? undefined : 'img'}
      aria-label={
        decorative ? undefined : medal ? MEDAL_NAME[medal] : 'No medal yet'
      }
      aria-hidden={decorative ? true : undefined}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full',
        size === 'sm' ? 'size-8' : 'size-11',
        medal
          ? cn(
              MEDAL_FILL[medal],
              'text-(--color-medal-foreground) shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_2px_8px_rgba(0,0,0,0.18)] ring-2 ring-white/35 ring-inset',
            )
          : 'bg-(--color-brand-primary)/8 text-(--color-brand-primary)/70 ring-1 ring-(--color-brand-primary)/20 ring-inset',
      )}
    >
      <Icon
        aria-hidden="true"
        className={size === 'sm' ? 'size-4' : 'size-5'}
      />
    </span>
  );
});

export default AchievementMedal;
