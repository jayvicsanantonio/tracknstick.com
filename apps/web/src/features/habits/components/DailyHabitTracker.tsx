// The Tracker page body: the chosen day, its progress, and the habits due that day.
// Shares one unified open-canvas visual design across phone, tablet, and desktop:
// bold Large Title, stationary date capsule, floating segmented progress circle,
// and an elevated Today's Habits medallion stage card with a live done-count pill.

import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import { ChevronLeft, ChevronRight, WifiOff } from 'lucide-react';
import NoHabits from '@/features/habits/components/NoHabits';
import DailyHabitDate from '@/features/habits/components/DailyHabitDate';
import DailyHabitProgressIndicator from '@/features/habits/components/DailyHabitProgressIndicator';
import DailyHabitList from '@/features/habits/components/DailyHabitList';
import { useHabits } from '@/features/habits/hooks/useHabits';
import { useAllHabits } from '@/features/habits/hooks/useAllHabits';
import {
  useDaySwipe,
  type DaySwipeDirection,
} from '@/features/habits/hooks/useDaySwipe';
import NothingScheduled from '@/features/habits/components/NothingScheduled';
import MobileNavBar from '@/features/layout/components/MobileNavBar';
import { DateContext } from '@app/providers/DateContext';
import { Button } from '@shared/components/ui/button';
import { triggerHaptic } from '@shared/utils/haptics';
import { IOS_SPRING_TAP } from '@shared/utils/motion';
import { cn } from '@shared/utils/utils';

function TrackerSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading habits"
      className="flex w-full flex-1 flex-col pt-1 pb-28 sm:pt-1 sm:pb-6"
    >
      {/* Tablet & desktop page title placeholder */}
      <div className="mb-5 hidden h-10 items-center sm:flex">
        <div className="h-8 w-28 animate-pulse rounded-xl bg-(--color-brand-primary)/12 motion-reduce:animate-none" />
      </div>

      <div className="grid flex-1 content-start lg:grid-cols-[23rem_minmax(0,1fr)] lg:items-start lg:gap-10 xl:grid-cols-[25rem_minmax(0,1fr)]">
        {/* Left column: Date capsule + centered segmented progress ring */}
        <div className="flex flex-col">
          <div className="pb-3.5 sm:pb-0">
            <div className="ios-tracker-card h-12 w-full animate-pulse rounded-2xl motion-reduce:animate-none sm:h-[52px]" />
          </div>
          <div className="flex justify-center pt-3 pb-7 sm:py-8 lg:pt-8 lg:pb-4">
            <div className="size-56 animate-pulse rounded-full bg-(--color-brand-primary)/12 motion-reduce:animate-none min-[390px]:size-64 sm:size-68 md:size-72" />
          </div>
        </div>

        {/* Right column: Today's Habits elevated stage card */}
        <div className="ios-tracker-card rounded-[26px] px-4 pt-4 pb-6 sm:px-6 sm:pt-5 sm:pb-7 lg:px-7 lg:pt-6 lg:pb-8">
          <div className="mb-5 flex items-center justify-between px-1 sm:mb-6">
            <div className="h-[11px] w-24 animate-pulse rounded-full bg-(--color-brand-primary)/12 motion-reduce:animate-none" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-(--color-brand-primary)/12 motion-reduce:animate-none" />
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-6 sm:gap-x-7 sm:gap-y-7 md:gap-x-8 md:gap-y-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex w-[88px] flex-col items-center min-[380px]:w-[96px] sm:w-[108px] md:w-[116px]"
              >
                <div className="mb-2.5 size-20 animate-pulse rounded-full bg-(--color-brand-primary)/12 motion-reduce:animate-none sm:mb-3 sm:size-[88px] md:size-24" />
                <div className="h-[17px] w-16 animate-pulse rounded-full bg-(--color-brand-primary)/12 motion-reduce:animate-none sm:w-20" />
                <div className="mt-0.5 h-[14px] w-10 animate-pulse rounded-full bg-(--color-brand-primary)/8 motion-reduce:animate-none sm:w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DailyHabitTracker() {
  const { habits, isLoading, error, completionRate, mutateHabits } =
    useHabits();
  const dateContext = useContext(DateContext);
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

  const doneCount = habits.filter((habit) => habit.completed).length;
  const hasNoHabits =
    !isLoading &&
    habits.length === 0 &&
    !allHabitsLoading &&
    !allHabitsError &&
    allHabits.length === 0;

  const isToday = dateContext
    ? dateContext.date.toDateString() === dateContext.currentDate.toDateString()
    : true;

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
  // (arrow buttons, Left/Right keyboard shortcuts, Today / Back to Today).
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
    <MobileNavBar
      title={mobileNavTitle}
      titleDirection={navDirection}
      leading={
        <AnimatePresence initial={false}>
          {!isToday && dateContext ? (
            <motion.button
              key="today-pill"
              type="button"
              initial={
                prefersReducedMotion ? false : { opacity: 0, scale: 0.86 }
              }
              animate={{ opacity: 1, scale: 1 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0, transition: { duration: 0 } }
                  : { opacity: 0, scale: 0.86, transition: { duration: 0.14 } }
              }
              transition={IOS_SPRING_TAP}
              onClick={() => {
                triggerHaptic('selection');
                dateContext.setDate(new Date());
              }}
              className="rounded-full bg-(--color-brand-primary)/15 px-3 py-1 text-[13px] font-semibold text-(--color-brand-text) active:scale-95 dark:text-(--color-brand-text-light)"
            >
              Today
            </motion.button>
          ) : null}
        </AnimatePresence>
      }
    />
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
      <span>Swipe to switch days</span>
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
    <div className="mb-5 hidden h-10 items-center justify-between gap-4 sm:flex">
      <motion.p
        key={mobileNavTitle}
        aria-hidden="true"
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
        className="text-[32px] leading-none font-extrabold tracking-[-0.025em] text-(--color-foreground)"
      >
        {mobileNavTitle}
      </motion.p>
      <AnimatePresence initial={false}>
        {!isToday && dateContext ? (
          <motion.button
            key="desktop-today-pill"
            type="button"
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0, transition: { duration: 0 } }
                : { opacity: 0, scale: 0.88, transition: { duration: 0.14 } }
            }
            transition={IOS_SPRING_TAP}
            onClick={() => {
              triggerHaptic('selection');
              dateContext.setDate(new Date());
            }}
            className="cursor-pointer rounded-full bg-(--color-brand-primary)/14 px-3.5 py-1.5 text-xs font-semibold text-(--color-brand-text) ring-1 ring-(--color-brand-primary)/22 transition-[background-color,transform] ring-inset hover:bg-(--color-brand-primary)/20 focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:outline-none active:scale-95 dark:text-(--color-brand-text-light)"
          >
            Back to Today
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  );

  if (isInitialLoading) {
    return (
      <div
        className="flex h-full flex-1 touch-pan-y flex-col overscroll-x-none"
        {...swipeHandlers}
      >
        {navBar}
        {swipeEdgeIndicator}
        <div className="mx-auto flex w-full max-w-7xl flex-1 px-4 md:px-8 2xl:max-w-[90rem]">
          <TrackerSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-1 flex-col">
        {navBar}
        <div className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-4 max-sm:pb-28 md:px-8 2xl:max-w-[90rem]">
          <div className="ios-tracker-card flex w-full max-w-md flex-col items-center gap-4 rounded-[26px] px-6 py-10 text-center sm:px-8 sm:py-12">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-(--color-brand-primary)/14 text-(--color-brand-primary) ring-1 ring-(--color-brand-primary)/24 ring-inset">
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
        <div className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-4 max-sm:pb-28 md:px-8 2xl:max-w-[90rem]">
          <NoHabits />
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
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pt-1 max-sm:pb-28 sm:pb-6 md:px-8 2xl:max-w-[90rem]">
        {desktopPageTitle}

        <div className="grid flex-1 content-start lg:grid-cols-[23rem_minmax(0,1fr)] lg:items-start lg:gap-10 xl:grid-cols-[25rem_minmax(0,1fr)]">
          {/* Left column: stationary date capsule + floating segmented progress circle */}
          <div className="flex flex-col lg:overflow-x-clip">
            <div className="pb-3.5 sm:pb-0">
              <DailyHabitDate transitionDirection={navDirection} />
            </div>

            {habits.length > 0 ? (
              <motion.section
                aria-label="Progress"
                style={dayMotionStyle}
                className={cn(
                  'relative mx-auto flex w-full max-w-md flex-col items-center justify-center pt-3 pb-7 sm:py-8 lg:pt-8 lg:pb-4',
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
            ) : null}
          </div>

          {/* Right column: Today's Habits elevated medallion stage card */}
          <div className="min-w-0 pb-8 lg:overflow-x-clip lg:pb-0">
            <motion.div
              style={dayMotionStyle}
              className={cn(isDayLoading && 'pointer-events-none')}
            >
              <div
                className={cn(
                  'transition-opacity duration-150',
                  isDayLoading && 'opacity-65',
                )}
              >
                {habits.length === 0 ? (
                  allHabitsLoading ? null : allHabitsError ? (
                    <div className="ios-tracker-card flex flex-col items-center gap-4 rounded-[26px] px-6 py-12 text-center sm:px-8 sm:py-14">
                      <span className="flex size-12 items-center justify-center rounded-2xl bg-(--color-brand-primary)/14 text-(--color-brand-primary) ring-1 ring-(--color-brand-primary)/24 ring-inset">
                        <WifiOff aria-hidden="true" className="size-5" />
                      </span>
                      <p role="alert" className="text-(--color-foreground)">
                        Your habits could not be checked. Check your connection
                        and try again.
                      </p>
                      <Button
                        variant="outline"
                        className="h-11 rounded-full px-6"
                        onClick={() => void retryAllHabits()}
                      >
                        Try again
                      </Button>
                    </div>
                  ) : (
                    <>
                      <NothingScheduled />
                      <div className="mt-4 flex justify-center sm:hidden">
                        {swipeDayHint}
                      </div>
                    </>
                  )
                ) : (
                  <section aria-label="Today's Habits">
                    <div className="ios-tracker-card relative rounded-[26px] px-4 pt-4 pb-6 sm:px-6 sm:pt-5 sm:pb-7 lg:px-7 lg:pt-6 lg:pb-8">
                      <div className="mb-5 flex items-center justify-between px-1 sm:mb-6">
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
                      <DailyHabitList />
                    </div>
                    <div className="mt-4 flex flex-col items-center gap-1.5 text-center sm:hidden">
                      <p className="text-[12px] leading-tight text-(--color-text-secondary)/70">
                        Tap a circle to check off · Hold for options
                      </p>
                      {swipeDayHint}
                    </div>
                    <p className="mt-3.5 hidden text-center text-xs text-(--color-text-secondary)/65 sm:block">
                      Click a circle to check off · Hold for options · Use ← →
                      keys to switch days
                    </p>
                  </section>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
