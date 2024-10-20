import { useState } from "react";
import Header from "@/components/common/Header";
import Welcome from "./components/common/Welcome";
import Footer from "@/components/common/Footer";
import { useToggle } from "./hooks/use-toggle";

function App() {
  const [habits] = useState([]);
  const [isDarkMode, toggleDarkMode] = useToggle(false);
  const [isEditMode, toggleEditMode] = useToggle(false);

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-purple-100"
      } p-4 sm:p-8`}
    >
      <div className="max-w-7xl mx-auto flex flex-col min-h-screen">
        <Header
          isDarkMode={isDarkMode}
          isEditMode={isEditMode}
          toggleEditMode={toggleEditMode}
          toggleDarkMode={toggleDarkMode}
        />
        <div className="flex-1">
          {habits.length === 0 ? <Welcome isDarkMode={isDarkMode} /> : null}
        </div>
        <Footer isDarkMode={isDarkMode} />
      </div>
    </div>
  );
}

export default App;
