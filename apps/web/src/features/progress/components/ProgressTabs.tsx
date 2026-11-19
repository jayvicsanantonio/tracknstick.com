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
      <TabsList className="grid w-full grid-cols-3 bg-(--color-muted)">
        <TabsTrigger
          value="calendar"
          className="text-xs data-[state=active]:bg-(--color-brand-primary) data-[state=active]:text-(--color-text-inverse) sm:text-sm"
        >
          <Calendar
            aria-hidden="true"
            className="mr-2 hidden h-4 w-4 sm:block"
          />
          History
        </TabsTrigger>
        <TabsTrigger
          value="graph"
          aria-label="Completion Rate"
          className="text-xs data-[state=active]:bg-(--color-brand-primary) data-[state=active]:text-(--color-text-inverse) sm:text-sm"
        >
          <BarChart2
            aria-hidden="true"
            className="mr-2 hidden h-4 w-4 sm:block"
          />
          <span aria-hidden="true" className="sm:hidden">
            Rates
          </span>
          <span aria-hidden="true" className="hidden sm:inline">
            Completion Rate
          </span>
        </TabsTrigger>
        <TabsTrigger
          value="achievements"
          className="text-xs data-[state=active]:bg-(--color-brand-primary) data-[state=active]:text-(--color-text-inverse) sm:text-sm"
        >
          <Trophy aria-hidden="true" className="mr-2 hidden h-4 w-4 sm:block" />
          Achievements
        </TabsTrigger>
      </TabsList>
      <TabsContent value="calendar">
        <Card className="gap-4 border-(--color-border-primary) py-4 sm:gap-6 sm:py-6">
          <CardHeader className="px-3 sm:px-6">
            <h3 className="text-lg font-semibold text-(--color-foreground)">
              Calendar
            </h3>
          </CardHeader>
          <CardContent className="h-fit overflow-y-auto px-2 sm:px-6">
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
        <Card className="gap-4 border-(--color-border-primary) py-4 sm:gap-6 sm:py-6">
          <CardHeader className="px-3 sm:px-6">
            <h3 className="text-lg font-semibold text-(--color-foreground)">
              Daily Completion Rates
            </h3>
          </CardHeader>
          <CardContent className="min-h-80 px-1 sm:px-6">
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
        <Card className="gap-4 border-(--color-border-primary) py-4 sm:gap-6 sm:py-6">
          <CardHeader className="px-3 sm:px-6">
            <h3 className="text-lg font-semibold text-(--color-foreground)">
              Achievements
            </h3>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
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
