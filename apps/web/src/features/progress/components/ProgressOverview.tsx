// The Progress page body: four summary figures, the month's calendar and chart, and achievements.
// On phones (< sm): edge-to-edge Apple Health-style grouped sections with Collapsing Large Title,
// tappable calendar days jumping to Tracker, and All Achievements opening in a draggable iOS sheet.

import { useState, useCallback, useContext, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  CalendarCheck,
  Flame,
  Percent,
  Trophy,
  WifiOff,
} from 'lucide-react';
import ProgressStat from '@/features/progress/components/ProgressStat';
import ProgressHeroSummary from '@/features/progress/components/ProgressHeroSummary';
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
import useProgressSummary from '../hooks/useProgressSummary';
import {
  useAchievementProgress,
  useAchievements,
} from '../hooks/useAchievements';
import { summarizeMonth } from '../utils/monthSummary';

// The panels inside the page: brand-harmonized tactile card on phones (matching Tracker),
// translucent tinted panel on tablet/desktop.
const PANEL =
  'ios-tracker-card rounded-[26px] p-5 sm:rounded-2xl sm:border-0 sm:bg-(--color-surface)/60 sm:p-5 sm:shadow-none sm:ring-1 sm:ring-(--color-border-primary)/50 sm:ring-inset dark:sm:bg-(--color-surface-secondary)/60';

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
  const { selectedCategory, setSelectedCategory } = useAchievementProgress();

  const loadFailed = Boolean(historyError ?? summaryError);
  const isBestStreak = currentStreak > 0 && currentStreak >= longestStreak;

  const monthName = selectedMonth.toLocaleString('default', { month: 'long' });
  const { averageRate, perfectDays: monthPerfectDays } = summarizeMonth(
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
            <div className="flex items-center gap-3.5">
              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-(--color-brand-primary)/14 text-(--color-brand-primary) ring-1 ring-(--color-brand-primary)/24 ring-inset"
              >
                <BarChart3 className="size-5" />
              </span>
              <div>
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-(--color-foreground) sm:text-2xl">
                  Progress Overview
                </CardTitle>
                <p className="mt-0.5 text-sm text-(--color-text-secondary)">
                  View your progress in one place
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 px-4 pt-1 pb-6 sm:px-6 sm:pt-0 sm:pb-8">
            {loadFailed ? (
              <div className="ios-tracker-card mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-[26px] px-6 py-12 text-center sm:max-w-none sm:rounded-none sm:py-16">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-(--color-brand-primary)/12 text-(--color-brand-primary) sm:hidden">
                  <WifiOff aria-hidden="true" className="size-5" />
                </span>
                <p
                  role="alert"
                  className="text-[15px] text-(--color-foreground) sm:text-base sm:text-(--color-text-secondary)"
                >
                  Your progress could not be loaded. Check your connection and
                  try again.
                </p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {isMobile ? (
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
                ) : (
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <ProgressStat
                      Icon={Flame}
                      label="Current streak"
                      value={currentStreak}
                      unit="day"
                      loading={isSummaryLoading}
                      badge={isBestStreak ? 'Best yet' : undefined}
                    />
                    <ProgressStat
                      Icon={Trophy}
                      label="Longest streak"
                      value={longestStreak}
                      unit="day"
                      loading={isSummaryLoading}
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
                      value={monthPerfectDays}
                      unit="day"
                      loading={isHistoryLoading}
                    />
                  </div>
                )}

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
                        className="mb-3 text-[18px] font-bold tracking-[-0.02em] text-(--color-foreground) sm:mb-4 sm:text-lg sm:font-semibold"
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
