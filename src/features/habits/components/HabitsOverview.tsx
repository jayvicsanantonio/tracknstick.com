import { useState, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { useHabits } from '@/features/habits/hooks/useHabits';
import { useHabitsContext } from '@/features/habits/hooks/useHabitsContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@shared/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger } from '@shared/components/ui/tabs';
import { Input } from '@shared/components/ui/input';
import { Habit } from '@/features/habits/types/Habit';
import HabitsIcons from '@/icons/habits';

const HabitsOverview = memo(function HabitsOverview() {
  const { habits, isLoading, error, deleteHabit } = useHabits();
  const { openEditDialog } = useHabitsContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  const handleDeleteHabit = useCallback((habit: Habit) => {
    setHabitToDelete(habit);
  }, []);

  const confirmDelete = useCallback(() => {
    if (habitToDelete?.id) {
      void deleteHabit(habitToDelete.id, habitToDelete.name);
      setHabitToDelete(null);
    }
  }, [habitToDelete, deleteHabit]);

  const navigateBack = useCallback(() => {
    void navigate('/');
  }, [navigate]);

  // Filter habits based on search term and selected tab
  const filteredHabits = useMemo(() => {
    return habits.filter((habit) => {
      const matchesSearch = habit.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      if (selectedTab === 'all') return matchesSearch;
      if (selectedTab === 'active') return matchesSearch && !habit.endDate;
      if (selectedTab === 'completed') return matchesSearch && !!habit.endDate;
      return matchesSearch;
    });
  }, [habits, searchTerm, selectedTab]);

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-2 sm:px-4 md:px-8">
        <Card
          variant="glass"
          className="flex w-full items-center justify-center rounded-xl p-8"
        >
          <div className="bg-(--color-surface)/80 dark:bg-(--color-surface-secondary)/80 ring-(--color-border-primary)/40 inline-flex items-center gap-4 rounded-full px-6 py-4 shadow-sm ring-1 ring-inset backdrop-blur-sm">
            <span className="border-(--color-brand-primary) h-10 w-10 animate-spin rounded-full border-4 border-r-transparent" />
            <span className="text-(--color-text-secondary) text-base font-medium sm:text-lg">
              Loading…
            </span>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center text-red-600 dark:border-red-700 dark:bg-red-900/30 dark:text-red-100">
        Error loading habits. Please try again.
      </div>
    );
  }

  return (
    <motion.div
      className="flex h-full flex-1 flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-1 px-2 sm:px-4 md:px-8">
        <Card
          variant="glass"
          className="flex w-full flex-1 flex-col overflow-hidden"
        >
          <CardHeader className="px-3 pt-4 sm:px-6 sm:pt-6">
            <div>
              <CardTitle className="text-(--color-foreground) mb-2 flex items-center gap-2 text-xl font-bold sm:text-2xl">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={navigateBack}
                  className="hover:bg-(--color-hover-surface) mr-2"
                >
                  <svg
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
                Habits Overview
              </CardTitle>
              <p className="text-(--color-text-secondary) text-sm">
                Manage all your habits in one place
              </p>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto px-3 pb-6 sm:px-6 sm:pb-8">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row">
              <Input
                className="w-full sm:max-w-[300px]"
                placeholder="Search habits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Tabs
                value={selectedTab}
                onValueChange={setSelectedTab}
                className="w-full sm:max-w-[300px]"
              >
                <TabsList className="bg-(--color-muted) grid w-full grid-cols-3">
                  <TabsTrigger
                    className="data-[state=active]:bg-(--color-brand-primary) data-[state=active]:text-(--color-text-inverse)"
                    value="all"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    className="data-[state=active]:bg-(--color-brand-primary) data-[state=active]:text-(--color-text-inverse)"
                    value="active"
                  >
                    Active
                  </TabsTrigger>
                  <TabsTrigger
                    className="data-[state=active]:bg-(--color-brand-primary) data-[state=active]:text-(--color-text-inverse)"
                    value="completed"
                  >
                    Archived
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <AnimatePresence>
              {filteredHabits.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-8 text-center sm:py-12"
                >
                  <p className="mb-2 text-gray-600 dark:text-white">
                    {searchTerm
                      ? 'No habits match your search'
                      : 'No habits found'}
                  </p>
                </motion.div>
              ) : (
                <div className="border-(--color-border-primary) overflow-hidden rounded-lg border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-(--color-surface-secondary) text-left">
                        <tr>
                          <th className="text-(--color-text-secondary) px-3 py-3 text-xs font-medium sm:px-4 sm:text-sm">
                            Habit
                          </th>
                          <th className="text-(--color-text-secondary) hidden px-3 py-3 text-xs font-medium sm:table-cell sm:px-4 sm:text-sm">
                            Frequency
                          </th>
                          <th className="text-(--color-text-secondary) hidden px-3 py-3 text-xs font-medium sm:px-4 sm:text-sm md:table-cell">
                            Start Date
                          </th>
                          <th className="text-(--color-text-secondary) px-3 py-3 text-xs font-medium sm:px-4 sm:text-sm">
                            Status
                          </th>
                          <th className="text-(--color-text-secondary) px-3 py-3 text-right text-xs font-medium sm:px-4 sm:text-sm">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-(--color-border-primary) text-(--color-foreground) divide-y">
                        {filteredHabits.map((habit) => {
                          const Icon = HabitsIcons[habit.icon];
                          return (
                            <motion.tr
                              key={habit.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="hover:bg-(--color-hover-surface)"
                            >
                              <td className="px-3 py-3 sm:px-4 sm:py-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className="bg-(--color-brand-light) flex items-center justify-center rounded-full p-1.5 sm:p-2">
                                    <Icon className="text-(--color-brand-primary) h-4 w-4 sm:h-5 sm:w-5" />
                                  </div>
                                  <span className="text-(--color-foreground) line-clamp-1 text-sm font-medium sm:text-base">
                                    {habit.name}
                                  </span>
                                </div>
                              </td>
                              <td className="hidden px-3 py-3 sm:table-cell sm:px-4 sm:py-4">
                                <div className="flex flex-wrap gap-1">
                                  {habit.frequency.map((day) => (
                                    <span
                                      key={day}
                                      className="bg-(--color-brand-light) text-(--color-brand-text) rounded-full px-2 py-0.5 text-xs"
                                    >
                                      {day.substring(0, 3)}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="text-(--color-foreground) hidden px-3 py-3 text-xs sm:px-4 sm:py-4 sm:text-sm md:table-cell">
                                {new Date(habit.startDate).toLocaleDateString()}
                              </td>
                              <td className="px-3 py-3 sm:px-4 sm:py-4">
                                <span
                                  className={`rounded-full px-2 py-1 text-xs ${
                                    habit.endDate
                                      ? 'bg-(--color-muted) text-(--color-text-secondary)'
                                      : 'bg-(--color-brand-light) text-(--color-brand-text)'
                                  }`}
                                >
                                  {habit.endDate ? 'Archived' : 'Active'}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-right sm:px-4 sm:py-4">
                                <div className="flex items-center justify-end gap-1 sm:gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openEditDialog(habit)}
                                    className="text-(--color-brand-primary) hover:bg-(--color-hover-surface) h-7 w-7 sm:h-8 sm:w-8"
                                  >
                                    <svg
                                      className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                      <path
                                        d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteHabit(habit)}
                                    className="text-(--color-destructive) hover:bg-(--color-error-light) h-7 w-7 sm:h-8 sm:w-8"
                                  >
                                    <svg
                                      className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M3 6H5H21"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                      <path
                                        d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                      <path
                                        d="M10 11V17"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                      <path
                                        d="M14 11V17"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </Button>
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={!!habitToDelete}
        onOpenChange={(open) => !open && setHabitToDelete(null)}
      >
        <AlertDialogContent className="bg-(--color-card) text-(--color-card-foreground)">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-(--color-foreground)">
              Delete Habit
            </AlertDialogTitle>
            <AlertDialogDescription className="text-(--color-text-secondary)">
              Are you sure you want to delete &quot;
              {habitToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-(--color-muted) text-(--color-foreground) hover:bg-(--color-hover-surface)">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-(--color-destructive) text-(--color-destructive-foreground) focus:ring-(--color-ring) hover:opacity-90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
});

export default HabitsOverview;
