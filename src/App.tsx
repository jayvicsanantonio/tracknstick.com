import { CheckCircle2 } from "lucide-react";

function App() {
  return (
    <div className="min-h-screen bg-purple-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <CheckCircle2 className="h-8 w-8 text-purple-600 mr-2" />
            <span className="text-2xl font-bold text-purple-800">HabitHub</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
