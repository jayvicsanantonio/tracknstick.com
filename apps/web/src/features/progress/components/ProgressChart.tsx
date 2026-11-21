// The progress page's chart of daily completion through the month, one bar per scheduled day.
// Perfect days solid, partial ones lighter, missed ones a stub; a line marks the month's average.

import { memo } from 'react';
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
  if (data.length === 0) {
    return (
      // As tall as the chart and its key, so a month with nothing to chart
      // keeps the panel's size.
      <p className="flex h-62 items-center justify-center rounded-xl text-center text-sm text-(--color-text-secondary) ring-1 ring-(--color-border-primary)/40 ring-inset">
        Nothing to chart for this month yet.
      </p>
    );
  }

  // Oldest first, so the bars read left to right through the month.
  const chronological = [...data].sort((a, b) => a.date.localeCompare(b.date));
  const average = Math.round(
    chronological.reduce((sum, day) => sum + day.completionRate, 0) /
      chronological.length,
  );

  return (
    <div>
      {/* The line's key sits above the chart, where no bar can cover it. */}
      <p className="mb-2 flex items-center justify-end gap-2 text-xs text-(--color-text-secondary)">
        <span
          aria-hidden="true"
          className="w-5 border-t-2 border-dashed border-(--color-foreground)/45"
        />
        Avg {average}%
      </p>
      <div
        className="h-56"
        role="img"
        aria-label={`Bar chart showing daily completion rates for the selected month, averaging ${average}%.`}
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
              // A missed day keeps a stub, so it does not look unscheduled.
              minPointSize={3}
            >
              {chronological.map((day) => (
                <Cell
                  key={day.date}
                  fillOpacity={barOpacity(day.completionRate)}
                />
              ))}
            </Bar>
            {/* Drawn after the bars, so it stays visible across them. */}
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
