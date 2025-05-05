import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts";

interface ProgressChartProps {
  data: { date: string; completionRate: number }[];
  isDarkMode: boolean;
}

export default function ProgressChart({
  data,
  isDarkMode,
}: ProgressChartProps) {
  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDarkMode ? "#4B5563" : "#d8b4fe"}
          />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string | number) =>
              new Date(String(value)).getDate().toString()
            }
            label={{
              value: "Day of Month",
              position: "insideBottom",
              offset: -5,
            }}
            stroke={isDarkMode ? "#E9D5FF" : "#7e22ce"}
          />
          <YAxis
            label={{
              value: "Completion Rate (%)",
              angle: -90,
              position: "insideLeft",
            }}
            stroke={isDarkMode ? "#E9D5FF" : "#7e22ce"}
          />
          <Tooltip
            formatter={(value: number) => [`${value}%`, "Completion Rate"]}
            labelFormatter={(label: string | number) =>
              `Date: ${new Date(String(label)).toLocaleDateString()}`
            }
            contentStyle={{
              backgroundColor: isDarkMode ? "#1F2937" : "#faf5ff",
              borderColor: isDarkMode ? "#4B5563" : "#d8b4fe",
            }}
          />
          <Bar
            dataKey="completionRate"
            fill={isDarkMode ? "#9333EA" : "#9333ea"}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
