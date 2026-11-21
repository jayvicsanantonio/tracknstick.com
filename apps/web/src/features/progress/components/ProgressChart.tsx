// The progress page's chart of daily completion through the month, one bar per scheduled day.
// A 0-100% axis, quiet gridlines in the app's palette, and a message instead of empty axes.

import { memo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from 'recharts';
import { parseDateKey } from '@shared/utils/date/formatDate';

interface ProgressChartProps {
  data: { date: string; completionRate: number }[];
}

const AXIS_TICK = { fill: 'var(--color-text-secondary)', fontSize: 12 };

const ProgressChart = memo(function ProgressChart({
  data,
}: ProgressChartProps) {
  if (data.length === 0) {
    return (
      <p className="flex h-48 items-center justify-center rounded-xl text-center text-sm text-(--color-text-secondary) ring-1 ring-(--color-border-primary)/40 ring-inset">
        Nothing to chart for this month yet.
      </p>
    );
  }

  // Oldest first, so the bars read left to right through the month.
  const chronological = [...data].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div
      className="h-56"
      role="img"
      aria-label="Bar chart showing daily completion rates for the selected month."
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
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

export default ProgressChart;
