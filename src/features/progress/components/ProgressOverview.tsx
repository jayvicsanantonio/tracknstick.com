import { useState } from "react";
import ProgressCalendar from "@/features/progress/components/ProgressCalendar";
import ProgressChart from "@/features/progress/components/ProgressChart";
import ProgressAchievements from "@/features/progress/components/ProgressAchievements";
import StreakDisplayDays from "@/features/progress/components/StreakDisplayDays";
// import { ThemeContext } from "@/context/ThemeContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MiscellaneousIcons from "@/icons/miscellaneous";
import { useHabitsContext } from "@/features/habits/context/HabitsStateContext";
import useProgressHistory from "../hooks/useProgressHistory";
import useProgressStreaks from "../hooks/useProgressStreaks";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const { Award, BarChart2, Trophy, Calendar, Crown, Sun, Moon, Target } =
  MiscellaneousIcons;

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

export default function ProgressOverview() {
  const { toggleisProgressOverviewMode } = useHabitsContext();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Use separate hooks for history and streaks
  const { historyData, isLoading: isHistoryLoading } =
    useProgressHistory(selectedMonth);
  const {
    currentStreak,
    longestStreak,
    isLoading: isStreaksLoading,
  } = useProgressStreaks();

  // Combine loading states
  const isLoading = isHistoryLoading || isStreaksLoading;

  return (
    <motion.div
      className="flex-1 flex flex-col h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full flex-1 flex flex-col overflow-hidden shadow-xl border-purple-100 bg-white shadow-purple-200/50 dark:border-purple-900 dark:bg-[#121228] dark:shadow-purple-900/20">
        <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2 dark:text-white">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleisProgressOverviewMode}
                className="mr-2 dark:text-white dark:hover:bg-purple-900/70 dark:hover:text-purple-300"
                aria-label="Back to daily view"
              >
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 12H5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 19L5 12L12 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
              Progress Overview
            </CardTitle>
            <p className="text-sm dark:text-purple-400 text-zinc-600">
              View your progress in one place
            </p>
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-6 sm:pb-8 flex-1 overflow-auto">
          <div className="flex justify-center items-center mb-4">
            <div className="flex items-center space-x-8 dark:text-purple-300 text-purple-800">
              <StreakDisplayDays value={currentStreak} label="Current Streak" />
              <StreakDisplayDays value={longestStreak} label="Longest Streak" />
            </div>
          </div>
          <Tabs defaultValue="calendar" className="w-full">
            <TabsList className="grid w-full grid-cols-3 dark:bg-zinc-800 bg-purple-200">
              <TabsTrigger
                value="calendar"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white dark:data-[state=inactive]:text-purple-400 dark:hover:text-white"
              >
                <Calendar aria-hidden="true" className="w-4 h-4 mr-2" />
                History
              </TabsTrigger>
              <TabsTrigger
                value="graph"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white dark:data-[state=inactive]:text-purple-400 dark:hover:text-white"
              >
                <BarChart2 aria-hidden="true" className="w-4 h-4 mr-2" />
                Completion Rate
              </TabsTrigger>
              <TabsTrigger
                value="achievements"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white dark:data-[state=inactive]:text-purple-400 dark:hover:text-white"
              >
                <Trophy aria-hidden="true" className="w-4 h-4 mr-2" />
                Achievements
              </TabsTrigger>
            </TabsList>
            <TabsContent value="calendar">
              <Card className="border-purple-200 dark:border-purple-900 dark:bg-black/30 dark:shadow-lg dark:shadow-purple-900/5">
                <CardHeader>
                  <h3 className="text-lg font-semibold dark:text-purple-300 text-purple-800">
                    Calendar
                  </h3>
                </CardHeader>
                <CardContent className="h-fit overflow-y-auto">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <p className="dark:text-purple-400 text-purple-800">
                        Loading calendar data...
                      </p>
                    </div>
                  ) : (
                    <ProgressCalendar
                      insightData={historyData}
                      selectedMonth={selectedMonth}
                      setSelectedMonth={setSelectedMonth}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="graph">
              <Card className="border-purple-200 dark:border-purple-900 dark:bg-black/30 dark:shadow-lg dark:shadow-purple-900/5">
                <CardHeader>
                  <h3 className="text-lg font-semibold dark:text-purple-300 text-purple-800">
                    Daily Completion Rates
                  </h3>
                </CardHeader>
                <CardContent className="min-h-80">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <p className="dark:text-purple-400 text-purple-800">
                        Loading chart data...
                      </p>
                    </div>
                  ) : (
                    <ProgressChart data={historyData} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="achievements">
              <Card className="border-purple-200 dark:border-purple-900 dark:bg-black/30 dark:shadow-lg dark:shadow-purple-900/5">
                <CardHeader>
                  <h3 className="text-lg font-semibold dark:text-purple-300 text-purple-800">
                    Achievements
                  </h3>
                </CardHeader>
                <CardContent>
                  <ProgressAchievements
                    achievements={achievements.map((a) => ({
                      ...a,
                      id: String(a.id),
                    }))}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
