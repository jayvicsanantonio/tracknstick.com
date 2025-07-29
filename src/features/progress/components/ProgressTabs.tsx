import { memo } from 'react';
import { Card, CardContent, CardHeader } from '@shared/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared/components/ui/tabs';
import MiscellaneousIcons from '@/icons/miscellaneous';
import ProgressCalendar from './ProgressCalendar';
import ProgressChart from './ProgressChart';
import ProgressAchievements from './ProgressAchievements';

const { Award, BarChart2, Trophy, Calendar, Crown, Sun, Moon, Target } =
  MiscellaneousIcons;

interface ProgressTabsProps {
  historyData: { date: string; completionRate: number }[];
  selectedMonth: Date;
  setSelectedMonth: React.Dispatch<React.SetStateAction<Date>>;
  isLoading: boolean;
}

const achievements = [
  {
    id: '1',
    name: 'Early Bird',
    description: 'Complete all habits before 9 AM',
    icon: Sun,
  },
  {
    id: '2',
    name: 'Consistency King',
    description: 'Maintain a 7-day streak',
    icon: Crown,
  },
  {
    id: '3',
    name: 'Habit Master',
    description: 'Complete all habits for 30 days straight',
    icon: Award,
  },
  {
    id: '4',
    name: 'Overachiever',
    description: 'Complete 150% of your daily goals',
    icon: Target,
  },
  {
    id: '5',
    name: 'Night Owl',
    description: 'Complete all habits after 9 PM',
    icon: Moon,
  },
];

const ProgressTabs = memo(function ProgressTabs({
  historyData,
  selectedMonth,
  setSelectedMonth,
  isLoading,
}: ProgressTabsProps) {
  return (
    <Tabs defaultValue="calendar" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-purple-200 dark:bg-zinc-800">
        <TabsTrigger
          value="calendar"
          className="data-[state=active]:bg-purple-600 data-[state=active]:text-white dark:hover:text-white dark:data-[state=inactive]:text-purple-400"
        >
          <Calendar aria-hidden="true" className="mr-2 h-4 w-4" />
          History
        </TabsTrigger>
        <TabsTrigger
          value="graph"
          className="data-[state=active]:bg-purple-600 data-[state=active]:text-white dark:hover:text-white dark:data-[state=inactive]:text-purple-400"
        >
          <BarChart2 aria-hidden="true" className="mr-2 h-4 w-4" />
          Completion Rate
        </TabsTrigger>
        <TabsTrigger
          value="achievements"
          className="data-[state=active]:bg-purple-600 data-[state=active]:text-white dark:hover:text-white dark:data-[state=inactive]:text-purple-400"
        >
          <Trophy aria-hidden="true" className="mr-2 h-4 w-4" />
          Achievements
        </TabsTrigger>
      </TabsList>
      <TabsContent value="calendar">
        <Card className="border-purple-200 dark:border-purple-900 dark:bg-black/30 dark:shadow-lg dark:shadow-purple-900/5">
          <CardHeader>
            <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300">
              Calendar
            </h3>
          </CardHeader>
          <CardContent className="h-fit overflow-y-auto">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-purple-800 dark:text-purple-400">
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
            <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300">
              Daily Completion Rates
            </h3>
          </CardHeader>
          <CardContent className="min-h-80">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-purple-800 dark:text-purple-400">
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
            <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300">
              Achievements
            </h3>
          </CardHeader>
          <CardContent>
            <ProgressAchievements achievements={achievements} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
});

export default ProgressTabs;
