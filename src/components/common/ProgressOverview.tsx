import { useContext, useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppContext } from "@/context/AppContext";
import VisuallyHidden from "@/components/common/VisuallyHidden";
import CompletionChart from "@/components/common/CompletionChart";
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

// IconProps interface
interface IconProps {
  className?: string;
}

// Achievement data structure
interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: React.ComponentType<IconProps>;
}

const achievements: Achievement[] = [
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
  isOverviewMode,
  toggleIsOverviewMode,
}: {
  isOverviewMode: boolean;
  toggleIsOverviewMode: () => void;
}) {
  const { isDarkMode } = useContext(AppContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentStreak = 7; // TODO: Replace with actual data
  const longestStreak = 14; // TODO: Replace with actual data

  const changeMonth = useCallback((increment: number) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + increment);
      return newDate;
    });
  }, []);

  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    return Array.from({ length: daysInMonth }, (_, i) => ({
      date: new Date(year, month, i + 1).toISOString().split('T')[0],
      completionRate: Math.floor(Math.random() * 101), // TODO: Replace with actual data
    }));
  }, [currentDate]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    return Array.from({ length: daysInMonth }, (_, i) => {
      const dayOfMonth = i + 1;
      const date = new Date(year, month, dayOfMonth);
      const isPast = date < today;
      const isToday = date.toDateString() === today.toDateString();
      const dayData = monthData.find(
        (d) => parseInt(d.date.split('-')[2]) === dayOfMonth
      );

      return { dayOfMonth, isPast, isToday, date, dayData };
    });
  }, [currentDate, monthData]);

  const renderCalendar = () => (
    <div className="grid grid-cols-7 gap-1">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
        <div
          key={day}
          className="text-center font-bold text-purple-800 dark:text-purple-200 text-xs"
        >
          {day}
        </div>
      ))}
      {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, index) => (
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
          {(isPast || isToday) && dayData && (
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
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[0.6rem] font-medium text-purple-800 dark:text-purple-200">
                  {dayData.completionRate}%
                </span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

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
          <VisuallyHidden>Overview of your progress.</VisuallyHidden>
        </DialogHeader>

        <div className="flex justify-center items-center mb-4">
          <div className="flex items-center space-x-8">
            <div className="flex items-center bg-purple-100 dark:bg-purple-800 rounded-lg p-4 shadow-md">
              <span className="text-4xl font-bold mr-2">{currentStreak}</span>
              <div className="flex flex-col">
                <span className="text-sm">Current Streak</span>
                <span className="text-xs text-purple-600 dark:text-purple-300">
                  days
                </span>
              </div>
            </div>
            <div className="flex items-center bg-purple-100 dark:bg-purple-800 rounded-lg p-4 shadow-md">
              <span className="text-4xl font-bold mr-2">{longestStreak}</span>
              <div className="flex flex-col">
                <span className="text-sm">Longest Streak</span>
                <span className="text-xs text-purple-600 dark:text-purple-300">
                  days
                </span>
              </div>
            </div>
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
                <CompletionChart data={monthData} />
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
