// Segmented circular progress ring for the Daily Tracker.
// Divides the ring into one arc per habit due on the selected day with a subtle
// watch-dial interior. When the final habit is completed, the segments smoothly
// extend across their gaps to connect into one unbroken ring, followed by a
// drawn checkmark replacing the percentage in the center.

import { memo, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useReducedMotion,
} from 'framer-motion';
import { useTheme } from '@shared/hooks/useTheme';

interface DailyHabitProgressIndicatorProps {
  completionRate: number;
  totalHabits: number;
  completedHabits: number;
  /** Identifies the selected day so switching days snaps cleanly without replaying live animations. */
  dayKey?: string;
  /** True while an uncached day's habits are still being fetched during a day switch. */
  isDayLoading?: boolean;
}

interface SegmentArc {
  d: string;
  length: number;
}

interface GapBridge {
  clockwisePath: string;
  counterClockwisePath: string;
  halfLength: number;
}

type CompletionPhase = 'idle' | 'filling' | 'connecting' | 'checked';

const VIEWBOX_SIZE = 200;
const CENTER = VIEWBOX_SIZE / 2;
const RADIUS = 83;
const INNER_BEZEL_RADIUS = 67;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const MAX_STROKE_WIDTH = 14.5;
const TOP_ANGLE = -Math.PI / 2;

// Exact geometric length of `M10 34 L25 49 L54 17`:
// Downstroke (10,34 -> 25,49) ≈ 21.21, upstroke (25,49 -> 54,17) ≈ 43.19, total ≈ 64.40.
const CHECKMARK_PATH_LENGTH = 66;
const CHECKMARK_VERTEX_OFFSET = 44.8;
const CHECKMARK_DASH_GAP = 140;
const CHECKMARK_DRAW_DELAY_S = 0.16;

// Choreography timings (ms) when transitioning live to 100% completion.
const MULTI_SEGMENT_CONNECT_DELAY_MS = 340;
const MULTI_SEGMENT_CHECK_DELAY_MS = 640;
const SINGLE_SEGMENT_CONNECT_DELAY_MS = 420;
const SINGLE_SEGMENT_CHECK_DELAY_MS = 500;

function polarPoint(angle: number, radius = RADIUS) {
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  };
}

function arcPath(
  startAngle: number,
  endAngle: number,
  largeArcFlag: 0 | 1,
  sweepFlag: 0 | 1,
) {
  const start = polarPoint(startAngle);
  const end = polarPoint(endAngle);
  return `M ${start.x.toFixed(3)} ${start.y.toFixed(3)} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} ${sweepFlag} ${end.x.toFixed(3)} ${end.y.toFixed(3)}`;
}

function getSegmentGeometry(segmentCount: number): {
  strokeWidth: number;
  arcs: SegmentArc[];
  bridges: GapBridge[];
} {
  if (segmentCount <= 1) {
    return { strokeWidth: MAX_STROKE_WIDTH, arcs: [], bridges: [] };
  }

  const slotArc = CIRCUMFERENCE / segmentCount;
  const preferredGap =
    segmentCount === 2
      ? 11
      : segmentCount === 3
        ? 10
        : segmentCount === 4
          ? 9.5
          : segmentCount <= 6
            ? 9
            : segmentCount <= 8
              ? 8
              : segmentCount <= 12
                ? 7
                : 6;

  // Keep gaps proportional once slots tighten so adjacent segments stay distinct.
  const visualGap = Math.min(preferredGap, slotArc * 0.26);
  const availableForSegment = slotArc - visualGap;

  // Round caps add half a stroke width on each end (one full stroke width per gap).
  // Capping strokeWidth at 65% of the available arc ensures a positive arc length
  // and clean visual separation for any number of habits.
  const strokeWidth = Math.min(MAX_STROKE_WIDTH, availableForSegment * 0.65);
  const mathGap = visualGap + strokeWidth;
  const slotAngle = (2 * Math.PI) / segmentCount;
  const halfGapAngle = mathGap / 2 / RADIUS;
  const sweepAngle = Math.max(0.005, slotAngle - 2 * halfGapAngle);
  const arcLength = RADIUS * sweepAngle;
  const largeArcFlag: 0 | 1 = sweepAngle > Math.PI ? 1 : 0;

  const arcs: SegmentArc[] = Array.from({ length: segmentCount }, (_, i) => {
    const startAngle = TOP_ANGLE + i * slotAngle + halfGapAngle;
    const endAngle = startAngle + sweepAngle;
    return {
      d: arcPath(startAngle, endAngle, largeArcFlag, 1),
      length: arcLength,
    };
  });

  // Two symmetric half-bridges per gap: each starts inside an adjacent segment's
  // existing round cap and extends cleanly to meet at the exact gap midpoint.
  const halfGapLength = RADIUS * halfGapAngle;
  const bridges: GapBridge[] = Array.from({ length: segmentCount }, (_, i) => {
    const gapCenter = TOP_ANGLE + i * slotAngle;
    return {
      clockwisePath: arcPath(gapCenter - halfGapAngle, gapCenter, 0, 1),
      counterClockwisePath: arcPath(gapCenter + halfGapAngle, gapCenter, 0, 0),
      halfLength: halfGapLength,
    };
  });

  return { strokeWidth, arcs, bridges };
}

const DailyHabitProgressIndicator = memo(function DailyHabitProgressIndicator({
  completionRate,
  totalHabits,
  completedHabits,
  dayKey,
  isDayLoading = false,
}: DailyHabitProgressIndicatorProps) {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const prefersReducedMotion = useReducedMotion();
  const arcGradientId = useId();
  const dialGradientId = useId();
  const checkGradientId = useId();

  const displayRate = useMemo(() => {
    if (Number.isNaN(completionRate)) return 0;
    return Math.min(100, Math.max(0, Math.round(completionRate)));
  }, [completionRate]);

  const safeTotal = Math.max(0, Math.floor(totalHabits));
  const segmentCount = Math.max(1, safeTotal);
  const safeCompleted = Math.min(
    safeTotal,
    Math.max(0, Math.floor(completedHabits)),
  );
  const isAllCompleted =
    safeTotal > 0 ? safeCompleted >= safeTotal : displayRate === 100;
  const dayResetKey = `${dayKey ?? ''}:${isDayLoading ? 'loading' : 'ready'}`;

  // Mount already-completed days directly in the connected checkmark state;
  // live transitions from <100% -> 100% on the same day play the 3-beat fill -> connect -> check sequence.
  const [phase, setPhase] = useState<CompletionPhase>(() =>
    isAllCompleted ? 'checked' : 'idle',
  );
  const [celebrationCount, setCelebrationCount] = useState(0);
  const [liveCelebrationActive, setLiveCelebrationActive] = useState(false);
  const [animatedRate, setAnimatedRate] = useState(displayRate);

  const prevRef = useRef({
    total: safeTotal,
    allCompleted: isAllCompleted,
    dayResetKey,
  });
  const rateRef = useRef({
    value: displayRate,
    total: safeTotal,
    dayResetKey,
  });

  // Smoothly count the percentage in sync with the segment sweep on live toggles.
  useEffect(() => {
    const contextChanged =
      rateRef.current.total !== safeTotal ||
      rateRef.current.dayResetKey !== dayResetKey;
    rateRef.current.total = safeTotal;
    rateRef.current.dayResetKey = dayResetKey;

    if (prefersReducedMotion || contextChanged || isDayLoading) {
      rateRef.current.value = displayRate;
      setAnimatedRate(displayRate);
      return;
    }

    if (rateRef.current.value === displayRate) {
      return;
    }

    const controls = animate(rateRef.current.value, displayRate, {
      duration: 0.36,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        const rounded = Math.round(latest);
        rateRef.current.value = rounded;
        setAnimatedRate(rounded);
      },
      onComplete: () => {
        rateRef.current.value = displayRate;
        setAnimatedRate(displayRate);
      },
    });

    return () => controls.stop();
  }, [displayRate, safeTotal, dayResetKey, isDayLoading, prefersReducedMotion]);

  // Choreograph segment fill -> gap connection -> checkmark reveal when all habits finish.
  useEffect(() => {
    const prev = prevRef.current;
    const contextChanged =
      prev.total !== safeTotal || prev.dayResetKey !== dayResetKey;
    const justCompletedAll = !prev.allCompleted && isAllCompleted;
    prevRef.current = {
      total: safeTotal,
      allCompleted: isAllCompleted,
      dayResetKey,
    };

    if (!isAllCompleted) {
      setPhase('idle');
      setLiveCelebrationActive(false);
      return;
    }

    if (
      prefersReducedMotion ||
      contextChanged ||
      isDayLoading ||
      !justCompletedAll
    ) {
      setPhase('checked');
      setLiveCelebrationActive(false);
      return;
    }

    setPhase('filling');
    setLiveCelebrationActive(true);
    const connectDelay =
      segmentCount > 1
        ? MULTI_SEGMENT_CONNECT_DELAY_MS
        : SINGLE_SEGMENT_CONNECT_DELAY_MS;
    const checkDelay =
      segmentCount > 1
        ? MULTI_SEGMENT_CHECK_DELAY_MS
        : SINGLE_SEGMENT_CHECK_DELAY_MS;

    const connectTimer = setTimeout(() => {
      setPhase('connecting');
      setCelebrationCount((count) => count + 1);
    }, connectDelay);

    const checkTimer = setTimeout(() => {
      setPhase('checked');
    }, checkDelay);

    return () => {
      clearTimeout(connectTimer);
      clearTimeout(checkTimer);
    };
  }, [
    isAllCompleted,
    safeTotal,
    dayResetKey,
    isDayLoading,
    segmentCount,
    prefersReducedMotion,
  ]);

  const isConnected = phase === 'connecting' || phase === 'checked';
  const showCheckmark = phase === 'checked';
  const isLiveCelebration = liveCelebrationActive && isConnected;

  const { strokeWidth, arcs, bridges } = useMemo(
    () => getSegmentGeometry(segmentCount),
    [segmentCount],
  );

  const getSegmentTransition = (isCompleted: boolean) =>
    prefersReducedMotion
      ? { duration: 0 }
      : {
          strokeDashoffset: {
            duration: 0.42,
            ease: [0.22, 1, 0.36, 1] as const,
          },
          strokeOpacity: {
            duration: isCompleted ? 0.1 : 0.18,
            delay: isCompleted ? 0 : 0.24,
          },
        };

  const bridgeTransition = prefersReducedMotion
    ? { duration: 0 }
    : {
        strokeDashoffset: {
          duration: isConnected ? 0.32 : 0.2,
          ease: [0.22, 1, 0.36, 1] as const,
        },
        strokeOpacity: {
          duration: isConnected ? 0.04 : 0.08,
          delay: isConnected ? 0 : 0.12,
        },
      };

  const singleSegmentComplete =
    safeTotal > 0 ? safeCompleted >= 1 : displayRate > 0;
  const singleSegmentDashoffset =
    safeTotal > 0
      ? singleSegmentComplete
        ? 0
        : CIRCUMFERENCE
      : CIRCUMFERENCE * (1 - displayRate / 100);

  return (
    <div
      role="progressbar"
      aria-label={`Daily habit completion: ${displayRate}%`}
      aria-valuenow={displayRate}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={
        safeTotal > 0
          ? `${displayRate}%, ${safeCompleted} of ${safeTotal} ${safeTotal === 1 ? 'habit' : 'habits'} completed`
          : `${displayRate}%`
      }
      data-connected={isConnected ? 'true' : 'false'}
      className="flex shrink-0 flex-col items-center justify-center"
    >
      <motion.div
        animate={
          isLiveCelebration && !prefersReducedMotion
            ? { scale: [1, 1.03, 1] }
            : { scale: 1 }
        }
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
        }
        className="relative size-56 min-[390px]:size-64 sm:size-68 md:size-72"
      >
        <svg
          className="h-full w-full overflow-visible"
          viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id={arcGradientId}
              gradientUnits="userSpaceOnUse"
              x1="18"
              y1="18"
              x2="182"
              y2="182"
            >
              <stop
                offset="0%"
                stopColor={
                  isDark
                    ? 'var(--color-brand-text)'
                    : 'var(--color-brand-text-light)'
                }
              />
              <stop offset="48%" stopColor="var(--color-brand-primary)" />
              <stop
                offset="100%"
                stopColor={
                  isDark
                    ? 'var(--color-brand-tertiary)'
                    : 'var(--color-brand-secondary)'
                }
              />
            </linearGradient>

            <radialGradient id={dialGradientId} cx="50%" cy="42%" r="60%">
              <stop
                offset="0%"
                stopColor="var(--color-brand-primary)"
                stopOpacity={isDark ? 0.04 : 0.03}
              />
              <stop
                offset="100%"
                stopColor="var(--color-brand-primary)"
                stopOpacity={isDark ? 0.11 : 0.07}
              />
            </radialGradient>
          </defs>

          {/* Subtle watch-dial interior depth */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={INNER_BEZEL_RADIUS}
            fill={`url(#${dialGradientId})`}
          />
          <motion.circle
            cx={CENTER}
            cy={CENTER}
            r={INNER_BEZEL_RADIUS}
            fill="var(--color-brand-primary)"
            initial={false}
            animate={{
              opacity: isConnected ? (isDark ? 0.07 : 0.05) : 0,
            }}
            transition={
              prefersReducedMotion ? { duration: 0 } : { duration: 0.4 }
            }
          />

          {/* Fine concentric inner bezel hairline */}
          <motion.circle
            cx={CENTER}
            cy={CENTER}
            r={INNER_BEZEL_RADIUS}
            stroke="var(--color-brand-primary)"
            strokeWidth={0.85}
            fill="transparent"
            initial={false}
            animate={{
              strokeOpacity: isConnected
                ? isDark
                  ? 0.28
                  : 0.24
                : isDark
                  ? 0.14
                  : 0.12,
            }}
            transition={
              prefersReducedMotion ? { duration: 0 } : { duration: 0.4 }
            }
          />

          {/* Crisp vector ripple emitted the instant all segments connect */}
          {liveCelebrationActive &&
          celebrationCount > 0 &&
          !prefersReducedMotion ? (
            <motion.circle
              key={`ripple-${celebrationCount}`}
              cx={CENTER}
              cy={CENTER}
              stroke="var(--color-brand-primary)"
              strokeWidth={1.75}
              fill="transparent"
              initial={{ r: RADIUS, opacity: 0.52 }}
              animate={{ r: 97, opacity: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            />
          ) : null}

          {segmentCount === 1 ? (
            <g
              key={`single-${dayResetKey}`}
              data-segment
              data-completed={singleSegmentComplete ? 'true' : 'false'}
            >
              <circle
                className="text-(--color-brand-primary)/15 dark:text-(--color-brand-primary)/18"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="transparent"
                r={RADIUS}
                cx={CENTER}
                cy={CENTER}
              />
              <motion.circle
                stroke={`url(#${arcGradientId})`}
                strokeWidth={strokeWidth}
                strokeDasharray={CIRCUMFERENCE}
                strokeLinecap="round"
                fill="transparent"
                r={RADIUS}
                cx={CENTER}
                cy={CENTER}
                transform={`rotate(-90 ${CENTER} ${CENTER})`}
                initial={false}
                animate={{
                  strokeDashoffset: singleSegmentDashoffset,
                  strokeOpacity: singleSegmentComplete ? 1 : 0,
                }}
                transition={getSegmentTransition(singleSegmentComplete)}
              />
            </g>
          ) : (
            <>
              {/* Segmented tracks & active completion arcs */}
              {arcs.map((arc, index) => {
                const isCompleted = index < safeCompleted;
                const dashSpan = arc.length + 1;

                return (
                  <g
                    key={`${dayResetKey}-${segmentCount}-${index}`}
                    data-segment
                    data-completed={isCompleted ? 'true' : 'false'}
                  >
                    <path
                      d={arc.d}
                      className="text-(--color-brand-primary)/15 dark:text-(--color-brand-primary)/18"
                      stroke="currentColor"
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                    <motion.path
                      d={arc.d}
                      stroke={`url(#${arcGradientId})`}
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      strokeDasharray={`${dashSpan} ${CIRCUMFERENCE}`}
                      fill="transparent"
                      initial={false}
                      animate={{
                        strokeDashoffset: isCompleted ? 0 : dashSpan,
                        strokeOpacity: isCompleted ? 1 : 0,
                      }}
                      transition={getSegmentTransition(isCompleted)}
                    />
                  </g>
                );
              })}

              {/* Symmetric gap connectors that extend from adjacent segment tips to fuse the ring */}
              {bridges.map((bridge, index) => {
                const bridgeDashSpan = bridge.halfLength + 0.5;
                return (
                  <g
                    key={`bridge-${dayResetKey}-${segmentCount}-${index}`}
                    data-segment-bridge
                  >
                    <motion.path
                      d={bridge.clockwisePath}
                      stroke={`url(#${arcGradientId})`}
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      strokeDasharray={`${bridgeDashSpan} ${CIRCUMFERENCE}`}
                      fill="transparent"
                      initial={false}
                      animate={{
                        strokeDashoffset: isConnected ? 0 : bridgeDashSpan,
                        strokeOpacity: isConnected ? 1 : 0,
                      }}
                      transition={bridgeTransition}
                    />
                    <motion.path
                      d={bridge.counterClockwisePath}
                      stroke={`url(#${arcGradientId})`}
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      strokeDasharray={`${bridgeDashSpan} ${CIRCUMFERENCE}`}
                      fill="transparent"
                      initial={false}
                      animate={{
                        strokeDashoffset: isConnected ? 0 : bridgeDashSpan,
                        strokeOpacity: isConnected ? 1 : 0,
                      }}
                      transition={bridgeTransition}
                    />
                  </g>
                );
              })}
            </>
          )}
        </svg>

        {/* Center display: crisp percentage while in progress, drawn checkmark once all segments connect */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <AnimatePresence initial={false}>
            {showCheckmark ? (
              <motion.div
                key="checkmark"
                data-completion-check
                aria-hidden="true"
                initial={false}
                animate={{
                  opacity: 1,
                  scale:
                    isLiveCelebration && !prefersReducedMotion
                      ? [1, 1, 1.1, 0.98, 1]
                      : 1,
                }}
                exit={
                  prefersReducedMotion
                    ? { opacity: 0, transition: { duration: 0 } }
                    : {
                        opacity: 0,
                        scale: 0.72,
                        transition: { duration: 0.14, ease: [0.4, 0, 1, 1] },
                      }
                }
                transition={
                  prefersReducedMotion || !isLiveCelebration
                    ? { duration: 0 }
                    : {
                        scale: {
                          duration: 0.78,
                          delay: CHECKMARK_DRAW_DELAY_S,
                          times: [0, 0.76, 0.88, 0.95, 1],
                          ease: 'easeOut',
                        },
                      }
                }
                className="absolute inset-0 flex items-center justify-center"
              >
                <svg
                  className="size-28 overflow-visible min-[390px]:size-32 sm:size-36"
                  viewBox="0 0 64 64"
                  fill="none"
                >
                  <defs>
                    <linearGradient
                      id={checkGradientId}
                      gradientUnits="userSpaceOnUse"
                      x1="10"
                      y1="49"
                      x2="54"
                      y2="17"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--color-brand-primary)"
                      />
                      <stop
                        offset="65%"
                        stopColor="var(--color-brand-primary)"
                      />
                      <stop
                        offset="100%"
                        stopColor={
                          isDark
                            ? 'var(--color-brand-text)'
                            : 'var(--color-brand-text-light)'
                        }
                      />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M10 34 L25 49 L54 17"
                    stroke={`url(#${checkGradientId})`}
                    strokeWidth={8.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={`${CHECKMARK_PATH_LENGTH} ${CHECKMARK_DASH_GAP}`}
                    initial={
                      prefersReducedMotion || !isLiveCelebration
                        ? false
                        : {
                            strokeDashoffset: CHECKMARK_PATH_LENGTH,
                            strokeOpacity: 0,
                          }
                    }
                    animate={
                      prefersReducedMotion || !isLiveCelebration
                        ? { strokeDashoffset: 0, strokeOpacity: 1 }
                        : {
                            strokeDashoffset: [
                              CHECKMARK_PATH_LENGTH,
                              CHECKMARK_VERTEX_OFFSET,
                              CHECKMARK_VERTEX_OFFSET,
                              0,
                            ],
                            strokeOpacity: 1,
                          }
                    }
                    transition={
                      prefersReducedMotion || !isLiveCelebration
                        ? { duration: 0 }
                        : {
                            strokeDashoffset: {
                              duration: 0.62,
                              delay: CHECKMARK_DRAW_DELAY_S,
                              times: [0, 0.34, 0.4, 1],
                              ease: [
                                [0.45, 0, 0.85, 0.5],
                                'linear',
                                [0.16, 1, 0.3, 1],
                              ],
                            },
                            strokeOpacity: {
                              duration: 0.02,
                              delay: CHECKMARK_DRAW_DELAY_S,
                            },
                          }
                    }
                  />
                </svg>
              </motion.div>
            ) : (
              <motion.div
                key="percentage"
                initial={
                  prefersReducedMotion ? false : { opacity: 0, scale: 0.84 }
                }
                animate={{ opacity: 1, scale: 1 }}
                exit={
                  prefersReducedMotion
                    ? { opacity: 0, transition: { duration: 0 } }
                    : {
                        opacity: 0,
                        scale: 0.72,
                        transition: { duration: 0.16, ease: [0.4, 0, 1, 1] },
                      }
                }
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : {
                        duration: 0.24,
                        delay: 0.06,
                        ease: [0.22, 1, 0.36, 1],
                      }
                }
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="inline-flex items-baseline pl-[0.14em] leading-none font-bold tracking-[-0.04em] text-(--color-foreground) tabular-nums">
                  <span className="text-[54px] min-[390px]:text-[60px] sm:text-[64px] sm:font-extrabold">
                    {animatedRate}
                  </span>
                  <span className="ml-0.5 text-[24px] font-semibold text-(--color-brand-primary)/85 min-[390px]:text-[26px] sm:text-[28px]">
                    %
                  </span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
});

export default DailyHabitProgressIndicator;
