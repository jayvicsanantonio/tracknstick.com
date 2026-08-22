import { memo, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from 'recharts';
import { fromDateKey } from '@/features/progress/utils/dateKeys';

interface ProgressChartProps {
  data: { date: string; completionRate: number }[];
}

const ProgressChart = memo(function ProgressChart({
  data,
}: ProgressChartProps) {
  // The API returns days newest first, which is what the streak fold wants.
  // A chart has to read left to right, oldest first.
  const chronological = useMemo(
    () => [...data].sort((a, b) => a.date.localeCompare(b.date)),
    [data],
  );

  return (
    <div
      className="h-[400px]"
      role="img"
      aria-label="Bar chart showing daily completion rates for the selected month."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chronological}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border-primary)"
          />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string | number) =>
              fromDateKey(String(value)).getDate().toString()
            }
            label={{
              value: 'Day of Month',
              position: 'insideBottom',
              offset: -5,
              fill: 'var(--color-brand-text)',
            }}
            stroke="var(--color-brand-text)"
            tick={{ fill: 'var(--color-brand-text)' }}
          />
          <YAxis
            label={{
              value: 'Completion Rate (%)',
              angle: -90,
              position: 'insideLeft',
              fill: 'var(--color-brand-text)',
            }}
            stroke="var(--color-brand-text)"
            tick={{ fill: 'var(--color-brand-text)' }}
          />
          <Tooltip
            formatter={(value: number) => [`${value}%`, 'Completion Rate']}
            labelFormatter={(label: string | number) =>
              `Date: ${fromDateKey(String(label)).toLocaleDateString()}`
            }
            contentStyle={{
              backgroundColor: 'var(--color-card)',
              borderColor: 'var(--color-border-brand)',
              color: 'var(--color-card-foreground)',
            }}
          />
          <Bar
            dataKey="completionRate"
            fill="var(--color-brand-primary)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

export default ProgressChart;
