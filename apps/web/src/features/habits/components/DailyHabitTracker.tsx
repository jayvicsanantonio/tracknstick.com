// The Tracker page body: the chosen day, its progress, and the habits due that day.
// Shares one unified brand-harmonized visual language across phone, tablet, and desktop:
// - Phones (< sm): full-bleed Collapsing Large Title, stationary date capsule, floating
//   segmented ring, elevated Today's Habits medallion card, and horizontal day swipe.
// - Tablet & Desktop (sm+ / lg+): balanced focused stage inside max-w-6xl with an anchored
//   Progress Hero card (date, ring, recessed streak tray), equal-height Today's Habits card,
//   and a full-width interactive 7-day "This Week" completion strip underneath.

import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Moon,
  Trophy,
  WifiOff,
} from 'lucide-react';
import NoHabits from '@/features/habits/components/NoHabits';
import DailyHabitDate from '@/features/habits/components/DailyHabitDate';
import DailyHabitProgressIndicator from '@/features/habits/components/DailyHabitProgressIndicator';
import DailyHabitList from '@/features/habits/components/DailyHabitList';
import TrackerWeekStrip from '@/features/habits/components/TrackerWeekStrip';
import { useHabits } from '@/features/habits/hooks/useHabits';
import { useAllHabits } from '@/features/habits/hooks/useAllHabits';
import {
  useDaySwipe,
  type DaySwipeDirection,
} from '@/features/habits/hooks/useDaySwipe';
import NothingScheduled from '@/features/habits/components/NothingScheduled';
import { findNextDueDate } from '@/features/habits/utils/nextDueDate';
import MobileNavBar from '@/features/layout/components/MobileNavBar';
import PageHeader from '@/features/layout/components/PageHeader';
import useProgressSummary from '@/features/progress/hooks/useProgressSummary';
import { useAchievements } from '@/features/progress/hooks/useAchievements';
import { achievementHint as describeAchievementHint } from '@/features/progress/utils/achievementHint';
import { DateContext } from '@app/providers/DateContext';
import { Button } from '@shared/components/ui/button';
import { IosHapticTarget } from '@shared/components/ui/ios-haptic-target';
import { PAGE_CONTAINER, PAGE_HEADER_ACTION } from '@shared/constants/layout';
import { useHoldSplash } from '@shared/hooks/useHideSplash';
import { useIsMobile } from '@shared/hooks/useIsMobile';
import { triggerHaptic } from '@shared/utils/haptics';
import { IOS_SPRING_TAP } from '@shared/utils/motion';
import { plural } from '@shared/utils/plural';
import { cn } from '@shared/utils/utils';

interface StreakTileProps {
  Icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  label: string;
  value: number;
  badge?: string;
  isLoading: boolean;
}

function StreakTile({ Icon, label, value, badge, isLoading }: StreakTileProps) {
  const unit = plural(value, 'day');
  return (
    <div className="flex min-w-0 items-center gap-2.5 px-3 py-2">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-(--color-brand-primary)/14 text-(--color-brand-primary) ring-1 ring-(--color-brand-primary)/22 ring-inset">
        <Icon aria-hidden={true} className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex h-5 items-center">
          {isLoading ? (
            <span className="h-4 w-12 animate-pulse rounded-md bg-(--color-brand-primary)/14 motion-reduce:animate-none" />
          ) : (
            <p className="inline-flex min-w-0 items-baseline gap-1">
              <span className="text-[17px] leading-none font-bold tracking-[-0.02em] text-(--color-foreground) tabular-nums">
                {value.toLocaleString()}
              </span>
              <span className="truncate text-[12px] font-medium text-(--color-text-secondary)">
                {unit}
              </span>
            </p>
          )}
        </div>
        <p className="mt-0.5 h-3.5 truncate text-[11px] leading-3.5 font-medium text-(--color-text-secondary)">
          {badge && !isLoading ? (
            <>
              <span>Streak</span>
              <span aria-hidden="true" className="mx-1 opacity-50">
                ·
              </span>
              <span className="font-semibold text-(--color-brand-primary)">
                {badge}
              </span>
            </>
          ) : (
            label
          )}
        </p>
      </div>
    </div>
  );
}

function TrackerSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading habits"
      className="flex w-full flex-1 flex-col pt-1 pb-28 sm:pb-2"
    >
      {/* Tablet & desktop page title placeholder */}
      <div className="mb-6 hidden min-h-14 flex-col justify-end gap-2 sm:flex">
        <div className="h-8 w-28 animate-pulse rounded-xl bg-(--color-brand-primary)/12 motion-reduce:animate-none" />
        <div className="h-4 w-64 animate-pulse rounded-full bg-(--color-brand-primary)/8 motion-reduce:animate-none" />
      </div>

      <div className="grid gap-5 sm:gap-6 lg:grid-cols-[24rem_minmax(0,1fr)] lg:items-stretch">
        {/* Left column: Date capsule + centered segmented progress ring (+ streak tray on lg+) */}
        <div className="ios-tracker-card-lg flex flex-col lg:rounded-[26px] lg:p-4">
          <div className="pb-3.5 sm:pb-0">
            <div className="ios-tracker-card-until-lg h-12 w-full animate-pulse rounded-2xl motion-reduce:animate-none sm:h-[52px] lg:bg-(--color-brand-primary)/8" />
          </div>
          <div className="flex flex-1 items-center justify-center pt-3 pb-7 sm:py-8 lg:py-3">
            <div className="size-56 animate-pulse rounded-full bg-(--color-brand-primary)/12 motion-reduce:animate-none min-[390px]:size-64 sm:size-68 md:size-72 lg:size-52" />
          </div>
          <div className="hidden h-[58px] animate-pulse rounded-2xl bg-(--color-brand-primary)/8 motion-reduce:animate-none lg:block" />
        </div>

        {/* Right column: Today's Habits elevated stage card */}
        <div className="ios-tracker-card flex flex-col rounded-[26px] px-4 pt-4 pb-6 sm:px-6 sm:pt-5 sm:pb-7 lg:p-5">
          <div className="mb-5 flex items-center justify-between px-1 sm:mb-4">
            <div className="h-[11px] w-24 animate-pulse rounded-full bg-(--color-brand-primary)/12 motion-reduce:animate-none" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-(--color-brand-primary)/12 motion-reduce:animate-none" />
          </div>
          <div className="my-auto flex flex-wrap justify-center gap-x-4 gap-y-6 sm:gap-x-7 sm:gap-y-6 md:gap-x-8 lg:gap-y-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex w-[88px] flex-col items-center min-[380px]:w-[96px] sm:w-[108px] md:w-[116px] lg:w-[124px]"
              >
                <div className="mb-2.5 size-20 animate-pulse rounded-full bg-(--color-brand-primary)/12 motion-reduce:animate-none sm:mb-3 sm:size-[88px] md:size-[92px] lg:size-[88px]" />
                <div className="h-[17px] w-16 animate-pulse rounded-full bg-(--color-brand-primary)/12 motion-reduce:animate-none sm:w-20" />
                <div className="mt-0.5 h-[14px] w-10 animate-pulse rounded-full bg-(--color-brand-primary)/8 motion-reduce:animate-none sm:w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tablet & desktop Weekly Overview placeholder */}
      <div className="ios-tracker-card mt-6 hidden rounded-[26px] px-6 py-4 sm:block">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="h-3 w-36 animate-pulse rounded-full bg-(--color-brand-primary)/12 motion-reduce:animate-none" />
          <div className="h-4 w-28 animate-pulse rounded-full bg-(--color-brand-primary)/10 motion-reduce:animate-none" />
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-1 py-1.5"
            >
              <div className="h-2.5 w-6 animate-pulse rounded-full bg-(--color-brand-primary)/10 motion-reduce:animate-none" />
              <div className="size-5 animate-pulse rounded-full bg-(--color-brand-primary)/10 motion-reduce:animate-none" />
              <div className="size-9 animate-pulse rounded-full bg-(--color-brand-primary)/12 motion-reduce:animate-none" />
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
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();

  // Keep the layout mounted once initial habits have loaded so swiping or stepping
  // to an uncached day never flashes back to a full-page skeleton or interrupts motion.
  const hasLoadedOnceRef = useRef(false);
  if (!isLoading && !error) {
    hasLoadedOnceRef.current = true;
  }
  const isInitialLoading = isLoading && !hasLoadedOnceRef.current;
  const isDayLoading = isLoading && hasLoadedOnceRef.current;

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

  // The launch splash fades straight onto the settled tracker: past the
  // skeleton, and past the check for any habits at all, whose answer may
  // swap in the first-habit prompt.
  useHoldSplash(isInitialLoading || (habits.length === 0 && allHabitsLoading));

  // Lifetime streak summary for the desktop Progress Hero card's recessed tray.
  // Skipped on phones and when DateContext is not mounted (e.g., isolated unit tests).
  const {
    currentStreak,
    longestStreak,
    isLoading: isSummaryLoading,
  } = useProgressSummary(!isMobile && Boolean(dateContext));
  const isBestStreak = currentStreak > 0 && currentStreak >= longestStreak;

  const doneCount = habits.filter((habit) => habit.completed).length;

  // The habits left on the day shown can earn an achievement: an active day,
  // check-ins, or a perfect day. Skipped without DateContext, as the summary is.
  const { achievements } = useAchievements(Boolean(dateContext));
  const hasNoHabits =
    !isLoading &&
    habits.length === 0 &&
    !allHabitsLoading &&
    !allHabitsError &&
    allHabits.length === 0;

  const isToday = dateContext
    ? dateContext.date.toDateString() === dateContext.currentDate.toDateString()
    : true;

  const achievementHint = describeAchievementHint(achievements, {
    habitsLeft: habits.length - doneCount,
    doneCount,
    isToday,
  });

  // On a day with nothing due, the next day that has something.
  const nextDueDate = useMemo(
    () =>
      dateContext && habits.length === 0 && allHabits.length > 0
        ? findNextDueDate(allHabits, dateContext.date, dateContext.timeZone)
        : null,
    [dateContext, habits.length, allHabits],
  );

  const goToNextDue = useCallback(() => {
    if (!dateContext || !nextDueDate) return;
    triggerHaptic('selection');
    dateContext.setDate(nextDueDate);
  }, [dateContext, nextDueDate]);

  const dayKey = useMemo(() => {
    if (!dateContext) return 'today';
    return dateContext.date.toLocaleDateString('en-CA', {
      timeZone: dateContext.timeZone,
    });
  }, [dateContext]);

  const mobileNavTitle = dateContext
    ? isToday
      ? 'Today'
      : dateContext.date.toLocaleDateString('en-US', {
          timeZone: dateContext.timeZone,
          weekday: 'long',
        })
    : 'Today';

  // Target day labels previewed inside the floating edge pill while swiping.
  const adjacentDayLabels = useMemo(() => {
    if (!dateContext) return { prev: 'Prev', next: 'Next' };
    const formatOffset = (offsetDays: -1 | 1) => {
      const target = new Date(dateContext.date);
      target.setDate(target.getDate() + offsetDays);
      if (target.toDateString() === dateContext.currentDate.toDateString()) {
        return 'Today';
      }
      return target.toLocaleDateString('en-US', {
        timeZone: dateContext.timeZone,
        weekday: 'short',
      });
    };
    return { prev: formatOffset(-1), next: formatOffset(1) };
  }, [dateContext]);

  const [navDirection, setNavDirection] = useState<DaySwipeDirection | null>(
    null,
  );
  const swipeTriggeredRef = useRef(false);

  const goPreviousDay = useCallback(() => {
    swipeTriggeredRef.current = true;
    setNavDirection('prev');
    dateContext?.handlePreviousDate();
  }, [dateContext]);

  const goNextDay = useCallback(() => {
    swipeTriggeredRef.current = true;
    setNavDirection('next');
    dateContext?.handleNextDate();
  }, [dateContext]);

  const {
    x: swipeX,
    opacity: swipeOpacity,
    dragProgress,
    feedback: swipeFeedback,
    playIncomingTransition,
    swipeHandlers,
  } = useDaySwipe({
    enabled: Boolean(dateContext) && !error && !hasNoHabits,
    onPreviousDay: goPreviousDay,
    onNextDay: goNextDay,
  });

  // Trigger a matching directional glide for non-swipe date changes
  // (arrow buttons, Left/Right keyboard shortcuts, Today / Back to Today, weekly strip clicks).
  const prevDateRef = useRef<{ key: string; ms: number } | null>(null);
  useEffect(() => {
    if (!dateContext) return;
    const ms = dateContext.date.getTime();
    if (prevDateRef.current === null) {
      prevDateRef.current = { key: dayKey, ms };
      return;
    }
    if (prevDateRef.current.key === dayKey) {
      return;
    }

    const direction: DaySwipeDirection =
      ms > prevDateRef.current.ms ? 'next' : 'prev';
    prevDateRef.current = { key: dayKey, ms };

    if (swipeTriggeredRef.current) {
      swipeTriggeredRef.current = false;
      return;
    }

    setNavDirection(direction);
    playIncomingTransition(direction, { source: 'button' });
  }, [dateContext, dayKey, playIncomingTransition]);

  // Continuous 60/120fps edge pill transforms driven directly by dragProgress.
  const edgeOpacity = useTransform(dragProgress, [0, 0.14, 0.72], [0, 0.85, 1]);
  const edgeScale = useTransform(dragProgress, [0, 1], [0.86, 1]);
  const prevEdgeX = useTransform(dragProgress, [0, 1], [-22, 12]);
  const nextEdgeX = useTransform(dragProgress, [0, 1], [22, -12]);

  const swipeEdgeIndicator = (
    <AnimatePresence>
      {swipeFeedback ? (
        <motion.div
          key={swipeFeedback.direction}
          aria-hidden="true"
          initial={false}
          exit={
            prefersReducedMotion
              ? { opacity: 0, transition: { duration: 0 } }
              : { opacity: 0, transition: { duration: 0.16 } }
          }
          className={cn(
            'pointer-events-none fixed inset-y-0 z-30 flex items-center',
            swipeFeedback.direction === 'prev' ? 'left-0' : 'right-0',
          )}
        >
          <motion.div
            style={{
              opacity: prefersReducedMotion ? 1 : edgeOpacity,
              scale: prefersReducedMotion ? 1 : edgeScale,
              x: prefersReducedMotion
                ? swipeFeedback.direction === 'prev'
                  ? 12
                  : -12
                : swipeFeedback.direction === 'prev'
                  ? prevEdgeX
                  : nextEdgeX,
            }}
            exit={
              prefersReducedMotion
                ? { opacity: 0, transition: { duration: 0 } }
                : {
                    opacity: 0,
                    scale: 0.84,
                    x: swipeFeedback.direction === 'prev' ? -20 : 20,
                    transition: { duration: 0.16, ease: [0.4, 0, 1, 1] },
                  }
            }
            className={cn(
              'flex h-10 items-center gap-1 rounded-full border px-3 text-[13px] font-semibold tracking-[-0.01em] transition-[background-color,border-color,color,box-shadow] duration-150',
              swipeFeedback.ready
                ? 'border-(--color-brand-primary) bg-(--color-brand-primary) text-(--color-primary-foreground) shadow-md'
                : 'ios-liquid-glass text-(--color-brand-text) dark:text-(--color-brand-text-light)',
            )}
          >
            {swipeFeedback.direction === 'prev' ? (
              <>
                <ChevronLeft className="size-4 shrink-0" strokeWidth={2.5} />
                <span>{adjacentDayLabels.prev}</span>
              </>
            ) : (
              <>
                <span>{adjacentDayLabels.next}</span>
                <ChevronRight className="size-4 shrink-0" strokeWidth={2.5} />
              </>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  const navBar = (
    <MobileNavBar title={mobileNavTitle} titleDirection={navDirection} />
  );

  const swipeDayHint = (
    <p className="inline-flex items-center justify-center gap-1.5 text-[11.5px] leading-tight font-medium text-(--color-text-secondary)/55">
      <ChevronLeft
        aria-hidden="true"
        strokeWidth={2.25}
        className={cn(
          'size-3 transition-[color,transform] duration-150',
          swipeFeedback?.direction === 'prev'
            ? '-translate-x-0.5 text-(--color-brand-primary)'
            : 'text-(--color-brand-primary)/65',
        )}
      />
      <span>
        {isToday
          ? 'Swipe to switch days'
          : 'Swipe to switch days · Double-tap the date for today'}
      </span>
      <ChevronRight
        aria-hidden="true"
        strokeWidth={2.25}
        className={cn(
          'size-3 transition-[color,transform] duration-150',
          swipeFeedback?.direction === 'next'
            ? 'translate-x-0.5 text-(--color-brand-primary)'
            : 'text-(--color-brand-primary)/65',
        )}
      />
    </p>
  );

  const dayMotionStyle = prefersReducedMotion
    ? undefined
    : { x: swipeX, opacity: swipeOpacity };

  const desktopPageTitle = (
    <PageHeader
      decorativeTitle
      title={
        <motion.span
          key={mobileNavTitle}
          initial={
            prefersReducedMotion || !navDirection
              ? false
              : {
                  opacity: 0.3,
                  x: navDirection === 'next' ? 10 : -10,
                }
          }
          animate={{ opacity: 1, x: 0 }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
          }
          className="inline-block"
        >
          {mobileNavTitle}
        </motion.span>
      }
      description="Check off the habits scheduled for this day"
      action={
        <AnimatePresence initial={false}>
          {!isToday && dateContext ? (
            <motion.button
              key="desktop-today-pill"
              type="button"
              initial={
                prefersReducedMotion ? false : { opacity: 0, scale: 0.88 }
              }
              animate={{ opacity: 1, scale: 1 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0, transition: { duration: 0 } }
                  : { opacity: 0, scale: 0.88, transition: { duration: 0.14 } }
              }
              transition={IOS_SPRING_TAP}
              onClick={() => {
                triggerHaptic('medium');
                dateContext.setDate(new Date());
              }}
              className={PAGE_HEADER_ACTION}
            >
              Back to Today
            </motion.button>
          ) : null}
        </AnimatePresence>
      }
    />
  );

  if (isInitialLoading) {
    return (
      <div
        className="flex h-full flex-1 touch-pan-y flex-col overscroll-x-none"
        {...swipeHandlers}
      >
        {navBar}
        {swipeEdgeIndicator}
        <div className={cn(PAGE_CONTAINER, 'flex flex-1 flex-col')}>
          <TrackerSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-1 flex-col">
        {navBar}
        <div
          className={cn(
            PAGE_CONTAINER,
            'flex flex-1 flex-col max-sm:pb-28 sm:pt-1',
          )}
        >
          {desktopPageTitle}
          <div className="flex flex-1 items-center justify-center">
            <div className="ios-tracker-card flex w-full max-w-md flex-col items-center gap-4 rounded-[26px] px-6 py-10 text-center sm:px-8 sm:py-12">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-(--color-brand-primary)/14 text-(--color-brand-primary) ring-1 ring-(--color-brand-primary)/24 ring-inset">
                <WifiOff aria-hidden="true" className="size-5" />
              </span>
              <p role="alert" className="text-[15px] text-(--color-foreground)">
                Your habits could not be loaded. Check your connection and try
                again.
              </p>
              <IosHapticTarget className="inline-flex rounded-full">
                <Button
                  variant="outline"
                  className="h-11 rounded-full px-6"
                  onClick={() => {
                    triggerHaptic('medium');
                    void mutateHabits();
                  }}
                >
                  Try again
                </Button>
              </IosHapticTarget>
            </div>
          </div>
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
        <div
          className={cn(
            PAGE_CONTAINER,
            'flex flex-1 flex-col max-sm:pb-28 sm:pt-1',
          )}
        >
          {desktopPageTitle}
          <div className="flex flex-1 items-center justify-center">
            <NoHabits />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-full flex-1 touch-pan-y flex-col overscroll-x-none"
      {...swipeHandlers}
    >
      {navBar}
      {swipeEdgeIndicator}
      <div
        className={cn(
          PAGE_CONTAINER,
          'flex flex-1 flex-col pt-1 max-sm:pb-28 sm:pb-2',
        )}
      >
        <div className="flex flex-1 flex-col">
          {desktopPageTitle}

          <div className="grid gap-5 sm:gap-6 lg:grid-cols-[24rem_minmax(0,1fr)] lg:items-stretch">
            {/* Left column: open canvas on phone/tablet; anchored Progress Hero card with recessed streak tray on lg+ desktop */}
            <div className="ios-tracker-card-lg relative flex flex-col lg:overflow-clip lg:rounded-[26px] lg:p-4">
              <div className="relative z-10 pb-3.5 sm:pb-0">
                <DailyHabitDate
                  transitionDirection={navDirection}
                  embeddedOnDesktop
                />
              </div>

              {habits.length > 0 ? (
                <motion.section
                  aria-label="Progress"
                  style={dayMotionStyle}
                  className={cn(
                    'relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center pt-3 pb-7 sm:py-8 lg:py-3',
                    isDayLoading && 'pointer-events-none',
                  )}
                >
                  <div
                    className={cn(
                      'transition-opacity duration-150',
                      isDayLoading && 'opacity-65',
                    )}
                  >
                    <DailyHabitProgressIndicator
                      completionRate={completionRate}
                      totalHabits={habits.length}
                      completedHabits={doneCount}
                      dayKey={dayKey}
                      isDayLoading={isDayLoading}
                    />
                  </div>
                </motion.section>
              ) : (
                // A quiet ring where the progress ring sits, so the desktop
                // card does not open onto an empty hole.
                <div
                  role="img"
                  aria-label="Rest day: nothing to check off"
                  className="relative z-10 hidden flex-1 flex-col items-center justify-center gap-3 py-3 lg:flex"
                >
                  <span className="flex size-40 items-center justify-center rounded-full border-[10px] border-dashed border-(--color-brand-primary)/16">
                    <Moon
                      aria-hidden="true"
                      className="size-9 text-(--color-brand-primary)/60"
                    />
                  </span>
                  <span className="text-[13px] font-semibold text-(--color-text-secondary)">
                    Rest day
                  </span>
                </div>
              )}

              {/* Recessed dual-streak tray grounding the desktop Progress Hero card */}
              {dateContext ? (
                <div className="relative z-10 hidden grid-cols-2 divide-x divide-(--color-brand-primary)/14 overflow-hidden rounded-2xl bg-(--color-brand-primary)/[0.055] ring-1 ring-(--color-brand-primary)/14 ring-inset lg:grid">
                  <StreakTile
                    Icon={Flame}
                    label="Current streak"
                    value={currentStreak}
                    badge={isBestStreak ? 'Best yet' : undefined}
                    isLoading={isSummaryLoading}
                  />
                  <StreakTile
                    Icon={Trophy}
                    label="Longest streak"
                    value={longestStreak}
                    isLoading={isSummaryLoading}
                  />
                </div>
              ) : null}
            </div>

            {/* Right column: equal-height Today's Habits elevated medallion stage card */}
            <div className="flex min-w-0 flex-col lg:overflow-x-clip">
              <motion.div
                style={dayMotionStyle}
                className={cn(
                  'flex flex-1 flex-col',
                  isDayLoading && 'pointer-events-none',
                )}
              >
                <div
                  className={cn(
                    'flex flex-1 flex-col transition-opacity duration-150',
                    isDayLoading && 'opacity-65',
                  )}
                >
                  {habits.length === 0 ? (
                    allHabitsLoading ? null : allHabitsError ? (
                      <div className="ios-tracker-card flex flex-1 flex-col items-center justify-center gap-4 rounded-[26px] px-6 py-12 text-center sm:px-8 sm:py-14">
                        <span className="flex size-12 items-center justify-center rounded-2xl bg-(--color-brand-primary)/14 text-(--color-brand-primary) ring-1 ring-(--color-brand-primary)/24 ring-inset">
                          <WifiOff aria-hidden="true" className="size-5" />
                        </span>
                        <p role="alert" className="text-(--color-foreground)">
                          Your habits could not be checked. Check your
                          connection and try again.
                        </p>
                        <IosHapticTarget className="inline-flex rounded-full">
                          <Button
                            variant="outline"
                            className="h-11 rounded-full px-6"
                            onClick={() => {
                              triggerHaptic('medium');
                              void retryAllHabits();
                            }}
                          >
                            Try again
                          </Button>
                        </IosHapticTarget>
                      </div>
                    ) : (
                      <div className="flex flex-1 flex-col justify-center">
                        <NothingScheduled
                          nextDueDate={nextDueDate}
                          shownDate={dateContext?.date}
                          onGoToNextDue={goToNextDue}
                        />
                        <div className="mt-4 flex justify-center sm:hidden">
                          {swipeDayHint}
                        </div>
                      </div>
                    )
                  ) : (
                    <section
                      aria-label="Today's Habits"
                      className="flex flex-1 flex-col"
                    >
                      <div className="ios-tracker-card relative flex flex-1 flex-col rounded-[26px] px-4 pt-4 pb-6 sm:px-6 sm:pt-5 sm:pb-7 lg:p-5">
                        <div className="mb-5 flex items-center justify-between px-1 sm:mb-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              aria-hidden="true"
                              className="size-1.5 rounded-full bg-(--color-brand-primary)"
                            />
                            <span className="text-[11px] leading-none font-semibold tracking-[0.09em] text-(--color-brand-primary) uppercase">
                              {isToday ? "Today's Habits" : 'Scheduled Habits'}
                            </span>
                          </div>
                          <span
                            className={cn(
                              'inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-semibold text-(--color-brand-text) tabular-nums ring-1 ring-inset dark:text-(--color-brand-text-light)',
                              doneCount === habits.length
                                ? 'bg-(--color-brand-primary)/16 ring-(--color-brand-primary)/30'
                                : 'bg-(--color-brand-primary)/10 ring-(--color-brand-primary)/20',
                            )}
                          >
                            {doneCount}/{habits.length} done
                          </span>
                        </div>

                        {achievementHint && (
                          <div className="-mt-2 mb-3 flex justify-center sm:-mt-1">
                            <p className="inline-flex items-center gap-1.5 rounded-full bg-(--color-brand-primary)/10 px-3 py-1.5 text-xs font-semibold text-(--color-brand-text) ring-1 ring-(--color-brand-primary)/18 ring-inset dark:text-(--color-brand-text-light)">
                              <Trophy aria-hidden="true" className="size-3.5" />
                              {achievementHint}
                            </p>
                          </div>
                        )}

                        <div className="my-auto py-1 lg:py-2">
                          <DailyHabitList />
                        </div>

                        <p className="mt-3 hidden border-t border-(--color-brand-primary)/10 pt-2.5 text-center text-xs text-(--color-text-secondary)/65 sm:block">
                          Click a circle to check off · Hold for options · Use ←
                          → keys to switch days
                        </p>
                      </div>
                      <div className="mt-4 flex flex-col items-center gap-1.5 text-center sm:hidden">
                        <p className="text-[12px] leading-tight text-(--color-text-secondary)/70">
                          Tap a circle to check off · Hold for options
                        </p>
                        {swipeDayHint}
                      </div>
                    </section>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Interactive 7-day "This Week" strip spanning full width on tablet & desktop */}
          <div className="mt-6 hidden sm:block">
            <TrackerWeekStrip
              selectedDayRate={habits.length > 0 ? completionRate : null}
              isSelectedDayLoading={isDayLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
