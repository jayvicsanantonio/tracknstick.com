import MiscellaneousIcons from '@/icons/miscellaneous';
import { Card, CardContent, CardHeader } from '@shared/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared/components/ui/tabs';
import { memo } from 'react';
import {
  useAchievementProgress,
  useAchievements,
} from '../hooks/useAchievements';
import AchievementStats from './AchievementStats';
import ProgressAchievements from './ProgressAchievements';
import ProgressCalendar from './ProgressCalendar';
import ProgressChart from './ProgressChart';

const { BarChart2, Trophy, Calendar } = MiscellaneousIcons;

interface ProgressTabsProps {
  historyData: { date: string; completionRate: number }[];
  selectedMonth: Date;
  setSelectedMonth: React.Dispatch<React.SetStateAction<Date>>;
  isLoading: boolean;
}

const ProgressTabs = memo(function ProgressTabs({
  historyData,
  selectedMonth,
  setSelectedMonth,
  isLoading,
}: ProgressTabsProps) {
  const {
    achievements,
    stats,
    loading: achievementsLoading,
  } = useAchievements();
  const { selectedCategory, setSelectedCategory } = useAchievementProgress();

  return (
    <Tabs defaultValue="calendar" className="w-full">
      <TabsList className="bg-(--color-muted) grid w-full grid-cols-3">
        <TabsTrigger
          value="calendar"
          className="data-[state=active]:bg-(--color-brand-primary) data-[state=active]:text-(--color-text-inverse)"
        >
          <Calendar aria-hidden="true" className="mr-2 h-4 w-4" />
          History
        </TabsTrigger>
        <TabsTrigger
          value="graph"
          className="data-[state=active]:bg-(--color-brand-primary) data-[state=active]:text-(--color-text-inverse)"
        >
          <BarChart2 aria-hidden="true" className="mr-2 h-4 w-4" />
          Completion Rate
        </TabsTrigger>
        <TabsTrigger
          value="achievements"
          className="data-[state=active]:bg-(--color-brand-primary) data-[state=active]:text-(--color-text-inverse)"
        >
          <Trophy aria-hidden="true" className="mr-2 h-4 w-4" />
          Achievements
        </TabsTrigger>
      </TabsList>
      <TabsContent value="calendar">
        <Card className="border-(--color-border-primary)">
          <CardHeader>
            <h3 className="text-(--color-foreground) text-lg font-semibold">
              Calendar
            </h3>
          </CardHeader>
          <CardContent className="h-fit overflow-y-auto">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-(--color-text-secondary)">
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
        <Card className="border-(--color-border-primary)">
          <CardHeader>
            <h3 className="text-(--color-foreground) text-lg font-semibold">
              Daily Completion Rates
            </h3>
          </CardHeader>
          <CardContent className="min-h-80">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-(--color-text-secondary)">
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
        <Card className="border-(--color-border-primary)">
          <CardHeader>
            <h3 className="text-(--color-foreground) text-lg font-semibold">
              Achievements
            </h3>
          </CardHeader>
          <CardContent>
            {achievementsLoading ? (
              <div className="flex h-full items-center justify-center py-8">
                <p className="text-(--color-text-secondary)">
                  Loading achievements...
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {stats && <AchievementStats stats={stats} />}
                <ProgressAchievements
                  achievements={achievements}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
});

export default ProgressTabs;
