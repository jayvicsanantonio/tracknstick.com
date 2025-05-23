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
  const displayRate = Number.isNaN(completionRate) ? 0 : completionRate;

  return (
    <div
      className="flex flex-col items-center justify-center mb-12 mt-4"
      aria-label={`Daily habit completion: ${displayRate}%`}
    >
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64">
        {/* Drop shadow for the progress circle */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 rounded-full  ${isDarkMode ? "bg-purple-600/20" : "bg-purple-400/30"}`}
        ></div>

        <div className="relative w-full h-full">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            {/* Background track */}
            <circle
              aria-hidden="true"
              className={
                isDarkMode ? "text-purple-900/80" : "text-purple-900/20"
              }
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
              r="42"
              cx="50"
              cy="50"
            />

            {/* Glowing effect behind progress */}
            <motion.circle
              aria-hidden="true"
              className={
                isDarkMode ? "text-purple-600/30" : "text-purple-400/30"
              }
              strokeWidth="14"
              strokeDasharray={42 * 2 * Math.PI}
              strokeDashoffset={42 * 2 * Math.PI * (1 - displayRate / 100)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="42"
              cx="50"
              cy="50"
              transform="rotate(-90 50 50)"
              initial={{ strokeDashoffset: 42 * 2 * Math.PI }}
              animate={{
                strokeDashoffset: 42 * 2 * Math.PI * (1 - displayRate / 100),
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />

            {/* Main progress indicator */}
            <motion.circle
              aria-hidden="true"
              className={isDarkMode ? "text-purple-600" : "text-purple-500"}
              strokeWidth="10"
              strokeDasharray={42 * 2 * Math.PI}
              strokeDashoffset={42 * 2 * Math.PI * (1 - displayRate / 100)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="42"
              cx="50"
              cy="50"
              transform="rotate(-90 50 50)"
              initial={{ strokeDashoffset: 42 * 2 * Math.PI }}
              animate={{
                strokeDashoffset: 42 * 2 * Math.PI * (1 - displayRate / 100),
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>

          {/* Central display */}
          <div className="absolute inset-0 flex items-center justify-center">
            {displayRate === 100 ? (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.2, 1], opacity: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <div className={`rounded-full p-5 `} aria-hidden="true">
                  <Check className="w-32 h-32 text-purple-600" />
                </div>
              </motion.div>
            ) : (
              <motion.div
                className="flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <span
                  className={`text-5xl font-bold ${
                    isDarkMode ? "text-purple-300" : "text-purple-800"
                  }`}
                >
                  {displayRate}%
                </span>
                <span
                  className={`text-sm mt-1 ${
                    isDarkMode ? "text-purple-400" : "text-purple-600/80"
                  }`}
                >
                  Completed
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
