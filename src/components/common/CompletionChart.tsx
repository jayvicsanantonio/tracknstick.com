import { memo, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useContext } from 'react';
import { AppContext } from '@/context/AppContext';

interface CompletionChartData {
  date: string;
  completionRate: number;
}

interface CompletionChartProps {
  data: CompletionChartData[];
}

function CompletionChartComponent({ data }: CompletionChartProps) {
  const { isDarkMode } = useContext(AppContext);

  const chartColors = useMemo(
    () => ({
      grid: isDarkMode ? '#4B5563' : '#d8b4fe',
      text: isDarkMode ? '#E9D5FF' : '#7e22ce',
      bar: isDarkMode ? '#9333EA' : '#9333ea',
      tooltip: {
        bg: isDarkMode ? '#1F2937' : '#faf5ff',
        border: isDarkMode ? '#4B5563' : '#d8b4fe',
      },
    }),
    [isDarkMode]
  );

  const formatDate = (value: string) => {
    return new Date(value).getDate().toString();
  };

  const formatTooltipLabel = (label: string) => {
    return `Date: ${new Date(label).toLocaleDateString()}`;
  };

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={chartColors.grid}
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke={chartColors.text}
            label={{
              value: "Day of Month",
              position: "insideBottom",
              offset: -5,
              fill: chartColors.text,
            }}
          />
          <YAxis
            stroke={chartColors.text}
            label={{
              value: "Completion Rate (%)",
              angle: -90,
              position: "insideLeft",
              fill: chartColors.text,
            }}
          />
          <Tooltip
            formatter={(value: number) => [
              `${value}%`,
              "Completion Rate",
            ]}
            labelFormatter={formatTooltipLabel}
            contentStyle={{
              backgroundColor: chartColors.tooltip.bg,
              borderColor: chartColors.tooltip.border,
            }}
          />
          <Bar
            dataKey="completionRate"
            fill={chartColors.bar}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default memo(CompletionChartComponent);