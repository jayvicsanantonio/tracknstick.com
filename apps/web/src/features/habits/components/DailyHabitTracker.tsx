// The Tracker page body: the chosen day, its progress, and the habits due that day.
// On phones (< sm): full-bleed native iOS layout with Collapsing Large Title, horizontal
// swipe between days, and geometry-matched skeleton loading.
// From sm/lg up: keeps the spacious glass dashboard card layout.

import { useContext, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@shared/components/ui/card';
import NoHabits from '@/features/habits/components/NoHabits';
import DailyHabitDate from '@/features/habits/components/DailyHabitDate';
import DailyHabitProgressIndicator from '@/features/habits/components/DailyHabitProgressIndicator';
import DailyHabitList from '@/features/habits/components/DailyHabitList';
import { useHabits } from '@/features/habits/hooks/useHabits';
import { useAllHabits } from '@/features/habits/hooks/useAllHabits';
import NothingScheduled from '@/features/habits/components/NothingScheduled';
import MobileNavBar from '@/features/layout/components/MobileNavBar';
import { DateContext } from '@app/providers/DateContext';
import { Button } from '@shared/components/ui/button';
import { triggerHaptic } from '@shared/utils/haptics';

const SWIPE_THRESHOLD_PX = 56;

function TrackerSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading habits"
      className="flex w-full flex-1 flex-col items-center gap-8 px-4 pt-6 pb-28 sm:py-12"
    >
      <div className="h-44 w-44 animate-pulse rounded-full bg-(--color-brand-primary)/10 motion-reduce:animate-none sm:h-56 sm:w-56" />
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex w-20 flex-col items-center gap-2">
            <div className="size-16 animate-pulse rounded-full bg-(--color-brand-primary)/10 motion-reduce:animate-none" />
            <div className="h-3 w-14 animate-pulse rounded-full bg-(--color-brand-primary)/10 motion-reduce:animate-none" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DailyHabitTracker() {
  const { habits, isLoading, error, completionRate, mutateHabits } =
    useHabits();
  const dateContext = useContext(DateContext);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  // Every habit, due or not: tells "no habits at all" from "none due today".
  // Fetched only when the day shown has no habits, the one case that needs it.
  const {
    habits: allHabits,
    isLoading: allHabitsLoading,
    error: allHabitsError,
    retry: retryAllHabits,
  } = useAllHabits({
    enabled: !isLoading && !error && habits.length === 0,
  });

  const doneCount = habits.filter((habit) => habit.completed).length;
  const hasNoHabits =
    habits.length === 0 &&
    !allHabitsLoading &&
    !allHabitsError &&
    allHabits.length === 0;

  const isToday = dateContext
    ? dateContext.date.toDateString() === dateContext.currentDate.toDateString()
    : true;

  const mobileNavTitle = dateContext
    ? isToday
      ? 'Today'
      : dateContext.date.toLocaleDateString('en-US', {
          timeZone: dateContext.timeZone,
          weekday: 'long',
        })
    : 'Today';

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStart.current || !dateContext) return;
    const touch = event.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    touchStart.current = null;

    if (
      Math.abs(dx) >= SWIPE_THRESHOLD_PX &&
      Math.abs(dx) > Math.abs(dy) * 1.4
    ) {
      triggerHaptic('selection');
      if (dx > 0) {
        dateContext.handlePreviousDate();
      } else {
        dateContext.handleNextDate();
      }
    }
  };

  const navBar = (
    <MobileNavBar
      title={mobileNavTitle}
      leading={
        !isToday && dateContext ? (
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              dateContext.setDate(new Date());
            }}
            className="rounded-full bg-(--color-brand-primary)/15 px-3 py-1 text-[13px] font-semibold text-(--color-brand-text) active:scale-95 dark:text-(--color-brand-text-light)"
          >
            Today
          </button>
        ) : undefined
      }
    />
  );

  if (isLoading) {
    return (
      <div className="flex h-full flex-1 flex-col">
        {navBar}
        <div className="mx-auto flex w-full max-w-7xl flex-1 sm:px-4 md:px-8 2xl:max-w-[90rem]">
          <Card
            variant="glass"
            className="relative flex w-full flex-1 items-center justify-center overflow-hidden max-sm:rounded-none max-sm:bg-transparent max-sm:p-0 max-sm:shadow-none max-sm:ring-0 max-sm:backdrop-blur-none dark:max-sm:bg-transparent"
          >
            <TrackerSkeleton />
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-1 flex-col">
        {navBar}
        <div className="mx-auto flex w-full max-w-7xl flex-1 px-4 sm:px-4 md:px-8 2xl:max-w-[90rem]">
          <Card
            variant="glass"
            className="flex w-full flex-1 items-center justify-center max-sm:rounded-none max-sm:bg-transparent max-sm:p-0 max-sm:shadow-none max-sm:ring-0 max-sm:backdrop-blur-none dark:max-sm:bg-transparent"
          >
            <CardContent className="flex flex-col items-center gap-4 px-3 py-16 text-center sm:px-6">
              <p role="alert" className="text-(--color-foreground)">
                Your habits could not be loaded. Check your connection and try
                again.
              </p>
              <Button
                variant="outline"
                className="h-11 rounded-full px-6"
                onClick={() => void mutateHabits()}
              >
                Try again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // With no habits there is no day to move through or progress to show, so
  // the first-habit prompt takes the whole screen.
  if (hasNoHabits) {
    return (
      <div className="flex h-full flex-1 flex-col">
        {navBar}
        <div className="mx-auto flex w-full max-w-7xl flex-1 px-4 max-sm:pb-28 sm:px-4 md:px-8 2xl:max-w-[90rem]">
          <Card
            variant="glass"
            className="flex w-full flex-1 items-center justify-center max-sm:rounded-none max-sm:bg-transparent max-sm:p-0 max-sm:shadow-none max-sm:ring-0 max-sm:backdrop-blur-none dark:max-sm:bg-transparent"
          >
            <NoHabits />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-full flex-1 flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {navBar}
      <div className="mx-auto flex w-full max-w-7xl flex-1 max-sm:pb-28 sm:px-4 md:px-8 2xl:max-w-[90rem]">
        <Card
          variant="glass"
          className="relative flex w-full flex-1 flex-col overflow-hidden max-sm:rounded-none max-sm:bg-transparent max-sm:p-0 max-sm:shadow-none max-sm:ring-0 max-sm:backdrop-blur-none dark:max-sm:bg-transparent"
        >
          <div className="grid flex-1 content-start lg:grid-cols-[26rem_1fr] lg:content-stretch">
            <div className="lg:border-r lg:border-(--color-border-primary)/50 lg:pb-8">
              <CardHeader className="px-4 pt-1 sm:px-6 sm:pt-6">
                <DailyHabitDate />
              </CardHeader>
              {habits.length > 0 ? (
                <section
                  aria-label="Progress"
                  className="relative mx-auto mb-5 flex w-full max-w-md flex-col items-center px-4 sm:mb-8 sm:px-6 lg:mb-0"
                >
                  <DailyHabitProgressIndicator
                    completionRate={completionRate}
                  />
                  <p
                    role="status"
                    aria-label="Day summary"
                    className="rounded-full bg-(--color-brand-primary)/12 px-4 py-1.5 text-[13px] font-semibold text-(--color-brand-text) tabular-nums sm:text-sm dark:text-(--color-brand-text-light)"
                  >
                    {doneCount === habits.length
                      ? `All ${habits.length} done`
                      : `${doneCount} of ${habits.length} done`}
                    <span className="font-normal text-(--color-text-secondary)">
                      {doneCount === habits.length
                        ? ' · nice work'
                        : ` · ${habits.length - doneCount} to go`}
                    </span>
                  </p>
                </section>
              ) : null}
            </div>
            <CardContent className="flex-1 px-4 pb-8 sm:px-6 lg:pt-8">
              {habits.length === 0 ? (
                allHabitsLoading ? null : allHabitsError ? (
                  <div className="flex flex-col items-center gap-4 py-16 text-center">
                    <p role="alert" className="text-(--color-foreground)">
                      Your habits could not be checked. Check your connection
                      and try again.
                    </p>
                    <Button
                      variant="outline"
                      className="h-11 rounded-full px-6 sm:h-9"
                      onClick={() => void retryAllHabits()}
                    >
                      Try again
                    </Button>
                  </div>
                ) : (
                  <NothingScheduled />
                )
              ) : (
                <section aria-label="Today's Habits">
                  <DailyHabitList />
                </section>
              )}
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
}
