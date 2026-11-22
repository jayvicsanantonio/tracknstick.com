// The Progress page body: four summary figures, the month's calendar and chart, and achievements.
// On phones (< sm): edge-to-edge Apple Health-style grouped sections with Collapsing Large Title,
// tappable calendar days jumping to Tracker, and All Achievements opening in a draggable iOS sheet.

import { useState, useCallback, useContext, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, Flame, Percent, Trophy } from 'lucide-react';
import ProgressStat from '@/features/progress/components/ProgressStat';
import ProgressCalendar from '@/features/progress/components/ProgressCalendar';
import ProgressChart from '@/features/progress/components/ProgressChart';
import AchievementsSummary from '@/features/progress/components/AchievementsSummary';
import ProgressAchievements from '@/features/progress/components/ProgressAchievements';
import MobileNavBar from '@/features/layout/components/MobileNavBar';
import IosSheet from '@shared/components/ui/ios-sheet';
import { DialogDescription, DialogTitle } from '@shared/components/ui/dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@shared/components/ui/card';
import { DateContext } from '@app/providers/DateContext';
import { useIsMobile } from '@shared/hooks/useIsMobile';
import { triggerHaptic } from '@shared/utils/haptics';
import useProgressHistory from '../hooks/useProgressHistory';
import useProgressStreaks from '../hooks/useProgressStreaks';
import {
  useAchievementProgress,
  useAchievements,
} from '../hooks/useAchievements';
import { summarizeMonth } from '../utils/monthSummary';

// The panels inside the page: native grouped card on phones, translucent tinted panel on desktop.
const PANEL =
  'ios-grouped-card rounded-2xl p-4 sm:border-0 sm:bg-(--color-surface)/60 sm:p-5 sm:shadow-none sm:ring-1 sm:ring-(--color-border-primary)/50 sm:ring-inset dark:sm:bg-(--color-surface-secondary)/60';

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
    isLoading: isStreaksLoading,
    error: streaksError,
  } = useProgressStreaks();
  const {
    achievements,
    stats,
    loading: achievementsLoading,
    error: achievementsError,
  } = useAchievements();
  const { selectedCategory, setSelectedCategory } = useAchievementProgress();

  const loadFailed = Boolean(historyError ?? streaksError);
  const isBestStreak = currentStreak > 0 && currentStreak >= longestStreak;

  const monthName = selectedMonth.toLocaleString('default', { month: 'long' });
  const { averageRate, perfectDays } = summarizeMonth(
    historyData,
    selectedMonth,
  );

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

  return (
    <div className="flex h-full flex-1 flex-col">
      <MobileNavBar title="Progress" />

      <div className="mx-auto flex w-full max-w-7xl flex-1 max-sm:pb-28 sm:px-4 md:px-8 2xl:max-w-[90rem]">
        <Card
          variant="glass"
          className="flex w-full flex-1 flex-col overflow-hidden max-sm:rounded-none max-sm:bg-transparent max-sm:p-0 max-sm:shadow-none max-sm:ring-0 max-sm:backdrop-blur-none dark:max-sm:bg-transparent"
        >
          <CardHeader className="hidden px-3 pt-4 sm:grid sm:px-6 sm:pt-6">
            <div>
              <CardTitle className="mb-2 flex items-center gap-2 text-xl font-bold text-(--color-foreground) sm:text-2xl">
                Progress Overview
              </CardTitle>
              <p className="text-sm text-(--color-text-secondary)">
                View your progress in one place
              </p>
            </div>
          </CardHeader>
          <CardContent className="flex-1 px-4 pb-6 sm:px-6 sm:pb-8">
            {loadFailed ? (
              <p
                role="alert"
                className="py-12 text-center text-(--color-text-secondary)"
              >
                Your progress could not be loaded. Check your connection and try
                again.
              </p>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                  <ProgressStat
                    Icon={Flame}
                    label="Current streak"
                    value={currentStreak}
                    unit="day"
                    loading={isStreaksLoading}
                    badge={isBestStreak ? 'Best yet' : undefined}
                  />
                  <ProgressStat
                    Icon={Trophy}
                    label="Longest streak"
                    value={longestStreak}
                    unit="day"
                    loading={isStreaksLoading}
                  />
                  <ProgressStat
                    Icon={Percent}
                    label={`${monthName} average`}
                    value={averageRate === null ? null : `${averageRate}%`}
                    loading={isHistoryLoading}
                  />
                  <ProgressStat
                    Icon={CalendarCheck}
                    label={`Perfect days in ${monthName}`}
                    value={perfectDays}
                    unit="day"
                    loading={isHistoryLoading}
                  />
                </div>

                <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <section aria-label="Calendar" className={PANEL}>
                    <ProgressCalendar
                      insightData={historyData}
                      loading={isHistoryLoading}
                      selectedMonth={selectedMonth}
                      setSelectedMonth={setSelectedMonth}
                      onSelectDate={handleSelectCalendarDate}
                    />
                  </section>

                  <div className="flex flex-col gap-4 sm:gap-6">
                    <section
                      aria-labelledby="daily-completion-heading"
                      className={PANEL}
                    >
                      <h2
                        id="daily-completion-heading"
                        className="mb-3 text-base font-semibold text-(--color-foreground) sm:mb-4 sm:text-lg"
                      >
                        Daily completion
                      </h2>
                      {isHistoryLoading ? (
                        <p
                          role="status"
                          aria-label="Loading chart"
                          className="flex h-62 items-center justify-center text-sm text-(--color-text-secondary)"
                        >
                          Loading chart…
                        </p>
                      ) : (
                        <ProgressChart data={historyData} />
                      )}
                    </section>

                    <AchievementsSummary
                      achievements={achievements}
                      stats={stats}
                      loading={achievementsLoading}
                      error={achievementsError}
                      isListOpen={showAllAchievements}
                      onToggleList={handleToggleAchievements}
                    />
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
                      selectedCategory={selectedCategory}
                      onCategoryChange={setSelectedCategory}
                    />
                  </section>
                )}
              </div>
            )}
          </CardContent>
        </Card>
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
                onClick={() => {
                  triggerHaptic('light');
                  setShowAllAchievements(false);
                }}
                className="flex min-h-9 w-14 items-center justify-end text-[16px] font-semibold text-(--color-brand-primary) active:opacity-60"
              >
                Done
              </button>
            </div>
          }
        >
          <DialogDescription className="sr-only">
            Browse all earned and in-progress achievements by category.
          </DialogDescription>
          <div
            id="all-achievements"
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-4 pb-[max(env(safe-area-inset-bottom),1.75rem)]"
          >
            <ProgressAchievements
              achievements={achievements}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
        </IosSheet>
      ) : null}
    </div>
  );
});

export default ProgressOverview;
