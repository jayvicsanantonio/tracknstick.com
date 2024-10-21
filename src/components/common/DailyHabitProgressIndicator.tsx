import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MiscellaneousIcons from "@/icons/miscellaneous";

const { Check, Trophy } = MiscellaneousIcons;

export default function DailyHabitProgressIndicator({
  completionRate,
  isDarkMode,
}: {
  completionRate: number;
  isDarkMode: boolean;
}) {
  const [showCompletionAnimation] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center mb-12">
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64">
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className={isDarkMode ? "text-gray-700" : "text-purple-200"}
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="46"
              cx="50"
              cy="50"
            />
            <motion.circle
              className={isDarkMode ? "text-purple-400" : "text-purple-600"}
              strokeWidth="8"
              strokeDasharray={46 * 2 * Math.PI}
              strokeDashoffset={46 * 2 * Math.PI * (1 - completionRate / 100)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="46"
              cx="50"
              cy="50"
              transform="rotate(-90 50 50)"
              initial={{ strokeDashoffset: 46 * 2 * Math.PI }}
              animate={{
                strokeDashoffset: 46 * 2 * Math.PI * (1 - completionRate / 100),
              }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {completionRate === 100 ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5 }}
              >
                <Check
                  className={`w-36 h-36 ${
                    isDarkMode ? "text-purple-400" : "text-purple-600"
                  }`}
                />
              </motion.div>
            ) : (
              <span
                className={`text-4xl font-bold ${
                  isDarkMode ? "text-purple-200" : "text-purple-800"
                }`}
              >
                {completionRate}%
              </span>
            )}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showCompletionAnimation && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } p-8 rounded-lg shadow-lg`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2
                  className={`text-4xl font-bold ${
                    isDarkMode ? "text-purple-200" : "text-purple-800"
                  } mb-4`}
                >
                  Congratulations!
                </h2>
                <p
                  className={`text-xl ${
                    isDarkMode ? "text-purple-300" : "text-purple-600"
                  } mb-4`}
                >
                  {`You've completed all your habits for today!`}
                </p>
              </motion.div>
              <motion.div
                className="mt-6 flex justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.5,
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
              >
                <Trophy
                  className={`w-16 h-16 ${
                    isDarkMode ? "text-yellow-400" : "text-yellow-500"
                  }`}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
