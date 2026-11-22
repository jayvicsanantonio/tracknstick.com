// The progress page's chart of daily completion through the month, one bar per scheduled day.
// On touch screens, dragging a finger across the bars scrubs through days with a live
// Apple Health-style readout and subtle haptic ticks on each bar change.

import { memo, useCallback, useMemo, useRef, useState } from 'react';
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

interface ProgressChartProps {
  data: { date: string; completionRate: number }[];
}

const AXIS_TICK = { fill: 'var(--color-text-secondary)', fontSize: 12 };

/** How strongly a bar is filled: full for a perfect day, faint for a missed one. */
function barOpacity(rate: number) {
  if (rate >= 100) return 1;
  if (rate > 0) return 0.55;
  return 0.3;
}

const ProgressChart = memo(function ProgressChart({
  data,
}: ProgressChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrubIndex, setScrubIndex] = useState<number | null>(null);

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
      setScrubIndex((prev) => {
        if (prev !== index) triggerHaptic('selection');
        return index;
      });
    },
    [chronological.length],
  );

  if (data.length === 0) {
    return (
      <p className="flex h-62 items-center justify-center rounded-xl text-center text-sm text-(--color-text-secondary) ring-1 ring-(--color-border-primary)/40 ring-inset">
        Nothing to chart for this month yet.
      </p>
    );
  }

  const scrubbedDay =
    scrubIndex !== null ? chronological[scrubIndex] : undefined;

  return (
    <div>
      {/* Live touch-scrub readout or monthly average key */}
      <div className="mb-2 flex min-h-5 items-center justify-end gap-2 text-xs text-(--color-text-secondary) tabular-nums">
        {scrubbedDay ? (
          <span
            role="status"
            aria-live="polite"
            className="rounded-full bg-(--color-brand-primary)/15 px-2.5 py-0.5 font-semibold text-(--color-brand-text) dark:text-(--color-brand-text-light)"
          >
            {parseDateKey(scrubbedDay.date).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}{' '}
            · {Math.round(scrubbedDay.completionRate)}%
          </span>
        ) : (
          <p className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="w-5 border-t-2 border-dashed border-(--color-foreground)/45"
            />
            Avg {average}%
          </p>
        )}
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
        onTouchEnd={() => setScrubIndex(null)}
        onTouchCancel={() => setScrubIndex(null)}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chronological}
            margin={{ top: 8, right: 4, bottom: 0, left: -12 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--color-border-primary)"
              strokeOpacity={0.5}
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
                borderRadius: '0.75rem',
                color: 'var(--color-card-foreground)',
              }}
            />
            <Bar
              dataKey="completionRate"
              fill="var(--color-brand-primary)"
              radius={[6, 6, 0, 0]}
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
              stroke="var(--color-foreground)"
              strokeDasharray="4 4"
              strokeOpacity={0.45}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

export default ProgressChart;
