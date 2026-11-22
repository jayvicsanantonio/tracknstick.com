// The Tracker page body: the chosen day, its progress, and the habits due that day.
// On phones (< sm): full-bleed native iOS layout with Collapsing Large Title, horizontal
// swipe between days, and geometry-matched skeleton loading.
// From sm/lg up: keeps the spacious glass dashboard card layout.

import { useContext, useRef } from 'react';
import { WifiOff } from 'lucide-react';
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
      className="flex w-full flex-1 flex-col px-4 pt-1 pb-28 sm:items-center sm:gap-8 sm:py-12"
    >
      {/* Mobile skeleton: matches Date pill + horizontal Hero Card + tactile habit rows */}
      <div className="flex w-full flex-col gap-3.5 sm:hidden">
        <div className="ios-tracker-card h-12 w-full animate-pulse rounded-2xl motion-reduce:animate-none" />
        <div className="ios-tracker-card flex items-center gap-5 rounded-[26px] p-5">
          <div className="size-26 shrink-0 animate-pulse rounded-full bg-(--color-brand-primary)/12 motion-reduce:animate-none" />
          <div className="flex flex-1 flex-col gap-2.5">
            <div className="h-5 w-32 animate-pulse rounded-full bg-(--color-brand-primary)/14 motion-reduce:animate-none" />
            <div className="h-3.5 w-28 animate-pulse rounded-full bg-(--color-brand-primary)/10 motion-reduce:animate-none" />
            <div className="mt-1 h-1.5 w-full animate-pulse rounded-full bg-(--color-brand-primary)/12 motion-reduce:animate-none" />
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between px-1">
          <div className="h-3 w-24 animate-pulse rounded-full bg-(--color-brand-primary)/10 motion-reduce:animate-none" />
          <div className="h-3 w-12 animate-pulse rounded-full bg-(--color-brand-primary)/10 motion-reduce:animate-none" />
        </div>
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="ios-tracker-card flex items-center gap-3.5 rounded-[20px] px-3.5 py-3"
            >
              <div className="size-12 shrink-0 animate-pulse rounded-[15px] bg-(--color-brand-primary)/12 motion-reduce:animate-none" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-4 w-28 animate-pulse rounded-full bg-(--color-brand-primary)/12 motion-reduce:animate-none" />
                <div className="h-3 w-16 animate-pulse rounded-full bg-(--color-brand-primary)/8 motion-reduce:animate-none" />
              </div>
              <div className="size-7 shrink-0 animate-pulse rounded-full bg-(--color-brand-primary)/12 motion-reduce:animate-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop skeleton: matches centered ring + orb grid */}
      <div className="hidden w-full flex-col items-center gap-8 sm:flex">
        <div className="h-56 w-56 animate-pulse rounded-full bg-(--color-brand-primary)/10 motion-reduce:animate-none" />
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex w-20 flex-col items-center gap-2">
              <div className="size-16 animate-pulse rounded-full bg-(--color-brand-primary)/10 motion-reduce:animate-none" />
              <div className="h-3 w-14 animate-pulse rounded-full bg-(--color-brand-primary)/10 motion-reduce:animate-none" />
            </div>
          ))}
        </div>
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

  const statusHeadline =
    doneCount === habits.length
      ? 'All caught up!'
      : doneCount === 0
        ? isToday
          ? 'Ready for today'
          : 'Not started'
        : completionRate >= 50
          ? 'Almost there'
          : 'Off to a good start';

  if (isLoading) {
    return (
      <div className="flex h-full flex-1 flex-col">
        {navBar}
        <div className="mx-auto flex w-full max-w-7xl flex-1 sm:px-4 md:px-8 2xl:max-w-[90rem]">
          <Card
            variant="glass"
            className="relative flex w-full flex-1 items-start justify-center overflow-hidden max-sm:rounded-none max-sm:bg-transparent max-sm:p-0 max-sm:shadow-none max-sm:ring-0 max-sm:backdrop-blur-none sm:items-center dark:max-sm:bg-transparent"
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
        <div className="mx-auto flex w-full max-w-7xl flex-1 px-4 max-sm:pb-28 sm:px-4 md:px-8 2xl:max-w-[90rem]">
          <Card
            variant="glass"
            className="flex w-full flex-1 items-center justify-center max-sm:rounded-none max-sm:bg-transparent max-sm:p-0 max-sm:shadow-none max-sm:ring-0 max-sm:backdrop-blur-none dark:max-sm:bg-transparent"
          >
            <CardContent className="ios-tracker-card flex w-full max-w-sm flex-col items-center gap-4 rounded-[26px] px-6 py-10 text-center sm:max-w-none sm:rounded-none sm:py-16">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-(--color-brand-primary)/12 text-(--color-brand-primary) sm:hidden">
                <WifiOff aria-hidden="true" className="size-5" />
              </span>
              <p role="alert" className="text-[15px] text-(--color-foreground)">
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
              <CardHeader className="px-4 pt-1 pb-3.5 sm:px-6 sm:pt-6 sm:pb-0">
                <DailyHabitDate />
              </CardHeader>
              {habits.length > 0 ? (
                <section
                  aria-label="Progress"
                  className="relative mx-auto mb-5 w-full px-4 sm:mb-8 sm:max-w-md sm:px-6 lg:mb-0"
                >
                  <div className="ios-tracker-card relative flex w-full flex-row items-center gap-5 overflow-hidden rounded-[26px] p-5 sm:flex-col sm:gap-0 sm:overflow-visible sm:rounded-none sm:p-0">
                    {/* Ambient corner glow behind the ring on mobile */}
                    <div
                      aria-hidden="true"
                      className={`pointer-events-none absolute -top-12 -left-12 size-44 rounded-full bg-(--color-brand-primary) blur-3xl transition-opacity duration-500 sm:hidden ${
                        doneCount === habits.length
                          ? 'opacity-25'
                          : 'opacity-12'
                      }`}
                    />

                    <DailyHabitProgressIndicator
                      completionRate={completionRate}
                    />

                    <div className="relative z-10 flex min-w-0 flex-1 flex-col items-start gap-1.5 sm:items-center sm:gap-0">
                      <p className="truncate text-[19px] leading-tight font-bold tracking-[-0.02em] text-(--color-foreground) sm:hidden">
                        {statusHeadline}
                      </p>

                      <p
                        role="status"
                        aria-label="Day summary"
                        className="text-[14px] font-medium text-(--color-brand-text) tabular-nums sm:rounded-full sm:bg-(--color-brand-primary)/12 sm:px-4 sm:py-1.5 sm:text-sm sm:font-semibold dark:text-(--color-brand-text-light)"
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

                      {/* Tactile per-habit completion pips (or linear bar when > 8 habits) on mobile */}
                      <div
                        aria-hidden="true"
                        className="mt-2 flex w-full items-center gap-1.5 sm:hidden"
                      >
                        {habits.length <= 8 ? (
                          habits.map((item, index) => (
                            <span
                              key={item.id}
                              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                index < doneCount
                                  ? 'bg-(--color-brand-primary) shadow-[0_0_8px_color-mix(in_oklab,var(--color-brand-primary)_45%,transparent)]'
                                  : 'bg-(--color-brand-primary)/18'
                              }`}
                            />
                          ))
                        ) : (
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-(--color-brand-primary)/18">
                            <div
                              className="h-full rounded-full bg-(--color-brand-primary) transition-[width] duration-500 ease-out"
                              style={{ width: `${completionRate}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              ) : null}
            </div>
            <CardContent className="flex-1 px-4 pb-8 sm:px-6 lg:pt-8">
              {habits.length === 0 ? (
                allHabitsLoading ? null : allHabitsError ? (
                  <div className="ios-tracker-card flex flex-col items-center gap-4 rounded-[26px] px-6 py-12 text-center sm:rounded-none sm:py-16">
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
                  <div className="mb-2.5 flex items-center justify-between px-1 sm:hidden">
                    <span className="text-[12px] font-semibold tracking-[0.06em] text-(--color-text-secondary)/85 uppercase">
                      {isToday ? "Today's Habits" : 'Scheduled Habits'}
                    </span>
                    <span className="rounded-full bg-(--color-brand-primary)/12 px-2.5 py-0.5 text-[11px] font-semibold text-(--color-brand-primary) tabular-nums">
                      {doneCount}/{habits.length}
                    </span>
                  </div>
                  <DailyHabitList />
                  <p className="mt-5 text-center text-[12px] text-(--color-text-secondary)/65 sm:hidden">
                    Swipe to switch days · Hold a habit for options
                  </p>
                </section>
              )}
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
}
