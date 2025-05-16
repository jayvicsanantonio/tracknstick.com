import { useContext } from 'react';
import { ThemeContext } from '@/context/ThemeContext';
import { HabitsStateProvider } from '@/features/habits/context/HabitsStateContext';
import Header from '@/features/layout/components/Header';
import Body from '@/features/layout/components/Body';
import AddHabitDialog from '@/features/habits/components/AddHabitDialog';
import Footer from '@/features/layout/components/Footer';
import EditHabitDialog from '@/features/habits/components/EditHabitDialog';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';

function App() {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <div
      className={`min-h-screen ${
        isDarkMode
          ? 'bg-gray-900 text-white bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.05),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.08),transparent_40%)]'
          : 'bg-purple-50 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.15),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.1),transparent_40%)]'
      } p-2 sm:p-4 md:p-8 bg-fixed`}
    >
      <div className="w-full max-w-7xl mx-auto flex flex-col min-h-screen">
        <HabitsStateProvider>
          <Header />
          <Body />
          <Footer />
          <AddHabitDialog />
          <EditHabitDialog />
          <PWAInstallPrompt />
        </HabitsStateProvider>
      </div>
    </div>
  );
}

export default App;
