import { useState, useMemo } from "react";
import StreakDisplayDays from "@/components/common/StreakDisplayDays";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MiscellaneousIcons from "@/icons/miscellaneous";

const {
  Award,
  BarChart2,
  Trophy,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Crown,
  Sun,
  Moon,
  Target,
} = MiscellaneousIcons;

// Mock data for insights
const generateMockData = (year: number, month: number) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => ({
    date: `${year}-${String(month + 1).padStart(2, "0")}-${String(
      i + 1
    ).padStart(2, "0")}`,
    completionRate: Math.floor(Math.random() * 101),
  }));
};

// Mock data for achievements
const achievements = [
  {
    id: 1,
    name: "Early Bird",
    description: "Complete all habits before 9 AM",
    icon: Sun,
  },
  {
    id: 2,
    name: "Consistency King",
    description: "Maintain a 7-day streak",
    icon: Crown,
  },
  {
    id: 3,
    name: "Habit Master",
    description: "Complete all habits for 30 days straight",
    icon: Award,
  },
  {
    id: 4,
    name: "Overachiever",
    description: "Complete 150% of your daily goals",
    icon: Target,
  },
  {
    id: 5,
    name: "Night Owl",
    description: "Complete all habits after 9 PM",
    icon: Moon,
  },
];

export default function ProgressOverview({
  isDarkMode,
  isOverviewMode,
  toggleIsOverviewMode,
}: {
  isDarkMode: boolean;
  isOverviewMode: boolean;
  toggleIsOverviewMode: () => void;
}) {
  const currentStreak = 7;
  const longestStreak = 14;
  const [currentDate, setCurrentDate] = useState(new Date());

  const insightData = useMemo(
    () => generateMockData(currentDate.getFullYear(), currentDate.getMonth()),
    [currentDate]
  );

  const changeMonth = (increment: number) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + increment);
      return newDate;
    });
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const today = new Date();

    const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
      const dayOfMonth = i + 1;
      const date = new Date(year, month, dayOfMonth);
      const isPast = date < today;
      const isToday = date.toDateString() === today.toDateString();
      const dayData = insightData.find(
        (d) => parseInt(d.date.split("-")[2]) === dayOfMonth
      );

      return { dayOfMonth, isPast, isToday, date, dayData };
    });

    return (
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center font-bold text-purple-800 dark:text-purple-200 text-xs"
          >
            {day}
          </div>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square"></div>
        ))}
        {calendarDays.map(({ dayOfMonth, isPast, isToday, dayData }, index) => (
          <div
            key={index}
            className={`aspect-square flex flex-col items-center justify-center p-1 ${
              isPast
                ? "bg-white dark:bg-gray-800"
                : "bg-gray-100 dark:bg-gray-700"
            }`}
          >
            <span
              className={`text-xs font-medium mb-1 ${
                isPast || isToday
                  ? "text-purple-800 dark:text-purple-200"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {dayOfMonth}
            </span>
            {(isPast || isToday) && (
              <div className="relative w-full h-full">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <circle
                    className="text-purple-200 dark:text-purple-800"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="transparent"
                    r="16"
                    cx="18"
                    cy="18"
                  />
                  {dayData && (
                    <circle
                      className="text-purple-600 dark:text-purple-400"
                      strokeWidth="3"
                      strokeDasharray={16 * 2 * Math.PI}
                      strokeDashoffset={
                        16 * 2 * Math.PI * (1 - dayData.completionRate / 100)
                      }
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="16"
                      cx="18"
                      cy="18"
                    />
                  )}
                </svg>
                {dayData && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[0.6rem] font-medium text-purple-800 dark:text-purple-200">
                      {dayData.completionRate}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOverviewMode} onOpenChange={toggleIsOverviewMode}>
      <DialogContent
        className={`sm:max-w-[90vw] sm:max-h-[90vh] overflow-y-auto ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-purple-50 border-purple-200"
        }`}
      >
        <DialogHeader>
          <DialogTitle
            className={isDarkMode ? "text-purple-200" : "text-purple-800"}
          >
            Progress Overview
          </DialogTitle>
        </DialogHeader>
        <div className="flex justify-center items-center mb-4">
          <div
            className={`flex items-center space-x-8 ${
              isDarkMode ? "text-purple-200" : "text-purple-800"
            }`}
          >
            <StreakDisplayDays value={currentStreak} label="Current Streak" />
            <StreakDisplayDays value={longestStreak} label="Longest Streak" />
          </div>
        </div>
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList
            className={`grid w-full grid-cols-3 ${
              isDarkMode ? "bg-gray-700" : "bg-purple-200"
            }`}
          >
            <TabsTrigger
              value="calendar"
              className={`${
                isDarkMode
                  ? "data-[state=active]:bg-purple-700 data-[state=active]:text-white"
                  : "data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              }`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger
              value="graph"
              className={`${
                isDarkMode
                  ? "data-[state=active]:bg-purple-700 data-[state=active]:text-white"
                  : "data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              }`}
            >
              <BarChart2 className="w-4 h-4 mr-2" />
              Completion Rate
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className={`${
                isDarkMode
                  ? "data-[state=active]:bg-purple-700 data-[state=active]:text-white"
                  : "data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              }`}
            >
              <Trophy className="w-4 h-4 mr-2" />
              Achievements
            </TabsTrigger>
          </TabsList>
          <TabsContent value="calendar">
            <Card
              className={isDarkMode ? "border-gray-700" : "border-purple-200"}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Button
                    onClick={() => changeMonth(-1)}
                    variant="outline"
                    size="icon"
                    className={
                      isDarkMode
                        ? "border-gray-600 hover:bg-gray-700"
                        : "border-purple-300 hover:bg-purple-100"
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3
                    className={`text-lg font-semibold ${
                      isDarkMode ? "text-purple-200" : "text-purple-800"
                    }`}
                  >
                    {currentDate.toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                  <Button
                    onClick={() => changeMonth(1)}
                    variant="outline"
                    size="icon"
                    className={
                      isDarkMode
                        ? "border-gray-600 hover:bg-gray-700"
                        : "border-purple-300 hover:bg-purple-100"
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-[400px] overflow-y-auto">
                {renderCalendar()}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="graph">
            <Card
              className={isDarkMode ? "border-gray-700" : "border-purple-200"}
            >
              <CardHeader>
                <h3
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-purple-200" : "text-purple-800"
                  }`}
                >
                  Daily Completion Rates
                </h3>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={insightData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDarkMode ? "#4B5563" : "#d8b4fe"}
                      />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) =>
                          new Date(value).getDate().toString()
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
                        formatter={(value: number) => [
                          `${value}%`,
                          "Completion Rate",
                        ]}
                        labelFormatter={(label) =>
                          `Date: ${new Date(label).toLocaleDateString()}`
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
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="achievements">
            <Card
              className={isDarkMode ? "border-gray-700" : "border-purple-200"}
            >
              <CardHeader>
                <h3
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-purple-200" : "text-purple-800"
                  }`}
                >
                  Achievements
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg ${
                        isDarkMode ? "bg-gray-700" : "bg-white"
                      } shadow-md flex items-center space-x-4`}
                    >
                      <div
                        className={`p-2 rounded-full ${
                          isDarkMode ? "bg-purple-700" : "bg-purple-100"
                        }`}
                      >
                        <achievement.icon
                          className={`h-6 w-6 ${
                            isDarkMode ? "text-purple-200" : "text-purple-600"
                          }`}
                        />
                      </div>
                      <div>
                        <h4
                          className={`font-semibold ${
                            isDarkMode ? "text-purple-200" : "text-purple-800"
                          }`}
                        >
                          {achievement.name}
                        </h4>
                        <p
                          className={`text-sm ${
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
