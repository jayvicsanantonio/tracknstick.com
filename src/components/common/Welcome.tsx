import { motion } from "framer-motion";
import AddHabitDialog from "@/components/common/AddHabitDialog";

export default function Welcome({ isDarkMode }: { isDarkMode: boolean }) {
  return (
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
          Embark on your journey to better habits and personal growth. Start by
          adding your first habit and watch your progress unfold.
        </p>
        <AddHabitDialog isDarkMode={isDarkMode} isNewUser={true} />
      </motion.div>
    </div>
  );
}
