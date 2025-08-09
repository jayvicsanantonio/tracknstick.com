import { useMemo, memo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from 'recharts';
import { useTheme } from '@shared/hooks/useTheme';

interface ProgressChartProps {
  data: { date: string; completionRate: number }[];
}

const ProgressChart = memo(function ProgressChart({
  data,
}: ProgressChartProps) {
  const isDarkMode = useTheme();

  const chartColors = useMemo(
    () => ({
      grid:
        getComputedStyle(document.documentElement)
          .getPropertyValue('--color-border-primary')
          .trim() || '#e5e7eb',
      axis:
        getComputedStyle(document.documentElement)
          .getPropertyValue('--color-brand-text')
          .trim() || '#111827',
      tooltipBg:
        getComputedStyle(document.documentElement)
          .getPropertyValue('--color-card')
          .trim() || '#ffffff',
      tooltipBorder:
        getComputedStyle(document.documentElement)
          .getPropertyValue('--color-border-brand')
          .trim() || '#e5e7eb',
      tooltipText:
        getComputedStyle(document.documentElement)
          .getPropertyValue('--color-card-foreground')
          .trim() || '#111827',
    }),
    [isDarkMode],
  );

  return (
    <div
      className="h-[400px]"
      role="img"
      aria-label="Bar chart showing daily completion rates for the selected month."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string | number) =>
              new Date(String(value)).getDate().toString()
            }
            label={{
              value: 'Day of Month',
              position: 'insideBottom',
              offset: -5,
              fill: chartColors.axis,
            }}
            stroke={chartColors.axis}
            tick={{ fill: chartColors.axis }}
          />
          <YAxis
            label={{
              value: 'Completion Rate (%)',
              angle: -90,
              position: 'insideLeft',
              fill: chartColors.axis,
            }}
            stroke={chartColors.axis}
            tick={{ fill: chartColors.axis }}
          />
          <Tooltip
            formatter={(value: number) => [`${value}%`, 'Completion Rate']}
            labelFormatter={(label: string | number) =>
              `Date: ${new Date(String(label)).toLocaleDateString()}`
            }
            contentStyle={{
              backgroundColor: chartColors.tooltipBg,
              borderColor: chartColors.tooltipBorder,
              color: chartColors.tooltipText,
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
