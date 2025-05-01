import { useContext } from "react";
import { motion } from "framer-motion";
import { ThemeContext } from "@/context/ThemeContext";
import MiscellaneousIcons from "@/icons/miscellaneous";

const { Check } = MiscellaneousIcons;

export default function DailyHabitProgressIndicator({
  completionRate,
}: {
  completionRate: number;
}) {
  const { isDarkMode } = useContext(ThemeContext);

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
                {Number.isNaN(completionRate) ? 0 : completionRate}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
