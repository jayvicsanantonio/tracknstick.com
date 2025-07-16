import { HabitsStateProvider } from "@/features/habits/context/HabitsStateContext";
import Header from "@/features/layout/components/Header";
import Body from "@/features/layout/components/Body";
import AddHabitDialog from "@/features/habits/components/AddHabitDialog";
import Footer from "@/features/layout/components/Footer";
import EditHabitDialog from "@/features/habits/components/EditHabitDialog";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

function App() {
  return (
    <div className="min-h-screen bg-purple-50 dark:bg-zinc-900 text-foreground bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.15),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.1),transparent_40%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(147,51,234,0.05),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(147,51,234,0.08),transparent_40%)] px-2 sm:px-4 md:px-8 bg-fixed">
      <div className="w-full max-w-7xl mx-auto flex flex-col min-h-screen">
        <HabitsStateProvider>
          <Header />
          <main>
            <Body />
          </main>
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
