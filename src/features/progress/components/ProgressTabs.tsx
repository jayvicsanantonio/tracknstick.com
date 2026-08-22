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

const HISTORY_ERROR =
  "We couldn't load your progress history. Please try again.";

interface ProgressTabsProps {
  historyData: { date: string; completionRate: number }[];
  selectedMonth: Date;
  setSelectedMonth: React.Dispatch<React.SetStateAction<Date>>;
  isLoading: boolean;
  /** The history request failed; an empty month would be a lie. */
  hasError?: boolean;
}

const ProgressTabs = memo(function ProgressTabs({
  historyData,
  selectedMonth,
  setSelectedMonth,
  isLoading,
  hasError = false,
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
            <h3 className="text-lg font-semibold text-(--color-foreground)">
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
            ) : hasError ? (
              <p className="py-8 text-center text-(--color-text-secondary)">
                {HISTORY_ERROR}
              </p>
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
            <h3 className="text-lg font-semibold text-(--color-foreground)">
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
            ) : hasError ? (
              <p className="py-8 text-center text-(--color-text-secondary)">
                {HISTORY_ERROR}
              </p>
            ) : (
              <ProgressChart data={historyData} />
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="achievements">
        <Card className="border-(--color-border-primary)">
          <CardHeader>
            <h3 className="text-lg font-semibold text-(--color-foreground)">
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
