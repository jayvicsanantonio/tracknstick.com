// The progress page's chart of daily completion through the month, one bar per scheduled day.
// On touch screens, dragging a finger across the bars scrubs through days with a live
// Apple Health-style readout and subtle haptic ticks on each bar change.

import { memo, useCallback, useId, useMemo, useRef, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
  ReferenceLine,
} from 'recharts';
import { parseDateKey } from '@shared/utils/date/formatDate';
import { triggerHaptic } from '@shared/utils/haptics';

/** Heights, in percent, of the faint bars an empty month shows. */
const EMPTY_BAR_HEIGHTS = [30, 55, 40, 70, 45, 60, 35, 75, 50, 65];

interface ProgressChartProps {
  data: { date: string; completionRate: number }[];
}

const AXIS_TICK = { fill: 'var(--color-text-secondary)', fontSize: 12 };

/** How strongly a bar is filled: full for a perfect day, soft for a missed one. */
function barOpacity(rate: number) {
  if (rate >= 100) return 1;
  if (rate > 0) return 0.68;
  return 0.24;
}

const ProgressChart = memo(function ProgressChart({
  data,
}: ProgressChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrubIndexRef = useRef<number | null>(null);
  const [scrubIndex, setScrubIndex] = useState<number | null>(null);
  const barGradientId = useId();

  const chronological = useMemo(
    () => [...data].sort((a, b) => a.date.localeCompare(b.date)),
    [data],
  );

  const average = useMemo(() => {
    if (chronological.length === 0) return 0;
    return Math.round(
      chronological.reduce((sum, day) => sum + day.completionRate, 0) /
        chronological.length,
    );
  }, [chronological]);

  const updateScrubFromClientX = useCallback(
    (clientX: number) => {
      const box = containerRef.current?.getBoundingClientRect();
      if (!box || chronological.length === 0) return;
      // Exclude the left Y-axis label gutter (~36px) when mapping touch X to bars.
      const plotLeft = box.left + 36;
      const plotWidth = Math.max(1, box.width - 40);
      const ratio = Math.min(1, Math.max(0, (clientX - plotLeft) / plotWidth));
      const index = Math.min(
        chronological.length - 1,
        Math.floor(ratio * chronological.length),
      );
      if (lastScrubIndexRef.current !== index) {
        lastScrubIndexRef.current = index;
        triggerHaptic('selection');
      }
      setScrubIndex(index);
    },
    [chronological.length],
  );

  if (data.length === 0) {
    return (
      // Keyed so React builds the drawn chart afresh rather than reusing
      // these nodes, which the browser would report as a layout shift.
      <div
        key="empty-chart"
        className="relative flex h-62 flex-col items-center justify-end overflow-hidden rounded-2xl bg-(--color-brand-primary)/[0.04] px-4 pb-4"
      >
        {/* Faint bars hint at the chart a month of check-ins draws. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-4 top-6 bottom-20 flex items-end gap-2"
        >
          {EMPTY_BAR_HEIGHTS.map((height, index) => (
            <span
              key={index}
              style={{ height: `${height}%` }}
              className="flex-1 rounded-t-md bg-(--color-brand-primary)/10"
            />
          ))}
        </div>
        <p className="relative text-[15px] font-semibold text-(--color-foreground)">
          No check-ins this month yet
        </p>
        <p className="relative mt-1 text-center text-[13px] text-(--color-text-secondary)">
          Check off a habit and each day&apos;s completion shows here.
        </p>
      </div>
    );
  }

  const scrubbedDay =
    scrubIndex !== null ? chronological[scrubIndex] : undefined;

  return (
    <div>
      {/* Live touch-scrub readout or monthly average key */}
      <div className="mb-2 flex min-h-6 items-center justify-between gap-2 text-xs text-(--color-text-secondary) tabular-nums">
        <span className="text-[11px] text-(--color-text-secondary)/65 sm:hidden">
          {scrubbedDay ? 'Release to reset' : 'Touch & drag bars'}
        </span>
        <div className="ml-auto flex items-center">
          {scrubbedDay ? (
            <span
              role="status"
              aria-live="polite"
              className="rounded-full bg-(--color-brand-primary)/15 px-2.5 py-0.5 font-semibold text-(--color-brand-text) ring-1 ring-(--color-brand-primary)/24 ring-inset dark:text-(--color-brand-text-light)"
            >
              {parseDateKey(scrubbedDay.date).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}{' '}
              · {Math.round(scrubbedDay.completionRate)}%
            </span>
          ) : (
            <p className="flex items-center gap-2 rounded-full bg-(--color-brand-primary)/10 px-2.5 py-0.5 font-medium text-(--color-brand-text) dark:text-(--color-brand-text-light)">
              <span
                aria-hidden="true"
                className="w-4 border-t-2 border-dashed border-(--color-brand-primary)/70"
              />
              Avg {average}%
            </p>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        className="h-56 touch-pan-y select-none"
        role="img"
        aria-label={`Bar chart showing daily completion rates for the selected month, averaging ${average}%.`}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          if (touch) updateScrubFromClientX(touch.clientX);
        }}
        onTouchMove={(event) => {
          const touch = event.touches[0];
          if (touch) updateScrubFromClientX(touch.clientX);
        }}
        onTouchEnd={() => {
          lastScrubIndexRef.current = null;
          setScrubIndex(null);
        }}
        onTouchCancel={() => {
          lastScrubIndexRef.current = null;
          setScrubIndex(null);
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chronological}
            margin={{ top: 8, right: 4, bottom: 0, left: -12 }}
          >
            <defs>
              <linearGradient id={barGradientId} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-brand-primary)"
                  stopOpacity="1"
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-brand-primary)"
                  stopOpacity="0.45"
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="var(--color-brand-primary)"
              strokeDasharray="3 4"
              strokeOpacity={0.16}
            />
            <XAxis
              dataKey="date"
              tickFormatter={(value: string | number) =>
                parseDateKey(String(value)).getDate().toString()
              }
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              minTickGap={8}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 50, 100]}
              allowDataOverflow
              tickFormatter={(value: number) => `${value}%`}
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: 'var(--color-brand-primary)', fillOpacity: 0.08 }}
              formatter={(value: number) => [`${value}%`, 'Completed']}
              labelFormatter={(label: string | number) =>
                parseDateKey(String(label)).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })
              }
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border-primary)',
                borderRadius: '0.875rem',
                color: 'var(--color-card-foreground)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
              }}
            />
            <Bar
              dataKey="completionRate"
              fill={`url(#${barGradientId})`}
              radius={[7, 7, 2, 2]}
              maxBarSize={28}
              minPointSize={3}
            >
              {chronological.map((day, index) => (
                <Cell
                  key={day.date}
                  fillOpacity={
                    scrubIndex === null
                      ? barOpacity(day.completionRate)
                      : scrubIndex === index
                        ? 1
                        : 0.22
                  }
                />
              ))}
            </Bar>
            <ReferenceLine
              y={average}
              stroke="var(--color-brand-primary)"
              strokeDasharray="4 4"
              strokeOpacity={0.55}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

export default ProgressChart;
