import { useContext, useState, useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { useToast } from '@/hooks/use-toast';
import { useToggle } from '@/hooks/use-toggle';
import { Habit } from '@/types/habit';
import { AppContext } from '@/context/AppContext';
import Header from '@/components/common/Header';
import Body from '@/components/common/Body';
import AddHabitDialog from '@/components/common/AddHabitDialog';
import ProgressOverview from '@/components/common/ProgressOverview';
import Footer from '@/components/common/Footer';
import EditHabitDialog from '@/components/common/EditHabitDialog';
import { apiClient } from '@/services/api';

function App() {
  const { toast } = useToast();
  const { isDarkMode, date, timeZone } = useContext(AppContext);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isEditMode, toggleIsEditMode] = useToggle(false);
  const [showAddHabitDialog, toggleShowAddHabitDialog] = useToggle(false);
  const [showEditHabitDialog, toggleShowEditHabitDialog] = useToggle(false);
  const [isOverviewMode, toggleIsOverviewMode] = useToggle(false);

  const fetcher = useCallback(async (endpoint: string): Promise<Habit[]> => {
    try {
      const response = await apiClient.get<Habit[]>(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        description: 'Failed to fetch habits. Please reload the page.',
      });
      throw error;
    }
  }, [toast]);

  const { data: habits = [], isLoading } = useSWR<Habit[]>(
    `/api/v1/habits?date=${date.toISOString()}&timeZone=${timeZone}`,
    fetcher
  );

  const headerProps = useMemo(() => ({
    isEditMode,
    toggleShowAddHabitDialog,
    toggleIsEditMode,
    toggleIsOverviewMode,
  }), [isEditMode, toggleShowAddHabitDialog, toggleIsEditMode, toggleIsOverviewMode]);

  const bodyProps = useMemo(() => ({
    isEditMode,
    habits,
    toggleShowAddHabitDialog,
    toggleShowEditHabitDialog,
    setEditingHabit,
  }), [isEditMode, habits, toggleShowAddHabitDialog, toggleShowEditHabitDialog]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-purple-100'
      } p-4 sm:p-8`}
    >
      <div className="min-w-[400px] max-w-7xl mx-auto flex flex-col min-h-screen">
        <Header {...headerProps} />
        <Body {...bodyProps} />
        <Footer />
      </div>

      <AddHabitDialog
        showAddHabitDialog={showAddHabitDialog}
        toggleShowAddHabitDialog={toggleShowAddHabitDialog}
      />
      <EditHabitDialog
        habit={editingHabit}
        showEditHabitDialog={showEditHabitDialog}
        toggleShowEditHabitDialog={toggleShowEditHabitDialog}
      />
      <ProgressOverview
        isOverviewMode={isOverviewMode}
        toggleIsOverviewMode={toggleIsOverviewMode}
      />
    </div>
  );
}

export default App;
