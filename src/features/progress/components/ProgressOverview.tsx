import { useContext } from "react";
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

const { Award, BarChart2, Trophy, Calendar, Crown, Sun, Moon, Target } =
  MiscellaneousIcons;

const generateMockData = (year: number, month: number) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => ({
    date: `${year}-${String(month + 1).padStart(2, "0")}-${String(
      i + 1,
    ).padStart(2, "0")}`,
    completionRate: Math.floor(Math.random() * 101),
  }));
};

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

  const currentStreak = 7;
  const longestStreak = 14;
  const { isDarkMode } = useContext(ThemeContext);
  const currentDate = new Date();
  const insightData = generateMockData(
    currentDate.getFullYear(),
    currentDate.getMonth(),
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
          <VisuallyHidden>
            <DialogDescription>Overview of your progress.</DialogDescription>
          </VisuallyHidden>
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
                <h3
                  className={`text-lg font-semibold ${isDarkMode ? "text-purple-200" : "text-purple-800"}`}
                >
                  Calendar
                </h3>
              </CardHeader>
              <CardContent className="h-[400px] overflow-y-auto">
                <ProgressCalendar
                  insightData={insightData}
                  isDarkMode={isDarkMode}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="graph">
            <Card
              className={isDarkMode ? "border-gray-700" : "border-purple-200"}
            >
              <CardHeader>
                <h3
                  className={`text-lg font-semibold ${isDarkMode ? "text-purple-200" : "text-purple-800"}`}
                >
                  Daily Completion Rates
                </h3>
              </CardHeader>
              <CardContent className="min-h-80">
                <ProgressChart data={insightData} isDarkMode={isDarkMode} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="achievements">
            <Card
              className={isDarkMode ? "border-gray-700" : "border-purple-200"}
            >
              <CardHeader>
                <h3
                  className={`text-lg font-semibold ${isDarkMode ? "text-purple-200" : "text-purple-800"}`}
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
