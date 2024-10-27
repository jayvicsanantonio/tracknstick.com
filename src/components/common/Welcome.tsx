import { motion } from "framer-motion";
import MiscellaneousIcons from "@/icons/miscellaneous";

const { Plus } = MiscellaneousIcons;

export default function Welcome({
  isDarkMode,
  toggleShowAddHabitDialog,
}: {
  isDarkMode: boolean;
  toggleShowAddHabitDialog: () => void;
}) {
  return (
    <div className="flex-1">
      <div className="flex flex-col items-center justify-center min-h-[60vh] relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2
            className={`text-4xl font-bold ${
              isDarkMode ? "text-purple-200" : "text-purple-800"
            } mb-6`}
          >
            Welcome to HabitHub
          </h2>
          <p
            className={`text-xl ${
              isDarkMode ? "text-purple-300" : "text-purple-600"
            } mb-12 leading-relaxed`}
          >
            Embark on your journey to better habits and personal growth. Start
            by adding your first habit and watch your progress unfold.
          </p>
          <motion.button
            onClick={toggleShowAddHabitDialog}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${
              isDarkMode
                ? "bg-purple-700 hover:bg-purple-600"
                : "bg-purple-600 hover:bg-purple-700"
            } text-white px-8 py-4 rounded-full text-lg font-semibold transition-colors duration-300 shadow-lg`}
          >
            <Plus className="h-5 w-5 mr-2 inline-block" />
            Add Your First Habit
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
