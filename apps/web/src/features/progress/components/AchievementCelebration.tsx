// The sheet that celebrates a newly earned achievement: its medal, the level reached, and the next target.
// Achievements a check awards queue up in the habits UI state and are shown one at a time.

import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { AwardedAchievementResponse } from '@tracknstick/contracts';
import { useHabitsContext } from '@/features/habits/hooks/useHabitsContext';
import { DialogDescription, DialogTitle } from '@shared/components/ui/dialog';
import { IosHapticTarget } from '@shared/components/ui/ios-haptic-target';
import IosSheet from '@shared/components/ui/ios-sheet';
import { triggerHaptic } from '@shared/utils/haptics';
import AchievementMedal from './AchievementMedal';
import { useAchievements } from '../hooks/useAchievements';
import useProgressSummary from '../hooks/useProgressSummary';
import { describeCelebration } from '../utils/achievementCelebration';
import { formatProgress } from '../utils/achievementRemaining';
import { getAchievementIcon } from '../utils/achievementIcons';

interface CelebrationSheetProps {
  awarded: AwardedAchievementResponse;
  /** Whether more achievements wait after this one. */
  hasMore: boolean;
  onContinue: () => void;
}

const CelebrationSheet = memo(function CelebrationSheet({
  awarded,
  hasMore,
  onContinue,
}: CelebrationSheetProps) {
  const { achievements } = useAchievements();
  const { currentStreak } = useProgressSummary();
  const prefersReducedMotion = useReducedMotion();
  const { medal, level, next, remaining } = describeCelebration(
    awarded.key,
    achievements,
    currentStreak,
  );
  const percent = Math.min(
    100,
    Math.max(0, Math.round(next?.progress?.progressPercentage ?? 0)),
  );

  return (
    <IosSheet
      open
      onOpenChange={(open) => {
        if (!open) onContinue();
      }}
      className="sm:max-w-md"
    >
      {/* Scrolls inside the sheet's capped height on short screens. */}
      <div className="flex min-h-0 flex-col items-center overflow-y-auto px-6 pt-2 pb-[max(env(safe-area-inset-bottom),1.5rem)] text-center sm:pt-0 sm:pb-0">
        <p className="text-[11px] font-semibold tracking-[0.09em] text-(--color-brand-primary) uppercase">
          Achievement earned
        </p>

        <motion.div
          className="mt-5"
          initial={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.4, rotate: -14 }
          }
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={
            prefersReducedMotion
              ? { duration: 0.2 }
              : { type: 'spring', stiffness: 260, damping: 14, delay: 0.12 }
          }
        >
          <AchievementMedal
            medal={medal}
            Icon={getAchievementIcon(awarded.icon)}
            size="lg"
          />
        </motion.div>

        <DialogTitle className="mt-5 text-[22px] font-bold tracking-[-0.02em] text-(--color-foreground)">
          {awarded.name}
        </DialogTitle>
        <DialogDescription className="mt-1 text-sm text-(--color-text-secondary)">
          {awarded.description}
        </DialogDescription>
        {level && (
          <p className="mt-2 text-sm font-semibold text-(--color-brand-text) dark:text-(--color-brand-text-light)">
            {level}
          </p>
        )}

        {next && (
          <div className="mt-5 w-full rounded-2xl bg-(--color-brand-primary)/8 p-3.5 text-left ring-1 ring-(--color-brand-primary)/16 ring-inset">
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="truncate font-semibold text-(--color-foreground)">
                Next: {next.name}
              </span>
              {next.progress && (
                <span className="shrink-0 text-xs font-semibold text-(--color-brand-text) tabular-nums dark:text-(--color-brand-text-light)">
                  {formatProgress(next)}
                </span>
              )}
            </div>
            <div
              aria-hidden="true"
              className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-(--color-brand-primary)/16"
            >
              <div
                className="h-full rounded-full bg-(--color-brand-primary)"
                style={{ width: `${percent}%` }}
              />
            </div>
            {remaining && (
              <p className="mt-2 text-xs font-medium text-(--color-text-secondary)">
                {remaining}
              </p>
            )}
          </div>
        )}

        <IosHapticTarget className="mt-6 block w-full rounded-full">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onContinue();
            }}
            className="flex min-h-12 w-full cursor-pointer items-center justify-center rounded-full bg-(--color-brand-primary) px-6 text-[15px] font-semibold text-(--color-primary-foreground) transition-transform focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:outline-none active:scale-[0.98]"
          >
            {hasMore ? 'Next achievement' : 'Keep going'}
          </button>
        </IosHapticTarget>
      </div>
    </IosSheet>
  );
});

const AchievementCelebration = memo(function AchievementCelebration() {
  const { achievementCelebrations, dismissAchievementCelebration } =
    useHabitsContext();
  const [awarded] = achievementCelebrations;

  if (!awarded) return null;

  return (
    <CelebrationSheet
      key={awarded.key}
      awarded={awarded}
      hasMore={achievementCelebrations.length > 1}
      onContinue={dismissAchievementCelebration}
    />
  );
});

export default AchievementCelebration;
