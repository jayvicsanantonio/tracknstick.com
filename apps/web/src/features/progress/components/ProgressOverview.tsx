// The Progress page body: all-time lifetime hero summary, the month's calendar and chart,
// and achievements, which phones show right under the summary. Shares one unified
// open-canvas elevated card design across phone, tablet, and desktop.

import { useState, useCallback, useContext, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { WifiOff } from 'lucide-react';
import ProgressHeroSummary from '@/features/progress/components/ProgressHeroSummary';
import ProgressGettingStarted from '@/features/progress/components/ProgressGettingStarted';
import ProgressCalendar from '@/features/progress/components/ProgressCalendar';
import ProgressChart from '@/features/progress/components/ProgressChart';
import AchievementsSummary from '@/features/progress/components/AchievementsSummary';
import ProgressAchievements from '@/features/progress/components/ProgressAchievements';
import MobileNavBar from '@/features/layout/components/MobileNavBar';
import PageHeader from '@/features/layout/components/PageHeader';
import IosSheet from '@shared/components/ui/ios-sheet';
import { DialogDescription, DialogTitle } from '@shared/components/ui/dialog';
import { DateContext } from '@app/providers/DateContext';
import { PAGE_CONTAINER } from '@shared/constants/layout';
import { useHoldSplash } from '@shared/hooks/useHideSplash';
import { useIsMobile } from '@shared/hooks/useIsMobile';
import { triggerHaptic } from '@shared/utils/haptics';
import { cn } from '@shared/utils/utils';
import useProgressHistory from '../hooks/useProgressHistory';
import useProgressSummary from '../hooks/useProgressSummary';
import { useAchievements } from '../hooks/useAchievements';

// Unified brand-harmonized elevated panel surface across phone, tablet, and desktop.
const PANEL = 'ios-tracker-card rounded-[26px] p-5 sm:p-6';

const ProgressOverview = memo(function ProgressOverview() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const isMobile = useIsMobile();
  const dateContext = useContext(DateContext);
  const navigate = useNavigate();

  const {
    historyData,
    isLoading: isHistoryLoading,
    error: historyError,
  } = useProgressHistory(selectedMonth);
  const {
    currentStreak,
    longestStreak,
    totalCompletions,
    activeDays,
    perfectDays: lifetimePerfectDays,
    overallCompletionRate,
    activeHabitsCount,
    memberSince,
    isLoading: isSummaryLoading,
    error: summaryError,
  } = useProgressSummary();
  const {
    achievements,
    stats,
    loading: achievementsLoading,
    error: achievementsError,
  } = useAchievements();
  useHoldSplash(isSummaryLoading || isHistoryLoading);

  const loadFailed = Boolean(historyError ?? summaryError);
  // Before a first check-in, every all-time figure is zero; the page opens on
  // what to do next instead. Not while the summary loads, so it never flashes.
  const hasNoCheckIns = !isSummaryLoading && totalCompletions === 0;
  const isBestStreak = currentStreak > 0 && currentStreak >= longestStreak;

  const handleSelectCalendarDate = useCallback(
    (day: Date) => {
      dateContext?.setDate(day);
      void navigate('/');
    },
    [dateContext, navigate],
  );

  const handleToggleAchievements = useCallback(() => {
    triggerHaptic('light');
    setShowAllAchievements((open) => !open);
  }, []);

  // Next up is worked toward by checking off today's habits.
  const handleSelectNextUp = useCallback(() => {
    triggerHaptic('light');
    dateContext?.setDate(new Date());
    void navigate('/');
  }, [dateContext, navigate]);

  const achievementsSummary = (
    <AchievementsSummary
      achievements={achievements}
      stats={stats}
      loading={achievementsLoading}
      error={achievementsError}
      isListOpen={showAllAchievements}
      onToggleList={handleToggleAchievements}
      currentStreak={currentStreak}
      onSelectNextUp={handleSelectNextUp}
    />
  );

  return (
    <div className="flex h-full flex-1 flex-col">
      <MobileNavBar title="Progress" />

      <div
        className={cn(
          PAGE_CONTAINER,
          'flex flex-1 flex-col pt-1 max-sm:pb-28 sm:pb-8',
        )}
      >
        {/* Tablet & desktop page header matching phone Large Title hierarchy */}
        <PageHeader
          title="Progress"
          description="View your progress in one place"
        />

        {loadFailed ? (
          <div className="flex flex-1 items-center justify-center py-8">
            <div className="ios-tracker-card flex w-full max-w-md flex-col items-center gap-4 rounded-[26px] px-6 py-12 text-center sm:px-8">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-(--color-brand-primary)/14 text-(--color-brand-primary) ring-1 ring-(--color-brand-primary)/24 ring-inset">
                <WifiOff aria-hidden="true" className="size-5" />
              </span>
              <p role="alert" className="text-[15px] text-(--color-foreground)">
                Your progress could not be loaded. Check your connection and try
                again.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {hasNoCheckIns ? (
              <ProgressGettingStarted activeHabitsCount={activeHabitsCount} />
            ) : (
              <ProgressHeroSummary
                totalCompletions={totalCompletions}
                overallCompletionRate={overallCompletionRate}
                activeDays={activeDays}
                perfectDays={lifetimePerfectDays}
                currentStreak={currentStreak}
                longestStreak={longestStreak}
                activeHabitsCount={activeHabitsCount}
                memberSince={memberSince}
                isBestStreak={isBestStreak}
                isLoading={isSummaryLoading}
              />
            )}

            {/* Phones: achievements right under the summary, above the calendar */}
            {isMobile && achievementsSummary}

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <section
                aria-label="Calendar"
                className={cn(PANEL, 'lg:flex lg:flex-col')}
              >
                <ProgressCalendar
                  insightData={historyData}
                  loading={isHistoryLoading}
                  selectedMonth={selectedMonth}
                  setSelectedMonth={setSelectedMonth}
                  onSelectDate={handleSelectCalendarDate}
                  startedOn={memberSince}
                />
              </section>

              <div className="flex flex-col gap-4 sm:gap-6">
                <section
                  aria-labelledby="daily-completion-heading"
                  className={PANEL}
                >
                  <h2
                    id="daily-completion-heading"
                    className="mb-3 text-[18px] font-bold tracking-[-0.02em] text-(--color-foreground) sm:mb-4"
                  >
                    Daily completion
                  </h2>
                  {isHistoryLoading ? (
                    <div
                      role="status"
                      aria-label="Loading chart"
                      className="flex h-62 flex-col items-center justify-end gap-3 pt-4"
                    >
                      <div
                        aria-hidden="true"
                        className="flex h-44 w-full items-end gap-2 px-4"
                      >
                        {[45, 70, 35, 90, 60, 80, 50, 95, 65, 40].map(
                          (height, idx) => (
                            <div
                              key={idx}
                              style={{ height: `${height}%` }}
                              className="flex-1 animate-pulse rounded-t-md bg-(--color-brand-primary)/14 motion-reduce:animate-none"
                            />
                          ),
                        )}
                      </div>
                      <span className="text-xs text-(--color-text-secondary)">
                        Loading chart…
                      </span>
                    </div>
                  ) : (
                    <ProgressChart data={historyData} />
                  )}
                </section>

                {!isMobile && achievementsSummary}
              </div>
            </div>

            {/* Desktop & tablet: inline expanded achievements list */}
            {!isMobile && showAllAchievements && (
              <section
                id="all-achievements"
                aria-label="All achievements"
                className={PANEL}
              >
                <ProgressAchievements
                  achievements={achievements}
                  currentStreak={currentStreak}
                />
              </section>
            )}
          </div>
        )}
      </div>

      {/* Mobile: draggable iOS sheet for All Achievements */}
      {isMobile ? (
        <IosSheet
          open={showAllAchievements}
          onOpenChange={setShowAllAchievements}
          header={
            <div className="flex items-center justify-between border-b border-(--color-border-primary)/50 px-4 pb-3">
              <span className="w-14" aria-hidden="true" />
              <DialogTitle className="text-[17px] font-semibold tracking-tight text-(--color-foreground)">
                Achievements
              </DialogTitle>
              <button
                type="button"
                onClick={() => setShowAllAchievements(false)}
                className="flex min-h-9 w-14 items-center justify-end text-[16px] font-semibold text-(--color-brand-primary) active:opacity-60"
              >
                Done
              </button>
            </div>
          }
        >
          <DialogDescription className="sr-only">
            Every achievement track with its levels, and the one-off badges.
          </DialogDescription>
          <div
            id="all-achievements"
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-4 pb-[max(env(safe-area-inset-bottom),1.75rem)]"
          >
            <ProgressAchievements
              achievements={achievements}
              currentStreak={currentStreak}
            />
          </div>
        </IosSheet>
      ) : null}
    </div>
  );
});

export default ProgressOverview;
