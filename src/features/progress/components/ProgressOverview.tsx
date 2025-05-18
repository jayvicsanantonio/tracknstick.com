import { useContext, useState } from "react";
import ProgressCalendar from "@/features/progress/components/ProgressCalendar";
import ProgressChart from "@/features/progress/components/ProgressChart";
import ProgressAchievements from "@/features/progress/components/ProgressAchievements";
import StreakDisplayDays from "@/features/progress/components/StreakDisplayDays";
import { ThemeContext } from "@/context/ThemeContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VisuallyHidden from "@/components/ui/accessibility/VisuallyHidden";
import MiscellaneousIcons from "@/icons/miscellaneous";
import { useHabitsContext } from "@/features/habits/context/HabitsStateContext";
import useProgressHistory from "../hooks/useProgressHistory";
import useProgressStreaks from "../hooks/useProgressStreaks";

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
  const { isOverviewMode, toggleIsOverviewMode } = useHabitsContext();
  const { isDarkMode } = useContext(ThemeContext);
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
    <Dialog open={isOverviewMode} onOpenChange={toggleIsOverviewMode}>
      <DialogContent
        className={`sm:max-w-[90vw] sm:max-h-[90vh] overflow-y-auto ${
          isDarkMode
            ? "bg-gray-900 border-gray-800 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.05),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.08),transparent_40%)]"
            : "bg-purple-50 border-purple-200 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.15),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.1),transparent_40%)]"
        }`}
      >
        <DialogHeader>
          <DialogTitle
            className={isDarkMode ? "text-white" : "text-purple-800"}
          >
            Progress Overview
          </DialogTitle>
          <VisuallyHidden>
            <DialogDescription>Overview of your progress.</DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <div className="flex justify-center items-center mb-4">
          <div
            className={`flex items-center space-x-8 ${
              isDarkMode ? "text-white" : "text-purple-800"
            }`}
          >
            <StreakDisplayDays value={currentStreak} label="Current Streak" />
            <StreakDisplayDays value={longestStreak} label="Longest Streak" />
          </div>
        </div>
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList
            className={`grid w-full grid-cols-3 ${
              isDarkMode
                ? "bg-gray-800 border border-gray-700"
                : "bg-purple-200"
            }`}
          >
            <TabsTrigger
              value="calendar"
              className={`${
                isDarkMode
                  ? "data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:text-gray-200 hover:text-white"
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
                  ? "data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:text-gray-200 hover:text-white"
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
                  ? "data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:text-gray-200 hover:text-white"
                  : "data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              }`}
            >
              <Trophy className="w-4 h-4 mr-2" />
              Achievements
            </TabsTrigger>
          </TabsList>
          <TabsContent value="calendar">
            <Card
              className={
                isDarkMode
                  ? "border-gray-700 bg-gray-800 shadow-lg shadow-purple-900/5"
                  : "border-purple-200"
              }
            >
              <CardHeader>
                <h3
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-purple-800"
                  }`}
                >
                  Calendar
                </h3>
              </CardHeader>
              <CardContent className="h-[400px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <p
                      className={
                        isDarkMode ? "text-gray-200" : "text-purple-800"
                      }
                    >
                      Loading calendar data...
                    </p>
                  </div>
                ) : (
                  <ProgressCalendar
                    insightData={historyData}
                    isDarkMode={isDarkMode}
                    selectedMonth={selectedMonth}
                    setSelectedMonth={setSelectedMonth}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="graph">
            <Card
              className={
                isDarkMode
                  ? "border-gray-700 bg-gray-800 shadow-lg shadow-purple-900/5"
                  : "border-purple-200"
              }
            >
              <CardHeader>
                <h3
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-purple-800"
                  }`}
                >
                  Daily Completion Rates
                </h3>
              </CardHeader>
              <CardContent className="min-h-80">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <p
                      className={
                        isDarkMode ? "text-gray-200" : "text-purple-800"
                      }
                    >
                      Loading chart data...
                    </p>
                  </div>
                ) : (
                  <ProgressChart data={historyData} isDarkMode={isDarkMode} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="achievements">
            <Card
              className={
                isDarkMode
                  ? "border-gray-700 bg-gray-800 shadow-lg shadow-purple-900/5"
                  : "border-purple-200"
              }
            >
              <CardHeader>
                <h3
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-purple-800"
                  }`}
                >
                  Achievements
                </h3>
              </CardHeader>
              <CardContent>
                <ProgressAchievements
                  achievements={achievements.map((a) => ({
                    ...a,
                    id: String(a.id),
                  }))}
                  isDarkMode={isDarkMode}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
