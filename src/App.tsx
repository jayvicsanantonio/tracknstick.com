import { useContext, useState } from 'react';
import useSWR from 'swr';
import { useToast } from '@/hooks/use-toast';
import { useToggle } from '@/hooks/use-toggle';
import { Habit } from '@/types/habit';
import { ThemeContext } from '@/context/ThemeContext';
import { DateContext } from '@/context/DateContext';
import Header from '@/components/common/Header';
import Body from '@/components/common/Body';
import AddHabitDialog from '@/components/common/AddHabitDialog';
import ProgressOverview from '@/components/common/ProgressOverview';
import Footer from '@/components/common/Footer';
import EditHabitDialog from '@/components/common/EditHabitDialog';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import getConfig from '@/lib/getConfig';
const { apiHost } = getConfig();

function App() {
  const { toast } = useToast();
  const { getToken } = useAuth();
  const { isDarkMode } = useContext(ThemeContext);
  const { date, timeZone } = useContext(DateContext);
  const { data: habits = [], isLoading } = useSWR<Habit[]>(
    `/api/v1/habits?date=${date.toISOString()}&timeZone=${timeZone}`,
    fetcher
  );
  const [editingHabit, setEditingHabit] = useState<Habit | null>(
    null
  );
  const [isEditMode, toggleIsEditMode] = useToggle(false);
  const [showAddHabitDialog, toggleShowAddHabitDialog] =
    useToggle(false);
  const [showEditHabitDialog, toggleShowEditHabitDialog] =
    useToggle(false);
  const [isOverviewMode, toggleIsOverviewMode] = useToggle(false);

  async function fetcher(endpoint: string): Promise<Habit[]> {
    try {
      const token = await getToken();
      const response = await axios.get<Habit[]>(
        `${apiHost}${endpoint}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;

      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        description:
          'Failed to fetch habits. Please reload the page.',
      });
      throw error;
    }
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-purple-100'
      } p-4 sm:p-8`}
    >
      <div className="min-w-[400px] max-w-7xl mx-auto flex flex-col min-h-screen">
        <Header
          isEditMode={isEditMode}
          toggleShowAddHabitDialog={toggleShowAddHabitDialog}
          toggleIsEditMode={toggleIsEditMode}
          toggleIsOverviewMode={toggleIsOverviewMode}
        />
        <Body
          isEditMode={isEditMode}
          habits={habits}
          toggleShowAddHabitDialog={toggleShowAddHabitDialog}
          toggleShowEditHabitDialog={toggleShowEditHabitDialog}
          setEditingHabit={setEditingHabit}
        />
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
