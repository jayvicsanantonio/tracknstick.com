import Header from "@/components/common/Header";
import Footer from "@/components/Footer";
import { useToggle } from "./hooks/use-toggle";

function App() {
  const [isDarkMode, toggleDarkMode] = useToggle(false);
  const [isEditMode, toggleEditMode] = useToggle(false);

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-purple-100"
      } p-4 sm:p-8`}
    >
      <div className="max-w-7xl mx-auto">
        <Header
          isDarkMode={isDarkMode}
          isEditMode={isEditMode}
          toggleEditMode={toggleEditMode}
          toggleDarkMode={toggleDarkMode}
        />
        <div className="flex min-h-screen items-center space-x-4"></div>
        <Footer isDarkMode={isDarkMode} />
      </div>
    </div>
  );
}

export default App;
